const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_item: {default:null, type:cc.Node},
        item_name: {default: null,type: cc.Label_},
        button_upgrade: {default: null, type: cc.Button_},
        button_upgradeluck: {default: null, type: cc.Button_},
        label_desc: {default: null, type: cc.Label_},
        label_effect: {default: null, type: cc.Label_},
        label_stone: {default: null, type: cc.Label_},
        label_money: {default: null, type: cc.Label_},
        label_luck: {default: null, type: cc.Label_},
        node_stars: {default: null, type: cc.Node},

        label_stonetag:{default: null, type: cc.Label_},
        label_moneytag:{default: null, type: cc.Label_},
        label_lucktag:{default: null, type: cc.Label_},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.button_upgrade.node.on('click',this.onTouchUpgrade.bind(this,false));
        this.button_upgradeluck.node.on('click',this.onTouchUpgrade.bind(this,true));
    },

    onTouchUpgrade(useluck){
        
        if(this.upstardata.star == 30){
            //飘字提示
            this.showTips('已达到最高星级，无法升星');
            return;
        }
        var msg = {
            stonethisid:this._data.thisid,
            useluck: useluck,
        }
        Game.NetWorkController.SendProto('msg.reqStarupStarStone',msg);
    },

    onEnable(){
        cc.log(this._data);
        this.init();
        this.updateView();
        this.initNotification();
    },

    init(){
        this._singleItemNode = this.node_item.getComponent('SingleItemNode');
        this.itemConfig = Game.ItemModel.GetItemConfig(this._data.baseid);
        Game.ConfigController.GetConfig('starcost_data').forEach(e => {
            if(e.star == this._data.baseid - 249){
                this.upstardata = e;
            }
        });
        cc.log(this.upstardata);
    },

    showStar(star){
        var clipIdx = Game.EquipModel.GetStarEffectIndex(star)
        var starFull = Math.floor(star/2);
        var starGrey = Math.floor(star%2)
        for(var idx = 0;idx != 15; ++idx){
            var starNode = this.node_stars.children[idx];
            if(idx < starFull){
                starNode.active = true;
                starNode.getComponent(cc.Animation).play(`effect_start${clipIdx}`)
            }
            if(idx == starFull){
                starNode.active = starGrey > 0;
                starNode.getComponent(cc.Animation).play(`effect_bxstar${clipIdx}`)
            }
            if(idx > starFull){
                starNode.active = false;
            }
        }
    },

    updateView(){
        this._singleItemNode.updateView(this._data);
        this.item_name.string = this._data.name;
        this.label_desc.string = this.itemConfig.info;
        
        var star = this.upstardata.star;
        if(star == 30){
            this.label_moneytag.node.active = false;
            this.label_stonetag.node.active = false;
            this.label_lucktag.node.active = false;

            this.label_effect.string = `已升至最高级`;

            this.button_upgradeluck.interactable = false;
        }
        else{
            this.label_moneytag.node.active = true;
            this.label_stonetag.node.active = true;
            this.label_lucktag.node.active = true;

            this.label_effect.string = `增加升星石星级(成功率${this.upstardata.per}%)`;

            var myStone = Game.ItemModel.GetItemNumById(1);
            this.label_stone.string = `${myStone}/5`;
            this.label_stone.node.color = myStone < 5 ? cc.Color.RED : cc.Color.GREEN;

            var myMoney = Game.UserModel.GetMoney();
            var needMoney = this.upstardata.cost;
            this.label_money.string = `${myMoney}/${needMoney}`;
            this.label_money.node.color = (myMoney < needMoney) ? cc.Color.RED : cc.Color.GREEN;

            var myLuck = Game.MainUserModel.GetMainData().starlucknum;
            var needLuck = this.upstardata.costluck;
            this.label_luck.string = `${myLuck}/${needLuck}`;
            this.label_luck.node.color = myLuck < needLuck ? cc.Color.RED : cc.Color.GREEN;
            this.button_upgradeluck.interactable = myLuck >= needLuck;
        }
        

        this.showStar(this.upstardata.star);
    },

    onDisable(){
        this.removeNotification();
    },

    initNotification() {
        Game.NetWorkController.AddListener('msg.insufficientNotice', this, this.onInsufficientNotice);
        Game.NetWorkController.AddListener('msg.RefreshObject', this, this.onRefreshObject);
        Game.NetWorkController.AddListener('msg.notifyLuckNum', this, this.onNotifyLuckNum);
        Game.NetWorkController.AddListener('msg.retStarupStarStone', this, this.onRetStarupStarStone);
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('msg.insufficientNotice', this, this.onInsufficientNotice);
        Game.NetWorkController.RemoveListener('msg.RefreshObject', this, this.onRefreshObject);
        Game.NetWorkController.RemoveListener('msg.notifyLuckNum', this, this.onNotifyLuckNum);
        Game.NetWorkController.RemoveListener('msg.retStarupStarStone', this, this.onRetStarupStarStone);
    },

    onRetStarupStarStone(result,data){
        cc.log(data);
        cc.log(result);
        // data.result:0失败1成功
        if(data.result == 1){
            this._data = Game.ItemModel.GetItemByBaseId(this._data.baseid);
            if(!this._data || !this._data.num > 0){
                this.onClose();
            }
            else{
                this.updateView();
            }
        }
    },
    onInsufficientNotice(result,data){},
    onRefreshObject(result,data){
        cc.log(data);
        data.objs.forEach(e => {
            if(e.baseid == this._data.baseid){
                this._data.num = e.num;
            }
        });
        this.updateView();
    },
    onNotifyLuckNum(result,data){
        cc.log(data);
        this.updateView();
    },

    // update (dt) {},
});
