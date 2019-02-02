const _ = require('lodash');
const Define = require('../Util/Define');
const Tools = require('../Util/Tools');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const ConfigController = require('../Controller/ConfigController');
const TimeController = require('../Controller/TimeController');
const User = require('./User');

const WorldBoss = function () {
    this.bossRewardDefines = [];

    this.worldBossBases = [];
    this.worldBossUpdateTime = TimeController.GetCurTime();
    this.worldBossDamageList = {};
    this.worldBossAttackList = {};
    this.worldBossHpList = {};
    this.curWorldBoss = null;

    this.attackedBoss = null;
    this.isAuto = false;
    this.autoAttackedBoss = null;

    this.stateAuto = false;
}
WorldBoss.prototype.Init = function (cb) {
    NetWorkController.AddListener('wboss.RetWBossBase', this, this.onRetWBossBase);
    NetWorkController.AddListener('wboss.RetWBossCardInfo', this, this.onRetWBossCardInfo);
    NetWorkController.AddListener('wboss.RetCurWBossInfo', this, this.onRetCurWBossInfo);
    NetWorkController.AddListener('wboss.RetWBossDamList', this, this.onRetWBossDamList);
    NetWorkController.AddListener('wboss.RetWBossPkList', this, this.onRetWBossPkList);
    NetWorkController.AddListener('wboss.StartAttWBossOK', this, this.onStartAttWBossOK);
    NetWorkController.AddListener('wboss.BroadWBossHP', this, this.onBroadWBossHP);
    NetWorkController.AddListener('wboss.WBossDie', this, this.onWBossDie);
    NetWorkController.AddListener('wboss.CancleAttWBoss', this, this.onCancleAttWBoss);
    NetWorkController.AddListener('wboss.retAttBossDam', this, this.onRetAttBossDam);
    NetWorkController.AddListener('wboss.WBossEscape', this, this.onWBossEscape);
    NetWorkController.AddListener('wboss.RetSetAutoFight',this,this.onRetSetAutoFight);
    this.bossRewardDefines = ConfigController.GetConfig('wbossreward_data');
    Tools.InvokeCallback(cb);
}

WorldBoss.prototype.Reload = function (cb) {
    this.worldBossBases = [];
    this.worldBossUpdateTime = TimeController.GetCurTime();
    this.worldBossDamageList = {};
    this.worldBossAttackList = {};
    this.worldBossHpList = {};
    this.curWorldBoss = null;
    this.attackedBoss = null;
    this.isAuto = false;
    this.autoAttackedBoss = null;
    this.stateAuto = false;
    Tools.InvokeCallback(cb);
}
//====================  对外接口  ====================
WorldBoss.prototype.GetBossBaseById = function (bossid) {
    return _.find(this.worldBossBases, { bossid: bossid });
}
WorldBoss.prototype.GetFreshCoundDown = function (bossid) {
    let base = this.GetBossBaseById(bossid);
    if (base == null) {
        return 0;
    }
    if (base.cdtime != null) {
        let cur = TimeController.GetCurTime();
        return Math.max(0, base.cdtime - (cur - this.worldBossUpdateTime));
    }
    return 0;
}
WorldBoss.prototype.GetLastHpProgress = function (bossid, fixed = 2) {
    let hp = this.worldBossHpList[bossid];
    let curhp = _.get(hp, 'curhp', 0);
    let maxhp = _.get(hp, 'maxhp', 0);
    if (maxhp != 0) {
        return (curhp * 100 / maxhp).toFixed(fixed);
    }
    return 0;
}

WorldBoss.prototype.GetWorldBossDamageData = function (bossid) {
    return this.worldBossDamageList[bossid];
}
WorldBoss.prototype.GetWorldBossAttackCountDown = function (bossid) {
    let attackData = this.worldBossAttackList[bossid];
    if (attackData == null) {
        return -1;
    }
    let cur = TimeController.GetCurTimeMs();
    // if(this.hasattack){
    //     return attackData.cdtime;
    // }
    // else{
    return Math.max(0, attackData.cdtime - (cur - attackData.recieveTime) - attackData.dotime);
    // }
}
WorldBoss.prototype.GetWorldBossAttackTotalCd = function (bossid) {
    let attackData = this.worldBossAttackList[bossid];
    if (attackData == null) {
        return 0;
    }
    return attackData.cdtime;
}
WorldBoss.prototype.AttackedBoss = function (id) {
    this.attackedBoss = id;
    this.worldBossAttackList[id] = null;
    NetWorkController.SendProto('wboss.DoAttWBoss', { bossid: id });
}
WorldBoss.prototype.GetAttackedBoss = function () {
    return this.attackedBoss;
}
WorldBoss.prototype.GetAutoAttackedBoss = function () {
    return this.autoAttackedBoss;
}
WorldBoss.prototype.GetKillRewardId = function (bossid) {
    let bossdefine = ConfigController.GetConfigById('worldboss_data', bossid);
    if (bossdefine == null) {
        return 0;
    }
    let awardDefine = this.GetBossAwardDefine(bossdefine.killaward);
    if (awardDefine == null) {
        return 0;
    }
    return awardDefine.killreward;
}
WorldBoss.prototype.GetSealRewardId = function (bossid) {
    let bossdefine = ConfigController.GetConfigById('worldboss_data', bossid);
    if (bossdefine == null) {
        return 0;
    }
    let awardDefine = this.GetBossAwardDefine(bossdefine.sealaward);
    if (awardDefine == null) {
        return 0;
    }
    return awardDefine.sealreward;
}
WorldBoss.prototype.GetBossAwardDefine = function (award) {
    let level = User.GetLevel();
    for (let i = 0; i < this.bossRewardDefines.length; i++) {
        let define = this.bossRewardDefines[i];
        if (define.bosstype == award && level >= define.levelmin && level <= define.levelmax) {
            return define;
        }
    }
    return null;
}
WorldBoss.prototype.GetCurBossId = function () {
    return _.get(this, 'curWorldBoss.bossid', 0);
}
WorldBoss.prototype.AutoFight = function (bossid) {
    this.attackedBoss = bossid;
    this.isAuto = true;
    this.autoAttackedBoss = bossid;
    NetWorkController.SendProto('wboss.SetAutoFight', { type: 1, bossid: bossid });
}
WorldBoss.prototype.CancleFight = function () {
    this.worldBossAttackList[this.attackedBoss] = null;
    this.attackedBoss = null;
    this.isAuto = false;
}
WorldBoss.prototype.CancleAutoFight = function () {
    this.CancleFight();
    NetWorkController.SendProto('wboss.SetAutoFight', { type: 2, bossid: this.autoAttackedBoss });
    this.autoAttackedBoss = null;
}
//====================  消息处理  ====================
WorldBoss.prototype.onRetWBossBase = function (msgid, data) {
    this.worldBossUpdateTime = TimeController.GetCurTime();
    this.worldBossBases = _.cloneDeep(data.list) || [];
    this._sortWorldBossBase();
    for (let i = 0; i < data.list.length; i++) {
        let info = data.list[i];
        this._updateBossHp(info.bossid, info.maxhp, info.hp);
    }
    NotificationController.Emit(Define.EVENT_KEY.WORLDBOSS_UPDATE);
}
WorldBoss.prototype.onRetWBossCardInfo = function (msgid, data) {
    this.worldBossUpdateTime = TimeController.GetCurTime();
    this.worldBossBases = _.cloneDeep(data.list) || [];
    this._sortWorldBossBase();
    for (let i = 0; i < data.list.length; i++) {
        let info = data.list[i];
        this._updateBossHp(info.bossid, info.maxhp, info.hp);
    }
    NotificationController.Emit(Define.EVENT_KEY.WORLDBOSS_UPDATE);
}
WorldBoss.prototype.onRetCurWBossInfo = function (msgid, data) {
    this.curWorldBoss = _.cloneDeep(data);
    this._updateBossHp(data.bossid, data.maxhp, data.hp);
    if(User.GetViplevel() >= 4 || data.autofight > 0){
        this.stateAuto = true;
    }
    NotificationController.Emit(Define.EVENT_KEY.WORLDBOSS_CURBOSSINFO);
}
WorldBoss.prototype.onRetWBossDamList = function (msgid, data) {
    this.worldBossDamageList[data.bossid] = _.cloneDeep(data);
    NotificationController.Emit(Define.EVENT_KEY.WORLDBOSS_DAMAGERANKUPDATE, data.bossid);
}
WorldBoss.prototype.onStartAttWBossOK = function (msgid, data) {
    this.hasattack = false;
    data.recieveTime = TimeController.GetCurTimeMs();
    data.cdtime = data.cdtime * 1000;
    data.dotime = data.dotime * 1000;
    this.worldBossAttackList[data.bossid] = data;
}
WorldBoss.prototype.onBroadWBossHP = function (msgid, data) {
    this._updateBossHp(data.bossid, data.maxhp, data.hp);
}
WorldBoss.prototype.onWBossDie = function (msgid, data) {
    let index = _.findIndex(this.worldBossBases, { bossid: data.bossid });
    if (index != -1) {
        this.worldBossBases[index] = data.boss_base;
    } else {
        this.worldBossBases.push(data.boss_base);
    }
    this._sortWorldBossBase();
    this._updateBossHp(data.bossid, data.boss_base.maxhp, data.boss_base.hp);
    if (data.bossid == this.attackedBoss) {
        this.CancleFight();
    }
    NotificationController.Emit(Define.EVENT_KEY.WORLDBOSS_UPDATE);
    NotificationController.Emit(Define.EVENT_KEY.WORLDBOSS_BOSSDIE, data.bossid);
}
WorldBoss.prototype.onCancleAttWBoss = function (msgid, data) {
    //先清数据
    let attackBoss = this.attackedBoss;
    this.CancleFight();
    NotificationController.Emit(Define.EVENT_KEY.WORLDBOSS_CANCLEATTACK, attackBoss);
}
WorldBoss.prototype.onRetAttBossDam = function (msgid, data) {
    //打中boss了
    // if (this.isAuto) {
    // NetWorkController.SendProto('wboss.StartAttWBoss', { bossid: this.GetAttackedBoss() });
    // }
    NotificationController.Emit(Define.EVENT_KEY.WORLDBOSS_DAMAGEUPDATE, _.get(data, 'dam', 0));
}
WorldBoss.prototype.onWBossEscape = function (msgid, data) {
    NotificationController.Emit(Define.EVENT_KEY.WORLDBOSS_BOSSDIE, data.bossid);
}
//====================  私有函数  ====================
WorldBoss.prototype._sortWorldBossBase = function () {
    this.worldBossBases = _.sortBy(this.worldBossBases, function (o) {
        if (o.cdtime > 0) {
            return 666;
        }
        return o.bossid;
    })
}
WorldBoss.prototype._updateBossHp = function (bossid, maxhp, curhp) {
    this.worldBossHpList[bossid] = { curhp, maxhp };
    NotificationController.Emit(Define.EVENT_KEY.WORLDBOSS_HPUPDATE, bossid);
}

WorldBoss.prototype.onRetSetAutoFight = function(msgid,data){
    NotificationController.Emit(Define.EVENT_KEY.WORLDBOSS_SETAUTOFIGHT,data.ret);
}
module.exports = new WorldBoss();