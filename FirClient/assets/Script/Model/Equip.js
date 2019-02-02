const _ = require('lodash');
const Tools = require('../Util/Tools');
let Define = require("../Util/Define");
const ItemModel = require('./Item');
const ItemDefine = require('../Util/ItemDefine');
const UserModel = require('./User');
const MainUserModel = require('./MainUser');
const CurrencyModel = require('./Currency');
const UserDefine = require('../Util/UserDefine');
const ConfigController = require('../Controller/ConfigController');
const NetWorkController = require('../Controller/NetWorkController');
const AudioController = require('../Controller/AudioController');
const NotificationController = require('../Controller/NotificationController');
const GuideController = require('../Controller/GuideController');

var EquipModel = function () {
    this.selectEquipsType = Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_CHANGE;
    this.selectEquips = [];
    this.curEquipPage = 0;
    this.stoneidByType = {};
}

EquipModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.EquipFail', this, this.onEquipFail);
    NetWorkController.AddListener('msg.EquipSuccess', this, this.onEquipSuccess);
    NetWorkController.AddListener('msg.levelupStoneFail', this, this.onLevelupStoneFail);
    NetWorkController.AddListener('msg.notifyLuckNum', this, this.onNotifyLuckNum);
    for (let i = ItemDefine.STONE_TYPE.TYPE_START; i < ItemDefine.STONE_TYPE.TYPE_END; i++) {
        let defines = ConfigController.GetConfig('typepro_data');
        let define = _.find(defines, function (o) {
            return _.get(o, 'type', 0) == i && _.get(o, 'id', -1) == _.get(o, 'preid', 0);
        });
        this.stoneidByType[i] = _.get(define, 'id', 0);
    }
    Tools.InvokeCallback(cb, null);
}
EquipModel.prototype.Reload = function (cb) {
    this.selectEquipsType = Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_CHANGE;
    this.selectEquips = [];
    this.curEquipPage = 0;
    Tools.InvokeCallback(cb, null);
}

/**
 * 对外接口
 */
EquipModel.prototype.IsUseEquip = function (packagetype) {   //是否是穿戴的装备
    return packagetype == ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP ||
        packagetype == ItemDefine.PACKAGETYPE.PACKAGE_PETEQUIP1 ||
        packagetype == ItemDefine.PACKAGETYPE.PACKAGE_PETEQUIP2 ||
        packagetype == ItemDefine.PACKAGETYPE.PACKAGE_PETEQUIP3;
}

EquipModel.prototype.IsEquip = function (type) {   //此道具是否是装备
    return type >= 101 && type <= 116;
}

EquipModel.prototype.GetNoEquipsByType = function (type) {   //获得某个部位可以穿戴的所有装备(不包括穿戴的)
    let userLv = UserModel.GetLevel();
    let equips = _.filter(ItemModel.GetItems(), function (info) {
        return info.packagetype == ItemDefine.PACKAGETYPE.PACKAGE_EQUIP && info.type == type && info.level <= userLv;
    });
    equips = _.sortBy(equips, function (info) {
        let result = this.GetBasicScore(info.equipdata);
        return -result;
    }.bind(this));
    return equips;
}

EquipModel.prototype.GetUseEquipByTypes = function (packagetype, type) {   //获得穿戴某个部位的装备
    return _.find(ItemModel.GetItems(), { 'packagetype': packagetype, 'type': type });
}

EquipModel.prototype.GetUnusePackageEquipNumByColor = function (color, starEquip) {
    let num = 0;
    let items = ItemModel.GetItemsByPackagetype(ItemDefine.PACKAGETYPE.PACKAGE_EQUIP);
    for (var i = 0; i < items.length; i++) {
        if (starEquip && items[i].equipdata.star == 2) {
            num = num + items[i].num;
        } else if (color == items[i].equipdata.color && !starEquip && items[i].equipdata.star != 2) {
            num = num + items[i].num;
        }
    }
    return num;
}

EquipModel.prototype.GetMainArmsByOccupation = function (occupation) {       //获得职业主武器Type
    let arms = ItemDefine.ITEMTYPE.ItemType_Knife;
    switch (occupation) {
        case UserDefine.PROFESSION.PROFESSION_JIANSHI:
            arms = ItemDefine.ITEMTYPE.ItemType_Knife;
            break;
        case UserDefine.PROFESSION.PROFESSION_MOFASHI:
            arms = ItemDefine.ITEMTYPE.ItemType_Stick;
            break;
        case UserDefine.PROFESSION.PROFESSION_PAONIANG:
            arms = ItemDefine.ITEMTYPE.ItemType_Bow;
            break;
    }
    return arms;
}

EquipModel.prototype.GetViceArmsByOccupation = function (occupation) {       //获得职业副手Type
    let arms = ItemDefine.ITEMTYPE.ItemType_Knife;
    switch (occupation) {
        case UserDefine.PROFESSION.PROFESSION_JIANSHI:
            arms = ItemDefine.ITEMTYPE.ItemType_KnifeAssistant;
            break;
        case UserDefine.PROFESSION.PROFESSION_MOFASHI:
            arms = ItemDefine.ITEMTYPE.ItemType_StickAssistant;
            break;
        case UserDefine.PROFESSION.PROFESSION_PAONIANG:
            arms = ItemDefine.ITEMTYPE.ItemType_BowAssistant;
            break;
    }
    return arms;
}

EquipModel.prototype.GetPosNameByType = function (type) {
    let name = '';
    switch (type) {
        case ItemDefine.ITEMTYPE.ItemType_Knife:
        case ItemDefine.ITEMTYPE.ItemType_Bow:
        case ItemDefine.ITEMTYPE.ItemType_Stick:
            name = '武器';
            break;
        case ItemDefine.ITEMTYPE.ItemType_KnifeAssistant:
        case ItemDefine.ITEMTYPE.ItemType_BowAssistant:
        case ItemDefine.ITEMTYPE.ItemType_StickAssistant:
            name = '副手';
            break;
        case ItemDefine.ITEMTYPE.ItemType_Wrister:
            name = '护腕';
            break;
        case ItemDefine.ITEMTYPE.ItemType_Trousers:
            name = '裤子';
            break;
        case ItemDefine.ITEMTYPE.ItemType_Shoes:
            name = '鞋子';
            break;
        case ItemDefine.ITEMTYPE.ItemType_Helmet:
            name = '头盔';
            break;
        case ItemDefine.ITEMTYPE.ItemType_Necklace:
            name = '项链';
            break;
        case ItemDefine.ITEMTYPE.ItemType_Clothes:
            name = '衣服';
            break;
        case ItemDefine.ITEMTYPE.ItemType_Belt:
            name = '腰带';
            break;
        case ItemDefine.ITEMTYPE.ItemType_Ring:
            name = '戒指';
            break;
    }
    return name;
}

EquipModel.prototype.GetSoulTypeByType = function (type) {
    let soultype = 1;
    switch (type) {
        case ItemDefine.ITEMTYPE.ItemType_Knife:
        case ItemDefine.ITEMTYPE.ItemType_Bow:
        case ItemDefine.ITEMTYPE.ItemType_Stick:
            soultype = 1;
            break;
        case ItemDefine.ITEMTYPE.ItemType_KnifeAssistant:
        case ItemDefine.ITEMTYPE.ItemType_BowAssistant:
        case ItemDefine.ITEMTYPE.ItemType_StickAssistant:
            soultype = 2;
            break;
        case ItemDefine.ITEMTYPE.ItemType_Wrister:
            soultype = 3;
            break;
        case ItemDefine.ITEMTYPE.ItemType_Trousers:
            soultype = 4;
            break;
        case ItemDefine.ITEMTYPE.ItemType_Shoes:
            soultype = 5;
            break;
        case ItemDefine.ITEMTYPE.ItemType_Helmet:
            soultype = 6;
            break;
        case ItemDefine.ITEMTYPE.ItemType_Necklace:
            soultype = 7;
            break;
        case ItemDefine.ITEMTYPE.ItemType_Clothes:
            soultype = 8;
            break;
        case ItemDefine.ITEMTYPE.ItemType_Belt:
            soultype = 9;
            break;
        case ItemDefine.ITEMTYPE.ItemType_Ring:
            soultype = 10;
            break;
    }
    return soultype;
}

EquipModel.prototype.GetBasicScore = function (equipdata) {      //获得装备初始评分
    let scoreCount = 0;
    if (equipdata) {
        for (let i = 0; i < equipdata.four.length; i++) {
            let fourProp = equipdata.four[i];
            scoreCount += fourProp.num;
        }
        scoreCount = scoreCount + equipdata.attmin;
        scoreCount = scoreCount + equipdata.attmax;
        scoreCount = scoreCount + equipdata.defense;
        scoreCount = scoreCount + equipdata.hp;
        scoreCount = scoreCount + equipdata.mp;
        scoreCount = scoreCount + equipdata.dodge;
        scoreCount = scoreCount + equipdata.crit;
        scoreCount = scoreCount + equipdata.presis;
        scoreCount = scoreCount + equipdata.mresis;
    } else {
        scoreCount = 1000000;    //道具显示在装备前面
    }
    return scoreCount;
}

EquipModel.prototype.GetStarScore = function (equipdata) {      //获得升星评分
    let scoreCount = 0;
    if (equipdata) {
        scoreCount = scoreCount + equipdata.attmin;
        scoreCount = scoreCount + equipdata.attmax;
        scoreCount = scoreCount + equipdata.defense;
        scoreCount = scoreCount + equipdata.hp;
        scoreCount = scoreCount + equipdata.mp;
        scoreCount = scoreCount + equipdata.dodge;
        scoreCount = scoreCount + equipdata.crit;
        scoreCount = scoreCount + equipdata.presis;
        scoreCount = scoreCount + equipdata.mresis;

        scoreCount = scoreCount * this.GetIntensifyPersent(equipdata);
        scoreCount = Math.floor(scoreCount / 100);
    }
    return scoreCount;
}

EquipModel.prototype.GetIntensifyPersent = function (equipdata) {
    let tLevel = equipdata.stronglevel;
    let pow = 0;
    let starcostConfig = ConfigController.GetConfigById('starcost_data', tLevel, 'star');
    if (starcostConfig) {
        pow = starcostConfig.pow;
    }
    return pow;
}

EquipModel.prototype.GetEquipMainProperty = function (t_object) {
    let property = '攻击';
    if (t_object.equipdata.attmin > 0) {
        property = '攻击';
    } else if (t_object.equipdata.defense > 0) {
        property = '护甲';
    } else if (t_object.equipdata.hp > 0) {
        property = '生命';
    } else if (t_object.equipdata.mp > 0) {
        property = '魔法';
    } else if (t_object.equipdata.dodge > 0) {
        property = '闪避';
    } else if (t_object.equipdata.crit > 0) {
        property = '暴击';
    } else if (t_object.equipdata.presis > 0) {
        property = '物抗';
    } else if (t_object.equipdata.mresis > 0) {
        property = '魔抗';
    }
    return property;
}

EquipModel.prototype.GetStrongthAddValue = function (t_object, isNext) {
    let result = 0;
    let strongLv = _.get(t_object, 'equipdata.newstronglevel', 0);
    if (t_object && strongLv > 0 || isNext) {
        let equipstrongConfig = ConfigController.GetConfigById('newsequipstrong_data', strongLv);
        if (equipstrongConfig) {
            if (isNext) {
                let equipstrongNextConfig = ConfigController.GetConfigById('newsequipstrong_data', strongLv + 1);
                result = equipstrongNextConfig.allvalue;
            } else {
                result = equipstrongConfig.allvalue;
            }
        }
    }
    return Math.floor(result);
}

EquipModel.prototype.GetStrongAddCost = function (t_object) {
    let result = 0;
    if (t_object) {
        let strongLv = _.get(t_object, 'equipdata.newstronglevel', 0);
        let equipstrongConfig = ConfigController.GetConfigById('newsequipstrong_data', strongLv + 1);
        if (equipstrongConfig) {
            result = equipstrongConfig.strongcost;
        }
    }
    return result;
}

EquipModel.prototype.GetNGodStr = function (type) {
    let desc = '无';
    switch (type) {
        case ItemDefine.NEWGODTYPE.NGod_Weapon_AttackAdd:
            desc = `攻击`;
            break;
        case ItemDefine.NEWGODTYPE.NGod_Assistant_StoneAdd:
            desc = `宝石`;
            break;
        case ItemDefine.NEWGODTYPE.NGod_Wrister_CritUp:
            desc = `暴击`;
            break;
        case ItemDefine.NEWGODTYPE.NGod_Trousers_MresisUp:
            desc = `魔抗`;
            break;
        case ItemDefine.NEWGODTYPE.NGod_Shoe_DodgeUp:
            desc = `闪避`;
            break;
        case ItemDefine.NEWGODTYPE.NGod_Helmet_Presis:
            desc = `物抗`;
            break;
        case ItemDefine.NEWGODTYPE.NGod_Necklace_StarSuitUp:
            desc = `主属性`;
            break;
        case ItemDefine.NEWGODTYPE.NGod_Cloth_DefUp:
            desc = `护甲`;
            break;
        case ItemDefine.NEWGODTYPE.NGod_Belt_AddHp:
            desc = `生命`;
            break;
        case ItemDefine.NEWGODTYPE.NGod_Ring_MP_ADD:
            desc = `魔法`;
            break;
    }
    return desc;
}

EquipModel.prototype.GetNGodEffectStr = function (type, level) {
    let desc = '无';
    let id = (type - 1) * 15 + level;
    if (id > 0 && level > 0) {
        let persent = ConfigController.GetConfigById('godtype_data', id).num * 100;
        persent = Math.round(persent);
        switch (type) {
            case ItemDefine.NEWGODTYPE.NGod_Weapon_AttackAdd:
                desc = `攻击力提升${persent}%`;
                break;
            case ItemDefine.NEWGODTYPE.NGod_Assistant_StoneAdd:
                desc = `宝石属性提升${persent}%`;
                break;
            case ItemDefine.NEWGODTYPE.NGod_Wrister_CritUp:
                desc = `暴击值提升${persent}%`;
                break;
            case ItemDefine.NEWGODTYPE.NGod_Trousers_MresisUp:
                desc = `魔抗提升${persent}%`;
                break;
            case ItemDefine.NEWGODTYPE.NGod_Shoe_DodgeUp:
                desc = `闪避提升${persent}%`;
                break;
            case ItemDefine.NEWGODTYPE.NGod_Helmet_Presis:
                desc = `物抗提升${persent}%`;
                break;
            case ItemDefine.NEWGODTYPE.NGod_Necklace_StarSuitUp:
                desc = `主属性提升${persent}%`;
                break;
            case ItemDefine.NEWGODTYPE.NGod_Cloth_DefUp:
                desc = `护甲值提升${persent}%`;
                break;
            case ItemDefine.NEWGODTYPE.NGod_Belt_AddHp:
                desc = `生命提升${persent}%`;
                break;
            case ItemDefine.NEWGODTYPE.NGod_Ring_MP_ADD:
                desc = `魔法盾提升${persent}%`;
                break;
        }
    };
    return desc;
}

EquipModel.prototype.GetStarEffectIndex = function (starCount) {
    let ratio = 1;
    if (starCount >= 2 && starCount <= 11) {
        ratio = 1;
    } else if (starCount >= 12 && starCount <= 21) {
        ratio = 2;
    } else if (starCount >= 22 && starCount <= 23) {
        ratio = 3;
    } else if (starCount >= 24 && starCount <= 25) {
        ratio = 4;
    } else if (starCount >= 26 && starCount <= 27) {
        ratio = 5;
    } else if (starCount >= 28 && starCount <= 29) {
        ratio = 6;
    } else if (starCount == 30) {
        ratio = 7;
    }
    return ratio;
}

EquipModel.prototype.GetGemByPos = function (equipdata, pos) {
    return _.find(equipdata.stone, { 'pos': pos });
}

EquipModel.prototype.SetSelectEquipsType = function (type) {
    this.selectEquipsType = type;
}

EquipModel.prototype.GetSelectEquipsType = function () {
    return this.selectEquipsType;
}

EquipModel.prototype.IsHaveSoul = function (t_object) {
    let isHaveSoul = false;

    let soul = _.get(t_object, 'equipdata.godnormal', null);
    if (soul != null) {
        isHaveSoul = soul.level > 0;
    }
    return isHaveSoul;
}

EquipModel.prototype.GetTransferNeedMoney = function (fromObj, toObj) {
    let needMoney = 0;
    if (fromObj && toObj) {
        let lvA = fromObj.level;
        let lvB = toObj.level;
        let aTransferConfig = ConfigController.GetConfigById('transfergod_data', lvA, 'level');
        let bTransferConfig = ConfigController.GetConfigById('transfergod_data', lvB, 'level');
        if (lvA >= lvB) {
            needMoney = aTransferConfig.base;
        } else {
            let coff = bTransferConfig.num - aTransferConfig.num;
            needMoney = coff * this.GetSoulStoredExp(fromObj.thisid);
        }
    }
    return needMoney;
}

EquipModel.prototype.GetSuckupNeedMoney = function (fromObj, suckupEquips) {
    let needMoney = 0;
    let lvX = 0;
    let expY = 0;
    if (fromObj && suckupEquips.length > 0) {
        let suckUpConfig = ConfigController.GetConfigById('suckupgod_data', fromObj.level, 'level');
        if (suckUpConfig) {
            lvX = suckUpConfig.num;
        }
        _.forEach(suckupEquips, function (toObj) {
            expY = expY + this.GetSoulStoredExp(toObj.thisid);
        }.bind(this));
        needMoney = lvX * expY;
    }
    return needMoney;
}

EquipModel.prototype.GetSoulStoredExp = function (thisid) {
    let exp = 0;
    let t_object = ItemModel.GetItemById(thisid)
    if (t_object) {
        if (this.IsHaveSoul(t_object)) {
            let soulLv = t_object.equipdata.godnormal.level;
            let curExp = t_object.equipdata.godnormal.exp;
            let storedExp = ConfigController.GetConfigById('godlevelup_data', soulLv, 'level');
            exp = exp + curExp + storedExp.expsum;
        }

        if (t_object.type == ItemDefine.ITEMTYPE.ItemType_Exp) {
            let linghunshiConfig = ConfigController.GetConfigById('linghunshi_data', t_object.baseid, 'ojid');
            if (linghunshiConfig) {
                exp = linghunshiConfig.addexp;
            }
        }
    }
    return exp;
}

EquipModel.prototype.GetCanEquipLvByUserLv = function (userLv) {
    let level = userLv + 10;
    let i = 1;
    let findLv = function () {
        if (level >= 50 * i && level < 50 * (i + 1)) {
            level = 50 * i;
        } else {
            i += 1;
            Tools.InvokeCallback(findLv);
        }
    }
    if (level > 50) {
        Tools.InvokeCallback(findLv);
    } else {
        level = 50;
    }
    return level;
}

EquipModel.prototype.FindEquipNewFlag = function () {
    if (!GuideController.IsFunctionOpen(Define.FUNCTION_TYPE.TYPE_EQUIP)) { return false; }

    let equipTypes = this.FindUserEquipTypes();
    for (let i = 0; i < equipTypes.length; i++) {
        if (this.FindEquipNewFlagByType(equipTypes[i])) { return true; }
    }
    return false;
}

EquipModel.prototype.FindEquipNewFlagByType = function (type) {
    let flag = false;
    let curEquip = this.GetUseEquipByTypes(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, type)
    let targetEquips = this.GetNoEquipsByType(type);

    if (curEquip == null) {
        flag = targetEquips.length > 0;
    } else {
        for (let i = 0; i < targetEquips.length; i++) {
            let info = targetEquips[i];
            if (curEquip.level < info.level) {
                flag = true;
                break;
            } else {
                if (curEquip.equipdata.color < info.equipdata.color && curEquip.level == info.level) {
                    flag = true;
                    break;
                }
            }
        }
    }
    return flag;
}

EquipModel.prototype.FindNewStrong = function () {
    if (!GuideController.IsFunctionOpen(Define.FUNCTION_TYPE.TYPE_STRENGTH)) { return false; }

    let flag = false;
    let findEquip = this.FindOneKeyStrongEquip();
    if (findEquip) {
        // if (UserModel.GetLevel() > findEquip.equipdata.newstronglevel) {
            let equipstrongConfig = ConfigController.GetConfigById('newsequipstrong_data', findEquip.equipdata.newstronglevel + 1);
            if (equipstrongConfig) {
                flag = CurrencyModel.GetMoney() >= equipstrongConfig.strongcost;
            }
        // }
    }
    return flag;
}

EquipModel.prototype.FindNewStar = function () {
    if (!GuideController.IsFunctionOpen(Define.FUNCTION_TYPE.TYPE_STARUP)) { return false; }

    let flag = false;
    let findEquip = this.FindOneKeyStarEquip();
    if (findEquip) {
        let stronglevel = _.get(findEquip, 'equipdata.stronglevel', 0);
        let starcostNextConfig = ConfigController.GetConfigById('starcost_data', stronglevel + 1, 'star');
        if (starcostNextConfig) {
            flag = CurrencyModel.GetMoney() >= starcostNextConfig.cost && ItemModel.GetItemNumById(1) >= starcostNextConfig.stonenum;
        }
    }
    return flag;
}

EquipModel.prototype.FindNewStarStone = function () {
    if (!GuideController.IsFunctionOpen(Define.FUNCTION_TYPE.TYPE_STARUP)) { return false; }

    let flag = false;
    let findEquip = this.FindOneKeyStarEquip();
    if (findEquip) {
        let stronglevel = _.get(findEquip, 'equipdata.stronglevel', 0);
        let starStones = ItemModel.GetItemsByType(ItemDefine.ITEMTYPE.ItemType_StarStone);
        if (starStones.length > 0) {
            starStones = _.sortBy(starStones, function (info) {
                return info.baseid;
            });

            for (let i = 0; i < starStones.length; i++) {
                if (ItemModel.GetStarItemLevel(starStones[0]) > stronglevel) {
                    flag = true;
                    break;
                }
            }
        }
    }
    return flag;
}

EquipModel.prototype.FindNewSoul = function () {
    if (!GuideController.IsFunctionOpen(Define.FUNCTION_TYPE.TYPE_SOUL)) { return false; }

    let flag = false;
    let findEquip = this.FindOneKeySoulEquip();
    if (findEquip) {
        if (this.IsHaveSoul(findEquip)) {
            this.soulList = this.GetSoulEquips(findEquip);
            flag = this.soulList.num > 0 && findEquip.equipdata.godnormal.level < 15;
        } else {
            let equipSoul = _.find(ItemModel.GetItems(), function (info) {
                return info.packagetype == ItemDefine.PACKAGETYPE.PACKAGE_EQUIP && info.type == findEquip.type && this.IsHaveSoul(info);
            }.bind(this));
            if (equipSoul) {
                flag = true;
            }
        }
    }
    return flag;
}

EquipModel.prototype.FindNewSoulForge = function () {
    if (!GuideController.IsFunctionOpen(Define.FUNCTION_TYPE.TYPE_SOUL)) { return false; }

    let flag = false;
    let findEquip = this.FindOneKeySoulEquip();
    if (findEquip) {
        if (!this.IsHaveSoul(findEquip)) {
            let equipLv = this.GetCanEquipLvByUserLv(UserModel.GetLevel());
            let makeEquipConfig = ConfigController.GetConfigById('makeequipcost_data', (equipLv * 10000) + (findEquip.type * 10) + 1);
            if (makeEquipConfig) {
                flag = MainUserModel.GetSmelt() >= makeEquipConfig.smelt && MainUserModel.GetFame() >= makeEquipConfig.fame;
            }
        }
    }
    return flag;
}

EquipModel.prototype.FindUserEquipTypes = function () {
    let mainArms = this.GetMainArmsByOccupation(UserModel.GetUserOccupation());
    let viceArms = this.GetViceArmsByOccupation(UserModel.GetUserOccupation());
    let equipTypes = [
        mainArms,
        ItemDefine.ITEMTYPE.ItemType_Helmet,
        viceArms,
        ItemDefine.ITEMTYPE.ItemType_Necklace,
        ItemDefine.ITEMTYPE.ItemType_Wrister,
        ItemDefine.ITEMTYPE.ItemType_Clothes,
        ItemDefine.ITEMTYPE.ItemType_Trousers,
        ItemDefine.ITEMTYPE.ItemType_Belt,
        ItemDefine.ITEMTYPE.ItemType_Shoes,
        ItemDefine.ITEMTYPE.ItemType_Ring
    ];
    return equipTypes;
}

EquipModel.prototype.FindOneKeyChangeEquips = function () {
    let equips = [];
    let equipTypes = this.FindUserEquipTypes();

    for (let i = 0; i < equipTypes.length; i++) {
        let type = equipTypes[i];
        let curEquip = this.GetUseEquipByTypes(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, type);
        let targetEquips = this.GetNoEquipsByType(type);
        let sortEquips = _.sortBy(targetEquips, function (info) {
            let result = this.GetBasicScore(info.equipdata);
            return -result;
        }.bind(this));
        if (sortEquips.length > 0) {
            if (curEquip == null) {
                equips.push(sortEquips[0].thisid);
            } else {
                for (let i = 0; i < sortEquips.length; i++) {
                    let equipInfo = sortEquips[i];
                    if (curEquip.level < equipInfo.level) {
                        equips.push(equipInfo.thisid);
                        break;
                    } else {
                        if (curEquip.equipdata.color < equipInfo.equipdata.color && curEquip.level == equipInfo.level) {
                            equips.push(equipInfo.thisid);
                            break;
                        }
                    }
                }
            }
        }
    }
    return equips;
}

EquipModel.prototype.FindOneKeyStrongEquip = function () {
    let equip = null;
    let useEquips = ItemModel.GetItemsByPackagetype(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP);
    let sortEquips = _.sortBy(useEquips, function (info) {
        return this.GetStrongSortValue(info.type, info.equipdata.newstronglevel);
    }.bind(this));
    if (sortEquips.length > 0) {
        equip = sortEquips[0];
    }
    return equip;
}

EquipModel.prototype.FindOneKeyStarEquip = function () {
    let equip = null;
    let useEquips = ItemModel.GetItemsByPackagetype(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP);
    let sortEquips = _.sortBy(useEquips, function (info) {
        return this.GetStrongSortValue(info.type, info.equipdata.stronglevel);
    }.bind(this));
    if (sortEquips.length > 0) {
        equip = sortEquips[0];
    }
    return equip;
}

EquipModel.prototype.FindOneKeySoulEquip = function () {
    let equip = null;
    let equipTypes = this.FindUserEquipTypes();

    //条件一:当玩家包裹中存在一件灵魂装备，该部位的装备身上没有灵魂（换种说法，就是首次获得某个部位的灵魂装备）时，进入灵魂界面优先指向该装备
    for (let i = 0; i < equipTypes.length; i++) {
        let type = equipTypes[i];
        let curEquip = this.GetUseEquipByTypes(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, type);
        if (curEquip) {
            if (!this.IsHaveSoul(curEquip)) {
                let findEquip = _.find(ItemModel.GetItems(), function (info) {
                    return info.packagetype == ItemDefine.PACKAGETYPE.PACKAGE_EQUIP && this.GetSoulTypeByType(info.type) == this.GetSoulTypeByType(type) && this.IsHaveSoul(info);
                }.bind(this));
                if (findEquip) {
                    equip = curEquip;
                }
            }
            if (equip != null) {
                break;
            }
        }
    }
    //条件二:当玩家身上存在某件装备没有灵魂，但是打造值和荣誉值足够打造一件装备时，指向身上没灵魂的装备中，编号最小的那件。
    if (equip == null) {
        for (let i = 0; i < equipTypes.length; i++) {
            let type = equipTypes[i];
            let curEquip = this.GetUseEquipByTypes(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, type);
            if (curEquip) {
                if (!this.IsHaveSoul(curEquip)) {
                    let equipLv = this.GetCanEquipLvByUserLv(UserModel.GetLevel());
                    let makeEquipConfig = ConfigController.GetConfigById('makeequipcost_data', (equipLv * 10000) + (type * 10) + 1);
                    if (makeEquipConfig) {
                        if (MainUserModel.GetSmelt() >= makeEquipConfig.smelt && MainUserModel.GetFame() >= makeEquipConfig.fame) {
                            equip = curEquip;
                        }
                    }
                }
            }
            if (equip != null) {
                break;
            }
        }
    }
    //条件三:进入灵魂界面优先指向灵魂等级最小的装备。存在同等级时，指向编号最小的装备。
    if (equip == null) {
        let useEquips = ItemModel.GetItemsByPackagetype(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP);
        let sortEquips = _.sortBy(useEquips, function (info) {
            let soulLv = 0;
            let soul = _.get(info, 'equipdata.godnormal', null);
            if (soul != null) {
                soulLv = soul.level;
            }
            return this.GetStrongSortValue(info.type, soulLv);
        }.bind(this));
        let haveEquipPos = 0;
        for (let i = 0; i < sortEquips.length; i++) {
            if (this.IsHaveSoul(sortEquips[i])) {
                haveEquipPos = i;
                break;
            }
        }
        if (sortEquips.length > 0) {
            equip = sortEquips[haveEquipPos];
        }
    }
    return equip;
}
//根据装备类型判断是否可以打造灵魂装备
EquipModel.prototype.checkCanForgeSoulEquipByType = function (equipType) {
    let tLevel = this.GetCanEquipLvByUserLv(UserModel.GetLevel());
    
    let tList = [];

    let objConfig = ConfigController.GetConfig('object_data');
    if (objConfig) {
        tList = _.filter(objConfig, function (base) {
            return base.level == tLevel && this.IsEquip(base.kind) && base.kind == equipType;
        }.bind(this));
    }

    if(tList.length > 0){
        let equipData = tList[0];
        let makeEquipConfig = ConfigController.GetConfigById('makeequipcost_data', (equipData.level*10000) + (equipData.kind*10) + 1);
        if (makeEquipConfig) {
            if (MainUserModel.GetSmelt() >= makeEquipConfig.smelt && MainUserModel.GetFame() >= makeEquipConfig.fame) {
                return true;
            };
        };
    };
    return false;
}
//====================  宝石数据  ====================
/**
 * 根据类型获得宝石名字
 *
 * @param {*} type
 * @returns
 */
EquipModel.prototype.GetGemNameByType = function (type) {
    switch (type) {
        case ItemDefine.STONE_TYPE.TYPE_POWER:
            return '力量';
        case ItemDefine.STONE_TYPE.TYPE_QUICK:
            return '敏捷';
        case ItemDefine.STONE_TYPE.TYPE_INTELL:
            return '智力';
        case ItemDefine.STONE_TYPE.TYPE_ENDURANCE:
            return '耐力';
        default:
            return ''
    }
}
/**
 * 根据装备类型和槽位获得宝石类型
 *
 * @param {Number} type
 * @param {Number} slot
 * @returns Number
 */
EquipModel.prototype.GetGemTypeByEquipType = function (type, slot) {
    let stoneTypeDefine = ConfigController.GetConfigById('holetype_data', type, 'equiptype');
    return _.get(stoneTypeDefine, 'stone' + slot, ItemDefine.STONE_TYPE.TYPE_POWER);
}

/**
 * 根据宝石类型获得装备上具体的宝石数据
 *
 * @param {Object} equipdata
 * @param {Number} type
 * @returns Object
 */
EquipModel.prototype.GetGemDataByType = function (equipdata, type) {
    let stones = _.get(equipdata, 'equipdata.stone', []);
    return _.find(stones, { type: type });
}

/**
 * 我只要根据id就能获得宝石等级哦
 *
 * @param {Number} id
 * @returns Number
 */
EquipModel.prototype.GetGemLevelById = function (id) {
    let objDefine = ItemModel.GetItemConfig(id);
    return _.get(objDefine, 'level', 0);
}
/**
 * 获得开孔消耗道具的数量
 *
 * @param {Number} index
 * @returns Number
 */
EquipModel.prototype.GetOpenSlotCostNum = function (index) {
    let define = ConfigController.GetConfigById('makehole_data', index + 1, 'hole');
    return _.get(define, 'num', 100);
}
/**
 * 我拥有开孔的道具数量
 *
 * @param {Number} index
 * @returns Number
 */
EquipModel.prototype.GetOpenSlotHasNum = function (index) {
    let define = ConfigController.GetConfigById('makehole_data', index + 1, 'hole');
    return ItemModel.GetItemNumById(_.get(define, 'item', 0));
}

/**
 * 是否可以开孔 返回可以开第几个孔 -1为不能开 1-4可以开
 *
 * @param {Number} equiptype
 * @returns Number
 */
EquipModel.prototype.CanOpenSlot = function (equiptype) {
    let curEquip = this.GetUseEquipByTypes(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, equiptype);
    if (curEquip == null) {
        return -1;
    }
    let index = _.get(curEquip, 'equipdata.hole', 0);
    if (index > 4) {
        //开满了
        return -1;
    }
    if (this.GetOpenSlotHasNum(index) >= this.GetOpenSlotCostNum(index)) {
        //可以开孔
        return index + 1;
    }
    return -1;
}

/**
 * 是否有宝石可以镶嵌 -1为不满足条件 1-4表示可以镶嵌的槽位
 *
 * @param {Number} equiptype
 * @returns Number
 */
EquipModel.prototype.CanGemInlay = function (equiptype) {
    let curEquip = this.GetUseEquipByTypes(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, equiptype);
    if (curEquip == null) {
        return -1;
    }
    let hole = _.get(curEquip, 'equipdata.hole', 0);
    let slots = _.get(curEquip, 'equipdata.stone', []);
    for (let j = 1; j <= hole; j++) {
        let stone = _.find(slots, { pos: j });
        if (stone == null || stone.objid == null || stone.objid == 0) {
            //未镶嵌
            let stoneTypeDefine = ConfigController.GetConfigById('holetype_data', equiptype, 'equiptype');
            let stoneType = _.get(stoneTypeDefine, 'stone' + j, 0);
            let id = _.get(this, 'stoneidByType.' + stoneType, 0);
            if (ItemModel.GetItemNumById(id) > 0) {
                //有东西镶嵌
                return j;
            }
        }
    }
    return -1;
}

/**
 * 判断这个宝石能不能升级
 *
 * @param {Number} gemid
 * @returns Bool
 */
EquipModel.prototype.CantGemUp = function (gemid, equiplevel) {
    let levelLimitDefine = ConfigController.GetConfigById('putonlimit_data', equiplevel, 'elevel');
    let levelLimit = _.get(levelLimitDefine, 'slevel', 0);
    //是不是满级了呢
    let stoneLevel = this.GetGemLevelById(gemid);
    if (stoneLevel >= levelLimit) {
        //等级限制到满级啦
        return 1;
    }
    let typeDefine = ConfigController.GetConfigById('typepro_data', gemid);
    if (_.get(typeDefine, 'nextid', 0) == 0) {
        //真的升到满级了
        return 1;
    }
    let costDefine = ConfigController.GetConfigById('stoneup_data', gemid);
    if (costDefine != null) {
        let needid = _.get(costDefine, 'needid', 0);
        let cost = _.get(costDefine, 'num', 1);
        let money = _.get(costDefine, 'money', 0);
        if (ItemModel.GetItemNumById(needid) < cost) {
            return 2;
        }
        if (CurrencyModel.GetMoney() < money) {
            return 3;
        }
    }
    return 0;
}
/**
 * 最低级的宝石是否可以升级 
 *
 * @param {Number} equiptype
 * @returns Object{index: 宝石位置,level:宝石当前等级,id: 宝石id,equiplevel: 装备等级}
 */
EquipModel.prototype.GetEquipMinLevelGem = function (equiptype) {
    let curEquip = this.GetUseEquipByTypes(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, equiptype);
    if (curEquip == null) {
        return null;
    }
    let hole = _.get(curEquip, 'equipdata.hole', 0);

    if (hole > 0) {
        let equipType = _.get(curEquip, 'type', 0);
        //选一个宝石等级最低的吧
        let minLevel = 100;
        let minIndex = 0;
        let minId = 0;
        for (let i = 1; i <= hole; i++) {
            let gemType = this.GetGemTypeByEquipType(equipType, i);
            let stone = this.GetGemDataByType(curEquip, gemType);
            if (stone == null) {
                //可镶嵌 这个低了
                return {
                    index: i,
                    level: 0,
                    id: this.stoneidByType[gemType],
                    equiplevel: curEquip.level
                }
            } else {
                let level = this.GetGemLevelById(stone.objid);
                if (level < minLevel) {
                    minLevel = level;
                    minIndex = i;
                    minId = stone.objid
                }
            }
        }
        if (minLevel != 100) {
            return {
                index: minIndex,
                level: minLevel,
                id: minId,
                equiplevel: curEquip.level
            }
        }
    }
    return null;
}
/**
 * 查找一件强化宝石的装备
 *
 * @returns Object
 */
EquipModel.prototype.FindOneKeyGemEquip = function () {
    if (!GuideController.IsFunctionOpen(Define.FUNCTION_TYPE.TYPE_GEM)) {
        return {
            type: 0,
            equip: null
        }
    }
    let equip = null;
    let equipTypes = this.FindUserEquipTypes();
    //看看有没有能开槽的
    let slotIndex = 10;
    for (let i = 0; i < equipTypes.length; i++) {
        let equiptype = equipTypes[i];
        let index = this.CanOpenSlot(equiptype);
        if (index != -1 && index < slotIndex) {
            slotIndex = index;
            equip = this.GetUseEquipByTypes(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, equiptype);
        }
    }
    if (equip != null) {
        //如果有可开孔的，直接返回
        return {
            type: 1,            //表示可以开孔
            equip: equip
        }
    }
    //看看有没有能镶嵌的
    let inlayIndex = 10;
    for (let i = 0; i < equipTypes.length; i++) {
        let equiptype = equipTypes[i];
        let index = this.CanGemInlay(equiptype);
        if (index != -1 && index < inlayIndex) {
            inlayIndex = index;
            equip = this.GetUseEquipByTypes(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, equiptype);
        }
    }
    if (equip != null) {
        return {
            type: 2,            //表示可以镶嵌
            equip: equip
        }
    }
    //看看有没有能升级宝石的
    let targetObj = null;
    for (let i = 0; i < equipTypes.length; i++) {
        let equiptype = equipTypes[i];
        let obj = this.GetEquipMinLevelGem(equiptype);
        if (obj != null && !this.CantGemUp(obj.id, obj.equiplevel)) {
            if (targetObj == null || obj.level < targetObj.level) {
                targetObj = obj;
                equip = this.GetUseEquipByTypes(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, equiptype);
            }
        }
    }
    if (equip != null) {
        return {
            type: 3,            //表示可以升级
            equip: equip
        }
    }
    equip = ItemModel.GetItemsByPackagetype(ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP)[0];
    return {
        type: 0,                //啥都不能干咯
        equip: equip
    };
}

EquipModel.prototype.GetSoulEquips = function (equip) {
    let base = { thisid: 0, num: 0 }

    for (let i = 0; i < ItemModel.GetItems().length; i++) {
        let itemInfo = ItemModel.GetItems()[i];

        if (itemInfo.type == ItemDefine.ITEMTYPE.ItemType_Exp) {
            if (base.thisid != itemInfo.thisid) {
                base.thisid = itemInfo.thisid;
                base.num += itemInfo.num;
            }
        }

        if (itemInfo.packagetype == ItemDefine.PACKAGETYPE.PACKAGE_EQUIP) {
            if (itemInfo.thisid != equip.thisid && this.IsHaveSoul(itemInfo)) {
                if (base.thisid == 0) {
                    base.thisid = itemInfo.thisid;
                }
                base.num += 1;
            }
        }
    }
    return base;
}

EquipModel.prototype.GetStrongSortValue = function (_type, strong) {
    let score = 0;
    if (_type == ItemDefine.ITEMTYPE.ItemType_Knife || _type == ItemDefine.ITEMTYPE.ItemType_Bow || _type == ItemDefine.ITEMTYPE.ItemType_Stick) {
        score = 1;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Helmet) {
        score = 2;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_KnifeAssistant || _type == ItemDefine.ITEMTYPE.ItemType_BowAssistant || _type == ItemDefine.ITEMTYPE.ItemType_StickAssistant) {
        score = 3;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Necklace) {
        score = 4;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Wrister) {
        score = 5;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Clothes) {
        score = 6;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Trousers) {
        score = 7;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Belt) {
        score = 8;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Shoes) {
        score = 9;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Ring) {
        score = 10;
    }
    score = score + (strong * 100);
    return score;
}

EquipModel.prototype.GetStrongEquipPos = function (t_object) {
    let pos = 0;
    let _type = t_object.type;
    if (_type == ItemDefine.ITEMTYPE.ItemType_Knife || _type == ItemDefine.ITEMTYPE.ItemType_Bow || _type == ItemDefine.ITEMTYPE.ItemType_Stick) {
        pos = 0;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_KnifeAssistant || _type == ItemDefine.ITEMTYPE.ItemType_BowAssistant || _type == ItemDefine.ITEMTYPE.ItemType_StickAssistant) {
        pos = 1;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Wrister) {
        pos = 2;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Trousers) {
        pos = 3;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Shoes) {
        pos = 4;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Helmet) {
        pos = 5;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Necklace) {
        pos = 6;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Clothes) {
        pos = 7;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Belt) {
        pos = 8;
    } else if (_type == ItemDefine.ITEMTYPE.ItemType_Ring) {
        pos = 9;
    }
    return pos;
}

EquipModel.prototype.onEquipFail = function (msgid, data) {
    AudioController.PlayEffect('Audio/UI/UI_StarFail');
}
EquipModel.prototype.onEquipSuccess = function (msgid, data) {
    AudioController.PlayEffect('Audio/UI/UI_StarSucceed');
}
EquipModel.prototype.onLevelupStoneFail = function (msgid, data) {
    AudioController.PlayEffect('Audio/UI/UI_StarFail');
}
EquipModel.prototype.onLevelupStoneFail = function (msgid, data) {
    AudioController.PlayEffect('Audio/UI/UI_StarSucceed');
}
EquipModel.prototype.onNotifyLuckNum = function (msgid, data) {
    NotificationController.Emit(Define.EVENT_KEY.LUCKNUM_REFRESH, data);
}

module.exports = new EquipModel();