// LevelChatView.js
const Game = require('../../Game');

const ChatChannel = {
    TABLE_ALL: 1,
	TABLE_WORLD: 2,
	TABLE_COUNTRY: 3,
	TABLE_UNION: 4,
	TABLE_BLESSING: 5,
}
// const chatName = 
cc.Class({
    extends: cc.GameComponent,

    properties: {
    	tableView:{default:null,type:cc.tableView},
    	tableLineView:{default:null,type:cc.tableView},
    	menu_Node:{default:[],type:[cc.Node]},
    	// lab_title:{default: null, type: cc.Label_},
    	btn_union:{default:null, type:cc.Node},
    	Sprite_jiantou:{default:null, type:cc.Node},
    	node_private_dot:{default:null, type:cc.Node},
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
    	Game.NotificationController.On(Game.Define.EVENT_KEY.CHAT_VIEW_PRIVATE_RED_DOT,this,this.setRedDot);
    	Game.NotificationController.Emit(Game.Define.EVENT_KEY.CHAT_VIEW_CHAT_HIDE,false);
    },
    removeNotification() {
    	Game.NotificationController.Off(Game.Define.EVENT_KEY.CHAT_RET_CHAT_DATA_TO_USER,this,this.refreshView);
    	Game.NotificationController.Off(Game.Define.EVENT_KEY.CHAT_VIEW_PRIVATE_RED_DOT,this,this.setRedDot);
    	Game.NotificationController.Emit(Game.Define.EVENT_KEY.CHAT_VIEW_CHAT_HIDE,true);
	},
	initView() {
		this._channel = ChatChannel.TABLE_ALL;
		this._openList = false;
		this._isMoving = false;

		this.updateView();
	},
	refreshView(data) {
		// this.showChatListByChannel();
		this.setDetail(true);
	},
	updateView() {
    	// this.showChatListByChannel();
    	this.setRedDot();
    	this.setDetail(false);
    },
    setDetail(isReload) {
    	// 聊天内容
    	let list = []; 
    	switch(parseInt(this._channel)){
            case ChatChannel.TABLE_ALL:
                // list = Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_WORLD);
                list.push.apply(list,Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_WORLD));
                list.push.apply(list,Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_COUNTRY));
                list.push.apply(list,Game.ChatModel.GetChatListByChannel(Game.Define.Enum_enumChatType.CHAT_TYPE_SEPT));
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
		}
	},
	setRedDot(){
		this.node_private_dot.active = Game.ChatModel.GetPrivateRedDot();
	},
	getDetailArr(ntxt,dtxt,w,f){
        let nlen = ntxt.length;
        let dlen = dtxt.length;
        let txt = ntxt+dtxt;
        return this.truncateUTF8String(txt, nlen, dlen, w, f);
    },
    truncateUTF8String(s, nlen, dlen, w, f) {
        let width = 0;
        // let sLen = n;
        let n = nlen+dlen;
     	let arr = {};
     	arr.txt1 = s.substr(nlen, n);
     	arr.txt2 = '';
     	let index = 0
        while(index < n){
            let dropping = s.charCodeAt(index);
            index = index + 1;
            if(!dropping){ break;}
            if (dropping >= 128) {
                width = width + f;
            }else{
            	width = width + f/2;
            }
            if(width > w){
            	arr.txt1 = s.substr(nlen, index - nlen - 1);
            	arr.txt2 = s.substr(index-1, nlen+dlen);
            	break;
            }
        }
        return arr;
    },

	refrehDetailTableView(list,isRelod) {
		list = Game._.sortBy(list, function (info) {
			return info.dwChatTime;
		});
		var callback = function (data) {
            this.onTouchChatCellCallBack(data, this);
        }.bind(this);
        if(this._channel == ChatChannel.TABLE_BLESSING){
        	this.tableView.node.active = false;
        	this.tableLineView.node.active = true;
        	if (isRelod) {
				this.tableLineView.reloadTableView(list.length, { array: list, target: this ,callback : callback, bless:true},true);			
			} else {
				this.tableLineView.initTableView(list.length, { array: list, target: this ,callback : callback, bless:true});
		
			}
			if(list.length > 2){
				this.tableLineView.scrollToBottom();
			}
			if(!this._openList){
				this.closeListView();
			}
        }else{
        	this.tableView.node.active = true;
        	this.tableLineView.node.active = false;
        	var nlist = [];
        	for (var i = 0; i < list.length; i++) {
        		var str = '[系统]' + list[i].pstrName+":";
                let d_Str = list[i].pstrChat;
                let t_w = this.tableView.node.width;
                if(list[i].sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_BLESS){
                    d_Str = d_Str+'<outline color=#1b700b width=2><color=#32e90e>[点击祝福]</c></outline>';
                    t_w = t_w - 80;
                }
        		var arrStr = this.getDetailArr(str,d_Str,t_w,24);
        		list[i].txt1 = arrStr.txt1;
        		nlist.push(list[i]);
        		if(arrStr.txt2 != ''){
        			// nlist.push({txt2:arrStr.txt2});
                    nlist.push({txt2:arrStr.txt2,
                                sysInfoType:list[i].sysInfoType,
                                dwFromID:list[i].dwFromID,
                                voicetime:list[i].voicetime,
                                toID:list[i].toID});
        		}
        	}
        	if (isRelod) {
				this.tableView.reloadTableView(nlist.length, { array: nlist, target: this ,callback : callback, bless:false}, true);			
			} else {
				this.tableView.initTableView(nlist.length, { array: nlist, target: this ,callback : callback, bless:false});
			}
			if(nlist.length > 3){
				this.tableView.scrollToBottom();
			}
			if(!this._openList){
				this.closeListView();
			}
			// this.scheduleOnce(function(){
				
			// },0.2);
        }
	},
	onTouchChatCellCallBack(data){
		if(data){
			if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_JIJIE){
                Game.JijieModel.joinJijie(data.toID);
			}else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_BLESS){
					Game.BlessModel.reqBlessCommon(data.face,data.toID,data.dwFromID);
				// }
			}else if (data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_GUARD) {
				// 公会运镖

			}else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_BORDER){
				// 公会守边

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
                //         teamid: data.toID,
                // });
                this.openView(Game.UIName.UI_DEFENBORDER)
            }
		}
	},
	showChatListByChannel() {
		this.btn_union.active = false;
		if(this._channel == ChatChannel.TABLE_UNION && Game.UserModel.GetSeptname() == ''){
			this.btn_union.active = true;
		}
    },
    onTouchJoinUnion(){
		// 打开公会界面
		this.openView(Game.UIName.UI_SEPTJOINVIEW);
	},
    onTouchMenuTable(event,tab){
    	if(this._isMoving){return;}

    	if(!this._openList){
    		this._openList = true;
    		this.openListView();
    		return;
    	}else{
    		this._openList = false;
    		if(this._channel != tab){
	    		this._channel = tab;
	    		this.updateView();
	    	}else{
	    		this.closeListView();
	    	}
    	}
    },
	openListView(){
		this._isMoving = true;
    	let x = 0;
    	let y = 0;
    	let index = 1;
    	for (var i = 0; i < this.menu_Node.length; i++) {
    		this.menu_Node[i].active = true;
    		if((i+1) == ChatChannel.TABLE_BLESSING && !Game.UserModel.getUnlockById(Game.Define.Unlock_Type.TYPE_CHAT_BLESS)){
    			this.menu_Node[i].active = false;
    			continue;
    		}
    		y = this.menu_Node[i].getPositionY();
    		if(this._channel == (i+1)){
    			this.menu_Node[i].setPosition(cc.p(0,y));
    			continue;
    		}
    		x = (this.menu_Node[i].width+10)*index;
    		this.menu_Node[i].runAction(cc.moveTo(0.3, x, y));
    		index = index + 1;
    	}
    	this.Sprite_jiantou.scaleX = 1;
    	this.scheduleOnce(function(){
			// this.lab_channel.setText("");
			this._isMoving = false;
		},0.4);
	},
	closeListView(){
		this._isMoving = true;
    	let x = 0;
    	let y = 0;
    	for (var i = 0; i < this.menu_Node.length; i++) {
    		this.menu_Node[i].active = true;
    		if((i+1) == ChatChannel.TABLE_BLESSING && !Game.UserModel.getUnlockById(Game.Define.Unlock_Type.TYPE_CHAT_BLESS)){
    			this.menu_Node[i].active = false;
    			continue;
    		}
    		y = this.menu_Node[i].getPositionY();
    		this.menu_Node[i].runAction(cc.moveTo(0.3, 0, y));
    		this.menu_Node[i].setLocalZOrder(0);
    		if(this._channel == (i+1)){
    			this.menu_Node[i].setLocalZOrder(1);
    		}
    	}
    	this.Sprite_jiantou.setLocalZOrder(2)
    	this.Sprite_jiantou.scaleX = -1;
    	this.scheduleOnce(function(){
			// this.lab_channel.setText("");
			this._isMoving = false;
		},0.4);
	},
	onTouchChat(){
		 Game.NotificationController.Emit(Game.Define.EVENT_KEY.CHAT_VIEW_ONTOUCH_CHAT);
	}
});