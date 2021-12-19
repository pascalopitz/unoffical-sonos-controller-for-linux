const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = [
    {
        name: 'main',
        mode: 'production',
        devtool: 'inline-source-map',

        output: {
            path: path.resolve(__dirname, 'app/'),
        },

        entry: {
            main: {
                import: './src/main/main.js',
                filename: 'main.js',
            },
            localMusicServer: {
                import: './src/localMusic/server.js',
                filename: 'server.js',
            },
            localMusicDb: {
                import: './src/localMusic/db.js',
                filename: 'db.js',
            },
        },

        target: 'electron-main',
        externals: [
            nodeExternals({
                modulesFromFile: {
                    fileName: path.resolve(__dirname, 'app/package.json'),
                },
            }),
        ],

        resolve: {
            extensions: ['.js', '.jsx', '.json'],
            modules: [path.resolve(__dirname, 'app/node_modules')],
        },

        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: [/app\/node_modules/, /node_modules/],
                    use: {
                        loader: 'babel-loader',
                    },
                },
            ],
        },
    },
    {
        name: 'preload',
        mode: 'production',
        devtool: 'inline-source-map',
        entry: './src/preload/preload.js',
        output: {
            filename: 'preload.js',
            path: path.resolve(__dirname, 'app/'),
        },

        target: 'electron-preload',
        externals: [
            nodeExternals({
                modulesFromFile: {
                    fileName: path.resolve(__dirname, 'app/package.json'),
                },
            }),
        ],

        resolve: {
            extensions: ['.js', '.jsx'],
            modules: [path.resolve(__dirname, 'app/node_modules')],
        },

        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /(\.\/node_modules|\.\/app\/node_modules)/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
            ],
        },
    },
    {
        name: 'ui',
        mode: 'production',
        devtool: 'inline-source-map',
        entry: './src/ui/app.js',
        output: {
            filename: 'ui.js',
            path: path.resolve(__dirname, 'app/'),
        },

        target: 'electron-renderer',

        resolve: {
            extensions: ['.js', '.jsx'],
            modules: [path.resolve(__dirname, 'app/node_modules')],
        },

        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
            ],
        },
    },
];
