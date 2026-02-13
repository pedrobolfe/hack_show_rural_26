import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

// Suas credenciais do Firebase.
// ATENÇÃO: Substitua pelos seus dados! Em um app real, use variáveis de ambiente.
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o serviço de autenticação
export const auth = getAuth(app);

/**
 * Monitora o estado de autenticação do usuário (usado no App.js).
 * @param {function} callback - Função a ser chamada quando o estado de autenticação mudar.
 * @returns {import('firebase/auth').Unsubscribe} - Função para cancelar a inscrição do listener.
 */
export const watchAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Exporta os métodos de autenticação para serem usados nas telas
export { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail };