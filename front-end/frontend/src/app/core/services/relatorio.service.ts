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

        // Ordena por data de criação (mais recente primeiro)
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

  downloadRelatorio(relatorio: IRelatorio): void {
    const dataStr = JSON.stringify(relatorio.content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${relatorio.title}_${new Date().getTime()}.json`;
    link.click();

    window.URL.revokeObjectURL(url);
  }
}
