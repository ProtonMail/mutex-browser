import { Arguments } from './fastMutex';
export declare type CookieArguments = Omit<Arguments, 'storage'>;
declare const _default: (options?: Pick<Arguments, "expiry" | "spinTimeout" | "id" | "keyX" | "keyY"> | undefined) => {
    lock: (name: string) => Promise<number>;
    unlock: (name: string) => Promise<void>;
};
export default _default;
