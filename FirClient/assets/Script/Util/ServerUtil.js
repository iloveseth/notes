const Define = require('./Define');

let ServerUtil = function () {

    //获取服务器区服地址
    this.serverUrl = "http://210.73.214.72:40261";
    //游戏渠道标识
    this.channel = Define.Channel_Type.Default;
    this.channelInfo = {};

    //运行环境数据配置
    var officalUrl = "urlshare.cn"; //qzone地址
    this.webUrlList = [officalUrl];
    this.nativeUrlList = ["https://dianyou-bh-cdn.giantfun.cn"];
    this.version = '';

    this.versionUrl = ""; //版本文件远程地址 todo 测试
    this.isNativeLocal = false; //是否是原生本地 需要手动设置
    //是否提审中
    this.isInExamine = false;
    // this.Platform = require('./Platform/CommonGame');
}

// ServerUtil.prototype.Init = function () {
//     if (CC_DEBUG) {
//         for (let key in cc.sys) {
//             console.log("key:", key, "value:", cc.sys[key]);
//         }
//     }
//     console.log("初始化！");
//     //默认渠道
//     this.channel = Define.Channel_Type.Default;
//     if (cc.sys.isNative) { //原生
//         if (cc.sys.os == cc.sys.OS_IOS) //ios平台
//         {
//             this.Platform = require('../Platform/IosGame');
//             this.channel = Define.Channel_Type.DianYou; //todo 暂时设置 后续会有渠道设置逻辑跟进
//         }
//     }
//     else if (cc.sys.isBrowser) //浏览器
//     {
//         var ua = navigator.userAgent;
//         var isWX = ua.match(/MicroMessenger\/([\d\.]+)/);  //微信里面打开链接
//         var isQQ = ua.match(/QQ\/([\d\.]+)/);  //qq里面打开链接 
//         var isQZ = ua.indexOf("Qzone/") !== -1; //qzone里面打开链接
//         console.log("iswx：", isWX, 'isQQ：', isQQ, 'isQZ：', isQZ);
//         if (this.isLocation()) {
//             console.log("本地qzone测试数据");
//             window.OPEN_DATA = {"isMobile":false,"isIOS":false,"platform":1,"channel":"SQ","giftList":["SQGift"],"pf":"wanba_ts.9","appid":"1108021172","qua":{"app":"PC"},"via":"H5.QZONE.PC","loginType":"qq","openid":"07EF75B4C14D78016B9896D55B7B7CBB","openkey":"96F2C72640DC2BC9ADBC3053484FF0B3","g_tk":null,"shareurl":"https://h5.qzone.qq.com/app/open/1108021172/home?app_display=2&_proxy=1&_wv=145191","jumpurl":"https://h5.qzone.qq.com/app/open/1108021172/home?app_display=2&_proxy=1&_wv=145191&via=H5.DESKTOP","modifyBase":true,"appurl":"https://jump-test.giantfun.cn/guajiqzone/?qua=V1_PC_QZ_1.0.0_0_IDC_B&app=PC&via=H5.QZONE.PC&pf=wanba_ts&_proxy=1&_wv=2147628839&_offline=1&app_display=2&fallback=1&ticket=&openid=07EF75B4C14D78016B9896D55B7B7CBB&openkey=96F2C72640DC2BC9ADBC3053484FF0B3&platform=1","appicon":"https://i.gtimg.cn/open/app_icon/08/02/11/72/1108021172_100_m.png","display":"2","UIAPIList":["QzoneBackground","buluo","miniGameVIP","followWechat","downloadGameAPP","linkPC","share","favoritesToDesktop","QQkf","pay"],"unusableAPIList":["downloadGameAPP","QzoneBackground","followWechat","linkPC"],"askforEquipEnable":false,"payOpenid":"3B1E5591613B3E63179CC039CFF97E55","payOpenkey":"EA561EAF045C7883E6B66ECAAB19B37A","loadTimes":{"beforeInnerJS":"2019-01-10T13:42:56.622Z","afterInnerJs":"2019-01-10T13:42:56.625Z","domReady":"2019-01-10T13:42:58.023Z"}}
//         }
//         console.log("window--href", window.location.href);
//         if (window.OPEN_DATA) //qzone平台
//         {
//             console.log("window.OPEN_DATA------", JSON.stringify(window.OPEN_DATA));
//             this.Platform = require('../Platform/QQPlayGame');
//             switch (window.OPEN_DATA.platform) {
//                 case 1:
//                     this.channel = Define.Channel_Type.Qzone_NotIos;
//                     break;
//                 case 2:
//                     this.channel = Define.Channel_Type.Qzone_Ios;
//                     break;
//             }
//         }
//     }
//     else if (cc.sys.platform == cc.sys.WECHAT_GAME) {
//         this.Platform = require('../Platform/WechatGame');
//     }
// }
ServerUtil.prototype.IsOfficial = function () { //是否是正式服运行环境
    // return false;
    // return true;
    var urlList;
    var targetUrl;
    if (cc.sys.isNative) //原生模式
    {
        urlList = this.nativeUrlList;
        targetUrl = this.versionUrl;
        if(this.isNativeLocal)
        {
           return false; //todo 内网
        }
        return true;
    }
    else if (cc.sys.isBrowser) //浏览器模式
    {
        urlList = this.webUrlList;
        targetUrl = window.location.href;
        cc.log("window.location.href", window.location.href);
    }
    for (var i = 0; i < urlList.length; i++) {
        var url = urlList[i];
        var isInclude = targetUrl.indexOf(url) != -1;
        if (isInclude) {
            console.log("正式环境！");
            return true;
        }
    }
    // return true;
    console.log("测试环境！");
    return false;
}
ServerUtil.prototype.SetServerUrl = function () //根据渠道 设置获取区服地址
{
    switch (this.channel) {
        case Define.Channel_Type.Default:
            // this.serverUrl = 'https://qq-android-plant.giantfun.cn'; 
            break;
        case Define.Channel_Type.DianYou:
        case Define.Channel_Type.DianYou_Ios_GaungMing:
            if (this.isInExamine) {
                this.serverUrl = 'http://122.112.239.83:40261';
            }
            else {
                this.serverUrl = 'http://122.112.239.83:40261';
            }
            if(this.isNativeLocal)
            {
                this.serverUrl = undefined; //todo 内网
            }
            break;
        case Define.Channel_Type.Qzone_NotIos:
            this.serverUrl = undefined; //todo
            this.serverUrl = 'https://qq-android-plant.giantfun.cn';
            break;
        case Define.Channel_Type.Qzone_Ios:
            this.serverUrl = undefined; //todo
            this.serverUrl = 'https://qq-ios-plant.giantfun.cn';
            break;
        case Define.Channel_Type.Common_Android:
        case Define.Channel_Type.Quick_Ios:
            this.serverUrl = 'https://quyou-plant.giantfun.cn/';
            break;
    }
},
    ServerUtil.prototype.isLocation = function () {
        let urlList = ['localhost', '192.168.30', '127.0.0.1'];
        if (window && window.location) {
            for (let url of urlList) {
                if (window.location.href.indexOf(url) != -1) {
                    return true;
                }
            }
        }
        return false;
    },
    module.exports = new ServerUtil();