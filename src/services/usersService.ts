import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc 
} from 'firebase/firestore'; // Eliminamos updateDoc y doc que no se usan
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

// CORRECCIÓN: Ruta explícita al index.ts de la carpeta types
import type { SystemUser } from '../types/index';

const USERS_COLLECTION = 'system_users';

export const usersService = {
  // Verifica si el email está registrado en el módulo de usuarios
  async isEmailWhitelisted(email: string): Promise<boolean> {
    const q = query(
      collection(db, USERS_COLLECTION), 
      where("email", "==", email.toLowerCase().trim())
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  },

  // Agrega un usuario y dispara el email de configuración de contraseña
  async inviteUser(userData: Omit<SystemUser, 'id'>) {
    const auth = getAuth();
    
    // 1. Guardar en Firestore
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      ...userData,
      email: userData.email.toLowerCase().trim(),
      status: 'Pending Invite'
    });

    // 2. Enviar email para que el usuario ponga su contraseña
    // Firebase enviará un link seguro a su correo
    try {
      await sendPasswordResetEmail(auth, userData.email);
    } catch (error) {
      console.error("Error sending invite email:", error);
    }

    return docRef.id;
  }
};