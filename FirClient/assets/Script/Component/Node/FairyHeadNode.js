// FairyHeadNode.js
const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,
    properties: {
    	Sprite_bg:{default: null,type: cc.Sprite_},
    	Sprite_quality:{default: null,type: cc.Sprite_},
    	Sprite_icon:{default: null,type: cc.Sprite_},
    	Label_name:{default: null,type: cc.Label_},
    	node_star:{default: [],type: [cc.Node]},
    	Label_lv:{default: null,type: cc.Label_},
    	node_select:{default: null,type: cc.Node},
        Sprite_lock:{default: null,type: cc.Sprite_},
        Label_add:{default: null,type: cc.Node},
        sp_dot:{default: null,type: cc.Node},
        sp_lock_animation:{default: null,type: cc.Animation},
    },

    onLoad() {
        // this.initData();
    },
    onEnable() {
    },
    onDisable() {
    },
    initData() {

    },
    updatePackageView(data,callback = null) {
     	this._fairyInfo = data;
     	this._callbackPackage = callback;
     	if(this._fairyInfo){
     		this.setNormalFairy(this._fairyInfo);
     	}
    },
    setNormalFairy(fairyInfo){
        var fairyBaseConfig = Game.FairyModel.GetFairyBaseConfigById(fairyInfo.id);
        if (fairyBaseConfig){
            this.Sprite_icon.SetSprite(fairyBaseConfig.fairyhead);
            this.Sprite_quality.SetSprite(Game.FairyModel.GetFairyQualityIcon(fairyBaseConfig.fairycolor));
            this.Label_name.setText(fairyBaseConfig.fairyname);
            this.Label_name.node.color = Game.FairyModel.GetFairyLabelColor(fairyBaseConfig.fairycolor);
            if(fairyInfo.sumexp){
                var level = this.getLevelByExp(fairyBaseConfig.fairycolor,fairyInfo.sumexp,1);
                this.Label_lv.setText("Lv"+level);
            }else{
                this.Label_lv.setText("Lv"+fairyInfo.level);  
            }
            
            for (var i = 0; i < this.node_star.length; i++) {
	    		this.node_star[i].active = false;
	    		if(i < fairyInfo.star){
	                this.node_star[i].active = true;
	            }
	    	}
            if(fairyInfo.isSelected){
                this.node_select.active = true;
            }else{
                this.node_select.active = false;
            }
        }
    },
    getLevelByExp(color, exp, level){
        var arr = {};
        var eid = color*1000+level;
        var lessExp = exp;
        var fairyLevelConfig = Game.FairyModel.GetFairyLevelConfigById(eid);
        if(fairyLevelConfig){
            var needExp = fairyLevelConfig.needexp;
            lessExp = exp - needExp;
            if(lessExp >= 0 && needExp > 0){
                return this.getLevelByExp(color,lessExp,level+1);
            }else{
                return level;
            }
        }else{
            return level;
        }
    },

    updatePosView(data,callback = null){
    	this._fairyInfo = null;
    	this._pos = data.pos;
    	this._fairyInfo = data.fairyInfo;
     	this._callbackPos = callback;
     	this.Sprite_bg.setVisible(false);
     	this.node_select.active = false;
        if(this.sp_dot){
            this.sp_dot.active = false;
        }
        this.Sprite_lock.setVisible(false);
     	if(this._fairyInfo){
     		this.setPosFairy(this._fairyInfo);
            if(this.sp_dot && data.dot){
                this.sp_dot.active = true;
            }
     	}else{
            this.Sprite_lock.setVisible(data.unlock);
            if(data.dot && !data.unlock){
                this.sp_dot.active = false;
                if(Game.FairyModel.getLockFrame(data.pos) && this.sp_lock_animation ){
                    this.sp_lock_animation.node.active = true;
                    this.sp_lock_animation.play('effect_unlock');
                    let animState = this.sp_lock_animation.getAnimationState('effect_unlock');
                    if (animState) {
                        animState.on('finished', this.lastframeCallback,this);
                    }
                    Game.FairyModel.setLockFrame(data.pos);
                }else{
                    this.Label_add.active = true;
                    this.sp_dot.active = true;
                }
            }else{
                this.Label_add.active = !data.unlock;
            }
     		this.Sprite_icon.setVisible(false);
            this.Sprite_quality.setVisible(false);
     		this.Label_name.setText("");
            this.Label_lv.setText("");
     		for (var i = 0; i < this.node_star.length; i++) {
	    		this.node_star[i].active = false;
	    	}
         }
         if(this.from == 'observe'){
            this.Label_add.active = false;
         }
    },
    lastframeCallback(){
        this.sp_lock_animation.node.active = false;
        this.Label_add.active = true;
        this.sp_dot.active = true;

        if(this.from == 'observe'){
            this.Label_add.active = false;
         }
    },
    setPosFairy(fairyInfo){
    	if(fairyInfo.pos > 0){
    		if(fairyInfo.petid && fairyInfo.petid > 0 ){
    			var fairyBaseConfig = Game.FairyModel.GetFairyBaseConfigById(fairyInfo.pettid || 1);
                this.Sprite_lock.setVisible(false);
	    		this.Sprite_icon.setVisible(true);
                this.Sprite_quality.setVisible(true);
	    		this.Sprite_icon.SetSprite(fairyBaseConfig.fairyhead);
                this.Sprite_quality.SetSprite(Game.FairyModel.GetFairyQualityIcon(fairyBaseConfig.fairycolor));
	            this.Label_name.setText(fairyBaseConfig.fairyname);
	            this.Label_name.node.color = Game.FairyModel.GetFairyLabelColor(fairyBaseConfig.fairycolor);
                this.Label_lv.setText("");
	            for (var i = 0; i < this.node_star.length; i++) {
		    		this.node_star[i].active = false;
		    		if(i < fairyInfo.star){
		                this.node_star[i].active = true;
		            }
		    	}
    		}else{
    			this.node_select.active = true;
    			this.Sprite_icon.setVisible(false);
                this.Sprite_quality.setVisible(false);
    			this.Label_name.setText("");
                this.Label_lv.setText("");
    			for (var i = 0; i < this.node_star.length; i++) {
		    		this.node_star[i].active = false;
		    	}
    			// && Game.FairyModel.isFairyOpen(fairyInfo.pos)
                if(fairyInfo.isopen){
                    this.node_select.active = false;
                }
    		}
    		
    	}
    },

    onTouchCallBack(){
        // if(!Game._.get(this, 'data.unlock', 0)){
        //     var content = Game._.get(this, 'data.des', 0);
        //     Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, content);
        //     return;
        // }
    	if (Game._.isFunction(this._callbackPos)) {
            Game.Tools.InvokeCallback(this._callbackPos, Game._.get(this, '_pos', 0));
            return;
        }
    	if (Game._.isFunction(this._callbackPackage)) {
            Game.Tools.InvokeCallback(this._callbackPackage, Game._.get(this, '_fairyInfo.uuid', 0));
            return;
        }
    },
});
