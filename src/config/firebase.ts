import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // REEMPLAZA ESTO CON LOS VALORES EXACTOS DE TU CONSOLA DE FIREBASE
  apiKey: "AIzaSyB-EjEmploDeTuLlaveReal123456789",
  authDomain: "precise-cleaning-app.firebaseapp.com",
  projectId: "precise-cleaning-app",
  storageBucket: "precise-cleaning-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcde1234567890"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// EXPORTAR SERVICIOS
export const db = getFirestore(app);
export const auth = getAuth(app); 
export const storage = getStorage(app);

export default app;