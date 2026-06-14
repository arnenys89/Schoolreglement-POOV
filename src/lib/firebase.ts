import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, getDocs, setDoc, collection, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { School, RegulationSection, RegulationVersion, PDFConfig, SchoolBoard } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

export async function fetchSchools(): Promise<School[]> {
  console.log("Fetching schools from firestore...");
  const querySnapshot = await getDocs(collection(db, 'schools'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
}

export async function saveSchools(schools: School[]): Promise<void> {
  console.log("Saving schools to firestore...");
  const chunkSize = 10;
  for (let i = 0; i < schools.length; i += chunkSize) {
    const chunk = schools.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(school => setDoc(doc(db, 'schools', school.id), school))
    );
  }
}

export async function fetchSections(): Promise<RegulationSection[]> {
  const querySnapshot = await getDocs(collection(db, 'sections'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RegulationSection));
}

export async function saveSections(sections: RegulationSection[]): Promise<void> {
  console.log("Saving sections to firestore...");
  const chunkSize = 10;
  for (let i = 0; i < sections.length; i += chunkSize) {
    const chunk = sections.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(section => setDoc(doc(db, 'sections', section.id), section))
    );
  }
}

export async function fetchSectionsForVersion(versionId: string): Promise<RegulationSection[]> {
  const querySnapshot = await getDocs(collection(db, `versions/${versionId}/sections`));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RegulationSection));
}

export async function saveSectionsForVersion(versionId: string, sections: RegulationSection[]): Promise<void> {
  console.log(`Saving sections to version ${versionId} in firestore...`);
  const chunkSize = 10;
  for (let i = 0; i < sections.length; i += chunkSize) {
    const chunk = sections.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(section => setDoc(doc(db, `versions/${versionId}/sections`, section.id), section))
    );
  }
}

export async function fetchPDFConfig(): Promise<PDFConfig | null> {
  const docRef = doc(db, 'config', 'pdf');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as PDFConfig) : null;
}

export async function savePDFConfig(config: PDFConfig): Promise<void> {
  await setDoc(doc(db, 'config', 'pdf'), config);
}

export async function fetchBoard(): Promise<SchoolBoard | null> {
  const docRef = doc(db, 'config', 'board');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as SchoolBoard) : null;
}

export async function saveBoard(board: SchoolBoard): Promise<void> {
  await setDoc(doc(db, 'config', 'board'), board);
}
