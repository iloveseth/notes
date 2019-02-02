const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_desc: { default: null, type: cc.Label_ },
        btn_get_reward: { default: null, type: cc.Button_ },
        lab_get_reward: { default: null, type: cc.Label_ },
        lab_percent: { default: null, type: cc.Label_ },
        SingleItemNodeTab: { default: [], type: [cc.Node] },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        let desc_str = Game._.get(this._data,"info","");
        this.lab_desc.string = desc_str;
        this.btn_get_reward.node.active = true;

        let rewardId = Game._.get(this._data,"reward",0);
        // 状态 0 已经领取 1 不可以领取 2 可以领取
        let rewardState = Game._.get(this._data,"rewardState",0);
        if(rewardState == 0){
            this.lab_get_reward.string = "已领取";
            this.btn_get_reward.interactable = false;
        }else if (rewardState == 1){
            this.lab_get_reward.string = "未完成";
            this.btn_get_reward.interactable = false;
        }else if (rewardState == 2){
            this.lab_get_reward.string = "领 取";
            this.btn_get_reward.interactable = true;
        }

        for(let i = 0; i < 4; i++){
            this.SingleItemNodeTab[i].active = false;
        };
        //奖励物品
        let rewardTable = Game.ItemModel.GenerateObjectsFromCommonReward(rewardId);
        for(let i = 0; i < rewardTable.objs.length; i++){
            this.SingleItemNodeTab[i].getComponent('SingleItemNode').updateView(rewardTable.objs[i], this.onIconClick.bind(this));
            this.SingleItemNodeTab[i].active = true;
        };

        let id = Game._.get(this._data,"id",0);
        let rewardnum = Game._.get(this._data,"rewardnum",0);
        if(id == 5 || id == 6){
            this.lab_percent.string = "已发放"+Game.ActiveModel.getGainNumById(id)+"/"+rewardnum;
            this.btn_get_reward.node.active = false;
        }else{
            this.lab_percent.string = "";
        }

    },

    onIconClick: function (item,info,src) {
        if (Game._.isFunction(Game._.get(this, '_target.onItemIconClick', null))) {
            let pos = src.node.parent.convertToWorldSpaceAR(src.node.position);
            this._target.onItemIconClick(info, pos);
        }
    },

    obBtn_getReward_click(){
        //领取累计充值奖励
        let getId = Game._.get(this._data,"id",0);
        Game.NetWorkController.SendProto('act.getZoneLimitReward', {id:getId});
    },









});
