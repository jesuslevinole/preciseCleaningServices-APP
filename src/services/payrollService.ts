// src/services/payrollService.ts
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import type { PayrollRecord } from '../types/index';

const COLLECTION_NAME = 'payroll_records';

export const payrollService = {
  // Guardar un nuevo pago
  async create(data: Omit<PayrollRecord, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
      return docRef.id;
    } catch (error) {
      console.error('Error adding document: ', error);
      throw error;
    }
  },

  // Obtener todos los pagos asociados a una casa específica
  async getByPropertyId(propertyId: string): Promise<PayrollRecord[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where("propertyId", "==", propertyId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PayrollRecord[];
    } catch (error) {
      console.error('Error getting documents: ', error);
      throw error;
    }
  },

  // Eliminar un registro de pago
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting document: ', error);
      throw error;
    }
  }
};