const _ = require('lodash');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const ConfigController = require('../Controller/ConfigController');
const GuideController = require('../Controller/GuideController');
const User = require('./User');
const Tools = require("../Util/Tools");
const Define = require("../Util/Define");
const ItemDefine = require('../Util/ItemDefine');
const UserModel = require('./User');
const ITEM_TYPE = cc.Enum({
    ITEM_SHENGXING: 1,
});

//装备颜色：color: 1白色2绿色3蓝色4紫色5橙色
var ItemModel = function () {
    this.items = [];
    this.itemConfigs = [];
    this.stoneUpDataConfigs = [];
    this.stoneDataConfigs = [];
    this.specialItemDefines = {};
    this.luckData = {};
    this.requstingLuckLevel = 0;
    this.ITEM_TYPE = cc.Enum({
        ITEM_SHENGXING: 1,
    });
    this.EQUIP_QUALITY = cc.Enum({
        QUALITY_WHITE: 1,
        QUALITY_GREEN: 2,
        QUALITY_BLUE: 3,
        QUALITY_PURPLE: 4,
        QUALITY_ORANGE: 5,
    });

}

ItemModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.RefreshObject', this, this.onRefreshObject);
    NetWorkController.AddListener('msg.RemoveObject', this, this.onRemoveObject);
    NetWorkController.AddListener('msg.stoneLevelUpOK', this, this.onStoneLevelUpOK);
    NetWorkController.AddListener('msg.levelupStoneFail', this, this.onLevelupStoneFail);
    NetWorkController.AddListener('msg.retStoneLucky', this, this.onRetStoneLucky);
    NetWorkController.AddListener('msg.insufficientNotice', this, this.onInsufficientNotice);

    NetWorkController.AddListener('msg.SendNotify', this, this.onSendNotify);

    this.itemConfigs = ConfigController.GetConfig('object_data');
    this.stoneUpDataConfigs = ConfigController.GetConfig('stoneup_data');
    this.stoneDataConfigs = ConfigController.GetConfig('stone_data');
    let specialIds = _.values(ItemDefine.SPECIALITEM_TYPE);
    for (let i = 0; i < specialIds.length; i++) {
        let id = specialIds[i];
        let define = _.find(this.itemConfigs, { id: id });
        this.specialItemDefines[id] = define;
    }
    Tools.InvokeCallback(cb, null);
}

ItemModel.prototype.Reload = function (cb) {
    this.items = [];
    this.luckData = {};
    this.requstingLuckLevel = 0;
    Tools.InvokeCallback(cb, null);
}
/**
 * 对外接口
 */
ItemModel.prototype.GetItems = function () {
    return this.items;
}

ItemModel.prototype.GetItemNumById = function (id) {
    let num = 0;
    let item = _.find(this.items, { 'baseid': parseInt(id) });
    if (item) {
        num = item.num;
    }
    return num;
}

ItemModel.prototype.GetItemByBaseId = function (id) {
    let item = _.find(this.items, { 'baseid': parseInt(id) });
    return item;
}

ItemModel.prototype.GetItemsByType = function (type) {
    return _.filter(this.items, function (o) {
        return o.type == type;
    });
}

ItemModel.prototype.GetItemsByPackagetype = function (packagetype) {
    return _.filter(this.items, function (o) {
        return o.packagetype == packagetype;
    });
}

ItemModel.prototype.GetItemConfig = function (id) {
    let define = this.specialItemDefines[id];
    if (define != null) {
        return define;
    }
    return _.find(this.itemConfigs, { id: id });
}

ItemModel.prototype.GetStoneUpDataConfig = function (id) {
    return _.find(this.stoneUpDataConfigs, { id: id });
}
ItemModel.prototype.GetStoneDataConfig = function (level) {
    return _.find(this.stoneDataConfigs, { level: level });
}

ItemModel.prototype.GetItemById = function (id) {
    return _.find(this.items, { 'thisid': parseInt(id) });
}

ItemModel.prototype.GetItemQualityIcon = function (color) {     //获得道具品质框
    let icon = "Image/UI/Common/tongyong_icon_gezibai";
    switch (color) {
        case ItemDefine.ITEMCOLOR.Item_White:
            icon = "Image/UI/Common/tongyong_icon_gezibai";
            break;
        case ItemDefine.ITEMCOLOR.Item_Green:
            icon = "Image/UI/Common/tongyong_icon_gezilv";
            break;
        case ItemDefine.ITEMCOLOR.Item_Blue:
            icon = "Image/UI/Common/tongyong_icon_gezilan";
            break;
        case ItemDefine.ITEMCOLOR.Item_Purple:
            icon = "Image/UI/Common/tongyong_icon_gezizi";
            break;
        case ItemDefine.ITEMCOLOR.Item_Orange:
            icon = "Image/UI/Common/tongyong_icon_gezicheng";
            break;
    }
    return icon;
}

ItemModel.prototype.GetItemLabelColor = function (color) {      //获得文本颜色
    let tColor = cc.color(233, 233, 233);
    switch (color) {
        case ItemDefine.ITEMCOLOR.Item_White:
            tColor = cc.color(233, 233, 233);
            break;
        case ItemDefine.ITEMCOLOR.Item_Green:
            tColor = cc.color(123, 222, 99);
            break;
        case ItemDefine.ITEMCOLOR.Item_Blue:
            tColor = cc.color(94, 191, 233);
            break;
        case ItemDefine.ITEMCOLOR.Item_Purple:
            tColor = cc.color(238, 116, 220);
            break;
        case ItemDefine.ITEMCOLOR.Item_Orange:
            tColor = cc.color(233, 202, 94);
            break;
        case ItemDefine.ITEMCOLOR.Item_Red:
            tColor = cc.color(249, 109, 109);
            break;
        case ItemDefine.ITEMCOLOR.Item_Yellow:
        tColor = cc.color(255, 255, 0);
        break;
    }
    return tColor;
}

ItemModel.prototype.GetItemLabelOutlineColor = function (color) {      //获得文本描边颜色
    let tColor = cc.color(90, 62, 18);
    switch (color) {
        case ItemDefine.ITEMCOLOR.Item_White:
            tColor = cc.color(90, 62, 18);
            break;
        case ItemDefine.ITEMCOLOR.Item_Green:
            tColor = cc.color(34, 75, 21);
            break;
        case ItemDefine.ITEMCOLOR.Item_Blue:
            tColor = cc.color(21, 52, 75);
            break;
        case ItemDefine.ITEMCOLOR.Item_Purple:
            tColor = cc.color(68, 24, 115);
            break;
        case ItemDefine.ITEMCOLOR.Item_Orange:
            tColor = cc.color(75, 21, 21);
            break;
        case ItemDefine.ITEMCOLOR.Item_Red:
            tColor = cc.color(75, 21, 21);
            break;
    }
    return tColor;
}

ItemModel.prototype.GetItemLabelColorHex = function (color) {      //获得文本颜色
    let tColor = '#E9E9E9';
    switch (color) {
        case ItemDefine.ITEMCOLOR.Item_White:
            tColor = '#E9E9E9';
            break;
        case ItemDefine.ITEMCOLOR.Item_Green:
            tColor = '#7BDE63';
            break;
        case ItemDefine.ITEMCOLOR.Item_Blue:
            tColor = '#5EBFE9';
            break;
        case ItemDefine.ITEMCOLOR.Item_Purple:
            tColor = '#EE74DC';
            break;
        case ItemDefine.ITEMCOLOR.Item_Orange:
            tColor = '#E9CA5E';
            break;
        case ItemDefine.ITEMCOLOR.Item_Red:
            tColor = '#F96D6D'
            break;
    }
    return tColor;
}

ItemModel.prototype.GetItemLabelOutlineColorHex = function (color) {      //获得文本描边颜色
    let tColor = '#5A3E12';
    switch (color) {
        case ItemDefine.ITEMCOLOR.Item_White:
            tColor = '#5A3E12';
            break;
        case ItemDefine.ITEMCOLOR.Item_Green:
            tColor = '#224B15';
            break;
        case ItemDefine.ITEMCOLOR.Item_Blue:
            tColor = '#15344B';
            break;
        case ItemDefine.ITEMCOLOR.Item_Purple:
            tColor = '#441873';
            break;
        case ItemDefine.ITEMCOLOR.Item_Orange:
            tColor = '#4B1515';
            break;
        case ItemDefine.ITEMCOLOR.Item_Red:
            tColor = '#4B1515';
            break;
    }
    return tColor;
}

ItemModel.prototype.GetColorLabel = function (color) {      //获得颜色文本
    let txt = '白';
    switch (color) {
        case ItemDefine.ITEMCOLOR.Item_White:
            txt = '白';
            break;
        case ItemDefine.ITEMCOLOR.Item_Green:
            txt = '绿';
            break;
        case ItemDefine.ITEMCOLOR.Item_Blue:
            txt = '蓝';
            break;
        case ItemDefine.ITEMCOLOR.Item_Purple:
            txt = '紫';
            break;
        case ItemDefine.ITEMCOLOR.Item_Orange:
            txt = '橙';
            break;
    }
    return txt;
}

ItemModel.prototype.GetStarItemLevel = function (t_object) {
    let lv = 0;
    if (t_object.baseid >= 250 && t_object.baseid <= 279) {
        lv = t_object.baseid - 249;
    }
    return lv;
}

ItemModel.prototype.GetSpecialItemIcon = function (type) {
    let icon = "Image/UI/Common/image_Silvercoin";
    switch (type) {
        case ItemDefine.ITEM_SPECIAL_PROP.gold:
            icon = "Image/UI/Common/image_goldcoin";
            break;
        case ItemDefine.ITEM_SPECIAL_PROP.silver:
            icon = "Image/UI/Common/image_Silvercoin";
            break;
        case ItemDefine.ITEM_SPECIAL_PROP.exp:
            icon = "Image/Icon/item01/icon_exp";
            break;
        case ItemDefine.ITEM_SPECIAL_PROP.honor:
            icon = "Image/Icon/item01/shengwang_zi";
            break;
        case ItemDefine.ITEM_SPECIAL_PROP.build:
            icon = "Image/Icon/item01/suipian_tianming";
            break;
    }
    return icon;
}

ItemModel.prototype.GenerateObjectsFromCommonReward = function (rewardid) {
    let ret = [];
    let rewardDefine = ConfigController.GetConfigById('commonreward_data', rewardid);
    if (rewardDefine == null) {
        return ret;
    }
    if (rewardDefine.yuanbao != null && rewardDefine.yuanbao != 0) {
        //元宝
        let yuanbao = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_YUANBAO), rewardDefine.yuanbao);
        ret.push(yuanbao);
    }
    if (rewardDefine.gold != null && rewardDefine.gold != 0) {
        //金币
        let gold = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_GOLD), rewardDefine.gold);
        ret.push(gold);
    }
    if (rewardDefine.money != null && rewardDefine.money != 0) {
        //银币
        let money = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_MONEY), rewardDefine.money);
        ret.push(money);
    }
    if (rewardDefine.fame != null && rewardDefine.fame != 0) {
        //声望
        let fame = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_FAME), rewardDefine.fame);
        ret.push(fame);
    }
    if (rewardDefine.honor != null && rewardDefine.honor != 0) {
        //荣誉
        let honor = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_HONOR), rewardDefine.honor);
        ret.push(honor);
    }
    if (rewardDefine.smelt != null && rewardDefine.smelt != 0) {
        //熔炼
        let smelt = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_SMELT), rewardDefine.smelt);
        ret.push(smelt);
    }
    if (rewardDefine.ten != null && rewardDefine.ten != 0) {
        //十连抽
        let ten = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_TENDRAW), rewardDefine.ten);
        ret.push(ten);
    }
    let exp = 0;
    if (rewardDefine.exp != null && rewardDefine.exp != 0) {
        //经验
        exp += rewardDefine.exp;
    }
    if (rewardDefine.expnum != null && rewardDefine.expnum != 0) {
        exp += (Math.pow(User.GetLevel(), 2) * rewardDefine.expnum);
    }
    if (exp != 0) {
        let expobj = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_EXP), exp);
        ret.push(expobj);
    }
    if (rewardDefine.item != null && rewardDefine.item != '') {
        //道具
        let items = _.toString(rewardDefine.item).split(';');
        for (let i = 0; i < items.length; i++) {
            let itemstr = items[i];
            let infostr = itemstr.split('-');
            if (infostr.length < 2) {
                continue;
            }
            let define = this.GetItemConfig(_.toNumber(infostr[0]));
            let itemobj = this.GenerateObjectFromDefine(define, _.toNumber(infostr[1]));
            ret.push(itemobj);
        }
    }
    //装备
    if (rewardDefine.equipid != null && rewardDefine.equipid != 0) {
        let define = this.GetItemConfig(rewardDefine.equipid);
        let equipobj = this.GenerateObjectFromDefine(define, 1);
        if (equipobj != null) {
            equipobj.color = rewardDefine.equipcolor || 1;
            equipobj.equipdata = {
                color: rewardDefine.equipcolor || 1,
                equiplevel: 1,
                star: rewardDefine.equipstar || 0,
                hole: 0,
                stone: [],
                stronglevel: rewardDefine.stronglevel || 0,
                newstronglevel: rewardDefine.stronglevel || 0,
            }
            ret.push(equipobj);
        }
    }
    return {
        define: rewardDefine,
        objs: ret
    }
}

ItemModel.prototype.GenerateObjectsFromAwardReward = function (rewardid) {
    let ret = [];
    let rewardDefine = ConfigController.GetConfigById('award_data', rewardid);
    if (rewardDefine == null) {
        return ret;
    }
    if (rewardDefine.yuanbao != null && rewardDefine.yuanbao != 0) {
        //元宝
        let yuanbao = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_YUANBAO), rewardDefine.yuanbao);
        ret.push(yuanbao);
    }
    if (rewardDefine.gold != null && rewardDefine.gold != 0) {
        //金币
        let gold = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_GOLD), rewardDefine.gold);
        ret.push(gold);
    }
    if (rewardDefine.money != null && rewardDefine.money != 0) {
        //银币
        let money = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_MONEY), rewardDefine.money);
        ret.push(money);
    }
    if (rewardDefine.fame != null && rewardDefine.fame != 0) {
        //声望
        let fame = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_FAME), rewardDefine.fame);
        ret.push(fame);
    }
    if (rewardDefine.honor != null && rewardDefine.honor != 0) {
        //荣誉
        let honor = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_HONOR), rewardDefine.honor);
        ret.push(honor);
    }
    if (rewardDefine.smelt != null && rewardDefine.smelt != 0) {
        //熔炼
        let smelt = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_SMELT), rewardDefine.smelt);
        ret.push(smelt);
    }
    if (rewardDefine.ten != null && rewardDefine.ten != 0) {
        //十连抽
        let ten = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_TENDRAW), rewardDefine.ten);
        ret.push(ten);
    }
    let exp = 0;
    if (rewardDefine.exp != null && rewardDefine.exp != 0) {
        //经验
        exp += rewardDefine.exp;
    }
    if (rewardDefine.expnum != null && rewardDefine.expnum != 0) {
        exp += (Math.pow(User.GetLevel(), 2) * rewardDefine.expnum);
    }
    if (exp != 0) {
        let expobj = this.GenerateObjectFromDefine(this.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_EXP), exp);
        ret.push(expobj);
    }
    if (rewardDefine.item != null && rewardDefine.item != '') {
        //道具
        let items = _.toString(rewardDefine.item).split(';');
        for (let i = 0; i < items.length; i++) {
            let itemstr = items[i];
            let infostr = itemstr.split('-');
            if (infostr.length < 2) {
                continue;
            }
            let define = this.GetItemConfig(_.toNumber(infostr[0]));
            let itemobj = this.GenerateObjectFromDefine(define, _.toNumber(infostr[1]));
            ret.push(itemobj);
        }
    }
    //装备
    if (rewardDefine.equipid != null && rewardDefine.equipid != 0) {
        let define = this.GetItemConfig(rewardDefine.equipid);
        let equipobj = this.GenerateObjectFromDefine(define, 1);
        if (equipobj != null) {
            equipobj.color = rewardDefine.equipcolor || 1;
            equipobj.equipdata = {
                color: rewardDefine.equipcolor || 1,
                equiplevel: 1,
                star: rewardDefine.equipstar || 0,
                hole: 0,
                stone: [],
                stronglevel: rewardDefine.stronglevel || 0,
                newstronglevel: rewardDefine.stronglevel || 0,
            }
            ret.push(equipobj);
        }
    }
    return {
        define: rewardDefine,
        objs: ret
    }
}

ItemModel.prototype.GenerateObjectFromDefine = function (define, num) {
    if (define == null) {
        return null;
    }
    return {
        baseid: define.id,
        thisid: define.id,
        name: define.name,
        num: num,
        bind: 0,
        level: define.level,
        packagetype: ItemDefine.PACKAGETYPE.PACKAGE_COMMON,
        packagepos: 0,
        type: define.kind,
        color: define.color,
        sex: define.sex
    };
}

ItemModel.prototype.GenerateCommonContentByObject = function (obj,setColor=4) {
    let config = ConfigController.GetConfigById('object_data', _.get(obj, 'baseid', 0));
    let contents = []
    let EquipModel = require('./Equip');
    if (EquipModel.IsEquip(config.kind)) {
        let equipConfig = _.find(ConfigController.GetConfig('equipbase'), {
            'star': 1,
            'type': config.kind,
            'level': _.get(obj, 'level', 0),
            'color': setColor
        })
        let mainPropertyStr = '';
        if (equipConfig) {
            if (equipConfig.attmin > 0) {
                mainPropertyStr = `攻击 +${equipConfig.attmin}--${equipConfig.attmax}`;
            } else if (equipConfig.defense > 0) {
                mainPropertyStr = `护甲 +${equipConfig.defense}`;
            } else if (equipConfig.hp > 0) {
                mainPropertyStr = `生命 +${equipConfig.hp}`;
            } else if (equipConfig.mp > 0) {
                mainPropertyStr = `魔法 +${equipConfig.mp}`;
            } else if (equipConfig.dodge > 0) {
                mainPropertyStr = `闪避 +${equipConfig.dodge}`;
            } else if (equipConfig.crit > 0) {
                mainPropertyStr = `暴击 +${equipConfig.crit}`;
            } else if (equipConfig.presis > 0) {
                mainPropertyStr = `物抗 +${equipConfig.presis}`;
            } else if (equipConfig.mresis > 0) {
                mainPropertyStr = `魔抗 +${equipConfig.mresis}`;
            }
        }
        contents = [
            '<color=' + this.GetItemLabelColorHex(setColor) + '>' + UserModel.GetLevelDesc(_.get(obj, 'level', 0)) + _.get(obj, 'name', '') + '</c>' + (_.get(obj, 'equipdata.star', 0) != 0 ? '<img src=\'tongyong_img_0102\'/>' : ''),
            '<color=#FFFFFF>' + EquipModel.GetPosNameByType(config.kind) + '</c>',
            '<color=#FFFFFF>' + mainPropertyStr + '</c>',
            '<color=#FFFF00>' + '获得后随机产生' + '</c>' + '<color=#FF0000>' + '4' + '</c>' + '<color=#FFFF00>' + '条随机属性,星标装备更好' + '</c>',
            '<color=#C200FF>' + '可用于进阶生成更高品质装备' + '</c>',
        ];
    } else {
        contents = [
            '<color=' + this.GetItemLabelColorHex(config.color) + '>' + config.name + '</c>',
            '<color=#FFFFFF>' + config.info + '</c>'
        ];
    }
    return contents
}

ItemModel.prototype.IsSmeltTipRed = function () {
    let flag = false;
    let items = this.GetItemsByPackagetype(ItemDefine.PACKAGETYPE.PACKAGE_EQUIP);
    if (items.length > 100 && GuideController.IsFunctionOpen(Define.FUNCTION_TYPE.TYPE_MELTING)) {
        flag = true;
    }
    return flag;
}

ItemModel.prototype.ReqStoneLucky = function (level) {
    this.requstingLuckLevel = level;
    NetWorkController.SendProto('msg.reqStoneLucky', { level: level });
}
ItemModel.prototype.GetStoneLuck = function (level) {
    return _.get(this, 'luckData.' + level, 0);
}
/**
 * 消息处理接口
 */
ItemModel.prototype.onRefreshObject = function (msgid, data) {
    _.forEach(data.objs, function (item) {
        var beforenum = this.GetItemNumById(item.baseid);
        let index = _.findIndex(this.items, { thisid: item.thisid });
        if (index == -1) {
            this.items.push(item);
        } else {
            this.items[index] = item;
        }
        NotificationController.Emit(Define.EVENT_KEY.ITEM_REFRESH, item);

        if(!data.nonotify){
            item.beforenum = beforenum;
            NotificationController.Emit(Define.EVENT_KEY.ITEM_NOTIFY, item);
        }
    }.bind(this));

    NotificationController.Emit(Define.EVENT_KEY.OBJECTS_REFRESH);
    NotificationController.Emit(Define.EVENT_KEY.UPDATE_FAIRYRED);
}

ItemModel.prototype.onRemoveObject = function (msgid, data) {
    _.forEach(data.ids, function (id) {
        let index = _.findIndex(this.items, { thisid: id });
        if (index == -1) {
            console.log('[严重错误] 玩家物品数据缺失 ' + id);
        } else {
            this.items.splice(index, 1);
        }
    }.bind(this));

    NotificationController.Emit(Define.EVENT_KEY.OBJECTS_REFRESH);
}
ItemModel.prototype.onStoneLevelUpOK = function (msgid, data) {
    NotificationController.Emit(Define.EVENT_KEY.STONE_LEVEL_UP, { success: true });
}
ItemModel.prototype.onLevelupStoneFail = function (msgid, data) {
    NotificationController.Emit(Define.EVENT_KEY.STONE_LEVEL_UP, { success: false });
}
ItemModel.prototype.onRetStoneLucky = function (msgid, data) {
    this.luckData[this.requstingLuckLevel] = data.num
    NotificationController.Emit(Define.EVENT_KEY.RET_STONE_LUCKY, data.num);
}

ItemModel.prototype.onInsufficientNotice = function (msgid, data) {
    const Game = require('../Game');

    cc.log('notenoughnode');
    Game.ViewController.CloseView(Game.UIName.UI_NOTENOUGHNODE, true);
    Game.ViewController.OpenView(Game.UIName.UI_NOTENOUGHNODE, 'ViewLayer', data);
}

ItemModel.prototype.onSendNotify = function (msgid, data) {
    const Game = require('../Game');
    let type = Game._.get(data, 'infotype', 0);
    let info = Game._.get(data, 'txt', '');
    if (type != Game.Define.NotifyType.INFO_TYPE_EQUIPOVERTOP) { return; }

    Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, '包裹空间不足', info, [
        {
            name: '前往熔炼',
            handler: function () {
                NotificationController.Emit(Define.EVENT_KEY.CHANGE_MAINPAGE, Game.Define.MAINPAGESTATE.Page_Bag);
            }.bind(this),
        },
        {
            name: '取消'
        }
    ]);

}

ItemModel.prototype.GetItemType = function (baseid) {
    if (baseid >= 250 && baseid <= 279) {
        return this.ITEM_TYPE.ITEM_SHENGXING;
    }
    else {
        return 0;
    }
}

module.exports = new ItemModel();
