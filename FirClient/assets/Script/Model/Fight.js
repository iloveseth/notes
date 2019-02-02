const _ = require('lodash');
const NetWorkController = require('../Controller/NetWorkController');
const ViewController = require('../Controller/ViewController');
const Tools = require("../Util/Tools");
const UIName = require('../Util/UIName');
const CountDown = require('../Util/CountDown');

var FightModel = function () {
    this.fightResultInfo = null;
    this.userDeathInfo = null;
}

FightModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('border.fightResult', this, this.onFightResultInfo);
    NetWorkController.AddListener('border.userDeath', this, this.onUserDeathInfo);

    Tools.InvokeCallback(cb, null);
}

/**
 * 对外接口
 */
//获取胜利数据
FightModel.prototype.getFightResult = function () {
    return this.fightResultInfo;
}
//获取失败数据
FightModel.prototype.getUserDeathInfo = function () {
    return this.userDeathInfo;
}

/**
 * 消息处理接口
 */

//战斗胜利结果加特效
FightModel.prototype.onFightResultInfo = function (msgid, data) {
    this.fightResultInfo = data;
    let sendData = {};
    sendData.typeIndex = data.type
    ViewController.OpenView(UIName.UI_FIGHT_RESULT_EFFECT_NODE, "MaskLayer", sendData);
}

//战斗失败结果加特效
FightModel.prototype.onUserDeathInfo = function (msgid, data) {
    this.userDeathInfo = data;
    CountDown.SetCountDown(CountDown.Define.TYPE_REVIVE, 3);
    let sendData = {};
    sendData.typeIndex = data.type
    ViewController.OpenView(UIName.UI_FIGHT_RESULT_LOSE_NODE, "MaskLayer", sendData);
}

module.exports = new FightModel();