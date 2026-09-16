// IndexedDB storage for large video files (avoiding 5MB localStorage limits)
const DB_NAME = 'SabrinaLimaNailsStorage';
const STORE_NAME = 'videos';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste navegador.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Saves a video File or Blob to IndexedDB
 */
export async function saveVideoBlob(key: string, file: Blob): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const putRequest = store.put(file, key);

    putRequest.onsuccess = () => {
      const objectUrl = URL.createObjectURL(file);
      resolve(objectUrl);
    };

    putRequest.onerror = () => {
      reject(putRequest.error);
    };
  });
}

/**
 * Retrieves a video Blob from IndexedDB and creates a playable object URL
 */
export async function getVideoBlobUrl(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(key);

      getRequest.onsuccess = () => {
        const result = getRequest.result as Blob | undefined;
        if (result && result instanceof Blob) {
          const url = URL.createObjectURL(result);
          resolve(url);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  } catch (err) {
    console.warn('Erro ao ler vídeo do IndexedDB:', err);
    return null;
  }
}

/**
 * Removes a stored video
 */
export async function removeVideo(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const deleteRequest = store.delete(key);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  } catch (err) {
    console.warn('Erro ao excluir vídeo do IndexedDB:', err);
  }
}
