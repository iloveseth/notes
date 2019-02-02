// Fairy.js
const _ = require('lodash');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const GuideController = require('../Controller/GuideController');
const Tools = require('../Util/Tools');
const Define = require('../Util/Define');
const UserModel = require('./User');
const ItemModel = require('./item');
const ConfigController = require('../Controller/ConfigController');

var FairyModel = function () {
	this.fairys = {};
	this.fairysPos = [];
	this.fairyGmOpen = false;
	this.eatFairys = [];

	this.fairybaseConfig = [];
	this.fairyaddConfig = [];
	this.petlimitConfig = [];
	this.yuanshenConfig = [];
	this.fairyskillConfig = [];
	this.fairylevelConfig = [];
	this.fairystarConfig = [];
	this.fairyequipConfig = [];
	this.fairyfateConfig = [];

	this._cultivateTimer = false;
}

FairyModel.prototype.Init = function (cb) {
	NetWorkController.AddListener('pet.RetPetMainInfo', this, this.onRetPetMainInfo);
	NetWorkController.AddListener('pet.PetMainInfo', this, this.onPetMainInfo)
	NetWorkController.AddListener('pet.RetEatList', this, this.onRetEatList);
	NetWorkController.AddListener('pet.RetFightPos', this, this.onRetFightPos);
	NetWorkController.AddListener('pet.AttriTrainReslut', this, this.onAttriTrainReslut);
	NetWorkController.AddListener('pet.RemovePet', this, this.onRemovePet);

	this.fairybaseConfig = ConfigController.GetConfig('fairybase_data');
	this.fairyaddConfig = ConfigController.GetConfig('fairyadd_data');
	this.petlimitConfig = ConfigController.GetConfig('petlimit_data');
	this.yuanshenConfig = ConfigController.GetConfig('yuanshen_data');
	this.fairyskillConfig = ConfigController.GetConfig('fairyskill_data');
	this.fairylevelConfig = ConfigController.GetConfig('fairylevel_data');
	this.fairystarConfig = ConfigController.GetConfig('fairystar_data');
	this.fairyequipConfig = ConfigController.GetConfig('fairyequip_data');
	this.fairyfateConfig = ConfigController.GetConfig('fairyfate_data');
	Tools.InvokeCallback(cb, null);
}
FairyModel.prototype.Reload = function (cb) {
	this.fairys = {};
	this.fairysPos = [];
	this.fairyGmOpen = false;
	Tools.InvokeCallback(cb, null);
}
/**
 * 对外接口
 */
FairyModel.prototype.GetFairys = function () {
	return _.get(this, 'fairys', []);
}
FairyModel.prototype.GetFightFairys = function () {
	return _.get(this, 'fairysPos', []);
}

FairyModel.prototype.GetFairyInfoById = function (id) {
	let fairy = null;
	var fairys = this.fairys.pet;
	if (fairys) {
		for (var i = 0; i < fairys.length; i++) {
			if (fairys[i].data.uuid == id) {
				fairy = fairys[i];
				break;
			}
		}
	}
	return fairy;
}

FairyModel.prototype.GetFairyFightInfoByIndex = function (index) {
	let fairy = null;
	for (var i = 0; i < this.fairysPos.length; i++) {
		var data = this.fairysPos[i];
		if (data.pos == index) {
			fairy = this.fairysPos[i];
			break;
		}
	}
	return fairy;
}

FairyModel.prototype.isFairyOpen = function (index) {
	var index = index || 1;
	var level = UserModel.getTopMapid();
	if (this.fairysPos && self.fairysPos[index]) {
		return level >= self.fairysPos[index].data.openlevel;
	}
	return false;
}

FairyModel.prototype.GetFairyRedDot = function(){
	let ids = [
            Define.FUNCTION_TYPE.TYPE_FIRSTFAIRY,
            Define.FUNCTION_TYPE.TYPE_SECONDFAIRY,
            Define.FUNCTION_TYPE.TYPE_THIRDFAIRY,
            Define.FUNCTION_TYPE.TYPE_FOURTHFAIRY,
            Define.FUNCTION_TYPE.TYPE_FIFTHFAIRY,
            Define.FUNCTION_TYPE.TYPE_SIXTHFAIRY,
        ];

	for (var i = 1; i <= 6; i++) {
		let f = this.GetFairyFightInfoByIndex(i);
		if(f == null){
            let isUnlock = GuideController.IsFunctionOpen(ids[i-1]);
            if(isUnlock){
            	return true;
            }
		}
		if(this.GetFairyRedDotByIndex(i)){
			return true;
		}
	}
	return false;
}

FairyModel.prototype.GetFairyRedDotForMoney = function () {
	let normalMoney = 50000;
	let goldMoney = 10;
	for (var i = 0; i < this.fairysPos.length; i++) {
		var data = this.fairysPos[i];
		if(data){
			let wdstr = data.attri_train != null ? data.attri_train.wdstr : 0;
			let wddex = data.attri_train != null ? data.attri_train.wddex : 0;
			let wdint = data.attri_train != null ? data.attri_train.wdint : 0;
			let wdcon = data.attri_train != null ? data.attri_train.wdcon : 0;
			let bConfig = this.GetFairyBaseConfigById(data.id);
			let eid = (data.color || 1)*1000 + data.level;
			let flConfig = this.GetFairyLevelConfigById(eid);
			if(flConfig){
				let addattri = flConfig.addattri || 0;
		        let value = bConfig.maxfour+addattri*(data.level - 1) - (wdstr+wddex+wdint+wdcon);
		        if(value <= 0){
		            // maxvalue 最大
		            continue;
		        }
			}
			if(UserModel.GetMoney() >= normalMoney || UserModel.GetGold() >= goldMoney){
				return true;
			}
		}
	}
	return false;
}

FairyModel.prototype.GetFairyRedDotByIndex = function (pos) {
	// let data = this.GetFairyFightInfoByIndex(pos);
	let fMsg = this.GetFairyFightInfoByIndex(pos);
	if(fMsg && fMsg.petid){
		// 装备
		let fdata = this.GetFairyInfoById(fMsg.petid);
		if(GuideController.IsFunctionOpen(78)){
			for (var i = 0; i < fdata.data.equips.length; i++) {
				let eInfo = fdata.data.equips[i];
				let level = eInfo.level;
				let eConfig = this.GetFairyEquipConfigById(eInfo.weapon*10000+level);
				let num = ItemModel.GetItemNumById(eConfig.itemid);
				if(level < fdata.data.level && num >= eConfig.num ){
					return true;
				}
			}
		}
		
		// 升级
		if(this.GetUpgradeRedDotByIndex(pos) && GuideController.IsFunctionOpen(64)){
			return true;
		}
		// 培养
		if(this.GetCultivateRedDotByIndex(pos) && GuideController.IsFunctionOpen(63)){
			return true;
		}
		// 星级
		if(this.GetFairyStarRedDot(pos) && GuideController.IsFunctionOpen(65)){
			return true;
		}
	}
	return false;
}

FairyModel.prototype.GetUpgradeRedDotByIndex = function (pos) {
	let fMsg = this.GetFairyFightInfoByIndex(pos);
	let num = 0;
	if(fMsg && this.eatFairys){
		let data = this.GetFairyInfoById(fMsg.petid).data;
		if(data.level >= 100){
			return false;
		}
		for (var i = 0; i < this.eatFairys.length; i++) {
			let f = this.eatFairys[i];
			let fConfig = this.GetFairyBaseConfigById(f.id);
			let color = fConfig.fairycolor;
			if(color < 4){
				num ++;
			}
			if(num >= 15){
				return true;
			}
		}
	}
	return false;
}

FairyModel.prototype.GetCultivateRedDotByIndex = function (pos){
	let normalMoney = Math.pow(10,6);
	let goldMoney = 10;
	let fMsg = this.GetFairyFightInfoByIndex(pos);
	if(fMsg){
		let data = this.GetFairyInfoById(fMsg.petid).data;
		let wdstr = data.attri_train != null ? data.attri_train.wdstr : 0;
		let wddex = data.attri_train != null ? data.attri_train.wddex : 0;
		let wdint = data.attri_train != null ? data.attri_train.wdint : 0;
		let wdcon = data.attri_train != null ? data.attri_train.wdcon : 0;
		let bConfig = this.GetFairyBaseConfigById(data.id);
		let eid = (data.color || 1)*1000 + data.level;
		let flConfig = this.GetFairyLevelConfigById(eid);
		if(flConfig){
			// let addattri = flConfig.addattri || 0;
	  //       let value = bConfig.maxfour+addattri*(data.level - 1) - (wdstr+wddex+wdint+wdcon);
	   		let value = flConfig.attriall - (wdstr+wddex+wdint+wdcon);
            	
	        if(value <= 0){
	            // maxvalue 最大
	            return false;
	        }
		}
		// || UserModel.GetGold() >= goldMoney
		if(UserModel.GetMoney() >= normalMoney && !this._cultivateTimer){
			return true;
		}
	}
	return false;
}
FairyModel.prototype.GetFairyStarRedDot = function(pos){
	let expMatr = [482,479,480,481];
	let fMsg = this.GetFairyFightInfoByIndex(pos);
	if(fMsg){
		let data = this.GetFairyInfoById(fMsg.petid).data;
		let star = data.star || 0;
		let fsConfig = this.GetFairyStarConfigByStar(star+1);
		if(fsConfig){
			let sExp = data.starexp || 0;
			if(sExp >= fsConfig.needexp){
				let num = ItemModel.GetItemNumById(expMatr[0]);
				if(num > 0){
					return true
				}
			}else{
				for (var i = 1; i < expMatr.length; i++) {
	    			let num = ItemModel.GetItemNumById(expMatr[i])
	    			if(num > 0){
	    				return true;
	    			}
	    		}
			}
		}
	}
	return false;
}

FairyModel.prototype.GetFairyBaseConfigById = function (id) {
	return _.find(this.fairybaseConfig, { id: id });
}
FairyModel.prototype.GetFairyBaseConfigByKind = function (kind) {
	return _.find(this.fairybaseConfig, { fairykind: kind });
}
FairyModel.prototype.GetFairyBaseConfigByColor = function (color) {
	var list = [];
	for (var i = 0; i < this.fairybaseConfig.length; i++) {
		var config = this.fairybaseConfig[i];
		if (config.fairycolor == color) {
			list.push(config);
		}
	}
	return list;
}
FairyModel.prototype.GetFairyAddConfigById = function (id) {
	return _.find(this.fairyaddConfig, { id: id });
}
FairyModel.prototype.GetPetLimitConfigById = function (id) {
	return _.find(this.petlimitConfig, { pid: id });
}
FairyModel.prototype.GetYuanshenConfigByNum = function (num) {
	return _.find(this.yuanshenConfig, { num: num });
}
FairyModel.prototype.GetFairySkillConfigById = function (id) {
	return _.find(this.fairyskillConfig, { id: id });
}
FairyModel.prototype.GetFairyLevelConfigById = function (id) {
	return _.find(this.fairylevelConfig, { id: id });
}
FairyModel.prototype.GetFairyStarConfigByStar = function (star) {
	return _.find(this.fairystarConfig, { star: star });
}
FairyModel.prototype.GetFairyEquipConfigById = function (id) {
	return _.find(this.fairyequipConfig, { id: id });
}
FairyModel.prototype.GetFairyFateConfigById = function (id) {
	return _.find(this.fairyfateConfig, { id: id });
}
// FairyModel.prototype.GetCultivateConfigByLevel = function (level) {
// 	var config = ConfigController.GetConfigById('normalcost_data', level, 'level');
// 	return config;
// }

FairyModel.prototype.GetEquipMaxLevelByColor = function (weapon, color, star) {
	var level = 0;
	for (var i = 0; i < this.fairyequipConfig.length; i++) {
		if (this.fairyequipConfig[i].weapon == weapon && this.fairyequipConfig[i].color == color && this.fairyequipConfig[i].star == star) {
			level = level + 1;
		}
	}
	return level;
}

FairyModel.prototype.GetEquipMaxLevelByColor = function (weapon, color, star) {
	var level = 0;
	for (var i = 0; i < this.fairyequipConfig.length; i++) {
		if (this.fairyequipConfig[i].weapon == weapon && this.fairyequipConfig[i].color == color && this.fairyequipConfig[i].star == star) {
			level = Math.max(this.fairyequipConfig[i].level, level);
		}
	}
	return level;
}

FairyModel.prototype.GetEquipPropByConfig = function (config) {
	// var config = this.GetFairyEquipConfigById(id);
	if (config == null) {
		return null;
	}
	var index = 0;
	var prop = [];
	if (config.hp && config.hp > 0) {
		var v = {};
		v.title = "生命值";
		v.value = config.hp;
		prop[index] = v;
		index = index + 1;
	}
	if (config.mp && config.mp > 0) {
		var v = {};
		v.title = "魔法盾";
		v.value = config.mp;
		prop[index] = v;
		index = index + 1;
	}
	if (config.dmg && config.dmg > 0) {
		var v = {};
		v.title = "伤害";
		v.value = config.dmg;
		prop[index] = v;
		index = index + 1;
	}
	if (config.defense && config.defense > 0) {
		var v = {};
		v.title = "护甲";
		v.value = config.defense;
		prop[index] = v;
		index = index + 1;
	}
	if (config.presis && config.presis > 0) {
		var v = {};
		v.title = "物抗";
		v.value = config.presis;
		prop[index] = v;
		index = index + 1;
	}
	if (config.mresis && config.mresis > 0) {
		var v = {};
		v.title = "魔抗";
		v.value = config.mresis;
		prop[index] = v;
		index = index + 1;
	}
	if (config.crit && config.crit > 0) {
		var v = {};
		v.title = "暴击";
		v.value = config.crit;
		prop[index] = v;
		index = index + 1;
	}
	if (config.hit && config.hit > 0) {
		var v = {};
		v.title = "命中";
		v.value = config.hit;
		prop[index] = v;
		index = index + 1;
	}
	if (config.dodge && config.dodge > 0) {
		var v = {};
		v.title = "闪避";
		v.value = config.dodge;
		prop[index] = v;
		index = index + 1;
	}
	if (config.tenacity && config.tenacity > 0) {
		var v = {};
		v.title = "韧性";
		v.value = config.tenacity;
		prop[index] = v;
		index = index + 1;
	}
	return prop;
}
FairyModel.prototype.GetFairyFatePropByConfig = function (id) {
	var config = this.GetFairyFateConfigById(id);
	if (config == null) {
		return null;
	}
	var prop = {};
	if (config.addstr && config.addstr > 0) {
		var v = {};
		v.title = "力量";
		v.value = config.addstr;
		prop = v;
	}
	if (config.adddex && config.adddex > 0) {
		var v = {};
		v.title = "敏捷";
		v.value = config.adddex;
		prop = v;
	}
	if (config.addint && config.addint > 0) {
		var v = {};
		v.title = "智力";
		v.value = config.addint;
		prop = v;
	}
	if (config.addres && config.addres > 0) {
		var v = {};
		v.title = "耐力";
		v.value = config.addres;
		prop = v;
	}
	return prop;
}

FairyModel.prototype.GetJobName = function (job) {   //获得职业名字
	let name = "";
	if (job == 1) {
		name = "大剑士";
	} else if (job == 2) {
		name = "魔导师";
	} else if (job == 3) {
		name = "炮娘";
	}
	return name;
}


FairyModel.prototype.GetFairyLabelColor = function (color) {      //获得文本颜色
	let tColor = cc.color(255, 246, 241);
	switch (color) {
		case 1:
			tColor = cc.color(255, 246, 241);
			break;
		case 2:
			tColor = cc.color(50, 233, 14);
			break;
		case 3:
			tColor = cc.color(0, 210, 255);
			break;
		case 4:
			tColor = cc.color(255, 0, 234);
			break;
		case 5:
			tColor = cc.color(255, 162, 0);
			break;
		case 6:
			tColor = cc.color(255, 0, 0);
			break;
	}
	return tColor;
}
FairyModel.prototype.GetFairyQualityIcon = function (color) {     //获得道具品质框
	let icon = "Image/UI/Common/tongyong_icon_gezibai";
	switch (color) {
		case 1:
			icon = "Image/UI/Common/tongyong_icon_gezibai";
			break;
		case 2:
			icon = "Image/UI/Common/tongyong_icon_gezilv";
			break;
		case 3:
			icon = "Image/UI/Common/tongyong_icon_gezilan";
			break;
		case 4:
			icon = "Image/UI/Common/tongyong_icon_gezizi";
			break;
		case 5:
			icon = "Image/UI/Common/tongyong_icon_gezicheng";
			break;
		case 6:
			icon = "Image/UI/Common/tongyong_icon_gezihong";
			break;
	}
	return icon;
}
FairyModel.prototype.GetFairyBtnGray = function () {
	return "Image/UI/Common/tongyong_icon_gray";
}
FairyModel.prototype.GetFairyBtnNormal = function () {
	return "Image/UI/Common/tongyong_icon_0006";
}

FairyModel.prototype.GetJobIcon = function (job) {   //获得职业图标
	let iconName = "";
	if (job == 1) {
		iconName = "Image/Icon/CommonIcon/zhucheng_icon_zs";
	} else if (job == 2) {
		iconName = "Image/Icon/CommonIcon/zhucheng_icon_fs";
	} else if (job == 3) {
		iconName = "Image/Icon/CommonIcon/zhucheng_icon_gs";
	}
	return iconName;
}
FairyModel.prototype.GetJobName = function (job) {   //获得职业名字
	let name = "";
	if (job == 1) {
		name = "大剑士";
	} else if (job == 2) {
		name = "魔导师";
	} else if (job == 3) {
		name = "炮娘";
	}
	return name;
}

FairyModel.prototype.GetAddValueColorByValue = function (value) {
	var tColor = cc.color(255, 246, 241);
	if (value == 0) {
		tColor = cc.color(255, 249, 230);
	} else if (value > 0) {
		tColor = cc.color(50, 233, 14);
	} else if (value < 0) {
		tColor = cc.color(255, 0, 0);
	}
	return tColor;
}

FairyModel.prototype.GetAddValueLineColorByValue = function (value) {
	var tColor = cc.color(111, 58, 18);
	if (value == 0) {
		tColor = cc.color(111, 58, 18);
	} else if (value > 0) {
		tColor = cc.color(27, 112, 11);
	} else if (value < 0) {
		tColor = cc.color(165, 34, 34);
	}
	return tColor;
}

FairyModel.prototype.setGM = function (bool) {
	this.fairyGmOpen = bool;
}
FairyModel.prototype.getGM = function () {
	return this.fairyGmOpen;
}

FairyModel.prototype.initFairyLockedFrame = function(){
	for (var i = 1; i <= 6; i++) {
		let v = UserModel.getValueForKey('fairyLock'+i);
		if(v == null){
			UserModel.setValueForKey('fairyLock'+i, 'true');
		}
	}
}

FairyModel.prototype.getLockFrame = function(pos) {
	let v = UserModel.getValueForKey('fairyLock'+pos);
	if(v == null){return null;}

	if(v == 'true'){
		return true;
	}
	return false;
}
FairyModel.prototype.setLockFrame = function(pos) {
	UserModel.setValueForKey('fairyLock'+pos, 'false');
}

/**
 * 消息处理接口
 */
FairyModel.prototype.onRetPetMainInfo = function (msgid, data) {
	this.fairys = data;
	NotificationController.Emit(Define.EVENT_KEY.RET_PET_MAIN_INFO);
	NotificationController.Emit(Define.EVENT_KEY.UPDATE_FAIRYRED);
}
FairyModel.prototype.onPetMainInfo = function (msgid, data) {
	var fairys = this.fairys.pet;
	if (fairys) {
		for (var i = 0; i < fairys.length; i++) {
			if (fairys[i].data.uuid == data.data.uuid) {
				this.fairys.pet[i] = data;
				data = null;
				break;
			}
		}
		if (data) {
			this.fairys.pet.push(data);
		}
	} else {
		var petInfo = [];
		petInfo.push(data);
		this.fairys.pet = petInfo;
	}
	NotificationController.Emit(Define.EVENT_KEY.RET_PET_MAIN_INFO);
	NotificationController.Emit(Define.EVENT_KEY.UPDATE_FAIRYRED);
}

FairyModel.prototype.onRetEatList = function (msgid, data) {
	this.eatFairys = data.list;
	NotificationController.Emit(Define.EVENT_KEY.FAIRY_RET_EAT_LIST, data);
	NotificationController.Emit(Define.EVENT_KEY.UPDATE_FAIRYRED);
}

FairyModel.prototype.onRetFightPos = function (msgid, data) {
	this.fairysPos = data.data || [];
	NotificationController.Emit(Define.EVENT_KEY.UPDATE_FAIRYRED);
	NotificationController.Emit(Define.EVENT_KEY.FAIRY_RET_FIGHT_POS);
}

FairyModel.prototype.onAttriTrainReslut = function (msgid, data) {
	NotificationController.Emit(Define.EVENT_KEY.FAIRY_ATTRI_TRAIN_RESLUT, data);
	NotificationController.Emit(Define.EVENT_KEY.UPDATE_FAIRYRED);
}
FairyModel.prototype.onRemovePet = function (msgid, data) {
	if(this.eatFairys){
		for (var i = 0; i < data.ids.length; i++) {
			let index = _.findIndex(this.eatFairys, { uuid: data.ids[i] });
			if (index != -1) {
				this.eatFairys.splice(index, 1);
			}
		}
	}
	NotificationController.Emit(Define.EVENT_KEY.FAIRY_REMOVE_PET, data);
	NotificationController.Emit(Define.EVENT_KEY.UPDATE_FAIRYRED);
}


module.exports = new FairyModel();