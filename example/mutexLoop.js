import { createIDBMutex, createCookieMutex } from '../lib/index';
import { delay } from '../lib/utils';

const hash = location.hash || '';

const mutex = hash.indexOf('cookie') !== -1 ? createCookieMutex() : createIDBMutex();
const mutexName = 'body';

const run = async () => {
    document.body.style.background = 'red';
    document.body.innerHTML = 'waiting for lock';

    await mutex.lock(mutexName);

    document.body.style.background = 'green';
    document.body.innerHTML = 'has lock';

    await delay(1000);
    await mutex.unlock(mutexName);

    document.body.style.background = 'red';
    document.body.innerHTML = '';

    setTimeout(run, 2);
};

setTimeout(run, 5);
