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
