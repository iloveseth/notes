let _ = require('lodash')
let async = require('async');

const Global = require('../Model/Global');
const UserModel = require('../Model/User');
const TimeController = require('../Controller/TimeController');
const LoginController = require('../Controller/LoginController');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const ConfigController = require('../Controller/ConfigController');
const Define = require('../Util/Define');
const ServerUtil = require('../Util/ServerUtil');
const CommonPlatform = require('./CommonGame');
const Tools = require('../Util/Tools');

let QQPlatform =  _.merge(_.cloneDeep(CommonPlatform),{
    CopyToClipboard: function (obj) {
        console.log("QQPlayGame copyToClipboard", obj);  // 只支持纯文本
        mqq.data.setClipboard({
            text: obj
        },function(result){
            if(result){
                console.log('复制剪切板成功');
            }else{
                console.log('复制剪切板失败');
            }
        });
    },
    InitPlatform: function () {
        // return;  //todo 屏蔽
        if(!ServerUtil.isLocation())
        {
            console.log("QQPlayGame initPlatform", mqq);
            if(mqq)
            {
                //侦听游戏切到后台
                mqq.invoke('ui', 'pageVisibility', function (r) { //侦听游戏是否切换到后台
                    if (r) {
                        // cc.game.resume(); //恢复游戏渲染
                    }
                    else {
                        // cc.game.pause(); //切换到后台 暂停游戏渲染音频播放等
                    }
                    console.log("游戏是否切换到后台visible ?", r);
                });
                //设置屏幕常
                if(false)
                {
                    mqq.device.setScreenStatus({ status: 1 }, function (param) {
                        console.log("设置屏幕常亮结果：", JSON.stringify(param));
                    });
                }
            }
        }
        mqq.invoke('ui','setOnShareHandler',function(type){
            mqq.invoke('ui','shareMessage',{
                title: "冰火物语",
                desc: "大家一起来玩吧",
                share_type: type,
                share_url: window.OPEN_DATA.shareurl,
                image_url: 'https://bh.youngame.com/share/icon1.png',
                back: true
            },function(result){
                switch(result.retCode)
                {
                    case 0: //0 -- 用户点击发送，完成整个分享流程
                        NotificationController.Emit(Define.EVENT_KEY.SHARE_RESULT_EVENT, 1);
                        break;
                    case 1:
                    case -2:// 1 -- 用户点击取消，中断分享流程
                         NotificationController.Emit(Define.EVENT_KEY.SHARE_RESULT_EVENT, 0);
                    break;
                        case 2: //2 -- IOS端分享到微信或朋友圈时，手动取消分享将返回-2
                        NotificationController.Emit(Define.EVENT_KEY.SHARE_RESULT_EVENT, 1);
                        break;
                }
            } );
        });
        this.SetAddShortCut();
    },
    SendUserInfo: function (cb) {
        console.log("QQPlayGame sendUserInfo");
        // todo 这里发送用户信息，根据项目决定
    },
    AutoLogin: function () { //自动登录
        console.log("Qzone window.OPEN_DATA信息", JSON.stringify(window.OPEN_DATA));
        var openId  = window.OPEN_DATA.openid;
        var openKey = window.OPEN_DATA.openkey;
        NotificationController.Emit(Define.EVENT_KEY.TOKEN_LOGIN, openId, openKey);
    },
    TokenLogin: function () {
        // Global.SetLoginServerData({ Name: "Qzone", url: "wss://bhdl-service.giantfun.cn/ws_handler" }); //todo
        if(!ServerUtil.isLocation())
        {
            // Global.SetLoginServerData({ Name: "Qzone", url: "wss://bhdl-service.giantfun.cn/ws_handler" });
        }
        else
        {
            Global.SetLoginServerData({ Name: "Qzone", url: "ws://192.168.30.205:46101/ws_handler" });
        }
        LoginController.ConnectToLoginServer();
    },
    SetStorage: function (key, value) {
        if(!ServerUtil.isLocation())
        {
            console.log("设置存储：", "key", key,  'value', value);
             cc.sys.localStorage.setItem(key, value);
             return;
            if(mqq)
            {
                mqq.data.writeH5Data({
                    callid: TimeController.GetCurTime(),
                    host: window.location.host,
                    path: window.location.pathname,
                    key: key,
                    data: value
                }, function(result){
                    console.log("qzone写入数据", JSON.stringify(result, false, 4), "value", value);
                });
            }
        }
        else
        {
            cc.sys.localStorage.setItem(key, value);
        }
    },
    GetStorage: function (key) {
        if(!ServerUtil.isLocation())
        {
            var obj = cc.sys.localStorage.getItem(key);
            if(obj)
            {
              console.log("获取存储数据：key", key, "obj", JSON.stringify(obj));
            }
            return obj;
            if(mqq)
            {
                let data;
                    mqq.data.readH5Data({
                    callid: TimeController.GetCurTime(),
                    host: window.location.host,
                    path: window.location.pathname,
                    key: key
                }, function(result){
                    data = result.response;
                    console.log("qzone读取数据", JSON.stringify(result));
                    return data;
                });
                return data;
            }
        }
        else
        {
            return cc.sys.localStorage.getItem(key);
        }
    },
    StaticRegister: function(){
        if(!ServerUtil.isLocation())
        {
            window.reportRegister();
        }
        console.log("统计用户注册 reportRegister");
    },
    StaticLogin: function(){
        if(!ServerUtil.isLocation())
        {
            window.reportLogin();
        }
        console.log("统计用户登录 reportLogin");
    },
    //title分享标题，
    //desc 分享描述,
    //image_url 分享图片地址, 
    //share_type 分享类型
    //share_param 分享附加参数, 分享地址默认会有window.OPEN_DATA.shareurl,没有可以赋值空字符串
    //back 是否立即返回到游戏
    ShareMessage: function (title, desc, share_type, image_url, share_param, back) { 
        console.log("调用分享：title", title, "desc", desc, 'image_url', image_url,'share_param',share_param,'back',back,'share_type',share_type);
        if(share_type == undefined)
        {
            console.log("分享类型异常，不能分享！share_type:", share_type);
            return;
        }
        share_param = undefined || '';
        back = undefined || true;
        var params = {title:title, desc:desc, share_type:share_type, share_url:window.OPEN_DATA.shareurl + share_param,image_url:image_url, back:back};
        // title: '空间应用-',
        // desc: 'H5开放平台-分享测试',
        // share_url: 'https://h5.qzone.qq.com/app/open/1105764175/home?_proxy=1&_wv=145191',
        // image_url: 'http://i.gtimg.cn/open/app_icon/05/58/35/77/1105583577_100_m.png',
        mqq.ui.shareMessage(params,  function(result){
            switch(result.retCode)
            {
                case 0: //0 -- 用户点击发送，完成整个分享流程
                   NotificationController.Emit(Define.EVENT_KEY.SHARE_RESULT_EVENT, 1);
                 break;
                case 1:
                case -2:// 1 -- 用户点击取消，中断分享流程
                  NotificationController.Emit(Define.EVENT_KEY.SHARE_RESULT_EVENT, 0);
                  break;
                case 2: //2 -- IOS端分享到微信或朋友圈时，手动取消分享将返回-2
                  NotificationController.Emit(Define.EVENT_KEY.SHARE_RESULT_EVENT, 0);
                  break;
            }
        }); //直接根据具体类型执行分享
    },
    ShowShareMenu: function (title, desc, image_url, share_param, back) {  //拉起分享菜单
        
        share_param = share_param || '';
        back = back || true;
        image_url = image_url || 'https://bh.youngame.com/share/icon1.png';
        var params = {title:title, desc:desc, share_url:window.OPEN_DATA.shareurl + share_param,image_url:image_url};
        mqq.ui.showShareMenu(params, function(result){
            console.log("分享按钮回调：", JSON.stringify(result));
        }); 
    },
    SetAddShortCut: function(){  //点击发送快捷方式回调 结合版本有效果
        // if(window.OPEN_DATA.platform  == 1) //仅支持安卓平台
        // {
            var thisObj = this;
            console.log("设置发送桌面，监听浮点里面的发送桌面按钮响应事件");
            window.mqq.invoke('ui','setOnAddShortcutHandler', {'callback':mqq.callback(function(){
                thisObj.AddShortCut();
            }.bind(thisObj), false,true)});
        // }
    },
    AddShortCut: function(){ //执行发送桌面逻辑
        if(mqq)
        {
            mqq.ui.addShortcut({
                action: 'web',
                title: '冰火物语',
                icon:window.OPEN_DATA.appicon,
                url: window.OPEN_DATA.jumpurl,
                callback: function(ret, extraData, msg){
                    // 0	Number	创建桌面快捷方式成功
                    // -1	Number	url字段为空
                    // -2	Number	终端拿到的json格式解析出错
                    // -3	Number	icon字段下载到的数据为空，或者下载到的不是图片数据
                    if (ret.result == 0) {
                        NotificationController.Emit(Define.EVENT_KEY.COLLECT_RESULT_EVENT, 1);
                    } else {
                        NotificationController.Emit(Define.EVENT_KEY.COLLECT_RESULT_EVENT, 0);
                    }
                }
            });   
        }
    },

    RequestPay: function (mallId) {
        let payment = ConfigController.GetConfigById('mall_data', mallId);
        if (payment) {
            let goodsid = 0;
            if(window.OPEN_DATA.platform == 1)
            {
                goodsid = payment.qzandroid;
            }
            else
            {
                goodsid = payment.qzios;
            }
            let payData = { goodsid: goodsid, zoneid:window.OPEN_DATA.platform, openid:window.OPEN_DATA.openid, openkey:window.OPEN_DATA.openkey };
            let tdCallBack = this.SetTDEventData;
            let callBack = function (msgid, msg) {
                NetWorkController.RemoveListener('msg.retBuyUseQzoneCoin', this, callBack);
                console.log('充值服务器返回：', JSON.stringify(msg));
                if(msg.ret == 1 || msg.ret == 2) //星币不足去充值
                {
                    let timestamp = (new Date()).getTime();
                    let orderid = goodsid + window.OPEN_DATA.platform + window.OPEN_DATA.openid + timestamp;
                    let obj = {};
                    obj.orderid = orderid
                    obj.iapId = payment.goodsdesc;
                    obj.price = Math.floor(parseInt(payment.price)/100);
                    obj.vAmount = obj.diamond;
                    console.log('obj = ', JSON.stringify(obj));
                    window.__paySuccess = function () {
                        //支付成功执行
                        if (_.isFunction(tdCallBack)) {
                            Tools.InvokeCallback(tdCallBack, Define.TD_EVENT.EventPaySuccess, obj);
                        }
                        NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, '您已支付成功，请点击属性查看道具');
                        NetWorkController.AddListener('msg.retBuyUseQzoneCoin', this, callBack);
                        NetWorkController.SendProto('msg.reqBuyUseQzoneCoin', payData);
                    };
                    window.__payError = function () {
                        //支付失败执行
                        NotificationController.Emit(Define.EVENT_KEY.PAY_RESULT, 0);
                    };
                    window.__payClose = function () {
                        //关闭对话框执行,IOS下无效
                        NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, '您已取消支付');
                        NotificationController.Emit(Define.EVENT_KEY.PAY_RESULT, 0);
                    };
                    let price = payment.price / 10;

                    if (_.isFunction(tdCallBack)) {
                        Tools.InvokeCallback(tdCallBack, Define.TD_EVENT.EventPay, obj);
                    }

                    window.popPayTips({
                        version: 'v2',
                        defaultScore: price,
                        appid: 1108021172
                    });
                }
                else if(msg.ret == 0)
                {
                   NotificationController.Emit(Define.EVENT_KEY.PAY_RESULT, 1);
                }
            };
            NetWorkController.AddListener('msg.retBuyUseQzoneCoin', this, callBack);
            console.log("支付数据：", JSON.stringify(payData));
            NetWorkController.SendProto('msg.reqBuyUseQzoneCoin', payData);
        }
        else {
            console.log("未找到充值配置 mallId:", mall);
        }
    },
    Logout:function()
    {
        this.SetTDEventData(Define.TD_EVENT.EventLeaveGame);
    },
    SetTDEventData: function(event, obj){
        if(TDGA){
            let server = Global.GetLoginServerData();
            let user = UserModel.GetUserInfo();
            let accountId = UserModel.acc
            switch(event){
                case Define.TD_EVENT.EventCreateRole:
                case Define.TD_EVENT.EventLogin:
                    TDGA.Account({ accountId : accountId,
                        gameServer : server.name,
                        level : user.level,
                        accountType : 3,
                        accountName : user.name,
                    });
                    break;
                case Define.TD_EVENT.EventLeaveGame:
                    TDGA.onPageLeave();
                    break;
                case Define.TD_EVENT.EventConsumeMoney:
                    TDGA.onItemPurchase({
                        item :'spendGold',
                        itemNumber : 1,
                        priceInVirtualCurrency : obj.gold,
                        });

                    break;
                case Define.TD_EVENT.EventPay:
                     TDGA.onChargeRequest({
                          orderId : obj.orderid,
                          iapId : obj.iapId,
                          currencyAmount : obj.price,
                          currencyType : 'CNY',
                          virtualCurrencyAmount : obj.vAmount,
                          // paymentType : 'AliPay'
                        });
                    console.log("TD统计充值:", JSON.stringify(obj));
                    break;
                case Define.TD_EVENT.EventPaySuccess:
                    TDGA.onChargeSuccess({
                          orderId : obj.orderid,
                          iapId : obj.iapId,
                          currencyAmount : obj.price,
                          currencyType : 'CNY',
                          virtualCurrencyAmount : obj.vAmount,
                    });
                    console.log("TD统计充值成功:", JSON.stringify(obj));
                    break;
                case Define.TD_EVENT.EventPlayerLevel:
                    TDGA.Account.setLevel(user.level);
                    break;
                default:
                    cc.log("JSON.stringify(obj) = ",JSON.stringify(obj));
                    TDGA.onEvent(event, JSON.stringify(obj));
                    break;
            }
        }
        
    },
});

module.exports = QQPlatform;