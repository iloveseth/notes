'use strict';
const _ = require('lodash');
const async = require('async');
const childProcess = require('child_process');
const path = require('path');
const fs = require('fs');
function onBuildFinish(options, callback) {
    if (options.platform != 'web-mobile') {
        //不是webmobile打包完的， 那我不理你
        callback();
    } else {
        // process.env.PATH = process.env.PATH + ':/usr/local/bin';
        async.waterfall([
            function (anext) {
                //html
                Editor.log('压缩image');
                let cmd = 'gulp imagemin --cwd ' + options.dest;
                childProcess.exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        Editor.log(' 压缩image 失败 ' + err);
                    }
                    anext(err);
                });
            },
        ], function (err) {
            callback(err);
        });
    }
}

module.exports = {
    load() {
        // execute when package loaded
        Editor.Builder.on('build-finished', onBuildFinish);
    },

    unload() {
        // execute when package unloaded
        Editor.Builder.removeListener('build-finished', onBuildFinish);
    },
};