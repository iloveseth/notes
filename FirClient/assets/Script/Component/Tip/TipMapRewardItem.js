const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_name: { default: null, type: cc.Label_ },
        sprite_icon: { default: null, type: cc.Sprite_ },
        node_anima: { default: null, type: cc.Node },
        callback_click: { default: null }
    },
    // 放回池中了
    unuse: function () {
        this.callback_click = null;
    },
    //从池中拿出来了
    reuse: function (id, cb) {
        let define = Game.ConfigController.GetConfigById('object_data', id);
        if (define != null) {
            this.label_name.setText(define.name);
            this.sprite_icon.SetSprite(define.pic);
        }
        this.node.position = cc.p(0, 0);
        this.node.active = (define != null);
        this.node_anima.active = true;
        this.callback_click = cb;
    },
    //====================  函数  ====================
    onItemClick: function () {
        if (this.node_anima.active) {
            Game.Tools.InvokeCallback(this.callback_click);
        }
    },
    HideAnimaAndName: function () {
        this.label_name.setText('');
        this.node_anima.active = false;
    }
});
