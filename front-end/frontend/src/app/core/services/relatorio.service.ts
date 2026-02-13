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
          .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''); // Remove diacríticos
      };

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Função auxiliar para adicionar nova página se necessário
      const checkPageBreak = (lineHeight: number) => {
        if (yPosition + lineHeight > pageHeight - margin - 15) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Função para adicionar texto com quebra de linha
      const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0], align: 'left' | 'center' | 'right' = 'left', indent: number = 0) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');

        const cleanedText = cleanText(text);
        const lines = doc.splitTextToSize(cleanedText, contentWidth - indent);
        const lineHeight = fontSize * 0.45;

        lines.forEach((line: string) => {
          checkPageBreak(lineHeight);
          const xPos = align === 'center' ? pageWidth / 2 : (align === 'right' ? pageWidth - margin : margin + indent);
          doc.text(line, xPos, yPosition, { align });
          yPosition += lineHeight;
        });
      };

      // Função para adicionar seção com linha decorativa
      const addSectionTitle = (text: string, color: [number, number, number] = [30, 122, 62]) => {
        checkPageBreak(15);
        yPosition += 5;

        // Linha decorativa superior
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);

        yPosition += 6;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(cleanText(text), margin, yPosition);

        yPosition += 3;
        // Linha decorativa inferior
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);

        yPosition += 6;
        doc.setTextColor(0, 0, 0);
      };

      // Função para adicionar card de informação
      const addInfoCard = (label: string, value: string, bgColor: [number, number, number] = [245, 245, 245]) => {
        checkPageBreak(18);

        // Background do card
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.roundedRect(margin, yPosition - 3, contentWidth, 12, 2, 2, 'F');

        // Label
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text(cleanText(label), margin + 3, yPosition + 1);

        // Value
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);
        const valueLines = doc.splitTextToSize(cleanText(value), contentWidth - 6);
        doc.text(valueLines, margin + 3, yPosition + 6);

        yPosition += 14;
      };

      // ===========================================
      // CABEÇALHO DO DOCUMENTO
      // ===========================================
      // Cabeçalho com gradiente visual
      doc.setFillColor(30, 122, 62); // Verde mais profissional
      doc.rect(0, 0, pageWidth, 50, 'F');

      // Adiciona um retângulo mais claro por cima para efeito visual
      doc.setFillColor(34, 139, 69);
      doc.rect(0, 0, pageWidth, 25, 'F');

      // Título principal
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(cleanText('RELATORIO DE INVENTARIO'), pageWidth / 2, 13, { align: 'center' });

      // Subtítulo
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(cleanText('Carbono e Gases de Efeito Estufa'), pageWidth / 2, 20, { align: 'center' });

      // Informações da data e título
      doc.setFontSize(9);
      doc.setTextColor(240, 240, 240);
      const dataGeracao = `Gerado em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`;
      doc.text(dataGeracao, pageWidth / 2, 35, { align: 'center' });

      if (relatorio.title) {
        doc.text(cleanText(`Propriedade: ${relatorio.title}`), pageWidth / 2, 42, { align: 'center' });
      }

      yPosition = 60;      // ===========================================
      // PROCESSAR CONTEÚDO
      // ===========================================
      const analiseImagem = relatorio.analise_imagem || '';
      const inventarioFinal = relatorio.comparacao_dados || relatorio.response || '';

      if (analiseImagem) {
        addSectionTitle('ANALISE DA IMAGEM DE SATELITE', [70, 130, 180]);

        const linhas = analiseImagem.split('\n');
        linhas.forEach(linha => {
          linha = linha.trim();
          if (linha) {
            // Remove números de questão e formata
            const textoLimpo = linha.replace(/^\d+\.\s*/, '');
            if (textoLimpo.includes(':')) {
              const partes = textoLimpo.split(':');
              const campo = partes[0].trim();
              const valor = partes.slice(1).join(':').trim();
              if (valor) {
                addInfoCard(campo, valor);
              }
            } else if (textoLimpo) {
              addText(textoLimpo, 10, false, [60, 60, 60]);
              yPosition += 2;
            }
          }
        });
        yPosition += 5;
      }      if (inventarioFinal) {
        doc.addPage();
        yPosition = margin;

        addSectionTitle('INVENTARIO COMPLETO DE CARBONO', [220, 20, 60]);

        const linhas = inventarioFinal.split('\n');
        let emLista = false;

        linhas.forEach(linha => {
          linha = linha.trim();

          // Ignorar linhas divisórias
          if (linha.includes('═══') || linha.includes('===') || !linha) {
            if (emLista) yPosition += 3;
            emLista = false;
            return;
          }

          // Remove emojis já foi feito no cleanText
          linha = linha.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();

          // Títulos de seções principais (MAIÚSCULAS)
          if (linha.match(/^[A-ZÀÁÂÃÉÊÍÓÔÕÚÇ\s]+$/) && linha.length > 5) {
            yPosition += 6;
            addSectionTitle(linha, [60, 60, 60]);
            emLista = false;
            return;
          }

          // Itens com bullet
          if (linha.startsWith('•')) {
            emLista = true;
            const texto = linha.substring(1).trim();
            if (texto.includes(':')) {
              const partes = texto.split(':');
              const campo = partes[0].trim();
              const valor = partes.slice(1).join(':').trim();
              if (valor) {
                addInfoCard(campo, valor, [250, 250, 250]);
              }
            } else {
              checkPageBreak(8);
              doc.setFontSize(10);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(60, 60, 60);
              doc.text(cleanText(`• ${texto}`), margin + 3, yPosition);
              yPosition += 6;
            }
            return;
          }

          // Texto normal com formatação
          if (linha) {
            if (linha.includes(':') && !linha.startsWith('-')) {
              const partes = linha.split(':');
              const campo = partes[0].trim();
              const valor = partes.slice(1).join(':').trim();
              if (valor && campo.length < 60) {
                addInfoCard(campo, valor, [248, 248, 248]);
                emLista = false;
              } else {
                addText(linha, 10, false, [50, 50, 50]);
                yPosition += 3;
              }
            } else {
              addText(linha, 10, false, [50, 50, 50]);
              yPosition += 3;
              emLista = false;
            }
          }
        });
      }

      // ===========================================
      // RODAPÉ
      // ===========================================
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Linha decorativa superior do rodapé
        doc.setDrawColor(30, 122, 62);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

        // Texto do rodapé
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.text(
          cleanText('Sistema ARES - Inventario de Propriedades Rurais'),
          pageWidth / 2,
          pageHeight - 13,
          { align: 'center' }
        );

        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(
          cleanText(`Metodologia: IPCC 2006 + GHG Protocol | Pagina ${i} de ${totalPages}`),
          pageWidth / 2,
          pageHeight - 9,
          { align: 'center' }
        );
      }

      // ===========================================
      // SALVAR PDF
      // ===========================================
      const fileName = `relatorio_inventario_${relatorio.title?.replace(/\s+/g, '_') || 'propriedade'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      console.log('✅ PDF gerado com sucesso:', fileName);
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar PDF. Verifique se a biblioteca jsPDF está instalada.');
    }
  }
}
