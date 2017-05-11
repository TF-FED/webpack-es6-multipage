var express = require('express');
var path = require('path');
var fs = require('fs');
var webpackMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var webpack = require("webpack");
var ejs = require('ejs');
var app = module.exports = express();

app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname + 'static')));
app.set('view engine', 'html');

var handleHtml = {
    compileEjs: function(filePath) {
        var content = fs.readFileSync(filePath);
        return ejs.render(content.toString(), {
            filename: filePath
        });
    },
    parsePath: function(filePath) {
        try {
            return this.compileEjs(filePath);
        } catch (e) {
            return e.message;
        }
    },
    do: function(fixPath) {
        var self = this;
        return function(req, res) {
            var filePath = __dirname + (fixPath || '') + req.path;
            fs.stat(filePath, function(err, stats) {
                if (err || !stats.isFile()) {
                    //@note 没有文件
                    res.end("page is not found");
                } else {
                    //@note 读取该文件
                    res.end(self.parsePath(filePath));
                }
            });
        }
    }
};
//webpack编译
var webpackConfig = require('./bin/webpack.dev.config.js');
var compiler = webpack(webpackConfig);
app.use(webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    noInfo: true,
    stats: {
        colors: true,
        chunks: false,
        children: false,
        hash: false,
        assets: false,
        version: false,
        time: false
    }
}));

var hotMiddleware = webpackHotMiddleware(compiler);
app.use(hotMiddleware);
//路由
app.get('/', function(req, res) {
    res.redirect('/users.html');
});
app.get('/*.html', handleHtml.do('/views/'));

if (!module.parent) {
    app.listen(3000);
    console.log('Express started on port 3000');
}
