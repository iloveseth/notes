const _ = require('lodash');
const ConfigController = require('../Controller/ConfigController');
const TimeController = require('../Controller/TimeController');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const User = require('./User');
const Tools = require('../Util/Tools');
const Define = require('../Util/Define');
const CountDown = require('../Util/CountDown');
const UserModel = require('./User');
const ItemModel = require('./item');
let ShopModel = function () {
    //普通商店
    this.generalGoodsDatas = [];
    //高级杂货
    this.nbGoodsData = {};
    //货币兑换
    this.moneyData = {};
    //兑换精灵
    this.goldDrawOnceFree = 0;
    this.goldDrawTenthFree = 0;
    this.partDrawCountDown = 0;
}

ShopModel.prototype.Init = function (cb) {
    let generalDefines = ConfigController.GetConfig('generalshop_data');
    for (let i = 0; i < generalDefines.length; i++) {
        let define = generalDefines[i];
        let objdefine = ConfigController.GetConfigById('object_data', define.objid);
        let goodsInfo = {
            obj: {
                baseid: define.objid,
                thisid: 0,
                name: objdefine.name,
                num: define.num,
                bind: 0,
                level: objdefine.level,
                packagetype: 0,
                packagepos: 0,
                type: objdefine.kind,
                color: objdefine.color,
                sex: objdefine.sex
            },
            index: define.id,
            costtype: 1,
            costmoney: define.gold,
            discount: 10,
            isbuy: 0,
        }
        this.generalGoodsDatas.push(goodsInfo);
    }
    NetWorkController.AddListener('msg.retTradeShop', this, this.onTradeShop);
    NetWorkController.AddListener('msg.retTradeMoney', this, this.onTradeMoney);
    NetWorkController.AddListener('msg.retFreeLuckTime', this, this.onRetFreeLuckTime);
    NetWorkController.AddListener('msg.retLuckCountDown', this, this.onRetLuckCountDown);
    NetWorkController.AddListener('msg.LuckDrawRet', this, this.onRetLuckDraw);
    Tools.InvokeCallback(cb, null);
}
ShopModel.prototype.Reload = function (cb) {
    //高级杂货
    this.nbGoodsData = {};
    //货币兑换
    this.moneyData = {};
    //兑换精灵
    this.goldDrawOnceFree = 0;
    this.goldDrawTenthFree = 0;
    this.partDrawCountDown = 0;
    Tools.InvokeCallback(cb, null);
}
/**
 * 对外接口
 */

//普通杂货
ShopModel.prototype.GetGeneralShopData = function () {
    return this.generalGoodsDatas;
};
//高级杂货
ShopModel.prototype.GetNBShopGoods = function (canbuy = false) {
    let list = _.get(this, 'nbGoodsData.list', []);
    if (canbuy) {
        list = _.filter(list, function (o) {
            return o.isbuy == null || o.isbuy == 0;
        });
    }
    return list;
}
ShopModel.prototype.GetNBShopRefreshNum = function () {
    return _.get(this, 'nbGoodsData.refreshnum', 0);
}
ShopModel.prototype.GetNBShopFreeRefresh = function () {
    return _.get(this, 'nbGoodsData.freerefresh', 0) || 0;
}
ShopModel.prototype.GetNBShopRefreshCost = function () {
    let count = this.GetNBShopRefreshNum() + 1;
    let defines = ConfigController.GetConfig('refreshcost_data');
    for (let i = 0; i < defines.length; i++) {
        let define = defines[i];
        if (count >= define.min && count <= define.max) {
            return define.cost;
        }
    }
    return 0;
}
ShopModel.prototype.GetNBGoodsByIndex = function (index) {
    let goods = _.find(this.GetNBShopGoods(), function (o) {
        return _.get(o, 'index', -1) == index;
    });
    return goods;
}
ShopModel.prototype.GetNBBuyAllCost = function () {
    let cost = 0;
    let list = this.GetNBShopGoods(true);
    for (let i = 0; i < list.length; i++) {
        let goods = list[i];
        cost += Math.floor(goods.costmoney * goods.discount / 10);
    }
    return cost;
}
//货币兑换
ShopModel.prototype.GetExchangedGoldHistory = function () {
    return _.get(this, 'moneyData.tradenum', 0);
}
ShopModel.prototype.GetExchangedCoinHistory = function () {
    return _.get(this, 'moneyData.exchangemoneynum', 0);
}
//最大可兑换金币
ShopModel.prototype.GetMaxExchangeGold = function () {
    let maxCoin = User.GetVipValue("exchange");
    let maxGold = 0;
    let exchangeProDefines = ConfigController.GetConfig('exchange_data');
    for (let i = 0; i < exchangeProDefines.length && maxCoin > 0; i++) {
        let define = exchangeProDefines[i];
        let maxGain = define.maxnum * define.pro;
        if (maxCoin >= maxGain) {
            maxGold += define.maxnum;
            maxCoin -= maxGain;
        } else {
            maxGold += Math.floor(maxCoin / define.pro);
            maxCoin -= maxGain;
        }
    }
    return maxGold;
}
ShopModel.prototype.GetNbFreeTimesRedDot = function () {
    var times = this.GetNBShopFreeRefresh();
    return times > 0;
}
// 兑换精灵
ShopModel.prototype.GetGoldDrawOnceFree = function () {
    return this.goldDrawOnceFree;
}
ShopModel.prototype.GetGoldDrawTenFree = function () {
    return this.goldDrawTenthFree;
}

ShopModel.prototype.GetFreeRedDot = function () {
    let lastStr = CountDown.FormatCountDown(CountDown.Define.TYPE_PARTDRAWONCE, 'h:m:s');
    if(ItemModel.GetItemNumById(467) >= 100){
        return true;
    }
    if (lastStr == '') {
        return true;
    }
    if (this.goldDrawOnceFree > 0 || this.goldDrawTenthFree > 0) {
        return true;
    }
    return false;
}
/**
 * 消息处理接口
 */
ShopModel.prototype.onTradeShop = function (msgid, data) {
    let Game = require('../Game');
    if(data.refreshnum > this.GetNBShopRefreshNum()){
        let gold = this.GetNBShopRefreshCost();
        Game.Platform.SetTDEventData(Define.TD_EVENT.EventGroceriesRefresh,{gold:gold, times:1, charid:UserModel.GetCharid()});
    }
    let nplist = this.GetNBShopGoods(true);
    if(data.list && data.list.length > 0){
        for (var i = 0; i < data.list.length; i++) {
            let it = data.list[i];
            if(it.isbuy == true){
                for (var j = 0; j < nplist.length; j++) {
                    if(nplist[i].index == it.index){
                        Game.Platform.SetTDEventData(Define.TD_EVENT.EventGroceriesBuy,{gold:it.costmoney, times:1, charid:UserModel.GetCharid()});
                    }
                }
            }
        }
    }
    this.nbGoodsData.refreshnum = data.refreshnum;
    this.nbGoodsData.refreshtime = data.refreshtime;
    this.nbGoodsData.freerefresh = data.freerefresh || 0;
    this.nbGoodsData.list = _.cloneDeep(data.list);
    _.sortBy(this.nbGoodsData, ['index']);
    CountDown.SetCountDown(CountDown.Define.TYPE_NBSHOP, _.get(data, 'refreshtime', 0));
    NotificationController.Emit(Define.EVENT_KEY.SHOP_DATAUPDATE);
    
    // if(data.type == 3){
    //    
    // }

}
ShopModel.prototype.onTradeMoney = function (msgid, data) {
    this.moneyData = _.cloneDeep(data);
    NotificationController.Emit(Define.EVENT_KEY.SHOP_MONEYUPDATE);
}
ShopModel.prototype.onRetFreeLuckTime = function (msgid, data) {
    this.goldDrawOnceFree = _.get(data, 'time', 0);
    this.goldDrawTenthFree = _.get(data, 'free_ten', 0);
    NotificationController.Emit(Define.EVENT_KEY.SHOP_FREETIMEUPDATE);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_FAIRYRED);
}
ShopModel.prototype.onRetLuckCountDown = function (msgid, data) {
    CountDown.SetCountDown(CountDown.Define.TYPE_PARTDRAWONCE, _.get(data, 'time', 0));
    NotificationController.Emit(Define.EVENT_KEY.SHOP_FREETIMEUPDATE);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_FAIRYRED);
}
ShopModel.prototype.onRetLuckDraw = function (msgid, data) {
    let Game = require('../Game');
    if(data.type == 3){
        Game.Platform.SetTDEventData(Define.TD_EVENT.EventFairyTen,{times:1, charid:UserModel.GetCharid()});
    }
    Game.NetWorkController.SendProto('pet.ReqEatList',{});
    NotificationController.Emit(Define.EVENT_KEY.SHOP_LUCKDRAWRET, data);
}
module.exports = new ShopModel();