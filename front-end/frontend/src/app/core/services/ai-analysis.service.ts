import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AnalysisInput {
  areaTotal: number;
  coordenadas: Array<[number, number]>;
  dataPlantio?: string;
  dataColheita?: string;
  classeTextural?: string;
  teorArgila?: number;
  usoAnterior?: string;
  sistemaCultivo?: string;
  tempoAdocao?: number;
  areaQueima?: number;
  areaManejoOrganico?: number;
  areaCultivada?: number;
  produtividadeMedia?: number;
}

export interface FullInventoryResponse {
  etapa1_analise_imagem: string;
  etapa2_inventario_final: string;
  relatorioId: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiAnalysisService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Gera o inventário completo de carbono
   */
  generateFullInventory(userId: string, inputs: AnalysisInput): Observable<FullInventoryResponse> {
    return this.http.post<FullInventoryResponse>(
      `${this.apiUrl}/ai/generate-full-inventory`,
      {
        userId,
        customPrompt: 'Análise completa da propriedade rural',
        inputs
      }
    );
  }
}
