import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
import { ProcessRequestBody, CatalogSearchRequestBody, CatalogSearchResponse } from './types';

dotenv.config();

class SentinelHubService {
  private api: AxiosInstance;
  private oauthToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://services.sentinel-hub.com',
    });

    this.api.interceptors.request.use(
      async (config) => {
        await this.ensureValidToken();
        config.headers = config.headers ?? {};
        if (this.oauthToken) {
          config.headers.Authorization = `Bearer ${this.oauthToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private async getAuthToken(): Promise<void> {
    const clientId = process.env.SENTINELHUB_CLIENT_ID;
    const clientSecret = process.env.SENTINELHUB_CLIENT_SECRET;

    console.log('🔑 Verificando credenciais Sentinel Hub:');
    console.log('   CLIENT_ID:', clientId ? `${clientId.substring(0, 8)}...` : '❌ INDEFINIDO');
    console.log('   CLIENT_SECRET:', clientSecret ? `${clientSecret.substring(0, 8)}...` : '❌ INDEFINIDO');

    if (!clientId || !clientSecret) {
      const errorMessage = 'Sentinel Hub Client ID e Secret devem ser fornecidos nas variáveis de ambiente (SENTINELHUB_CLIENT_ID, SENTINELHUB_CLIENT_SECRET).';
      console.error('❌', errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);

      const response = await axios.post(
        'https://services.sentinel-hub.com/oauth/token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, expires_in } = response.data;
      this.oauthToken = access_token;
      this.tokenExpiry = new Date(new Date().getTime() + (expires_in - 60) * 1000);
      console.log('✅ Token Sentinel Hub obtido! Expira em:', this.tokenExpiry.toLocaleTimeString('pt-BR'));
    } catch (error: any) {
      console.error('❌ Erro ao buscar token Sentinel Hub:');
      console.error('   Status:', error.response?.status);
      console.error('   Data:', error.response?.data);
      console.error('   Message:', error.message);
      throw new Error('Não foi possível autenticar com o Sentinel Hub.');
    }
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.oauthToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.getAuthToken();
    }
  }

  /**
   * Realiza uma requisição para a Process API do Sentinel Hub.
   * @param requestBody O corpo da requisição para a Process API.
   * @returns Os dados da imagem em um Buffer.
   */
  async process(requestBody: ProcessRequestBody): Promise<Buffer> {
    try {
      const response = await this.api.post('/api/v1/process', requestBody, {
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data ? Buffer.from(error.response.data).toString() : error.message;
      console.error('Erro na Process API do Sentinel Hub:', errorMessage);
      throw new Error(`Erro na Process API do Sentinel Hub: ${errorMessage}`);
    }
  }

  /**
   * Realiza uma busca no catálogo STAC do Sentinel Hub.
   * @param requestBody Os critérios de busca.
   * @returns Uma FeatureCollection de itens STAC.
   */
  async search(requestBody: CatalogSearchRequestBody): Promise<CatalogSearchResponse> {
    try {
      const response = await this.api.post('/api/v1/catalog/search', requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message;
      console.error('Erro na API de busca do Catálogo Sentinel Hub:', errorMessage);
      throw new Error(`Erro na API de busca do Catálogo Sentinel Hub: ${errorMessage}`);
    }
  }
}

export default new SentinelHubService();