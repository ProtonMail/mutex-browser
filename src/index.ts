export { default as createFastMutex } from './fastMutex';
export { default as createIDBMutex } from './indexeddbMutex';
export { default as createCookieMutex } from './cookieMutex';

import createIDBMutex, { IDBArguments } from './indexeddbMutex';
import createCookieMutex, { CookieArguments } from './cookieMutex';

interface Mutex {
    lock: (name: string) => Promise<number>;
    unlock: (name: string) => Promise<void>;
}

export const create = (options?: IDBArguments & CookieArguments): Mutex => {
    const createMutex = async () => {
        try {
            const mutex = createIDBMutex(options);
            await mutex.init();
            return mutex;
        } catch (e) {
            return createCookieMutex(options);
        }
    }

    let mutex: Mutex | undefined = undefined;
    const promise = createMutex().then((result) => {
        mutex = result
        return mutex;
    });

    return {
        lock: (name: string) => {
            if (mutex) {
                return mutex.lock(name);
            }
            return promise.then((mutex) => mutex.lock(name));
        },
        unlock: (name: string) => {
            if (mutex) {
                return mutex.unlock(name);
            }
            return promise.then((mutex: Mutex) => mutex.unlock(name));
        },
    };
};
