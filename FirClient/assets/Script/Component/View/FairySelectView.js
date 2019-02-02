// FairySelectView.js
const Game = require('../../Game');

cc.Class({

	extends: cc.GameComponent,

	properties: {
		tableViewOwn: { default: null, type: cc.tableView },
		tableViewAll: { default: null, type: cc.tableView },

		lab_power:{default: null,type: cc.Label_},
		lab_agile:{default: null,type: cc.Label_},
		lab_intelligence:{default: null,type: cc.Label_},
		lab_endurance:{default: null,type: cc.Label_},
		lab_power_add:{default: null,type: cc.Label_},
		lab_agile_add:{default: null,type: cc.Label_},
		lab_intelligence_add:{default: null,type: cc.Label_},
		lab_endurance_add:{default: null,type: cc.Label_},
		lab_level:{default: null,type: cc.Label_},
		progress_bar:{default: null,type: cc.ProgressBar},
        progress_load_bar:{default: null,type: cc.ProgressBar},
		lab_progress_value:{default: null,type: cc.Label_},
		lab_less_exp:{default: null,type: cc.Label_},
		// lab_get_exp:{default: null,type: cc.Label_},
		lab_select_num:{default: null,type: cc.Label_},
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
    },
    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FAIRY_RET_EAT_LIST,this,this.onInfoRefresh);
	},
	onInfoRefresh(data){
		this._fairyList = data.list;
		for (var i = 0; i < this._fairyList.length; i++) {
            var fairyBaseConfig = Game.FairyModel.GetFairyBaseConfigById(this._fairyList[i].id);
            var arr = this.addLevel(fairyBaseConfig.fairycolor,this._fairyList[i].sumexp,1);
            this._fairyList[i].color = fairyBaseConfig.fairycolor;
            this._fairyList[i].level = arr.level;
			this._fairyList[i].isSelected = false;
			for (var j = 0; j < this._selectFairy.length; j++) {
				if(this._selectFairy[j] && this._selectFairy[j].uuid == this._fairyList[i].uuid){
					this._fairyList[i].isSelected = true;
				}
			}
		}
		this.updateView();
	},
    initData() {
    	this._fairy = this._data.fairy;
    	this._fairyData = this._fairy.data;
    	this._selectFairy = this._data.selectFairy || [];
    	this._callback = this._data.callback;
    	this._fairyList = [];
        this.isMaxLevel = false;
        this.isTouchingAdd = false;
    	Game.NetWorkController.SendProto('pet.ReqEatList',{});
    	this.updateView();
    },
    updateView(){
    	this.setFariyInfo();
    	this.updateTableView();
    },
    getKindById(id){
    	var kind = 0;
    	var fairyBaseConfig = Game.FairyModel.GetFairyBaseConfigById(id);
    	if(fairyBaseConfig){
    		kind = fairyBaseConfig.fairykind;
    	}
    	return kind;
    },
    updateOwnTableView(fairyList) {
    	if(fairyList){
    		fairyList = Game._.sortBy(fairyList, function (info) {
                var id = info.color*1000000+info.level*1000+info.id;
	            return -id;
	        });
	    	this.tableViewOwn.reloadTableView(fairyList.length, { array: fairyList, target: this });
    	}
    },
    updateAllTableView(fairyList) {
    	if(fairyList){
    		fairyList = Game._.sortBy(fairyList, function (info) {
                var id = info.color*1000000+info.level*1000+info.id;
                return -id;
	        });
	    	this.tableViewAll.reloadTableView(fairyList.length, { array: fairyList, target: this });
    	}
    },

    setFariyInfo(){
    	if(this._fairy){
    		this.lab_power.setText(Game.Tools.UnitConvert(this._fairy.fi_info && this._fairy.fi_info.wdstr || 0));
            this.lab_agile.setText(Game.Tools.UnitConvert(this._fairy.fi_info && this._fairy.fi_info.wddex || 0));
            this.lab_intelligence.setText(Game.Tools.UnitConvert(this._fairy.fi_info && this._fairy.fi_info.wdint || 0));
            this.lab_endurance.setText(Game.Tools.UnitConvert(this._fairy.fi_info && this._fairy.fi_info.wdcon || 0));
            
            this.progress_bar.node.active = true;
            var eid = (this._fairyData.color || 1)*1000+this._fairyData.level;
            var fairyLevelConfig = Game.FairyModel.GetFairyLevelConfigById(eid);
            var exp = this._fairyData.exp || 0;
            if(fairyLevelConfig){
            	var needExp = fairyLevelConfig.needexp;
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
            // var addLevel = 0;
            var ownKind = baseConfig.fairykind;
            for (var i = 0; i < this._selectFairy.length; i++) {
            	if(i>=15){break;}
            	if(this._selectFairy[i]){
            		var config = Game.FairyModel.GetFairyBaseConfigById(this._selectFairy[i].id);
	            	if(config){
	            		 var addexp = (config.offerexp || 0);
                        if(ownKind == config.fairykind){
                            addexp = addexp*2;
                        }
                        addexp = addexp + this._selectFairy[i].sumexp/2;
                        
                        getExp = getExp + addexp;
	            	}
            	}
            }
            // this.lab_get_exp.setText("获取经验："+(getExp-exp));
            // var level = this.addLevel((this._fairyData.color || 1),getExp,this._fairyData.level);

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
            this.isMaxLevel = false;
            if(arr.level >= 100){
                this.isMaxLevel = true;
                this.lab_progress_value.setText("满级");
                this.progress_load_bar.progress = 1;
                // this.lab_less_exp.setText("满级");
                if(arr.exp > 0 && this.isTouchingAdd){
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
                }
            }
            this.lab_level.setText(level+"级");
           
            if(baseConfig){
                addPower = (level-this._fairyData.level)*(baseConfig.addstr || 0)
                addAgile = (level-this._fairyData.level)*(baseConfig.adddex || 0);
                addIntelligence = (level-this._fairyData.level)*(baseConfig.addint || 0);
                addEndurance = (level-this._fairyData.level)*(baseConfig.addres || 0);
            }

        	this.lab_power_add.setText(addPower > 0 && "+"+addPower || "");
        	this.lab_agile_add.setText(addAgile > 0 && "+"+addAgile || "");
        	this.lab_intelligence_add.setText(addIntelligence > 0 && "+"+addIntelligence || "");
        	this.lab_endurance_add.setText(addEndurance > 0 && "+"+addEndurance || "");
        	this.lab_select_num.setText("已选中："+this.getSelectFairyLength()+"/15");
    	}
    },
    getSelectFairyLength(){
        var index = 0;
        for (var i = 0; i < this._selectFairy.length; i++) {
            if(this._selectFairy[i]){
                index = index + 1;
            }
        }
        return index;
    },
    // addLevel(color, exp, level){
    // 	var eid = color*1000+level;
    // 	var lessExp = exp;
    // 	var fairyLevelConfig = Game.FairyModel.GetFairyLevelConfigById(eid);
    // 	if(fairyLevelConfig){
    // 	 	var needExp = fairyLevelConfig.needexp;
    // 	 	lessExp = exp - needExp;
    // 	 	if(lessExp > 0){
    // 	 		return this.addLevel(color,lessExp,level+1);
    // 	 	}else{
    // 	 		return level;
    // 	 	}
    // 	}else{
    // 		return level;
    // 	}
    // },
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
    updateTableView(){
    	var fairyAlllist = [];
		var fairyOwnlist = [];
		var kind = this.getKindById(this._fairyData.id);
		if(this._fairyList){
    		for (var i = 0; i < this._fairyList.length; i++) {
    			var fkind = this.getKindById(this._fairyList[i].id);
    			var ret = false;
				if (kind == fkind) {
					ret = true;
				}
    			if(!ret){
    				fairyAlllist.push(this._fairyList[i]);
    			}else{
    				fairyOwnlist.push(this._fairyList[i]);
    			}
    		}
    	}
    	this.updateOwnTableView(fairyOwnlist);
    	this.updateAllTableView(fairyAlllist);
    },

    fairyClickedCallback(fairyId){
       
    	if (fairyId){
    		for (var i = 0; i < this._fairyList.length; i++) {
	    		if(fairyId == this._fairyList[i].uuid){
	    			var select = this._fairyList[i].isSelected;
	    			// this._selectFairy[i].isSelected = !select;
	    			if(select){
	    				this._fairyList[i].isSelected = false;
	    				for (var j = 0; j < this._selectFairy.length; j++) {
			    			if(this._selectFairy[j] && this._selectFairy[j].uuid == fairyId){
			    				this._selectFairy.splice(j,1);
			    			}
			    		}
	    			}else{
                        if(this.isMaxLevel){
                            // 提示满了
                            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "精灵已满级！");
                            return;
                        }

                        if(this.getSelectFairyLength() < 15){
                            this._fairyList[i].isSelected = true;
                            var ret = false;
                            for (var j = 0; j < this._selectFairy.length; j++) {
                                if(this._selectFairy[j] == null && !ret){
                                    this._selectFairy[j] = this._fairyList[i];
                                    ret = true;
                                }
                            }
                            if(!ret){
                                this._selectFairy.push(this._fairyList[i]);
                            }
                            this.isTouchingAdd = true;
                        }else{
                            // 提示不能超过15个选择精灵
                            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "最多只能选择15个精灵！");
                        }
	    			}
	    		}
	    	}
	    	this.updateView();
    	}
    },
    onTouchReset(){
    	this._selectFairy = [];
    	for (var i = 0; i < this._fairyList.length; i++) {
    		this._fairyList[i].isSelected = false;
    	}
    	this.updateView();
    },

    onTouchConfirm(){
    	if(this._callback){
    		Game.Tools.InvokeCallback(this._callback, Game._.get(this, '_selectFairy', 0));
    		this.onClose();
    	}
    },

});
