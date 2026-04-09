import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 
import { getStorage } from "firebase/storage";

// Tu configuración real de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCD38jSunojeuoE7T2c1witsvdkFnOuqe4",
  authDomain: "precise-app-94dd6.firebaseapp.com",
  projectId: "precise-app-94dd6",
  storageBucket: "precise-app-94dd6.firebasestorage.app",
  messagingSenderId: "100110215031",
  appId: "1:100110215031:web:d927cb693f2ce0828fa372"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// EXPORTAR SERVICIOS PARA EL RESTO DE LA APP
export const db = getFirestore(app);
export const auth = getAuth(app); 
export const storage = getStorage(app);

export default app;