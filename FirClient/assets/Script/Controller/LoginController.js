const async = require('async');
const _ = require('lodash');

const Global = require('../Model/Global');
const FairyModel = require('../Model/Fairy');
const NetWorkController = require('./NetWorkController');
const NotificationController = require('./NotificationController');
const TimeController = require('./TimeController');

const Tools = require("../Util/Tools");
const Define = require("../Util/Define");
const CppCmd = require('../Util/CppCmd');
const ServerUtil = require('../Util/ServerUtil');


var LoginController = function () {
    this.loginServerUrl = null;
    this.connected = false;
    this.lastHeartBeatTime = 0;
    this.relogincount = 0;
    this.relogining = false;
    this.relogincallback = null;
    this.uuid = '7563';
}

LoginController.prototype.Init = function (cb) {
    NotificationController.On(Define.EVENT_KEY.NET_CLOSE, this, this.onNetClose);
    NetWorkController.AddBinaryListener(Define.MSG_ID.AccessCppGateCmd, this, this.onAccessCppGateCmd);
    NetWorkController.AddBinaryListener(Define.MSG_ID.stNeedCreateRole, this, this.onNeedCreateRole);
    NetWorkController.AddBinaryListener(Define.MSG_ID.stServerReturnLoginFailedCmd, this, this.onServerReturnLoginFailedCmd);
    NetWorkController.AddListener('login.userFinishOnline', this, this.onFinishOnline);
    NetWorkController.AddListener('login.retRandomName', this, this.onCreateRoleRandomName);

    Tools.InvokeCallback(cb, null);
}

LoginController.prototype.ConnectToLoginServer = function () {
    let url = Global.GetLoginServerData().url;
    if (url == null || url == '') {
        cc.log('请先选择登陆服务器');
        return;
    }
    this.loginServerUrl = url;
    NetWorkController.Connect(url);
}

//回调函数
LoginController.prototype.onAccessCppGateCmd = function (buffer) {
    //建立cpp连接 成功 可以发消息了
    let result = CppCmd.ParseAccessCppGateCmd(buffer);
    this.connected = true;
    this.lastHeartBeatTime = TimeController.GetCurTime();
    //发消息啦
    // 验证客户端版本
    let verifymsg = CppCmd.NewUserVerifyVerCmd(1999);
    NetWorkController.SendBinary(verifymsg, 'NewUserVerifyVerCmd');
    // 客户端登陆
    const User = require('../Model/User');

    let loginmsg = CppCmd.NewIphoneLoginUserCmd(User.acc, User.token, ServerUtil.channel, 1999);
    console.log("User.acc----:", User.acc, "User.token------:", User.token);
    console.log("登录信息：" + JSON.stringify(loginmsg));
    NetWorkController.SendBinary(loginmsg, 'NewIphoneLoginUserCmd');
}

LoginController.prototype.onNeedCreateRole = function (buffer) {
    let result = CppCmd.ParseNeedCreateRole(buffer);
    let Game = require('../Game');
    Game.Platform.SetTDEventData(Define.TD_EVENT.EventCreateRole, { success: true });
    NotificationController.Emit(Define.EVENT_KEY.ROLE_CREATE);
}
LoginController.prototype.onCreateRoleRandomName = function (msgid, data) {
    NotificationController.Emit(Define.EVENT_KEY.ROLE_CREATE_RANDOMNAME, data);
}
LoginController.prototype.onServerReturnLoginFailedCmd = function (buffer) {
    //登陆失败了
    if (cc.director.getScene().name == 'MainScene') {
        //重登失败退了吧
        const Game = require('../Game');
        Game.Platform.Logout();
        Game.Platform.SetTDEventData(Define.TD_EVENT.EventLogin, { success: false });
    }
}
LoginController.prototype.onFinishOnline = function (msgid, data) {
    let Game = require('../Game');
    Game.Platform.SetTDEventData(Define.TD_EVENT.EventLogin, { success: true });

    this.relogining = false;
    this.relogincount = 0;
    if (this.relogincallback != null) {
        let schedule = cc.director.getScheduler();
        schedule.unschedule(this.relogincallback, this);
        this.relogincallback = null;
    }
    cc.eventManager.resumeTarget(cc.director.getScene(), true);
    FairyModel.initFairyLockedFrame();
    NotificationController.Emit(Define.EVENT_KEY.ROLE_LOGINFINISH);
    //TODO 
}
LoginController.prototype.onNetClose = function (reason) {
    this._handleNetFailed(reason);
    if (this.connected) {
        this.connected = false;
    }
}
LoginController.prototype.Update = function (dt) {
    //发送心跳报
    if (this.connected) {
        let cur = TimeController.GetCurTime();
        if (cur - this.lastHeartBeatTime > Define.HEART_BEAT.INTERVAL) {
            this.lastHeartBeatTime = cur;
            let msg = CppCmd.NewUserGameTimeTimerUserCmd(TimeController.GetRunTime());
            NetWorkController.SendBinary(msg, 'NewUserGameTimeTimerUserCmd');
        }
    }
}

LoginController.prototype.isOnLine = function () {
    return this.loginedToGate;
}

LoginController.prototype._handleNetFailed = function (reason) {
    console.log(new Date() + ' [断线重连] 原因 ' + reason);
    if (reason == 1 && !this.relogining && this.connected) //被动断开执行
    {
        if (cc.director.getScene().name != 'LoadScene') {
            //登出了
            cc.eventManager.pauseTarget(cc.director.getScene(), true);
            this.relogining = true;
            this.relogincallback = this._relogin;
            let schedule = cc.director.getScheduler();
            schedule.schedule(this.relogincallback, this, 6);
        }
    }
}
LoginController.prototype._relogin = function () {
    cc.log('重新登陆 ===== > ' + TimeController.GetCurTime());
    const Game = require('../Game');
    if (this.relogincount < 5) {
        Game.GameInstance.ReLogin();
    } else {
        this.relogining = false;
        this.relogincount = 0;
        if (this.relogincallback != null) {
            let schedule = cc.director.getScheduler();
            schedule.unschedule(this.relogincallback, this);
            this.relogincallback = null;
        }
        Game.Platform.Logout();
    }
    this.relogincount++;
}

module.exports = new LoginController();