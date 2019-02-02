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

        for (let i = 0; i < 4; i++) {
            this.SingleItemNodeTab[i].active = false;
        };

        let rewardId = 0;
        let rewardState = 0;
        this._rewardTable = null;
        let curActType = Game.ActiveModel.getCurrentActivity();
        if (curActType == Game.Define.ActivityType.LOGIN_ACTIVITY) {
            //7日登陆奖励
            let tempData = this._data;
            this.lab_desc.string = Game._.get(tempData, "info", "");
            rewardState = Game._.get(tempData, "rewardState", 0);
            rewardId = Game._.get(tempData, "reward", 0);
            // this._rewardTable = Game.ConfigController.GetConfigById("commonreward_data",rewardId);
        } else if (curActType == Game.Define.ActivityType.LEIJI_ACTIVITY) {
            //累计充值
            this.btn_get_reward.node.active = false;//有两个活动没有领取按钮
        } else if (curActType == Game.Define.ActivityType.LIMIT_ACTIVITY) {
            //限时奖励
        } else if (curActType == Game.Define.ActivityType.COSTSORT_ACTIVITY) {
            //消费榜
            this._rewardTable = Game.ConfigController.GetConfigById("award_data", rewardId);
        };


        //0 已经领取 1 不可以领取 2 可以领取 
        if (rewardState == 0) {
            this.btn_get_reward.interactable = false;
            this.lab_get_reward.string = "已领取"
        } else if (rewardState == 1) {
            this.btn_get_reward.interactable = false;
            this.lab_get_reward.string = "未完成"
        } else if (rewardState == 2) {
            this.btn_get_reward.interactable = true;
            this.lab_get_reward.string = "领取"
        }

        //奖励物品
        this._rewardTable = Game.ItemModel.GenerateObjectsFromCommonReward(rewardId);
        for (let i = 0; i < this._rewardTable.objs.length && i < 4; i++) {
            this.SingleItemNodeTab[i].getComponent('SingleItemNode').updateView(this._rewardTable.objs[i], this.onItemClickedCallback.bind(this));
            this.SingleItemNodeTab[i].active = true;
        }
    },

    obBtn_getReward_click() {
        let curActType = Game.ActiveModel.getCurrentActivity();
        if (curActType == Game.Define.ActivityType.LOGIN_ACTIVITY) {
            let msg = {};
            msg.id = this._data.id;
            Game.NetWorkController.SendProto('act.getReward', msg);
        } else if (curActType == Game.Define.ActivityType.LEIJI_ACTIVITY) {

        } else if (curActType == Game.Define.ActivityType.LIMIT_ACTIVITY) {

        } else if (curActType == Game.Define.ActivityType.COSTSORT_ACTIVITY) {

        };
    },
    onItemClickedCallback: function (id) {
        if (Game._.isFunction(Game._.get(this, '_target.onItemClickedCallback', null))) {
            var index = Game._.findIndex(this._rewardTable.objs,{baseid : id});
            if(index >= 0){
                let pos = this.SingleItemNodeTab[index].parent.convertToWorldSpaceAR(this.SingleItemNodeTab[index].position);
                this._target.onItemClickedCallback(id, pos);  
            }
                
        }
    },
});
