const _ = require('lodash');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');

const TimeController = require('../Controller/TimeController');
const Define = require('../Util/Define');
const Tools = require("../Util/Tools");

var CurrencyModel = function () {
    this.userInfo = {};
    this.lastSyncTime = TimeController.GetCurTime();
}

CurrencyModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('charmain.UserMainData', this, this.onUserMainData);
    NetWorkController.AddListener('msg.notifyMoney', this, this.onNotifyMoney);
    NetWorkController.AddListener('msg.notifyGold', this, this.onNotifyGold);
    NetWorkController.AddListener('newfight.RetNewFightInfo', this, this.onRetNewFightInfo);
    Tools.InvokeCallback(cb, null);
}

/**
 * 对外接口
 */
CurrencyModel.prototype.GetMoney = function () {    //银子
    const Level = require('./Level');
    return Math.floor(_.get(this, 'userInfo.money', 0) + Level.GetCoinSpeed() * (TimeController.GetCurTime() - this.lastSyncTime));
}

CurrencyModel.prototype.GetGold = function () {    //金子
    return _.get(this, 'userInfo.gold', 0);
}

/**
 * 消息处理接口
 */
CurrencyModel.prototype.onUserMainData = function (msgid, data) {
    this.lastSyncTime = TimeController.GetCurTime();
    this.userInfo = data;
    NotificationController.Emit(Define.EVENT_KEY.GOLD_REFRESH);
}
CurrencyModel.prototype.onRetNewFightInfo = function (msgid, data) {
    _.set(this, 'userInfo.money', data.money);
    this.lastSyncTime = TimeController.GetCurTime();
}
CurrencyModel.prototype.onNotifyMoney = function (msgid, data) {
    _.set(this, 'userInfo.money', data.money);
    this.lastSyncTime = TimeController.GetCurTime();
    NotificationController.Emit(Define.EVENT_KEY.MONEY_REFRESH);
}
CurrencyModel.prototype.onNotifyGold = function (msgid, data) {
    // 
    let Game = require('../Game');
    if(this.GetGold() > data.gold){
        let gold = this.GetGold() - data.gold;
        Game.Platform.SetTDEventData(Define.TD_EVENT.EventConsumeMoney,{gold:gold});
    }
    _.set(this, 'userInfo.gold', data.gold);
    NotificationController.Emit(Define.EVENT_KEY.GOLD_REFRESH);

}

module.exports = new CurrencyModel();