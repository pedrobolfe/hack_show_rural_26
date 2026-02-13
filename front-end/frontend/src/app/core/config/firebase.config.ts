import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase - Credenciais do projeto agronomia-carbono
const firebaseConfig = {
  apiKey: "AIzaSyA9-sUxwCIUAvVsOyyusa2tPgvlsbV21hk",
  authDomain: "agronomia-carbono.firebaseapp.com",
  projectId: "agronomia-carbono",
  storageBucket: "agronomia-carbono.firebasestorage.app",
  messagingSenderId: "8250083865",
  appId: "1:8250083865:web:a3b2cb6b50c5b517877888",
  measurementId: "G-DQ0QQVRVDM"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
