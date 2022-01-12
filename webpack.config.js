
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
module.exports = {
    entry: {
        index:'./src/index.js',
        select:'./src/component.js'
    },
    output:{
        path: path.resolve(__dirname, 'dist'),
        filename:'[name].js',
    },
    devtool: 'source-map',
    module:{
        rules:[
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|build)/,
                use:{
                    loader:'babel-loader'
                }
            },
            {
                test: /(.scss|.css)$/,
                use: [
                    MiniCssExtractPlugin.loader,

                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
        ]
    },
    devServer:{
        host: '0.0.0.0',
        port: 8082,
        contentBase: path.join(__dirname, 'dist'),
        watchOptions: {
            hot: true,
            watchContentBase: true,
            poll: true
        }
    },
    plugins:[
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({template:'./src/index.html'})
    ]
}
