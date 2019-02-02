const Game = require('../../Game');
const UpdateInterval = 0.1;
const TouchInterval = 0;
cc.Class({
    extends: cc.GameComponent,

    properties: {
        sprite_bg: { default: null, type: cc.Sprite_ },
        ske_npc: { default: null, type: sp.Skeleton },
        ske_role: { default: null, type: sp.Skeleton },
        label_title: { default: null, type: cc.Label_ },
        label_content: { default: null, type: cc.Label_ },

        dialogues: { default: null },
        curdialogue: { default: '' },
        index_dialogue: { default: 0 },
        interval_update: { default: 0 },
        interval_touch: { default: 0 }
    },
    onLoad: function () {
        Game.ResController.LoadSpine(Game.GuideController.GetCountryPrincessPath(Game.UserModel.GetCountry()), function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.ske_npc.skeletonData = asset;
                this.ske_npc.setAnimation(0, 'idle', true);
            }
        }.bind(this));
        Game.ResController.LoadSpine(Game.UserModel.GetPlayerSkeleton(Game.UserModel.GetUserOccupation()), function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.ske_role.skeletonData = asset;
                this.ske_role.setAnimation(0, 'idle', true);
            }
        }.bind(this));
    },
    update: function (dt) {
        this.interval_update += dt;
        this.interval_touch += dt;
        if (this.interval_update > UpdateInterval) {
            this.interval_update = 0;
            let curlength = this.label_content.string.length;
            if (curlength < this.curdialogue.length) {
                //多一个字
                this.label_content.setText(this.curdialogue.substr(0, curlength + 1));
            }
        }
    },
    onEnable: function () {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    },
    onDisable: function () {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    },
    //====================  对外接口  ====================
    SetInfo: function (opts) {
        let bg = Game._.get(opts, 'bg', '');
        if (bg == '') {
            this.sprite_bg.spriteFrame = null;
        } else {
            this.sprite_bg.SetSprite(bg);
        }
        this.dialogues = Game._.get(opts, 'dialogues', []);
        this.index_dialogue = 0;
        this._nextDialogue();
    },
    onTouchEnd: function () {
        if (this.interval_touch < TouchInterval) {
            return;
        }
        this.interval_touch = 0;
        let curlength = this.label_content.string.length;
        if (curlength < this.curdialogue.length) {
            this.label_content.setText(this.curdialogue);
        } else {
            this._nextDialogue();
        }
    },
    //====================  私有函数  ====================
    _nextDialogue: function () {
        if (this.index_dialogue >= this.dialogues.length) {
            //对话结束了
            this.node.active = false;
            return;
        }
        let dialogue = this.dialogues[this.index_dialogue];
        let kind = Game._.get(dialogue, 'kind', 1);
        this.curdialogue = Game._.get(dialogue, 'dialog', '');
        if (kind == 1) {
            this.label_title.setText(Game.UserModel.GetCountryQueenName(Game.UserModel.GetCountry()));
        } else {
            this.label_title.setText(Game.UserModel.GetUserName());
        }
        this.ske_npc.node.active = (kind == 1);
        this.ske_role.node.active = (kind != 1);
        this.label_content.setText('');
        this.index_dialogue++;
    },
});
