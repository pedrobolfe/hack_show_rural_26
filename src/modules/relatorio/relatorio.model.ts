import admin from 'firebase-admin';

export interface IRelatorio {
    id?: string;
    userId: string;
    response: string;
    analise_imagem?: string; // Primeira etapa: análise da imagem de satélite
    comparacao_dados?: string; // Segunda etapa: inventário final com comparação dos dados
    createdAt: Date;
}

export class RelatorioModel implements IRelatorio {
    id?: string;
    userId: string;
    response: string;
    analise_imagem?: string;
    comparacao_dados?: string;
    createdAt: Date;

    constructor(data: Partial<IRelatorio>) {
        this.id = data.id;
        this.userId = data.userId || '';
        this.response = data.response || '';
        this.analise_imagem = data.analise_imagem;
        this.comparacao_dados = data.comparacao_dados;
        this.createdAt = data.createdAt || new Date();
    }

    toJSON(): Omit<IRelatorio, 'id'> {
        return {
            userId: this.userId,
            response: this.response,
            analise_imagem: this.analise_imagem,
            comparacao_dados: this.comparacao_dados,
            createdAt: this.createdAt,
        };
    }

    static fromFirestore(id: string, data: any): RelatorioModel {
        return new RelatorioModel({
            id,
            userId: data.userId,
            response: data.response,
            analise_imagem: data.analise_imagem,
            comparacao_dados: data.comparacao_dados,
            createdAt: data.createdAt?.toDate() || new Date(),
        });
    }

    /**
     * Cria um novo relatório no Firestore
     */
    static async create(
        userId: string,
        response: string,
        analise_imagem?: string,
        comparacao_dados?: string
    ): Promise<string> {
        const relatorioData: any = {
            userId,
            response,
            createdAt: admin.firestore.Timestamp.now(),
        };

        // Adicionar campos opcionais se fornecidos
        if (analise_imagem) {
            relatorioData.analise_imagem = analise_imagem;
        }
        if (comparacao_dados) {
            relatorioData.comparacao_dados = comparacao_dados;
        }

        const docRef = await admin.firestore()
            .collection('relatorios')
            .add(relatorioData);

        console.log('📄 Relatório criado com ID:', docRef.id);
        console.log('   - Análise de imagem:', analise_imagem ? '✅ Incluída' : '❌ Não incluída');
        console.log('   - Comparação de dados:', comparacao_dados ? '✅ Incluída' : '❌ Não incluída');
        
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
