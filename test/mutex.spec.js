import { createCookieMutex, createIDBMutex } from '../lib/index';

const clearCookies = () =>
    document.cookie.split(';').forEach(function (c) {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

const clearDb = (dbName, tableName) => {
    return new Promise((resolve) => {
        const request = indexedDB.open(dbName);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const tx = db.transaction(tableName, 'readwrite');
            tx.objectStore(tableName).clear();
            tx.oncomplete = () => resolve();
        };
    });
};

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

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
            let order = [];

            const p1 = mutex1
                .lock(lockName)
                .then(() => delay(500))
                .then(() => order.push(1))
                .then(() => mutex1.unlock(lockName));

            await delay(10);

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

                let order = [];

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
        beforeAll(async () => {
            clearCookies();
            await delay(10);
        });
        afterEach(() => {
            clearCookies();
        });
        runTests(createCookieMutex);
    });

    describe('indexed db mutex', () => {
        beforeAll(async () => {
            await delay(10);
        });
        afterEach(async () => {
            await clearDb('mutex', 'mutexes');
        });
        runTests(createIDBMutex);
    });
});
