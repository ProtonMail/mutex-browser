# mutex-browser

This library provides mutual exclusion functionality for the browser. It supports two methods:
1) Synchronizing mutex through the fast-mutex algorithm backed by cookie storage.
2) Synchronizing mutex through the transactional guarantees of IndexedDB.

The mutex backed by a cookie storage can be useful where IndexedDB or localStorage can not be used, for instance through cross-domain cross-window synchronization. For a single domain where IndexedDB can be used, the second method is recommended.

The library requires the support of Promises, async/await, modules, and cookies or IndexedDB.

## Browser support
Chrome, Safari, Firefox, Edge, IE11

## Usage

```javascript
import { createIndexedDbMutex, createCookieMutex } from 'mutex-browser'

const options = {
    expiry: 1000
};
const mutex = createCookieMutex(options) or createIndexedDbMutex(options)

const synchronized = async () => {
    await mutex.lock('name')
    // perform work
    await mutex.unlock('name')
}
```

## Default Options

```javascript
{
    expiry: 10000 // Max time in ms before the lock will expire. Note: The function can't take longer than this.
    spinTimeout: 20 // The time in ms before with how long the retry should spin. Note: This will be randomized to prevent starving.
    id: 'random-uid' // The id of mutex contender. Must be unique.

    // for the cookie lock
    keyX: (name) => `${name}_lock_x` // A function for the name to give to the key X
    keyY: (name) => `${name}_lock_y` // A function for the name to give to the key Y

    // for the IndexedDB lock
    objectStoreName: 'mutex' // The name of the IndexedDB store.
    dbName: 'mutex' // The name of the IndexedDB database.
}
```

## Example

Example available in the example/ folder

## Credits

IndexedDB lock based on the work of Robert Knight https://github.com/robertknight/idb-mutex.

## Author

Mattias Svanström (@mmso) - ProtonMail
