// TeamHeadNode.js
const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,
    properties: {
    	// Sprite_bg:{default: null,type: cc.Sprite_},
    	// Sprite_quality:{default: null,type: cc.Sprite_},
    	Sprite_icon:{default: null,type: cc.Sprite_},
    	Label_name:{default: null,type: cc.Label_},
    	
    	
        // Label_add:{default: null,type: cc.Node},
        kill_node:{default: null,type: cc.Node},
        Label_kill:{default: null,type: cc.Label_},
        btn_kick:{default: null,type: cc.Node},
    },

    onLoad() {
    },
    onEnable() {
    },
    onDisable() {
    },
    initData() {
    },
    updateView(data,callback = null) {
     	this._info = data;
     	this._callback = callback;
     	if(this._info){
     		this.setInfo(this._info);
     	}else{
     		this.Sprite_icon.setVisible(false);
     		this.Label_name.setText('');
     		this.btn_kick.active = false;
     		this.kill_node.active = false;
     	}
    },
    setInfo(info){
    	if(this._callback){
    		this.btn_kick.active = true;
    		this.kill_node.active = false;
    		if(info.charid == Game.UserModel.GetCharid()){
	    		this.btn_kick.active = false;
	    	}
    	}else{
    		this.btn_kick.active = false;
    		this.kill_node.active = true;
    		this.Label_kill.setText(info.killnum); 
    	}
    	this.Sprite_icon.setVisible(true);
    	this.Sprite_icon.SetSprite(Game.UserModel.GetPlayerIcon(info.face));
    	this.Label_name.setText(info.name);
    },
    onTouchCallBack(){
    	if (Game._.isFunction(this._callback)) {
            Game.Tools.InvokeCallback(this._callback, Game._.get(this, '_info.charid', 0));
            return;
        }
    },
});
