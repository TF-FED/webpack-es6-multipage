var path = require('path');
var glob = require('glob');
var fs = require('fs');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';
var Entry = require('./getEntry.js');

var entries = Entry.getEntry('src/**/*.js', 'src/');
for (var key in entries) {
    entries[key] = [hotMiddlewareScript, entries[key]];
}
var devConfig = {
    devtool: 'source-map',
    entry: entries,
    output: {
        path: path.join(__dirname, '../dist/'),
        filename: 'build/[name]/index.js',
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
                fallback: "style-loader",
                use: [{
                    loader: 'css-loader',
                    options: {
                        sourceMap: true
                    }
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
                    loader: 'less-loader',
                    options: {
                        sourceMap: true
                    }
                }]
            }),
            exclude: /node_modules/
        }, {
            test: /\.(png|jpg)$/,
            use: 'url-loader?limit=8&name=[path][name].[ext]'
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
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin('build/[name]/index.css'),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons'
        })
    ]
};

var pages = Object.keys(Entry.getViewEntry('views/*.html'));
pages.forEach(function(pathname) {
    var conf = {
        template: 'ejs-render-loader!views/' + pathname + '.html', //html模板路径
        inject: false, //js插入的位置，true/'head'/'body'/false
        filename: pathname + '.html'
    };
    if (pathname in devConfig.entry) {
        conf.inject = 'body';
        conf.chunks = ['commons',pathname];
    }
    devConfig.plugins.push(new HtmlWebpackPlugin(conf));
});

module.exports = devConfig;
