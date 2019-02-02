// FairyPictureCellNode.js
const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        Sprite_icon:{default: null,type: cc.Sprite_},
    	Label_name:{default: null,type: cc.Label_},
    	node_select:{default: null,type: cc.Node},
    },
    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        this._callback = data.callback;
        if (this._data) {
            this.node.active = true;
            this.setFairyInfo(this._data);
        } else {
            this.node.active = false;
        }
    },
    setFairyInfo(fairyInfo) {
       	this.Sprite_icon.SetSprite(fairyInfo.fairyhead);
        this.Label_name.setText(fairyInfo.fairyname);
        this.Label_name.node.color = Game.FairyModel.GetFairyLabelColor(fairyInfo.fairycolor);
        if(fairyInfo.selected){
        	this.node_select.active = true;
        }else{
        	this.node_select.active = false;
        }

    },
    onTouchCallback(){
        if(Game._.isFunction(this._callback)){
            Game.Tools.InvokeCallback(this._callback,Game._.get(this, '_data.id',0));
            return;
        }
    },
});