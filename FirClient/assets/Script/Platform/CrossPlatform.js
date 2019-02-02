// let CrossPlatform = {
//     get PLATFORM(){
//         if(cc.sys.os == cc.sys.OS_ANDROID){
//             return 'Android';
//         }
//         else if(cc.sys.os == cc.sys.OS_IOS){
//             return 'iOS';
//         }
//     },

//     get packageName(){
//         if(cc.sys.os == cc.sys.OS_ANDROID){
//             return 'org/cocos2dx/javascript/AppActivity';
//         }
//         else if(cc.sys.os == cc.sys.OS_IOS){
//             return 'iOS';
//         }
//     },

//     CopyToClipboard: function (obj) {
//         cc.log('CopyToClipboard');
//     },
//     InitPlatform: function () {
//         cc.log('InitPlatform');
//     },
//     AutoLogin: function () {
//         // cc.director.loadScene("MainScene");
//         // LoginController.ConnectToLoginServer();
        
//         jsb.reflection.callStaticMethod(this.packageName,'Login','()V');
//     }, 
//     Logout: function () {
//         cc.log('没有平台的登出，有sdk的自己要实现')
//     },
//     TokenLogin: function () {
//         cc.log("web-tokenlogin");
//     },
//     SendUserInfo: function (cb) {
//         Tools.InvokeCallback(cb, '', '');
//     },
//     ShareMessage: function (title, desc, share_type, image_url, share_param, back) { 
//         cc.log('ShareMessage');
//         NotificationController.Emit(Define.EVENT_KEY.ON_SHOWGAME, null);
//         NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, "微信版本才支持分享功能哟");
//     },
//     ShowShareMenu: function (title, desc, image_url, share_param, back) {
//     },
//     RequestPay: function (mallId) {
//         cc.log('web----RequestPay ' + mallId);
//     },
//     SetStorage: function (key, value) {
//         cc.sys.localStorage.setItem(key, value);
//     },
//     GetStorage: function (key) {
//         return cc.sys.localStorage.getItem(key);
//     },
//     StaticRegister:function () {
        
//     },
//     StaticLogin:function()
//     {
//     },
//     //统计相关咯
//     SetAccount: function (acc) {
//         cc.log('通用平台没有登陆统计 ' + acc);
//     },
//     ChargeStart: function (orderid, productid, price, currencytype, gold, paymenttype) {
//         cc.log('通用平台没有充值统计 ' + orderid);
//     },
//     ChargeSuccess: function (orderid) {
//         cc.log('通用平台没有充值成功统计 ' + orderid);
//     },
//     AddShortCut:function()
//     {

//     },
// }