const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        sprite_item0:{ default: null, type: cc.Sprite_ },
        sprite_quality0:{ default: null, type: cc.Sprite_ },
        label_num0:{default: null,type: cc.Label_},

        sprite_item1:{ default: null, type: cc.Sprite_ },
        sprite_quality1:{ default: null, type: cc.Sprite_ },
        label_num1:{default: null,type: cc.Label_},

        labels_cost:{default:[],type:cc.Label_},
        labels_costnum:{default:[],type:cc.Label_},
        labels_neednum:{default:[],type:cc.Label_},

        labels_get:{default:[],type:cc.Label_},
        labels_getnum:{default:[],type:cc.Label_},

        label_title: {default: null,type: cc.Label_},
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    onEnable(){
        this.init();
        this.updateView();
        this.initNotification();
    },

    onDisable(){
        this.removeNotification();
    },

    initNotification() {
        Game.NetWorkController.AddListener('msg.insufficientNotice', this, this.onInsufficientNotice);
        Game.NetWorkController.AddListener('msg.RefreshObject', this, this.onRefreshObject);
        Game.NetWorkController.AddListener('msg.ComposeItemResult', this, this.onComposeItemResult);
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('msg.insufficientNotice', this, this.onInsufficientNotice);
        Game.NetWorkController.RemoveListener('msg.RefreshObject', this, this.onRefreshObject);
        Game.NetWorkController.RemoveListener('msg.ComposeItemResult', this, this.onComposeItemResult);
    },

    onInsufficientNotice(result,data){

    },
    onRefreshObject(result,data){
        data.objs.forEach(e => {
            if(e.baseid == this._data.baseid){
                this._data.num = e.num;
            }
        });
        this.updateView();
    },
    onComposeItemResult(result,data){
    },

    exchangeStones(all){
        var msg = {
            id: this.target.ID,
            composall: all,
        }
        Game.NetWorkController.SendProto('msg.ComposeItem',msg);
    },

    onTouchExchange(){
        cc.log('兑换一个天魔石')
        this.exchangeStones(false);
    },

    onTouchExchangeBatch(){
        cc.log('批量兑换天魔石');
        this.exchangeStones(true);
    },

    init(){
        this.target = null;
        this.itemConfig = Game.ItemModel.GetItemConfig(this._data.baseid);

        this.targets = Game.ConfigController.GetConfig('sitemcompose_data');
        this.targets.forEach(e => {
            if(e.itemid == this._data.baseid){
                this.target = e;
            }
        });

        this.label_title.string = this.target.title;

        this.itemTargetCfg = Game.ItemModel.GetItemConfig(this.target.resitem);
    },
    updateView(){
        this.sprite_item0.SetSprite(this.itemConfig.pic);
        this.sprite_quality0.SetSprite(Game.ItemModel.GetItemQualityIcon(this.itemConfig.color));
        this.label_num0.string = Game.Tools.UnitConvert(Game.ItemModel.GetItemNumById(this._data.baseid));

        this.sprite_item1.SetSprite(this.itemTargetCfg.pic);
        this.sprite_quality1.SetSprite(Game.ItemModel.GetItemQualityIcon(this.itemTargetCfg.color));
        this.label_num1.string = Game.Tools.UnitConvert(Game.ItemModel.GetItemNumById(this.target.resitem));

        var gold = this.target.gold;
        var money = this.target.money;

        var coinObj = {};
        if(gold > 0){
            coinObj.amount = gold;
            coinObj.name = '金币'
            coinObj.needCoin = gold;
            coinObj.myCoin = Game.UserModel.GetGold();
        }
        if(money > 0){
            coinObj.amount = money;
            coinObj.name = '银币'
            coinObj.needCoin = money;
            coinObj.myCoin = Game.UserModel.GetMoney();
        }

        this.labels_cost[0].string = this._data.name;
        this.labels_cost[1].string = coinObj.name;

        this.labels_costnum[0].string = `${Game.Tools.UnitConvert(this._data.num)}`;
        this.labels_costnum[1].string = `${Game.Tools.UnitConvert(coinObj.myCoin)}`
        this.labels_neednum[0].string = `/${Game.Tools.UnitConvert(this.target.itemnum)}`;
        this.labels_neednum[1].string = `/${Game.Tools.UnitConvert(coinObj.needCoin)}`

        if(this._data.num < this.target.itemnum){
            this.labels_costnum[0].node.color = cc.Color.RED;
        }
        if(coinObj.myCoin < coinObj.needCoin){
            this.labels_costnum[1].node.color = cc.Color.RED;
        }

        this.labels_get[0].string = this.itemTargetCfg.name;
        this.labels_getnum[0].string = `*${this.target.resitemnum}`


    },

    // update (dt) {},
});
