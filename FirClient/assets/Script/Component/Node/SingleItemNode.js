const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Node_Equip: { default: null, type: cc.Node },
        Node_Item: { default: null, type: cc.Node },
        Sprite_quality: { default: null, type: cc.Sprite_ },
        Sprite_item: { default: null, type: cc.Sprite_ },
        Label_itemNum: { default: null, type: cc.Label_ },
        Node_intensify: { default: null, type: cc.Node },
        Label_intensify: { default: null, type: cc.Label_ },
        Node_star: { default: null, type: cc.Node },
        Label_starnum: { default: null, type: cc.Label_ },
        Node_backs: { default: [], type: [cc.Node] },
        Sprite_gems: { default: [], type: [cc.Sprite_] },
        Effect_jinglingdan: { default: null, type: cc.Animation },
        Effect_soul: { default: null, type: cc.Animation },
        Skeleton_super: { default: null, type: sp.Skeleton },
    },

    onLoad() {
    },

    onEnable() {
    },

    onDisable() {
    },

    updateView(t_Object, callback = null) {
        this._callback = callback;
        this.objectInfo = t_Object;
        this.equipInfo = t_Object.equipdata;
        this.itemConfig = Game.ItemModel.GetItemConfig(this.objectInfo.baseid);

        if (this.objectInfo && this.itemConfig) {
            let isEquip = Game.EquipModel.IsEquip(this.objectInfo.type);
            this.Sprite_quality.SetSprite(Game.ItemModel.GetItemQualityIcon(isEquip && this.equipInfo.color || this.objectInfo.color));
            this.Sprite_item.SetSprite(this.itemConfig.pic);

            this.Node_Equip.active = isEquip;
            this.Node_Item.active = !isEquip;

            if (isEquip) {
                this.refreshEquip();
            } else {
                this.refreshItem();
            }

            //道具星级处理
            if (isEquip) {
                let stronglevel = Game._.get(this, 'equipInfo.stronglevel', 0);
                if (stronglevel > 1) {
                    this.Label_starnum.setText(`+${stronglevel}`);
                }
                this.Node_star.active = stronglevel > 1;
            } else {
                if (this.objectInfo.baseid >= 250 && this.objectInfo.baseid <= 279) {
                    let starItemLv = Game.ItemModel.GetStarItemLevel(this.objectInfo);
                    if (starItemLv > 1) {
                        this.Label_starnum.setText(`+${starItemLv}`);
                    }
                    this.Node_star.active = starItemLv > 1;
                } else {
                    this.Node_star.active = false;
                }
            }
        }
    },

    refreshEquip() {
        let soul = Game._.get(this, 'equipInfo.godnormal', null);
        let star = Game._.get(this, 'equipInfo.star', 0);
        let newstronglevel = Game._.get(this, 'equipInfo.newstronglevel', 0);
        let hole = Game._.get(this, 'equipInfo.hole', 0);
        let stone = Game._.get(this, 'equipInfo.stone', []);

        let isHaveSoul = false;
        if (soul != null) {
            isHaveSoul = soul.level > 0;
        }
        this.Effect_soul.node.active = isHaveSoul;
        this.Node_intensify.active = newstronglevel > 0;

        Game.ResController.LoadSpine('Image/Effect/saoguang_x/saoguang_x', function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.Skeleton_super.node.active = star > 1;
                this.Skeleton_super.skeletonData = asset;
                this.Skeleton_super.setAnimation(0, 'animation', true);
            }
        }.bind(this));

        if (newstronglevel > 0) {
            this.Label_intensify.setText(`+${newstronglevel}`);
        }

        for (let i = 0; i < 4; i++) {    //显示装备已经打孔的个数
            this.Node_backs[i].active = i < hole;
            this.Sprite_gems[i].node.active = false;
        }
        for (let b = 0; b < stone.length; b++) {  //显示已经装上的宝石
            let gemsInfo = stone[b];
            let gemsConfig = Game.ItemModel.GetItemConfig(gemsInfo.objid);
            this.Sprite_gems[gemsInfo.pos - 1].SetSprite(gemsConfig.pic);
            this.Sprite_gems[gemsInfo.pos - 1].node.active = true;
        }
    },

    refreshItem() {
        this.Effect_jinglingdan.node.active = this.objectInfo.baseid == 460;
        this.Label_itemNum.setText(Game.Tools.UnitConvert(this.objectInfo.num));
    },

    updateItemNum(num){
        this.Label_itemNum.setText(Game.Tools.UnitConvert(num));
    },

    setNumVisible(bool) {
        this.Label_itemNum.node.active = bool;
    },

    onTouchCallBack() {
        if (Game._.isFunction(this._callback)) {
            Game.Tools.InvokeCallback(this._callback, Game._.get(this, 'objectInfo.baseid', 0), this.objectInfo, this);
            return;
        }
        switch (this.objectInfo.type) {
            case Game.ItemDefine.ITEMTYPE.ItemType_Knife:
            case Game.ItemDefine.ITEMTYPE.ItemType_KnifeAssistant:
            case Game.ItemDefine.ITEMTYPE.ItemType_Bow:
            case Game.ItemDefine.ITEMTYPE.ItemType_BowAssistant:
            case Game.ItemDefine.ITEMTYPE.ItemType_Stick:
            case Game.ItemDefine.ITEMTYPE.ItemType_StickAssistant:
            case Game.ItemDefine.ITEMTYPE.ItemType_Wrister:
            case Game.ItemDefine.ITEMTYPE.ItemType_Trousers:
            case Game.ItemDefine.ITEMTYPE.ItemType_Shoes:
            case Game.ItemDefine.ITEMTYPE.ItemType_Helmet:
            case Game.ItemDefine.ITEMTYPE.ItemType_Necklace:
            case Game.ItemDefine.ITEMTYPE.ItemType_Clothes:
            case Game.ItemDefine.ITEMTYPE.ItemType_Belt:
            case Game.ItemDefine.ITEMTYPE.ItemType_Ring:
                if (Game.EquipModel.curEquipPage == Game.Define.EquipPageType.strong
                    || Game.EquipModel.curEquipPage == Game.Define.EquipPageType.star
                    || Game.EquipModel.curEquipPage == Game.Define.EquipPageType.soul
                    || Game.EquipModel.curEquipPage == Game.Define.EquipPageType.gem) {
                    Game.NotificationController.Emit(Game.Define.EVENT_KEY.EQUIP_CONTROL_SEL, this.objectInfo);
                } else {
                    this.openView(Game.UIName.UI_EQUIPINFO, this.objectInfo);
                }
                break;
        }
    },
});
