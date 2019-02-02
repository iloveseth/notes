// ChatMenuTableCellNode.js
const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_name: { default: null, type: cc.Label_ },
        spr_icon: { default: null, type: cc.Sprite_ },
        sprite_online: { default: null, type: cc.Sprite_ },
        lab_selt_name:{ default: null, type: cc.Label_ },
    },

    onLoad() {
        this._data = null;
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        this._callback = data.callback;
        // this.lab_richtext.setRichTarget(this);
        this.spr_icon.setVisible(false);
        if (this._data){
            this.setChatInfo(this._data);
        }
    },
    onEnable() {
    },
    onDisable() {
    },
    setChatInfo(data){
    	if(data){
    		this.lab_name.setText(data.name);
             this.lab_selt_name.setText('');
    		// this.sprite_online.setVisible(data.online == 1);
    		// data.titleshow
    		// this.spr_icon.SetSprite();
            if(data.select){
                // 选中状态
                this.spr_icon.setVisible(true);
                this.lab_name.setText('');
                this.lab_selt_name.setText(data.name);
            }
    	}
    },
    onTouchCallback(){
    	if(Game._.isFunction(this._callback)){
    		Game.Tools.InvokeCallback(this._callback, Game._.get(this, '_data', 0));
            return;
    	}
    },
});