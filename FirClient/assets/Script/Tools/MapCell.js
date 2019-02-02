const Game = require('../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        canrun: { default: false }
    },
    SetCanRun: function (can) {
        this.canrun = can;
        this.node.opacity = can ? 100 : 0;
    },
    IsCanRun: function () {
        return this.canrun;
    }
});
