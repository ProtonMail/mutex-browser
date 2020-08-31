interface Storage {
    get: (key: string) => string | undefined | null;
    set: (key: string, value: string, expiry?: number) => void;
    remove: (key: string) => void;
}
export interface Arguments {
    expiry?: number;
    spinTimeout?: number;
    id?: string;
    keyX?: (name: string) => string;
    keyY?: (name: string) => string;
    storage: Storage;
}
declare const _default: ({ expiry, spinTimeout, id, keyX, keyY, storage, }?: Partial<Arguments>) => {
    lock: (name: string) => Promise<number>;
    unlock: (name: string) => Promise<void>;
};
/**
 * Provides a fast mutual exclusion algorithm, synchronized using cookies.
 * Based on http://lamport.azurewebsites.net/pubs/fast-mutex.pdf
 * @param [expiry=10000] Max time in ms before the lock will expire. Note: The function can't take longer than this.
 * @param [spinTimeout=20] The time in ms before with how long the retry should spin. Note: This will be randomized to prevent starving.
 * @param id The id of mutex contender. Must be unique.
 * @param [keyX] The name to give to the key X
 * @param [keyY] The name to give to the key Y
 * @param storage The storage mechanism. Must provide get, set, and remove functionality.
 */
export default _default;
