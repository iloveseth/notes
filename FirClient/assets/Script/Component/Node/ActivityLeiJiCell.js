const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_desc: { default: null, type: cc.Label_ },
        btn_get_reward: { default: null, type: cc.Button_ },
        lab_get_reward: { default: null, type: cc.Label_ },
        SingleItemNodeTab: { default: [], type: [cc.Node] },
        lab_need_rechargec: { default: null, type: cc.Label_ },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        //奖励id
        let rewardlvl = Game._.get(this._data,"rewardlvl",0);
        //礼包id
        let rewid = Game._.get(this._data,"rewardid",0);
        // 状态 enumChargeGetStatus 0 已经领取 1 不可以领取 2 可以领取
        let status = Game._.get(this._data,"status",0);
        //本档共需要多少钱
        let totalmoney = Game._.get(this._data,"totalmoney",0);
        //本档剩余多少钱
        let leftmoney = Game._.get(this._data,"leftmoney",0);

        this.lab_desc.string = cc.js.formatStr("累计充值%d元可以领取",totalmoney/100);

        if(status == 0){
            this.lab_get_reward.string = "已领取";
            this.btn_get_reward.interactable = false;
        }else if (status == 1){
            this.lab_get_reward.string = "未完成";
            this.btn_get_reward.interactable = false;
        }else if (status == 2){
            this.lab_get_reward.string = "领 取";
            this.btn_get_reward.interactable = true;
        }

        if(leftmoney == 0){
            this.lab_need_rechargec.string = "";
        }else{
            this.lab_need_rechargec.string = cc.js.formatStr("还需充值%d元",leftmoney/100);
        }

        for(let i = 0; i < 4; i++){
            this.SingleItemNodeTab[i].active = false;
        };
        //奖励物品
        let rewardTable = Game.ItemModel.GenerateObjectsFromCommonReward(rewid);
        let objects = Game._.get(rewardTable,"objs",[]);
        if(objects.length == 0){
            cc.log("rewid == "+rewid);
        }
        for(let i = 0; i < objects.length; i++){
            this.SingleItemNodeTab[i].getComponent('SingleItemNode').updateView(objects[i], this.onIconClick.bind(this));
            this.SingleItemNodeTab[i].active = true;
        };

    },

    onIconClick: function (item,info,src) {
        if (Game._.isFunction(Game._.get(this, '_target.onItemIconClick', null))) {
            let pos = src.node.parent.convertToWorldSpaceAR(src.node.position);
            this._target.onItemIconClick(info, pos);
        }
    },

    obBtn_getReward_click(){
        //领取累计充值奖励
        let getId = Game._.get(this._data,"rewardlvl",0);
        Game.NetWorkController.SendProto('act.reqTotalChargeReward', {rewardlvl:getId});
    },









});
