const Game = require('../../Game');
//该适配方式 保持自身宽高比的同时拉伸到父节点的宽高最小的一边
cc.Class({
    extends: cc.GameComponent,

    properties: {
        showPercent: { default: 0.0 }
    },
    update: function (dt) {
        let parentWidth = this.node.parent.width;
        let parentHeight = this.node.parent.height;
        let targetWidth = parentWidth * this.showPercent;
        let targetHeight = parentHeight * this.showPercent;
        let widthScale = targetWidth / this.node.width;
        let heightScale = targetHeight / this.node.height;
        let targetScale = Math.min(widthScale, heightScale);
        this.node.scaleX = targetScale;
        this.node.scaleY = targetScale;
    },
});
