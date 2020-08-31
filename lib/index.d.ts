export { default as createFastMutex } from './fastMutex';
export { default as createIDBMutex } from './indexeddbMutex';
export { default as createCookieMutex } from './cookieMutex';
import createIDBMutex, { IDBArguments } from './indexeddbMutex';
declare type Mutex = ReturnType<typeof createIDBMutex>;
export declare const create: (options?: (IDBArguments & Pick<import("./fastMutex").Arguments, "expiry" | "spinTimeout" | "id" | "keyX" | "keyY">) | undefined) => Mutex;
