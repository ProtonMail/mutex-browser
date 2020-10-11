process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config) => {
    config.set({
        basePath: '.',
        frameworks: ['jasmine'],
        client: {
            jasmine: {
                random: true,
                stopOnFailure: true,
                failFast: true,
                timeoutInterval: 10000,
            },
        },
        files: ['test/**/*.spec.js'],
        preprocessors: {
            'test/**/*.spec.js': ['rollup'],
        },
        rollupPreprocessor: {
            output: {
                format: 'iife',
                name: 'MutexTest',
                sourcemap: 'inline',
            },
        },
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['ChromeHeadless'],
        singleRun: true,
    });
};
