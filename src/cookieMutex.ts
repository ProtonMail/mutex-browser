import createFastMutex, { Arguments } from './fastMutex';
import createCookieStorage from './cookieStorage';

export default (options?: Omit<Arguments, 'storage'>) =>
    createFastMutex({ ...options, storage: createCookieStorage() });
