const Tools = require('../Util/Tools');
const Define = require('../Util/Define');
const NotificationController = require('../Controller/NotificationController');
const LoginController = require('../Controller/LoginController');
const ConfigController = require('../Controller/ConfigController');
const TimeController = require('../Controller/TimeController');
const UserModel = require('../Model/User');
const Global = require('../Model/Global');
const NetWorkController = require('../Controller/NetWorkController');

let AndroidPlatform = {
    PLATFORM: 'Android',    //'Normal',//'Wechat',//'QQPlay',//'ios'
    packageName: 'org/cocos2dx/javascript/JSBridge',

    CopyToClipboard: function (obj) {
        cc.log('CopyToClipboard');
    },
    InitPlatform: function () {
        cc.log('InitPlatform');
        NotificationController.On(Define.EVENT_KEY.NATIVE_PAY_RESULT, this, this.PayResult);
        NotificationController.On(Define.EVENT_KEY.ROLE_LOGINFINISH, this, this.onLoginFinish);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.HideSplash();
        return;
    },

    onKeyDown: function (event) {
        switch(event.keyCode) {
            case cc.KEY.back:
                this.OnBackPressed();
                break;
            default: break;
        }
    },

    OnBackPressed(){
        jsb.reflection.callStaticMethod(this.packageName,'OnBackPressed','()V');
    },

    AutoLogin: function () {
        cc.log('AutoLogin');
        jsb.reflection.callStaticMethod(this.packageName,'Login','()V');
        return;
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
        // return;
        var payment = ConfigController.GetConfigById('mall_data', mallId);
        if (payment) {
            let extInfo = Global.GetLoginServerData().Zoneid + "|" + UserModel.acc + "|" + payment.productid + "|" + TimeController.GetCurTime();
            var payObj = {
                cpOrderId: extInfo,
                goodsId:payment.productid,
                goodsName: payment.goodsname,
                count: 1,
                amount: payment.price,
            };
            var payStr = JSON.stringify(payObj);
            this.SetAccount(UserModel.GetCharid().toString());
            jsb.reflection.callStaticMethod(this.packageName,'Pay','(Ljava/lang/String;)V',payStr);
        }
        else {
            cc.log("支付异常，payment is null mallId:", mallId);
        }
    },
    PayResult: function (status, extInfo) {
        cc.log("status ", status);
        cc.log('ext ', extInfo);
        this.SetAccount(UserModel.GetCharid().toString());
        if (status == 1) {
            //支付成功
            cc.log("支付成功");
        }
        else {
            //支付失败
            cc.log("支付失败");
        }
        NotificationController.Emit(Define.EVENT_KEY.PAY_RESULT, status);
        //打点
        
        // this.ChargeSuccess(extInfo);
    },
    onLoginFinish: function () {
        this.SetAccount(UserModel.GetCharid().toString());
        this.SetUserInfo();
    },
    SetStorage: function (key, value) {
        cc.sys.localStorage.setItem(key, value);
    },
    GetStorage: function (key) {
        return cc.sys.localStorage.getItem(key);
    },
    Logout: function () {
        jsb.reflection.callStaticMethod(this.packageName,'Logout','()V');
    },

    SetUserInfo(){
        var userInfo = {
            gameRoleName: UserModel.GetUserName(),
            gameRoleId: UserModel.GetCharid(),
            iscreateRole: Global.isFirstGame,
            serverName: Global.GetLoginServerData().Name,
        }
        var userInfoStr = JSON.stringify(userInfo);
        jsb.reflection.callStaticMethod(this.packageName,'SetUserInfo','(Ljava/lang/String;)V',userInfoStr);
    },

    StaticLogin(){},

    StaticRegister(){},

    AddShortCut(){},

    SetAccount(acc){
        jsb.reflection.callStaticMethod(this.packageName, 'SetAccount', '(Ljava/lang/String;)V',acc.toString);
    },

    ChargeSuccess(){},

    SetTDEventData: function(event, obj){
        cc.log("event = "+event+"  obj = "+obj);
        // jsb.reflection.callStaticMethod(
        //     "Platform",
        //     "SetTDEventData:event:success:gold:times:userid:",
        //     event, obj.success, obj.gold, obj.times, obj.userid);
    },

    HideSplash(){
        jsb.reflection.callStaticMethod(this.packageName,'HideSplash','()V');
    }
    
}

module.exports = AndroidPlatform;