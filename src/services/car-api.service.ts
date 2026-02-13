// import axios from 'axios'; // TODO: descomentar quando integrar API real do CAR

export interface ICarApiResponse {
  numero: string;
  municipio: string;
  uf: string;
  area_total: number;
  area_reserva_legal: number;
  area_app: number;
  area_produtiva: number;
  latitude: number;
  longitude: number;
  geometria?: any;
}

class CarApiService {
  // private baseUrl = 'https://car.gov.br/publico/rest'; // TODO: habilitar quando API real

  async fetchCarData(carNumber: string): Promise<ICarApiResponse | null> {
    try {
      // TODO: Implementar integração real com API do CAR
      // Por enquanto, retornamos dados mockados para desenvolvimento
      
      console.log(`🔍 Buscando dados do CAR: ${carNumber}`);
      
      // Simulação de chamada à API
      // const response = await axios.get(`${this.baseUrl}/imovel/${carNumber}`);
      
      // Mock de dados para desenvolvimento
      const mockData: ICarApiResponse = {
        numero: carNumber,
        municipio: 'Cascavel',
        uf: 'PR',
        area_total: 50.5,
        area_reserva_legal: 12.5,
        area_app: 4.2,
        area_produtiva: 33.8,
        latitude: -24.95,
        longitude: -53.45,
        geometria: null
      };

      return mockData;
    } catch (error) {
      console.error('❌ Erro ao buscar dados do CAR:', error);
      return null;
    }
  }
}

export default new CarApiService();
