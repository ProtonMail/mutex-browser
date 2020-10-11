import { create, createCookieMutex, createIDBMutex } from '../lib/index';

const clearCookies = () =>
    document.cookie.split(';').forEach(function (c) {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

const clearDb = (dbName, tableName) => {
    return new Promise((resolve) => {
        const request = indexedDB.deleteDatabase(dbName);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
    });
}

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

const clear = async () => {
    clearCookies();
    await clearDb('mutex', 'mutexes');
}

describe('mutex', () => {
    const runTests = (create) => {
        it('should get a lock and then unlock', async () => {
            const lockName = 'lock1';
            const mutex1 = create();
            await mutex1.lock(lockName);
            expect(true).toBe(true);
            await mutex1.unlock(lockName);
        });

        it('should get a lock and then unlock', async () => {
            const lockName = 'lock1';
            const mutex1 = create();
            await mutex1.lock(lockName);
            await mutex1.unlock(lockName);
            expect(true).toBe(true);
        });

        it('blocks async code that has not acquired the lock', async () => {
            const lockName = 'a';
            const mutex = create();

            let semaphore = 1;

            const test = async () => {
                await mutex.lock(lockName);
                expect(semaphore).toBe(1);

                semaphore--;
                await Promise.resolve();
                expect(semaphore).toBe(0);

                semaphore++;
                mutex.unlock(lockName);
            };

            await Promise.all([test(), test()]);
        });

        it('should not get a lock while another instance has lock', async () => {
            const lockName = 'lock2';
            const mutex1 = create();
            const mutex2 = create();
            const order = [];

            const p1 = mutex1
                .lock(lockName)
                .then(() => delay(500))
                .then(() => order.push(1))
                .then(() => mutex1.unlock(lockName));

            await delay(30);

            const p2 = mutex2
                .lock(lockName)
                .then(() => order.push(2))
                .then(() => mutex2.unlock(lockName));

            await Promise.all([p1, p2]);

            expect(order).toEqual([1, 2]);
        });

        for (let i = 0; i < 10; ++i) {
            it('should not get a lock while another instance has lock (multiple) ' + i, async () => {
                const lockName = 'iteration' + i;
                const mutex1 = create();
                const mutex2 = create();

                const order = [];

                const p1 = Promise.resolve().then(async () => {
                    await mutex1.lock(lockName);
                    await delay(250);
                    order.push(1);
                    await mutex1.unlock(lockName);

                    // Need to wait for spin timeout
                    await delay(101);

                    await mutex1.lock(lockName);
                    order.push(3);
                    await delay(250);
                    await mutex1.unlock(lockName);
                });

                const p2 = Promise.resolve().then(async () => {
                    await delay(101);

                    await mutex2.lock(lockName);
                    await delay(250);
                    order.push(2);
                    await mutex2.unlock(lockName);
                });

                await Promise.all([p1, p2]);

                expect(order).toEqual([1, 2, 3]);
            });
        }
    };
    describe('cookie mutex', () => {
        beforeEach(clear);
        afterEach(clear);
        runTests(() => {
            return createCookieMutex({ spinTimeout: 20 });
        });
    });

    describe('indexed db mutex', () => {
        beforeEach(clear);
        afterEach(clear);
        runTests(() => {
            return createIDBMutex({ spinTimeout: 100 });
        });
    });
});

describe('init', () => {
    afterEach(clear);
    beforeEach(clear);

    it('should get idb lock when available', async () => {
        const lockName = 'test';
        const mutex1 = create();
        await mutex1.lock(lockName);
        const value = await new Promise((resolve, reject) => {
            const openRequest = indexedDB.open('mutex', 2);
            openRequest.onsuccess = () => {
                const db = openRequest.result;

                const tx = db.transaction('mutexes', 'readonly');
                const store = tx.objectStore('mutexes');

                const request = store.get(lockName);
                request.onsuccess = () => {
                    resolve(request.result);
                    db.close();
                }
                request.onerror = () => {
                    reject();
                    db.close();
                }
            };
            openRequest.onerror = () => {
                reject();
            };
        });
        expect(typeof value).toBe('number');
        expect(document.cookie).toBe('');

        await mutex1.unlock(lockName);
    });

    it('should get cookie lock when available', async () => {
        const lockName = 'test';

        await new Promise((resolve, reject) => {
            const openRequest = indexedDB.open('mutex', 10);
            openRequest.onsuccess = () => {
                const db = openRequest.result;
                resolve(1);
                db.close();
            }
            openRequest.onerror = (e) => {
                reject();
            }
        });

        const mutex1 = create({ spinTimeout: 20, expiry: 100 });
        await mutex1.lock(lockName);
        await mutex1.unlock(lockName);
        expect(document.cookie).toContain('test_lock_X');
    });
});
