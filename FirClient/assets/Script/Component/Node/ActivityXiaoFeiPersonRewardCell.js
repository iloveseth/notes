const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_desc: { default: null, type: cc.Label_ },
        btn_get_reward: { default: null, type: cc.Button_ },
        lab_get_reward: { default: null, type: cc.Label_ },
        SingleItemNodeTab: { default: [], type: [cc.Node] },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        this.lab_desc.string = this._data.des || "";
        
        let hasGet = this._data.hasGet;
        if(hasGet){
            this.btn_get_reward.interactable = false;
            this.lab_get_reward.string = "已领取";
        }else{
            let needSpend = this._data.num || 0;
            let curSpend = Game.ActiveModel.consume_curnum;
            if(curSpend >= needSpend){
                this.btn_get_reward.interactable = true;
                this.lab_get_reward.string = "领 取";
            }else{
                this.btn_get_reward.interactable = false;
                this.lab_get_reward.string = "未完成";
            };
        };

        for(let i = 0; i < 4; i++){
            this.SingleItemNodeTab[i].active = false;
        };
        //奖励物品
        let rewid = Game._.get(this._data,"reward",0);
        let rewardTable = Game.ItemModel.GenerateObjectsFromCommonReward(rewid);
        for(let i = 0; i < rewardTable.objs.length; i++){
            this.SingleItemNodeTab[i].getComponent('SingleItemNode').updateView(rewardTable.objs[i], this.onIconClick.bind(this));
            this.SingleItemNodeTab[i].active = true;
        };

    },

    obBtn_getReward_click(){
        //领取消费奖励
        let getId = Game._.get(this._data,"id",0);
        Game.NetWorkController.SendProto('consume.getConsumeReward', {type:getId});
    },

    onIconClick: function (item,info,src) {
        if (Game._.isFunction(Game._.get(this, '_target.onItemIconClick', null))) {
            let pos = src.node.parent.convertToWorldSpaceAR(src.node.position);
            this._target.onItemIconClick(info, pos);
        }
    },

});
