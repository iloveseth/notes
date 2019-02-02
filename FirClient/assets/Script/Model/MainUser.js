const _ = require('lodash');
const Tools = require("../Util/Tools");
const Define = require('../Util/Define');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const UserModel = require('./User');

var MainUserModel = function () {
    this.mainData = {};      //上线发送的玩家主数据
    this.lineSession = null;
}

MainUserModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.onlineScene', this, this.onLineScene);
    NetWorkController.AddListener('msg.onlineSession', this, this.onLineSession);

    NetWorkController.AddListener('msg.UserFame', this, this.onUserFame);
    NetWorkController.AddListener('msg.UserSmelt', this, this.onUserSmelt);
    NetWorkController.AddListener('msg.updateSeptMemberPosition', this, this.onupdateSeptMemberPosition);
    Tools.InvokeCallback(cb, null);
}
MainUserModel.prototype.Reload = function (cb) {
    this.mainData = {};      //上线发送的玩家主数据
    this.lineSession = null;
    Tools.InvokeCallback(cb, null);
}

/**
 * 对外接口
 */
MainUserModel.prototype.GetMainData = function () {
    return this.mainData;
}

MainUserModel.prototype.GetFame = function () {
    return _.get(this.mainData, 'fame', 0);
}

MainUserModel.prototype.GetSmelt = function () {
    return _.get(this.mainData, 'smelt', 0);
}
MainUserModel.prototype.GetQzoneShare = function () {
    return _.get(this.mainData, 'qzoneshare', 0);
}
MainUserModel.prototype.GetQzoneCollect = function () {
    return _.get(this.mainData, 'qzonecollect', 0);
}

/**
 * 消息处理接口
 */
MainUserModel.prototype.onLineScene = function (msgid, data) {
    this.mainData = data;
    UserModel.SetUserStrengthInfo(data.curstrength, data.maxstrength);
    UserModel.setPVPSort(data.pvpsort);
    NotificationController.Emit(Define.EVENT_KEY.MAINDATA_REFRESH);
}

MainUserModel.prototype.onUserFame = function (msgid, data) {
    this.mainData.fame = data.num;
    NotificationController.Emit(Define.EVENT_KEY.FORGE_REFRESH);
}

MainUserModel.prototype.onUserSmelt = function (msgid, data) {
    this.mainData.smelt = data.num;
    NotificationController.Emit(Define.EVENT_KEY.FORGE_REFRESH);
}

MainUserModel.prototype.onLineSession = function (msgid, data) {
    this.lineSession = data;
    UserModel.septPostion = data.postion;
}

MainUserModel.prototype.onQzoneShare = function (msgid, data) { //qzone分享状态数据更新
    this.mainData.qzoneshare = data.num;
}
MainUserModel.prototype.onQzoneCollect = function (msgid, data) { //qzone收藏状态数据更新
    this.mainData.qzonecollect = data.num;
}

MainUserModel.prototype.onupdateSeptMemberPosition = function (msgid, data) {
    UserModel.septPostion = data.postion;
}

module.exports = new MainUserModel();