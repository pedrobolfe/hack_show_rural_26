export interface IQuestionAndResponse {
  num: number;
  question: string;
  response: string;
}

export interface IUser {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  userType: 'produtor';
  numCRA: string;
  createdAt: Date;
  updatedAt: Date;
  questionsAndResponses?: Array<IQuestionAndResponse>;
  // Campos do último relatório de carbono
  lastReportDate?: Date;
  totalEmissoes?: number; // tCO₂e/ano
  totalRemocoes?: number; // tCO₂e/ano
  balancoLiquido?: number; // tCO₂e/ano
  statusCarbono?: 'POSITIVO' | 'NEGATIVO' | 'NEUTRO';
  creditosGeraveis?: number; // tCO₂e/ano
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: IUser;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  numCRA: string;
}
