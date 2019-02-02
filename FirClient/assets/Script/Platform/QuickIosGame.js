const _ = require('lodash');
const Tools = require('../Util/Tools');
const Define = require('../Util/Define');
const NotificationController = require('../Controller/NotificationController');
const LoginController = require('../Controller/LoginController');
const ConfigController = require('../Controller/ConfigController');
const TimeController = require('../Controller/TimeController');
const UserModel = require('../Model/User');
const Global = require('../Model/Global');
const CommonPlatform = require('./CommonGame');
const ServerUtil = require('../Util/ServerUtil');
const NetWorkController = require('../Controller/NetWorkController');

let IosPlatform = _.merge(_.cloneDeep(CommonPlatform), {
    PLATFORM: 'QuickIos',    //'Normal',//'Wechat',//'QQPlay',//'ios'

    InitPlatform: function () {
        cc.log('InitPlatform');
        NotificationController.On(Define.EVENT_KEY.NATIVE_PAY_RESULT, this, this.PayResult);
        NotificationController.On(Define.EVENT_KEY.ROLE_LOGINFINISH, this, this.onLoginFinish);
        NetWorkController.AddListener('msg.ChargeOrderId', this, this.onChargeOrderId);
        let ret = jsb.reflection.callStaticMethod("Platform", "IsLowQuality");
        if (ret) {
            //低配版本
            cc.director.setAnimationInterval(1.0 / 30);
        } else {
            cc.director.setAnimationInterval(1.0 / 60);
        }
    },
    AutoLogin: function () {
        cc.log('AutoLogin');
        // LoginController.ConnectToLoginServer(); //move todo 暂时做测试
        let ret = jsb.reflection.callStaticMethod("Platform", "Login");
        cc.log("登录结果：", ret);
    },
    TokenLogin: function () {
        LoginController.ConnectToLoginServer();
    },
    SendUserInfo: function (cb) {
        Tools.InvokeCallback(cb, '', '');
    },
    ShareMessage: function (title, desc, share_type, image_url, share_param, back) {
        cc.log('ShareMessage');
        NotificationController.Emit(Define.EVENT_KEY.ON_SHOWGAME, null);
        NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, "暂不支持分享");
    },
    ShowShareMenu: function (title, desc, image_url, share_param, back) {
    },
    RequestPay: function (mallId) {
        var payment = ConfigController.GetConfigById('mall_data', mallId);
        if (payment) {
            let extInfo = ServerUtil.channel + "|" + Global.GetLoginServerData().Zoneid + "|" + UserModel.acc + "|" + payment.productid + "|" + TimeController.GetCurTime();
            // ViewController.OpenView(UIName.UI_RECHARGE_SHADE_NODE, "MaskLayer");
            cc.log('RequestPay ' + JSON.stringify(payment));
            let platfrom = jsb.reflection.callStaticMethod("Platform", "GetPlatfrom");
            let ret = jsb.reflection.callStaticMethod("Platform", "Pay:goodsPrice:goodsDesc:extendInfo:productId:", payment.goodsname, payment.price, payment.goodsdesc, extInfo, payment.productid);
            //打点
            NetWorkController.SendProto('msg.ChargeOrderId', { orderid: extInfo });
            this.SetAccount(UserModel.GetCharid().toString());
            this.ChargeStart(extInfo, payment.productid, payment.price, 'CNY', 1, platfrom.toString());
        }
        else {
            cc.log("支付异常，payment is null mallId:", mallId);
        }
    },
    PayResult: function (status, extInfo) {
        cc.log("status ", status);
        cc.log('ext ', extInfo);
        // ViewController.CloseView(UIName.UI_RECHARGE_SHADE_NODE);
        if (status == 1) {
            //支付成功
            cc.log("支付成功");
        }
        else {
            //支付失败
            cc.log("支付失败");
        }
        NotificationController.Emit(Define.EVENT_KEY.PAY_RESULT, status);
    },
    onLoginFinish: function () {
        this.SetAccount(UserModel.GetCharid().toString());
    },
    onChargeOrderId: function (msgid, data) {
        //打点 支付成功
        let orderid = _.get(data, 'orderid', '');
        this.SetAccount(UserModel.GetCharid().toString());
        this.ChargeSuccess(orderid);
    },
    SetStorage: function (key, value) {
        cc.sys.localStorage.setItem(key, value);
    },
    GetStorage: function (key) {
        return cc.sys.localStorage.getItem(key);
    },
    Logout: function () {
        let ret = jsb.reflection.callStaticMethod("Platform", "Logout");
        cc.log("登出结果：", ret);
    },

    //统计相关咯
    SetAccount: function (acc) {
        jsb.reflection.callStaticMethod("Platform", "SetAccount:", acc.toString());
    },
    ChargeStart: function (orderid, productid, price, currencytype, gold, paymenttype) {
        jsb.reflection.callStaticMethod(
            "Platform",
            "ChargeStart:productId:currencyAmount:currencyType:virtualCurrencyAmount:paymentType:",
            orderid, productid, price / 100.0, currencytype, gold, paymenttype);
    },
    ChargeSuccess: function (orderid) {
        jsb.reflection.callStaticMethod("Platform", "ChargeSuccess:", orderid);
    },
    SetTDEventData: function (event, obj) {
        cc.log("event = " + event + "  obj = " + obj);
        // jsb.reflection.callStaticMethod(
        //     "Platform",
        //     "SetTDEventData:event:success:gold:times:userid:",
        //     event, obj.success, obj.gold, obj.times, obj.userid);
    },
});

module.exports = IosPlatform;