const _ = require('lodash');
const Define = require('../Util/Define');
const Tools = require("../Util/Tools");
const UIName = require('../Util/UIName');
const CountDown = require('../Util/CountDown');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const ViewController = require('../Controller/ViewController');
const UserModel = require('./User');

var SeptModel = function () {
    this.septMainData = null;
    this.septMemberData = [];
    this.isOpenSeptMember = false;
    this.selectSeptsecmaster = [];
    this.septGuardData = null;
    this.septRandomPlayers = [];
}

SeptModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.retMySeptInfoNew', this, this.onretMySeptInfoNew);
    NetWorkController.AddListener('msg.retCreateSept', this, this.onretCreateSept);
    NetWorkController.AddListener('msg.addSeptMemberOK', this, this.onaddSeptMemberOK);
    NetWorkController.AddListener('msg.retSeptSort', this, this.onretSeptSort);
    NetWorkController.AddListener('msg.retSeptMemberList', this, this.onretSeptMemberList);
    NetWorkController.AddListener('msg.leaveSeptOK', this, this.onleaveSeptOK);
    NetWorkController.AddListener('msg.retSeptAppointList', this, this.onretSeptAppointList);
    NetWorkController.AddListener('septpk.retSeptGuard', this, this.onretSeptGuard);
    Tools.InvokeCallback(cb, null);
}
SeptModel.prototype.Reload = function (cb) {
    this.septMainData = null;
    this.septMemberData = [];
    this.isOpenSeptMember = false;
    this.selectSeptsecmaster = [];
    this.septGuardData = null;
    this.septRandomPlayers = [];
    Tools.InvokeCallback(cb, null);
}

/**
 * 对外接口
 */
//目前没有


/**
 * 消息处理接口
 */
SeptModel.prototype.onretMySeptInfoNew = function (msgid, data) {
    this.septMainData = data;

    UserModel.userInfo.septid = data.info.info.septid;
    UserModel.userInfo.septname = data.info.info.name;
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_REFRESH);

    if (!ViewController.IsOpen(UIName.UI_SEPTMAINVIEW)) {
        ViewController.OpenView(UIName.UI_SEPTMAINVIEW, "ViewLayer");
    } else {
        NotificationController.Emit(Define.EVENT_KEY.SEPT_INFO_REFRESH);
    }
}

SeptModel.prototype.onretCreateSept = function (msgid, data) {
    ViewController.CloseView(UIName.UI_SEPTJOINVIEW, true);
    ViewController.CloseView(UIName.UI_SEPTCREATENODE, true);

    UserModel.userInfo.septid = data.septid;
    UserModel.userInfo.septname = data.name;
    UserModel.septPostion = Define.SEPTPOSITION.SEPTMASTER;
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_REFRESH);

    NetWorkController.SendProto('msg.reqMySeptInfoNew', {});
}

SeptModel.prototype.onaddSeptMemberOK = function (msgid, data) {
    UserModel.septPostion = Define.SEPTPOSITION.SEPTNORMAL;
    NetWorkController.SendProto('msg.reqMySeptInfoNew', {});
}

SeptModel.prototype.onretSeptSort = function (msgid, data) {
    if (!ViewController.IsOpen(UIName.UI_SEPTRANKINGVIEW)) {
        ViewController.OpenView(UIName.UI_SEPTRANKINGVIEW, "ViewLayer", data);
    }
}

SeptModel.prototype.onretSeptMemberList = function (msgid, data) {
    this.septMemberData = data;
    if (this.isOpenSeptMember) {
        ViewController.OpenView(UIName.UI_SEPTMEMBERVIEW, "ViewLayer");
    } else {
        NotificationController.Emit(Define.EVENT_KEY.SEPT_MEMBER_REFRESH);
    }
}

SeptModel.prototype.onleaveSeptOK = function (msgid, data) {
    UserModel.userInfo.septid = 0;
    UserModel.userInfo.septname = '';
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_REFRESH);
    ViewController.CloseAllView();
}

SeptModel.prototype.onretSeptAppointList = function (msgid, data) {
    this.selectSeptsecmaster = _.filter(data.list, { 'postion': Define.SEPTPOSITION.SEPTSECMASTER });
    ViewController.OpenView(UIName.UI_SEPTAPPOINTVIEW, "ViewLayer", data);
}

SeptModel.prototype.onretSeptGuard = function (msgid, data) {
    this.septGuardData = data;
    let _leftTime = 0;
    let _endtime = _.get(data, 'endtime', 0);
    if (_endtime > 0) {
        _leftTime = _endtime - Game.TimeController.GetCurTime();
    }
    CountDown.SetCountDown(CountDown.Define.TYPE_SEPTESCORT, _leftTime);
    if (!ViewController.IsOpen(UIName.UI_SEPTESCORTVIEW)) {
        ViewController.OpenView(UIName.UI_SEPTESCORTVIEW, "ViewLayer");
    } else {
        NotificationController.Emit(Define.EVENT_KEY.SEPT_ESCORT_REFRESH);
    }
}


module.exports = new SeptModel();