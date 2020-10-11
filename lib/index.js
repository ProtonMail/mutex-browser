export { default as createFastMutex } from './fastMutex';
export { default as createIDBMutex } from './indexeddbMutex';
export { default as createCookieMutex } from './cookieMutex';
import createIDBMutex from './indexeddbMutex';
import createCookieMutex from './cookieMutex';
export const create = (options) => {
    const createMutex = async () => {
        try {
            const mutex = createIDBMutex(options);
            await mutex.init();
            return mutex;
        }
        catch (e) {
            return createCookieMutex(options);
        }
    };
    let mutex = undefined;
    const promise = createMutex().then((result) => {
        mutex = result;
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
