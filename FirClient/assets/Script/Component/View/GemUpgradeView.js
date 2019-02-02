// GemUpgradeView.js
const Game = require('../../Game');

cc.Class({

	extends: cc.GameComponent,

	properties: {
		lab_silver_spend:{default: null,type: cc.Label_},
		lab_gem_spend:{default: null,type: cc.Label_},
		lab_upgrade_rate:{default: null,type: cc.Label_},
		lab_luckly_value:{default: null,type: cc.Label_},
		lab_name:{default: null,type: cc.Label_},
		nodeItems:{default: [], type: [cc.Node]},
    	node_item:{default: null, type: cc.Node},
		lab_onclick:{default: null,type: cc.Label_},
		DragonBone_succ: { default: null, type: sp.Skeleton },
		DragonBone_fail: { default: null, type: sp.Skeleton },
		lucky_progress_bar:{default: null,type: cc.ProgressBar},
    },

    onLoad() {
		  this.initDragonBone();
    },

    setData(data) {
      	this._singleItemComponent = this.node_item.getComponent('SingleItemNode');
      	this._isOneClicking = false;
        this._itemInfo = null;
        this._thisId = 0;
        this.updateView(data);
    },
    
    onEnable() {
    	 this.initNotification();
    },

    onDisable() {
        this.removeNotification();
		this.setOnClicking(false);
		this.removeSchedule();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.STONE_LEVEL_UP,this,this.onInfoRefresh);
        Game.NotificationController.On(Game.Define.EVENT_KEY.RET_STONE_LUCKY,this,this.onLuckyInfoRefresh);
    },
    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.STONE_LEVEL_UP,this,this.onInfoRefresh);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RET_STONE_LUCKY,this,this.onLuckyInfoRefresh);
	},

	initDragonBone() {
		this.DragonBone_succ.node.active = false;
		this.DragonBone_fail.node.active = false;
	},
	
    onInfoRefresh(data) {
    	// 失败特效
    	if(data.success){

        if(this._thisId == 0){
            this._itemInfo.baseid = this._itemInfo.baseid+1;
            this.updateView(this._itemInfo);
        }else{
            var item = Game.ItemModel.GetItemByBaseId(this._itemInfo.baseid+1)
            if(item){
              this.updateView(item);
            }
        }
        this.removeSchedule();
  			this.DragonBone_succ.node.active = true;
  			// this.DragonBone_succ.playAnimation('Sprite', 1);
        this.DragonBone_succ.setAnimation(0,'animation',false);
    	}else{
    		this.updateView(this._itemInfo);
  			this.DragonBone_fail.node.active = true;
  			// this.DragonBone_fail.playAnimation('Sprite', 1);
         this.DragonBone_fail.setAnimation(0,'animation',false);
    	}
    },
    onLuckyInfoRefresh(data){
    	var tNumMax = this._stoneConfig.maxlucky;
  		var tNumCur = data.num > tNumMax && tNumMax || data.num;
  		this.lab_luckly_value.setText(tNumCur + "/"+tNumMax);
  		var progress = tNumCur/tNumMax;
  		this.lucky_progress_bar.progress = progress;
    },

    updateView(t_Object) {
    	this._thisId = t_Object.thisid;
		  this._itemInfo = t_Object;
		  cc.log(this._itemInfo);
    if(this._itemInfo){
			this._stoneUpConfig = Game.ItemModel.GetStoneUpDataConfig(this._itemInfo.baseid);
      var baseConfig = Game.ItemModel.GetItemConfig(this._itemInfo.baseid);
      this._level = baseConfig.level;
			this._stoneConfig = Game.ItemModel.GetStoneDataConfig(this._level);
			this.materialItem = Game.ItemModel.GetItemByBaseId(this._stoneUpConfig.needid);
			if(!this.materialItem){
				this.materialItem = Game.ItemModel.GetItemConfig(this._stoneUpConfig.needid);
			}
			this.materialItemNum = Game.ItemModel.GetItemNumById(this._stoneUpConfig.needid);
        	Game.NetWorkController.SendProto('msg.reqStoneLucky',{level:this._level});
        	// 获取材料
        	// baseid && 
        	if (this._singleItemComponent){
              if(this._thisId == 0){
                t_Object.num = 1;
                t_Object.color = baseConfig.color;
              }
	            this._singleItemComponent.updateView(t_Object);
	            this.lab_name.setText(baseConfig.name);
	            this.lab_name.node.color = Game.ItemModel.GetItemLabelColor(baseConfig.color);
	        }

	        var tNumHas = Game.ItemModel.GetItemNumById(this._stoneUpConfig.needid);
	        var tLength = Math.min(tNumHas , this._stoneUpConfig.num);
	        for (var i = 0; i < 4; i++) {
	        	var item = this.materialItem;
	        	this.nodeItems[i].active = false;
				var name_lab = this.nodeItems[i].parent.getChildByName('Label_Name').getComponent('Label_');
				if(name_lab){
					name_lab.node.active = false;
				}
	        	if((i+1) <= tLength){
	        		this.nodeItems[i].active = true;
	        		var singleItem = this.nodeItems[i].getComponent('SingleItemNode');
	        		
	        		if(singleItem){
	        			singleItem.updateView(item);
	        			singleItem.setNumVisible(false);
	        		}
	        		if(name_lab){
                		name_lab.node.active = true;
	        			name_lab.string = item.name;
	        			name_lab.node.color = Game.ItemModel.GetItemLabelColor(item.color);
	        		}
	        	}
	        }
	        if(this._stoneUpConfig.needid > 0 && this._stoneUpConfig.num > 0){
	        	var money = Game.UserModel.GetMoney();
		        this.lab_silver_spend.setText(Game.Tools.UnitConvert(money)+"/"+Game.Tools.UnitConvert(this._stoneUpConfig.money));
		        this.lab_silver_spend.node.color = money>=this._stoneUpConfig.money && cc.color(8,255,8) || cc.color(255,0,0);

		        this.lab_gem_spend.setText(this.materialItemNum +"/"+this._stoneUpConfig.num);
		        this.lab_gem_spend.node.color = this.materialItemNum>=this._stoneUpConfig.num && cc.color(8,255,8) || cc.color(255,0,0);
		        this.lab_upgrade_rate.setText(this._stoneUpConfig.per + "%");

		        this.lab_luckly_value.setText("0/"+this._stoneConfig.maxlucky);
		        this.lucky_progress_bar.progress = 0;
	        }else{
            for (var i = 0; i < 4; i++) {
                this.nodeItems[i].active = false;
                var name_lab = this.nodeItems[i].parent.getChildByName('Label_Name').getComponent('Label_');
                if(name_lab){
                    name_lab.node.active = false;
                }
            }
            this.lab_silver_spend.setText("宝石已达最高级，不能升级！");
            // this.lab_silver_spend.node.color(cc.color(8,255,8));
            this.lab_gem_spend.setText("");
            this.lab_upgrade_rate.setText("");
            this.lab_luckly_value.setText("0/"+this._stoneConfig.maxlucky);
            this.lucky_progress_bar.progress = 0;
	        }
        }

    },
    checkCanUpgrade(){
    	if(this._stoneUpConfig.needid == 0 && this._stoneUpConfig.num == 0){
    		return false;
    	}
    	var money = Game.UserModel.GetMoney();
    	if(money<this._stoneUpConfig.money){
   			return false;
   		}
   		if(this.materialItemNum<this._stoneUpConfig.num){
   			return false;
		   }
		
		if(this._level == 10){
			return false;
		}
   		return true;
    },
    oneClickedUpgrading(){
  		 // Game.NetWorkController.SendProto('msg.levelUpStone', {stonethisids : this._thisId}); 
      if(this._thisId != 0){
            Game.NetWorkController.SendProto('msg.levelUpStone', {stonethisids : this._thisId});
      }else if(this._itemInfo != null){

           Game.NetWorkController.SendProto('msg.levelUpStone', {equipthisid:this._itemInfo.equipId ,pos: this._itemInfo.pos});
      }
       if(!this.checkCanUpgrade()){
          this.removeSchedule();
       }
    },
    setOnClicking(bool){
    	if(bool){
    		this._isOneClicking = true;
    		this.lab_onclick.setText("停止一键");
    	}else{
    		this._isOneClicking = false;
    		this.lab_onclick.setText("一键升级");
    	}
    },

   	onTouchUpgrade() {
   		// var money = Game.UserModel.GetMoney();
   		// if(money<this._stoneUpConfig.money){
		// 	// 提示 银币不足
		// 	this.showTips('银币不足!');
   		// 	return;
   		// }
   		// if(this.materialItemNum<this._stoneUpConfig.num){
   		// 	// 宝石不足
		// 	this.showTips('宝石不足!');
   		// 	return;
   		// }
   		if (this._isOneClicking){
   			return;
   		}
        if(this._thisId != 0){
            Game.NetWorkController.SendProto('msg.levelUpStone', {stonethisids : this._thisId});
        }else if(this._itemInfo != null){

             Game.NetWorkController.SendProto('msg.levelUpStone', {equipthisid : this._itemInfo.equipId,pos: this._itemInfo.pos});
        }
        
   	},
   	onTouchOneClickUpgrade() {
   		if (this._isOneClicking){
   			this.removeSchedule();
   		}else{
        this.node.stopAllActions();
        this.node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.5),cc.callFunc(this.oneClickedUpgrading, this))));

   			this.setOnClicking(true);
   		}
   	},
    removeSchedule(){
      this.node.stopAllActions();
      this.setOnClicking(false);
    },
});