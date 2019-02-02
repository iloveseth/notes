// FairyArrayView.js
const Game = require('../../Game');

cc.Class({

	extends: cc.GameComponent,

	properties: {
		tableViewAll: { default: null, type: cc.tableView },
		node_head:{default:[],type:[cc.Node]},
		selected_node:{ default: null, type: sp.Skeleton },
    },

    onLoad() {
    },
    
    onEnable() {
        this.initData();
      	this.initNotification();
    },

    onDisable() {
    	this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.FAIRY_RET_EAT_LIST,this,this.onInfoRefresh);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FAIRY_RET_FIGHT_POS,this,this.onPosInfoRefresh);
    },
    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FAIRY_RET_EAT_LIST,this,this.onInfoRefresh);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FAIRY_RET_FIGHT_POS,this,this.onPosInfoRefresh);
	},

	onInfoRefresh(data){
		this._fairyList = data.list;
        for (var i = 0; i < this._fairyList.length; i++) {
            var fairyBaseConfig = Game.FairyModel.GetFairyBaseConfigById(this._fairyList[i].id);
            var arr = this.addLevel(fairyBaseConfig.fairycolor,this._fairyList[i].sumexp,1);
            this._fairyList[i].color = fairyBaseConfig.fairycolor;
            this._fairyList[i].level = arr.level;
        }
		this.updateViewWithPos(this._pos,true);
	},
	onPosInfoRefresh(){
		this.updatePosView();
	},
    initData() {
    	this._pos = this._data || 1;
        this._FairyPosLockIds = [
            Game.Define.FUNCTION_TYPE.TYPE_FIRSTFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_SECONDFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_THIRDFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_FOURTHFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_FIFTHFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_SIXTHFAIRY,
        ];
    	Game.NetWorkController.SendProto('pet.ReqEatList',{});
    	this.updatePosView();
    	this.updateViewWithPos(this._pos,false);
    },
    updatePackageView(fairyList,isRelod) {
    	if(fairyList){
    		fairyList = Game._.sortBy(fairyList, function (info) {
                var id = info.color*1000000+info.level*1000+info.id;
	            return -id;
	        });
            if(isRelod){
                this.tableViewAll.reloadTableView(fairyList.length, { array: fairyList, target: this });
            }else{
                this.tableViewAll.initTableView(fairyList.length, { array: fairyList, target: this });
            }
    	}
    },
    updatePosView(){
        for (var i = 0; i < this.node_head.length; i++) {
        	var fairyHeadNode = this.node_head[i].getComponent('FairyHeadNode');
        	var data = {};
            var islock = true;
            var des = "";
            if(this._FairyPosLockIds[i]){
                islock = !Game.GuideController.IsFunctionOpen(this._FairyPosLockIds[i]);
            }
            data.dot = true;
            data.unlock = islock;
        	data.pos = i+1;
        	var fairyInfo = Game.FairyModel.GetFairyFightInfoByIndex(data.pos);
            if(fairyInfo){
                 data.dot = false;
            }
        	data.fairyInfo = fairyInfo;
        	if(fairyHeadNode){
        		fairyHeadNode.updatePosView(data, function (pos) {
	                this.fairyPosClickedCallback(pos, this);
	            }.bind(this));
        	}
        }
    },
    addLevel(color, exp, level){
        var arr = {};
        var eid = color*1000+level;
        var lessExp = exp;
        var fairyLevelConfig = Game.FairyModel.GetFairyLevelConfigById(eid);
        if(fairyLevelConfig){
            var needExp = fairyLevelConfig.needexp;
            lessExp = exp - needExp;
            if(lessExp > 0){
                return this.addLevel(color,lessExp,level+1);
            }else{
                arr.level = level;
                arr.exp = exp;
                arr.needexp = exp - lessExp;
                arr.lessExp = lessExp;
                return arr;
            }
        }else{
            arr.level = level;
            arr.exp = exp;
            arr.needexp = exp - lessExp;
            arr.lessExp = lessExp;
            return arr;
        }
    },
    updateViewWithPos(pos,isRelod){
    	if (pos > 0) {
    		this.setSelectPos(pos);
    		// var fairylist = [];
    		// var kindlist = [];
    		// for (var i = 1; i <= 6; i++) {
    		// 	if(i != pos){
    		// 		var kind = this.getKindByPos(i);
    		// 		if(kind > 0){
    		// 			kindlist.push(kind);
    		// 		}
    		// 	}
    		// }
    		// if(this._fairyList){
	    	// 	for (var i = 0; i < this._fairyList.length; i++) {
	    	// 		var fkind = this.getKindById(this._fairyList[i].id);
	    	// 		var ret = false;
	    	// 		for (var j = 0; j < kindlist.length; j++) {
	    	// 			if (kindlist[j] == fkind) {
	    	// 				ret = true;
	    	// 			}
	    	// 		}
	    	// 		if(!ret){
	    	// 			fairylist.push(this._fairyList[i]);
	    	// 		}
	    	// 	}
	    	// }
			// this.updatePackageView(fairylist,isRelod);
			this.updatePackageView(this._fairyList,isRelod);
    	}else{
    		this.selected_node.node.active = false;
    		this.updatePackageView(this._fairyList,false);
    	}
    },
    setSelectPos(pos){
    	this.selected_node.node.active = true;
    	this.selected_node.node.setPositionX((pos-1)*140-355);
    },
    getKindByPos(pos){
    	var fairyInfo = Game.FairyModel.GetFairyFightInfoByIndex(pos)
    	if (fairyInfo == null) {return 0;}
    	return this.getKindById(fairyInfo.pettid);
    },
    getKindById(id){
    	var kind = 0;
    	var fairyBaseConfig = Game.FairyModel.GetFairyBaseConfigById(id);
    	if(fairyBaseConfig){
    		kind = fairyBaseConfig.fairykind;
    	}
    	return kind;
    },
    fairyPosClickedCallback(pos){
    	if(this._pos == pos){
    		this._pos = 0;
    	}else{
    		this._pos = pos;
    	}
    	this.updateViewWithPos(this._pos);
    },
    
    fairyClickedCallback(fairyId){
    	if (this._pos > 0 && fairyId){
			let  curKind = this.getKindById(fairyId);
			let kindlist = [];
    		for (let i = 1; i <= 6; i++) {
    			if(i != this._pos){
    				let kind = this.getKindByPos(i);
    				if(kind > 0){
    					kindlist.push(kind);
    				};
    			};
			};
			for (let i2 = 0; i2 < kindlist.length; i2++) {
				if(curKind == kindlist[i2]){
					Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "已镶嵌重复精灵");
					return;
				};
			};

    		var msg = {};
    		msg.pos = this._pos;
    		msg.petid = fairyId;
    		Game.NetWorkController.SendProto('pet.ReqFight',msg);
    	}
    },
});
