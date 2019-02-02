const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,
    ctor: function () {
        this.callbacks = {};
        this.params = {};
    },
    properties: {
        label_title: { default: null, type: cc.Label_ },
        label_content: { default: null, type: cc.Label_ },
        nodes_bottom: { default: [], type: [cc.Node] },
        labels_bottom: { default: [], type: [cc.Label_] },
    },
    //====================  这是分割线  ====================
    Show: function (title, content, buttonHandlers) {
        this.callbacks = {};
        this.params = {};
        this.label_title.setText(title);
        this.label_content.setText(content);

        let buttons = buttonHandlers != null && buttonHandlers || [{name: '确定'}];
        for (let i = 0; i < this.nodes_bottom.length; i++) {
            let node = this.nodes_bottom[i];
            if (i < buttons.length) {
                node.active = true;
                let buttoninfo = buttons[i];
                let label = this.labels_bottom[i];
                if (label != null) {
                    label.setText(Game._.get(buttoninfo, 'name', ''));
                }
                if (Game._.isFunction(buttoninfo.handler)) {
                    this.callbacks[i] = buttoninfo.handler;
                }
                if (buttoninfo.params != null) {
                    this.params[i] = buttoninfo.params;
                }
            } else {
                node.active = false;
            }
        }
        for (let i = 0; i < buttons.length; i++) {
            let x = Game.Tools.CalculateArrange(buttons.length, i, 250);
            let node = this.nodes_bottom[i];
            if (node != null) {
                node.x = x;
            }
        }
    },
    onItemClick: function (event, index) {
        index = parseInt(index);
        let callback = this.callbacks[index];
        if (callback != null) {
            Game.Tools.InvokeCallback(callback, this.params[index]);
        }
        this.node.removeFromParent(true);
    },

    onClickLayoutBg(){
        this.node.removeFromParent(true);
    },
});
