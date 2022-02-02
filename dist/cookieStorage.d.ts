declare const _default: () => {
    get: (key: string) => string | undefined;
    set: (key: string, value: string, expiryMs?: number | undefined) => string | undefined;
    remove: (key: string) => string | undefined;
};
/**
 * Create a cookie storage helper.
 */
export default _default;
