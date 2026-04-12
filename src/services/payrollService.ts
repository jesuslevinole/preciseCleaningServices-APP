import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import type { PayrollRecord } from '../types/index';

const COLLECTION_NAME = 'payroll_records';

export const payrollService = {
  async create(data: Omit<PayrollRecord, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), { ...data, status: data.status || 'Pending' });
      return docRef.id;
    } catch (error) {
      console.error('Error adding document: ', error);
      throw error;
    }
  },

  async getByPropertyId(propertyId: string): Promise<PayrollRecord[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where("propertyId", "==", propertyId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PayrollRecord[];
    } catch (error) {
      console.error('Error getting documents: ', error);
      throw error;
    }
  },

  async getAll(): Promise<PayrollRecord[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PayrollRecord[];
    } catch (error) {
      console.error('Error getting all documents: ', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<PayrollRecord>): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), data);
    } catch (error) {
      console.error('Error updating document: ', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting document: ', error);
      throw error;
    }
  }
};