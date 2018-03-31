var path = require('path'),
    webpack = require('webpack'),
    // Bind join to the current path. You can change it:
    // path.join.bind(path, __dirname, 'app').
    join = path.join.bind(path, __dirname);

module.exports = function () {
    return {
        entry: {
            vendor: [
                'echarts/lib/echarts',
                'moment',
                'prop-types',
                'rc-progress',
                'react',
                'react-cookie',
                'react-dom',
                'react-keyframes',
                'react-quill',
                'react-router-dom',
                'react-title-component',
                'react-toastify',
                'react-touch-events',
                'react-weui',
            ]
        },
        output: {
            path: path.join(__dirname, 'dist'),
            filename: '[name]_[hash].js',
            //命名空间
            library: '[name]_[hash]', //与DllPlugin的name参数保持一致
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress:{
                    warnings: false,
                    drop_debugger: true,
                    drop_console: true
                }
            }),
            new webpack.DllPlugin({
                path: './manifest.json',
                name: '[name]_[hash]',
                context: __dirname,
            }),
        ],
        resolve: {
            modules: ['node_modules']
        }
    }
}