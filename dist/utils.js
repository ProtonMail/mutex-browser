export const delay = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));
export const raf = () => new Promise((resolve) => window.requestAnimationFrame(resolve));
export const random = () => Math.floor((1 + Math.random()) * 0x10000000)
    .toString(16)
    .substring(1);
