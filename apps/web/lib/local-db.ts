import type { PlayerProfile, WalletAddress } from "@sil/core";

export type AppLanguage = "en" | "ru";
export type AppTheme = "milk" | "cocoa";

export type LocalAppState = {
  language: AppLanguage;
  profile: PlayerProfile;
  theme: AppTheme;
  wallets: WalletAddress[];
};

const databaseName = "self-improvement-labs";
const storeName = "app-state";
const stateKey = "main";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName);
    };

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function readLocalState(): Promise<Partial<LocalAppState> | null> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).get(stateKey);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve((request.result as Partial<LocalAppState> | undefined) ?? null);
    transaction.oncomplete = () => database.close();
  });
}

export async function writeLocalState(state: LocalAppState): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).put(state, stateKey);

    request.onerror = () => reject(request.error);
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
  });
}
