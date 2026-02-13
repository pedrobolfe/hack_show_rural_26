export interface IProducer {
  id?: string;
  uid?: string;
  name: string;
  documentId_hash?: string;
  email: string;
  phone?: string;
  userType: 'produtor';
  createdAt: Date;
  updatedAt?: Date;
  questionsAndResponses?: Array<IQuestionAndResponse>;
}

export interface IQuestionAndResponse {
  num: number;
  question: string;
  response: string;
}

export class ProducerModel implements IProducer {
  id?: string;
  uid?: string;
  name: string;
  documentId_hash?: string;
  email: string;
  phone?: string;
  userType: 'produtor';
  createdAt: Date;
  updatedAt?: Date;
  questionsAndResponses?: Array<IQuestionAndResponse>;

  constructor(data: Partial<IProducer>) {
    this.id = data.id;
    this.uid = data.uid;
    this.name = data.name!;
    this.documentId_hash = data.documentId_hash;
    this.email = data.email!;
    this.phone = data.phone;
    this.userType = 'produtor';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt;
    this.questionsAndResponses = data.questionsAndResponses || [];
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Nome é obrigatório');
    }

    if (!this.email || this.email.trim() === '') {
      errors.push('Email é obrigatório');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.email && !emailRegex.test(this.email)) {
      errors.push('Email inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toFirestore(): Omit<IProducer, 'id'> {
    const data: any = {
      name: this.name,
      email: this.email,
      userType: this.userType,
      createdAt: this.createdAt
    };

    if (this.uid) data.uid = this.uid;
    if (this.documentId_hash) data.documentId_hash = this.documentId_hash;
    if (this.phone) data.phone = this.phone;
    if (this.updatedAt) data.updatedAt = this.updatedAt;
    if (this.questionsAndResponses) data.questionsAndResponses = this.questionsAndResponses;

    return data;
  }

  toJSON(): IProducer {
    return {
      id: this.id,
      uid: this.uid,
      name: this.name,
      email: this.email,
      phone: this.phone,
      userType: this.userType,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      questionsAndResponses: this.questionsAndResponses
    };
  }
}
