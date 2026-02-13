import { IQuestionAndResponse } from "../producer/producer.model";

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

export class UserModel implements IUser {
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
  

  constructor(data: Partial<IUser>) {
    this.id = data.id;
    this.name = data.name!;
    this.email = data.email!;
    this.phone = data.phone;
    this.role = data.role || 'user';
    this.userType = 'produtor';
    this.numCRA = data.numCRA!;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.questionsAndResponses = data.questionsAndResponses || [];
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Nome é obrigatório');
    }

    if (this.name && this.name.length < 3) {
      errors.push('Nome deve ter no mínimo 3 caracteres');
    }

    if (!this.email || this.email.trim() === '') {
      errors.push('Email é obrigatório');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.email && !emailRegex.test(this.email)) {
      errors.push('Email inválido');
    }

    // CAR é obrigatório para produtor
    if (!this.numCRA || this.numCRA.trim() === '') {
      errors.push('Número do CAR é obrigatório');
    }
    
    if (this.numCRA && this.numCRA.length < 10) {
      errors.push('Número do CAR deve ter no mínimo 10 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toFirestore(): Omit<IUser, 'id'> {
    return {
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      userType: this.userType,
      numCRA: this.numCRA,
      questionsAndResponses: this.questionsAndResponses || [],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toJSON(): IUser {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      userType: this.userType,
      numCRA: this.numCRA,
      questionsAndResponses: this.questionsAndResponses || [],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
