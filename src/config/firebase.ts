import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Importamos el servicio de Auth
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // ... Tus credenciales de Firebase aquí ...
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_BUCKET",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// EXPORTAR SERVICIOS (Asegúrate de que tengan el 'export' delante)
export const db = getFirestore(app);
export const auth = getAuth(app); // <-- ESTA ES LA LÍNEA QUE FALTA O ESTÁ MAL
export const storage = getStorage(app);

export default app;