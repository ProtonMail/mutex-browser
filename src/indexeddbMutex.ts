import { delay } from './utils';

export const initDb = (dbName: string, objectStoreName: string) =>
    new Promise<IDBDatabase>((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, 2);
        openRequest.onupgradeneeded = () => {
            const db = openRequest.result;
            try {
                db.createObjectStore(objectStoreName);
            } catch (e) {
                // If it would already exist
                if (e.name === 'ConstraintError') {
                    return undefined;
                }
                throw e;
            }
        };
        openRequest.onsuccess = () => {
            resolve(openRequest.result);
        }
        openRequest.onerror = () => {
            reject(openRequest.error);
        }
    });

const tryLock = (db: IDBDatabase, name: string, objectStoreName: string, expiry: number) => {
    const tx = db.transaction(objectStoreName, 'readwrite');
    const store = tx.objectStore(objectStoreName);

    return new Promise((resolve, reject) => {
        const lockMetaRequest = store.get(name);

        lockMetaRequest.onsuccess = () => {
            const lockMeta = lockMetaRequest.result;

            if (lockMeta > Date.now()) {
                resolve(false);
                return;
            }

            const newLockMeta = expiry + Date.now();
            const writeRequest = store.put(newLockMeta, name);

            writeRequest.onsuccess = () => resolve(true);
            writeRequest.onerror = () => reject(writeRequest.error);
        };

        lockMetaRequest.onerror = () => reject(lockMetaRequest.error);
    });
};

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IDBArguments {
    expiry?: number;
    spinTimeout?: number;
    objectStoreName?: string;
    dbName?: string;
}

/**
 * This library provides a mutex backed by the transactional guarantees of the IndexedDB API.
 * Based on https://github.com/robertknight/idb-mutex
 * @param [expiry=10000] - Max time in ms before the lock will expire. Note: The function can't take longer than this.
 * @param [spinTimeout=1000] - The time in ms before with how long the retry should spin.
 * @param [objectStoreName='mutexes'] - The name of the IndexedDB store.
 * @param [dbName='mutex'] - The name of the IndexedDB database.
 */
export default ({
    expiry = 10000,
    spinTimeout = 1000,
    objectStoreName = 'mutexes',
    dbName = 'mutex',
}: IDBArguments = {}) => {
    /**
     * Acquire the lock.
     *
     * If no other instance currently holds the lock, the previous lock has expired
     * or the current instance already holds the lock, then this resolves
     * immediately.
     *
     * Otherwise `lock()` waits until the current lock owner releases the lock or
     * it expires.
     *
     * @param name of key to lock
     * @returns promise that resolves when the lock has been acquired.
     */
    const lock = async (name: string): Promise<number> => {
        const db = await initDb(dbName, objectStoreName);
        let attempts = 0;
        while (!(await tryLock(db, name, objectStoreName, expiry))) {
            await delay(spinTimeout);
            attempts++;
        }
        db.close();
        return attempts;
    };

    /**
     * Release the lock.
     * @param {String} name
     * @returns {Promise} that resolves when the lock has been released.
     */
    const unlock = async (name: string): Promise<void> => {
        const db = await initDb(dbName, objectStoreName);
        const tx = db.transaction(objectStoreName, 'readwrite');
        const store = tx.objectStore(objectStoreName);
        const unlockRequest = store.delete(name);

        return new Promise((resolve, reject) => {
            unlockRequest.onsuccess = () => {
                resolve();
                db.close();
            };
            unlockRequest.onerror = () => {
                reject(unlockRequest.error);
                db.close();
            };
        });
    };

    return {
        lock,
        unlock,
        init: async () => {
            const db = await initDb(dbName, objectStoreName);
            db.close();
        }
    };
};
