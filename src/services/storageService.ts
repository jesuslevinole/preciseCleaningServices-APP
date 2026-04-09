// src/services/storageService.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; // <-- CORRECCIÓN AQUÍ
import { storage } from '../config/firebase'; // Asegúrate de exportar 'storage' desde tu config
import imageCompression from 'browser-image-compression';

export const storageService = {
  
  // Función maestra para comprimir y subir
  async uploadPropertyPhoto(file: File, propertyId: string, type: 'before' | 'after'): Promise<string> {
    
    // 1. Opciones de compresión agresivas pero con buena calidad visual
    const options = {
      maxSizeMB: 0.3, // Máximo 300KB por foto (¡Magia pura!)
      maxWidthOrHeight: 1280, // Resolución perfecta para web/móvil
      useWebWorker: true, // No bloquea la UI mientras comprime
    };

    try {
      // 2. Comprimimos la imagen
      const compressedFile = await imageCompression(file, options);
      
      // 3. Creamos un nombre de archivo único (timestamp)
      const fileName = `${Date.now()}_${compressedFile.name}`;
      
      // 4. Definimos la ruta ultra-organizada
      const filePath = `properties/${propertyId}/${type}/${fileName}`;
      const storageRef = ref(storage, filePath);

      // 5. Subimos a Firebase Storage
      await uploadBytes(storageRef, compressedFile);

      // 6. Retornamos la URL pública para guardarla en Firestore
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;

    } catch (error) {
      console.error("Error al subir imagen:", error);
      throw error;
    }
  },

  // Función para borrar la foto si el usuario se arrepiente
  async deletePhotoByUrl(photoUrl: string): Promise<void> {
    try {
      const fileRef = ref(storage, photoUrl);
      await deleteObject(fileRef);
    } catch (error) {
      console.error("Error al borrar la foto:", error);
    }
  }
};