const _ = require('lodash');
const Define = require('../Util/Define');
const UserDefine = require('../Util/UserDefine');
const Tools = require('../Util/Tools');
const UIName = require('../Util/UIName');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const ConfigController = require('../Controller/ConfigController');
const TimeController = require('../Controller/TimeController');
const ViewController = require('../Controller/ViewController');
const CountDown = require('../Util/CountDown');
const AudioController = require('../Controller/AudioController');
// const FairyModel = require('./Fairy');
const CommonPlatform = require('../Platform/CommonGame');

const ServerUtil = require('../Util/ServerUtil');

var UserModel = function () {
	this.acc = '';
	this.token = '';
	this.lastSyncTime = TimeController.GetCurTime();
	this.levelupDefines = {};
	this.userInfo = {};
	this.userMainInfo = {};
	this.userStrengthInfo = { num: 0, maxnum: 0 };
	this.userMaxLv = 500;
	this.battle_red = {};

	this.septPostion = Define.SEPTPOSITION.SEPTNORMAL;
}

UserModel.prototype.Init = function (cb) {
	NetWorkController.AddListener('charmain.UserMainData', this, this.onUserMainData);
	NetWorkController.AddListener('msg.GW2C_RetLogin', this, this.onGW2C_RetLogin);
	NetWorkController.AddListener('msg.RetUserMainInfo', this, this.onRetUserMainInfo);
	NetWorkController.AddListener('msg.UserStrength', this, this.onUserStrength);
	NetWorkController.AddListener('msg.notifyExp', this, this.onNotifyExp);
	NetWorkController.AddListener('newfight.RetNewFightInfo', this, this.onRetNewFightInfo);
	NetWorkController.AddListener('msg.retTitleShow', this, this.onRetTitleShow);
	NetWorkController.AddListener('msg.reqPersonalTagInfo', this, this.reqPersonalTagInfo);
	NetWorkController.AddListener('msg.levelupSelfResult', this, this.onLevelupResult);
	NetWorkController.AddListener('lvltask.synLevelTask', this, this.onSynLevelTask);
	NetWorkController.AddListener('msg.RetObserveInfo', this, this.onRetObserveInfo);
	NetWorkController.AddListener('msg.notifyVipExp', this, this.onNotifyVipExp);

	NetWorkController.AddListener('msg.FightFuncRed',this,this.onFightFuncRed);

	cc.game.on(cc.game.EVENT_SHOW, () => {
		NotificationController.Emit(Define.EVENT_KEY.CHAT_VIEW_CLOSEATONCE);
	});

	let levelupDefines = ConfigController.GetConfig('characterdata');
	for (let i = 0; i < levelupDefines.length; i++) {
		let define = levelupDefines[i];
		if (define.level != null);
		this.levelupDefines[define.level] = define;
	}
	Tools.InvokeCallback(cb);

	window.setInterval(() => {
		this.getNotice();
	},120 * 1000);
}

UserModel.prototype.Reload = function (cb) {
	this.userInfo = {};
	this.userMainInfo = {};
	Tools.InvokeCallback(cb);
}

//====================  对外接口  ====================
UserModel.prototype.GetUserInfo = function () {
	return this.userInfo;
}

UserModel.prototype.GetCharid = function () {
	return _.get(this.userInfo, 'charid', 0);
}

UserModel.prototype.GetUserName = function () {
	return _.get(this.userInfo, 'name', '');
}

UserModel.prototype.GetFace = function () {
	return _.get(this.userInfo, 'face', '');
}

UserModel.prototype.GetCountry = function () {
	return _.get(this.userInfo, 'country', 0);
}
UserModel.prototype.GetEnemyCountry = function () {
	let mycountry = this.GetCountry();
	return mycountry == 1 ? 2 : 1;
}

UserModel.prototype.GetLevel = function () {
	return _.get(this.userInfo, 'level', 0);
}

UserModel.prototype.GetExp = function () {
	const Level = require('./Level');
	return Math.floor(_.get(this.userInfo, 'exp', 0) + Level.GetExpSpeed() * (TimeController.GetCurTime() - this.lastSyncTime));
}

UserModel.prototype.SetViplevel = function (level) {
	_.set(this, 'userInfo.viplevel', level);
}

UserModel.prototype.GetViplevel = function () {
	return _.get(this.userInfo, 'viplevel', 0);
}
//当前所在的地图(切换关卡会改变)
UserModel.prototype.GetMapid = function () {
	return _.get(this.userInfo, 'mapid', 10001)
}
UserModel.prototype.SetMaxMapId = function (mapid) {
	_.set(this, 'userInfo.max_mapid', mapid);
}
//已经解锁的最大地图ID
UserModel.prototype.GetMaxMapid = function () {
	return _.get(this.userInfo, 'max_mapid', 10002);
}
//已经去过的最大地图ID
UserModel.prototype.GetTopMapid = function () {
	return _.get(this.userInfo, 'top_mapid', 0);
}

UserModel.prototype.GetSeptname = function () {
	return _.get(this.userInfo, 'septname', '');
}

UserModel.prototype.GetSeptId = function () {
	return _.get(this.userInfo, 'septid', 0);
}

UserModel.prototype.GetSeptpostion = function () {
	return this.septPostion;
}

UserModel.prototype.IsSeptLeader = function () {
	return this.septPostion > 0;
}

UserModel.prototype.GetMoney = function () {
	return _.get(this.userInfo, 'money', '');
}

UserModel.prototype.GetGold = function () {
	return _.get(this.userInfo, 'gold', '');
}

UserModel.prototype.GetUserBaseInfo = function () {
	return this.userMainInfo.ba_info;
}

UserModel.prototype.GetUserMainInfo = function () {
	return this.userMainInfo;
}

UserModel.prototype.SetUserStrengthInfo = function (num, maxnum) {
	this.userStrengthInfo.num = num;
	this.userStrengthInfo.maxnum = maxnum;
}

UserModel.prototype.GetUserStrengthInfo = function () {
	return this.userStrengthInfo;
}

//获取升到下一级需要的经验
UserModel.prototype.GetLevelupExp = function () {
	let levelupDefine = this.levelupDefines[this.GetLevel()];
	return _.get(levelupDefine, 'exp', 0);
}
UserModel.prototype.IsMaxLevel = function () {
	let nextLevel = this.GetLevel() + 1;
	return this.levelupDefines[nextLevel] == null;
}

UserModel.prototype.GetUserOccupation = function () {   //获得自己角色职业
	let occupation = UserDefine.PROFESSION.PROFESSION_JIANSHI;
	if (this.userInfo) {
		if (this.userInfo.face >= 10 && this.userInfo.face < 20) {
			occupation = UserDefine.PROFESSION.PROFESSION_JIANSHI;
		} else if (this.userInfo.face >= 20 && this.userInfo.face < 30) {
			occupation = UserDefine.PROFESSION.PROFESSION_MOFASHI;
		} else if (this.userInfo.face >= 30 && this.userInfo.face < 40) {
			occupation = UserDefine.PROFESSION.PROFESSION_PAONIANG;
		}
	}
	return occupation;
}

UserModel.prototype.GetOccupation = function (face) {   //通过face获得角色职业
	let occupation = UserDefine.PROFESSION.PROFESSION_JIANSHI;
	if (face >= 10 && face < 20) {
		occupation = UserDefine.PROFESSION.PROFESSION_JIANSHI;
	} else if (face >= 20 && face < 30) {
		occupation = UserDefine.PROFESSION.PROFESSION_MOFASHI;
	} else if (face >= 30 && face < 40) {
		occupation = UserDefine.PROFESSION.PROFESSION_PAONIANG;
	}
	return occupation;
}

UserModel.prototype.GetProfessionIcon = function (occupation) {   //获得角色头像
	let iconName = "";
	if (occupation == UserDefine.PROFESSION.PROFESSION_JIANSHI) {
		iconName = "Image/Icon/HeadImage/zhucheng_img_touxiang2";
	} else if (occupation == UserDefine.PROFESSION.PROFESSION_MOFASHI) {
		iconName = "Image/Icon/HeadImage/zhucheng_img_touxiang4";
	} else if (occupation == UserDefine.PROFESSION.PROFESSION_PAONIANG) {
		iconName = "Image/Icon/HeadImage/zhucheng_img_touxiang6";
	}
	return iconName;
}

UserModel.prototype.GetJobIcon = function (occupation) {   //获得职业图标
	let iconName = "";
	if (occupation == UserDefine.PROFESSION.PROFESSION_JIANSHI) {
		iconName = "Image/Icon/CommonIcon/zhucheng_icon_zs";
	} else if (occupation == UserDefine.PROFESSION.PROFESSION_MOFASHI) {
		iconName = "Image/Icon/CommonIcon/zhucheng_icon_fs";
	} else if (occupation == UserDefine.PROFESSION.PROFESSION_PAONIANG) {
		iconName = "Image/Icon/CommonIcon/zhucheng_icon_gs";
	}
	return iconName;
}

UserModel.prototype.GetJobName = function (occupation) {   //获得职业名字
	let name = "";
	if (occupation == UserDefine.PROFESSION.PROFESSION_JIANSHI) {
		name = "大剑士";
	} else if (occupation == UserDefine.PROFESSION.PROFESSION_MOFASHI) {
		name = "魔导师";
	} else if (occupation == UserDefine.PROFESSION.PROFESSION_PAONIANG) {
		name = "炮娘";
	}
	return name;
}

UserModel.prototype.GetCountryName = function (countryId) {     //根据国家id找到国家名字
	let name = "";
	if (countryId == 1) {
		name = "火之国";
	} else {
		name = "冰之国";
	}
	return name;
}
UserModel.prototype.GetCountryShortName = function (countryId) { //根据国家id找到国家名字
	let name = "";
	if (countryId == 1) {
		name = "火";
	} else {
		name = "冰";
	}
	return name;
}
UserModel.prototype.GetCountryQueenName = function (countryId) { //根据国家id找到国家名字
	let name = "";
	if (countryId == 1) {
		name = "火焰女王";
	} else {
		name = "冰霜女王";
	}
	return name;
}

UserModel.prototype.GetCharacterByOccupation = function (occupation) {   //根据职业获得character文件夹下的名字
	let ret = "";
	if (occupation == UserDefine.PROFESSION.PROFESSION_JIANSHI) {
		ret = "nanzs";
	} else if (occupation == UserDefine.PROFESSION.PROFESSION_MOFASHI) {
		ret = "nvfs";
	} else if (occupation == UserDefine.PROFESSION.PROFESSION_PAONIANG) {
		ret = "nvgs";
	}
	return ret;
}

UserModel.prototype.GetPlayerSkeleton = function (occupation) {
	let skeleton = "";
	if (occupation == UserDefine.PROFESSION.PROFESSION_JIANSHI) {
		skeleton = "Animation/Npc/Jianke/Jianke";
	} else if (occupation == UserDefine.PROFESSION.PROFESSION_MOFASHI) {
		skeleton = "Animation/Npc/Yujie/Yujie";
	} else if (occupation == UserDefine.PROFESSION.PROFESSION_PAONIANG) {
		skeleton = "Animation/Npc/Paoniang/Paoniang";
	}
	return skeleton;
}


UserModel.prototype.GetMainProps = function (occupation) {      //根据职业获得主属性
	let pro = "";
	if (occupation == UserDefine.PROFESSION.PROFESSION_JIANSHI) {
		pro = "力量";
	} else if (occupation == UserDefine.PROFESSION.PROFESSION_MOFASHI) {
		pro = "智力";
	} else if (occupation == UserDefine.PROFESSION.PROFESSION_PAONIANG) {
		pro = "敏捷";
	}
	return pro;
}

UserModel.prototype.GetPlayerIcon = function (faceID) {
	let iconPath = ''
	let iconConfig = ConfigController.GetConfigById('touxiang_data', faceID);
	if (iconConfig) {
		iconPath = "Image/Icon/HeadImage/" + iconConfig.head;
	} else {
		iconPath = "Image/Icon/HeadImage/zhucheng_img_touxiang2";
	}
	return iconPath;
}

UserModel.prototype.GetLevelDesc = function (level) {
	let desc = '';
	let zslv = 200;
	if (level <= zslv) {
		desc = `${level}级`;
	} else {
		if (level % zslv == 0) {
			desc = `${(level / zslv) - 1}转${zslv}级`;
		} else {
			desc = `${Math.floor(level / zslv)}转${level % zslv}级`;
		}
	}
	return desc;
}

UserModel.prototype.GetVipValue = function (name) {
	let define = ConfigController.GetConfigById('vipreward_data', this.GetViplevel() + 1, 'level');
	return _.get(define, name, 0);
}

UserModel.prototype.GetmTitle = function () {
	return _.get(this.userInfo, 'mTitle', 0)
}

UserModel.prototype.GetOnlineImg = function (online) {
	let path = '';
	if (online == 1) {
		path = 'Image/UI/Common/zaixian_01';
	} else if (online == 2) {
		path = 'Image/UI/Common/zaixian_03';
	} else {
		path = 'Image/UI/Common/zaixian_02';
	}
	return path;
}

//过图是否达到limit要求
UserModel.prototype.boolThroughMap = function (index) {
	let topMapid = this.GetTopMapid();
	let needMapid = ConfigController.GetConfigById("levellimit_data", index).limit;
	return topMapid >= needMapid;
}

//解锁limit要求
UserModel.prototype.getUnlockById = function (index) {
	let topMapid = this.GetMaxMapid();
	let level = this.GetLevel();
	let config = ConfigController.GetConfigById("levellimit_data", index);
	if (config && config.limit) {
		return topMapid >= config.limit;
	} else if (config && config.levellimit) {
		return level >= config.levellimit;
	}
	return true;
}

UserModel.prototype.getUnlockDesById = function (index) {
	let config = ConfigController.GetConfigById("levellimit_data", index);
	if (config && config.content) {
		return config.content;
	}
	return "";
}

// -------------------userdata--------------------------
UserModel.prototype.setValueForKey = function(key, value){
	let Game = require('../Game');
	let charid = this.GetCharid();
	if(charid == null && charid != 0) {return;}
	// let userData = JSON.parse(cc.sys.localStorage.getItem(charid));
	let userData = JSON.parse(Game.Platform.GetStorage(charid));
	if(userData == null){
		userData = {};
		_.set(userData, key, value);
	}else{
		let ukey = _.get(userData, key, 0);
		if(ukey && ukey == value){
			return;
		}else{
			_.set(userData, key, value);
		}
	}
	// cc.sys.localStorage.setItem(charid, JSON.stringify(userData));
    Game.Platform.SetStorage(charid, JSON.stringify(userData));
}
UserModel.prototype.getValueForKey = function(key) {
	let Game = require('../Game');
	let charid = this.GetCharid();
	if(charid == null && charid != 0) {return;}

	// let userData = JSON.parse(cc.sys.localStorage.getItem(charid));
	let userData = JSON.parse(Game.Platform.GetStorage(charid));
	if(userData == null){return null;}

	let ukey = _.get(userData, key);
	return ukey;
	
}
// --------------------userdata--------------------------

//====================  消息处理接口  ====================
UserModel.prototype.onUserMainData = function (msgid, data) {
	let oldLevel = _.get(this.userInfo, 'level', 0);
	let newLevel = _.get(data, 'level', 0);
	this.userInfo = data;
	this.lastSyncTime = TimeController.GetCurTime();
	NotificationController.Emit(Define.EVENT_KEY.USERINFO_REFRESH);
	if(newLevel > oldLevel){
		NotificationController.Emit(Define.EVENT_KEY.OBJECTS_REFRESH);
	};
}

UserModel.prototype.onRetUserMainInfo = function (msgid, data) {
	let newPower = _.get(data, 'fightval', 0);
	let oldPower = _.get(this, 'userMainInfo.fightval', 0);
	this.userMainInfo = data;
	NotificationController.Emit(Define.EVENT_KEY.USERBASEINFO_REFRESH);
	NotificationController.Emit(Define.EVENT_KEY.FIGHTVAL_REFRESH);
	if (oldPower != 0) {
		NotificationController.Emit(Define.EVENT_KEY.TIP_POWERCHANGE, { newPower: newPower, oldPower: oldPower });
	}
}

UserModel.prototype.onUserStrength = function (msgid, data) {
	this.SetUserStrengthInfo(data.num, data.maxnum);
	NotificationController.Emit(Define.EVENT_KEY.STRENGTH_REFRESH);
}

UserModel.prototype.onGW2C_RetLogin = function (msgid, data) {
	if (data.errcode != null) {
		NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, data.errcode);
	}
}
UserModel.prototype.onNotifyExp = function (msgid, data) {
	_.set(this, 'userInfo.exp', data.exp);
	this.lastSyncTime = TimeController.GetCurTime();
}
UserModel.prototype.onRetNewFightInfo = function (msgid, data) {
	_.set(this, 'userInfo.exp', data.exp);
	this.lastSyncTime = TimeController.GetCurTime();
}
//称号信息
UserModel.prototype.onRetTitleShow = function (msgid, data) {
	_.set(this, 'userInfo.mTitle', data.title);
}
//标签信息
UserModel.prototype.reqPersonalTagInfo = function (msgid, data) {
	_.set(this, 'userInfo.mTagInfo', data);
}

UserModel.prototype.onLevelupResult = function (msgid, data) {
	let Game = require('../Game');
    Game.Platform.SetTDEventData(Define.TD_EVENT.EventPlayerLevel,{level:data.level, charid:this.GetCharid()});
	NotificationController.Emit(Define.EVENT_KEY.TIP_LEVELUP, data.level);
}

UserModel.prototype.onRetObserveInfo = function (msgid, data) {
	ViewController.OpenView(UIName.UI_OBSERVATIONPLAYER, 'ViewLayer', data);
}

//pvp排名
UserModel.prototype.setPVPSort = function (sort) {
	this.pvp_sort = sort;
}
UserModel.prototype.getPVPSort = function () {
	return this.pvp_sort;
}
UserModel.prototype.setTargetTaskRed = function (isFinish) {
	this.targetTaskIsfinish = isFinish;
}
UserModel.prototype.getTargetTaskRed = function () {
	return this.targetTaskIsfinish;
}
UserModel.prototype.onSynLevelTask = function (msgid, msg) {
	this.targetTaskId = msg.taskid || 0;
}
UserModel.prototype.onNotifyVipExp = function (msgid, data) {
	this.SetViplevel(data.viplevel || 0);
}

UserModel.prototype.onFightFuncRed = function(msgid,data){
	this.battle_red = data;
	const GuideController = require('../Controller/GuideController');
	this.battle_red.pvpred = this.battle_red.pvpred && GuideController.IsFunctionOpen(1);
	this.battle_red.bossred = this.battle_red.bossred && GuideController.IsFunctionOpen(33);
	this.battle_red.borderred = this.battle_red.borderred && GuideController.IsFunctionOpen(77);
	this.battle_red.septfightred = this.battle_red.septfightred && GuideController.IsFunctionOpen(50);
	NotificationController.Emit(Define.EVENT_KEY.BATTLE_RED);
}

//观察某个玩家（可以是自己）
UserModel.prototype.observePlayer = function(charid){
	if(charid == this.GetCharid()){
		NotificationController.Emit(Define.EVENT_KEY.CHANGE_MAINPAGE, Define.MAINPAGESTATE.Page_Equip);
	}
	else{
		var msg = {
            charid: charid,
        }
        NetWorkController.SendProto('msg.ObserveUserInfo',msg);
	}
}

UserModel.prototype.getNotice = function(){
	cc.log('拉取公告列表：000');
	var url = 'http://bhdl-notice.giantfun.cn/notice-llgj/notice.json';
	switch(ServerUtil.channel){
		case Define.Channel_Type.DianYou:{
			url = 'http://bhdl-notice.giantfun.cn/notice-llgj/notice.json';
			break;
		}
		case Define.Channel_Type.DianYou_Ios_GaungMing:{
			url = 'http://bhdl-notice.giantfun.cn/notice-gmsn/notice.json';
			break;
		}
	}
	var xhr = new XMLHttpRequest();
	xhr.open('GET',url,true);
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 && xhr.status == 200){
			var noticeObj = JSON.parse(xhr.response);
			var oldVersion = this.notice && this.notice.version;
			var newVersion = noticeObj.version;
			if(oldVersion != newVersion){
				//亮红点
				this.newnotice = true;
				NotificationController.Emit(Define.EVENT_KEY.NEW_NOTICE);
			}
			this.notice = noticeObj;
		}
	}.bind(this);
	xhr.send();
}

module.exports = new UserModel();