const _ = require('lodash');
const moment = require('moment');
const TimeController = require('../Controller/TimeController');
let CountDown = function () {
    this.lastSeconds = {};
    this.updateTime = {};
};
CountDown.prototype.Define = {
    TYPE_BORDERTEAM: 1,
    TYPE_LUCKSTAR: 2,
    TYPE_ESCORTSPAR: 3,
    TYPE_KINGTASK: 4,
    TYPE_ROBBINGSPARBLESS: 5,
    TYPE_REVIVE: 6,
    TYPE_PARTDRAWONCE: 7,
    TYPE_ESCORTSPARBLESS: 8,
    TYPE_DIGLESS_3: 9,
    TYPE_DIGLESS_4: 10,
    TYPE_ACTIVITY_LOGIN: 11,        //七日登录
    TYPE_SEPTPK: 12,
    TYPE_SEPTESCORT: 13,
    TYPE_JIJIE: 14,
    TYPE_GIFT_LEFT_TIME: 15,        //礼包剩余购买时间
    TYPE_ACTIVITY_LEIJI: 16,        //activity累计充值
    TYPE_ACTIVITY_XIANSHI: 16,      //activity限时奖励
    TYPE_ACTIVITY_HONGLI: 17,       //红利剩余时间
    TYPE_ACTIVITY_FIGHTRANK: 19,    //战力榜倒计时
    TYPE_ACTIVITY_XIAOFEI: 18,      //消费榜剩余时间
    TYPE_DAILYGIFTLEFTTIME: 20,     //每日礼包剩余购买时间
    TYPE_FASTFIGHTBUFF: 21,         //快速战斗buff
    TYPE_LEVELBOSS: 22,             //关卡中boss挑战的冷却
    TYPE_BLESS: 23,
    TYPE_NBSHOP: 24,                //高级杂货刷新
    TYPE_TARGET_SMALL: 25,          //目标小界面倒计时
    TYPE_RECOVERY_TIME: 26,          //竞技场挑战次数倒计时
}

CountDown.prototype.SetCountDown = function (type, lastSecond) {
    this.lastSeconds[type] = lastSecond;
    this.updateTime[type] = TimeController.GetCurTime();
}
CountDown.prototype.GetCountDown = function (type) {
    let lastSecond = _.get(this, 'lastSeconds.' + type, 0);
    if (lastSecond == 0) {
        return 0;
    }
    let curTime = TimeController.GetCurTime();
    let updateTime = _.get(this, 'updateTime.' + type, 0);
    return Math.max(0, lastSecond - (curTime - updateTime));
}
CountDown.prototype.FormatCountDown = function (type, formater, trim = true) {
    let lasttime = this.GetCountDown(type);
    if (lasttime == 0) {
        return '';
    }
    return moment.duration(lasttime, 'second').format(formater, { trim: trim });
}

module.exports = new CountDown();
