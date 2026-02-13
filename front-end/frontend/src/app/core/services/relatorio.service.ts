import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { IRelatorio } from '../models/relatorio.model';
import { getFirestore, collection, query, where, getDocs, orderBy, limit as firestoreLimit } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private db = getFirestore();

  constructor() {}

  getRelatoriosByUserId(userId: string, limit: number = 10): Observable<IRelatorio[]> {
    // Removido orderBy para não precisar de índice composto
    const q = query(
      collection(this.db, 'relatorios'),
      where('userId', '==', userId),
      firestoreLimit(limit)
    );

    return from(
      getDocs(q).then(snapshot => {
        const relatorios: IRelatorio[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          const relatorio = {
            id: doc.id,
            ...data,
            createdAt: this.convertToDate(data['createdAt'])
          } as IRelatorio;
          relatorios.push(relatorio);
        });

        return relatorios.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }).catch(error => {
        if (error.code === 'permission-denied' || error.message.includes('FAILED_PRECONDITION')) {
          return [];
        }
        throw error;
      })
    );
  }

  private convertToDate(timestamp: any): Date {
    // Se já é uma Date, retorna
    if (timestamp instanceof Date) {
      return timestamp;
    }

    // Se é um Timestamp do Firestore (com seconds e nanoseconds)
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000);
    }

    // Se é uma string ISO
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }

    // Fallback: retorna data atual
    console.warn('⚠️ Formato de data desconhecido:', timestamp);
    return new Date();
  }

  async downloadRelatorioPDF(relatorio: IRelatorio): Promise<void> {
    try {
      // Importação dinâmica do jsPDF
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Função para limpar caracteres especiais que causam problemas
      const cleanText = (text: string): string => {
        return text
          .replace(/₂/g, '2')
          .replace(/₃/g, '3')
          .replace(/₄/g, '4')
          .replace(/═/g, '=')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''); // Remove diacríticos
      };      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Função auxiliar para adicionar nova página se necessário
      const checkPageBreak = (lineHeight: number) => {
        if (yPosition + lineHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Função para adicionar texto com quebra de linha
      const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0], align: 'left' | 'center' | 'right' = 'left') => {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');

        const cleanedText = cleanText(text);
        const lines = doc.splitTextToSize(cleanedText, contentWidth);
        const lineHeight = fontSize * 0.5;

        lines.forEach((line: string) => {
          checkPageBreak(lineHeight);
          const xPos = align === 'center' ? pageWidth / 2 : (align === 'right' ? pageWidth - margin : margin);
          doc.text(line, xPos, yPosition, { align });
          yPosition += lineHeight;
        });
      };      // Função para adicionar box colorido
      const addColorBox = (text: string, bgColor: [number, number, number], textColor: [number, number, number] = [255, 255, 255]) => {
        checkPageBreak(12);
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(margin, yPosition - 4, contentWidth, 10, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(cleanText(text), margin + 3, yPosition + 2);
        doc.setTextColor(0, 0, 0);
        yPosition += 12;
      };

      // ===========================================
      // CABEÇALHO DO DOCUMENTO
      // ===========================================
      doc.setFillColor(34, 139, 34); // Verde floresta
      doc.rect(0, 0, pageWidth, 35, 'F');

      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(cleanText('INVENTARIO DE CARBONO'), pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Propriedade Rural', pageWidth / 2, 23, { align: 'center' });
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 29, { align: 'center' });

      yPosition = 45;      // ===========================================
      // PROCESSAR CONTEÚDO
      // ===========================================
      const analiseImagem = relatorio.analise_imagem || '';
      const inventarioFinal = relatorio.comparacao_dados || relatorio.response || '';

      if (analiseImagem) {
        addColorBox('ETAPA 1: ANALISE DA IMAGEM DE SATELITE', [70, 130, 180]);
        yPosition += 3;

        const linhas = analiseImagem.split('\n');
        linhas.forEach(linha => {
          linha = linha.trim();
          if (linha) {
            // Remove números de questão e formata
            const textoLimpo = linha.replace(/^\d+\.\s*/, '');
            if (textoLimpo.includes(':')) {
              const [campo, valor] = textoLimpo.split(':');
              addText(`• ${campo.trim()}:`, 9, true, [40, 40, 40]);
              yPosition -= 2;
              addText(`  ${valor.trim()}`, 9, false, [60, 60, 60]);
            } else {
              addText(textoLimpo, 9, false, [60, 60, 60]);
            }
          }
        });
        yPosition += 5;
      }      if (inventarioFinal) {
        doc.addPage();
        yPosition = margin;

        addColorBox('ETAPA 2: INVENTARIO COMPLETO DE CARBONO', [220, 20, 60]);
        yPosition += 3;

        const linhas = inventarioFinal.split('\n');

        linhas.forEach(linha => {
          linha = linha.trim();

          // Ignorar linhas divisórias
          if (linha.includes('═══') || linha.includes('===') || !linha) return;

          // Remove emojis
          linha = linha.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();

          // Títulos de seções principais
          if (linha.match(/^[A-ZÀÁÂÃÉÊÍÓÔÕÚÇ\s]+$/)) {
            yPosition += 4;
            addColorBox(linha, [60, 60, 60]);
            return;
          }

          // Itens com bullet
          if (linha.startsWith('•')) {
            const texto = linha.substring(1).trim();
            if (texto.includes(':')) {
              const [campo, valor] = texto.split(':');
              addText(`• ${campo.trim()}:`, 9, true, [40, 40, 40]);
              yPosition -= 2;
              addText(`  ${valor.trim()}`, 9, false, [60, 60, 60]);
            } else {
              addText(`• ${texto}`, 9, false, [60, 60, 60]);
            }
            return;
          }

          // Texto normal
          if (linha) {
            addText(linha, 9, false, [50, 50, 50]);
          }
        });
      }

      // ===========================================
      // RODAPÉ
      // ===========================================
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.setFont('helvetica', 'normal');
        doc.text(
          cleanText(`Pagina ${i} de ${totalPages} | Sistema: Inventario de Propriedades Rurais v2.0 | Metodologia: IPCC 2006 + GHG Protocol`),
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // ===========================================
      // SALVAR PDF
      // ===========================================
      const fileName = `inventario_carbono_${relatorio.title || 'relatorio'}_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      console.log('✅ PDF gerado com sucesso:', fileName);
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar PDF. Verifique se a biblioteca jsPDF está instalada.');
    }
  }
}
