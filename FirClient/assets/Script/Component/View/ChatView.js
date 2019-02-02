// ChatView.js
const Game = require('../../Game');

const ChatChannel = {
	TABLE_ALL: 1,
	TABLE_WORLD: 2,
	TABLE_COUNTRY: 3,
	TABLE_UNION: 4,
	TABLE_BLESSING: 5,
	TABLE_PRIVATE: 6,
}


cc.Class({
    extends: cc.GameComponent,

    properties: {
    	tableView:{default:null,type:cc.tableView},
    	menu_Node:{default:[],type:[cc.Node]},
    	menu_tableView:{default:null,type:cc.tableView},
    	node_menu_tableview:{default: null, type: cc.Node},
    	lab_title:{default: null, type: cc.Label_},
    	Label_input: { default: null, type: cc.EditBox },
    	// 公会
    	btn_union:{default:null, type:cc.Node},

    	node_private_dot:{default:null, type:cc.Node},
    	
    	chatBtn:{default:null, type:cc.Node},
    	node_chatBtn_dot:{default:null, type:cc.Node},
    },
    onLoad() {

    },
    onEnable() {
        this.initView();
        this.initNotification();
    },

    onDisable() {
    	this.removeNotification();
    },

    initNotification() {
    	Game.NotificationController.On(Game.Define.EVENT_KEY.CHAT_RET_CHAT_DATA_TO_USER,this,this.refreshView);
    	Game.NotificationController.On(Game.Define.EVENT_KEY.CHAT_RET_CHAT_USER_ONLINE,this,this.refreshOnlineUser);
    	Game.NotificationController.On(Game.Define.EVENT_KEY.CHAT_VIEW_CLOSE,this,this.closeChatView);
    	Game.NotificationController.On(Game.Define.EVENT_KEY.CHAT_VIEW_OPEN,this,this.openChatView);
    	Game.NotificationController.On(Game.Define.EVENT_KEY.CHAT_VIEW_OPEN_PRIVATE,this,this.openPrivateChatView);
    	Game.NotificationController.On(Game.Define.EVENT_KEY.CHAT_VIEW_ONTOUCH_CHAT,this,this.onTouchOpenChat);
    	Game.NotificationController.On(Game.Define.EVENT_KEY.CHAT_VIEW_CHAT_HIDE,this,this.onHideChatBtn);
		Game.NotificationController.On(Game.Define.EVENT_KEY.CHAT_VIEW_PRIVATE_RED_DOT,this,this.setRedDot);
		Game.NotificationController.On(Game.Define.EVENT_KEY.CHAT_VIEW_CLOSEATONCE,this,this.closeAtOnce);
    },
    removeNotification() {
    	Game.NotificationController.Off(Game.Define.EVENT_KEY.CHAT_RET_CHAT_DATA_TO_USER,this,this.refreshView);
    	Game.NotificationController.Off(Game.Define.EVENT_KEY.CHAT_RET_CHAT_USER_ONLINE,this,this.refreshOnlineUser);
    	Game.NotificationController.Off(Game.Define.EVENT_KEY.CHAT_VIEW_CLOSE,this,this.closeChatView);
    	Game.NotificationController.Off(Game.Define.EVENT_KEY.CHAT_VIEW_OPEN,this,this.openChatView);
    	Game.NotificationController.Off(Game.Define.EVENT_KEY.CHAT_VIEW_OPEN_PRIVATE,this,this.openPrivateChatView);
    	Game.NotificationController.Off(Game.Define.EVENT_KEY.CHAT_VIEW_ONTOUCH_CHAT,this,this.onTouchOpenChat);
    	Game.NotificationController.Off(Game.Define.EVENT_KEY.CHAT_VIEW_CHAT_HIDE,this,this.onHideChatBtn);
		Game.NotificationController.Off(Game.Define.EVENT_KEY.CHAT_VIEW_PRIVATE_RED_DOT,this,this.setRedDot);
		Game.NotificationController.Off(Game.Define.EVENT_KEY.CHAT_VIEW_CLOSEATONCE,this,this.closeAtOnce);
		

	},
	initView() {
		this._channel = ChatChannel.TABLE_ALL;
		this._privateCharId = 0;
		// this._sending = false;
		this._lessTime = 0;

		this._open = false;
		Game.GlobalModel.chatViewIsOpen = false;
		this.updateView();
		// this.closeChatView();
	},
	refreshView(data) {
		// && this._channel != ChatChannel.TABLE_PRIVATE
		if(data && data.dwType == Game.Define.Enum_enumChatType.CHAT_TYPE_PRIVATE){
			Game.ChatModel.SetPrivateRedDot(true);
		}
		// if(this._open){
			this.showChatListByChannel();
			this.setDetail(true);
		// }
	},
	refreshOnlineUser(data){
		if(data){
			for (var i = 0; i < data.list.length; i++) {
				data.list[i].select = false;
				if(data.list[i].name == ""){
					var info = Game.ChatModel.GetChatInfoByCharID(data.list[i].charid);
					if(info){
						data.list[i].name = info.name;
					}
				}
			}
			if(this._channel == ChatChannel.TABLE_PRIVATE && this._privateCharId > 0){
				var index = Game._.findIndex(data.list,{charid:this._privateCharId});
				if(index >= 0){
					data.list[index].select = true;
				}
			}
			this.reloadMenuTableView(data.list);
		}
	},	
	updateView() {
    	this.setTableSelect();
    	this.showChatListByChannel();
    	this.setDetail(false);
    },
    setTableSelect(){
    	var gap = 71;
    	var selectGap = 420;
    	var x = 0;
		var y = 0;
    	for (var i = 0; i < this.menu_Node.length; i++) {
    		this.menu_Node[i].active = true;
    		if((i+1) == ChatChannel.TABLE_BLESSING && !Game.UserModel.getUnlockById(Game.Define.Unlock_Type.TYPE_CHAT_BLESS)){
    			this.menu_Node[i].active = false;
    			continue;
    		}

    		this.menu_Node[i].setPosition(cc.p(x,y));
    		var nodeSeled = this.menu_Node[i].getChildByName('Sprite_');
    		var nodeArrow = this.menu_Node[i].getChildByName('Sprite_arrrow');
    		nodeArrow.rotation = 0;
    		var labT = this.menu_Node[i].getChildByName('Label_');
    		var labH = this.menu_Node[i].getChildByName('LabelH_');
    		nodeSeled.active = false;
    		labT.active = true;
    		labH.active = false;
    		if(this._channel == (i+1)){
    			nodeSeled.active = true;
    			nodeArrow.rotation = 90;
    			labT.active = false;
    			labH.active = true;
    			this.node_menu_tableview.setPositionY(y-gap);
    			y = y-selectGap;
    		}
    		y = y-gap;
    	}
    },
    reloadMenuTableView(list){
    	var callback = function (data) {
            this.onTouchPlayerCallBack(data, this);
        }.bind(this);
    	this.menu_tableView.initTableView(list.length, { array:list, target:this,callback : callback});
		if(!this._open){
			this.actionEndCallBack();
		}
    },
    onTouchPlayerCallBack(data){
    	if(data == null || data.charid == Game.UserModel.GetCharid()){return;}

    	// 他跳转到私聊
    	// if(this._channel == ChatChannel.TABLE_PRIVATE){
    	// 	Game.ChatModel.addPrivateChatUser(data);
    	// 	this.channel = ChatChannel.TABLE_PRIVATE;
    	// 	this._privateCharId = data.charid;
    	// 	this.updateView();
    	// }else{
    		
    	// }
    	this._channel = ChatChannel.TABLE_PRIVATE;
		Game.ChatModel.addPrivateChatUser(data);
		this._privateCharId = data.charid;
		this.updateView();
    },

    setDetail(isReload) {
    	// 聊天内容
    	let list = []; 
    	switch(parseInt(this._channel)){
    		case ChatChannel.TABLE_ALL:
    			// cc.log('_chatList = ', Game.ChatModel._chatList);
    			list.push.apply(list,Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_WORLD));
				list.push.apply(list,Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_COUNTRY));
				list.push.apply(list,Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_SEPT));
				// list.push.apply(list,Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_BLESS));
				 if(Game.UserModel.getUnlockById(Game.Define.Unlock_Type.TYPE_CHAT_BLESS)){
                    list.push.apply(list,Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_BLESS));
                }
	        	this.refrehDetailTableView(list,isReload);
    			break;
    		case ChatChannel.TABLE_WORLD:
			    list = Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_WORLD);
	        	this.refrehDetailTableView(list,isReload);
    			break;
			case ChatChannel.TABLE_COUNTRY:
				list = Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_COUNTRY);
				this.refrehDetailTableView(list, isReload);
				break;
			case ChatChannel.TABLE_UNION:

				list = Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_SEPT);
				this.refrehDetailTableView(list, isReload);
				break;
			case ChatChannel.TABLE_BLESSING:
				list = Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_BLESS);
				this.refrehDetailTableView(list, isReload);
				break;
			case ChatChannel.TABLE_PRIVATE:
				// cc.log("this._privateCharId = ",this._privateCharId);
				if(this._privateCharId != 0){
					list = Game.ChatModel.GetChatListByUser(this._privateCharId);
				}
				this.refrehDetailTableView(list, isReload);
				break;
		}
		// 私聊频道处理
		// var listPri = Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_PRIVATE);
		// for (var i = 0; i < listPri.length; i++) {
		// 	// listPri[i]

		// }

	},
	setRedDot(){
		this.node_private_dot.active = Game.ChatModel.GetPrivateRedDot();
		this.node_chatBtn_dot.active = Game.ChatModel.GetPrivateRedDot();
	},

	refrehDetailTableView(list,isRelod) {
		list = Game._.sortBy(list, function (info) {
			return info.dwChatTime;
		});
		var callback = function (data) {
            this.onTouchChatCellCallBack(data, this);
        }.bind(this);
		if (isRelod) {
			this.tableView.reloadTableView(list.length, { array: list, target: this ,callback : callback}, true);	
		} else {
			this.tableView.initTableView(list.length, { array: list, target: this ,callback : callback});
		}
		// this.scheduleOnce(function(){
		if(list.length >= 6){
			this.tableView.scrollToBottom();
		}
		if(!this._open){
			this.actionEndCallBack();
		}
		// },0.2);	
		
	},
	onTouchChatCellCallBack(data){
		if(data){
			if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_JIJIE){
				 Game.JijieModel.joinJijie(data.toID);
			}else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_BLESS){
					Game.BlessModel.reqBlessCommon(data.face,data.toID,data.dwFromID);
		            this.closeChatView();
				// }
			}else if (data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_GUARD) {
				// 公会运镖

			}else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_BORDER){
			


			}else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_CREATESEPT){
				// 建立公会
				if(Game.GuideController.IsFunctionOpen(71)){
                    Game.NetWorkController.SendProto('msg.applyJoinSept', {
                        septid: data.toID,
                    });
                }else{
                    let lConfig = Game.ConfigController.GetConfigById('levellimit_data', 71);
                    Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, lConfig.content);
                }
			}else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_BORDERTEAM){
				// Game.NetWorkController.SendProto('borderteam.reqJoinTeam', {
    //                     teamid: data.toID,
    //             });
    			this.openView(Game.UIName.UI_DEFENBORDER)
    			this.closeChatView();
			}
		}
	},
	showChatListByChannel() {
		this.btn_union.active = false;
		switch (parseInt(this._channel)) {
			case ChatChannel.TABLE_ALL:
				this.lab_title.setText("全部");
				var msg = {};
				msg.type = 1;
				msg.ids = [];
				var list = [];
				list.push.apply(list,Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_WORLD));
				list.push.apply(list,Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_COUNTRY));
				if(list){
					for (var i = 0; i < list.length; i++) {
						var index = Game._.findIndex(msg.ids, function(num){
							return num == list[i].dwFromID;});
						if (index == -1 && list[i].dwFromID > 0 && list[i].dwFromID != Game.UserModel.GetCharid()) {
							msg.ids.push(list[i].dwFromID);
						}
					}
				}
				Game.NetWorkController.SendProto('msg.ReqChatUserOnline', msg);
				break;

			case ChatChannel.TABLE_WORLD:
				this.lab_title.setText("世界频道");
				var msg = {};
				msg.type = 1;
				msg.ids = [];
				var list = [];
				list = Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_WORLD);
				if(list){
					for (var i = 0; i < list.length; i++) {
						var index = Game._.findIndex(msg.ids, function(num){
							return num == list[i].dwFromID;});
						if (index == -1 && list[i].dwFromID > 0 && list[i].dwFromID != Game.UserModel.GetCharid()) {
							msg.ids.push(list[i].dwFromID);
						}
					}
				}
				Game.NetWorkController.SendProto('msg.ReqChatUserOnline', msg);
				break;
			case ChatChannel.TABLE_COUNTRY:
				this.lab_title.setText("国家频道");
				var msg = {};
				msg.type = 2;
				msg.ids = [];
				var list = [];
				list = Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_COUNTRY);
				for (var i = 0; i < list.length; i++) {
					var index = Game._.findIndex(msg.ids, function(num){
							return num == list[i].dwFromID;});
					if (index == -1 && list[i].dwFromID > 0 && list[i].dwFromID != Game.UserModel.GetCharid()) {
							msg.ids.push(list[i].dwFromID);
					}
				}
				Game.NetWorkController.SendProto('msg.ReqChatUserOnline', msg);
				break;
			case ChatChannel.TABLE_UNION:
				// Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "暂未开放");
				// return;
				this.lab_title.setText("公会聊天");
				// var septid = Game.UserModel.GetSeptId();
				if (Game.UserModel.GetSeptname() != ''){
					// 有公会
					this.btn_union.active = false;
				} else {
					this.btn_union.active = true;
				}
				Game.NetWorkController.SendProto('reqSeptMemberList', { septid: 0 });
				break;
			case ChatChannel.TABLE_BLESSING:
				// Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "敬请期待");
				// return;
				this.lab_title.setText("祝福频道");
				Game.NetWorkController.SendProto('reqUserRelation', { type: 1 });
				Game.NetWorkController.SendProto('reqSeptMemberList', { septid: 0 });
				break;
			case ChatChannel.TABLE_PRIVATE:
				if(this._open){
					Game.ChatModel.SetPrivateRedDot(false);
				}

				if(this._privateCharId > 0){
					var info = Game.ChatModel.GetChatInfoByCharID(this._privateCharId);
					this.lab_title.setText(info ? info.name : "");
				}
				var msg = {};
				msg.type = 3;
				msg.ids = [];
				

				var listPri = Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_PRIVATE);
				for (var i = 0; i < listPri.length; i++) {
					var info = {};
					info.charid = listPri[i].dwFromID;
					info.name = listPri[i].pstrName;
					Game.ChatModel.addPrivateChatUser(info);
				}
				var list = [];
				list = Game.ChatModel.GetPrivateChatUserInfo();
				for (var i = 0; i < list.length; i++) {
					var index = Game._.findIndex(msg.ids, function(num){
							return num == list[i].charid;});
					// cc.log("list[i].charid = ",list[i].charid);
					// cc.log("Game.UserModel.GetCharid() = ",Game.UserModel.GetCharid());
					if (index == -1 && list[i].charid > 0 && list[i].charid != Game.UserModel.GetCharid()) {
						msg.ids.push(list[i].charid);
					}
				}
		  		Game.NetWorkController.SendProto('msg.ReqChatUserOnline',msg);
    			break;
    	}
    },

    addUpdate(time){
        this.stopUpdate();
        if(time != 0){
            this._lessTime = parseInt(time);
            this._perValue = 1;

            this._scheduleCallback = function() {
                   this.onframe();
            }
            this.schedule(this._scheduleCallback,1);
        }else{
        	this._lessTime = 0;
        }
       
    },
    onframe() {
        this._lessTime = this._lessTime - this._perValue;
        if(this._lessTime <= 0){
            this._lessTime = 0;
            this.stopUpdate();
        }
    },
    stopUpdate(){
        if (this._scheduleCallback){
             this.unschedule(this._scheduleCallback);
             this._scheduleCallback = null;
        }
    },

    onTouchMenuTable(event,tab){
    	if(this._channel != tab){
    		this._channel = tab;
    		this.reloadMenuTableView([]);
    		this.updateView();
    	}
    },
    sendMsg(){
    	var content = this.Label_input.string;
    	
    	if(Game.ChatModel.isGMCmd(content)){
    		Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "隐藏功能已开启！");
    		return;
    	}

    	if(content.length == 0){
    		Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "请输入聊天内容！");
    		return;
    	}
    	if(this._channel == ChatChannel.TABLE_BLESSING){
    		Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "祝福频道不能发送消息！");
    		return;
    	}
    	// 间隔时间 this._sending
    	if(this._lessTime > 0){
    		Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, Math.ceil(this._lessTime) + "秒后才能发言哦！");
    		return;
    	}

    	if(this._channel == ChatChannel.TABLE_UNION && Game.UserModel.GetSeptId() <= 0){
    		Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "请先加入公会！");
    		return;
    	}
    	if (this._channel == ChatChannel.TABLE_PRIVATE && this._privateCharId <= 0) {
    		Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "请选择聊天对象！");
    		return;
		}
		
		//首充后解锁聊天功能

		if(Game.ActiveModel.msg_firstrecharge.getstatus == 1){
			Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "首充后解锁聊天功能！");
			return;
		}

		var msg = {};
		var channel = Game.Define.Enum_enumChatType.CHAT_TYPE_WORLD;
		if(this._channel == ChatChannel.TABLE_PRIVATE){
			channel = Game.Define.Enum_enumChatType.CHAT_TYPE_PRIVATE;
		}else if(this._channel == ChatChannel.TABLE_COUNTRY){
			channel = Game.Define.Enum_enumChatType.CHAT_TYPE_COUNTRY;
		}else if(this._channel == ChatChannel.TABLE_UNION){
			channel = Game.Define.Enum_enumChatType.CHAT_TYPE_SEPT;
		}
		msg.dwType = channel;
		msg.dwChatTime = Game.TimeController.GetCurTime()
		msg.isvoice = 0;
		msg.dwFromID = Game.UserModel.GetCharid();
		msg.pstrName = Game.UserModel.GetUserName();
		msg.pstrChat = content;
		msg.country = Game.UserModel.GetCountry();
		if (channel == Game.Define.Enum_enumChatType.CHAT_TYPE_PRIVATE && this._privateCharId > 0) {
			msg.toID = this._privateCharId;
			var info = Game.ChatModel.GetChatInfoByCharID(this._privateCharId);
			msg.toName = info ? info.name : "";
		}
		// msg.face = 1;
		// msg.septName = "0";
		// msg.voiceID = "0";
		// msg.isvoice = 0;
		// msg.voicetime = 0;
		// msg.issysinfo = 0;
		// msg.autoVoice = 0;
		// msg.isCRandV = 0;
		// msg.sysInfoType = 0;
		// msg.flowerdeedtime = 0;
		// msg.over = 0;
		// msg.issept = 0;
		// msg.title = 0;
		// ceshi
		msg.charHigh = 100;
		msg.level = 0;
		// cc.log("msg = ",msg);
		Game.ChatModel.SendChatMsg(msg);
		// this._sending = true;
		this.Label_input.string = "";
		this.addUpdate(6);
		// this.scheduleOnce(function(){
		// 	this._sending = false;
		// },5);
	},
	onTouchSend() {
		this.sendMsg();
	},

	onTouchJoinUnion(){
		// 打开公会界面
		this.openView(Game.UIName.UI_SEPTJOINVIEW);
        this.closeChatView();
	},
	onTouchUserInformat(){
		// 观察

	},
	onTouchOpenChat() {
		this._open = !this._open;
		Game.GlobalModel.chatViewIsOpen = this._open;
    	this.refreshChatView();
    },
    refreshChatView(){
    	// cc.log(" refreshChatView");
    	if(this._open){
          	this.node.runAction(cc.sequence(cc.moveTo(0.3, 0, this.node.getPositionY()),cc.callFunc(this.actionApperCallBack, this)));
    	}else{
    		this.node.runAction(cc.sequence(cc.moveTo(0.3, -this.node.width, this.node.getPositionY()),cc.callFunc(this.actionEndCallBack, this)));
    	}
    },
    closeChatView(){
    	// cc.log(" closeChatView");
		this._open = false;
		Game.GlobalModel.chatViewIsOpen = false;
    	this.node.runAction(cc.sequence(cc.moveTo(0.3, -this.node.width, this.node.getPositionY()),cc.callFunc(this.actionEndCallBack, this)));
	},
	closeAtOnce(){
		if(!this._open){
			Game.GlobalModel.chatViewIsOpen = false;
			this.node.setPosition(cc.p(-this.node.width,this.node.getPositionY()));
			cc.log('chatview: close at once');
		}
	},
    openChatView(index){
		this._open = true;
		Game.GlobalModel.chatViewIsOpen = true;
    	var tab = index ? index : this._channel;
    	// if(this._channel != tab){
    		this.onTouchMenuTable(null,tab);
    	// }
    	this.node.runAction(cc.sequence(cc.moveTo(0.3, 0, this.node.getPositionY()),cc.callFunc(this.actionApperCallBack, this)));
    },
    openPrivateChatView(data){
		this._open = true;
		Game.GlobalModel.chatViewIsOpen = true;
    	this.onTouchPlayerCallBack(data);
    	this.node.runAction(cc.sequence(cc.moveTo(0.3, 0, this.node.getPositionY()),cc.callFunc(this.actionApperCallBack, this)));
    },

    actionEndCallBack(){
    	// cc.log("this.node.width2 = "+this.node.width);
    	// cc.log(" actionEndCallBack");
        // this.node.stopAllActions();
        this.node.setPosition(cc.p(-this.node.width,this.node.getPositionY()));
        // this.node.getComponent(cc.Widget).left = -720;
        // this.node.getComponent(cc.Widget).right = 720;
    },
    actionApperCallBack(){
    	// cc.log(" actionApperCallBack");
        // this.node.stopAllActions();
        // this.node.getComponent(cc.Widget).left = 0;
        // this.node.getComponent(cc.Widget).right = 0;
        this.node.setPosition(cc.p(0,this.node.getPositionY()));
        
        // this.updateView();

    },
    onHideChatBtn(bool){
    	this.chatBtn.active = bool;
    },

});