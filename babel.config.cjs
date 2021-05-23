
const env = process.env.BABEL_ENV || 'esm';

module.exports = {
    targets: {
        browsers: [
            'node 12.13', // Support Node v12.13 LTS (Erbium) and higher
            'last 2 Chrome versions',
            'last 2 Firefox versions',
            'last 2 Safari versions',
            'last 2 Edge versions',
            '>0.1%',
            'not dead',
            'not OperaMini all',
            'not IE > 0',
        ],
    },
    presets: [
        '@babel/typescript',
        '@babel/react',
        ['@babel/env', {
            // Whether to transpile modules
            modules: env === 'cjs' ? 'commonjs' : false,
            
            // Do not include polyfills automatically. Leave it up to the consumer to include the right polyfills
            // for their required environment.
            useBuiltIns: false,
            
            exclude: [
                // Do not transpile generators (saves us from needing a polyfill)
                'transform-regenerator',
            ],
        }],
    ],
    plugins: [
        ['transform-builtin-extend', {
            // See: http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work
            globals: ['Error'],
        }],
    ],
    sourceMaps: 'inline',
};
