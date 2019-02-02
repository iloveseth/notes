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
const TimeController = require('../Controller/TimeController');
const CountDown = require('../Util/CountDown');
const GuideController = require('../Controller/GuideController');

var VipModel = function () {
    this.fame = 0;
    this.smelt = 0;
    this.sign = "";
    this.killdeltatimes = 0;
    this.OnLinereWardTime = 0;
    this.OnLinereWardId = 0;

    this.retVipInfo = null;
    this.loadmalltbl = false;
    this.quality2ids = [];

    this.signIDIndex = -1;
    this.giftTimePast = 0;
    this.giftTimeReceive = 0;

    this._vipexp = 0;
    this._vipTotleExp = 0;
    this._openType = 1;
}

VipModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.RetVipInfo', this, this.onRetVipInfo);
    NetWorkController.AddListener('msg.notifyVipExp', this, this.onNotifyVipExp);

    NotificationController.On(Define.EVENT_KEY.PAY_RESULT, this, this.onPayResult);

    Tools.InvokeCallback(cb, null);
}

/**
 * 对外接口
 */

VipModel.prototype.SetVipExp = function(value){
    this._vipexp = value;
}
VipModel.prototype.GetVipExp = function() {
    return this._vipexp;
}

VipModel.prototype.GetVipTotleExp = function () {
    let define = ConfigController.GetConfigById('vipreward_data', UserModel.GetViplevel() + 2, 'level');
    var totleExp = _.get(define, 'needmoney', 0);
    if(totleExp){
        return totleExp;
    }
    return UserModel.GetVipValue('needmoney');
}

VipModel.prototype.SetVipType = function (value) {
    this._openType = value;
}




 /**
 * 消息处理接口
 */

 //VIP详细信息返回
 VipModel.prototype.onRetVipInfo = function (msgid, msg) {
    this.giftTimePast = 0;
    // this.giftTimeReceive = TimeController.GetCurTime();
    this.giftTimeReceive = 0;

    if(this.loadmalltbl == false){
        this.loadmalltbl = true;
        this.quality2ids = [];
        let giftdata = ConfigController.GetConfig("giftbag_data");
        for (let i = 0; i < giftdata.length; i++) {
            let rec = giftdata[i];
            if(this.quality2ids[rec.quality] == null){
                this.quality2ids[rec.quality] = [];
            };
            this.quality2ids[rec.quality].push(rec);
        };
    };

    this.retVipInfo = msg;
    if(!msg.noshow){
        ViewController.OpenView(UIName.UI_VIP_RECHARGE_VIEW,"ViewLayer",{type : this._openType});
        // this.SetVipType(1);
        this.SetVipExp(msg.vipexp || 0);
        UserModel.SetViplevel(msg.viplevel || 0);
        NotificationController.Emit(Define.EVENT_KEY.VIP_RET_INFO);
    }

    NotificationController.Emit(Define.EVENT_KEY.VIP_RET_INFO1);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED); 

    //找有没推荐的
    this.signIDIndex = -1;
    let charge_gift = _.get(msg,"charge_gift",[]);
    for (let i = 0; i < charge_gift.length; i++) {
        let v = ConfigController.GetConfigById("mall_data",charge_gift[i].id);
        if(v.sign == 1){
            this.signIDIndex = i;
            let giftLeftTime = charge_gift[i].lefttime;
            this.dailyGiftLeftTime = giftLeftTime;
            this.giftTimeReceive = this.giftTimeReceive + giftLeftTime;
            CountDown.SetCountDown(CountDown.Define.TYPE_GIFT_LEFT_TIME, this.giftTimeReceive);
            CountDown.SetCountDown(CountDown.Define.TYPE_DAILYGIFTLEFTTIME, this.dailyGiftLeftTime);
            break;
        };
    }

    if(this.signIDIndex != -1){
        // local mainInterface = g_UIManager:getPanel("MainInterface")
        // if mainInterface then
        //     if self.retVipInfo ~= nil and #self.retVipInfo.charge_gift > 0 then
        //         print ("有礼包")
        //         mainInterface:refreshGiftBagIons(self.retVipInfo.charge_gift[self.signIDIndex])
        //     else
        //         print ("没礼包")
        //         mainInterface:refreshGiftBagIons(nil)
        //     end
        // end

        // --礼包界面已经打开
        // local panel = g_UIManager:getPanel("UIGiftInfo")
        // if panel then
        //     local id = g_MainData.retVipInfo.charge_gift[g_MainData.signIDIndex].id
        //     print ("id: " .. id)
        //     panel:refreshListView(id, g_MainData.retVipInfo.charge_gift[g_MainData.signIDIndex].lefttime)
        //     panel:showToScene()
        // end
    }else{
        // --隐藏图标
        // local mainInterface = g_UIManager:getPanel("MainInterface")
        // if mainInterface then
        //     mainInterface:refreshGiftBagIons(nil)
        // end
        // --关闭礼包购买界面
        // local panel = g_UIManager:getPanel("UIGiftInfo")
        // if panel then
        //     panel:closePanel()
        // end
    };


}

VipModel.prototype.checkVipGiftCanBuy = function () {
    let isOpen = GuideController.IsFunctionOpen(80);
    if(!isOpen){return false;};

    let gifts = _.get(this.retVipInfo,"gifts",[]);
    let userVip = UserModel.GetViplevel();
    for (let i = 0; i < gifts.length; i++) {
        let giftInfo = gifts[i];
        let viplevel = _.get(giftInfo,"viplevel",0);
        if(!giftInfo.isget && userVip >= viplevel){
            return true;
        };
    };
    return false;
}

VipModel.prototype.onPayResult = function (status) {
    if(status == 1){
        cc.log("VipModel.prototype.onPayResult status == 1");
        NetWorkController.SendProto('msg.ReqVipInfo', { noshow: false });
    };
}
VipModel.prototype.onNotifyVipExp = function(msgid, data) {
    this.SetVipExp(data.vipexp || 0);
    let Game = require('../Game');
    Game.Platform.SetTDEventData(Define.TD_EVENT.EventPlayerVip,{vip:data.viplevel, charid:UserModel.GetCharid()});

    UserModel.SetViplevel(data.viplevel || 0);
    NotificationController.Emit(Define.EVENT_KEY.VIP_NOTIFY_VIP_EXP);
}

module.exports = new VipModel();