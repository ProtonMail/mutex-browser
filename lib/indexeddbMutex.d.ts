export declare const initDb: (dbName: string, objectStoreName: string) => Promise<IDBDatabase>;
export interface IDBArguments {
    expiry?: number;
    spinTimeout?: number;
    objectStoreName?: string;
    dbName?: string;
}
declare const _default: ({ expiry, spinTimeout, objectStoreName, dbName, }?: IDBArguments) => {
    lock: (name: string) => Promise<number>;
    unlock: (name: string) => Promise<void>;
    init: () => Promise<void>;
};
/**
 * This library provides a mutex backed by the transactional guarantees of the IndexedDB API.
 * Based on https://github.com/robertknight/idb-mutex
 * @param [expiry=10000] - Max time in ms before the lock will expire. Note: The function can't take longer than this.
 * @param [spinTimeout=1000] - The time in ms before with how long the retry should spin.
 * @param [objectStoreName='mutexes'] - The name of the IndexedDB store.
 * @param [dbName='mutex'] - The name of the IndexedDB database.
 */
export default _default;
