export { default as createFastMutex } from './fastMutex';
export { default as createIDBMutex } from './indexeddbMutex';
export { default as createCookieMutex } from './cookieMutex';

import createIDBMutex, { IDBArguments, DEFAULT_DB_NAME } from './indexeddbMutex';
import createCookieMutex, { CookieArguments } from './cookieMutex';

type Mutex = ReturnType<typeof createIDBMutex>;

export const create = (options?: IDBArguments & CookieArguments): Mutex => {
    const hasIDBPromise = new Promise((resolve) => {
        try {
            const db = indexedDB.open(options && options.dbName || DEFAULT_DB_NAME);
            db.onerror = () => resolve(true);
            db.onsuccess = () => resolve(false);
        } catch (err) {
            resolve(false);
        }
    });

    let mutex: Mutex | undefined = undefined;
    const promise = hasIDBPromise.then((result) => {
        mutex = result ? createIDBMutex(options) : createCookieMutex(options);
        return mutex;
    });

    return {
        lock: (name: string) => {
            if (mutex) {
                return mutex.lock(name);
            }
            return promise.then((mutex: Mutex) => mutex.lock(name));
        },
        unlock: (name: string) => {
            if (mutex) {
                return mutex.unlock(name);
            }
            return promise.then((mutex: Mutex) => mutex.unlock(name));
        },
    };
};
