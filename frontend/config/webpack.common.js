const webpack = require('webpack');
const helpers = require('./helpers');

const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ngcWebpack = require('ngc-webpack');

const HMR = helpers.hasProcessFlag('hot');
const AOT = helpers.hasFlag('aot');
const METADATA = {
    title: 'Bookiez',
    baseUrl: '/',
    isDevServer: helpers.isWebpackDevServer()
};

module.exports = function (options) {
    isProd = options.env === 'production';
    return {
        //Entry point of app
        entry: {
            'polyfills': './src/polyfills.browser.ts',
            'main': AOT ? './src/main.browser.aot.ts' :
                './src/main.browser.ts'
        },
        resolve: {
            extensions: ['.ts', '.js', '.json'],
            modules: [helpers.root('src'), helpers.root('node_modules')],
        },
        module: {
            rules: [
                //Typescript
                {
                    test: /\.ts$/,
                    use: [
                        '@angularclass/hmr-loader?pretty=' + !isProd + '&prod=' + isProd,
                        'awesome-typescript-loader?{configFileName: "tsconfig.webpack.json"}',
                        'angular2-template-loader',
                        {
                            loader: 'ng-router-loader',
                            options: {
                                loader: 'async-system',
                                genDir: 'compiled',
                                aot: AOT
                            }
                        }
                    ],
                    exclude: [/\.(spec|e2e)\.ts$/]
                },
                {
                    test: /\.json$/,
                    use: 'json-loader'
                },
                {
                    test: /\.css$/,
                    use: ['to-string-loader', 'css-loader'],
                    exclude: [helpers.root('src', 'styles')]
                },
                {
                    test: /\.html$/,
                    use: 'raw-loader',
                    exclude: [helpers.root('src/index.html')]
                }
            ]
        },
        plugins: [
            new CheckerPlugin(),
            new HtmlWebpackPlugin({
                template: 'src/index.html',
                title: METADATA.title,
                chunksSortMode: 'dependency',
                metadata: METADATA,
                inject: 'head'
            }),
            new CommonsChunkPlugin({
                name: 'polyfills',
                chunks: ['polyfills']
            }),
            // This enables tree shaking of the vendor modules
            new CommonsChunkPlugin({
                name: 'vendor',
                chunks: ['main'],
                minChunks: module => /node_modules\//.test(module.resource)
            }),
            // Specify the correct order the scripts will be injected in
            new CommonsChunkPlugin({
                name: ['polyfills', 'vendor'].reverse()
            }),
            // Fix Angular 2
            new NormalModuleReplacementPlugin(
                /facade(\\|\/)async/,
                helpers.root('node_modules/@angular/core/src/facade/async.js')
            ),
            new NormalModuleReplacementPlugin(
                /facade(\\|\/)collection/,
                helpers.root('node_modules/@angular/core/src/facade/collection.js')
            ),
            new NormalModuleReplacementPlugin(
                /facade(\\|\/)errors/,
                helpers.root('node_modules/@angular/core/src/facade/errors.js')
            ),
            new NormalModuleReplacementPlugin(
                /facade(\\|\/)lang/,
                helpers.root('node_modules/@angular/core/src/facade/lang.js')
            ),
            new NormalModuleReplacementPlugin(
                /facade(\\|\/)math/,
                helpers.root('node_modules/@angular/core/src/facade/math.js')
            ),
            new webpack.ContextReplacementPlugin(
                // The (\\|\/) piece accounts for path separators in *nix and Windows
                /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
                helpers.root('src'), // location of your src
                {} // a map of your routes 
            ),
            new ngcWebpack.NgcWebpackPlugin({
                disabled: !AOT,
                tsConfig: helpers.root('tsconfig.webpack.json'),
                resourceOverride: helpers.root('config/resource-override.js')
            })
        ]
    };
}