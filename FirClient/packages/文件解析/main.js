'use strict';
const _ = require('lodash');
const fs = require('fs');
const async = require('async');
const childprocess = require('child_process');
const path = require('path');
const xlsx = require('node-xlsx');
const xml = require('xml-js');

module.exports = {
    load() {
        // execute when package loaded
    },

    unload() {
        // execute when package unloaded
    },

    // register your ipc messages here
    messages: {
        'genProto'() {
            Editor.log('开始生成ProtoMsg');
            // process.env.PATH = process.env.PATH + ':/usr/local/bin';
            let sourcePath = path.join(__dirname, '../../../../guaji-h5-common/FirComm/*.proto');
            let targetFile = path.join(__dirname, '../../assets/Script/Util/ProtoMsg.js');
            let cmd = 'pbjs -t static-module --keep-case -w commonjs -o ' + targetFile + '  ' + sourcePath;
            childprocess.exec('git pull', { cwd: path.join(__dirname, '../../../../guaji-h5-common/') }, function (err, stdout, stderr) {
                if (err) {
                    Editor.log('++++++ git 更新失败 ++++++' + err);
                } else {
                    childprocess.exec(cmd,
                        function (err, stdout, stderr) {
                            if (err) {
                                Editor.log('++++++ 生成ProtoMsg 错误 ++++++');
                                Editor.log(err);
                                Editor.log(stdout);
                                Editor.log(stderr);
                            } else {
                                Editor.log('生成成功');
                            }
                        });
                }
            });
        },
        'parseExcel'() {
            let tablexml = [];
            let targetjson = {};
            async.waterfall([
                function (anext) {
                    Editor.log('+++++++++++++++++++++++++ 开始更新 guaji-h5-cehua +++++++++++++++++++++++++');
                    childprocess.exec('git pull', { cwd: path.join(__dirname, '../../../../guaji-h5-cehua/') }, function (err, stdout, stderr) {
                        if (err) {
                            anext('git 更新失败');
                        } else {
                            anext();
                        }
                    });
                },
                // function (anext) {
                //     Editor.log('+++++++++++++++++++++++++ 开始解析 excelmake_client_cpp.xml +++++++++++++++++++++++++');
                //     let clientcpppath = path.join(__dirname, '../../../../guaji-h5-cehua/FirCeHua/config/表格/excelmake_client_cpp.xml');
                //     let strxml = fs.readFileSync(clientcpppath, { encoding: 'UTF-8' });
                //     let jsonxml = xml.xml2json(strxml, { compact: true, spaces: 4 });
                //     xmls.push(JSON.parse(jsonxml));
                //     anext();
                // },
                function (anext) {
                    Editor.log('+++++++++++++++++++++++++ 开始解析 excelmake_client_lua.xml +++++++++++++++++++++++++');
                    let clientcpppath = path.join(__dirname, '../../../../guaji-h5-cehua/FirCeHua/config/表格/excelmake_client_lua.xml');
                    let strxml = fs.readFileSync(clientcpppath, { encoding: 'UTF-8' });
                    let jsonxml = xml.xml2json(strxml, { compact: true, spaces: 4 });
                    tablexml = JSON.parse(jsonxml);
                    anext();
                },
                function (anext) {
                    async.timesSeries(_.get(tablexml, 'database.table', []).length, function (i, ttnext) {
                        let table = _.get(tablexml, 'database.table', [])[i];
                        if (table && _.get(table, '_attributes.name', '') != '') {
                            let tablename = _.get(table, '_attributes.name', '');
                            Editor.log('========================= 开始解析 ' + tablename + ' =========================');
                            let excelpath = path.join(__dirname, '../../../../guaji-h5-cehua/FirCeHua/config/表格/' + tablename);
                            const workSheetsFromFile = xlsx.parse(excelpath);
                            let sheets = _.get(table, 'sheet', []);
                            if (!_.isArray(sheets)) {
                                sheets = [sheets];
                            }
                            async.timesSeries(sheets.length, function (m, tttnext) {
                                let sheet = sheets[m];
                                let sheetname = _.get(sheet, '_attributes.name', '');
                                if (sheetname == null) {
                                    tttnext();
                                }
                                let targetname = _.get(sheet, '_attributes.filename', '').split('.')[0];

                                targetjson[targetname] = [];
                                let sheetData = _.find(workSheetsFromFile, { name: sheetname });
                                if (sheetData == null) {
                                    tttnext('在文件' + tablename + '中未找到sheet名为' + sheetname + '的切页');
                                    return;
                                }
                                let indexsofkey = {};
                                let keys = _.map(sheet.field, '_attributes.name');
                                for (let x = 0; x < keys.length; x++) {
                                    let key = keys[x];
                                    let index = _.indexOf(sheetData.data[0], key);
                                    if (index == -1) {
                                        continue;
                                    }
                                    let id = sheetData.data[1][index];
                                    let valtype = sheetData.data[2][index];
                                    indexsofkey[key] = {
                                        index: index,
                                        id: id,
                                        valtype: valtype
                                    };
                                }
                                for (let x = 5; x < sheetData.data.length; x++) {
                                    let rowdata = sheetData.data[x];
                                    let jsondata = {}
                                    let jump = false;
                                    _.forIn(indexsofkey, function (v, k) {
                                        let val = rowdata[v.index];
                                        if (v.valtype.indexOf('int') >= 0 || v.valtype.indexOf('float') >= 0) {
                                            val = _.toNumber(val);
                                        } else {
                                            val = _.toString(val);
                                        }
                                        if (v.id == 'id' && _.isNaN(val)) {
                                            jump = true;
                                            return false;
                                        }
                                        jsondata[v.id] = val;
                                    });
                                    if (!jump) {
                                        targetjson[targetname].push(jsondata);
                                    }
                                }
                                tttnext();
                            }, function (err) {
                                ttnext(err);
                            });
                        }
                    }, function (err) {
                        anext(err);
                    });
                },
                function (anext) {
                    let targetjsonpath = path.join(__dirname, '../../assets/resources/Json/config_data.json');
                    Editor.log('========================= 开始写入 ' + targetjsonpath + ' =========================');
                    fs.writeFile(targetjsonpath, JSON.stringify(targetjson), function (err) {
                        anext(err);
                    });
                }
            ], function (err) {
                if (err) {
                    Editor.log('+++++++++++++++++++++++++ 解析失败 +++++++++++++++++++++++++ ' + err);
                } else {
                    Editor.log('+++++++++++++++++++++++++ 解析成功 +++++++++++++++++++++++++');
                }
            });
        }
    },
};