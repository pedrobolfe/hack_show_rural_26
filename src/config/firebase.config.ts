import admin from 'firebase-admin';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

let firebaseApp: admin.app.App;

try {
  firebaseApp = admin.initializeApp({
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket
  });

  console.log('✅ Firebase inicializado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', (error as Error).message);
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export { admin, firebaseConfig };
