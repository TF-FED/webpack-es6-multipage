var path = require('path');
var glob = require('glob');
var fs = require('fs');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CleanWebpackPlugin = require('clean-webpack-plugin');
var Entry = require('./getEntry.js');

var entries = Entry.getEntry('src/**/*.js', 'src/');
var proConfig = {
    entry: entries,
    output: {
        path: path.join(__dirname, '../dist/'),
        filename: 'build/[name]/index-[hash].js',
        publicPath: '/'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['es2015']
                }
            }
        }, {
            test: /\.less$/,
            use: ExtractTextPlugin.extract({
                use: [{
                    loader: 'css-loader'
                }, {
                    loader: 'postcss-loader',
                    options: {
                        plugins: function() {
                            return [
                                require('autoprefixer')({ broswers: ["> 1%", "last 2 versions"] })
                            ];
                        }
                    }
                }, {
                    loader: 'less-loader'
                }]
            }),
            exclude: /node_modules/
        }, {
            test: /\.(png|jpg)$/,
            use: 'url-loader?limit=8182&name=[path][name].[ext]'
        },{
            test: /\.xtpl$/,
            loader: 'xtpl-loader'
        }]
    },
    resolve: {
        extensions: ['.js']
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new CleanWebpackPlugin(['dist'],{root: path.join(__dirname, '../')}),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin('build/[name]/index-[hash].css'),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons'
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false
            },
            mangle: {
                except: ['$', 'exports', 'require']
            }
        }),
        new webpack.NoErrorsPlugin()
    ]
};

var pages = Object.keys(Entry.getViewEntry('views/*.html'));
pages.forEach(function(pathname) {
    var conf = {
        template: 'ejs-render-loader!views/' + pathname + '.html', //html模板路径
        inject: false, //js插入的位置，true/'head'/'body'/false
        filename: pathname + '.html',
        minify: { //压缩HTML文件
            removeComments: true, //移除HTML中的注释
            collapseWhitespace: true, //删除空白符与换行符
            minifyJS: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
        }
    };
    if (pathname in proConfig.entry) {
        conf.inject = 'body';
        conf.chunks = ['commons', pathname];
    }
    proConfig.plugins.push(new HtmlWebpackPlugin(conf));
});

module.exports = proConfig;
