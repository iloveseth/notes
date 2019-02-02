const _ = require('lodash');
const Define = require('../Util/Define');
const Tools = require('../Util/Tools');
const CountDown = require('../Util/CountDown');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const User = require('./User');
let SeptPkModel = function () {
    this.cardInfo = null;                               //卡牌信息
    this.septPkInfo = null;                             //我的公会战的信息
    this.septPkFight = null;                            //我的公会战战场信息
    this.septPkRecords = [];
}
SeptPkModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('spk.retNewSeptPk', this, this.onRetNewSeptPk);
    NetWorkController.AddListener('spk.retNewSeptPkFight', this, this.onRetNewSeptPkFight);
    NetWorkController.AddListener('spk.sendCardInfo', this, this.onSendCardInfo);
    NetWorkController.AddListener('spk.retSeptPkRecord', this, this.onRetSeptPkRecord);
    Tools.InvokeCallback(cb, null);
}
SeptPkModel.prototype.Reload = function (cb) {
    this.cardInfo = null;                               //卡牌信息
    this.septPkInfo = null;                             //我的公会战的信息
    this.septPkFight = null;                            //我的公会战战场信息
    this.septPkRecords = [];
    Tools.InvokeCallback(cb, null);
}
/**
 * 对外接口
 */
//================== 卡牌上的信息 ===================
SeptPkModel.prototype.GetCardName = function () {
    return _.get(this, 'cardInfo.name', '');
}
SeptPkModel.prototype.GetCardMyPoint = function () {
    return _.get(this, 'cardInfo.mypoint', '');
}
SeptPkModel.prototype.GetCardEnemyPoint = function () {
    return _.get(this, 'cardInfo.enemypoint', '');
}
//================== 选择公会的信息 ===================
SeptPkModel.prototype.GetSeptPkLeftTimes = function () {
    return _.get(this, 'septPkInfo.left', '');
}
SeptPkModel.prototype.GetSeptPkMaxLeftTimes = function () {
    return _.get(this, 'septPkInfo.maxcount', '');
}
SeptPkModel.prototype.GetSeptPkBeatTimes = function () {
    return _.get(this, 'septPkInfo.beatt', '');
}
SeptPkModel.prototype.GetSeptPkMaxBeatTimes = function () {
    return _.get(this, 'septPkInfo.maxbeatt', '');
}
SeptPkModel.prototype.GetSeptPkSeptDatas = function () {
    return _.get(this, 'septPkInfo.info', []);
}
//================== 公会战场的信息 ===================
SeptPkModel.prototype.GetSeptPkFightMyName = function () {
    return _.get(this, 'septPkFight.myname', '');
}
SeptPkModel.prototype.GetSeptPkFightEnemyName = function () {
    return _.get(this, 'septPkFight.enemyname', '');
}
SeptPkModel.prototype.GetSeptPkFightMyPoint = function () {
    return _.get(this, 'septPkFight.mypoint', 0);
}
SeptPkModel.prototype.GetSeptPkFightEnemyPoint = function () {
    return _.get(this, 'septPkFight.enemypoint', 0);
}
SeptPkModel.prototype.GetSeptPkFightIsFightter = function () {
    return _.get(this, 'septPkFight.isatter', 0);
}
SeptPkModel.prototype.GetSeptPkFightMyMembers = function () {
    return _.get(this, 'septPkFight.myinfo', []);
}
SeptPkModel.prototype.GetSeptPkFightMyData = function () {
    let members = this.GetSeptPkFightMyMembers();
    return _.find(members, { charid: User.GetCharid() });
}
SeptPkModel.prototype.GetSeptPkFightMyMatesData = function () {
    let members = this.GetSeptPkFightMyMembers();
    return _.filter(members, function (o) {
        return o.charid != User.GetCharid();
    });
}
SeptPkModel.prototype.GetSeptPkFightEnemyMembers = function () {
    return _.get(this, 'septPkFight.enemyinfo', []);
}

SeptPkModel.prototype.GetSeptPkRecords = function () {
    return this.septPkRecords;
}
/**
 * 消息处理接口
 */
SeptPkModel.prototype.onRetNewSeptPk = function (msgid, data) {
    this.septPkInfo = _.cloneDeep(data);
    NotificationController.Emit(Define.EVENT_KEY.SEPTPK_INFOUPDATE);
}
SeptPkModel.prototype.onRetNewSeptPkFight = function (msgid, data) {
    this.septPkFight = data;
    CountDown.SetCountDown(CountDown.Define.TYPE_SEPTPK, _.get(data, 'lefttime', 0) || 0);
    NotificationController.Emit(Define.EVENT_KEY.SEPTPK_FIGHTUPDATE);
}
SeptPkModel.prototype.onSendCardInfo = function (msgid, data) {
    this.cardInfo = _.cloneDeep(data);
    CountDown.SetCountDown(CountDown.Define.TYPE_SEPTPK, _.get(data, 'lefttime', 0) || 0);
}
SeptPkModel.prototype.onRetSeptPkRecord = function (msgid, data) {
    this.septPkRecords = data.info || [];
    NotificationController.Emit(Define.EVENT_KEY.SEPTPK_RECORDUPDATE);
}
module.exports = new SeptPkModel();