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
const TaskModel = require('./Task');
const Level = require('../Model/Level');
const GuideController = require('../Controller/GuideController');

var WelfareModel = function () {

    //个人试炼
    this.m_vector = [];
    this.m_getRewctor = [];
    this.m_vectorOrder = [];
    this.m_Count = 0
    this.wardMap = [];
    this.m_getaward = false //是否有个人试炼领取

    //每日试炼
    this.m_daygrowlist = [];
    this.m_getall = false;//是否可以一键领取
    this.m_showpoint = false;//是否显示红点

}

WelfareModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('daygrow.retDayGrowAccInfo', this, this.onRetDayGrowAccInfo);//返回每日累计任务奖励
    NetWorkController.AddListener('daygrow.retDayGrowList', this, this.onRetDayGrowList);//返回每日试炼列表
    NetWorkController.AddListener('msg.sendSysReward', this, this.onSendSysReward);//返回成长任务列表
    NetWorkController.AddListener('daygrow.updateDayGrowNotice', this, this.onUpdateDayGrowNotice);//返回是否有每日成长领取
    Tools.InvokeCallback(cb, null);
}
WelfareModel.prototype.Reload = function (cb) {
    this.m_vector = [];
    this.m_getRewctor = [];
    this.m_vectorOrder = [];
    this.m_Count = 0
    this.wardMap = [];
    this.m_getaward = false //是否有个人试炼领取
    //每日试炼
    this.m_daygrowlist = [];
    this.m_getall = false;//是否可以一键领取
    this.m_showpoint = false;//是否显示红点
    Tools.InvokeCallback(cb, null);
}

/**
 * 对外接口
 */
WelfareModel.prototype.getIsGetAll = function () {
    return this.m_getall;
}
WelfareModel.prototype.getDaygrowlist = function () {
    return this.m_daygrowlist;
}
WelfareModel.prototype.getVectorOrder = function () {
    return this.m_vectorOrder;
}
WelfareModel.prototype.getGetaward = function () {
    return this.m_getaward;
}

/**
* 消息处理接口
*/
WelfareModel.prototype.onRetDayGrowAccInfo = function (msgid, msg) {
    NotificationController.Emit(Define.EVENT_KEY.WELFARE_RET_DAY_GROW_ACC, msg);
}

WelfareModel.prototype.onRetDayGrowList = function (msgid, msg) {
    this.m_getall = false;
    this.m_daygrowlist = [];
    let growlist = msg.daygrow;
    let growlist1 = [];
    let growlist2 = [];
    let growlist3 = [];

    for (let i = 0; i < growlist.length; i++) {
        let v = growlist[i];
        let is_repeat = false;
        let result = true;

        let data = ConfigController.GetConfigById("daygrow_data", v.id);
        let sort = 0;
        let point = 0;

        // let limitID = _.get(data, 'limitid', 0);
        // let isOpen = GuideController.IsFunctionOpen(limitID);
        let isOpen = true;

        if (isOpen) {
            if (data) {
                sort = _.get(data, 'sort', 0);
                point = _.get(data, 'point', 0);
                let daygrowTab_1 = ConfigController.GetConfig("daygrow_data");
                for (let r = 0; r < daygrowTab_1.length; r++) {
                    let k = daygrowTab_1[r];
                    if (k.tbxid != v.id && k.sort == sort) {
                        is_repeat = true;
                        break;
                    }
                }
            } else {
                result = false;
            };

            if (is_repeat) {
                //多个，未完成,删除
                for (let i1 = 0; i1 < growlist1.length; i1++) {
                    let v1 = growlist1[i1];
                    let s_1 = ConfigController.GetConfigById("daygrow_data", v1.id).sort;
                    if (s_1 == sort) { result = false; break; };
                };

                //多个，完成,删除
                for (let i2 = 0; i2 < this.m_daygrowlist.length; i2++) {
                    let v2 = this.m_daygrowlist[i2];
                    let s_2 = ConfigController.GetConfigById("daygrow_data", v2.id).sort;
                    if (s_2 == sort) { result = false; break; };
                };

                //特殊满足条件:如果已经领取，并且为最高列
                if (v.progress == Define.DayGrowStatus.DayGrow_GET) {
                    let is_h = true;
                    let daygrowTab = ConfigController.GetConfig("daygrow_data");
                    for (let i3 = 0; i3 < daygrowTab.length; i3++) {
                        let v3 = daygrowTab[i3];
                        if (v3.point > point && v3.tbxid != v.id && v3.sort == sort) {

                        };
                    };
                    result = is_h;
                };
            }

            if (result) {
                if (v.progress == Define.DayGrowStatus.DayGrow_UNCOMPLETE) {
                    growlist1.push(v);
                } else if (v.progress == Define.DayGrowStatus.DayGrow_UNGET) {
                    this.m_daygrowlist.push(v);
                } else if (v.progress == Define.DayGrowStatus.DayGrow_GET) {
                    growlist3.push(v);
                };

            };
        };
    };

    let daygrowtbx = ConfigController.GetConfig("daygrow_data");
    let sortFunc = function (v1, v2) {
        if (v1 == null || v2 == null) { return 0 };
        if (daygrowtbx[v1.id] == null || daygrowtbx[v2.id] == null) { return 0 };
        return (daygrowtbx[v1.id].sort - daygrowtbx[v2.id].sort);
    };

    growlist1.sort(sortFunc);
    this.m_daygrowlist.sort(sortFunc);
    growlist3.sort(sortFunc);

    if (this.m_daygrowlist.length > 0) {
        this.m_getall = true;
    };

    this.m_daygrowlist = _.concat(this.m_daygrowlist, growlist1, growlist3);

    NotificationController.Emit(Define.EVENT_KEY.WELFARE_RET_DAY_GROW_LIST);
    NotificationController.Emit(Define.EVENT_KEY.RED_WELFARE);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);

}

WelfareModel.prototype.onSendSysReward = function (msgid, msg) {
    this.m_vectorOrder = [];
    this.m_getaward = false;

    for (let i = 0; i < msg.info.length; i++) {
        if (msg.info[i].id != 0) {
            let welfare = {};
            let base = ConfigController.GetConfigById("sysreward_data", msg.info[i].id);
            let lvLimit = _.get(base, 'locklevel', 0);
            let mapLimit = _.get(base, 'lockmap', 0);
            let checkResult = this.checkEnableOrNot(lvLimit, mapLimit);

            if (checkResult) {
                welfare.mId = msg.info[i].id;
                welfare.percent = msg.info[i].num * 100 / base.num;
                if (base.type == 7 && msg.info[i].num != 0) {
                    welfare.percent = base.num * 100 / msg.info[i].num;
                }
                welfare.presentNum = msg.info[i].num;
                welfare.nextNum = base.num;
                if (base.type != 7) {
                    if (base.num > msg.info[i].num) {
                        welfare.isGet = false
                    } else {
                        welfare.isGet = true;
                        this.m_getaward = true;
                    };
                } else {
                    if (base.num < msg.info[i].num || msg.info[i].num == 0) {
                        welfare.isGet = false;
                    } else {
                        welfare.isGet = true;
                        this.m_getaward = true;
                    }
                };

                this.m_vectorOrder.push(welfare);
            };
        };
    }

    this.m_vectorOrder.sort(function (v1, v2) {
        if (v1.isGet && !v2.isGet) { return -1 };
        if (!v1.isGet && v2.isGet) { return 1 };
        return v2.percent - v1.percent;
    });
    this.m_Count = this.m_vectorOrder.length;

    NotificationController.Emit(Define.EVENT_KEY.WELFARE_SEND_SYS_REWARD);
    NotificationController.Emit(Define.EVENT_KEY.RED_WELFARE);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
}

WelfareModel.prototype.onUpdateDayGrowNotice = function (msgid, msg) {
    this.m_showpoint = msg.show;
}


/**
 * 内部数据处理接口
 */

//检查是否达到过图要求
WelfareModel.prototype.checkEnableOrNot = function (lvLimit, mapLimit) {
    let mineLv = UserModel.GetLevel();
    let mineMap = UserModel.GetTopMapid();
    if (mineLv >= lvLimit && mineMap >= mapLimit) {
        return true;
    } else {
        return false;
    };
}


//试炼跳转界面接口
WelfareModel.prototype.jumpToMissionView = function (tag) {
    if (tag == 1) {

    } else if (tag == 2) {
        //夺取水晶
        NetWorkController.SendProto('border.gotoQuest', { type: Define.CstoreItemType.CStoreType_BANZHUAN });
    } else if (tag == 3) {
        //护送晶石
        NetWorkController.SendProto('border.gotoQuest', { type: Define.CstoreItemType.CStoreType_YUNBIAO });
    } else if (tag == 4 || tag == 16) {
        //每日PK
        ViewController.OpenView(UIName.UI_GYM_FIGHT_LIST_VIEW, "ViewLayer");
    } else if (tag == 17 || tag == 18) {
        //每日点赞
        NotificationController.Emit(Define.EVENT_KEY.CHAT_VIEW_OPEN, 5);
    } else if (tag == 5) {
        //公会护送
        if (UserModel.GetSeptname() != '') {
            NetWorkController.SendProto('septpk.reqSeptGuard', {});
        } else {
            NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, '请先加入工会!');
        }
    } else if (tag == 6) {
        //挑战BOSS
        ViewController.OpenView(UIName.UI_WORLDBOSSLIST, 'ViewLayer');
    } else if (tag == 7) {
        //劫取晶石
    } else if (tag == 8) {
        //祝福
        TaskModel.isOpenDailyTask = true;
        NetWorkController.SendProto('border.reqQuestInfo', {});
    } else if (tag == 9) {

    } else if (tag == 10) {
        //熔炼装备
        NotificationController.Emit(Define.EVENT_KEY.CHANGE_MAINPAGE, Define.MAINPAGESTATE.Page_Bag);
    } else if (tag == 11) {

    } else if (tag == 12) {
        //庄园
        GlobalModel.SetIsOpenDigView(true);
        NetWorkController.SendProto('msg.reqAllDigStatus', {});

    } else if (tag == 13 || tag == 14) {
        //竞技场
        ViewController.OpenView(UIName.UI_GYM_FIGHT_LIST_VIEW, "ViewLayer");
    };
}

WelfareModel.prototype.updateWelfareRedPoint = function () {

    if (this.m_getaward || this.m_getall) {
        return true;
    } else {
        return false;
    }

}


module.exports = new WelfareModel();