import { createCookieMutex, createIndexedDbMutex } from '../src/index'
import { delay } from '../src/utils'

const reset = async (el, mutex, mutexName) => {
    mutex.unlock(mutexName)
    el.innerHTML = ''
}

const lock = async (el, mutex, mutexName) => {
    el.innerHTML = 'waiting for lock'
    el.style.background = '#ff0000'

    await mutex.lock(mutexName)

    el.innerHTML = 'has lock'
    el.style.background = '#00ff00'

    // Doing work for 500ms.
    await delay(500)

    el.innerHTML = 'unlocking'

    await mutex.unlock(mutexName)

    el.style.background = '#eee'
    el.innerHTML = 'unlocked'
}

document.body.innerHTML = `
    <button id="cookieMutex">Acquire cookie mutex</button>
    <button id="indexeddbMutex">Acquire IndexedDB mutex</button>
    <button id="reset">Reset</button>
    <div id="result"></div>
`

const div = document.body.querySelector('#result')
const cookieButton = document.body.querySelector('#cookieMutex')
const indexeddbButton = document.body.querySelector('#indexeddbMutex')
const resetButton = document.body.querySelector('#reset')

const cookieMutex = createCookieMutex()
const indexeddbMutex = createIndexedDbMutex()
const mutexName = 'body'

cookieButton.addEventListener('click', (event) => {
    event.preventDefault()
    lock(div, cookieMutex, mutexName)
})

indexeddbButton.addEventListener('click', (event) => {
    event.preventDefault()
    lock(div, indexeddbMutex, mutexName)
})

resetButton.addEventListener('click', (event) => {
    event.preventDefault()
    reset(div, cookieMutex, mutexName)
    reset(div, indexeddbMutex, mutexName)
})
