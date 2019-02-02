const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_title: { default: null, type: cc.Label_ },
        Label_selectDesc: { default: null, type: cc.Label_ },
        taleView_starItem: { default: null, type: cc.tableView },
    },

    onEnable() {
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.GET_SEL_ITEM, this, this.setItem);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GET_SEL_ITEM, this, this.setItem);
    },

    setItem(data) {
        this.onClose();
    },

    updateView() {
        let starItemList = [];
        switch (this._data) {
            case Game.ItemDefine.ITEMTYPE.ItemType_Stone:
                starItemList = Game.ItemModel.GetItemsByType(this._data);
                starItemList = Game._.sortBy(starItemList, function (info) {
                    return this.getStoneSortValue(info);
                }.bind(this));
                this.Label_title.setText('宝石筛选');
                this.Label_selectDesc.setText('点击您想要的宝石即可以镶嵌到装备');
                break;
            case Game.ItemDefine.ITEMTYPE.ItemType_StarStone:
                starItemList = Game.ItemModel.GetItemsByType(this._data);

                this.Label_title.setText('升星石筛选');
                this.Label_selectDesc.setText('点击您想镶嵌的封星石');
                break;
        }
        this.taleView_starItem.initTableView(starItemList.length, { array: starItemList, target: this });
    },

    getStoneSortValue(t_object) {
        let score = 0;
        let tProfession = Game.UserModel.GetUserOccupation();
        if (tProfession == Game.UserDefine.PROFESSION.PROFESSION_JIANSHI) {
            if (t_object.baseid >= 3 && t_object.baseid <= 17) {
                score = 1000 + t_object.baseid;
            } else {
                score = t_object.baseid;
            }
        } else if (tProfession == Game.UserDefine.PROFESSION.PROFESSION_MOFASHI) {
            if (t_object.baseid >= 33 && t_object.baseid <= 47) {
                score = 1000 + t_object.baseid;
            } else {
                score = t_object.baseid;
            }
        } else if (tProfession == Game.UserDefine.PROFESSION.PROFESSION_PAONIANG) {
            if (t_object.baseid >= 18 && t_object.baseid <= 32) {
                score = 1000 + t_object.baseid;
            } else {
                score = t_object.baseid;
            }
        }
        return -score;
    },
});