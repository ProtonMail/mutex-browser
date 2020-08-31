export { default as createFastMutex } from './fastMutex';
export { default as createIDBMutex } from './indexeddbMutex';
export { default as createCookieMutex } from './cookieMutex';
import createIDBMutex, { DEFAULT_DB_NAME } from './indexeddbMutex';
import createCookieMutex from './cookieMutex';
export const create = (options) => {
    const hasIDBPromise = new Promise((resolve) => {
        try {
            const db = indexedDB.open(options && options.dbName || DEFAULT_DB_NAME);
            db.onerror = () => resolve(true);
            db.onsuccess = () => resolve(false);
        }
        catch (err) {
            resolve(false);
        }
    });
    let mutex = undefined;
    const promise = hasIDBPromise.then((result) => {
        mutex = result ? createIDBMutex(options) : createCookieMutex(options);
        return mutex;
    });
    return {
        lock: (name) => {
            if (mutex) {
                return mutex.lock(name);
            }
            return promise.then((mutex) => mutex.lock(name));
        },
        unlock: (name) => {
            if (mutex) {
                return mutex.unlock(name);
            }
            return promise.then((mutex) => mutex.unlock(name));
        },
    };
};
