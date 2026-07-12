import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "NoterLocalDB";
const STORE_NAME = "files";
const DB_VERSION = 1;

export interface LocalFileItem {
  linkedFirestoreId: string;
  fileBlob: Blob;
  fileName: string;
  mimeType: string;
  createdAt: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "linkedFirestoreId" });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Saves an uploaded file Blob locally in IndexedDB, linked to its Firestore doc ID.
 */
export async function saveLocalFile(
  firestoreId: string, 
  file: File | Blob, 
  fileName: string, 
  mimeType: string
): Promise<void> {
  const db = getDB();
  if (!db) return;

  const connection = await db;
  const item: LocalFileItem = {
    linkedFirestoreId: firestoreId,
    fileBlob: file instanceof File ? file : new Blob([file], { type: mimeType }),
    fileName,
    mimeType,
    createdAt: new Date().toISOString()
  };

  await connection.put(STORE_NAME, item);
  console.log(`[IndexedDB] File successfully saved locally for Firestore ID: ${firestoreId}`);
}

/**
 * Retrieves a locally saved file from IndexedDB by its Firestore ID.
 */
export async function getLocalFile(firestoreId: string): Promise<LocalFileItem | null> {
  const db = getDB();
  if (!db) return null;

  const connection = await db;
  const item = await connection.get(STORE_NAME, firestoreId);
  return item || null;
}

/**
 * Deletes a locally saved file from IndexedDB.
 */
export async function deleteLocalFile(firestoreId: string): Promise<void> {
  const db = getDB();
  if (!db) return;

  const connection = await db;
  await connection.delete(STORE_NAME, firestoreId);
  console.log(`[IndexedDB] Local file deleted for Firestore ID: ${firestoreId}`);
}
