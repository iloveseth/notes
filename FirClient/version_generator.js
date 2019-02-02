const _ = require('lodash');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

const ManifestTemplate = {
    1: { //外网典游
        packageUrl: 'https://dianyou-bh-cdn.giantfun.cn/dyguajihotupdate/remote-assets/',
        remoteManifestUrl: 'http://dianyou-bh-resources.giantfun.cn/dyguajihotupdate/remote-assets/project.manifest',
        remoteVersionUrl: 'http://dianyou-bh-resources.giantfun.cn/dyguajihotupdate/remote-assets/version.manifest',
        version: '0.1.0',
        assets: {},
        searchPaths: []
    },
    6: {//Quick SDK
        packageUrl: 'http://quick-bh-resources.giantfun.cn/quickguajihotupdate/',
        remoteManifestUrl: 'http://quick-bh-resources.giantfun.cn/quickguajihotupdate/project.manifest',
        remoteVersionUrl: 'http://quick-bh-resources.giantfun.cn/quickguajihotupdate/version.manifest',
        version: '0.1.0',
        assets: {},
        searchPaths: []
    }
}

let manifest = {
    packageUrl: 'http://192.168.30.1:80/guaji-hot-update/remote-assets/',
    remoteManifestUrl: 'http://192.168.30.1:80/guaji-hot-update/remote-assets/project.manifest',
    remoteVersionUrl: 'http://192.168.30.1:80/guaji-hot-update/remote-assets/version.manifest',
    version: '0.1.0',
    assets: {},
    searchPaths: []
};

//先找渠道
for (let i = 0; i < process.argv.length; i++) {
    let arg = process.argv[i];
    if (arg == '--bundle' || arg == '-b') {
        let bundle = parseInt(_.get(process, ['argv', i + 1], 0));
        let result = _.get(ManifestTemplate, bundle, null);
        if (result != null) {
            manifest = result;
        }
    }
}

var dest = './remote-assets/';
var src = './jsb/';

// Parse arguments
var i = 2;
while (i < process.argv.length) {
    var arg = process.argv[i];

    switch (arg) {
        case '--url':
        case '-u':
            var url = process.argv[i + 1];
            // manifest.packageUrl = url;
            manifest.packageUrl = manifest.packageUrl;
            manifest.remoteManifestUrl = url + 'project.manifest';
            manifest.remoteVersionUrl = url + 'version.manifest';
            i += 2;
            break;
        case '--version':
        case '-v':
            manifest.version = process.argv[i + 1];
            i += 2;
            break;
        case '--src':
        case '-s':
            src = process.argv[i + 1];
            i += 2;
            break;
        case '--dest':
        case '-d':
            dest = process.argv[i + 1];
            i += 2;
            break;
        default:
            i++;
            break;
    }
}


function readDir(dir, obj) {
    var stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        return;
    }
    var subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
    for (var i = 0; i < subpaths.length; ++i) {
        if (subpaths[i][0] === '.') {
            continue;
        }
        subpath = path.join(dir, subpaths[i]);
        stat = fs.statSync(subpath);
        if (stat.isDirectory()) {
            readDir(subpath, obj);
        }
        else if (stat.isFile()) {
            // Size in Bytes
            size = stat['size'];
            // md5 = crypto.createHash('md5').update(fs.readFileSync(subpath, 'binary')).digest('hex');
            md5 = crypto.createHash('md5').update(fs.readFileSync(subpath)).digest('hex');
            compressed = path.extname(subpath).toLowerCase() === '.zip';

            relative = path.relative(src, subpath);
            relative = relative.replace(/\\/g, '/');
            relative = encodeURI(relative);
            obj[relative] = {
                'size': size,
                'md5': md5
            };
            if (compressed) {
                obj[relative].compressed = true;
            }
        }
    }
}

var mkdirSync = function (path) {
    try {
        fs.mkdirSync(path);
    } catch (e) {
        if (e.code != 'EEXIST') throw e;
    }
}

// Iterate res and src folder
readDir(path.join(src, 'src'), manifest.assets);
readDir(path.join(src, 'res'), manifest.assets);

var destManifest = path.join(dest, 'project.manifest');
var destVersion = path.join(dest, 'version.manifest');

mkdirSync(dest);

fs.writeFile(destManifest, JSON.stringify(manifest), (err) => {
    if (err) throw err;
    console.log('Manifest successfully generated');
});

delete manifest.assets;
delete manifest.searchPaths;
fs.writeFile(destVersion, JSON.stringify(manifest), (err) => {
    if (err) throw err;
    console.log('Version successfully generated');
});
