// Chat.jsretChatDataToUser
const _ = require('lodash');
const NetWorkController = require('../Controller/NetWorkController');
const Tools = require('../Util/Tools');
const Define = require('../Util/Define');
const CppCmd = require('../Util/CppCmd');
const NotificationController = require('../Controller/NotificationController');
const FairyModel = require('./Fairy');
const ViewController = require('../Controller/ViewController');
const UIName = require('../Util/UIName');
const UserModel = require('./User');

var ChatModel = function () {
	this._chatList = [];
	this._privateChatUserInfos = [];

	this._privateRedDot = false;
}

ChatModel.prototype.Init = function (cb) {
	NetWorkController.AddListener('msg.retChatDataToUser', this, this.onRetChatDataToUser);
	NetWorkController.AddBinaryListener(Define.MSG_ID.stChannelChatUserCmd, this, this.onChannelChatUserCmd);
	NetWorkController.AddListener('msg.RetChatUserOnline',this, this.onRetChatUserOnline);

    Tools.InvokeCallback(cb, null);

    this.isChatGmCmd=false;
    //open this.isChatGmCmd=true;
}

/**
 * 对外接口
 */
ChatModel.prototype.GetChatInfo = function () {
    return this.chatInfo;
}

ChatModel.prototype.GetChatListByChannel = function(channel) {
	// let info = _.find(this._chatList,{type : channel});
	return this._chatList[channel] || [];
}

ChatModel.prototype.GetChatListByUser = function(charId) {
	var chatList = this.GetChatListByChannel(Define.Enum_enumChatType.CHAT_TYPE_PRIVATE);
	var list = [];
	if(chatList){
		for (var i = 0; i < chatList.length; i++) {
			if(chatList[i].dwFromID == charId || chatList[i].toID == charId){
				list.push(chatList[i]);
			}
		}
	}
	return list;
}

ChatModel.prototype.GetPrivateChatUserInfo = function() {
	return this._privateChatUserInfos;
}
ChatModel.prototype.GetChatInfoByCharID = function(id) {
	return _.find(this._privateChatUserInfos,{charid:id});
}

ChatModel.prototype.addPrivateChatUser = function(info) {
	var index = _.findIndex(this._privateChatUserInfos,{charid:info.charid})   
	if (index == -1) {
		this._privateChatUserInfos.push(info);
	} else {
		this._privateChatUserInfos[index] = info;
	}
},
ChatModel.prototype.removePrivateChatUser = function(id) {
	var index = _.findIndex(this._privateChatUserInfos,{charid:id})
	if (index != -1) {
		this._privateChatUserInfos.splice(this._privateChatUserInfos[index],1);	
	}
}

ChatModel.prototype.addChatToList = function(t, channel){
	if(this._chatList[channel] == null){
		this._chatList[channel] = [];
	}
	if(this._chatList[channel].length >= 100){
		this._chatList[channel].splice(list[0],1);
	}
	this._chatList[channel].push(t);
}
ChatModel.prototype.isGMCmd = function(content) {
	if(this.isChatGmCmd == false){return false;}
	if(content === "/all open FairyView"){
		FairyModel.setGM(true);
		return true;
	}else if(content === "/all close FairyView"){
		FairyModel.setGM(false);
		return true;
	}else if(content === "/gm opengm"){
		ViewController.OpenView(UIName.UI_GMVIEW,"MaskLayer");
		return true;
	}
	return false;
}
ChatModel.prototype.SetPrivateRedDot = function(bool) {
	this._privateRedDot = bool;
	NotificationController.Emit(Define.EVENT_KEY.CHAT_VIEW_PRIVATE_RED_DOT);
}
ChatModel.prototype.GetPrivateRedDot = function() {
	return this._privateRedDot;
}
ChatModel.prototype.GetChatCellBgImg = function(id) {
	let img = 'Image/UI/MainScene/image_popbieren';
	if(UserModel.GetCharid() == id){
		img = 'Image/UI/MainScene/image_popziji';
	}else if(id == "icon_xitong"){
		img = 'Image/UI/MainScene/image_popxitong';
	}
	return img;
}

// ------------------------------------------------------------------------


ChatModel.prototype.getTitleImg = function(titleId){
	if (titleId == Define.Enum_Titles.TITLE_GUOWANG){
		return "guanyuan_01.png";
	}else if(titleId == Define.Enum_Titles.TITLE_YUANSHUAI){
		return "guanyuan_03.png";
	}else if(titleId == Define.Enum_Titles.TITLE_ZAIXIANG){
		return "guanyuan_02.png";
	// }else if(titleId == Define.Enum_Titles.TITLE_BUTOU){
	// 	return "guanyuan_05.png";
	// }else if(titleId == Define.Enum_Titles.TITLE_DAFU){
	// 	return "guanyuan_04.png";
	}else if(titleId == Define.Enum_Titles.TITLE_ZUZHANG){
		return "ch_zuzhang.png";
	}else if(titleId == Define.Enum_Titles.TITLE_FUREN){
		return "ch_zuzhangfuren.png";
	}else if(titleId == Define.Enum_Titles.TITLE_FUZUZHANG){
		return "ch_fuzuzhang.png";
	// }else if(titleId == Define.Enum_Titles.TITLE_ZUCAO){
	// 	return "ch_zucao.png";
	}else if(titleId == Define.Enum_Titles.TITLE_ZUHUA){
		return "ch_zuhua.png";
	// }else if(titleId == Define.Enum_Titles.TITLE_LAODAO){
	// 	return "ch_hualao.png";
	}else if(titleId == Define.Enum_Titles.TITLE_HUGUO){
		return "ch_huguoyingxiong.png";
	}else if(titleId == Define.Enum_Titles.TITLE_BANZHUAN){
		return "ch_banzhuanwang.png";
	// }else if(titleId == Define.Enum_Titles.TITLE_CITAN){
	// 	return "ch_citanwang.png";
	// }else if(titleId == Define.Enum_Titles.TITLE_BIAOCHE){
	// 	return "ch_biaochewang.png";
	}else if(titleId == Define.Enum_Titles.TITLE_ZHENGTUBABY){
		return "ch_zhengtubaby.png";
	}else if(titleId == Define.Enum_Titles.TITLE_RENQIBABY){
		return "ch_renqibaby.png";
	}else if(titleId == Define.Enum_Titles.TITLE_MEILIBABY){
		return "ch_meilibaby.png";
	}else if(titleId == Define.Enum_Titles.TITLE_XIANHUABABY){
		return "ch_xianhuababy.png";
	}else if(titleId == Define.Enum_Titles.TITLE_HUHUAHERO){
		return "ch_huhuayingxiong.png";
	}else if(titleId == Define.Enum_Titles.TITLE_HUHUAKNIGHT){
		return "ch_huhuaqishi.png";
	}else if(titleId == Define.Enum_Titles.TITLE_HUHUAMAN){
		return "ch_huhuashizhe.png";
	}else if(titleId == Define.Enum_Titles.TITLE_TASKMGR){
		return "guanyuan_fabu.png";
	}
	return "";
}

// -------------------------------------------------------------------------
ChatModel.prototype.SendChatMsg = function (t){
	var msg = CppCmd.NewChannelChatUserCmd(t);
	 NetWorkController.SendBinary(msg, 'NewChannelChatUserCmd');
}
/**
 * 消息处理接口
 */
ChatModel.prototype.onRetChatDataToUser = function(msgid,data){
	var list = data.list;
	for (var i = 0; i < list.length; i++) {
		this.addChatToList(list[i],list[i].dwType);
	}
	// this.chatInfo.push(data);
	NotificationController.Emit(Define.EVENT_KEY.CHAT_RET_CHAT_DATA_TO_USER);
}
ChatModel.prototype.onChannelChatUserCmd = function(buffer){
	var result = CppCmd.ParseChannelChatUserCmd(buffer);

	this.addChatToList(result,result.dwType);
	// NotificationController.Emit(Define.EVENT_KEY.CHAT_CHANNEL_CHAT_USER_CMD,result);
	NotificationController.Emit(Define.EVENT_KEY.CHAT_RET_CHAT_DATA_TO_USER,result);
}
ChatModel.prototype.onRetChatUserOnline = function(msgid, data){

	// 	optional uint64 charid  = 1;
 	//  optional string name    = 2;
	//  optional uint32	online	= 3;	//0:离线 1:在线 2:今日登陆过，当前不在线
	//  optional uint32 country	= 4;
	//  optional uint32 titleshow= 5;
	// cc.log("data = ",data);
	NotificationController.Emit(Define.EVENT_KEY.CHAT_RET_CHAT_USER_ONLINE,data);

}

module.exports = new ChatModel();