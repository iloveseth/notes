const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        sprite_bg: { default: null, type: cc.Sprite_ },
        sprite_map: { default: null, type: cc.Sprite_ },
        sprite_septRed: { default: null, type: cc.Sprite_ },
        spr_zahuoShopRed: { default: null, type: cc.Sprite_ },
        spr_DigRed: { default: null, type: cc.Sprite_ },
        sprite_taskRed: { default: null, type: cc.Sprite_ },
    },
    onEnable: function () {
        let country = Game.UserModel.GetCountry();
        this.sprite_bg.SetSprite('Image/Map/map/' + (country == 1 ? 'bg_firecity' : 'bg_icecity'));
        this.sprite_map.SetSprite('Image/Map/map/' + (country == 1 ? 'image_firecity' : 'image_icecity'));
        this._updateView();
        Game.NotificationController.On(Game.Define.EVENT_KEY.RED_DIG, this, this._updateDigRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TASK_INFO_REFRESH, this, this._updateTaskRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SHOP_DATAUPDATE, this, this._updateShopRedDot);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FUNCTION_OPEN, this, this._updateOpenFuncRed);
    },
    onDisable() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RED_DIG, this, this._updateDigRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.TASK_INFO_REFRESH, this, this._updateTaskRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SHOP_DATAUPDATE, this, this._updateShopRedDot);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FUNCTION_OPEN, this, this._updateOpenFuncRed);
    },
    _updateView: function () {
        this._updateDigRed();
        this._updateTaskRed();
        this._updateShopRedDot();

        this._updateOpenFuncRed();  //只能在判断所有红点之后再判断
    },
    //====================  这是分割线  ====================
    //铁匠铺
    onClickOpenForge() {
        this.openView(Game.UIName.UI_FORGEVIEW);
        this.onClose();
    },
    //庄园
    onClickOpenDigg() {
        Game.GlobalModel.SetIsOpenDigView(true);
        Game.NetWorkController.SendProto('msg.reqAllDigStatus', {});
        this.onClose();
    },
    //排行
    onClickOpenRank() {
        this.openView(Game.UIName.UI_RANKING_LIST_NODE);
        this.onClose();
    },
    //商店
    onClickOpenShop() {
        this.openView(Game.UIName.UI_SHOPVIEW, Game.Define.SHOPTAB.Tab_NB);
        this.onClose();
    },
    //任务
    onClickOpenTask() {
        Game.TaskModel.isOpenDailyTask = true;
        Game.NetWorkController.SendProto('border.reqQuestInfo', {});
        this.onClose();
    },
    //公会
    onClickOpenSept() {
        if (Game.UserModel.GetSeptname() != '') {
            Game.NetWorkController.SendProto('msg.reqMySeptInfoNew', {});
        } else {
            this.openView(Game.UIName.UI_SEPTJOINVIEW);
        }
        this.onClose();

        this.sprite_septRed.setVisible(false);
        Game.GuideController.RemoveFirstOpenFunc(Game.Define.FUNCTION_TYPE.TYPE_SEPT);
    },

    _updateDigRed() {
        this.spr_DigRed.setVisible(Game.DigModel.getIsDigRed());
    },
    _updateTaskRed() {
        this.sprite_taskRed.setVisible(Game.TaskModel.IsTaskRed());
    },
    _updateShopRedDot() {
        this.spr_zahuoShopRed.setVisible(false);//(Game.ShopModel.GetNbFreeTimesRedDot());
    },
    _updateOpenFuncRed() {
        let funcList = Game.GuideController.GetFirstOpenFuncList();
        let isSeptRed = Game._.find(funcList, function (info) {
            return info == Game.Define.FUNCTION_TYPE.TYPE_SEPT;
        });
        this.sprite_septRed.setVisible(isSeptRed != null);
    },
});
