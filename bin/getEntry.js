var glob = require('glob');
var path = require('path');
var fs = require('fs');
function getEntry(globPath, pathDir) {
    var files = glob.sync(globPath);
    var entries = {},
        entry, dirname, pathname;
    for (var i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry);
        pathname = dirname.replace(new RegExp('^' + pathDir), '');
        entries[pathname] = ('./' + entry);
    }
    return entries;
}

function getViewEntry(globPath) {
    var files = glob.sync(globPath);
    var entries = {},
        entry, dirname, pathname;
    for (var i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry);
        pathname = entry.replace(new RegExp('^' + dirname + '/'), '').replace(new RegExp('.html'), '');
        entries[pathname] = ('./' + entry);
    }
    return entries;
}

module.exports = {
    getEntry: getEntry,
    getViewEntry: getViewEntry
}