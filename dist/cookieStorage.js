/**
 * Create a cookie storage helper.
 */
export default () => {
    const setCookie = (key, value, extra = '') => {
        document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}${extra}`;
    };
    const getCookies = () => {
        return decodeURIComponent(document.cookie)
            .split(';')
            .map((c) => c.split('=').map((c) => c.trim()));
    };
    const expires = (ms) => {
        const d = new Date();
        d.setTime(d.getTime() + ms);
        return `;expires=${d.toUTCString()}`;
    };
    const get = (key) => {
        const cookies = getCookies();
        for (let i = 0; i < cookies.length; ++i) {
            const cookie = cookies[i];
            if (cookie[0] === key) {
                return cookie[1];
            }
        }
    };
    const set = (key, value, expiryMs) => {
        setCookie(key, value, expiryMs ? expires(expiryMs) : undefined);
        // Get cookie to ensure it is set.
        return get(key);
    };
    const remove = (key) => {
        setCookie(key, '', expires(0));
        return get(key);
    };
    return {
        get,
        set,
        remove,
    };
};
