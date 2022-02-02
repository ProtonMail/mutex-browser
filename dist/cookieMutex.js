import createFastMutex from './fastMutex';
import createCookieStorage from './cookieStorage';
export default (options) => createFastMutex({ ...options, storage: createCookieStorage() });
