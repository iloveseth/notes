// FairyUpgradeView.js
const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
    	node_fairy_head:{default:[],type:[cc.Node]},
    	selected_node:{ default: null, type: sp.Skeleton },
    	FairyHeadNode:{default: null,type: cc.Node},
    	lab_power:{default: null,type: cc.Label_},
		lab_agile:{default: null,type: cc.Label_},
		lab_intelligence:{default: null,type: cc.Label_},
		lab_endurance:{default: null,type: cc.Label_},
		lab_power_add:{default: null,type: cc.Label_},
		lab_agile_add:{default: null,type: cc.Label_},
		lab_intelligence_add:{default: null,type: cc.Label_},
		lab_endurance_add:{default: null,type: cc.Label_},
		lab_level:{default: null,type: cc.Label_},

		// node_progress:{default: null,type: cc.Node},
		progress_bar:{default: null,type: cc.ProgressBar},
        progress_load_bar:{default: null,type: cc.ProgressBar},
		lab_progress_value:{default: null,type: cc.Label_},

		lab_less_exp:{default: null,type: cc.Label_},
		lab_get_exp:{default: null,type: cc.Label_},
		tableView: { default: null, type: cc.tableView },
        sprite_btn_red:{default: null,type:cc.Node},
		
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
    	Game.NotificationController.On(Game.Define.EVENT_KEY.RET_PET_MAIN_INFO,this,this.refreshView);
    	Game.NotificationController.On(Game.Define.EVENT_KEY.FAIRY_RET_EAT_LIST,this,this.onInfoRefresh);
    	Game.NotificationController.On(Game.Define.EVENT_KEY.FAIRY_REMOVE_PET,this,this.onRemoveSelectInfoRefresh);
        Game.NotificationController.On(Game.Define.EVENT_KEY.UPDATE_FAIRYRED, this, this.refreshBtnDot);
    },
    removeNotification() {
    	Game.NotificationController.Off(Game.Define.EVENT_KEY.RET_PET_MAIN_INFO,this,this.refreshView);
    	Game.NotificationController.Off(Game.Define.EVENT_KEY.FAIRY_RET_EAT_LIST,this,this.onInfoRefresh);
    	Game.NotificationController.Off(Game.Define.EVENT_KEY.FAIRY_REMOVE_PET,this,this.onRemoveSelectInfoRefresh);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.UPDATE_FAIRYRED, this, this.refreshBtnDot);
	},
    onFairyNullTips(){

        let title = '系统提示';
        let desc = "包裹中没有更多精灵了，是否前往抽取？";
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
            {
                // name: '取消',
                name: '前往抽取',
                handler: function () {
                   this.openView(Game.UIName.UI_SHOPVIEW, Game.Define.SHOPTAB.Tab_Pet);
                }.bind(this),
            },
            {
                // name: '前往抽取',
                // handler: function () {
                //    this.openView(Game.UIName.UI_SHOPVIEW, Game.Define.SHOPTAB.Tab_Pet);
                // }.bind(this),
                name: '取消',
            },
        ]);
        
    },
	onInfoRefresh(data){
		if(this.isOpenSelectView){
			return;
		}
		if(data.list){
			var fairyList = Game._.sortBy(data.list, function (info) {
	            return info.fight;
	        });
	        // this.selectFairyList = [];
            if(data.list.length == 0 
                || data.list.length == this.getSelectFairyLength()){
                // Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "您的包裹中没有精灵！");
                this.onFairyNullTips();
                // return;
            }
	        for (var i = 0; i < fairyList.length; i++) {
	        	if(i >= 15 || this.getSelectFairyLength() >= 15){break;}
                var hasSelect = false;
                for (var j = 0; j < this.selectFairyList.length; j++) {
                    if(this.selectFairyList[j] && this.selectFairyList[j].uuid == fairyList[i].uuid){
                        hasSelect = true;
                        break;
                    }
                }
                if(!hasSelect){
                    var ret = false;
                    for (var j = 0; j < this.selectFairyList.length; j++) {
                        if(this.selectFairyList[j] == null && !ret){
                            this.selectFairyList[j] = fairyList[i];
                            ret = true;
                        }
                    }
                    if(!ret){
                        this.selectFairyList.push(fairyList[i]);
                    }
                }
                var maxCheck = this.checkCurExp(this.selectFairyList);
                if(!maxCheck){break;}
	        }
	    }else{
            // Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "您的包裹中没有精灵！");
            this.onFairyNullTips();
        }
	    this.setFariyInfo();
        // if(!this.isMaxLevel && data.list && data.list.length < 15){
        //     this.onFairyNullTips();
        // }
	},
    checkCurExp(list){
        var baseConfig = Game.FairyModel.GetFairyBaseConfigById(this._fairyData.id);
        var ownKind = baseConfig.fairykind;
        var getExp = this._fairyData.exp || 0;;
        for (var i = 0; i < list.length; i++) {
            if(list[i]){
                var config = Game.FairyModel.GetFairyBaseConfigById(list[i].id);
                if(config){
                     var addexp = (config.offerexp || 0);
                    if(ownKind == config.fairykind){
                        addexp = addexp*2;
                    }
                    addexp = addexp + list[i].sumexp/2;
                    getExp = getExp + addexp;
                }
            }
        }
        var arr = this.addLevel((this._fairyData.color || 1),getExp,this._fairyData.level);
        if(arr.level >= 100){
            if(arr.exp > 0){
                let title = '系统提示';
                let desc = "本次升级经验值已溢出！";
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
                    {
                        name: '确定',
                        handler: function () {
                            this.isTouchingAdd = false;
                        }.bind(this),
                    },
                ]);
                return false;
            }
        }
        return true;
    },

	onRemoveSelectInfoRefresh(data){
		if(data.ids){
			for (var i = 0; i < data.ids.length; i++) {
				for (var j = 0; j < this.selectFairyList.length; j++) {
                    if(this.selectFairyList[j]){
                       if(data.ids[i] == this.selectFairyList[j].uuid){
                            this.selectFairyList.splice(j,1);
                        } 
                    }
					
				}
			}
		}
		this.refreshView();
	},

    initView(){
    	this._fairyindex = this._data || 1;
        this._FairyPosLockIds = [
            Game.Define.FUNCTION_TYPE.TYPE_FIRSTFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_SECONDFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_THIRDFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_FOURTHFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_FIFTHFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_SIXTHFAIRY,
        ];
    	this.selectFairyList = [];
    	this.isOpenSelectView = false;
        this.isMaxLevel = false;
    	this._fairyHeadNode = this.FairyHeadNode.getComponent('FairyHeadNode');
    	this.refreshView();
    },
    refreshView(){
        this._fairy = null;
        this._fairyData = null;
        var fairyMsg = Game.FairyModel.GetFairyFightInfoByIndex(this._fairyindex);
        if(fairyMsg && fairyMsg.petid){
             this._fairy = Game.FairyModel.GetFairyInfoById(fairyMsg.petid);
             if(this._fairy){
                this._fairyData = this._fairy.data;
            } 
        }
        this.updateView();
    },

    updateView() {
    	this.setFariyHead();
        this.setFariyInfo();
    },
    setFariyInfo(){
    	if(this._fairy){
    		this.lab_power.setText(Game.Tools.UnitConvert(this._fairy.fi_info && this._fairy.fi_info.wdstr || 0));
            this.lab_agile.setText(Game.Tools.UnitConvert(this._fairy.fi_info && this._fairy.fi_info.wddex || 0));
            this.lab_intelligence.setText(Game.Tools.UnitConvert(this._fairy.fi_info && this._fairy.fi_info.wdint || 0));
            this.lab_endurance.setText(Game.Tools.UnitConvert(this._fairy.fi_info && this._fairy.fi_info.wdcon || 0));

            // this.lab_level.setText(this._fairyData.level);
            this.sprite_btn_red.active = Game.FairyModel.GetUpgradeRedDotByIndex(this._fairyindex);

            this.progress_bar.node.active = true;
            var eid = (this._fairyData.color || 1)*1000+this._fairyData.level;
            var fairyLevelConfig = Game.FairyModel.GetFairyLevelConfigById(eid);
            var exp = this._fairyData.exp || 0;
            var needExp = 0;
            if(fairyLevelConfig){
            	needExp = fairyLevelConfig.needexp;
		  		var expCur = exp > needExp && needExp || exp;
		  		this.lab_progress_value.setText(expCur + "/"+needExp);
		  		var progress = expCur/needExp;
		  		this.progress_bar.progress = progress;
                this.progress_load_bar.progress = progress;
            }

            var baseConfig = Game.FairyModel.GetFairyBaseConfigById(this._fairyData.id);
            var getExp = exp;
            var addPower = 0;
            var addAgile = 0;
            var addIntelligence = 0;
            var addEndurance = 0;
            var addLevel = 0;
            var ownKind = baseConfig.fairykind;
            for (var i = 0; i < this.selectFairyList.length; i++) {
            	if(i>=15){break;}
            	if(this.selectFairyList[i]){
            		var config = Game.FairyModel.GetFairyBaseConfigById(this.selectFairyList[i].id);
	            	if(config){
                        var addexp = (config.offerexp || 0);
                        if(ownKind == config.fairykind){
                            addexp = addexp*2;
                        }
                        addexp = addexp + this.selectFairyList[i].sumexp/2;
                       
                        getExp = getExp + addexp;
	            	}
            	}
            }
            this.lab_get_exp.setText("获取经验："+(getExp-exp));
            var arr = this.addLevel((this._fairyData.color || 1),getExp,this._fairyData.level);
            var level = Math.min(100,arr.level);

            needExp = arr.needexp;
            var expCur = arr.exp > needExp && needExp || arr.exp;
            this.lab_progress_value.setText(expCur + "/"+needExp);
            var progress = expCur/needExp;
            if(level > this._fairyData.level){
                this.progress_bar.node.active = false;
                this.progress_load_bar.progress = progress;
            }else{
                this.progress_load_bar.progress = progress;
            }
            this.lab_less_exp.setText("");

            var maxeid = (this._fairyData.color || 1)*1000+level;
            var maxLevelConfig = Game.FairyModel.GetFairyLevelConfigById(eid);
            this.isMaxLevel = false;
            if(arr.level >= 100){
                this.isMaxLevel = true;
                this.lab_progress_value.setText("满级");
                this.progress_load_bar.progress = 1;
            }
        	this.lab_level.setText(level+"级");

            if(baseConfig){
                addPower = (level-this._fairyData.level)*(baseConfig.addstr || 0)
                addAgile = (level-this._fairyData.level)*(baseConfig.adddex || 0);
                addIntelligence = (level-this._fairyData.level)*(baseConfig.addint || 0);
                addEndurance = (level-this._fairyData.level)*(baseConfig.addres || 0);
            }

        	this.lab_power_add.setText(addPower > 0 ? "+"+addPower : "");
        	this.lab_agile_add.setText(addAgile > 0 ? "+"+addAgile : "");
        	this.lab_intelligence_add.setText(addIntelligence > 0 ? "+"+addIntelligence : "");
        	this.lab_endurance_add.setText(addEndurance > 0 ? "+"+addEndurance : "");

            this.refreshSelectFairyView();
    	}else{
    		this.resetView();
    	}
    },

    refreshBtnDot(){
        this.sprite_btn_red.active = Game.FairyModel.GetUpgradeRedDotByIndex(this._fairyindex);
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
    addProp(data){
    	if(data && this._fairyData && data.face == this._fairyData.face){
    		this._stateCult = true;
    	}else{
    		this._stateCult = false;
    	}
    },
    resetView(){
    		this.lab_power.setText("");
            this.lab_agile.setText("");
            this.lab_intelligence.setText("");
            this.lab_endurance.setText("");
    },

    setFariyHead(){
        this.setSelectPos(this._fairyindex);
        this.updatePosView();
        if(this._fairyHeadNode){
        	this._fairyHeadNode.updatePackageView(this._fairyData);
        }

    },
    setSelectPos(pos){
        this.selected_node.node.setPositionX((pos-1)*140-355);
    },
    updatePosView(){
        for (var i = 0; i < this.node_fairy_head.length; i++) {
            var fairyHeadNode = this.node_fairy_head[i].getComponent('FairyHeadNode');
            var data = {};
            var islock = true;
            var des = "";
            if(this._FairyPosLockIds[i]){
                islock = !Game.GuideController.IsFunctionOpen(this._FairyPosLockIds[i]);
            }
            data.unlock = islock;
            data.pos = i+1;
            var fairyInfo = Game.FairyModel.GetFairyFightInfoByIndex(data.pos);
            data.fairyInfo = fairyInfo;
            if(fairyHeadNode){
                fairyHeadNode.updatePosView(data, function (pos) {
                    this.fairyPosClickedCallback(pos, this);
                }.bind(this));
            }
        }
    },
    updateViewWithPos(pos){
        if (pos > 0) {
        	var fairyMsg = Game.FairyModel.GetFairyFightInfoByIndex(pos);
        	if(fairyMsg){
        		this._fairyindex = pos;
                this.onTouchReset();
        		this.refreshView();
        	}
        }
    },
    fairyPosClickedCallback(pos){
        if(this._fairyindex != pos){
        	this.updateViewWithPos(pos);
        }
    },
    refreshSelectFairyView(){
    	this.tableView.reloadTableView(15, { array: this.selectFairyList, target: this });
    },
    getSelectFairyLength(){
        var index = 0;
        for (var i = 0; i < this.selectFairyList.length; i++) {
            if(this.selectFairyList[i]){
                index = index + 1;
            }
        }
        return index;
    },
    onTouchCallbackData(index){
    	if(this.selectFairyList[index]){
    		this.selectFairyList[index] = null;
    	}
        var ret = false;
        for (var i = 0; i < this.selectFairyList.length; i++) {
            if(this.selectFairyList[i]){
                ret = true;
            }
        }
        if(!ret){
            this.selectFairyList = [];
        }
        // if(this.isMaxLevel){
        //     // 满级
        //     Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "精灵已满级！");
        //     return;
        // }
    	this.setFariyInfo();
    },
    onTouchCallbackNil(){
    	if(this._fairy){
    		this.isOpenSelectView = true;
    		var data = {};
			data.fairy = this._fairy;
			data.selectFairy = this.selectFairyList;
			data.callback = function (selectList) {
	                    this.OnSelectCallBack(selectList, this);
	                }.bind(this);
			this.openView(Game.UIName.UI_FAIRY_SELECTVIEW,data);
    	}
    },
    OnSelectCallBack(selectList){
    	this.isOpenSelectView = false;
    	this.selectFairyList = selectList;
    	this.setFariyInfo();
    },
    onTouchOnclickAdd(){
        if(this.isMaxLevel){
            // 满级
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "精灵已满级！");
            return;
        }
    	if(this.getSelectFairyLength() < 15){
    		this.isOpenSelectView = false;
    		Game.NetWorkController.SendProto('pet.ReqEatList',{});
    	}
    },
    onTouchReset(){
    	this.selectFairyList = [];
    	this.setFariyInfo();
    },
    onTouchUpgrade(){
		if(this._fairyData && this.getSelectFairyLength() > 0){
			var msg = {};
    		msg.uuid = this._fairyData.uuid;
    		msg.costids = [];
    		for (var i = 0; i < this.selectFairyList.length; i++) {
    			if(this.selectFairyList[i]){
    				msg.costids.push(this.selectFairyList[i].uuid);
    			}
    		}
    		
    		Game.NetWorkController.SendProto('pet.ReqLevelUpPet', msg);
		}else{
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "请添加需要吞噬的精灵！");
        }
    },

});
