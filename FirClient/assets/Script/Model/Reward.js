const _ = require('lodash');
const ConfigController = require('../Controller/ConfigController');
const TimeController = require('../Controller/TimeController');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const User = require('./User');
const Currency = require('./Currency');
const Tools = require('../Util/Tools');
const Define = require('../Util/Define');

let RewardModel = function () {
    this.dailyReward = null;
}

RewardModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.retDayReward', this, this.onRetDayReward);
    Tools.InvokeCallback(cb, null);
}
/**
 * 对外接口
 */
RewardModel.prototype.GetCurPoint = function () {
    return _.get(this, 'dailyReward.point', 0);
}
RewardModel.prototype.GetRecievedRewards = function () {
    return _.get(this, 'dailyReward.getrewardid', []);
}
RewardModel.prototype.GetLastPoint = function () {
    return _.get(this, 'dailyReward.lastpoint', 0);
}
RewardModel.prototype.GetCurPkWinTimes = function () {
    return _.get(this, 'dailyReward.pksuccess_count', 0);
}
RewardModel.prototype.GetRecievedPkWinRewards = function () {
    return _.get(this, 'dailyReward.pksuccess_getrewardid', []);
}
RewardModel.prototype.GetLastPkWinTimes = function () {
    return _.get(this, 'dailyReward.pkwin_lastcount', 0);
}
/**
 * 消息处理接口
 */
RewardModel.prototype.onRetDayReward = function (msgid, data) {
    this.dailyReward = _.cloneDeep(data);
    NotificationController.Emit(Define.EVENT_KEY.PK_REWARDUPDATE);
}
module.exports = new RewardModel();