// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQFGX0i0M3HLqe-WBFM9d-CTGX9zSH_bs",
  authDomain: "barbershop-1f2fe.firebaseapp.com",
  projectId: "barbershop-1f2fe",
  storageBucket: "barbershop-1f2fe.firebasestorage.app",
  messagingSenderId: "360306849794",
  appId: "1:360306849794:web:15fd03aa81f7d5f95c8f1b",
  measurementId: "G-Q2TCSMBPJC"
};

// Inicializar solo la App y Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Nota: Hemos quitado 'auth' temporalmente para aislar el error de conexión.