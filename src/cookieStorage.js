/**
 * Create a cookie storage helper.
 * @returns {Object}
 */
export default () => {
    const set = (key, value, extra = '') => {
        document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}${extra}`
    }

    const get = () => {
        return decodeURIComponent(document.cookie).split(';').map((c) => c.split('=').map(c => c.trim()))
    }

    const expires = (ms) => {
        const d = new Date()
        d.setTime(d.getTime() + ms)
        return `;expires=${d.toUTCString()}`
    }

    return {
        get: (key) => {
            const cookies = get()
            for (let i = 0; i < cookies.length; ++i) {
                const cookie = cookies[i]
                if (cookie[0] === key) {
                    return cookie[1]
                }
            }
        },
        set: (key, value, expiryMs) => {
            set(key, value, expires ? expires(expiryMs) : undefined)
            // Get cookie to ensure it is set.
            return get(key)
        },
        remove: (key) => {
            set(key, '', expires(0))
            return get(key)
        }
    }
}
