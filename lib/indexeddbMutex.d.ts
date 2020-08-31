export interface IDBArguments {
    expiry?: number;
    spinTimeout?: number;
    objectStoreName?: string;
    dbName?: string;
}
export declare const DEFAULT_DB_NAME = "mutex";
declare const _default: ({ expiry, spinTimeout, objectStoreName, dbName, }?: IDBArguments) => {
    lock: (name: string) => Promise<number>;
    unlock: (name: string) => Promise<unknown>;
};
/**
 * This library provides a mutex backed by the transactional guarantees of the IndexedDB API.
 * Based on https://github.com/robertknight/idb-mutex
 * @param [expiry=10000] - Max time in ms before the lock will expire. Note: The function can't take longer than this.
 * @param [spinTimeout=100] - The time in ms before with how long the retry should spin.
 * @param [objectStoreName='mutexes'] - The name of the IndexedDB store.
 * @param [dbName='mutex'] - The name of the IndexedDB database.
 */
export default _default;
