const NotificationController = require('./NotificationController');
const Define = require('../Util/Define');
const Tools = require('../Util/Tools');

var NativeController = function () {

};
NativeController.prototype.Init = function (cb) {
    Tools.InvokeCallback(cb, null);
}
NativeController.prototype.TokenLogin = function (userid, token) { //原生调用
    cc.log("原生调回来userid", userid, "token", token);
    NotificationController.Emit(Define.EVENT_KEY.TOKEN_LOGIN, userid, token);
};

NativeController.prototype.PayResult = function (status, extInfo) {
    status = parseInt(status);
    NotificationController.Emit(Define.EVENT_KEY.NATIVE_PAY_RESULT, status, extInfo);
};

NativeController.prototype.TokenLogin1 = function (str) { //原生调用
    var json = JSON.parse(str);
    var userid = json.userId;
    var token = json.token;
    cc.log("原生调回来userid", userid, "token", token);
    NotificationController.Emit(Define.EVENT_KEY.TOKEN_LOGIN, userid, token);
};

NativeController.prototype.PayResult1 = function (str) {
    var json = JSON.parse(str);
    var status = parseInt(json.status);
    var extInfo = json.extInfo;
    NotificationController.Emit(Define.EVENT_KEY.NATIVE_PAY_RESULT, status, extInfo);
};

NativeController.prototype.Logout = function () {
    const Game = require('../Game');
    Game.GameInstance.Logout();
}

NativeController.prototype.GetUserInfo = function () {
    const Global = require('../Model/Global');
    const User = require('../Model/User');
    let result = {
        serverId: Global.GetLoginServerData().Zoneid,
        serverName: Global.GetLoginServerData().Name,
        roleId: User.GetCharid(),
        roleName: User.GetUserName(),
    };
    return JSON.stringify(result);
}

var controller = new NativeController();
window.NativeController = controller;
module.exports = controller;