const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_round: { default: null, type: cc.Label_ },
        spr_item_1: { default: null, type: cc.Sprite_ },
        spr_item_2: { default: null, type: cc.Sprite_ },
        spr_item_3: { default: null, type: cc.Sprite_ },
        lab_item_num_1: { default: null, type: cc.Label_ },
        lab_item_num_2: { default: null, type: cc.Label_ },
        lab_item_num_3: { default: null, type: cc.Label_ },
    },

    onLoad() {
 
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        let rewardId = this._data.id;
        let round_min = this._data.roundmin;
        let round_max = this._data.roundmax;

        let rank_desc = "";
        if(round_max == null){
            rank_desc = cc.js.formatStr("第%d名",round_min);
        }else{
            rank_desc = cc.js.formatStr("第%d名至第%d名",round_min,round_max);
        }
        this.lab_round.string = rank_desc;

        let rewardData = Game.ConfigController.GetConfigById("award_data",rewardId);
        let money_num = rewardData.money;//银子
        let gold_num = rewardData.gold;//金子
        let fame_num = rewardData.fame;//声望

        this.lab_item_num_1.string = Game.Tools.UnitConvert(money_num);
        this.lab_item_num_2.string = gold_num;
        this.lab_item_num_3.string = fame_num;

    },

    onEnable() {
        this.initNotification();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        
    },

    removeNotification() {
        
    },
    
    clicked() {
    	cc.log("lay GymRewardCellNode clicked");
       
    },

    onBtn_item_click(event,item_num){


    },

});