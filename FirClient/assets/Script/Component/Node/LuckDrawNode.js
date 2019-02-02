const Game = require('../../Game');
const SuperSpriteName = [
    '', '', '', '',
    'Image/Effect/haloloop1/ziloop_01',
    'Image/Effect/haloloop1/chengloop_01',
    'Image/Effect/haloloop1/hongloop_01',
]
cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_info: { default: null, type: cc.Node },
        node_show: { default: null, type: cc.Node },
        node_unkown: { default: null, type: cc.Node },
        sprite_quality: { default: null, type: cc.Sprite_ },
        sprite_icon: { default: null, type: cc.Sprite_ },
        label_count: { default: null, type: cc.Label_ },
        node_super: { default: null, type: cc.Node },
        sprite_super: { default: null, type: cc.Sprite_ },
        node_new: { default: null, type: cc.Node },
        anima_pia: { default: null, type: cc.Animation },

        index: { default: -1 },
        data: { default: null },
        flap_callback: { default: null }
    },
    //====================  对外接口  ====================
    init: function (index, data) {
        this.index = index;
        this.data = data.array[index];
        this.flap_callback = data.targetFlapCb;
        this._updateNode();
    },
    PlayFlap: function () {
        this.node_info.runAction(cc.sequence([
            cc.scaleTo(0.2, 0, 1),
            cc.callFunc(this.onSwitchInfo, this),
            cc.scaleTo(0.2, 1, 1),
            cc.delayTime(0.1),
            cc.callFunc(this.onFlapEnd, this)
        ]));
    },
    onSwitchInfo: function () {
        this.node_show.active = true;
        this.node_unkown.active = false;
        this.anima_pia.play();
    },
    onFlapEnd: function () {
        Game.Tools.InvokeCallback(this.flap_callback, this.index);
    },
    //====================  更新函数  ====================
    _updateNode: function () {
        this.node_show.active = false;
        this.node_unkown.active = true;
        let rewardtype = Game._.get(this, 'data.type', 0);
        if (rewardtype == 1) {
            //道具
            let objDefine = Game.ItemModel.GetItemConfig(Game._.get(this, 'data.id', 0));
            if (objDefine != null) {
                this.sprite_quality.SetSprite(Game.FairyModel.GetFairyQualityIcon(objDefine.color));
                this.sprite_icon.SetSprite(objDefine.pic);
                this.label_count.setText(Game._.get(this, 'data.num', ''));
                this.node_super.active = false;
                this.node_new.active = false;
            }
        }
        else {
            //精灵
            let fairyDefine = Game.ConfigController.GetConfigById('fairybase_data', Game._.get(this, 'data.id', 0));
            if (fairyDefine != null) {
                this.sprite_quality.SetSprite(Game.FairyModel.GetFairyQualityIcon(fairyDefine.fairycolor));
                this.sprite_icon.SetSprite(fairyDefine.fairyhead);
                this.label_count.setText('');
                this.node_super.active = (fairyDefine.fairycolor >= Game.ItemDefine.ITEMCOLOR.Item_Purple);
                if (this.node_show.active) {
                    this.sprite_super.SetSprite(SuperSpriteName[fairyDefine.fairycolor]);
                }
                this.node_new.active = (Game._.get(this, 'data.playani', -1) == 1);
            }
        }
    }
});
