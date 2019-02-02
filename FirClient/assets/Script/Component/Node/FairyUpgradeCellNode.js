// FairyUpgradeCellNode.js
const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        node_bg: { default: null, type: cc.Node },
        node_head: { default: null, type: cc.Node },
        Sprite_quality:{default: null,type: cc.Sprite_},
    	Sprite_icon:{default: null,type: cc.Sprite_},
    	node_star:{default: [],type: [cc.Node]},
    	Label_name:{default: null,type: cc.Label_},
        Label_lv:{default: null,type: cc.Label_},
    },
    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._index = index;
        this._data = data.array[index];
        if (this._data) {
            this.node_bg.active = false;
            this.node_head.active = true;
            this.setFairyInfo(this._data);
        } else {
            this.node_bg.active = true;
            this.node_head.active = false;
        }
    },
    setFairyInfo(fairyInfo) {
        var fairyBaseConfig = Game.FairyModel.GetFairyBaseConfigById(fairyInfo.id);
        if (fairyBaseConfig){
            this.Sprite_icon.SetSprite(fairyBaseConfig.fairyhead);
            this.Sprite_quality.SetSprite(Game.FairyModel.GetFairyQualityIcon(fairyBaseConfig.fairycolor));
            var level = this.getLevelByExp(fairyBaseConfig.fairycolor,fairyInfo.sumexp,1);
            this.Label_lv.setText("Lv"+level);
            // this.Label_name.setText(fairyBaseConfig.fairyname);
            // this.Label_name.node.color = Game.FairyModel.GetFairyLabelColor(fairyBaseConfig.fairycolor);
            for (var i = 0; i < this.node_star.length; i++) {
	    		this.node_star[i].active = false;
	    		if(i < fairyInfo.star){
	                this.node_star[i].active = true;
	            }
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
            if(lessExp > 0){
                return this.getLevelByExp(color,lessExp,level+1);
            }else{
                return level;
            }
        }else{
            return level;
        }
    },
    onTouchCallback(){
    	if(this._target){
    		if(this._data){
    			this._target.onTouchCallbackData(this._index);
    		}else{
    			this._target.onTouchCallbackNil();
    		}
    	}
    },
});