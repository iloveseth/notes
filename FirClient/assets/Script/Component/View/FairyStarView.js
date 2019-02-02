// FairyStarView.js
const Game = require('../../Game');

const FairyStarExpMaterial = {
	firstMaterial: 479,
	middleMaterial: 480,
	highMaterial: 481,
	gradeMaterial: 482,
}



cc.Class({
    extends: cc.GameComponent,

    properties: {
		node_fairy_head:{default:[],type:[cc.Node]},
		selected_node:{ default: null, type: sp.Skeleton },
		node_star:{default:[],type:[ cc.Node]},
		node_role:{default: null,type: cc.Node},
		// lab_add_fight:{default: null,type: cc.Label_},
		lab_star_exp:{default: null,type: cc.Label_},
		progress_bar:{default: null,type: cc.ProgressBar},
		lab_progress_value:{default: null,type: cc.Label_},
		node_progress:{default: null,type: cc.Node},
		node_star_material:{default: null,type: cc.Node},
		lab_material_num:{default:[],type:[cc.Label_]},
		node_grade_material:{default: null,type: cc.Node},
		lab_grade_material_num:{default: null,type: cc.Label_},
		selected_material_node:{default:null, type:sp.Skeleton },
        lab_name:{default: null,type: cc.Label_},
        sprite_Role:{default: null,type: cc.Sprite_},
		
		btn_use:{default: null,type: cc.Node},
		// btn_auto_use:{default: null,type: cc.Node},
        btn_auto_use:{default: null,type: cc.Sprite_},
		lab_btn_auto_use:{default: null,type: cc.Label_},	

        node_prop:{default: [],type: [cc.Node]},	
    },
    onLoad() {

    },
    onEnable() {
        this.initView();
        this.initNotification();
    },

    onDisable() {
    	this.removeNotification();
        this.resetDate();
    },

    initNotification() {
    	Game.NotificationController.On(Game.Define.EVENT_KEY.RET_PET_MAIN_INFO,this,this.refreshInfoView);
        Game.NotificationController.On(Game.Define.EVENT_KEY.OBJECTS_REFRESH,this,this.refreshObj);
    },
    removeNotification() {
    	Game.NotificationController.Off(Game.Define.EVENT_KEY.RET_PET_MAIN_INFO,this,this.refreshInfoView);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.OBJECTS_REFRESH,this,this.refreshObj);
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
    	this._stateMaterial = 1;
        this._propX = this.node_prop[0].getPositionX();
        this._isMax = false;
    	this._expMaterialList = [FairyStarExpMaterial.gradeMaterial,FairyStarExpMaterial.firstMaterial,FairyStarExpMaterial.middleMaterial,FairyStarExpMaterial.highMaterial];
    	this.refreshView();
    },
    refreshView(){
        this.refreshInfoView();
        this.updateRoleView();
    },
    refreshInfoView(){
        this._fairy = null;
        this._fairyData = null;
        var fairyMsg = Game.FairyModel.GetFairyFightInfoByIndex(this._fairyindex);
        if(fairyMsg && fairyMsg.petid){
             this._fairy = Game.FairyModel.GetFairyInfoById(fairyMsg.petid);
             if(this._fairy){
                this._fairyData = this._fairy.data;
            } 
        }
        this.setFariyHead();
        this.setFariyInfo();
    },
    updateRoleView(){
        if(this._fairy){
            var fairyBaseConfig = Game.FairyModel.GetFairyBaseConfigById(this._fairyData.id);
            this.lab_name.setText(fairyBaseConfig.fairyname);   
            var skeletonPath = fairyBaseConfig.fairyavatar;
            this.addRoleSpine(this.node_role, skeletonPath);
        }
    },

    setFariyInfo(){
    	if(this._fairy){
    		var star = this._fairyData.star || 0;
    		for (var i = 0; i < this.node_star.length; i++) {
    			this.node_star[i].active = false;
    			if(i < star){
    				this.node_star[i].active = true;
    			}
    		}
            var fairyStarConfig = Game.FairyModel.GetFairyStarConfigByStar(star+1);
            // var fairyStarConfig = {id:1,star:4,needexp:100,allexp:100,addfight:1000,allfight:1000,soulnum:1,juniorexp:5,mediumexp:15,seniorexp:50,};
           
            var fsConfig = Game.FairyModel.GetFairyStarConfigByStar(star);
            for (var i = 0; i < this.node_prop.length; i++) {
                var lab_title = this.node_prop[i].getChildByName('Label_title');
                var sprite_arrow = this.node_prop[i].getChildByName('Sprite_arrow');
                var lab_value = this.node_prop[i].getChildByName('lab_value').getComponent('Label_');
                var lab_value_next = this.node_prop[i].getChildByName('lab_value_next').getComponent('Label_');
                var vl = star;
                var vln = star+1;
                if(i == 0){
                    vl = fsConfig != null ? fsConfig.allfight : 0;
                    vln = fairyStarConfig != null ? fairyStarConfig.allfight : 0;
                }
                if(fairyStarConfig){

                    lab_value.setText(Game.Tools.UnitConvert(vl));
                    lab_value_next.setText(Game.Tools.UnitConvert(vln));
                    sprite_arrow.active = true;
                    this.node_prop[i].setPositionX(this._propX);
                }else{
                    lab_value.setText(vl);
                    lab_value_next.setText("");
                    sprite_arrow.active = false;
                    this.node_prop[i].setPositionX(this._propX + (lab_title.width+lab_value.node.width)/2);
                }
            }

            if(fairyStarConfig){
            	this.node_progress.active = true;
            	// this.lab_add_fight.setText(fairyStarConfig.addfight || 0);
            	var tNumMax = fairyStarConfig.needexp;
            	var starExp = this._fairyData.starexp || 0;
		  		var tNumCur = starExp > tNumMax && tNumMax || starExp;
		  		this.lab_progress_value.setText(tNumCur + "/"+tNumMax);
		  		var progress = tNumCur/tNumMax;
		  		this.progress_bar.progress = progress;
                this._isMax = false;
            }else{
            	// this.node_progress.active = false;
                var numexp = fsConfig.needexp;
                this.lab_progress_value.setText(numexp + "/"+numexp);
                this.progress_bar.progress = 1;
                this._isMax = true;
            }
            this.refreshMaterial(fairyStarConfig);
    	}else{
    		this.resetView();
    	}
    },
    refreshObj(){
        let num = Game.ItemModel.GetItemNumById(this._expMaterialList[0]);
        this.lab_grade_material_num.setText(num || "0");

        for (var i = 0; i < this.lab_material_num.length; i++) {
            num = Game.ItemModel.GetItemNumById(this._expMaterialList[i+1])
            this.lab_material_num[i].setText(num || "0");
        }
    },
    addRoleSpine(parent, Res) {
        var spineNode = parent.getChildByName('sp_player');
        spineNode.active = true;
        Game.ResController.LoadSpine(Res, function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {

                spineNode.getComponent("sp.Skeleton").skeletonData = asset;
                spineNode.getComponent("sp.Skeleton").setAnimation(0, Game.Define.MONSTER_ANIMA_STATE.IDLE, true);
            }
        }.bind(this));

    },
    refreshMaterial(config){
    	if(config){
    		var starExp = this._fairyData.starexp || 0;
    		if(starExp >= config.needexp){
	    		this._stateGrade = true;
                this.removeSchedule();
	    		this._autoUsing = false;
	    		this.node_star_material.active = false;
	    		this.node_grade_material.active = true;
	    		var num = Game.ItemModel.GetItemNumById(this._expMaterialList[0]);
	    		this.lab_grade_material_num.setText(num || "0");

	    		this.btn_use.active = false;
                 this.btn_auto_use.SetSprite(Game.FairyModel.GetFairyBtnNormal());
                this.btn_auto_use.node.active = true;
	    		this.btn_auto_use.node.setPositionX(0);
	            this.lab_btn_auto_use.setText("进阶");
	    	}else{
	    		this._stateGrade = false;
	    		this.node_star_material.active = true;
	    		this.node_grade_material.active = false;

	    		for (var i = 0; i < this.lab_material_num.length; i++) {
	    			var num = Game.ItemModel.GetItemNumById(this._expMaterialList[i+1])
	    			this.lab_material_num[i].setText(num || "0");
	    		}
	    		this.selectMaterial(this._stateMaterial);
	    		this.btn_use.active = true;
                this.btn_auto_use.SetSprite(Game.FairyModel.GetFairyBtnNormal());
                this.btn_auto_use.node.active = true;
	    		this.btn_auto_use.node.setPositionX(170);
                if(!this._autoUsing){
                    this.lab_btn_auto_use.setText("自动使用");
                }
	    	}
    	}else{
    		// 最大星级
    		this.node_star_material.active = false;
            this.node_grade_material.active = true;
            var num = Game.ItemModel.GetItemNumById(this._expMaterialList[0]);
            this.lab_grade_material_num.setText(num || "0");
      //       for (var i = 0; i < this.lab_material_num.length; i++) {
      //           var num = Game.ItemModel.GetItemNumById(this._expMaterialList[i+1])
      //           this.lab_material_num[i].setText(num || "0");
      //       }
    		// this.node_grade_material.active = false;
    		this.btn_use.active = false;
    		// this.btn_auto_use.active = false;
            this._stateGrade = true;
            this.btn_auto_use.SetSprite(Game.FairyModel.GetFairyBtnGray());
            this.btn_auto_use.node.setPositionX(0);
            this.lab_btn_auto_use.setText("进阶");
    	}
    	
    },
    resetDate(){
        for (var i = 0; i < this.node_prop.length; i++) {
            this.node_prop[i].setPositionX(this._propX);
        }
    },
    selectMaterial(state){
    	if(!this._stateGrade){
    		this._stateMaterial = state;	
    		this.selected_material_node.node.setPositionX((state-2)*200 );
    	}
    },
    resetView(){
    		
    },

    setFariyHead(){
        this.setSelectPos(this._fairyindex);
        this.updatePosView();
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
    	if(this._autoUsing){return;}
        if(this._fairyindex != pos){
        	this.updateViewWithPos(pos);
        }
    },

    oneClickedUpgrading(){
        // var num = Game.ItemModel.GetItemNumById(this._expMaterialList[this._stateMaterial])
        // && num > 0
        if(this._fairyData){
            var msg = {};
            msg.uuid = this._fairyData.uuid;
            msg.type = this._stateMaterial;
            Game.NetWorkController.SendProto('pet.ReqStarUpPet',msg);
        }
       if(!this.checkCanUpgrade()){
          this.removeSchedule();
       }
    },
    checkCanUpgrade(){
        var num = Game.ItemModel.GetItemNumById(this._expMaterialList[this._stateMaterial]);
        if(!this._fairyData){
            return false;
        }
        if( num <= 0 ){
            // Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "材料不足！");
            return false;
        }
        if(this._stateGrade){
            return false;
        }
        if(!this._autoUsing){
            return false;
        }
        return true;
    },
    setOnClicking(bool){
        if(bool){
            this._autoUsing = true;
            this.lab_btn_auto_use.setText("停止使用");
        }else{
            this._autoUsing = false;
            this.lab_btn_auto_use.setText("自动使用");
        }
    },

    OnTouchFirstMaterial(){
    	if(this._autoUsing){return;}
    	if(this._stateMaterial != 1){
    		this.selectMaterial(1);
    	}
    },
    OnTouchMiddleMaterial(){
    	if(this._autoUsing){return;}
    	if(this._stateMaterial != 2){
    		this.selectMaterial(2);
    	}
    },
    OnTouchHighMaterial(){
    	if(this._autoUsing){return;}
    	if(this._stateMaterial != 3){
    		this.selectMaterial(3);
    	}
    },
    onTouchClose(){
        if(this._autoUsing){return;}
        this.onClose();
    },
    onTouchUse(){
    	if(this._autoUsing){return;}
    	// var num = Game.ItemModel.GetItemNumById(this._expMaterialList[this._stateMaterial]);
     //     if( num <= 0 ){
     //        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "材料不足！");
     //        return;
     //    }
        // && num > 0
    	if(this._fairyData){
    		var msg = {};
    		msg.uuid = this._fairyData.uuid;
    		msg.type = this._stateMaterial;
    		Game.NetWorkController.SendProto('pet.ReqStarUpPet',msg);
    	}
    },
    onTouchAutoUse(){
        if(this._isMax){
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "已达最大星级！"); 
            return;
        }

    	if(this._stateGrade){
    		// 进阶
        	// var num = Game.ItemModel.GetItemNumById(this._expMaterialList[0]);
         //    if( num <= 0 ){
         //        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "材料不足！");
         //        return;
         //    }
        //  && num > 0
	    	if(this._fairyData){
	    		var msg = {};
	    		msg.uuid = this._fairyData.uuid;
	    		msg.type = 0;
	    		Game.NetWorkController.SendProto('pet.ReqStarUpPet',msg);
	    	}
    	}else{
    		// 自动使用
            if(this._autoUsing){
                this.removeSchedule();
            }else{
                // var num = Game.ItemModel.GetItemNumById(this._expMaterialList[this._stateMaterial]);
                // if( num <= 0 ){
                //     Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "材料不足！");
                //     return;
                // }
                // && num > 0
                if(this._fairyData){
                    this._scheduleCallback = function() {
                       this.oneClickedUpgrading();
                    }
                    this.setOnClicking(true);
                    this.schedule(this._scheduleCallback,0.5); 
                }
            }
    		// var num = Game.ItemModel.GetItemNumById(this._expMaterialList[this._stateMaterial])
	    	// if(this._fairyData && num > 0){
	    	// 	this._autoUsing = true;
	    	// 	var msg = {};
	    	// 	msg.uuid = this._fairyData.uuid;
	    	// 	msg.type = this._stateMaterial;
	    	// 	Game.NetWorkController.SendProto('pet.ReqStarUpPet',msg);
	    	// }
    	}
    },
    removeSchedule(){
      if(this._scheduleCallback){
        this.unschedule(this._scheduleCallback);
      }
      this.setOnClicking(false);
      // this._autoUsing = false;
      // this.unscheduleAllCallbacks();
    },
});