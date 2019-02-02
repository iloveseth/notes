'use strict';
const _ = require('lodash');
const async = require('async');
const childProcess = require('child_process');
const path = require('path');
const fs = require('fs');
function onBuildFinish(options, callback) {
    // callback();
    // return;
    if (options.platform != 'ios') {
        //不是ios打包完的， 那我不理你
        callback();
    } else {
        process.env.PATH = process.env.PATH + ':/usr/local/bin';
        let targetPath = path.join(__dirname, '../../../proj-ios');
        async.waterfall([
            function (anext) {
                //先把原来的删掉吧
                Editor.log('删除原来的项目');
                childProcess.exec('rm -rf ' + targetPath, function (err, stdout, stderr) {
                    if (err) {
                        Editor.log(' 删除原来的项目错误 ' + stderr);
                    }
                    anext(err);
                });
            },
            function (anext) {
                //拷贝模版项目 不同项目可能要改地址哦
                Editor.log('拷贝模版项目');
                let sourcePath = path.join(__dirname, '../../../client-ios');
                let cmd = 'cp -r ' + sourcePath + ' ' + targetPath;
                childProcess.exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        Editor.log(' 拷贝模版xcode项目错误 ' + stderr);
                    }
                    anext(err);
                });
            },
            function (anext) {
                //修改打包密钥
                Editor.log('修改Appdelegate.cpp中的密钥');
                let appDelegatePath = path.join(targetPath, 'jsb-default/frameworks/runtime-src/Classes/AppDelegate.cpp');    // 获取发布目录下的 main.js 所在路径
                let script = fs.readFileSync(appDelegatePath, 'utf8');       // 读取构建好的 appdelegate.cpp
                let key = _.get(options, 'xxteaKey', '');
                let targetStr = 'jsb_set_xxtea_key("' + key + '");'
                Editor.log(' 新的密钥代码 ' + targetStr);
                script = script.replace(/jsb_set_xxtea_key\(\"[-a-zA-Z0-9]*\"\);/, targetStr);
                fs.writeFileSync(appDelegatePath, script);
                anext();
            },
            function (anext) {
                //修改main.js
                Editor.log('修改main.js');
                let mainJsPath = path.join(options.dest, 'main.js');    // 获取发布目录下的 main.js 所在路径
                let script = fs.readFileSync(mainJsPath, 'utf8');       // 读取构建好的 main.js
                let str = '';
                str += '\n';                                         // 添加一点脚本到
                str += 'if (cc.sys.isNative) { \n';
                str += '    var hotUpdateSearchPaths = cc.sys.localStorage.getItem(\'HotUpdateSearchPaths\'); \n';
                str += '    if (hotUpdateSearchPaths) { \n';
                str += '        jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths)); \n';
                str += '    }} \n';
                str += script;
                fs.writeFileSync(mainJsPath, str);
                anext();
            },
            function (anext) {
                //压缩图片
                Editor.log('压缩图片');
                let cmd = 'gulp imagemin --cwd ' + options.dest;
                childProcess.exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        Editor.log(' 压缩图片失败 ' + err);
                    }
                    anext(err);
                });
            },
            function (anext) {
                //拷贝src
                Editor.log('拷贝src');
                let sourcePath = path.join(options.dest, 'src');
                let destPath = path.join(targetPath, 'jsb-default');
                let cmd = 'cp -r ' + sourcePath + ' ' + destPath;
                childProcess.exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        Editor.log(' 拷贝src目录项目错误 ' + err);
                    }
                    anext(err);
                });
            },
            function (anext) {
                //拷贝res
                Editor.log('拷贝res');
                let sourcePath = path.join(options.dest, 'res');
                let destPath = path.join(targetPath, 'jsb-default');
                let cmd = 'cp -r ' + sourcePath + ' ' + destPath;
                childProcess.exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        Editor.log(' 拷贝res目录项目错误 ' + err);
                    }
                    anext(err);
                });
            },
            function (anext) {
                //拷贝main.js
                Editor.log('拷贝main.js');
                let sourcePath = path.join(options.dest, 'main.js');
                let destPath = path.join(targetPath, 'jsb-default/');
                let cmd = 'cp ' + sourcePath + ' ' + destPath;
                childProcess.exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        Editor.log(' 拷贝 main.js 错误 ' + err);
                    }
                    anext(err);
                });
            },
            function (anext) {
                //拷贝project.json
                Editor.log('拷贝project.json');
                let sourcePath = path.join(options.dest, 'project.json');
                let destPath = path.join(targetPath, 'jsb-default/');
                let cmd = 'cp ' + sourcePath + ' ' + destPath;
                childProcess.exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        Editor.log(' 拷贝 project.json 错误 ' + err);
                    }
                    anext(err);
                });
            },
            function (anext) {
                //修改project.json 讲fps 改为false
                Editor.log('修改project.json');
                let projDir = path.join(targetPath, 'jsb-default/');
                let projPath = path.join(projDir, 'project.json');    
                Editor.log('projPath', projPath);
                let jsonContent = fs.readFileSync(projPath, 'utf8');
                Editor.log('jsonContent', jsonContent);
                jsonContent = JSON.parse(jsonContent);
                jsonContent.showFPS = false;
                // jsonContent.debugMode = 0;
                fs.writeFileSync(projPath, JSON.stringify(jsonContent));
                anext();
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