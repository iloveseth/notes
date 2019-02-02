require('./Component/GameComponent');
const momentDurationFormatSetup = require("moment-duration-format");
require('moment/locale/zh-cn');
let Game = {
    async: require('async'),
    moment: require('moment'),
    _: require('lodash'),

    Define: require('./Util/Define'),
    ItemDefine: require('./Util/ItemDefine'),
    UserDefine: require('./Util/UserDefine'),
    UIName: require('./Util/UIName'),
    TurnGameDefine: require('./Util/TurnGameDefine'),
    Tools: require('./Util/Tools'),
    HttpUtil: require('./Util/HttpUtil'),
    ProtoMsg: require('./Util/ProtoMsg'),
    CppCmd: require('./Util/CppCmd'),
    CountDown: require('./Util/CountDown'),
    MapPath: require('./Util/MapPath'),
    AsyncGenerator: require('./Util/AsyncGenerator'),
    ServerUtil: require('./Util/ServerUtil'),

    Platform: require('./Platform/CommonGame'),

    AudioController: require('./Controller/AudioController'),
    ConfigController: require('./Controller/ConfigController'),
    LoginController: require('./Controller/LoginController'),
    NetWorkController: require('./Controller/NetWorkController'),
    NotificationController: require('./Controller/NotificationController'),
    ResController: require('./Controller/ResController'),
    TimeController: require('./Controller/TimeController'),
    ViewController: require('./Controller/ViewController'),
    EntityController: require('./Controller/EntityController'),
    LanguageController: require('./Controller/LanguageController'),
    TipPoolController: require('./Controller/TipPoolController'),
    GuideController: require('./Controller/GuideController'),
    NativeController: require('./Controller/NativeController'),
    TargetGuideController: require('./Controller/TargetGuideController'),

    UserModel: require('./Model/User'),
    MainUserModel: require('./Model/MainUser'),
    CurrencyModel: require('./Model/Currency'),
    ItemModel: require('./Model/Item'),
    EquipModel: require('./Model/Equip'),
    LevelModel: require('./Model/Level'),
    GlobalModel: require('./Model/Global'),
    ShopModel: require('./Model/Shop'),
    DigModel: require('./Model/Dig'),
    FightModel: require('./Model/Fight'),
    MailModel: require('./Model/Mail'),
    WorldBossModel: require('./Model/WorldBoss'),
    TaskModel: require('./Model/Task'),
    FairyModel: require('./Model/Fairy'),
    RewardModel: require('./Model/Reward'),
    BorderModel: require('./Model/Border'),
    BlessModel: require('./Model/Bless'),
    WelfareModel: require('./Model/Welfare'),
    SeptModel: require('./Model/Sept'),
    ActiveModel: require('./Model/Active'),
    SeptPkModel: require('./Model/SeptPk'),
    ChatModel: require('./Model/Chat'),
    VipModel: require('./Model/Vip'),
    JijieModel: require('./Model/Jijie'),

    GameInstance: null
};
momentDurationFormatSetup(Game.moment);
Game.moment.locale('zh-cn');
if (CC_DEBUG) {
    for (let key in cc.sys) {
        // console.log("key:",key, "value:", cc.sys[key]);
    }
}
//默认渠道
Game.ServerUtil.channel = Game.Define.Channel_Type.Default;

if (cc.sys.isNative) { //原生
    if (cc.sys.os == cc.sys.OS_IOS) //ios平台
    {
        console.log("初始化典游ios 默认平台!");
        let ret = jsb.reflection.callStaticMethod("Platform", "GetPlatfrom");
        if (ret > 0) {
            Game.ServerUtil.channel = ret;
        }
        else {
            Game.ServerUtil.channel = Game.Define.Channel_Type.DianYou; //todo 暂时设置 后续会有渠道设置逻辑跟进
        }
        switch (Game.ServerUtil.channel) {
            case Game.Define.Channel_Type.DianYou:
                Game.Platform = require('./Platform/IosGame');
                break;
            case Game.Define.Channel_Type.DianYou_Ios_GaungMing:
                Game.Platform = require('./Platform/IosGame');
                let channelInfo = jsb.reflection.callStaticMethod("Platform", "GetChannelInfo");
                if (channelInfo) {
                    Game.ServerUtil.channelInfo = JSON.parse(channelInfo);
                }
                break;
            case Game.Define.Channel_Type.Quick_Ios:
                Game.Platform = require('./Platform/QuickIosGame');
                break;
        }
    }
    else if (cc.sys.os == cc.sys.OS_ANDROID) {
        // Game.Platform = require('./Platform/AndroidGame');
        Game.ServerUtil.channel = Game.Define.Channel_Type.Common_Android;
        Game.Platform = require('./Platform/AndroidGame');
    }
}
else if (cc.sys.isBrowser) //浏览器
{
    var ua = navigator.userAgent;
    var isWX = ua.match(/MicroMessenger\/([\d\.]+)/);  //微信里面打开链接
    var isQQ = ua.match(/QQ\/([\d\.]+)/);  //qq里面打开链接 
    var isQZ = ua.indexOf("Qzone/") !== -1; //qzone里面打开链接
    if(Game.ServerUtil.isLocation())
    {
        // window.OPEN_DATA = {"isMobile":false,"isIOS":false,"platform":1,"channel":"SQ","giftList":["SQGift"],"pf":"wanba_ts.9","appid":"1108021172","qua":{"app":"PC"},"via":"H5.QZONE.PC","loginType":"qq","openid":"07EF75B4C14D78016B9896D55B7B7CBB","openkey":"96F2C72640DC2BC9ADBC3053484FF0B3","g_tk":null,"shareurl":"https://h5.qzone.qq.com/app/open/1108021172/home?app_display=2&_proxy=1&_wv=145191","jumpurl":"https://h5.qzone.qq.com/app/open/1108021172/home?app_display=2&_proxy=1&_wv=145191&via=H5.DESKTOP","modifyBase":true,"appurl":"https://jump-test.giantfun.cn/guajiqzone/?qua=V1_PC_QZ_1.0.0_0_IDC_B&app=PC&via=H5.QZONE.PC&pf=wanba_ts&_proxy=1&_wv=2147628839&_offline=1&app_display=2&fallback=1&ticket=&openid=07EF75B4C14D78016B9896D55B7B7CBB&openkey=96F2C72640DC2BC9ADBC3053484FF0B3&platform=1","appicon":"https://i.gtimg.cn/open/app_icon/08/02/11/72/1108021172_100_m.png","display":"2","UIAPIList":["QzoneBackground","buluo","miniGameVIP","followWechat","downloadGameAPP","linkPC","share","favoritesToDesktop","QQkf","pay"],"unusableAPIList":["downloadGameAPP","QzoneBackground","followWechat","linkPC"],"askforEquipEnable":false,"payOpenid":"3B1E5591613B3E63179CC039CFF97E55","payOpenkey":"EA561EAF045C7883E6B66ECAAB19B37A","loadTimes":{"beforeInnerJS":"2019-01-10T13:42:56.622Z","afterInnerJs":"2019-01-10T13:42:56.625Z","domReady":"2019-01-10T13:42:58.023Z"}}
    }
    if(window.OPEN_DATA) //qzone平台
    {
        // window.OPEN_DATA.isIOS = true;
        // window.OPEN_DATA.platform = 2;
       console.log("window.OPEN_DATA------", JSON.stringify(window.OPEN_DATA));
       Game.Platform = require('./Platform/QQPlayGame');
       switch(window.OPEN_DATA.platform)
       {
           case 1:
             Game.ServerUtil.channel = Game.Define.Channel_Type.Qzone_NotIos;
             break;
           case 2:
             Game.ServerUtil.channel = Game.Define.Channel_Type.Qzone_Ios;
             break;
       }
    }
}
else if (cc.sys.platform == cc.sys.WECHAT_GAME) {
    Game.Platform = require('./Platform/WechatGame');
}

module.exports = Game;

