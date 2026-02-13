import { db } from '../../config/firebase.config';
import { UserModel, IUser } from './user.model';

class UserService {
  private collectionName = 'users';
  private usersRef = db.collection(this.collectionName);

  async create(data: Partial<IUser>): Promise<UserModel> {
    const user = new UserModel(data);

    const validation = user.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const existingUser = await this.findByEmail(user.email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    if (user.userType === 'produtor' && user.numCRA) {
      const craExists = await this.checkCRAExists(user.numCRA);
      if (craExists) {
        throw new Error('Número do CAR já cadastrado');
      }
    }

    const docRef = await this.usersRef.add(user.toFirestore());
    const doc = await docRef.get();
    return new UserModel({ id: doc.id, ...doc.data() });
  }

  async findAll(limit = 50): Promise<UserModel[]> {
    const snapshot = await this.usersRef.limit(limit).get();
    
    if (snapshot.empty) {
      return [];
    }

    const users: UserModel[] = [];
    snapshot.forEach(doc => {
      users.push(new UserModel({ id: doc.id, ...doc.data() }));
    });

    return users;
  }

  async findById(id: string): Promise<UserModel> {
    const doc = await this.usersRef.doc(id).get();

    if (!doc.exists) {
      throw new Error('Usuário não encontrado');
    }

    return new UserModel({ id: doc.id, ...doc.data() });
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    const snapshot = await this.usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return new UserModel({ id: doc.id, ...doc.data() });
  }

  async update(id: string, data: Partial<IUser>): Promise<UserModel> {
    const docRef = this.usersRef.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser = new UserModel({
      ...doc.data(),
      ...data,
      id: doc.id,
      updatedAt: new Date()
    });

    const validation = updatedUser.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    if (data.email && data.email !== doc.data()?.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email já cadastrado');
      }
    }

    if (updatedUser.userType === 'produtor' && data.numCRA && data.numCRA !== doc.data()?.numCRA) {
      const craExists = await this.checkCRAExists(data.numCRA, id);
      if (craExists) {
        throw new Error('Número do CAR já cadastrado');
      }
    }

    await docRef.update(updatedUser.toFirestore());
    return updatedUser;
  }

  async delete(id: string): Promise<UserModel> {
    const docRef = this.usersRef.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Usuário não encontrado');
    }

    await docRef.delete();
    return new UserModel({ id: doc.id, ...doc.data() });
  }

  async findByRole(role: string): Promise<UserModel[]> {
    const snapshot = await this.usersRef.where('role', '==', role).get();

    if (snapshot.empty) {
      return [];
    }

    const users: UserModel[] = [];
    snapshot.forEach(doc => {
      users.push(new UserModel({ id: doc.id, ...doc.data() }));
    });

    return users;
  }

  async findByUserType(userType: 'produtor' | 'cooperativa'): Promise<UserModel[]> {
    const validTypes = ['produtor', 'cooperativa'];
    if (!validTypes.includes(userType)) {
      throw new Error('Tipo de usuário inválido. Use "produtor" ou "cooperativa"');
    }

    const snapshot = await this.usersRef.where('userType', '==', userType).get();

    if (snapshot.empty) {
      return [];
    }

    const users: UserModel[] = [];
    snapshot.forEach(doc => {
      users.push(new UserModel({ id: doc.id, ...doc.data() }));
    });

    return users;
  }

  async findByNumCRA(numCRA: string): Promise<UserModel | null> {
    const snapshot = await this.usersRef
      .where('userType', '==', 'produtor')
      .where('numCRA', '==', numCRA)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return new UserModel({ id: doc.id, ...doc.data() });
  }

  async checkCRAExists(numCRA: string, excludeUserId?: string): Promise<boolean> {
    const user = await this.findByNumCRA(numCRA);
    
    if (!user) {
      return false;
    }

    if (excludeUserId && user.id === excludeUserId) {
      return false;
    }

    return true;
  }

  async updateQuestions(id: string, questionsAndResponses: Array<{ num: number; question: string; response: string }>): Promise<UserModel> {
    const docRef = this.usersRef.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Usuário não encontrado');
    }

    // Ordena as questões por número antes de salvar
    const sortedQuestions = questionsAndResponses.sort((a, b) => a.num - b.num);

    await docRef.update({
      questionsAndResponses: sortedQuestions,
      updatedAt: new Date()
    });

    const updatedDoc = await docRef.get();
    return new UserModel({ id: updatedDoc.id, ...updatedDoc.data() });
  }
}

export default new UserService();
