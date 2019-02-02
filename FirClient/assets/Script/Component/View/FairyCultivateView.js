// FairyCultivateView.js
const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
    	node_fairy_head:{default:[],type:[cc.Node]},
    	FairyHeadNode:{default: null,type: cc.Node},
    	selected_node:{ default: null, type: sp.Skeleton },
    	lab_fight:{default: null,type: cc.Label_},
    	lab_power:{default: null,type: cc.Label_},
		lab_agile:{default: null,type: cc.Label_},
		lab_intelligence:{default: null,type: cc.Label_},
		lab_endurance:{default: null,type: cc.Label_},
		lab_next_power:{default: null,type: cc.Label_},
		lab_next_agile:{default: null,type: cc.Label_},
		lab_next_intelligence:{default: null,type: cc.Label_},
		lab_next_endurance:{default: null,type: cc.Label_},
        lab_line_next_power:{default: null,type: cc.LabelOutline},
        lab_line_next_agile:{default: null,type: cc.LabelOutline},
        lab_line_next_intelligence:{default: null,type: cc.LabelOutline},
        lab_line_next_endurance:{default: null,type: cc.LabelOutline},
		lab_cultivate_prop:{default: null,type: cc.Label_},
		node_money:{default:null,type:cc.Node},
		node_gold:{default:null,type:cc.Node},
		lab_spend_money:{default: null,type: cc.Label_},
		lab_spend_gold:{default: null,type: cc.Label_},
		lab_btn_cult:{default: null,type: cc.Label_},
		lab_btn_super_cult:{default: null,type: cc.Label_},

        sprite_btn_red:{default: null,type:cc.Node},


        lab_btn_onclick:{default: null,type: cc.Label_},
        Label_input: { default: null, type: cc.EditBox },
        node_gm:{default: null,type: cc.Node},

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
        Game.NotificationController.On(Game.Define.EVENT_KEY.FAIRY_ATTRI_TRAIN_RESLUT,this,this.refreshCultivateProp);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FAIRY_RET_FIGHT_POS,this,this.refreshView);
        Game.NotificationController.On(Game.Define.EVENT_KEY.RET_PET_MAIN_INFO,this,this.refreshView);
    },
    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FAIRY_ATTRI_TRAIN_RESLUT,this,this.refreshCultivateProp);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FAIRY_RET_FIGHT_POS,this,this.refreshView);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RET_PET_MAIN_INFO,this,this.refreshView);
        
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
        // ----------Gm-----------
        this.autoing = false;
        this.spendGold = 10;
        this.autoGold = 0;
        this._maxValue = false;
        this.node_gm.active = Game.FairyModel.getGM();
        // ----------Gm--------
        this._isSuper = false;
        this._superCultFight = false;
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

    		// this.lab_fight.setText(Game.Tools.UnitConvert(this._fairyData.fight_val));

            var wdstr = this._fairyData.attri_train && this._fairyData.attri_train.wdstr || 0;
            var wddex = this._fairyData.attri_train && this._fairyData.attri_train.wddex || 0;
            var wdint = this._fairyData.attri_train && this._fairyData.attri_train.wdint || 0;
            var wdcon = this._fairyData.attri_train && this._fairyData.attri_train.wdcon || 0;
    		this.lab_power.setText(Game.Tools.UnitConvert(wdstr));
            this.lab_agile.setText(Game.Tools.UnitConvert(wddex));
            this.lab_intelligence.setText(Game.Tools.UnitConvert(wdint));
            this.lab_endurance.setText(Game.Tools.UnitConvert(wdcon));
            
            this.sprite_btn_red.active = Game.FairyModel.GetCultivateRedDotByIndex(this._fairyindex);

            var baseConfig = Game.FairyModel.GetFairyBaseConfigById(this._fairyData.id);
            this.refreshCultivateProp();
            this.node_money.active = false;
            this.node_gold.active = false;
            var eid = (this._fairyData.color || 1)*1000+this._fairyData.level;
            var fairyLevelConfig = Game.FairyModel.GetFairyLevelConfigById(eid);
            if(fairyLevelConfig){
                // var addattri = fairyLevelConfig.addattri || 0;
                // var value = baseConfig.maxfour+addattri*(this._fairyData.level - 1) - (wdstr+wddex+wdint+wdcon);
                let value = fairyLevelConfig.attriall - (wdstr+wddex+wdint+wdcon);
            	this.lab_cultivate_prop.setText(value || 0);
                if(value <= 0){
                    this._maxValue = true;
                }
            }
            // var costConfig = Game.FairyModel.GetCultivateConfigByLevel(this._fairyData.level);
            var normalMoney = 50000;
            if(normalMoney > 0){
                this.node_money.active = true;
                var money = Game.UserModel.GetMoney();
                this.lab_spend_money.setText(Game.Tools.UnitConvert(money)+"/"+normalMoney);
                this.lab_spend_money.node.color = money>=normalMoney ? cc.color(8,255,8) : cc.color(255,0,0);
            }
            var goldMoney = 10;
            if(goldMoney > 0){
                this.node_gold.active = true;
                var gold = Game.UserModel.GetGold();
                this.lab_spend_gold.setText(Game.Tools.UnitConvert(gold)+"/"+goldMoney);
                this.lab_spend_gold.node.color = gold>=goldMoney ? cc.color(8,255,8) : cc.color(255,0,0);
                this.spendGold = goldMoney;
                if(!this.autoing){
                   this.autoGold = gold;
                }
                
            }
    	}else{
    		this.resetView();
    	}
    },
    refreshCultivateProp(data){
    	if(data && this._fairyData && data.face == this._fairyData.face){
    		this._stateCult = true;
    		var value = "%s(%s)";
            var addWdstr = this._fairyData.attri_train ? this._fairyData.attri_train.wdstr : 0;
            var addWddex = this._fairyData.attri_train ? this._fairyData.attri_train.wddex : 0;
            var addWdint = this._fairyData.attri_train ? this._fairyData.attri_train.wdint : 0;
            var addWdcon = this._fairyData.attri_train ? this._fairyData.attri_train.wdcon : 0;
            // .parent.getChildByName
            // var line = this.lab_next_power.node.parent.getChildByName('Label_powerpnum').getComponent('LableOutline');
            this.lab_next_power.setText(cc.js.formatStr(value,Game.Tools.UnitConvert(addWdstr+data.wdstr),Game.Tools.UnitConvert(data.wdstr)));
            this.lab_next_power.node.color = Game.FairyModel.GetAddValueColorByValue(data.wdstr);
            this.lab_line_next_power.color = Game.FairyModel.GetAddValueLineColorByValue(data.wdstr);

            this.lab_next_agile.setText(cc.js.formatStr(value,Game.Tools.UnitConvert(addWddex+data.wddex),Game.Tools.UnitConvert(data.wddex)));
            this.lab_next_agile.node.color = Game.FairyModel.GetAddValueColorByValue(data.wddex);
            this.lab_line_next_agile.color = Game.FairyModel.GetAddValueLineColorByValue(data.wddex);


            this.lab_next_intelligence.setText(cc.js.formatStr(value,Game.Tools.UnitConvert(addWdint+data.wdint),Game.Tools.UnitConvert(data.wdint)));
            this.lab_next_intelligence.node.color = Game.FairyModel.GetAddValueColorByValue(data.wdint);
            this.lab_line_next_intelligence.color = Game.FairyModel.GetAddValueLineColorByValue(data.wdint);

            this.lab_next_endurance.setText(cc.js.formatStr(value,Game.Tools.UnitConvert(addWdcon+data.wdcon),Game.Tools.UnitConvert(data.wdcon)));
            this.lab_next_endurance.node.color = Game.FairyModel.GetAddValueColorByValue(data.wdcon);
            this.lab_line_next_endurance.color = Game.FairyModel.GetAddValueLineColorByValue(data.wdcon);

            this.lab_fight.setText(data.fight);
            this._superCultFight = false;
            if(data.fight >= 30){
                this._superCultFight = true;
            }
           
            if(this._isSuper){
                
                this.lab_btn_cult.setText("取消");
                this.lab_btn_super_cult.setText("保存");
            }else{
                this.lab_btn_cult.setText("保存");
                this.lab_btn_super_cult.setText("取消");  
            }
            this.sprite_btn_red.active = false;

            if(this.autoing){
                var save = false;
                if(data.wdstr >=0 && data.wddex >=0 && data.wdint >=0 && data.wdcon >=0){
                    save = true;
                }
                var msg = {};
                msg.face = this._fairyData.uuid;
                msg.save = save;
                Game.NetWorkController.SendProto('pet.SaveAttriTrainResult', msg);
            }

    	}else{
    		this._stateCult = false
    		this.lab_next_power.setText("");
            this.lab_next_agile.setText("");
            this.lab_next_intelligence.setText("");
            this.lab_next_endurance.setText("");
            this.lab_fight.setText("0");
            this.lab_btn_cult.setText("培养");
            this.lab_btn_super_cult.setText("至尊培养");
    	}
    },
    resetView(){
    		// this.lab_fight.setText("");
    		this.lab_power.setText("");
            this.lab_agile.setText("");
            this.lab_intelligence.setText("");
            this.lab_endurance.setText("");
            this.lab_next_power.setText("");
            this.lab_next_agile.setText("");
            this.lab_next_intelligence.setText("");
            this.lab_next_endurance.setText("");
            this.lab_cultivate_prop.setText("");
            this.lab_fight.setText("0");
            this.node_money.active = false;
            this.node_gold.active = false;
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
        		this.refreshView();
        	}
        }
    },
    fairyPosClickedCallback(pos){
        if(this.autoing){return;}

        if(this._fairyindex != pos){
        	this.updateViewWithPos(pos);
        }
    },
    touchEvent(bool){
        if(!bool){
           if(this._superCultFight){
                    let title = '系统提示';
                    let desc = "本次培养收益较大，确认要放弃吗！";
                    Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
                        {
                            name: '保存培养',
                            handler: function () {
                                this._superCultFight = false;
                                 this.SendResult(true);
                            }.bind(this),
                        },
                        {
                            name: '放弃',
                            handler: function () {
                                this._superCultFight = false;
                                this.refreshCultivateProp();
                                this.SendResult(false);
                            }.bind(this),
                        },
                    ]);
                    return;
            }else{
                this.refreshCultivateProp(); 
            } 
        }
        this.SendResult(bool);
    },
    SendResult(bool){
       if(this._fairyData){
            var msg = {};
            msg.face = this._fairyData.uuid;
            msg.save = bool;
            Game.NetWorkController.SendProto('pet.SaveAttriTrainResult', msg);
        }  
    },

    onTouchCultivate(){
        if(this.autoing){return;}

    	if(this._stateCult){
            this.touchEvent(!this._isSuper);	
    	}else{
    		//培养
    		if(this._fairyData){
                this._isSuper = false;
    			var msg = {};
	    		msg.face = this._fairyData.uuid;
	    		msg.type = 1;
	    		Game.NetWorkController.SendProto('pet.DoAttriTrain', msg);
                if(!Game.FairyModel._cultivateTimer){
                    Game.NotificationController.Emit(Game.Define.EVENT_KEY.FAIRYRED_RED_DOT_TIMER); 
                }
    		}
    	}
    },
    onTouchSuperCultivate(){
        if(this.autoing){return;}

    	if(this._stateCult){
            this.touchEvent(this._isSuper);
    	}else{
    		// 至尊培养
    		if(this._fairyData){
                this._isSuper = true;
    			var msg = {};
	    		msg.face = this._fairyData.uuid;
	    		msg.type = 4;
	    		Game.NetWorkController.SendProto('pet.DoAttriTrain', msg);
    		}
    	}
    },
    // -----------------------自动培养多少金
    onTouchAutoSuperCultivate(){
        if(this.autoing){
            this.removeSchedule();
        }else{
           this.autoGold = parseInt(this.Label_input.string);
            this._scheduleCallback = function() {
               this.oneClickedUpgrading();
            }
            this.setOnClicking(true);
            this.schedule(this._scheduleCallback,0.2);
        }
    },
    removeSchedule(){
      if(this._scheduleCallback){
        this.unschedule(this._scheduleCallback);
      }
      this.setOnClicking(false);
      this.autoGold = Game.UserModel.GetGold();
    },
    setOnClicking(bool){
        if(bool){
            this.autoing = true;
            this.lab_btn_onclick.setText("停止一键");
        }else{
            this.autoing = false;
            this.lab_btn_onclick.setText("一键培养");
        }
    },
    oneClickedUpgrading(){
        if(this._fairyData){
                this.autoGold = this.autoGold - this.spendGold;
                this.Label_input.string = this.autoGold >= 0 ? this.autoGold : 0;
                var msg = {};
                msg.face = this._fairyData.uuid;
                msg.type = 4;
                Game.NetWorkController.SendProto('pet.DoAttriTrain', msg);
            }
       if(!this.checkCanUpgrade()){
          this.removeSchedule();
       }
    },
    checkCanUpgrade(){
        if(!this._fairyData){
            return false;
        }
        if(this.autoGold < this.spendGold){
            return false;
        }
        if(this._maxValue){
            return false;
        }
        if(!this.autoing){
            return false;
        }
        return true;
    },

});
