/// <reference types="vite/client" />

// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // Lo usaremos luego para el login
// import { getStorage } from "firebase/storage"; // Lo usaremos luego para las fotos

// 1. Capturamos las variables de entorno inyectadas por Vite
// La directiva en la línea 1 permite que TS reconozca 'import.meta.env' sin errores.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 2. Inicializamos la aplicación principal de Firebase con nuestras credenciales seguras
const app = initializeApp(firebaseConfig);

// 3. Inicializamos y exportamos las instancias de los servicios para usarlas en la App
export const db = getFirestore(app);
// export const auth = getAuth(app);
// export const storage = getStorage(app);