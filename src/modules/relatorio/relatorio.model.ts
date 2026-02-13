import admin from 'firebase-admin';

export interface IRelatorio {
    id?: string;
    userId: string;
    response: string;
    createdAt: Date;
}

export class RelatorioModel implements IRelatorio {
    id?: string;
    userId: string;
    response: string;
    createdAt: Date;

    constructor(data: Partial<IRelatorio>) {
        this.id = data.id;
        this.userId = data.userId || '';
        this.response = data.response || '';
        this.createdAt = data.createdAt || new Date();
    }

    toJSON(): Omit<IRelatorio, 'id'> {
        return {
            userId: this.userId,
            response: this.response,
            createdAt: this.createdAt,
        };
    }

    static fromFirestore(id: string, data: any): RelatorioModel {
        return new RelatorioModel({
            id,
            userId: data.userId,
            response: data.response,
            createdAt: data.createdAt?.toDate() || new Date(),
        });
    }

    /**
     * Cria um novo relatório no Firestore
     */
    static async create(userId: string, response: string): Promise<string> {
        const relatorioData = {
            userId,
            response,
            createdAt: admin.firestore.Timestamp.now(),
        };

        const docRef = await admin.firestore()
            .collection('relatorios')
            .add(relatorioData);

        console.log('📄 Relatório criado com ID:', docRef.id);
        return docRef.id;
    }

    /**
     * Busca um relatório por ID
     */
    static async findById(id: string): Promise<RelatorioModel | null> {
        const docSnap = await admin.firestore()
            .collection('relatorios')
            .doc(id)
            .get();

        if (!docSnap.exists) {
            return null;
        }

        return RelatorioModel.fromFirestore(docSnap.id, docSnap.data());
    }

    /**
     * Busca todos os relatórios de um usuário
     */
    static async findByUserId(userId: string, limitCount: number = 10): Promise<RelatorioModel[]> {
        const querySnapshot = await admin.firestore()
            .collection('relatorios')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(limitCount)
            .get();

        const relatorios: RelatorioModel[] = [];

        querySnapshot.forEach((doc) => {
            relatorios.push(RelatorioModel.fromFirestore(doc.id, doc.data()));
        });

        return relatorios;
    }

    /**
     * Busca todos os relatórios (com limite)
     */
    static async findAll(limitCount: number = 50): Promise<RelatorioModel[]> {
        const querySnapshot = await admin.firestore()
            .collection('relatorios')
            .orderBy('createdAt', 'desc')
            .limit(limitCount)
            .get();

        const relatorios: RelatorioModel[] = [];

        querySnapshot.forEach((doc) => {
            relatorios.push(RelatorioModel.fromFirestore(doc.id, doc.data()));
        });

        return relatorios;
    }
}

export default RelatorioModel;
