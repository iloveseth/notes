const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_parent: { default: null, type: cc.Node },
        richtexts_contents: { default: [], type: [cc.RichText] },
        widget: { default: null, type: cc.Widget },
        layout: { default: null, type: cc.Layout }
    },
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {
            if (this.node.getParent() != null) {
                this.node.removeFromParent(false);
            }
        }, this);
    },
    /**
     * 
     * @param {[]string} contents   要显示的内容
     * @param {cc.Vec2} pos         世界坐标
     */
    Show: function (contents, pos, parent) {
        for (let i = 0; i < this.richtexts_contents.length; i++) {
            let content = contents[i];
            if (content == null) {
                this.richtexts_contents[i].node.active = false;
            } else {
                this.richtexts_contents[i].node.active = true;
                this.richtexts_contents[i].string = content;
            }
        }

        let width = this.node_parent.width;
        let height = this.node_parent.height;
        let anchorx = 0;
        let anchory = 1;
        if (pos.x <= width) {
            anchorx = 0;
        } else if (pos.x >= 720 - width) {
            anchorx = 1;
        }
        if (pos.y <= height) {
            anchory = 0;
        } else if (pos.y >= 1100 - height) {
            anchory = 1;
        }
        this.node_parent.anchorX = anchorx;
        this.node_parent.anchorY = anchory;
        this.widget.left = 0;
        this.widget.right = 0;
        this.widget.updateAlignment();
        this.layout.updateLayout();
        this.node_parent.position = parent.convertToNodeSpaceAR(pos);
        parent.addChild(this.node);
    }
});
