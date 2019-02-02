const _ = require('lodash');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const Tools = require("../Util/Tools");
const Define = require("../Util/Define");
const ViewController = require('../Controller/ViewController');
const UIName = require('../Util/UIName');
const UserModel = require('../Model/User');
const ConfigController = require('../Controller/ConfigController');
const GlobalModel = require('../Model/Global');

var DigModel = function () {
    this.digRobList = [];
    this.digReward = null;
    this.digPkAward = null;
    this.captureMineInfo = null;
    this.oneMineInfo = null;
    this.allDigStatus = null;
    this.robDigInfo = null;
    this.digCaptureAward = null;
    this.isOpenEnemy = null;
    this.captrueMineId = 0; //庄园界面点击两个占领矿时设置
    this.needOpenDigOtherView = false;
    this.bless_id = 0;
    this.isDigRed = false;

}

DigModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.RetDigRobList', this, this.onRetDigRobList);
    NetWorkController.AddListener('msg.retGetDigReward', this, this.onRetGetDigReward);
    NetWorkController.AddListener('msg.RetDigPkAward', this, this.onRetDigPkAward);
    NetWorkController.AddListener('msg.RetCaptureMineInfo', this, this.onRetCaptureMineInfo);
    NetWorkController.AddListener('msg.RetOneMineInfo', this, this.onRetOneMineInfo);
    NetWorkController.AddListener('msg.retAllDigStatus', this, this.onRetAllDigStatus);
    NetWorkController.AddListener('msg.RetRobDigInfo', this, this.onRetRobDigInfo);
    NetWorkController.AddListener('msg.RetDigCaptureAwardResult', this, this.onRetDigCaptureAwardResult);
    NetWorkController.AddListener('msg.notifyBagNoSpace', this, this.onNotifyBagNoSpace);

    Tools.InvokeCallback(cb, null);
}

DigModel.prototype.Reload = function (cb) {
    this.digRobList = [];
    this.digReward = null;
    this.digPkAward = null;
    this.captureMineInfo = null;
    this.oneMineInfo = null;
    this.allDigStatus = null;
    this.robDigInfo = null;
    this.digCaptureAward = null;
    this.isOpenEnemy = null;
    this.captrueMineId = 0; //庄园界面点击两个占领矿时设置
    this.needOpenDigOtherView = false;
    this.bless_id = 0;
    this.isDigRed = false;
    Tools.InvokeCallback(cb, null);
}
/**
 * 对外接口
 */
DigModel.prototype.setBlessId = function (blessId) {
    this.bless_id = blessId;
}
DigModel.prototype.getBlessId = function () {
    return this.bless_id;
}
DigModel.prototype.setCaptrueMineId = function (captrueId) {
    this.captrueMineId = captrueId;
}
DigModel.prototype.getCaptrueMineId = function () {
    return this.captrueMineId;
}
DigModel.prototype.getDigRobList = function () {
    return this.digRobList;
}
DigModel.prototype.getDigReward = function () {
    return this.digReward;
}
DigModel.prototype.getDigPkAward = function () {
    return this.digPkAward;
}
DigModel.prototype.getCaptureMineInfo = function () {
    return this.captureMineInfo;
}
DigModel.prototype.getOneMineInfo = function () {
    return this.oneMineInfo;
}
DigModel.prototype.getAllDigStatus = function () {
    return this.allDigStatus;
}
DigModel.prototype.getRobDigInfo = function () {
    return this.robDigInfo;
}
DigModel.prototype.getDigCaptureAward = function () {
    return this.digCaptureAward;
}
DigModel.prototype.setOpenEnemy = function (flag) {
    this.isOpenEnemy = flag;
}
DigModel.prototype.getOpenEnemy = function () {
    return this.isOpenEnemy;
}
DigModel.prototype.getIsDigRed = function () {
    return this.isDigRed;
}

/**
 * 消息处理接口
 */

//获取掠夺列表
DigModel.prototype.onRetDigRobList = function (msgid, data) {
    var robList = data;

    //角色战力
    var fight = UserModel.GetUserMainInfo().fightval;//获得战力的数值
    var fightMax = fight * 1.5;
    var fightMix = fight * 0.5;

    var enmyVecTmp1 = [];
    var enmyVecTmp2 = [];

    if (robList.datas == null) { return; };

    for (let i = 0; i < robList.datas.length; i++) {
        if (robList.datas[i].fight > fightMix && robList.datas[i].fight < fightMax) {
            enmyVecTmp1.push(robList.datas[i]);
        } else {
            enmyVecTmp2.push(robList.datas[i]);
        }
    };

    //战力排序
    enmyVecTmp1.sort(function (val1, val2) {
        return val1 - val2;
    });

    //合并数组
    this.digRobList = _.concat(enmyVecTmp1, enmyVecTmp2);

    //可占领列表信息更新
    NotificationController.Emit(Define.EVENT_KEY.DIG_RET_ROBLIST);
}

//打开庄园收获界面
DigModel.prototype.onRetGetDigReward = function (msgid, data) {
    this.digReward = data;
    ViewController.OpenView(UIName.UI_DIG_HARVEST_NODE, "ViewLayer");
}

//获取占领奖励信息
DigModel.prototype.onRetDigPkAward = function (msgid, data) {
    this.digPkAward = data;
    ViewController.OpenView(UIName.UI_DIG_OCCUPATION_NODE, "ViewLayer", { typeId: 1 });//refreshView
}

//返回占领区矿点信息
DigModel.prototype.onRetCaptureMineInfo = function (msgid, data) {
    this.captureMineInfo = data;
    ViewController.OpenView(UIName.UI_DIG_OCCUPATION_NODE, "ViewLayer", { typeId: 2 });//refreshMyView
}

//返回本人单个矿点信息
DigModel.prototype.onRetOneMineInfo = function (msgid, data) {
    this.oneMineInfo = data.data;
    ViewController.OpenView(UIName.UI_DIG_OCCUPATION_NODE, "ViewLayer", { typeId: 3 });//recaptureView
}

//返回所有矿的当前状态，用于刷新所有挖宝界面
DigModel.prototype.onRetAllDigStatus = function (msgid, data) {
    this.allDigStatus = data;
    NotificationController.Emit(Define.EVENT_KEY.DIG_RESET_VIEW);

    this.isDigRed = false;
    let minesStatusTab = _.get(data, "minesStatus", []);
    for (let i = 0; i < minesStatusTab.length; i++) {
        let status = _.get(minesStatusTab[i], "status", 0);
        if (status == 1 || status == 3) {
            this.isDigRed = true;
        };
    };
    NotificationController.Emit(Define.EVENT_KEY.RED_DIG);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);


    let digViewIsOpen = GlobalModel.GetIsOpenDigView();
    if (digViewIsOpen) {
        //判断庄园开放等级
        // let mapLevel = UserModel.GetTopMapid();
        // let diglimit = ConfigController.GetConfigById('levellimit_data',13);
        // if(mapLevel < diglimit.limit){
        //     let mapTbx = ConfigController.GetConfigById("newmap_data", diglimit.limit);
        //     let mapName = mapTbx.disc;
        //     let tipStr = "进入"+mapName+"后开放庄园功能";
        //     NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, tipStr);
        //     return;
        // };

        //玩家本身庄园界面
        ViewController.OpenView(UIName.UI_DIGVIEW, "ViewLayer");
    }
}

//返回掠夺目标挖宝信息
DigModel.prototype.onRetRobDigInfo = function (msgid, data) {
    cc.log("DigModel.prototype.onRetRobDigInfo");
    //其他玩家庄园界面
    this.robDigInfo = data;
    NotificationController.Emit(Define.EVENT_KEY.DIG_RET_ROBDIGINFO);
    if (this.needOpenDigOtherView) {
        ViewController.OpenView(UIName.UI_DIG_OTHER_VIEW, "ViewLayer");
        this.needOpenDigOtherView = false;
    };

}

//返回占领成功结果
DigModel.prototype.onRetDigCaptureAwardResult = function (msgid, data) {
    this.digCaptureAward = data;
    ViewController.OpenView(UIName.UI_DIG_CAPSUCC_NODE, "ViewLayer");
}

//收货宝物时，空间不足通知客户端
DigModel.prototype.onNotifyBagNoSpace = function (msgid, data) {
    let noticeStr = "包裹空间不足，不能收获：\n您可以在包裹界面通过批量熔炼将额外装备转化为打造值";
    NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, noticeStr);
}


module.exports = new DigModel();
