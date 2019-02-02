const _ = require('lodash');
const Define = require('../Util/Define');
const Tools = require("../Util/Tools");
const UIName = require('../Util/UIName');
const CountDown = require('../Util/CountDown');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const ViewController = require('../Controller/ViewController');
const TimeController = require('../Controller/TimeController');
const GuideController = require('../Controller/GuideController');

var TaskModel = function () {
    this.taskInfos = [];
    this.kingtaskAdd = null;
    this.kingtaskTime = 0;
    this.luckystarNum = 0;
    this.luckystarIconData = null;
    this.luckystarList = [];
    this.retGuardSysData = null;
    this.retTempleData = null;
    this.isOpenDailyTask = false;
    this.robbingHasBless = false;
}

TaskModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('border.retQuestInfo', this, this.onretQuestInfo);
    NetWorkController.AddListener('msg.retRedEnvelopeTask', this, this.onretRedEnvelopeTask);
    NetWorkController.AddListener('msg.beginRedEnvelopeRet', this, this.onbeginRedEnvelopeRet);
    NetWorkController.AddListener('msg.canGetRedNum', this, this.oncanGetRedNum);
    NetWorkController.AddListener('msg.retRedNum', this, this.onretRedNum);
    NetWorkController.AddListener('msg.retSnatchRedEnvelope', this, this.onretSnatchRedEnvelope);
    NetWorkController.AddListener('msg.retRedEnvelopeTaskIcon', this, this.onretRedEnvelopeTaskIcon);
    NetWorkController.AddListener('msg.reqCTaskBonus', this, this.onreqCTaskBonus);
    NetWorkController.AddListener('msg.retGuardSys', this, this.onretGuardSys);
    NetWorkController.AddListener('msg.retTempleInfo', this, this.onretTempleInfo);
    NetWorkController.AddListener('border.pkEffectTaskColor', this, this.onPkEffectTaskColor);

    Tools.InvokeCallback(cb, null);
}
TaskModel.prototype.Reload = function (cb) {
    this.taskInfos = [];
    this.kingtaskAdd = null;
    this.kingtaskTime = 0;
    this.luckystarNum = 0;
    this.luckystarIconData = null;
    this.luckystarList = [];
    this.retGuardSysData = null;
    this.retTempleData = null;
    this.isOpenDailyTask = false;
    Tools.InvokeCallback(cb, null);
}
/**
 * 对外接口
 */
TaskModel.prototype.GetTaskInfos = function () {
    return this.taskInfos;
}

TaskModel.prototype.IsTaskRed = function () {
    if (!GuideController.IsFunctionOpen(Define.FUNCTION_TYPE.TYPE_TASK)) { return false; }

    let isRed = false;
    let curTime = TimeController.GetCurTime();
    let leftTime = this.kingtaskTime - curTime;
    if (leftTime > 0) {
        for (let i = 0; i < this.taskInfos.length; i++) {
            let info = this.taskInfos[i];
            if ((info.daymax - info.daycur) > 0) {
                isRed = true;
                break;
            }
        }
    }
    return isRed;
}

/**
 * 消息处理接口
 */
TaskModel.prototype.onretQuestInfo = function (msgid, data) {
    this.taskInfos = data.info;
    this.kingtaskAdd = data.cqadd;
    this.kingtaskTime = data.cqtime;

    let curTime = TimeController.GetCurTime();
    let leftTime = data.cqtime - curTime;
    if (leftTime > 0) {
        CountDown.SetCountDown(CountDown.Define.TYPE_KINGTASK, leftTime);
    } else {
        CountDown.SetCountDown(CountDown.Define.TYPE_KINGTASK, 0);
    }
    NotificationController.Emit(Define.EVENT_KEY.TASK_INFO_REFRESH);

    if (this.isOpenDailyTask) {
        ViewController.OpenView(UIName.UI_DAILYTASKVIEW, "ViewLayer");
    }
}

TaskModel.prototype.onretRedEnvelopeTask = function (msgid, data) {
    ViewController.OpenView(UIName.UI_LUCKYSTARSENDVIEW, "ViewLayer", data);
}

TaskModel.prototype.onbeginRedEnvelopeRet = function (msgid, data) {
    if (data.result == 1) {
        ViewController.CloseView(UIName.UI_LUCKYSTARSENDVIEW);
    }
}

TaskModel.prototype.oncanGetRedNum = function (msgid, data) {
    this.luckystarNum = data.num;
    NotificationController.Emit(Define.EVENT_KEY.TASK_LUCKYSTAR_REFRESH);
}

TaskModel.prototype.onretRedNum = function (msgid, data) {
    this.luckystarList = data.info;
    if (data.info.length > 0) {
        ViewController.OpenView(UIName.UI_LUCKYSTARPLAYERVIEW, "ViewLayer");
    } else {
        if (this.luckystarList.length > 0 && this.luckystarNum > 0) {
            this.luckystarList.splice(0, 1);
            this.luckystarNum -= 1;
        } else {
            this.luckystarList = [];
            this.luckystarNum = 0;
        }
        NotificationController.Emit(Define.EVENT_KEY.TASK_LUCKYSTAR_REFRESH);
        NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, '幸运星已经被抢完了');
    }
}

TaskModel.prototype.onretSnatchRedEnvelope = function (msgid, data) {
    ViewController.OpenView(UIName.UI_LUCKYSTAROPENVIEW, "ViewLayer", data);
}

TaskModel.prototype.onretRedEnvelopeTaskIcon = function (msgid, data) {
    this.luckystarIconData = data;

    CountDown.SetCountDown(CountDown.Define.TYPE_LUCKSTAR, _.get(data, 'lefttime', 0));
    NotificationController.Emit(Define.EVENT_KEY.TASK_LUCKYSTAR_REFRESH);
}

TaskModel.prototype.onretGuardSys = function (msgid, data) {
    this.retGuardSysData = data;
    CountDown.SetCountDown(CountDown.Define.TYPE_ESCORTSPAR, _.get(data, 'time', 0));
    if (!ViewController.IsOpen(UIName.UI_ESCORTSPARVIEW)) {
        ViewController.OpenView(UIName.UI_ESCORTSPARVIEW, "ViewLayer");
    } else {
        NotificationController.Emit(Define.EVENT_KEY.ESCORTSPAR_INFO_REFRESH);
    }
}

TaskModel.prototype.onretTempleInfo = function (msgid, data) {
    this.retTempleData = data;
    let isopenui = _.get(data,"isopenui",false);
    if (!ViewController.IsOpen(UIName.UI_ROBBINGSPARVIEW) && isopenui) {
        ViewController.OpenView(UIName.UI_ROBBINGSPARVIEW, "ViewLayer");
    } else {
        NotificationController.Emit(Define.EVENT_KEY.ROBBING_INFO_REFRESH);
    }
}

TaskModel.prototype.onPkEffectTaskColor = function (msgid, msg) {
    // let currkill = _.get(msg,"currkill",0);
    // if(currkill > 0){
    //     this.robbingHasBless = true;
    // }else{
    //     this.robbingHasBless = false;
    // };
    this.robbingHasBless = true;
}

module.exports = new TaskModel();