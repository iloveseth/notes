const _ = require('lodash');
const NetWorkController = require('../Controller/NetWorkController');
const ConfigController = require('../Controller/ConfigController');
const ViewController = require('../Controller/ViewController');
const NotificationController = require('../Controller/NotificationController');
const Define = require('../Util/Define');
const Item = require('./Item');
const Tools = require("../Util/Tools");
const UIName = require('../Util/UIName');

var GlobalModel = function () {
    this.loginServerData = null; //登录时的区服信息
    this.isLookMyEquip = true;      //是否是查看自己的装备
    this.forgeTab = 0;      //铁匠铺分页
    this.boardType = 0;     //选择的排行榜类型
    this.isOpenDigView = false;//是否打开庄园界面
    this.commonRewards = [];
    this.isFirstGame = false;
    this.offlineReport = null;
    this.mainMapData = [];       //主界面地图可跑动数据
    this.septMapData = [];      //工会地图可跑动数据
    this.dailyHasSign = false;  //是否已经每日签到
    this.randomPlayers = [];
    this.targetNeedFade = false;
    this.needOpenActivityHome = false;
    this.needChangeActiveShowNode = false;
    this.canShowTargetGuideView = true;
    this.isShowTargetGuideView = false;
    this.chatViewIsOpen = false;
    this.loadSceneName = '';
    this.choosedSoulType = 0;
    this.vipBannerHasShow = false;
    this.vip_1_is_show = false;
    this.vip_2_is_show = false;
    this.isMapGo = false;
}

GlobalModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('com.commonRewardUI', this, this.onRewardUI);
    NetWorkController.AddListener('notice.notifySeptAct', this, this.onnotifySeptAct);
    NetWorkController.AddListener('msg.OfflineReport', this, this.onOfflineReport);
    NetWorkController.AddListener('msg.retRandomUser', this, this.onRetRandomUser);
    NetWorkController.AddListener('sign.retSignNew', this, this.onRetSignNew);
    NetWorkController.AddBinaryListener(Define.MSG_ID.stLoginKickReconnect, this, this.onLoginKickReconnect);

    let mapData = ConfigController.GetConfig('runmap_data');
    for (let i = 0; i < mapData.length / 2; i++) {
        let firstdata = mapData[2 * i];
        let result = [];
        for (let i = 0; i < 32; i++) {
            result.push((((firstdata >> (31 - i)) & 1) == 1) ? 0 : 1);
        }
        let seconddata = mapData[2 * i + 1];
        for (let i = 0; i < 32; i++) {
            result.push((((seconddata >> (31 - i)) & 1) == 1) ? 0 : 1);
        }
        this.mainMapData.push(result);
    }
    this.initMapData('septmap_data', this.septMapData);
    Tools.InvokeCallback(cb, null);
}
GlobalModel.prototype.Reload = function (cb) {
    this.isLookMyEquip = true;      //是否是查看自己的装备
    this.forgeTab = 0;      //铁匠铺分页
    this.boardType = 0;     //选择的排行榜类型
    this.isOpenDigView = false;//是否打开庄园界面
    this.commonRewards = [];
    this.isFirstGame = false;
    this.offlineReport = null;
    this.dailyHasSign = false;  //是否已经每日签到
    this.randomPlayers = [];
    this.targetNeedFade = false;
    this.needOpenActivityHome = false;
    this.needChangeActiveShowNode = false;
    this.canShowTargetGuideView = true;
    this.isShowTargetGuideView = false;
    Tools.InvokeCallback(cb, null);
}

GlobalModel.prototype.initMapData = function (cfg, array) {
    let mapData = ConfigController.GetConfig(cfg);
    for (let i = 0; i < mapData.length / 2; i++) {
        let firstdata = mapData[2 * i];
        let result = [];
        for (let i = 0; i < 32; i++) {
            result.push((((firstdata >> (31 - i)) & 1) == 1) ? 0 : 1);
        }
        let seconddata = mapData[2 * i + 1];
        for (let i = 0; i < 32; i++) {
            result.push((((seconddata >> (31 - i)) & 1) == 1) ? 0 : 1);
        }
        array.push(result);
    }
}

/**
 * 对外接口
 */
GlobalModel.prototype.SetIsLookMyEquip = function (isMe) {
    this.isLookMyEquip = isMe;
}

GlobalModel.prototype.GetIsLookMyEquip = function () {
    return this.isLookMyEquip;
}
//登录时的区服信息
GlobalModel.prototype.SetLoginServerData = function (data) {
    this.loginServerData = data;
}

GlobalModel.prototype.GetLoginServerData = function () {
    return this.loginServerData;
}

GlobalModel.prototype.SetBoardType = function (board_type) {
    this.boardType = board_type;
}
GlobalModel.prototype.GetBoardType = function () {
    return this.boardType;
}
GlobalModel.prototype.SetIsOpenDigView = function (isOpen) {
    this.isOpenDigView = isOpen;
}
GlobalModel.prototype.GetIsOpenDigView = function () {
    return this.isOpenDigView;
}
GlobalModel.prototype.SetIsFirstGame = function (isfirst) {
    this.isFirstGame = isfirst;
}
GlobalModel.prototype.IsFirstGame = function () {
    return this.isFirstGame;
}
//下一波奖励的数据
GlobalModel.prototype.GetNextRewardGroup = function () {
    if (this.commonRewards.length > 0) {
        return this.commonRewards.shift();
    }
    return null;
}

GlobalModel.prototype.GetDailyHasSign = function () {
    return this.dailyHasSign;
}
GlobalModel.prototype.SetDailyHasSign = function (isSign) {
    this.dailyHasSign = isSign;
}
/**
 * 消息处理接口
 */
GlobalModel.prototype.onRewardUI = function (msgid, data) {
    let rewarddefine = ConfigController.GetConfigById('rewardinfo_data', data.type);
    let rewards = [];
    for (let i = 0; i < data.itemlist.length; i++) {
        let itemdata = data.itemlist[i];
        let itemdefine = Item.GetItemConfig(_.get(itemdata, 'id', 0));
        let info = Item.GenerateObjectFromDefine(itemdefine, _.get(itemdata, 'num', 0));
        let color = _.get(itemdata, 'color', 0);
        if (color != 0) {
            info.color = color;
        }
        rewards.push(info);
    }
    this.commonRewards.push({
        title: _.get(rewarddefine, 'title', ''),
        desc: _.get(rewarddefine, 'info', ''),
        rewards: rewards
    });
    if (!ViewController.IsOpen(UIName.UI_REWARDSHOW)) {
        ViewController.OpenView(UIName.UI_REWARDSHOW, "MaskLayer");
    }
    NotificationController.Emit(Define.EVENT_KEY.REWARD_UPDATE);
}

GlobalModel.prototype.onnotifySeptAct = function (msgid, data) {
    let title = '消息提示';
    let desc = '';
    let _handler = null;

    if (data.type == 0 && ViewController.IsOpen(UIName.UI_SEPTESCORTVIEW)) {
        return;
    }

    switch (data.type) {    //活动类型 0 公会运镖 1公会守边 2公会战 3公会宝藏 4 世界boss
        case 0:
            desc = '公会发起了公会护送召集,他们需要你的帮助!';
            _handler = function () {
                NetWorkController.SendProto('septpk.reqSeptGuard', {});
            };
            break;
    }

    NotificationController.Emit(Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
        {
            name: '前往完成',
            handler: function () {
                Tools.InvokeCallback(_handler);
            },
        },
        {
            name: '取消'
        }
    ]);
}
GlobalModel.prototype.onOfflineReport = function (msgid, data) {
    this.offlineReport = data;
}
GlobalModel.prototype.onRetRandomUser = function (msgid, data) {
    cc.log(data);
    this.randomPlayers = _.get(data, 'list', []);
    NotificationController.Emit(Define.EVENT_KEY.RANDOMPLAYER_UPDATE);
}

GlobalModel.prototype.onRetSignNew = function (msgid, msg) {
    let today = msg.today;

    //是否签到
    this.dailyHasSign = false;
    let hassignList = _.get(msg, "hassign", []);
    for (let i = 0; i < hassignList.length; i++) {
        let hassignDay = hassignList[i];
        if (hassignDay == today) {
            this.dailyHasSign = true;
        };
    };

    NotificationController.Emit(Define.EVENT_KEY.RED_DAILY_SIGN);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
}

GlobalModel.prototype.onLoginKickReconnect = function (buffer) {
    const Game = require('../Game');
    let result = Game.CppCmd.ParseLoginKickReconnect(buffer);
    if (result.connect == 0) {
        //登出
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '您的账号已在他处登陆');
        Game.Platform.Logout();
    }
}

module.exports = new GlobalModel();