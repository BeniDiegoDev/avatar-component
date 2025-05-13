// babel.config.cjs
module.exports = {
    presets: [
        ['@babel/preset-env', {
            targets: { node: 'current' },
            modules: 'commonjs'
        }],
        '@babel/preset-typescript'
    ],
    plugins: [
        ['@babel/plugin-proposal-decorators',   { legacy: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        // 👉 nouveau plugin pour méthodes privées
        ['@babel/plugin-proposal-private-methods', { loose: true }]
    ]
};
