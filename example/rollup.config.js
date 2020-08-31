import serve from 'rollup-plugin-serve';

export default [
    {
        input: 'buttons.js',
        output: {
            name: 'buttons',
            file: 'dist/buttons.js',
            format: 'iife',
            interop: false,
            strict: false,
        },
    },
    {
        input: 'iframe.js',
        output: {
            name: 'iframeLoop',
            file: 'dist/iframe.js',
            format: 'iife',
            interop: false,
            strict: false,
        },
    },
    {
        input: 'mutexLoop.js',
        output: {
            name: 'IDBLoop',
            file: 'dist/mutexLoop.js',
            format: 'iife',
            interop: false,
            strict: false,
        },
        plugins: [
            serve({
                port: 11001,
                contentBase: '',
            }),
        ],
    },
];
