const Game = require('../../Game');

const MakeTab = {
    Tab_Smelt: 3,
    Tab_fame: 1,
}

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_title: { default: null, type: cc.Label_ },
        Label_fame: { default: null, type: cc.Label_ },
        Label_smelt: { default: null, type: cc.Label_ },
        Button_fame: { default: null, type: cc.Button_ },
        Button_smelt: { default: null, type: cc.Button_ },
        tableView_detail: { default: null, type: cc.tableView },
    },

    onEnable() {
        this.initNotification();
        this.initView();
    },

    onDisable() {
        this.removeNotification();
        Game.GlobalModel.choosedSoulType = 0;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.FORGE_REFRESH, this, this.updateView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FORGE_REFRESH, this, this.updateView);
    },

    initView() {
        Game.GlobalModel.forgeTab = 0;
        if (this._data == MakeTab.Tab_fame) {
            this.updateTab(MakeTab.Tab_fame);
        } else {
            this.updateTab(MakeTab.Tab_Smelt);
        }
        this.setLabelValue();
    },

    updateView() {
        this.setLabelValue();
        this.reloadTb();        
    },

    setLabelValue() {
        this.Label_fame.setText(Game.MainUserModel.GetFame());
        this.Label_smelt.setText(Game.MainUserModel.GetSmelt());
    },

    initTb() {
        this.forgeList = this.getForgeList(Game.UserModel.GetLevel());
        this.sortForgeList();
        this.tableView_detail.initTableView(this.forgeList.length, { array: this.forgeList, target: this });
    },

    reloadTb() {
        this.sortForgeList();
        this.tableView_detail.reloadTableView(this.forgeList.length, { array: this.forgeList, target: this });
    },

    sortForgeList(){
        if(Game.GlobalModel.forgeTab == 3){
            return;
        }
        this.forgeList.sort((a,b) => {
            if(a.kind == Game.GlobalModel.choosedSoulType && b.kind != Game.GlobalModel.choosedSoulType){
                return -1;
            }else if(a.kind != Game.GlobalModel.choosedSoulType && b.kind == Game.GlobalModel.choosedSoulType){
                return 1;
            }
            else{
                return a.id - b.id;
            }
        })

    },

    updateTab(tab) {
        if (tab == Game.GlobalModel.forgeTab) {return;}
        Game.GlobalModel.forgeTab = tab;
        if (tab == MakeTab.Tab_Smelt) {
            this.Label_title.setText('普通打造');
            this.Button_fame.interactable = true;
            this.Button_smelt.interactable = false;
        } else {
            this.Label_title.setText('灵魂打造');
            this.Button_fame.interactable = false;
            this.Button_smelt.interactable = true;
        }
        this.initTb();
    },
    
    getForgeList(userLv) {
        let tLevel = Game.EquipModel.GetCanEquipLvByUserLv(userLv);
        let tList = [];

        let objConfig = Game.ConfigController.GetConfig('object_data');
        if (objConfig) {
            tList = Game._.filter(objConfig, function (base) {
                return base.level == tLevel && Game.EquipModel.IsEquip(base.kind);
            }.bind(this));
        }

        tList = Game._.sortBy(tList, function (info) {
            let result = this.getForgeSortValue(info);
            return -result;
        }.bind(this));

        return tList;
    },

    getForgeSortValue(object) {
        let score = 0;
        let tProfession = Game.UserModel.GetUserOccupation();
        if (object.kind == Game.ItemDefine.ITEMTYPE.ItemType_Knife || object.kind == Game.ItemDefine.ITEMTYPE.ItemType_KnifeAssistant) {
            score = tProfession == Game.UserDefine.PROFESSION.PROFESSION_JIANSHI && 1000 || 1;
        } else if (object.kind == Game.ItemDefine.ITEMTYPE.ItemType_Stick || object.kind == Game.ItemDefine.ITEMTYPE.ItemType_StickAssistant) {
            score = tProfession == Game.UserDefine.PROFESSION.PROFESSION_MOFASHI && 1000 || 2;
        } else if (object.kind == Game.ItemDefine.ITEMTYPE.ItemType_Bow || object.kind == Game.ItemDefine.ITEMTYPE.ItemType_BowAssistant) {
            score = tProfession == Game.UserDefine.PROFESSION.PROFESSION_PAONIANG && 1000 || 3;
        } else {
            score = object.kind;
        }
        return score;
    },

    onClickAddFame() {
        let title = '消息提示';
        let desc = '1、打造装备需要打造值\n2、打造值通过装备熔炼获得，装备可通过庄园获得';
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
            {
                name: '前往庄园',
                handler: function () {
                    Game.GlobalModel.SetIsOpenDigView(true);
                    Game.NetWorkController.SendProto('msg.reqAllDigStatus', {});
                    this.onClose();
                }.bind(this),
            },
            {
                name: '取消'
            }
        ]);
    },

    onClickAddSmelt() {
        let title = '消息提示';
        let desc = '1、打造带灵魂锁链的装备需要荣誉值\n2、荣誉值可在边境PK、任务等功能获得';
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc);
    },

    onClickMake(event, customEventData) {
        this.updateTab(customEventData);
    }
});
