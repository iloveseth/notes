const Tools = require('../Util/Tools');
const Define = require('../Util/Define');
const CppCmd = require('../Util/CppCmd');
const NotificationController = require('../Controller/NotificationController');
const LoginController = require('../Controller/LoginController');
const UserModel = require('../Model/User');
const GlobalModel = require('../Model/Global');

let CommonPlatform = {
    PLATFORM: 'Normal',    //'Normal',//'Wechat',//'QQPlay'
    CopyToClipboard: function (obj) {
        cc.log('CopyToClipboard');
    },
    InitPlatform: function () {
        cc.log('InitPlatform');
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },

    onKeyDown: function (event) {
        cc.log(event.keyCode);
        switch(event.keyCode) {
            case cc.KEY.back:
                // console.log('Press a key');
                // this.onKeyBack();
                break;
            default: break;
        }
    },
    AutoLogin: function () {
        // cc.director.loadScene("MainScene");
        LoginController.ConnectToLoginServer();
    },
    Logout: function () {
        cc.log('没有平台的登出，有sdk的自己要实现')
        const Game = require('../Game');
        Game.GameInstance.Logout();
        this.SetTDEventData(Define.TD_EVENT.EventLeaveGame);
    },
    TokenLogin: function () {
        cc.log("web-tokenlogin");
    },
    SendUserInfo: function (cb) {
        Tools.InvokeCallback(cb, '', '');
    },
    ShareMessage: function (title, desc, share_type, image_url, share_param, back) { 
        cc.log('ShareMessage');
        NotificationController.Emit(Define.EVENT_KEY.ON_SHOWGAME, null);
        NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, "微信版本才支持分享功能哟");
    },
    ShowShareMenu: function (title, desc, image_url, share_param, back) {
    },
    RequestPay: function (mallId) {
        cc.log('web----RequestPay ' + mallId);
    },
    SetStorage: function (key, value) {
        cc.sys.localStorage.setItem(key, value);
    },
    GetStorage: function (key) {
        return cc.sys.localStorage.getItem(key);
    },
    StaticRegister:function () {
        
    },
    StaticLogin:function()
    {
    },
    //统计相关咯
    SetAccount: function (acc) {
        cc.log('通用平台没有登陆统计 ' + acc);
    },
    ChargeStart: function (orderid, productid, price, currencytype, gold, paymenttype) {
        cc.log('通用平台没有充值统计 ' + orderid);
    },
    ChargeSuccess: function (orderid) {
        cc.log('通用平台没有充值成功统计 ' + orderid);
    },
    AddShortCut:function()
    {

    },
    SetTDEventData: function(event, obj){
        // http://doc.talkingdata.com/posts/70
        
        // let server = GlobalModel.GetLoginServerData();
        // let user = UserModel.GetUserInfo();
        // let accountId = UserModel.acc
        // switch(event){
        //     case Define.TD_EVENT.EventCreateRole:
        //     case Define.TD_EVENT.EventLogin:
        //         TDGA.Account({ accountId : accountId,
        //             gameServer : server.name,
        //             level : user.level,
        //             accountType : 3,
        //             accountName : user.name,
        //         });
        //         break;
        //     case Define.TD_EVENT.EventLeaveGame:
        //         TDGA.onPageLeave();
        //         break;
        //     case Define.TD_EVENT.EventConsumeMoney:
        //         TDGA.onItemPurchase({
        //             item :'spendGold',
        //             itemNumber : 1,
        //             priceInVirtualCurrency : obj.gold,
        //             });

        //         break;
        //      case Define.TD_EVENT.EventPay:
        //          TDGA.onChargeRequest({
        //               orderId : obj.orderid,
        //               iapId : '钻石礼包',
        //               currencyAmount : obj.price,
        //               currencyType : 'CNY',
        //               virtualCurrencyAmount : obj.vAmount,
        //               // paymentType : 'AliPay'
        //             });
        //         break;
        //     case Define.TD_EVENT.EventPaySuccess:
        //         TDGA.onChargeSuccess({
        //               orderId : obj.orderid,
        //               iapId : '钻石礼包',
        //               currencyAmount : 100,
        //               currencyType : 'CNY',
        //               virtualCurrencyAmount : 1000,
        //         });
        //         break;
        //     case Define.TD_EVENT.EventPlayerLevel:
        //         TDGA.Account.setLevel(user.level);
        //         break;
        //     default:
        //         cc.log("JSON.stringify(obj) = ",JSON.stringify(obj));
        //         TDGA.onEvent(event, JSON.stringify(obj));
        //         break;
        // }
    },
}

module.exports = CommonPlatform;3248528184