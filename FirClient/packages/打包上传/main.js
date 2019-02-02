'use strict';
var client = require('scp2');
var moment = require('moment');
var path = require('path');
var process = require('child_process');
var async = require('async');
var Client = require('ssh2').Client;
var rimraf = require('rimraf');
var dirZip = require('zip-dir');

module.exports = {
    load() {
        // execute when package loaded
    },

    unload() {
        // execute when package unloaded
    },

    // register your ipc messages here
    messages: {
        'packTest'() {
            async.waterfall([
                function (anext) {
                    Editor.log('开始删除旧版本 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let conn = new Client();
                    conn.on('ready', function () {
                        Editor.log('ssh 连接成功');

                        conn.exec('rm -rf /var/www/html/guajitest/*', function (err, stream) {
                            if (err) {
                                anext(err);
                            }
                            stream.on('close', function (code, signal) {
                                Editor.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                                conn.end();
                                anext();
                            }).on('data', function (data) {
                                Editor.log('STDOUT: ' + data);
                            }).stderr.on('data', function (data) {
                                Editor.log('STDERR: ' + data);
                            });
                        });
                    }).connect({
                        host: '210.73.214.68',
                        port: 22,
                        username: 'LiuKai',
                        password: 'Linanana456'
                    });
                },
                function (anext) {
                    //压缩
                    Editor.log('压缩打包好的内容 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourcePath = path.join(__dirname, '../../build/web-mobile');
                    let targetPath = path.join(__dirname, '../../build/web-mobile.zip');
                    dirZip(sourcePath, { saveTo: targetPath }, function (err, buffer) {
                        if (err) {
                            Editor.log('打包错误 ' + err);
                            anext(err);
                        } else {
                            Editor.log('打包成功 ');
                            anext();
                        }
                    });
                },
                function (anext) {
                    //上传压缩包
                    Editor.log('开始上传 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourceFile = path.join(__dirname, '../../build/web-mobile.zip');
                    Editor.log(sourceFile);
                    client.scp(sourceFile, {
                        host: '210.73.214.68',
                        username: 'LiuKai',
                        password: 'Linanana456',
                        path: '/var/www/html/guajitest/'
                    }, function (err) {
                        anext(err);
                    });
                },
                function (anext) {
                    //解压压缩包
                    Editor.log('开始解压 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let conn = new Client();
                    conn.on('ready', function () {
                        Editor.log('ssh 连接成功');
                        conn.exec('unzip -o -d /var/www/html/guajitest/ /var/www/html/guajitest/web-mobile.zip', function (err, stream) {
                            if (err) {
                                anext(err);
                            }
                            stream.on('close', function (code, signal) {
                                Editor.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                                conn.end();
                                anext();
                            }).on('data', function (data) {
                            }).stderr.on('data', function (data) {
                            });
                        });
                    }).connect({
                        host: '210.73.214.68',
                        port: 22,
                        username: 'LiuKai',
                        password: 'Linanana456'
                    });
                }
            ], function (err) {
                if (err) {
                    Editor.log('上传错误 ' + err);
                    return;
                }
                Editor.log('上传成功 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
            });
        },
        'uploadOutNormalTest'() {
            // open entry panel registered in package.json
            async.waterfall([
                function (anext) {
                    Editor.log('开始删除旧版本 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let conn = new Client();
                    conn.on('ready', function () {
                        Editor.log('ssh 连接成功');

                        conn.exec('rm -rf /var/www/html/guaji/*', function (err, stream) {
                            if (err) {
                                anext(err);
                            }
                            stream.on('close', function (code, signal) {
                                Editor.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                                conn.end();
                                anext();
                            }).on('data', function (data) {
                                Editor.log('STDOUT: ' + data);
                            }).stderr.on('data', function (data) {
                                Editor.log('STDERR: ' + data);
                            });
                        });
                    }).connect({
                        host: '210.73.214.68',
                        port: 22,
                        username: 'LiuKai',
                        password: 'Linanana456'
                    });
                },
                function (anext) {
                    //压缩
                    Editor.log('压缩打包好的内容 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourcePath = path.join(__dirname, '../../build/web-mobile');
                    let targetPath = path.join(__dirname, '../../build/web-mobile.zip');
                    dirZip(sourcePath, { saveTo: targetPath }, function (err, buffer) {
                        if (err) {
                            Editor.log('打包错误 ' + err);
                            anext(err);
                        } else {
                            Editor.log('打包成功 ');
                            anext();
                        }
                    });
                },
                function (anext) {
                    //上传压缩包
                    Editor.log('开始上传 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourceFile = path.join(__dirname, '../../build/web-mobile.zip');
                    Editor.log(sourceFile);
                    client.scp(sourceFile, {
                        host: '210.73.214.68',
                        username: 'LiuKai',
                        password: 'Linanana456',
                        path: '/var/www/html/guaji/'
                    }, function (err) {
                        anext(err);
                    });
                },
                function (anext) {
                    //解压压缩包
                    Editor.log('开始解压 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let conn = new Client();
                    conn.on('ready', function () {
                        Editor.log('ssh 连接成功');
                        conn.exec('unzip -o -d /var/www/html/guaji/ /var/www/html/guaji/web-mobile.zip', function (err, stream) {
                            if (err) {
                                anext(err);
                            }
                            stream.on('close', function (code, signal) {
                                Editor.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                                conn.end();
                                anext();
                            }).on('data', function (data) {
                                Editor.log('STDOUT: ' + data);
                            }).stderr.on('data', function (data) {
                                Editor.log('STDERR: ' + data);
                            });
                        });
                    }).connect({
                        host: '210.73.214.68',
                        port: 22,
                        username: 'LiuKai',
                        password: 'Linanana456'
                    });
                }
            ], function (err) {
                if (err) {
                    Editor.log('上传错误 ' + err);
                    return;
                }
                Editor.log('上传成功 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
            });
        },
        'uploadQzoneTest'() {
            async.waterfall([
                // function (anext) {
                //     Editor.log('开始删除旧版本 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                //     let conn = new Client();
                //     conn.on('ready', function () {
                //         Editor.log('ssh 连接成功');

                //         conn.exec('rm -rf /var/www/html/guajiqzone/*', function (err, stream) {
                //             if (err) {
                //                 anext(err);
                //             }
                //             stream.on('close', function (code, signal) {
                //                 Editor.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                //                 conn.end();
                //                 anext();
                //             }).on('data', function (data) {
                //                 Editor.log('STDOUT: ' + data);
                //             }).stderr.on('data', function (data) {
                //                 Editor.log('STDERR: ' + data);
                //             });
                //         });
                //     }).connect({
                //         host: '210.73.214.68',
                //         port: 22,
                //         username: 'LiuKai',
                //         password: 'Linanana456'
                //     });
                // },
                function (anext) {
                    //压缩
                    Editor.log('压缩打包好的内容 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourcePath = path.join(__dirname, '../../build/web-mobile');
                    let targetPath = path.join(__dirname, '../../build/web-mobile.zip');
                    dirZip(sourcePath, { saveTo: targetPath }, function (err, buffer) {
                        if (err) {
                            Editor.log('打包错误 ' + err);
                            anext(err);
                        } else {
                            Editor.log('打包成功 ');
                            anext();
                        }
                    });
                },
                // function (anext) {
                //     //上传压缩包
                //     Editor.log('开始上传 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                //     let sourceFile = path.join(__dirname, '../../build/web-mobile.zip');
                //     Editor.log(sourceFile);
                //     client.scp(sourceFile, {
                //         host: '210.73.214.68',
                //         username: 'LiuKai',
                //         password: 'Linanana456',
                //         path: '/var/www/html/guajiqzone/'
                //     }, function (err) {
                //         anext(err);
                //     });
                // },
                // function (anext) {
                //     //解压压缩包
                //     Editor.log('开始解压 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                //     let conn = new Client();
                //     conn.on('ready', function () {
                //         Editor.log('ssh 连接成功');
                //         conn.exec('unzip -o -d /var/www/html/guajiqzone/ /var/www/html/guajiqzone/web-mobile.zip', function (err, stream) {
                //             if (err) {
                //                 anext(err);
                //             }
                //             stream.on('close', function (code, signal) {
                //                 Editor.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                //                 conn.end();
                //                 anext();
                //             }).on('data', function (data) {
                //                 Editor.log('STDOUT: ' + data);
                //             }).stderr.on('data', function (data) {
                //                 Editor.log('STDERR: ' + data);
                //             });
                //         });
                //     }).connect({
                //         host: '210.73.214.68',
                //         port: 22,
                //         username: 'LiuKai',
                //         password: 'Linanana456'
                //     });
                // }
            ], function (err) {
                if (err) {
                    Editor.log('上传错误 ' + err);
                    return;
                }
                Editor.log('上传成功 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
            });
        },
        'uploadDyHotUpdateTest'() {
            async.waterfall([
                // function (anext) {
                //     Editor.log('开始删除旧版本 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                //     let conn = new Client();
                //     conn.on('ready', function () {
                //         Editor.log('ssh 连接成功');

                //         conn.exec('rm -rf /var/www/html/dyguajihotupdate/remote-assets/*', function (err, stream) {
                //             if (err) {
                //                 anext(err);
                //             }
                //             stream.on('close', function (code, signal) {
                //                 Editor.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                //                 conn.end();
                //                 anext();
                //             }).on('data', function (data) {
                //                 Editor.log('STDOUT: ' + data);
                //             }).stderr.on('data', function (data) {
                //                 Editor.log('STDERR: ' + data);
                //             });
                //         });
                //     }).connect({
                //         host: '210.73.214.68',
                //         port: 22,
                //         username: 'zhangmaodong',
                //         password: 'zhangqazwsx'
                //     });
                // },
                function (anext) {
                    //压缩
                    Editor.log('压缩打包好的内容 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourcePath = path.join(__dirname, '../../build/jsb-default/dyhotupdate');
                    let targetPath = path.join(__dirname, '../../build/jsb-default/dyhotupdate.zip');
                    dirZip(sourcePath, { saveTo: targetPath }, function (err, buffer) {
                        if (err) {
                            Editor.log('打包错误 ' + err);
                            anext(err);
                        } else {
                            Editor.log('打包成功 ');
                            anext();
                        }
                    });
                },
                function (anext) {
                    //上传压缩包
                    Editor.log('开始上传 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourceFile = path.join(__dirname, '../../build/jsb-default/dyhotupdate.zip');
                    Editor.log(sourceFile);
                    client.scp(sourceFile, {
                        host: '210.73.214.68',
                        username: 'zhangmaodong',
                        password: 'zhangqazwsx',
                        path: '/var/www/html/dyguajihotupdate/remote-assets/'
                    }, function (err) {
                        anext(err);
                    });
                },
                function (anext) {
                    //解压压缩包
                    Editor.log('开始解压 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let conn = new Client();
                    conn.on('ready', function () {
                        Editor.log('ssh 连接成功');
                        conn.exec('unzip -o -d /var/www/html/dyguajihotupdate/remote-assets/ /var/www/html/dyguajihotupdate/remote-assets/dyhotupdate.zip', function (err, stream) {
                            if (err) {
                                anext(err);
                            }
                            stream.on('close', function (code, signal) {
                                Editor.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                                conn.end();
                                anext();
                            }).on('data', function (data) {
                                Editor.log('STDOUT: ' + data);
                            }).stderr.on('data', function (data) {
                                Editor.log('STDERR: ' + data);
                            });
                        });
                    }).connect({
                        host: '210.73.214.68',
                        port: 22,
                        username: 'zhangmaodong',
                        password: 'zhangqazwsx'
                    });
                }
            ], function (err) {
                if (err) {
                    Editor.log('上传错误 ' + err);
                    return;
                }
                Editor.log('上传成功 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
            });
        },
        'uploadWechatRelease'() {
            async.waterfall([
                function (anext) {
                    Editor.log('开始删除旧版本 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let conn = new Client();
                    conn.on('ready', function () {
                        Editor.log('ssh 连接成功');

                        conn.exec('rm -rf /var/www/html/gongdou/*', function (err, stream) {
                            if (err) {
                                anext(err);
                            }
                            stream.on('close', function (code, signal) {
                                Editor.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                                conn.end();
                                anext();
                            }).on('data', function (data) {
                                Editor.log('STDOUT: ' + data);
                            }).stderr.on('data', function (data) {
                                Editor.log('STDERR: ' + data);
                            });
                        });


                    }).connect({
                        host: '210.73.214.75',
                        port: 22,
                        username: 'liuk',
                        password: 'UcxxAoxpnLGUj8hW'
                    });
                },
                function (anext) {
                    Editor.log('开始上传 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourcePath = path.join(__dirname, '../../build/wechatgame/res/raw-assets');
                    client.scp(sourcePath, {
                        host: '210.73.214.75',
                        username: 'liuk',
                        password: 'UcxxAoxpnLGUj8hW',
                        path: '/var/www/html/gongdou/res/raw-assets'
                    }, function (err) {
                        anext(err);
                    });
                },
                // function (anext) {
                //     Editor.log('开始上传 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                //     let sourcePath = path.join(__dirname, '../../build/wechatgame/res/raw-internal');
                //     client.scp(sourcePath, {
                //         host: '210.73.214.75',
                //         username: 'liuk',
                //         password: 'UcxxAoxpnLGUj8hW',
                //         path: '/var/www/html/gongdou/res/raw-internal'
                //     }, function (err) {
                //         anext(err);
                //     });
                // },
                function (anext) {
                    Editor.log('上传通用素材 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourcePath = path.join(__dirname, '../../images');
                    client.scp(sourcePath, {
                        host: '210.73.214.75',
                        username: 'liuk',
                        password: 'UcxxAoxpnLGUj8hW',
                        path: '/var/www/html/gongdou/images'
                    }, function (err) {
                        anext(err);
                    });
                },
                function (anext) {
                    Editor.log('删除本地res ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    rimraf(path.join(__dirname, '../../build/wechatgame/res/raw*'), function (err) {
                        anext(err);
                    });
                },
            ], function (err) {
                if (err) {
                    Editor.log('上传错误 ' + err);
                    return;
                }
                Editor.log('上传成功 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
            });
        }
    },
};