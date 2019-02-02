const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        nodes_item: [cc.Node],
        node_equip: cc.Node,
        sprite_equip: cc.Sprite_,
        sprite_quality_equip: cc.Sprite_,
        node_fairy: cc.Node,
        sprite_fairy: cc.Sprite_,
        sprite_quality_fairy: cc.Sprite_,
        button_accept: cc.Button_,
        nodes_recharge: [cc.Node],
    },

    onLoad: function () {
        this.mallData = [];
        let mallDataTab = Game.ConfigController.GetConfig("mall_data");
        for (let i = 0; i < mallDataTab.length; i++) {
            let element = mallDataTab[i];
            if (element.isfourtime == 1) {
                this.mallData.push(element);
            };
        };
        this.mallData.sort((a, b) => {
            return a.id - b.id;
        })
    },

    onEnable() {
        this._data = Game.ActiveModel.msg_firstrecharge;
        this.initNotification();
        this.updateView();
        this.reqAcceptModel();
    },

    reqAcceptModel() {
        Game.NetWorkController.SendProto('act.reqFirstChargeRec', {});
    },

    onDisable() {
        this.removeNotification();
    },

    updateView() {
        this.updateAwardView();
        this.updateEquipView();
        this.updateFairyView();
        this.updateButtonView();
    },

    initNotification() {
        Game.NetWorkController.AddListener('act.retFirstChargeRec', this, this.onRetFirstChargeRec);
        Game.NetWorkController.AddListener('act.retFirstChargeAct', this, this.onRetFirstChargeAct);
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('act.retFirstChargeRec', this, this.onRetFirstChargeRec);
        Game.NetWorkController.RemoveListener('act.retFirstChargeAct', this, this.onRetFirstChargeAct);
    },

    onRetFirstChargeRec(msg, data) {
        this.updateAcceptView(data)
    },

    onRetFirstChargeAct(msg, data) {
        this._data = data;
        this.updateView();
        this.reqAcceptModel();
    },

    updateAcceptView(data) {
        // this.label_acceptnum.setText(data.buynum);
        // this.labels_accept.forEach((e,idx) => {
        //     var active = idx < data.buyname.length;
        //     e.node.active = active;
        //     if(active){
        //         e.setText(data.buyname[idx]);
        //     }
        // });
    },

    updateAwardView() {
        var award_data = Game.ConfigController.GetConfigById('commonreward_data', this._data.reward);
        if (award_data == null) {
            return;
        }
        var award_info = [
            { id: 108, num: award_data.money },
        ];
        var items = award_data.item.split(';');
        items.forEach(e => {
            var info = e.split('-');
            award_info.push({ id: Number(info[0]), num: Number(info[1]) });
        });
        this.fairyData = award_info.pop();
        this.nodes_item.forEach((e, idx) => {
            var basicItemNode = e.getComponent('BasicItemNode');
            basicItemNode.setInfo(award_info[idx].id, award_info[idx].num, award_data.equipcolor, this.node);
        });
    },

    updateEquipView() {
        var award_data = Game.ConfigController.GetConfigById('commonreward_data', this._data.reward);
        if (award_data == null) {
            return;
        }
        var equipid = award_data.equipid;
        var equip_data = Game.ConfigController.GetConfigById('object_data', equipid);
        this.sprite_equip.SetSprite(equip_data.pic);
        // this.sprite_quality.SetSprite(Game.ItemModel.GetItemQualityIcon(award_data.equipcolor));
        // this.sprite_quality_equip.node.active = false;

        this.equipbaseid = equipid;
    },

    updateFairyView() {
        if(!this.fairyData){
            return;
        }
        this.fairybaseid = this.fairyData.id;
        let fairy_data = Game.ConfigController.GetConfigById('object_data', this.fairybaseid);
        this.sprite_fairy.SetSprite(fairy_data.pic);
        // this.sprite_quality_fairy.SetSprite(Game.ItemModel.GetItemQualityIcon(fairy_data.equipcolor));
        // this.sprite_quality_fairy.node.active = false;

    },

    updateButtonView() {

        for (let i = 0; i < 4; i++) {
            let node = this.nodes_recharge[i];
            let diamond = Game._.get(this.mallData[i], "diamond", 0);
            let price = Game._.get(this.mallData[i], "price", 0);
            node.getChildByName('lab_god').getComponent(cc.Label_).string = diamond * 4;
            node.getChildByName('lab_price').getComponent(cc.Label_).string = (price / 100) + "元";
            node.active = false;
        };


        var status = this._data.getstatus;
        switch (status) {
            case 0: {
                //显示灰态领取
                this.button_accept.node.active = true;
                this.button_accept.interactable = false;
                break;
            }
            case 1: {
                //显示充值
                for (let i2 = 0; i2 < this.nodes_recharge.length; i2++) {
                    this.nodes_recharge[i2].active = true;
                };
                this.button_accept.node.active = false;
                break;
            }
            case 2: {
                //领取
                this.button_accept.node.active = true;
                this.button_accept.interactable = true;
                break;
            }
        }
    },

    onClickRecharge(event, customEventData) {
        // this.gotoRecharge();
        let mallItem = this.mallData[customEventData];
        Game.Platform.RequestPay(mallItem.id);
    },

    onClickAccept() {
        this.reqReward();
    },

    gotoRecharge() {
        Game.VipModel.SetVipType(2);
        Game.NetWorkController.SendProto('msg.ReqVipInfo', { noshow: false });
    },

    reqReward() {
        Game.NetWorkController.SendProto('act.reqFirstChargeReward', {});
    },

    onEquipIconClick: function () {
        var item_config = Game.ItemModel.GetItemConfig(this.equipbaseid);
        item_config.baseid = this.equipbaseid;
        let contents = Game.ItemModel.GenerateCommonContentByObject(item_config,5);
        let pos = this.node_equip.parent.convertToWorldSpaceAR(this.node_equip.position);
        Game.TipPoolController.ShowItemInfo(contents, pos, this.node);
    },
    onFairyIconClick: function () {
        var item_config = Game.ItemModel.GetItemConfig(this.fairybaseid);
        item_config.baseid = this.fairybaseid;
        let contents = Game.ItemModel.GenerateCommonContentByObject(item_config);
        let pos = this.node_equip.parent.convertToWorldSpaceAR(this.node_fairy.position);
        Game.TipPoolController.ShowItemInfo(contents, pos, this.node);
    },

    // update (dt) {},
});
