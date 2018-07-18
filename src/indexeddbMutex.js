import { delay } from './utils'

const initDb = ({ dbName, objectStoreName }) => new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(dbName, 1)
    openRequest.onupgradeneeded = () => {
        const db = openRequest.result
        db.createObjectStore(objectStoreName)
    }
    openRequest.onsuccess = () => resolve(openRequest.result)
    openRequest.onerror = () => reject(openRequest.error)
})

const tryLock = (db, name, objectStoreName, expiry) => {
    const tx = db.transaction(objectStoreName, 'readwrite')
    const store = tx.objectStore(objectStoreName)

    return new Promise((resolve, reject) => {
        const lockMetaRequest = store.get(name)

        lockMetaRequest.onsuccess = () => {
            const lockMeta = lockMetaRequest.result

            if (lockMeta > Date.now()) {
                resolve(false)
                return
            }

            const newLockMeta = expiry + Date.now()
            const writeRequest = store.put(newLockMeta, name)

            writeRequest.onsuccess = () => resolve(true)
            writeRequest.onerror = () => reject(writeRequest.error)
        }

        lockMetaRequest.onerror = () => reject(lockMetaRequest.error)
    })
}

/**
 * This library provides a mutex backed by the transactional guarantees of the IndexedDB API.
 * Based on https://github.com/robertknight/idb-mutex
 * @param {Number} [expiry=10000] - Max time in ms before the lock will expire. Note: The function can't take longer than this.
 * @param {Number} [spinTimeout=100] - The time in ms before with how long the retry should spin.
 * @param {String} [objectStoreName='mutexes'] - The name of the IndexedDB store.
 * @param {String} [dbName='mutex'] - The name of the IndexedDB database.
 * @returns {Promise<{lock: lock, unlock: (function(String): Promise<any>)}>}
 */
export default ({ expiry = 10000, spinTimeout = 100, objectStoreName = 'mutexes', dbName = 'mutex' } = {}) => {
    const dbPromise = initDb({ dbName, objectStoreName })

    return {
        /**
         * Acquire the lock.
         *
         * If no other instance currently holds the lock, the previous lock has expired
         * or the current instance already holds the lock, then this resolves
         * immediately.
         *
         * Otherwise `lock()` waits until the current lock owner releases the lock or
         * it expires.
         *
         * @param {String} name name of what to lock
         * @returns {Promise} that resolves when the lock has been acquired.
         */
        lock: async (name) => {
            const db = await dbPromise
            let attempts = 0
            while (!(await tryLock(db, name, objectStoreName, expiry))) {
                await delay(spinTimeout)
                attempts++
            }
            return attempts
        },

        /**
         * Release the lock.
         * @param {String} name
         * @returns {Promise} that resolves when the lock has been released.
         */
        unlock: async (name) => {
            const db = await dbPromise
            const tx = db.transaction(objectStoreName, 'readwrite')
            const store = tx.objectStore(objectStoreName)
            const unlockRequest = store.put(0, name)

            return new Promise((resolve, reject) => {
                unlockRequest.onsuccess = () => resolve()
                unlockRequest.onerror = () => reject(unlockRequest.error)
            })
        }
    }
}
