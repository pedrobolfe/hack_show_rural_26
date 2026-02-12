export interface IUser {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  userType: 'produtor' | 'cooperativa';
  numCRA?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModel implements IUser {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  userType: 'produtor' | 'cooperativa';
  numCRA?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IUser>) {
    this.id = data.id;
    this.name = data.name!;
    this.email = data.email!;
    this.phone = data.phone;
    this.role = data.role || 'user';
    this.userType = data.userType!;
    this.numCRA = data.numCRA;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
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

    if (!this.userType) {
      errors.push('Tipo de usuário é obrigatório');
    }

    const validUserTypes: ('produtor' | 'cooperativa')[] = ['produtor', 'cooperativa'];
    if (this.userType && !validUserTypes.includes(this.userType)) {
      errors.push('Tipo de usuário deve ser "produtor" ou "cooperativa"');
    }

    if (this.userType === 'produtor') {
      if (!this.numCRA || this.numCRA.trim() === '') {
        errors.push('Número do CAR é obrigatório para produtores');
      }
      
      if (this.numCRA && this.numCRA.length < 10) {
        errors.push('Número do CAR deve ter no mínimo 10 caracteres');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toFirestore(): Omit<IUser, 'id'> {
    const data: any = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      userType: this.userType,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    if (this.userType === 'produtor' && this.numCRA) {
      data.numCRA = this.numCRA;
    }

    return data;
  }

  toJSON(): IUser {
    const data: any = {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      userType: this.userType,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    if (this.userType === 'produtor' && this.numCRA) {
      data.numCRA = this.numCRA;
    }

    return data;
  }
}
