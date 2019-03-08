var fs = require('fs');
var path = require('path');
var async  = require('async');
var resPath = 'D:/CocosBuild/jsb-default/res/';
var importPath = path.join(resPath,'import/');
var rawPath = path.join(resPath,'raw-assets');

var ts = new Date().getTime().toString(16);
var mixStr = ts.substr(ts.length - 8);
var mixArray = [];
for(var idx = 0;idx < mixStr.length; idx += 2){
    mixArray[idx/2] = parseInt('0x' + `${mixStr[idx]}${mixStr[idx + 1]}`);
}

mixDir(importPath);
mixDir(rawPath);

function mixDir(dirPath,cb){
    async.waterfall([
        function(anext){
            fs.readdir(dirPath,(err,files) =>{
                anext(err,files);
            });
        },
        function(files,anext){
            files.forEach(e => {
                var filePath = path.join(dirPath,e);
                async.waterfall([
                    function(bnext){
                        fs.readdir(filePath,(err,files) => {
                            bnext(err,files);
                        })
                    },
                    function(files,bnext){
                        files.forEach(f => {
                            var realPath = path.join(filePath,f);
                            switch(path.extname(f).toLowerCase()){
                                case '.json':{
                                    mixJson(realPath);
                                    break;
                                }
                                case '.png': case '.jpg': {
                                    mixImage(realPath);
                                    break;
                                }
                                case '.manifest': {
                                    mixManifest(realPath);
                                    break;
                                }
                                default: break;
                            }
                        })
                    }
                ],
                function(err){
                    console.log('cuowu!!!')
                })
            })
        },
    ],
    function(err){
        console.log('cuowu!!!')
    });
}

function mixJson(jsonFilePath){
    var rd = fs.readFileSync(jsonFilePath);
    var rdStr = rd.toString();
    var jsonRd = JSON.parse(rdStr);
    jsonRd.timeid2019 = ts;
    var wr = JSON.stringify(jsonRd);
    fs.writeFileSync(jsonFilePath,wr);
}

function mixImage(imageFilePath){
    var rd = fs.readFileSync(imageFilePath);
    for(var idx = 0;idx != mixArray.length; ++idx){
        rd[rd.length - mixArray.length + idx] = mixArray[idx];
    }
    fs.writeFileSync(imageFilePath,rd);
}

function mixManifest(manifestFilePath){
}
