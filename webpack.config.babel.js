import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin'

const { version } = require('./package.json');
const dllManifest = require('./manifest.json');

export default function (env) {

    const isDev = env == 'development';
    const outputPath = path.join(__dirname, 'dist');
    const publicPath = `${version}/`;
    const jsPath = publicPath+'js/[name]_[hash].js';
    const cssPath = publicPath+'css/[name]_[hash].css';
    const imagePath = publicPath+'images/[name]_[hash].[ext]';

    const commonConfig = {
        entry: {
            app: './src/index.js'
        },
        output: {
            path: outputPath,
            filename: publicPath+'[name]_[hash].js',
            chunkFilename: jsPath,
            publicPath: ''
        },
        cache:true,
        module: {
            noParse: /node_modules\/(jquey|moment|chart\.js)/,
            loaders: [{
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: ['babel-loader'],
            },{
                test: /\.(jpg|png|svg)$/,
                loader: "url-loader?limit=5000&name="+imagePath,
            },{
                test: /\.(sass|scss|css|less)$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader']
                }),
            },{
                test: /\/src\/routes\/([^\/]+\/?[^\/]+).js$/,
                loader: ['bundle-loader?lazy&name=[name]','babel-loader']
            },]
        },
        resolve: {
            modules: [path.resolve(__dirname, 'node_modules')]
        },
        plugins: [
            new ExtractTextPlugin(cssPath),
            new webpack.NoEmitOnErrorsPlugin(),
            new HtmlWebpackPlugin({
                dll: `${dllManifest.name}.js`,
                template: './index.html',
                filename: './index.html',
                cache: true
            }),
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require('./manifest.json')
            }) //提升访问速度
        ]
    };

    if (env == 'development') {
        const devConfig = {
            devtool: 'inline-source-map',
            devServer: {
                contentBase:'./dist',
                hot: true,
                host: "0.0.0.0",
                port: 3001,
                stats: {
                    chunks:false
                },
                proxy: {
                    "/rpc": {
                        target: "http://rmc.ruijie.com.cn/relax/test-33"//172.17.189.18
                    }
                }
            },
            plugins: [
                new webpack.HotModuleReplacementPlugin(),
                new webpack.NamedModulesPlugin(), // 更新组件时在控制台输出组件的路径而不是数字ID，用在开发模式
            ]
        };
        return Object.assign(
            {},
            commonConfig,
            devConfig,
            {
                plugins: commonConfig.plugins.concat(devConfig.plugins),
            }
        )
    }else  {
        const disConfig = {
            plugins: [
                new webpack.optimize.UglifyJsPlugin({
                    compress:{
                        warnings: false,
                        drop_debugger: true,
                        drop_console: true
                    }
                }),
                new webpack.HashedModuleIdsPlugin(), // 用在生产模式
            ]
        };
        return Object.assign(
            {},
            commonConfig,
            disConfig,
            {
                plugins: commonConfig.plugins.concat(disConfig.plugins),
            }
        )
    }
}
