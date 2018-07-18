import { delay, raf, random } from './utils'

const defaultKeyX = (name) => `${name}_lock_X`
const defaultKeyY = (name) => `${name}_lock_Y`
const getId = () => random()

/**
 * Provides a fast mutual exclusion algorithm, synchronized using cookies.
 * Based on http://lamport.azurewebsites.net/pubs/fast-mutex.pdf
 * @param {Number} [expiry=10000] Max time in ms before the lock will expire. Note: The function can't take longer than this.
 * @param {Number} [spinTimeout=20] The time in ms before with how long the retry should spin. Note: This will be randomized to prevent starving.
 * @param {String} id The id of mutex contender. Must be unique.
 * @param {Function} [keyX] The name to give to the key X
 * @param {Function} [keyY] The name to give to the key Y
 * @param {{get:function,set:function,remove:function}} storage The storage mechanism. Must provide get, set, and remove functionality.
 * @returns {Promise<{lock: lock, unlock: (function(String): Promise<any>)}>}
 */
export default ({ expiry = 10000, spinTimeout = 20, id = getId(), keyX = defaultKeyX, keyY = defaultKeyY, storage } = {}) => {
    if (!storage.set || !storage.get || !storage.remove) {
        throw new Error('Storage requires set and get.')
    }
    if (!id) {
        throw new Error('Requires unique id.')
    }

    const randomSpin = () => (Math.round(Math.random() * spinTimeout))

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
            const X = keyX(name)
            const Y = keyY(name)
            let attempts = -1

            // eslint-disable-next-line no-constant-condition
            while (true) {
                ++attempts

                storage.set(X, id)

                await raf()
                await delay(randomSpin())

                const y = storage.get(Y)
                if (y) {
                    await raf()
                    await delay(randomSpin())
                    continue
                }

                storage.set(Y, id, expiry)

                await raf()
                await delay(randomSpin())

                const x = storage.get(X)
                if (x !== id) {
                    await raf()
                    await delay(randomSpin())

                    const y2 = storage.get(Y)
                    if (y2 !== id) {
                        await raf()
                        await delay(randomSpin())
                        continue
                    }
                }

                return attempts
            }
        },

        /**
         * Release the lock.
         * @param {String} name
         * @returns {Promise} that resolves when the lock has been released.
         */
        unlock: async (name) => {
            const Y = keyY(name)
            storage.remove(Y)
        }
    }
}

