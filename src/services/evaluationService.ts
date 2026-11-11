import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CaseEvaluation } from '../types/salesProcess';

const COLLECTION_NAME = 'evaluations';

/**
 * Subscribe to real-time evaluations from Firestore
 */
export function subscribeToEvaluations(
  onUpdate: (evaluations: CaseEvaluation[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, COLLECTION_NAME);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: CaseEvaluation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CaseEvaluation;
        items.push({
          ...data,
          id: docSnap.id,
        });
      });
      // Sort by date / timestamp descending
      items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onUpdate(items);
    },
    (error) => {
      console.error('Subscription error in evaluations:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
  );
}

/**
 * Save or update an evaluation document
 */
export async function saveEvaluation(evaluation: CaseEvaluation): Promise<void> {
  const docId = evaluation.id || `eval_${Date.now()}`;
  const docRef = doc(db, COLLECTION_NAME, docId);
  try {
    const payload = {
      ...evaluation,
      id: docId,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${docId}`);
  }
}

/**
 * Delete an evaluation document
 */
export async function deleteEvaluation(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Seed initial demo evaluations if collection is empty
 */
export async function seedDemoEvaluationsIfEmpty(demoList: CaseEvaluation[]): Promise<void> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      for (const item of demoList) {
        await saveEvaluation(item);
      }
    }
  } catch (error) {
    console.warn('Could not check or seed demo evaluations, continuing:', error);
  }
}
