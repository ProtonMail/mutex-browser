import createFastMutex, { Arguments } from './fastMutex';
import createCookieStorage from './cookieStorage';

export type CookieArguments = Omit<Arguments, 'storage'>;

export default (options?: CookieArguments) => createFastMutex({ ...options, storage: createCookieStorage() });
