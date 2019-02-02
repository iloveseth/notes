const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        Node_equipModule: { default: null, type: cc.Node },
        Sprite_red: { default: null, type: cc.Sprite_ },
    },

    onLoad() {
        this._equipModuleComponet = this.Node_equipModule.getComponent('EquipModuleNode');
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        if (this._data && this._equipModuleComponet) {
            this._equipModuleComponet.updateView(this._data, index);
            this.Sprite_red.node.active = index == 0 && Game.EquipModel.FindEquipNewFlagByType(this._data.type);
        }
    },

    clicked() {      
    },
});
