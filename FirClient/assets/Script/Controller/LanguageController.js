const Tools = require('../Util/Tools');
let ConfigController = require('./ConfigController');

var LanguageController = function () {
}

LanguageController.prototype.Init = function (cb) {
    Tools.InvokeCallback(cb);
};

LanguageController.prototype.FindLanguageStr = function (id) {
    return ConfigController.GetConfigById("localclient_data", id).target;
};

module.exports = new LanguageController();