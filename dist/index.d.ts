export { default as createFastMutex } from './fastMutex';
export { default as createIDBMutex } from './indexeddbMutex';
export { default as createCookieMutex } from './cookieMutex';
import { IDBArguments } from './indexeddbMutex';
interface Mutex {
    lock: (name: string) => Promise<number>;
    unlock: (name: string) => Promise<void>;
}
export declare const create: (options?: (IDBArguments & Pick<import("./fastMutex").Arguments, "expiry" | "spinTimeout" | "id" | "keyX" | "keyY">) | undefined) => Mutex;
