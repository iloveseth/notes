const _ = require('lodash');
const Tools = require('../Util/Tools');
const Define = require('../Util/Define');
const ConfigController = require('./ConfigController');
const NotificationController = require('./NotificationController');
const NetWorkController = require('./NetWorkController');
const LevelModel = require('../Model/Level');
const UserModel = require('../Model/User');
const ItemDefine = require('../Util/ItemDefine');
const EquipModel = require('../Model/Equip');

var TargetGuideController = function () {
    this.guides = {};
    this.runningGuide = false;
    this.doneGuideList = [];
    this.taskDetailMsg = null;
    this.trunkData = null;
    this.subData = null;
    this.equipTypeTab = [
        101,//刀
        102,//刀副手
        109,//护腕
        110,//裤子
        111,//鞋子
        112,//头盔 
        113,//项链
        114,//衣服
        115,//腰带
        116,//戒指
    ];
}

TargetGuideController.prototype.Init = function (cb) {
    NetWorkController.AddListener('lvltask.retNewTargetTask', this, this.onRetNewTaskDetail);
    Tools.InvokeCallback(cb, null);
}


//====================  对外接口  ====================
TargetGuideController.prototype.CleanGuideData = function () {
    this.trunkData = null;
    this.subData = null;
}
TargetGuideController.prototype.StartGuide = function (data) {
    this.trunkData = data;
    let subtaskId = _.get(data,"subtask",0);
    if(subtaskId == 0){
        cc.log("主干subtaskId错误");
        cc.log(data);
        NotificationController.Emit(Define.EVENT_KEY.TARGET_GUIDE_END);
        return;
    };
    this.StartGuideWithSubId(subtaskId);
    
}

TargetGuideController.prototype.StartGuideWithSubId = function (subtaskId) {
    this.subData = ConfigController.GetConfigById("subtask_data",subtaskId);
    if(!this.subData){
        cc.log("枝干subtaskId错误");
        cc.log(subtaskId);
        NotificationController.Emit(Define.EVENT_KEY.TARGET_GUIDE_END);
        return;
    };
    this.runningGuide = true;
    NotificationController.Emit(Define.EVENT_KEY.TARGET_GUIDE_START, this.subData);
    
    
}

TargetGuideController.prototype.OnGuideComplete = function (data) {
    let needRepeat = _.get(data, 'repeat', 0);
    if(needRepeat == 1){
        let subtaskId = _.get(data,"id",0);
        this.StartGuideWithSubId(subtaskId);
        return;
    };

    let next = _.get(data, 'next', 0);
    if (next != 0) {
        this.StartGuideWithSubId(next);
    } else {
        this.runningGuide = false;
        NotificationController.Emit(Define.EVENT_KEY.TARGET_GUIDE_END);
    }
    
}

TargetGuideController.prototype.GetTrackGuide = function () {
    let id = 0;
    
}
//装备是否穿着
TargetGuideController.prototype.checkConditionEquipFit = function (index) {
    let occupation = UserModel.GetUserOccupation();
    let packagetype = ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP;
    let equipType = this.equipTypeTab[index];
    if (equipType == 101) {
        equipType = EquipModel.GetMainArmsByOccupation(occupation);
    }
    if (equipType == 102) {
        equipType = EquipModel.GetViceArmsByOccupation(occupation);
    }
    let equipInfo = EquipModel.GetUseEquipByTypes(packagetype, equipType);
    return equipInfo;
}

//装备强化
TargetGuideController.prototype.checkConditionEquipLv = function (index,needLv) {
    let equipInfo = this.checkConditionEquipFit(index);
    if(equipInfo == null){return false};
    let equipLv = _.get(equipInfo, 'level', 0);
    let limitLv = _.get(this.trunkData, 'value', 0);
    if(equipLv < limitLv){
        return true;
    };
    return false;
}
//装备星级
TargetGuideController.prototype.checkConditionEquipStar = function (index,needStar) {
    let equipInfo = this.checkConditionEquipFit(index);
    if(equipInfo == null){return false};
    let stronglevel = _.get(equipInfo, 'equipdata.stronglevel', 0);
    let limitLv = _.get(this.trunkData, 'value', 0);
    if(stronglevel < limitLv){
        return true;
    };
    return false;
}
//装备打孔
TargetGuideController.prototype.checkConditionEquipHole = function (index) {
    let equipInfo = this.checkConditionEquipFit(index);
    if(equipInfo == null){return false};
    let holeNum = _.get(equipInfo, 'equipdata.hole', 0);
    if(holeNum > 0){
        return true;
    };
    return false;
    
}
//装备镶嵌宝石,需求等级
TargetGuideController.prototype.checkConditionEquipGem = function (index,GemLv=0) {
    let equipInfo = this.checkConditionEquipFit(index);
    if(equipInfo == null){return false};
    let stoneTab = _.get(equipInfo, 'equipdata.stone', []);
    // for (let i = 0; i < stone.length; i++) {  //显示已经装上的宝石
    //     let gemsInfo = stone[i];
    //     let objid = gemsInfo.objid;
    //     let pos = gemsInfo.pos;
    //     let stoneLv = _.get(objid, 'level', 0);
    // };
    if(stoneTab.length > 0){
        return true;
    };
    return false;
}
//装备灵魂装备
TargetGuideController.prototype.checkConditionEquipSoul = function (index,SoulLv=0) {
    let equipInfo = this.checkConditionEquipFit(index);
    if(equipInfo == null){return false};
    let soul = _.get(equipInfo, 'equipdata.godnormal', null);
    let isHaveSoul = false;
    if (soul != null) {
        isHaveSoul = soul.level > SoulLv;
    };
    return isHaveSoul;
}
//当前过图状态
TargetGuideController.prototype.checkLevelViewStates = function () {
    if (UserModel.GetExp() >= UserModel.GetLevelupExp()) {
        //升级

    } else {
        if (LevelModel.GetMaxMapId() == LevelModel.GetCurMapId()) {
            //打boss
            
        } else {
            //过图
            
        }
    }

}

//====================  事件回调  ====================
TargetGuideController.prototype.onRetNewTaskDetail = function (msgid, msg) {
    this.taskDetailMsg = msg;
    let taskID = _.get(msg,'id',0);
    let curnum = _.get(msg,"curnum",0);
    let maxnum = _.get(msg,"maxnum",0);

    let generalData = ConfigController.GetConfigById("newleveltask_data",taskID);
    if(!generalData){
        let tipstr = "获取配表信息失败 taskid == "+taskID;
        cc.log(tipstr);
        return;
    };
    let tasktype = _.get(generalData,'type',0);
    let isFinish = false;
    if(tasktype == 1){
        //通关类型
        isFinish = curnum > maxnum;
    }else{
        //其他类型
        isFinish = curnum >= maxnum;
    };
    UserModel.setTargetTaskRed(isFinish);
    NotificationController.Emit(Define.EVENT_KEY.RED_TARGET);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
}










module.exports = new TargetGuideController();