const _ = require('lodash');
const moment = require('moment');
const User = require('./User');
const ConfigController = require('../Controller/ConfigController');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const Tools = require('../Util/Tools');
const Define = require('../Util/Define');
const CountDown = require('../Util/CountDown')
const AutoActionInterval = 3;
const AutoFightBossStatus = {
    Status_Fail: 0,
    Status_Idle: 1,
    Status_Fighting: 2,
    Status_Success: 3,
    Status_Waitting: 4,
}
let LevelModel = function () {
    //表哥数据
    this.mapDefines = {};
    this.sceneDefines = {};
    //数据
    this.levelInfo = null;
    this.countInfo = null;
    this.sortInfo = null;
    //排名的变化情况
    this.levelSortDiff = 0;
    this.fightSortDiff = 0;
    this.mapSortDiff = 0;
    //快速战斗信息
    this.fastFightInfo = null;
    this.fastFightAddition = null;
    //地上的宝箱 
    this.rewardItems = [];
    //这张地图上的敌人
    this.mapEnemies = [];
    //自动操作
    this.autoing = false;
    this.leaveMap = false;
    this.passTime = 0;
    this.fightBossStatus = AutoFightBossStatus.Status_Fail;
    this.autoResult = null;
}

LevelModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('newfight.RetNewFightInfo', this, this.onRetNewFightInfo);
    NetWorkController.AddListener('sort.retSortInfo', this, this.onRetSortInfo);
    NetWorkController.AddListener('newfight.retCountInfo', this, this.onRetCountInfo);
    NetWorkController.AddListener('newfight.UpdateMaxMapID', this, this.onUpdateMaxMapId);
    NetWorkController.AddListener('msg.onlineScene', this, this.onOnlineScene);
    NetWorkController.AddListener('msg.FastFightInfoPush', this, this.onFastFightInfoPush);
    NetWorkController.AddListener('msg.RetBuyFastFight', this, this.onRetBuyFastFight);
    NetWorkController.AddListener('sobj.retSceneObj', this, this.onSceneObj);
    NetWorkController.AddListener('newfight.retCurMapEnemy', this, this.onRetCurMapEnemy);
    NetWorkController.AddListener('msg.FastFightAdd', this, this.onFastFightAdd);
    NetWorkController.AddListener('msg.oneFight', this, this.onOneFight);
    let mapdefines = ConfigController.GetConfig('newmap_data');
    for (let i = 0; i < mapdefines.length; i++) {
        let define = mapdefines[i];
        if (define.id != null) {
            this.mapDefines[define.id] = _.cloneDeep(define);
        }
    }
    let scenedefines = ConfigController.GetConfig('newscene_data');
    for (let i = 0; i < scenedefines.length; i++) {
        let define = scenedefines[i];
        if (define.id != null) {
            this.sceneDefines[define.id] = _.cloneDeep(define);
        }
    }
    Tools.InvokeCallback(cb, null);
}
LevelModel.prototype.Reload = function (cb) {
    this.levelInfo = null;
    this.countInfo = null;
    this.sortInfo = null;
    this.levelSortDiff = 0;
    this.fightSortDiff = 0;
    this.mapSortDiff = 0;
    this.fastFightInfo = null;
    this.fastFightAddition = null;
    this.rewardItems = [];
    this.mapEnemies = [];
    this.autoing = false;
    this.leaveMap = false;
    this.passTime = 0;
    this.fightBossStatus = AutoFightBossStatus.Status_Fail;
    this.autoResult = null;
    Tools.InvokeCallback(cb, null);
}

LevelModel.prototype.Update = function (dt) {
    if (!this.leaveMap) {
        return;
    }
    this.passTime += dt;
    if (this.passTime < AutoActionInterval) {
        return;
    }
    this.passTime = 0;
    const GuideController = require('../Controller/GuideController');
    if (GuideController.IsFunctionOpen(Define.FUNCTION_TYPE.TYPE_AUTOPASS)) {
        if (this.isAutoing()) {
            this.autoAction();
        }
    }
    if (GuideController.IsFunctionOpen(Define.FUNCTION_TYPE.TYPE_AUTOPICK)) {
        this.autoPickup();
    }

};
/**
 * 对外接口
 */
//配置数据 
LevelModel.prototype.GetMapDefine = function (mapid) {
    return ConfigController.GetConfigById('newmap_data', mapid);
}
LevelModel.prototype.GetMapDifficult = function (mapid) {
    let ret = '';
    let mapdefine = this.mapDefines[mapid];
    if (mapdefine != null) {
        let names = mapdefine.disc.split(' ');
        ret = names[0];
    }
    return ret;
}
LevelModel.prototype.GetMapName = function (mapid) {
    let ret = '';
    let mapdefine = this.mapDefines[mapid];
    if (mapdefine != null) {
        let names = mapdefine.disc.split(' ');
        ret = names[1];
    }
    return ret;
}
LevelModel.prototype.GetMapIndex = function (mapid) {
    let ret = '';
    let mapdefine = this.mapDefines[mapid];
    if (mapdefine != null) {
        let names = mapdefine.disc.split(' ');
        ret = names[2];
    }
    return ret;
}
LevelModel.prototype.GetMapBoss = function (mapid) {
    let mapdefine = this.mapDefines[mapid];
    if (mapdefine) {
        return ConfigController.GetConfigById('newboss_data', mapdefine.boss);
    }
    return null;
}
LevelModel.prototype.GetSceneByMap = function (mapid) {
    let defines = ConfigController.GetConfig('newscene_data');
    return _.find(defines, function (o) {
        return mapid <= _.get(o, 'max_pass', 0) && mapid >= _.get(o, 'min_pass', 0);
    })
}
//基础数据
LevelModel.prototype.GetCurMapId = function () {
    let ret = _.get(this, 'levelInfo.cur_mapid', null);
    return ret == null ? User.GetMapid() : ret;
}
LevelModel.prototype.GetNextMapId = function () {
    let mapid = this.GetCurMapId();
    let define = this.GetMapDefine(mapid);
    if (define != null) {
        return define.nextmap;
    }
    return 0;
}
LevelModel.prototype.GetMaxMapId = function () {
    let ret = _.get(this, 'levelInfo.max_mapid', null);
    return ret == null ? User.GetMaxMapid() : ret;
}
LevelModel.prototype.GetTopMapId = function () {
    let ret = _.get(this, 'levelInfo.top_mapid', null);
    return ret == null ? User.GetTopMapid() : ret;
}
LevelModel.prototype.GetBossCd = function () {
    return _.get(this, 'levelInfo.left_boss_cd', null);
}
//排行数据
LevelModel.prototype.GetLevelSort = function () {
    let rank = _.get(this, 'sortInfo.levelsort', '未上榜');
    return rank == 0 ? '未上榜' : rank;
}
LevelModel.prototype.GetFightSort = function () {
    let rank = _.get(this, 'sortInfo.fightsort', '未上榜');
    return rank == 0 ? '未上榜' : rank;
}
LevelModel.prototype.GetMapSort = function () {
    let rank = _.get(this, 'sortInfo.mapsort', '未上榜');
    return rank == 0 ? '未上榜' : rank;
}
//统计数据
LevelModel.prototype.GetLevelEffect = function () {
    return _.get(this, 'countInfo.effect', 0.0);
}
LevelModel.prototype.GetLevelEffectStr = function () {
    let effect = _.get(this, 'countInfo.effect', 0.0) * 100.0;
    return parseFloat(effect).toFixed(2) + '%';
}
LevelModel.prototype.GetCoinSpeed = function () {
    let speed = _.get(this, 'countInfo.money_per_s', 0);
    return speed;
}
LevelModel.prototype.GetCoinSpeedStr = function () {
    let speed = _.get(this, 'countInfo.money_per_s', 0);
    let result = speed * 60 * 60;
    return Tools.UnitConvert(result) + '/时';
}
LevelModel.prototype.GetCoinSpeedStrHalf = function () {
    let speed = _.get(this, 'countInfo.money_per_s', 0);
    let result = speed * 60 * 60 * 0.5;
    return Tools.UnitConvert(result) + '/时';
}
LevelModel.prototype.GetExpSpeed = function () {
    let speed = _.get(this, 'countInfo.exp_per_s', 0);
    return speed;
}
LevelModel.prototype.GetExpSpeedStr = function () {
    let speed = _.get(this, 'countInfo.exp_per_s', 0);
    let result = speed * 60 * 60;
    return Tools.UnitConvert(result) + '/时';
}
LevelModel.prototype.GetExpSpeedStrHalf = function () {
    let speed = _.get(this, 'countInfo.exp_per_s', 0);
    let result = speed * 60 * 60 * 0.5;
    return Tools.UnitConvert(result) + '/时';
}
LevelModel.prototype.GetLevelupCountDown = function () {
    let diff = User.GetLevelupExp() - User.GetExp();
    if (diff > 0) {
        let seconds = diff / Math.round(_.get(this, 'countInfo.exp_per_s', 0));
        let mom = moment.duration(seconds, 's');
        return mom.days() > 0 ? mom.days() + '天' + mom.hours() + '时' : mom.hours() + '时' + mom.minutes() + '分';
    } else {
        return '0时0分';
    }
}
LevelModel.prototype.GetLevelupCountDownDouble = function () {
    let diff = User.GetLevelupExp() - User.GetExp();
    if (diff > 0) {
        let seconds = diff / Math.round(_.get(this, 'countInfo.exp_per_s', 0)*0.5);
        let mom = moment.duration(seconds, 's');
        return mom.days() > 0 ? mom.days() + '天' + mom.hours() + '时' : mom.hours() + '时' + mom.minutes() + '分';
    } else {
        return '0时0分';
    }
}
//快速战斗
LevelModel.prototype.GetFastFightCost = function () {
    return _.get(this, 'fastFightInfo.needgold', 0);
}
LevelModel.prototype.GetFastFightTimes = function () {
    return _.get(this, 'fastFightInfo.lefttime', 0);
}
LevelModel.prototype.GetFastFightValue = function () {
    return _.get(this, 'fastFightInfo.hours', 0);
}
LevelModel.prototype.GetFastFightAdditionLastTime = function () {
    return _.get(this, 'fastFightInfo.addbufftime', 0) / 60;
}
LevelModel.prototype.GetFastFightAdditionPercent = function () {
    return _.get(this, 'fastFightInfo.addper', 0);
}
LevelModel.prototype.GetFastCurFightAdditionPercent = function () {
    return _.get(this, 'fastFightAddition.addper', 0);
}
//地图上的其他东西
LevelModel.prototype.GetRandomReward = function () {
    if (this.rewardItems.length == 0) {
        return null;
    }
    return this.rewardItems[Tools.GetRandomInt(0, this.rewardItems.length)];
}
LevelModel.prototype.RemoveMapReward = function (id) {
    _.remove(this.rewardItems, { id: id });
}
LevelModel.prototype.ClearEnemy = function () {
    this.mapEnemies = [];
}
LevelModel.prototype.GetFirstEnemy = function () {
    if (this.mapEnemies.length > 0) {
        return this.mapEnemies.shift();
    } else {
        return null;
    }
}
//自动战斗
LevelModel.prototype.EnterLevelView = function () {
    this.leaveMap = false;
}
LevelModel.prototype.LeaveLevelView = function () {
    this.leaveMap = true;
    this.passTime = 0;
    if (this.GetMaxMapId() == this.GetCurMapId()) {
        this.fightBossStatus = AutoFightBossStatus.Status_Idle;
    } else {
        this.fightBossStatus = AutoFightBossStatus.Status_Success;
    }
    this.autoResult = null;
}
/**
 * 消息处理接口
 */
LevelModel.prototype.onRetNewFightInfo = function (msgid, data) {
    this.levelInfo = _.cloneDeep(data);
    CountDown.SetCountDown(CountDown.Define.TYPE_LEVELBOSS, _.get(data, 'left_boss_cd', 0));
    NotificationController.Emit(Define.EVENT_KEY.LEVEL_DATAUPDATE);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_FAIRYRED);
    if (this.isAutoing() && this.fightBossStatus == AutoFightBossStatus.Status_Waitting) {
        if (this.GetMaxMapId() == this.GetCurMapId()) {
            this.fightBossStatus = AutoFightBossStatus.Status_Idle;
        } else {
            this.fightBossStatus = AutoFightBossStatus.Status_Success;
        }
        cc.log('ceshiceshi 7 地图都跳过来了');
    }
};
LevelModel.prototype.onRetSortInfo = function (msgid, data) {
    if (this.sortInfo != null) {
        this.levelSortDiff = _.get(data, 'levelsort', 1) - _.get(this, 'sortInfo.levelsort', 1);
        this.fightSortDiff = _.get(data, 'fightsort', 1) - _.get(this, 'sortInfo.fightsort', 1);
        this.mapSortDiff = _.get(data, 'mapsort', 1) - _.get(this, 'sortInfo.mapsort', 1);
    }
    this.sortInfo = _.cloneDeep(data);
    NotificationController.Emit(Define.EVENT_KEY.LEVEL_SORTUPDATE);
}
LevelModel.prototype.onRetCountInfo = function (msgid, data) {
    this.countInfo = _.cloneDeep(data);
    NotificationController.Emit(Define.EVENT_KEY.LEVEL_COUNTUPDATE);
}
LevelModel.prototype.onUpdateMaxMapId = function (msgid, data) {
    _.set(this, 'levelInfo.max_mapid', data.value);
    User.SetMaxMapId(data.value);
    let Game = require('../Game');
    Game.Platform.SetTDEventData(Define.TD_EVENT.EventPlayerMap,{mapid:data.value, charid:User.GetCharid()});
    NotificationController.Emit(Define.EVENT_KEY.FIRST_OPENFUNCTION);
    if (this.isAutoing() && this.fightBossStatus == AutoFightBossStatus.Status_Waitting) {
        this.fightBossStatus = AutoFightBossStatus.Status_Success;
        cc.log('ceshiceshi 5 奖励领完最大地图都变了');
    }
}
LevelModel.prototype.onOnlineScene = function (msgid, data) {
    this.fastFightInfo = _.cloneDeep(_.get(data, 'fastfight', null));
    NotificationController.Emit(Define.EVENT_KEY.LEVEL_FASTFIGHTUPDATE);
}
LevelModel.prototype.onFastFightInfoPush = function (msgid, data) {
    this.fastFightInfo = _.cloneDeep(data);
    NotificationController.Emit(Define.EVENT_KEY.LEVEL_FASTFIGHTUPDATE);
}
LevelModel.prototype.onRetBuyFastFight = function (msgid, data) {
    this.fastFightInfo = _.cloneDeep(_.get(data, 'fastfight', null));
    NotificationController.Emit(Define.EVENT_KEY.LEVEL_FASTFIGHTUPDATE);
}
LevelModel.prototype.onSceneObj = function (msgid, data) {
    this.rewardItems = _.cloneDeep(data.list) || [];
}
LevelModel.prototype.onRetCurMapEnemy = function (msgid, data) {
    this.mapEnemies = _.get(data, 'list', []);
    NotificationController.Emit(Define.EVENT_KEY.LEVEL_ENEMIESUPDATE);
}
LevelModel.prototype.onFastFightAdd = function (msgid, data) {
    this.fastFightAddition = data;
    CountDown.SetCountDown(CountDown.Define.TYPE_FASTFIGHTBUFF, _.get(data, 'lasttime'));
}
LevelModel.prototype.onOneFight = function (msgid, data) {
    if (this.isAutoing() && this.fightBossStatus == AutoFightBossStatus.Status_Waitting) {
        this.autoResult = data;
        this.fightBossStatus = AutoFightBossStatus.Status_Fighting;
        cc.log('ceshiceshi 2 打boss结果出来了');
    }
}
//====================  自动处理函数  ====================
LevelModel.prototype.autoAction = function () {
    // 自动操作
    if (User.GetVipValue('mapauto') == 0) {
        return;
    }
    if (User.GetExp() >= User.GetLevelupExp()) {
        //可以升级 那就升
        NetWorkController.SendProto('msg.doLevelupSelf', {});
    } else if (this.GetCurMapId() != this.GetMaxMapId()) {
        //跳到下一关 虽然有最高关了 但还是有可能还在自动boss呢
        if (this.fightBossStatus == AutoFightBossStatus.Status_Success) {
            let nextid = this.GetNextMapId();
            NetWorkController.SendProto('newfight.NewChangeMap', { mapid: nextid });
            this.fightBossStatus = AutoFightBossStatus.Status_Waitting;
            cc.log('ceshiceshi 6 挑战地图了');
        }
    } else {
        //已经是最高关了 看看
        switch (this.fightBossStatus) {
            case AutoFightBossStatus.Status_Idle:
                //可以打boss
                if (CountDown.GetCountDown(CountDown.Define.TYPE_LEVELBOSS) <= 0) {
                    NetWorkController.SendProto('newfight.NewFightBoss', {});
                    this.fightBossStatus = AutoFightBossStatus.Status_Waitting;
                    cc.log('ceshiceshi 1 打boss了');
                }
                break;
            case AutoFightBossStatus.Status_Fighting:
                //结果回来了 看看结果吧
                let result = _.get(this, 'autoResult.result_type', false);
                this.autoResult = null;
                if (result) {
                    //胜利了 领奖励
                    NetWorkController.SendProto('newfight.reqBossReward', {});
                    this.fightBossStatus = AutoFightBossStatus.Status_Waitting;
                    cc.log('ceshiceshi 3 胜利领奖了');
                } else {
                    //失败了 停止吧
                    this.fightBossStatus = AutoFightBossStatus.Status_Fail;
                    cc.log('ceshiceshi 4 失败停止了');
                }
                break;
            case AutoFightBossStatus.Status_Fail:
                //失败了 就不再自动打了
                break;
            case AutoFightBossStatus.Status_Waitting:
                //还在等消息 打个毛
                break;
            default:
                break;
        }
    }
};
LevelModel.prototype.autoPickup = function () {
    //自动捡道具
    if (User.GetVipValue('maploot') == 0 || !this.leaveMap) {
        return;
    }
    if (this.rewardItems.length > 0) {
        let reward = this.rewardItems[0];
        let id = _.get(reward, 'id', null);
        this.RemoveMapReward(id);
        if (id != null) {
            NetWorkController.SendProto('sobj.getSceneObj', { id: id });
        }
    }
}
LevelModel.prototype.isAutoing = function () {
    const GuideController = require('../Controller/GuideController');
    return GuideController.IsFunctionOpen(Define.FUNCTION_TYPE.TYPE_AUTOPASS) && this.autoing && this.leaveMap;
}
module.exports = new LevelModel();

