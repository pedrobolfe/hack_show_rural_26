import admin from 'firebase-admin';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Carregar variáveis de ambiente ANTES de usar
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;
let storage: admin.storage.Storage;

try {
  let credential: admin.credential.Credential | undefined;

  // Tentar carregar credenciais de diferentes fontes
  
  // 1. Variável de ambiente com caminho do arquivo
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (fs.existsSync(credPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      credential = admin.credential.cert(serviceAccount);
      console.log('✅ Credenciais carregadas de:', credPath);
    }
  }
  
  // 2. Arquivo na raiz do projeto
  if (!credential) {
    const defaultPath = path.resolve('./serviceAccountKey.json');
    if (fs.existsSync(defaultPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
      credential = admin.credential.cert(serviceAccount);
      console.log('✅ Credenciais carregadas de: serviceAccountKey.json');
    }
  }

  // 3. Base64 em variável de ambiente (produção)
  if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString()
    );
    credential = admin.credential.cert(serviceAccount);
    console.log('✅ Credenciais carregadas de variável de ambiente (base64)');
  }

  // Inicializar Firebase
  if (credential) {
    admin.initializeApp({
      credential,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
    });
  } else {
    // Modo desenvolvimento sem credenciais (usar emulador)
    console.log('⚠️  AVISO: Nenhuma credencial encontrada!');
    console.log('📝 Para usar Firebase real, configure serviceAccountKey.json');
    console.log('🔧 Ou use Firebase Emulator para desenvolvimento');
    
    admin.initializeApp({
      projectId: firebaseConfig.projectId || 'demo-project',
      storageBucket: firebaseConfig.storageBucket
    });
  }

  // Inicializar serviços com configurações explícitas
  db = admin.firestore();
  
  // Configurações do Firestore para garantir conexão
  const settings = {
    ignoreUndefinedProperties: true,
  };
  db.settings(settings);
  
  auth = admin.auth();
  storage = admin.storage();

  // Configurar emulador se estiver em desenvolvimento
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`🔧 Usando Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  }

  console.log('✅ Firebase inicializado com sucesso!');
  console.log(`📦 Projeto: ${firebaseConfig.projectId || 'demo-project'}`);
  
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', (error as Error).message);
  console.error('💡 Veja FIREBASE_SETUP.md para instruções de configuração');
  throw error;
}

export { db, auth, storage, admin, firebaseConfig };
