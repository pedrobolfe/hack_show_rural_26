export interface IProducer {
  id?: string;
  uid?: string;
  name: string;
  documentId_hash?: string;
  email: string;
  phone?: string;
  cooperativeId?: string;
  userType: 'produtor' | 'cooperativa';
  createdAt: Date;
  updatedAt?: Date;
}

export class ProducerModel implements IProducer {
  id?: string;
  uid?: string;
  name: string;
  documentId_hash?: string;
  email: string;
  phone?: string;
  cooperativeId?: string;
  userType: 'produtor' | 'cooperativa';
  createdAt: Date;
  updatedAt?: Date;

  constructor(data: Partial<IProducer>) {
    this.id = data.id;
    this.uid = data.uid;
    this.name = data.name!;
    this.documentId_hash = data.documentId_hash;
    this.email = data.email!;
    this.phone = data.phone;
    this.cooperativeId = data.cooperativeId;
    this.userType = data.userType!;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt;
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

    if (!this.userType) {
      errors.push('Tipo de usuário é obrigatório');
    }

    const validUserTypes: ('produtor' | 'cooperativa')[] = ['produtor', 'cooperativa'];
    if (this.userType && !validUserTypes.includes(this.userType)) {
      errors.push('Tipo de usuário deve ser "produtor" ou "cooperativa"');
    }

    if (this.userType === 'produtor' && !this.cooperativeId) {
      errors.push('Produtor deve estar vinculado a uma cooperativa');
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
    if (this.cooperativeId) data.cooperativeId = this.cooperativeId;
    if (this.updatedAt) data.updatedAt = this.updatedAt;

    return data;
  }

  toJSON(): IProducer {
    return {
      id: this.id,
      uid: this.uid,
      name: this.name,
      email: this.email,
      phone: this.phone,
      cooperativeId: this.cooperativeId,
      userType: this.userType,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
