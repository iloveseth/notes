const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,
    properties: {
        label_hour: { default: null, type: cc.Label_ },
        label_additionper: { default: null, type: cc.Label_ },
        label_additionlasttime: { default: null, type: cc.Label_ },
        label_price: { default: null, type: cc.Label_ },
        label_lasttime: { default: null, type: cc.Label_ },
        nodes_reward: { default: [], type: [require('./SingleItemNode')] }
    },
    onEnable: function () {
        this.label_hour.setText(Game.LevelModel.GetFastFightValue());
        this.label_additionper.setText(Game.LevelModel.GetFastFightAdditionPercent());
        this.label_additionlasttime.setText(Game.LevelModel.GetFastFightAdditionLastTime());
        this.label_price.setText(Game.LevelModel.GetFastFightCost());
        this.label_lasttime.setText(Game.LevelModel.GetFastFightTimes());
        //构造奖励
        let coinnum = Game.LevelModel.GetCoinSpeed() * 120 * 60;
        let coinReward = Game.ItemModel.GenerateObjectFromDefine(Game.ItemModel.GetItemConfig(Game.ItemDefine.SPECIALITEM_TYPE.TYPE_MONEY), coinnum);
        let expnum = Game.LevelModel.GetExpSpeed() * 120 * 60;
        let expReward = Game.ItemModel.GenerateObjectFromDefine(Game.ItemModel.GetItemConfig(Game.ItemDefine.SPECIALITEM_TYPE.TYPE_EXP), expnum);
        let define = Game.ConfigController.GetConfigById('newmap_data', Game.LevelModel.GetCurMapId());
        let equipnum = Game._.get(define, 'percent', 0) * 120 / 10000;
        let equipReward = Game.ItemModel.GenerateObjectFromDefine(Game.ItemModel.GetItemConfig(Game.ItemDefine.SPECIALITEM_TYPE.TYPE_EQUIP), equipnum);
        this.nodes_reward[0].updateView(coinReward, function () { });
        this.nodes_reward[1].updateView(expReward, function () { });
        this.nodes_reward[2].updateView(equipReward, function () { });
    },
    //====================  按钮回调  ====================
    onBuyClick: function () {
        // Game.LevelModel.GetFastFightCost()
        Game.Platform.SetTDEventData(Game.Define.TD_EVENT.EventFastFightBuy,{gold:Game.LevelModel.GetFastFightCost(), times:1, charid:Game.UserModel.GetCharid()});
        Game.NetWorkController.SendProto('msg.ReqBuyFastFight', {});
        this.onClose();
    }
});
