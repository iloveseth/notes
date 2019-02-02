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
const CountDown = require('../Util/CountDown');
const VipModel = require('../Model/Vip');


var ActiveModel = function () {
    this.currentActivity = 0;
    this.loginActData = null;
    this.limitActData = null;
    this.loginMsg = null;
    this.limitMsg = null;
    this.forceActTime = 0;

    this.countStateTime = 0;
    this.sendActStateMsg = null;//所有活动剩余时间
    this.activeType = [];

    //首充状态需要保存
    this.chargestatus = 0;
    //充值相关剩余时间
    this.meirilefttime = 0;
    this.leijilefttime = 0;
    this.paihanglefttime = 0;
    //累计充值列表
    this.leijidata = [];
    this.consume_pagetag = 1;
    this.consume_leftime = 0;
    this.consume_hasget = [];
    this.consume_curnum = 0;
    this.treeActTime = 0;
    this.isrewardget = false;
    this.DigitalTime = 0;
    this.isfinishDenglu = false;
    this.isfinishDenglu_eff = false;


    this.zoneCurActivity = [];//开区活动
    this.commCurActivity = [];//普通活动
    this.actPanelType = 1;       //1开区活动 2普通活动
    this.costsort_index = 0;
    this.costsort_tab = [];
    this.noticeTable = [];
    this.loginTime = 0;

    this.allZoneAct = [];
    this.allCommAct = [];

    this.tableId;

    this.msg_firstrecharge = {};

    this.firstLoginRewardId = 0;

    this.clearRedPointList();
}


ActiveModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('act.sendActState', this, this.onSendActState);
    NetWorkController.AddListener('act.retZoneLoginAct', this, this.onRetZoneLoginAct);
    NetWorkController.AddListener('act.retZoneLimitAct', this, this.onRetZoneLimitAct);
    NetWorkController.AddListener('fund.retFund', this, this.onRetFund);//基金
    NetWorkController.AddListener('fund.retFundRew', this, this.onRetFundRew);//红利
    NetWorkController.AddListener('msg.RetSuperFund', this, this.onRetSuperFund);//超级基金
    NetWorkController.AddListener('sort.retSortTime', this, this.onRetSortTime);
    NetWorkController.AddListener('act.retFirstChargeAct', this, this.onRetFirstChargeAct);

    NetWorkController.AddListener('act.retDayChargeAct', this, this.onRetDayChargeAct);
    NetWorkController.AddListener('act.retTotalChargeAct', this, this.onRetTotalChargeAct);
    NetWorkController.AddListener('fund.retTurntable', this, this.onRetTurntable);
    NetWorkController.AddListener('act.retChargeRedPacket', this, this.onRetChargeRedPacket);
    NetWorkController.AddListener('msg.RetMonthCard', this, this.onRetMonthCard);
    NetWorkController.AddListener('act.retTreePlantAct', this, this.onRetTreePlantAct);
    NetWorkController.AddListener('msg.TurnDigitalResp', this, this.onTurnDigitalResp);
    NetWorkController.AddListener('consume.retConsumeInfo', this, this.onRetConsumeInfo);
    NetWorkController.AddListener('consume.retConsumeSort', this, this.onRetConsumeSort);
    NetWorkController.AddListener('consume.onlineConsume', this, this.onOnlineConsume);
    NetWorkController.AddListener('act.RetTargetActivity', this, this.onRetTargetActivity);
    NetWorkController.AddListener('act.retInsuranceRec', this, this.onRetInsuranceRec);
    NetWorkController.AddListener('msg.notifyNew', this, this.onNotifyNew);
    NetWorkController.AddListener('act.retFightSortActInfo', this, this.retFightSortActInfo);
    NetWorkController.AddListener('consume.firstChargeOk', this, this.onFirstChargeOk);
    NetWorkController.AddListener('msg.SendFirstLoginPresent', this, this.onSendFirstLoginPresent);
    NotificationController.On(Define.EVENT_KEY.PAY_RESULT, this, this.onPayResult);

    Tools.InvokeCallback(cb, null);
}

ActiveModel.prototype.Reload = function (cb) {
    this.currentActivity = 0;
    this.loginActData = null;
    this.limitActData = null;
    this.loginMsg = null;
    this.limitMsg = null;
    this.forceActTime = 0;

    this.countStateTime = 0;
    this.sendActStateMsg = null;//所有活动剩余时间
    this.activeType = [];

    //首充状态需要保存
    this.chargestatus = 0;
    //充值相关剩余时间
    this.meirilefttime = 0;
    this.leijilefttime = 0;
    this.paihanglefttime = 0;
    //累计充值列表
    this.leijidata = [];
    this.consume_pagetag = 1;
    this.consume_leftime = 0;
    this.consume_hasget = [];
    this.consume_curnum = 0;
    this.treeActTime = 0;
    this.isrewardget = false;
    this.DigitalTime = 0;
    this.isfinishDenglu = false;
    this.isfinishDenglu_eff = false;


    this.zoneCurActivity = [];//开区活动
    this.commCurActivity = [];//普通活动
    this.actPanelType = 1;       //1开区活动 2普通活动
    this.costsort_index = 0;
    this.costsort_tab = [];
    this.noticeTable = [];
    this.loginTime = 0;

    this.allZoneAct = [];
    this.allCommAct = [];

    this.tableId;

    this.msg_firstrecharge = {};

    this.firstLoginRewardId = 0;

    this.clearRedPointList();
    Tools.InvokeCallback(cb, null);
}


/**
 * 对外接口
 */
ActiveModel.prototype.clearRedPointList = function () {
    // cc.log("ActiveModel clearRedPointList");
    this.redPointList = [];//  15冲榜  2限时奖励  8消费榜  11月卡  6累计充值  4成长基金
    this.jijinPointList = [];
    this.yuekaPointList = [];
    for (let i = 0; i < 27; i++) {
        let tempObj = {};
        tempObj.id = i + 1;
        tempObj.isfinish = false;
        this.redPointList.push(tempObj);
    };

    //基金
    for (let i = 0; i < 3; i++) {
        let tempObj_1 = {};
        tempObj_1.id = i + 1;
        tempObj_1.isfinish = false;
        this.jijinPointList.push(tempObj_1);
    };
    //月卡
    for (let i = 0; i < 2; i++) {
        let tempObj_2 = {};
        tempObj_2.id = i + 1;
        tempObj_2.isfinish = false;
        this.yuekaPointList.push(tempObj_2);
    };

}

ActiveModel.prototype.activityHasRedPoint = function () {
    for (let index = 0; index < this.redPointList.length; index++) {
        let element = this.redPointList[index];
        if (element.id == 15) {

        } else {
            if (element.isfinish) {
                return true;
            };
        };
    };
    return false;
}

ActiveModel.prototype.updataJiJinState = function () {
    _.find(this.redPointList, { 'id': 4 }).isfinish = false;
    for (let i = 0; i < this.jijinPointList.length; i++) {
        let element = this.jijinPointList[i];
        if (element.isfinish) {
            _.find(this.redPointList, { 'id': 4 }).isfinish = true;
            return;
        };
    };

}

ActiveModel.prototype.updataYueKaState = function () {
    _.find(this.redPointList, { 'id': 11 }).isfinish = false;
    for (let i = 0; i < this.yuekaPointList.length; i++) {
        let element = this.yuekaPointList[i];
        if (element.isfinish) {
            _.find(this.redPointList, { 'id': 11 }).isfinish = true;
            return;
        };
    };

}

ActiveModel.prototype.fightSortHasRedPoint = function () {
    let lefttime = CountDown.GetCountDown(CountDown.Define.TYPE_ACTIVITY_FIGHTRANK);
    if (lefttime < 24 * 60 * 60) {
        return false;
    }
    let redData = _.find(this.redPointList, { 'id': 15 });
    let hasRed = redData.isfinish;
    return hasRed;
}

ActiveModel.prototype.getActPanelType = function () {
    return this.actPanelType;
}
ActiveModel.prototype.setActPanelType = function (actType) {
    this.actPanelType = actType;
}

ActiveModel.prototype.getCurrentActivity = function () {
    return this.currentActivity;
}
ActiveModel.prototype.setCurrentActivity = function (curAct) {
    this.currentActivity = curAct;
}

ActiveModel.prototype.getLoginActData = function () {
    return this.loginActData;
}
ActiveModel.prototype.setLoginActData = function (loginActData) {
    this.loginActData = loginActData;
}

ActiveModel.prototype.isOpenZoneEnd = function () {
    if (this.sendActStateMsg) {
        return this.sendActStateMsg.openzoneresttime > this.countStateTime;
    };
    return false;
}

ActiveModel.prototype.getActivityNum = function () {
    if (this.actPanelType == 1) {
        return this.zoneCurActivity.length;
    } else {
        return this.commCurActivity.length;
    };
}

ActiveModel.prototype.getActivityTypeByIndex = function (index) {
    if (this.actPanelType == 1) {
        return this.zoneCurActivity[index];
    } else {
        return this.commCurActivity[index];
    };
}

ActiveModel.prototype.isHasActivity = function (act_type) {
    this.updateActiveInfo();
    let flag = false;
    for (let i = 0; i < this.activeType.length; i++) {
        if (act_type == this.activeType[i]) {
            flag = true;
            break;
        }
    }
    return flag;
}


ActiveModel.prototype.updateTableActType = function () {
    this.allZoneAct = [];
    this.allCommAct = [];
    let actres_data_tab = ConfigController.GetConfig("actres_data");
    for (let i = 0; i < actres_data_tab.length; i++) {
        let v = actres_data_tab[i];
        if (v.actposition == 1) {
            this.allZoneAct.push(v.id);
        } else if (v.actposition == 2) {
            this.allCommAct.push(v.id);
        } else if (v.actposition == 3) {
            if (this.isOpenZoneEnd()) {
                this.allZoneAct.push(v.id);
            } else {
                this.allCommAct.push(v.id);
            };
        };
    };
}

ActiveModel.prototype.insertActivity = function (actType) {
    this.updateTableActType()

    if (actType == Define.ActivityType.LOGIN_ACTIVITY) { return };

    if (this.isInTable(actType, this.allZoneAct)) {
        //插入开区活动
        if (!this.isInTable(actType, this.zoneCurActivity)) {
            this.zoneCurActivity.push(actType);
        }
    } else {
        //插入普通活动
        if (!this.isInTable(actType, this.commCurActivity)) {
            this.commCurActivity.push(actType);
        }
    };
}

ActiveModel.prototype.isInTable = function (tempType, tempTable) {
    for (let i = 0; i < tempTable.length; i++) {
        let v = tempTable[i];
        if (tempType == v) {
            return true;
        }
    }
    return false;
}


ActiveModel.prototype.updateActiveInfo = function () {
    this.zoneCurActivity = [];
    this.commCurActivity = [];

    if (this.sendActStateMsg && this.sendActStateMsg.list) {
        for (let i = 0; i < this.sendActStateMsg.list.length; i++) {
            let v = this.sendActStateMsg.list[i];
            if (v.isfinish == 0 && v.timeleft > this.countStateTime) {
                //屏蔽限时任务
                this.insertActivity(v.type)
            };
        };
    };

    this.insertActivity(Define.ActivityType.INSURANCE_ACTIVITY);//成长基金
    this.insertActivity(Define.ActivityType.YUEKA_ACTIVITY);// 月卡
    this.insertActivity(Define.ActivityType.CDKEY_ACTIVITY);
    // this.insertActivity(Define.ActivityType.SEVEN_ACTIVITY);//7日福利

    if (this.meirilefttime > 0) {
        this.insertActivity(Define.ActivityType.CHONGZHI_ACTIVITY);
    };
    if (this.leijilefttime > 0) {
        this.insertActivity(Define.ActivityType.LEIJI_ACTIVITY);
    };
    if (this.paihanglefttime > 0) {
        this.insertActivity(Define.ActivityType.FIGTHBOX_ACTIVITY);
    };
    if (this.consume_leftime > 0) {
        this.insertActivity(Define.ActivityType.COSTSORT_ACTIVITY);
    };
    if (this.treeActTime > 0 && !this.isrewardget) {
        this.insertActivity(Define.ActivityType.SMALLTREE_ACTIVITY);
    };

    this.sortActType();
}

ActiveModel.prototype.sortActType = function () {
    this.zoneCurActivity.sort(function (val1, val2) {
        return this.getActSortValue(val1) - this.getActSortValue(val2)
    }.bind(this));
    this.commCurActivity.sort(function (val1, val2) {
        return this.getActSortValue(val1) - this.getActSortValue(val2)
    }.bind(this));
}

ActiveModel.prototype.getActSortValue = function (actId) {
    let tableData = ConfigController.GetConfigById("actres_data", actId);
    if (tableData) {
        return tableData.actinturn;
    };
    return 1;
}

ActiveModel.prototype.sendActMsgByType = function (actType) {
    cc.log("sendActMsgByType type is == " + actType);
    // this.openNewActivityByType(actType);

    if (actType == Define.ActivityType.LOGIN_ACTIVITY) {
        NetWorkController.SendProto('act.reqZoneLoginAct', {});

    } else if (actType == Define.ActivityType.LIMIT_ACTIVITY) {
        NetWorkController.SendProto('act.reqZoneLimitAct', {});

    } else if (actType == Define.ActivityType.SEVEN_ACTIVITY) {
        this.openNewActivityByType(Define.ActivityType.SEVEN_ACTIVITY);

    } else if (actType == Define.ActivityType.INSURANCE_ACTIVITY) {
        //    NetWorkController.SendProto('fund.reqFund', {});
        //    NetWorkController.SendProto('fund.reqFundRew', {});
        this.openNewActivityByType(Define.ActivityType.INSURANCE_ACTIVITY);

    } else if (actType == Define.ActivityType.FIGTHBOX_ACTIVITY) {
        NetWorkController.SendProto('sort.reqSortTime', {});

    } else if (actType == Define.ActivityType.CHONGZHI_ACTIVITY) {
        NetWorkController.SendProto('act.reqDayChargeAct', {});

    } else if (actType == Define.ActivityType.LEIJI_ACTIVITY) {
        NetWorkController.SendProto('act.reqTotalChargeAct', {});

    } else if (actType == Define.ActivityType.TURNTABLE_ACTIVITY) {
        NetWorkController.SendProto('fund.reqTurntabletime', {});

    } else if (actType == Define.ActivityType.REDBAG_ACTIVITY) {
        NetWorkController.SendProto('act.reqChargeRedPacket', {});

    } else if (actType == Define.ActivityType.YUEKA_ACTIVITY) {
        this.monthcard_common = null;
        this.monthcard_zhizun = null;
        this.monthcard_openui = true;
        NetWorkController.SendProto('msg.ReqMonthCard', { type: 0 });
        NetWorkController.SendProto('msg.ReqMonthCard', { type: 1 });

    } else if (actType == Define.ActivityType.SMALLTREE_ACTIVITY) {
        NetWorkController.SendProto('act.reqTreePlantAct', {});

    } else if (actType == Define.ActivityType.SEVENNUM_ACTIVITY) {
        NetWorkController.SendProto('msg.ReqDigitalMainInfo', {});

    } else if (actType == Define.ActivityType.COSTSORT_ACTIVITY) {
        NetWorkController.SendProto('consume.reqConsumeInfo', {});

    } else if (actType == Define.ActivityType.ROBFLOOR_ACTIVITY) {
        this.openNewActivityByType(Define.ActivityType.ROBFLOOR_ACTIVITY)

    } else if (actType >= Define.ActivityType.GUARD_ACTIVITY && actType <= Define.ActivityType.WORLDBOSS_ACTIVITY) {
        NetWorkController.SendProto('act.ReqTargetActivity', { type: actType });
    }
    else if (actType == Define.ActivityType.FIRSTRECHARGE_ACTIVITY) {
        // NetWorkController.SendProto('act.reqFirstChargeAct');
        ViewController.OpenView(UIName.UI_FIRSTRECHARGEVIEW, "ViewLayer");
    }
    else if (actType == Define.ActivityType.DAILYGIFT_ACTIVITY) {
        ViewController.OpenView(UIName.UI_DAILYGIFTVIEW, "ViewLayer");

    }
    else if (actType == Define.ActivityType.FIGHTRANK_ACTIVITY) {
        NetWorkController.SendProto('act.reqFightSortActInfo');
    }
    else if (actType == Define.ActivityType.CDKEY_ACTIVITY) {
        this.openNewActivityByType(Define.ActivityType.CDKEY_ACTIVITY);
    }
}


ActiveModel.prototype.openNewActivityByType = function (actType) {
    if (this.isInTable(actType, this.allZoneAct)) {
        this.actPanelType = 1;
    } else {
        this.actPanelType = 2;
    }

    if (!ViewController.IsOpen(UIName.UI_ACTIVITY_HOME_VIEW) && GlobalModel.needOpenActivityHome) {
        GlobalModel.needOpenActivityHome = false;
        ViewController.OpenView(UIName.UI_ACTIVITY_HOME_VIEW, "ViewLayer", actType);
    } else {
        NotificationController.Emit(Define.EVENT_KEY.ACTIVITY_HOME_VIEW_REFRESH, actType);
    }


}

ActiveModel.prototype.getIsSevenloginRed = function (actType) {
    return this.isfinishDenglu_eff;
}


//0 已经领取 1 不可以领取 2 可以领取 
//按领取状态排序 状态相同的 id小的排在前面
ActiveModel.prototype.getSortValue = function (rewardState, tableId) {
    return rewardState * 1000 - tableId
}
ActiveModel.prototype.getSortValueNew = function (rewardState, tableId) {
    return rewardState * 1000000 + tableId
}

ActiveModel.prototype.initTableData = function () {
    //七日登录
    if (this.loginActData == null) {
        this.loginActData = [];
        let act_login = ConfigController.GetConfig("zonelogin_data");
        for (let i = 0; i < act_login.length; i++) {
            this.loginActData.push(act_login[i]);
        };
    }

    //
    if (this.limitActData == null) {
        this.limitActData = [];
        let act_limit = ConfigController.GetConfig("zonelimit_data");
        for (let i = 0; i < act_limit.length; i++) {
            if (act_limit[i].type != 1) {
                this.limitActData.push(act_limit[i]);
            }
        };
    }

    //红利
    if (this.insuranceRewData == null) {
        this.insuranceRewData = [];
        let act_red = ConfigController.GetConfig("fundreward_data");
        for (let i = 0; i < act_red.length; i++) {
            this.insuranceRewData.push(act_red[i]);
        };
    }

    //保险
    if (this.insuranceData == null) {
        this.insuranceData = [];
        let act_insurance = ConfigController.GetConfig("fund_data");
        for (let i = 0; i < act_insurance.length; i++) {
            this.insuranceData.push(act_insurance[i]);
        };
    }

}

ActiveModel.prototype.getGainNumById = function (tempId) {
    let info = _.get(this.limitMsg, "info", []);
    for (let i = 0; i < info.length; i++) {
        let v = info[i];
        if (tempId == v.id) {
            return v.num
        }
    }
    return 0;
}

ActiveModel.prototype.ableGainRewForLimit = function (id) {
    let tableData = ConfigController.GetConfigById("zonelimit_data", id);
    if (!tableData) { return false };
    if (tableData.type == 1) {
        //战力
        let tFight = tableData.goalnum;
        return tFight <= UserModel.GetUserMainInfo().fightval
    } else if (tableData.type == 2) {
        //等级
        let tLevel = tableData.goalnum
        return tLevel <= UserModel.GetLevel();
    } else if (tableData.type == 7) {
        //升星
        let tGoal = tableData.goalnum;
        let starindex = UserModel.GetUserMainInfo().starindex;
        if (starindex > 10000) {
            starindex = Math.floor(starindex / 10000);
        }
        return tGoal <= starindex;
    } else if (tableData.type == 6) {
        //强化
        let tGoal = tableData.goalnum;
        let strengthLevel = UserModel.GetUserMainInfo().strongsuit;
        if (strengthLevel > 10000) {
            strengthLevel = Math.floor(strengthLevel / 10000);
        }
        return tGoal <= strengthLevel
    } else if (tableData.type == 8) {
        //过图
        let max_pass = UserModel.GetMaxMapid();
        return max_pass > tableData.goalnum
    }
    return false
}

ActiveModel.prototype.getSortValueForHongli = function (idx) {
    let score = idx;
    let rewardindexTab = _.get(this.fundHongliMsg, "rewardindexTab", []);
    for (let i = 0; i < rewardindexTab.length; i++) {
        let v = rewardindexTab[i];
        if (v == idx) {
            score = score + 1000;
        };
    };
    return score;
}

//可以领取1 不可以领取2 已经领取最下面3 
ActiveModel.prototype.getSortValueForSuran = function (rewardState, level) {
    return rewardState * 1000 + level;
}
//保险领取状态
ActiveModel.prototype.getRewardStateForIns = function (redLevel, tempLevel) {
    for (let i = 0; i < redLevel.length; i++) {
        let v = redLevel[i];
        if (v == tempLevel) {
            return 3;
        };
    };
    if (UserModel.GetLevel() >= tempLevel) {
        return 1;
    } else {
        return 2;
    };
}
//红利领取状态
ActiveModel.prototype.getRewardStateForHongli = function (redLevel, tempLevel) {
    for (let i = 0; i < redLevel.length; i++) {
        let v = redLevel[i];
        let tempv = ConfigController.GetConfigById("fundreward_data", v);
        if (tempv.num == tempLevel) {
            return 3;
        }
    }
    let tableData = ConfigController.GetConfigById("fundreward_data", this.tableId);
    let tempCount = tableData.num || 0;
    let buycount = _.get(this.fundHongliMsg, "buycount", 0);
    if (buycount >= tempLevel) {
        return 1;
    } else {
        return 2;
    }
}


ActiveModel.prototype.GetSortConsume = function (index) {
    let data = ConfigController.GetConfig("consumereward_data");
    let tempdate = [];
    let sort_consumedata = [];
    for (let i = 0; i < data.length; i++) {
        let item = data[i];
        if (this.consume_hasget[i] == 0) {
            item.hasget = 0;
            sort_consumedata.push(item);
        } else {
            item.hasget = 1;
            tempdate.push(item);
        }
    }
    sort_consumedata = _.concat(sort_consumedata, tempdate);
    return sort_consumedata[index];
}

ActiveModel.prototype.cancelNewTag = function (index) {
    for (let i = 0; i < this.noticeTable.length; i++) {
        if (this.noticeTable[i] == index) {
            this.noticeTable.remove(i);
            break;
        }
    }
}

ActiveModel.prototype.getActRestTime = function () {
    let curType = this.getCurrentActivity();
    if (curType == Enum.ActivityType.FIGTHBOX_ACTIVITY) {
        return this.paihanglefttime;
    } else if (curType == Enum.ActivityType.CHONGZHI_ACTIVITY) {
        return this.retDayChargeAct.timeleft
    }
    return 0;
}

//开区还是普通
ActiveModel.prototype.showMainInterfaceRed = function (actType) {
    if (actType == 1) {
        //开区
        for (let i1 = 0; i1 < this.zoneCurActivity.length; i1++) {
            let v1 = this.zoneCurActivity[i1];
            if (this.showRedPoint(v1) || this.isNewActivity(v1)) {
                return true;
            };
        };
    } else if (actType == 2) {
        //普通
        for (let i2 = 0; i2 < this.commCurActivity.length; i2++) {
            let v2 = this.commCurActivity[i2];
            if (this.showRedPoint(v2) || this.isNewActivity(v2)) {
                return true;
            };
        };
    }
    return false;
}


ActiveModel.prototype.showRedPoint = function (tType) {
    return false;
    if (tType == Enum.ActivityType.LOGIN_ACTIVITY) {

    } else if (tType == Enum.ActivityType.RN_LOGINACT) {

    } else if (tType == Enum.ActivityType.RN_LIMITACT) {

    } else if (tType == Enum.ActivityType.RN_DAYCHARGE) {

    } else if (tType == Enum.ActivityType.RN_TOTALCHARGE) {

    } else if (tType == Enum.ActivityType.RN_COSTSORT) {

    } else if (tType == Enum.ActivityType.RN_TURNTABLE) {

    } else if (tType == Enum.ActivityType.RN_HONGLI) {

    } else if (tType == Enum.ActivityType.RN_TREEPLANTAWARD) {

    } else if (tType == Enum.ActivityType.RN_TURNDIGITAL) {

    } else if (tType == Enum.ActivityType.RN_CHARGE_RED) {

    } else if (tType == Enum.ActivityType.RN_NEWEIGHTACTIVITY1) {

    } else if (tType == Enum.ActivityType.RN_NEWEIGHTACTIVITY2) {

    } else if (tType == Enum.ActivityType.RN_NEWEIGHTACTIVITY3) {

    } else if (tType == Enum.ActivityType.RN_NEWEIGHTACTIVITY4) {

    } else if (tType == Enum.ActivityType.RN_NEWEIGHTACTIVITY5) {

    } else if (tType == Enum.ActivityType.RN_NEWEIGHTACTIVITY6) {

    } else if (tType == Enum.ActivityType.RN_NEWEIGHTACTIVITY7) {

    } else if (tType == Enum.ActivityType.RN_NEWEIGHTACTIVITY8) {

    };
}

ActiveModel.prototype.isNewActivity = function (index) {
    return false;
}


/**
 * 消息处理接口
 */
//返回限时任务开启信息
ActiveModel.prototype.onSendActState = function (msgid, msg) {
    cc.log("ActiveModel.prototype.onSendActState");
    this.countStateTime = 0;
    this.sendActStateMsg = msg;
}

//返回七日登录奖励信息
ActiveModel.prototype.onRetZoneLoginAct = function (msgid, msg) {
    cc.log("ActiveModel onRetZoneLoginAct");
    this.initTableData();
    this.loginMsg = msg;
    this.isfinishDenglu_eff = false;
    for (let i1 = 0; i1 < this.loginActData.length; i1++) {
        let v = this.loginActData[i1];
        let haveGain = false;
        let hasgetList = _.get(msg, "hasget", []);
        for (let i2 = 0; i2 < hasgetList.length; i2++) {
            let tempv = hasgetList[i2];
            if (v.id == tempv) {
                haveGain = true;
            };
        };

        if (haveGain) {
            v.rewardState = 0;//已经领取
        } else if (v.id <= msg.loginday) {
            v.rewardState = 2;//可以领取
            this.isfinishDenglu_eff = true;
        } else {
            v.rewardState = 1;//不可以领取
        };

    };

    this.loginActData.sort(function (val1, val2) {
        let result_1 = this.getSortValue(val1.rewardState, val1.id);
        let result_2 = this.getSortValue(val2.rewardState, val2.id);
        return result_2 - result_1;
    }.bind(this));

    let lefttime = _.get(msg, "lefttime", 0);
    if (lefttime > 0) {
        this.loginTime = lefttime;
        //开启倒时计时器
    }
    //保存结束时间
    CountDown.SetCountDown(CountDown.Define.TYPE_ACTIVITY_LOGIN, this.loginTime);

    let isfinish = _.get(msg, "isfinish", false);
    let is_openui = _.get(msg, "is_openui", false);
    if (is_openui) {
        this.currentActivity = Define.ActivityType.LOGIN_ACTIVITY;
        ViewController.OpenView(UIName.UI_ACTIVITY_SEVEN_LOGIN_VIEW, "ViewLayer");
    } else {
        NotificationController.Emit(Define.EVENT_KEY.ACTIVITY_SEVEN_LOGIN);
    }
    this.isfinishDenglu = isfinish;


    NotificationController.Emit(Define.EVENT_KEY.RED_SEVEN_LOGIN);
    NotificationController.Emit(Define.EVENT_KEY.FIRST_OPENFUNCTION);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
}

//返回限时奖励
ActiveModel.prototype.onRetZoneLimitAct = function (msgid, msg) {
    cc.log("ActiveModel onRetZoneLimitAct");
    if (msg.type == 0) {
        _.find(this.redPointList, { 'id': 2 }).isfinish = false;//限时奖励
        this.initTableData();
        this.limitMsg = msg;
        CountDown.SetCountDown(CountDown.Define.TYPE_ACTIVITY_XIANSHI, _.get(msg, 'lefttime', 0));
        for (let i = 0; i < this.limitActData.length; i++) {
            let v = this.limitActData[i];
            if (v.id == 5 || v.id == 6) {
                if (this.getGainNumById(v.id) == v.rewardnum) {
                    v.rewardState = 0;
                };
            };

            let haveGain = false;
            let hasgetTab = _.get(msg, "hasget", []);
            for (let i2 = 0; i2 < hasgetTab.length; i2++) {
                let tempv = hasgetTab[i2];
                if (v.id == tempv) {
                    haveGain = true;
                };
            };
            if (haveGain) {
                v.rewardState = 0;//已经领取
            } else if (this.ableGainRewForLimit(v.id)) {
                v.rewardState = 2;//可以领取
                let lefttime = _.get(msg, "lefttime", 0);
                if (lefttime > 0) {
                    let tempdata = _.find(this.redPointList, { 'id': 2 });//限时奖励
                    tempdata.isfinish = true;
                };
            } else {
                v.rewardState = 1;//不可以领取
            };

        }

        this.limitActData.sort(function (a, b) {
            // if((a.id == 5 || a.id == 6) && (b.id != 5 && b.id != 6)){
            //     return this.getSortValueNew(a.rewardState, -1) - this.getSortValueNew(b.rewardState, b.countnum);
            // }else if((a.id != 5 && a.id != 6) && (b.id == 5 || b.id == 6)){
            //     return this.getSortValueNew(a.rewardState, a.countnum) - this.getSortValueNew(b.rewardState, -1);
            // }else{
            //     return this.getSortValueNew(b.rewardState, b.countnum) - this.getSortValueNew(b.rewardState, b.countnum);
            // };
            if ((a.id == 5 || a.id == 6) && (b.id != 5 && b.id != 6)) {
                return -1;
            } else if ((a.id != 5 && a.id != 6) && (b.id == 5 || b.id == 6)) {
                return 1;
            } else {
                if (a.rewardState > b.rewardState) {
                    return -1;
                } else if (a.rewardState < b.rewardState) {
                    return 1;
                }
                else {
                    if (a.countnum && b.countnum) {
                        return this.getSortValueNew(a.rewardState, a.countnum) - this.getSortValueNew(b.rewardState, b.countnum);
                    } else if (a.countnum && !b.countnum) {
                        return -1;
                    }
                    else if (!a.countnum && b.countnum) {
                        return 1;
                    } else {
                        return a.id - b.id;
                    };
                };
            };

        }.bind(this));
        this.limitRestTime = msg.lefttime || 0;
        this.openNewActivityByType(Define.ActivityType.LIMIT_ACTIVITY);
        NotificationController.Emit(Define.EVENT_KEY.RED_ACTIVITY);
        NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
    } else if (msg.type == 1) {
        //冲榜
        let sheet_data = ConfigController.GetConfig('zonelimit_data');
        let hasgetTab = _.get(msg, "hasget", []);
        let fightcangetTab = _.get(msg, "fightcanget", []);
        _.find(this.redPointList, { 'id': 15 }).isfinish = false;
        for (let i = 0; i < sheet_data.length; i++) {
            let element = sheet_data[i];
            let dataType = _.get(element, "type", 0);
            if (dataType == 1 && !hasgetTab.includes(element.id) && fightcangetTab.includes(element.id)) {
                let tempdata = _.find(this.redPointList, { 'id': 15 });//冲榜
                tempdata.isfinish = true;
            };
        };
        NotificationController.Emit(Define.EVENT_KEY.RED_FIGHT_SORT);
        NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
    };
}

ActiveModel.prototype.onRetFund = function (msgid, msg) {
    CountDown.SetCountDown(CountDown.Define.TYPE_ACTIVITY_HONGLI, msg.resttime);
    cc.log("ActiveModel onRetFund");
    this.initTableData();
    this.fundMsg = msg;
    this.insuranceData.sort(function (a, b) {
        let value_1 = this.getRewardStateForIns(msg.level, a.level);
        let value_2 = this.getRewardStateForIns(msg.level, b.level);
        return this.getSortValueForSuran(value_1, a.level) - this.getSortValueForSuran(value_2, b.level)
    }.bind(this));
    NotificationController.Emit(Define.EVENT_KEY.ACTIVITY_JIJIN, msg);

    let jijin_data = ConfigController.GetConfig('fund_data');
    let hasGetLvTab = _.get(msg, "level", 0);
    let hasBuy = _.get(msg, "type", 0);
    _.find(this.jijinPointList, { 'id': 1 }).isfinish = false;
    for (let i = 0; i < jijin_data.length; i++) {
        let element = jijin_data[i];
        let needLv = _.get(element, "level", 0);
        let userLv = UserModel.GetLevel();
        let resttime = _.get(msg, "resttime", 0);
        if (hasBuy > 0 && !hasGetLvTab.includes(needLv) && userLv >= needLv && resttime > 0) {
            _.find(this.jijinPointList, { 'id': 1 }).isfinish = true;
            // let tempdata = _.find(this.redPointList,{'id': 4});//成长基金
            // tempdata.isfinish = true;
            break;
        };
    };
    this.updataJiJinState();

    NotificationController.Emit(Define.EVENT_KEY.RED_ACTIVITY);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
}

ActiveModel.prototype.onRetFundRew = function (msgid, msg) {
    cc.log("ActiveModel onRetFundRew");
    this.initTableData();
    this.fundHongliMsg = msg;
    this.insuranceRewData.sort(function (a, b) {
        return this.getSortValueForHongli(this.getSortValueForHongli(a.id)) - this.getSortValueForHongli(this.getSortValueForHongli(b.id));
    }.bind(this));
    NotificationController.Emit(Define.EVENT_KEY.ACTIVITY_HONGLI, msg);

    let hongli_data = ConfigController.GetConfig('fundreward_data');
    let hasGetIndexTab = _.get(msg, "rewardindex", 0);
    let buycount = _.get(msg, "buycount", 0);
    _.find(this.jijinPointList, { 'id': 2 }).isfinish = false;
    for (let i = 0; i < hongli_data.length; i++) {
        let element = hongli_data[i];
        let id = _.get(element, "id", 0);
        let needcount = _.get(element, "num", 0);
        if (buycount >= needcount && !hasGetIndexTab.includes(id)) {
            _.find(this.jijinPointList, { 'id': 2 }).isfinish = true;
            // let tempdata = _.find(this.redPointList,{'id': 4});//成长基金
            // tempdata.isfinish = true;
            break;
        };
    };
    this.updataJiJinState();
    NotificationController.Emit(Define.EVENT_KEY.RED_ACTIVITY);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
}

ActiveModel.prototype.onRetSuperFund = function (msgid, msg) {
    cc.log("ActiveModel onRetFundRew");
    this.initTableData();
    this.superfundMsg = msg;

    NotificationController.Emit(Define.EVENT_KEY.ACTIVITY_CHAOJI, msg);

    let nextday = _.get(msg, "index", 0);
    let hasBuy = _.get(msg, "buy", false);
    let todayget = _.get(msg, "todayget", false);
    let chaoji_data = ConfigController.GetConfig('superfund_data');
    _.find(this.jijinPointList, { 'id': 3 }).isfinish = false;
    for (let i = 0; i < chaoji_data.length; i++) {
        let element = chaoji_data[i];
        let awardday = _.get(element, "day", 0);
        if (awardday == nextday && hasBuy && !todayget) {
            _.find(this.jijinPointList, { 'id': 3 }).isfinish = true;
            // let tempdata = _.find(this.redPointList,{'id': 4});//成长基金
            // tempdata.isfinish = true;
            break;
        };
    };
    this.updataJiJinState();
    NotificationController.Emit(Define.EVENT_KEY.RED_ACTIVITY);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
}


ActiveModel.prototype.onRetSortTime = function (msgid, msg) {
    cc.log("ActiveModel onRetSortTime");
    this.paihanglefttime = msg.leftime || 0;
    this.updateActiveInfo();

    if (msg.is_openui) {
        this.openNewActivityByType(Define.ActivityType.FIGTHBOX_ACTIVITY)
    }
}

//首冲
ActiveModel.prototype.onRetFirstChargeAct = function (msgid, msg) {
    this.msg_firstrecharge = msg;
    this.chargestatus = msg.getstatus || 0;
    if (msg.is_openui) {
        ViewController.OpenView(UIName.UI_FIRSTRECHARGEVIEW, "ViewLayer", msg);
    }
    if (this.chargestatus == 0) {
        ViewController.CloseView(UIName.UI_FIRSTRECHARGEVIEW);
    }
}
//是否进行过首冲
ActiveModel.prototype.checkHasFirstCharge = function () {
    let chargeStatus = _.get(this.msg_firstrecharge, "getstatus", 0);
    //0 已经领取 1 不可以领取 2 可以领取
    return chargeStatus != 1;
}

//每日充值
ActiveModel.prototype.onRetDayChargeAct = function (msgid, msg) {
    cc.log("ActiveModel onRetDayChargeAct");
    this.meirilefttime = msg.timeleft || 0;
    this.retDayChargeAct = msg;
    if (msg.is_openui) {
        this.openNewActivityByType(Define.ActivityType.CHONGZHI_ACTIVITY);
    }
}
//累计充值
ActiveModel.prototype.onRetTotalChargeAct = function (msgid, msg) {
    cc.log("ActiveModel onRetTotalChargeAct");
    this.leijilefttime = _.get(msg, "timeleft", 0);
    CountDown.SetCountDown(CountDown.Define.TYPE_ACTIVITY_LEIJI, _.get(msg, 'timeleft', 0));
    this.leijidata = _.get(msg, "list", []);

    _.find(this.redPointList, { 'id': 6 }).isfinish = false;
    for (let index = 0; index < this.leijidata.length; index++) {
        let element = this.leijidata[index];
        let rewardState = _.get(element, "status", 0);
        let timeleft = _.get(msg, "timeleft", 0);
        if (rewardState == 2 && timeleft > 0) {
            let tempdata = _.find(this.redPointList, { 'id': 6 });//累计充值
            tempdata.isfinish = true;
            break;
        };
    }

    this.leijidata.sort(function (a, b) {
        // return this.getSortValue(b.status, b.rewardlvl) - this.getSortValue(a.status, a.rewardlvl)
        if (a.status > b.status) {
            return -1;
        } else if (a.status < b.status) {
            return 1;
        } else {
            a.rewardlvl - b.rewardlvl;
        };
    }.bind(this));
    let flag = false;
    for (let i = 0; i < this.leijidata.length; i++) {
        if (this.leijidata[i].status == 1) {
            if (flag) {
                this.leijidata[i].leftmoney = 0;
            }
            flag = true;
        }
    }
    if (msg.is_openui) {
        this.openNewActivityByType(Define.ActivityType.LEIJI_ACTIVITY);
    };
    NotificationController.Emit(Define.EVENT_KEY.RED_ACTIVITY);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
}

ActiveModel.prototype.onRetTurntable = function (msgid, msg) {
    cc.log("ActiveModel onRetTurntable");
    this.restTurnTableTime = msg.resttime || 0;
    this.retTurntable = msg;

    this.openNewActivityByType(Define.ActivityType.TURNTABLE_ACTIVITY);
}

ActiveModel.prototype.onRetChargeRedPacket = function (msgid, msg) {
    cc.log("ActiveModel onRetChargeRedPacket");
    this.retChargeRedPacket = msg;
    this.openNewActivityByType(Define.ActivityType.REDBAG_ACTIVITY);
}
//月卡
ActiveModel.prototype.onRetMonthCard = function (msgid, msg) {
    cc.log("ActiveModel onRetMonthCard");


    if (msg.card_type == 0) {
        this.monthcard_common = msg;
        _.find(this.yuekaPointList, { 'id': 1 }).isfinish = false;
        if (!msg.card_get && msg.card_leftday > 0) {
            _.find(this.yuekaPointList, { 'id': 1 }).isfinish = true;
        };
    };
    if (msg.card_type == 1) {
        this.monthcard_zhizun = msg;
        _.find(this.yuekaPointList, { 'id': 2 }).isfinish = false;
        if (!msg.card_get && msg.card_leftday > 0) {
            _.find(this.yuekaPointList, { 'id': 2 }).isfinish = true;
        };
    };
    this.updataYueKaState();
    if (this.monthcard_common && this.monthcard_zhizun && this.monthcard_openui) {
        this.openNewActivityByType(Define.ActivityType.YUEKA_ACTIVITY);
        this.monthcard_openui = false;
        NotificationController.Emit(Define.EVENT_KEY.ACTIVITY_OPEN_YUEKA);
    }
    NotificationController.Emit(Define.EVENT_KEY.RED_ACTIVITY);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
}

ActiveModel.prototype.onRetTreePlantAct = function (msgid, msg) {
    cc.log("ActiveModel onRetTreePlantAct");
    this.retTreePlantAct = msg;
    this.openNewActivityByType(Define.ActivityType.SMALLTREE_ACTIVITY);
}

ActiveModel.prototype.onTurnDigitalResp = function (msgid, msg) {
    cc.log("ActiveModel onTurnDigitalResp");
    this.turnDigitalResp = msg;;
    this.openNewActivityByType(Define.ActivityType.SEVENNUM_ACTIVITY);
}

ActiveModel.prototype.onRetConsumeInfo = function (msgid, msg) {
    cc.log("ActiveModel onRetConsumeInfo");
    this.consume_leftime = msg.lefttime || 0;
    CountDown.SetCountDown(CountDown.Define.TYPE_ACTIVITY_XIAOFEI, _.get(msg, 'lefttime', 0));
    this.consume_curnum = _.get(msg, "curnum", 0);
    let hasgetTab = _.get(msg, "hasget", []);
    this.consume_hasget = [];
    for (let index = 0; index < 10; index++) {
        this.consume_hasget[index] = 0;
    }
    for (let i = 0; i < hasgetTab.length; i++) {
        let id = hasgetTab[i];
        let change_id = id - 1;
        this.consume_hasget[change_id] = 1;
    }

    _.find(this.redPointList, { 'id': 8 }).isfinish = false;
    let consumereward_data = _.cloneDeep(ConfigController.GetConfig("consumereward_data"));
    for (let i = 0; i < consumereward_data.length; i++) {
        let element = consumereward_data[i];
        let needNum = _.get(element, "num", 0);
        if (this.consume_hasget[i] == 0 && (this.consume_curnum >= needNum) && this.consume_leftime > 0) {
            let tempdata = _.find(this.redPointList, { 'id': 8 });//消费榜
            tempdata.isfinish = true;
            break;
        };
    };

    //请求消费排行榜信息
    NetWorkController.SendProto('consume.reqConsumeSort', {});
    this.openNewActivityByType(Define.ActivityType.COSTSORT_ACTIVITY);
    NotificationController.Emit(Define.EVENT_KEY.ACTIVITY_CONSUME_INFO);
    NotificationController.Emit(Define.EVENT_KEY.RED_ACTIVITY);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);

    // local newAct = g_UIManager:getPanel("UINewActivity")
    // if newAct and newAct["allActPanel"..Enum.ActivityType.COSTSORT_ACTIVITY] then
    //     newAct["allActPanel"..Enum.ActivityType.COSTSORT_ACTIVITY]:refreshPage(this.consume_curnum)
    // end

    // local panel = g_UIManager:getPanel("UIActivityCostSort")
    // if panel then panel:refreshPage(t.curnum) end

}

ActiveModel.prototype.onRetConsumeSort = function (msgid, msg) {
    let sortList = _.get(msg, "list", []);
    for (let i = 0; i < sortList.length; i++) {
        let item = sortList[i];
        let mineName = UserModel.GetUserName();
        if (item.name == mineName) {
            this.costsort_index = i + 1;
        };
    };
    this.costsort_tab = sortList;
    NotificationController.Emit(Define.EVENT_KEY.ACTIVITY_CONSUME_SORT);
}

ActiveModel.prototype.onOnlineConsume = function (msgid, msg) {
    cc.log("ActiveModel onOnlineConsume");
    this.consume_leftime = msg.lefttime || 0;
}


ActiveModel.prototype.onRetTargetActivity = function (msgid, msg) {
    cc.log("ActiveModel onRetTargetActivity");
    this.newTargetMsg = true;
    this.RetTargetActivity = msg;
    if (msg.targets) {
        msg.targets.sort(function (a, b) {
            if (a.isget && !b.isget) {
                return 1;
            } else if (!a.isget && b.isget) {
                return -1;
            } else {
                return a.needcount - b.needcount
            }
        }.bind(this));
    }
    this.openNewActivityByType(msg.type);
}

ActiveModel.prototype.onRetInsuranceRec = function (msgid, msg) {
    this.retInsuranceRec = msg;
    // local tPanel = g_UIManager:getOrCreatePanel("UINewActivity")
    // if tPanel["allActPanel"..Enum.ActivityType.INSURANCE_ACTIVITY] then
    //     tPanel["allActPanel"..Enum.ActivityType.INSURANCE_ACTIVITY]:updateInsuranceRec(msg)
    // end

}

ActiveModel.prototype.onNotifyNew = function (msgid, msg) {
    let isAdd = true;
    let index = msg.index || 0;
    for (let i = 0; i < this.noticeTable.length; i++) {
        if (this.noticeTable[i] == index) {
            isAdd = false;
            break;
        };
    }
    if (isAdd) {
        this.noticeTable.push(index);
    }
}

ActiveModel.prototype.retFightSortActInfo = function (msgid, msg) {
    // DailySignView
    this.msg_fightsortactinfo = msg;
    // let timeleft = _.get(msg,"timeleft",0);
    // if(msg.iscanget && !msg.isget && timeleft > 0){
    //     let tempdata = _.find(this.redPointList,{'id': 15});//冲榜
    //     tempdata.isfinish = true;
    // };

    CountDown.SetCountDown(CountDown.Define.TYPE_ACTIVITY_FIGHTRANK, msg.timeleft);
    if (msg.isopenui) {
        // ViewController.OpenView(UIName.UI_FIGHTRANKVIEW,"ViewLayer",msg);
        ViewController.OpenView(UIName.UI_FIGHTRANKVIEW, "ViewLayer", msg);
    }
    // NotificationController.Emit(Define.EVENT_KEY.RED_FIGHT_SORT);
    // NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
}

//获取当前可领取的每日礼包id
ActiveModel.prototype.getCurDailyGiftId = function () {
    var gift_data = VipModel.retVipInfo.charge_gift;
    if (gift_data.length == 0) {
        return 14;
    }
    else {
        return gift_data[gift_data.length - 1].id;
    }
}
//今日是否购买过第一个每日礼包
ActiveModel.prototype.hasBuyFirstDailygift = function () {
    let giftID = this.getCurDailyGiftId();
    if (UserModel.GetTopMapid() <= 20006) {
        return true;
    }
    if (giftID == 8) {
        return false;
    } else {
        return true;
    }
}

ActiveModel.prototype.updateShouchongRedPoint = function () {
    var msg_firstrecharge = this.msg_firstrecharge;
    if (msg_firstrecharge.getstatus == 2) {
        return true;
    }
    else {
        return false;
    }
}

ActiveModel.prototype.onPayResult = function (status) {
    if (status == 1) {
        if (this.msg_firstrecharge.getstatus == 1) {
            this.msg_firstrecharge.getstatus = 2;
        }
    }
}

ActiveModel.prototype.onFirstChargeOk = function () {
    if (this.msg_firstrecharge.getstatus == 1) {
        this.msg_firstrecharge.getstatus = 2;
    }
}

ActiveModel.prototype.onSendFirstLoginPresent = function (msgid, msg) {
    this.firstLoginRewardId = _.get.bind(msg,"reward",0);
}



module.exports = new ActiveModel();