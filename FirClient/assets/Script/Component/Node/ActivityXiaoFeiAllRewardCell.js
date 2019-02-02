const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_desc: { default: null, type: cc.Label_ },
        SingleItemNodeTab: { default: [], type: [cc.Node] },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        this.lab_desc.string = this._data.des || "";

        for(let i = 0; i < 4; i++){
            this.SingleItemNodeTab[i].active = false;
        };
        //奖励物品
        let rewid = Game._.get(this._data,"reward",0);
        let rewardTable = Game.ItemModel.GenerateObjectsFromAwardReward(rewid);
        for(let i = 0; i < rewardTable.objs.length; i++){
            this.SingleItemNodeTab[i].getComponent('SingleItemNode').updateView(rewardTable.objs[i], this.onIconClick.bind(this));
            this.SingleItemNodeTab[i].active = true;
        };

    },

    onIconClick: function (item,info,src) {
        if (Game._.isFunction(Game._.get(this, '_target.onItemIconClick', null))) {
            let pos = src.node.parent.convertToWorldSpaceAR(src.node.position);
            this._target.onItemIconClick(info, pos);
        }
    },

});
