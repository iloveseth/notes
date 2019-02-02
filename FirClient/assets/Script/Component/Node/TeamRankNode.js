const Game = require('../../Game');
cc.Class({
    extends: cc.ArrayNode,

    properties: {
        data: { default: null },
        clickFunc: { default: null }
    },
    //====================  这是分割线  ====================
    SetData: function (data, clickFunc) {
        this.data = data;
        this.clickFunc = clickFunc;
    },
    onButtonClick: function () {
        Game.Tools.InvokeCallback(this.clickFunc, this.data);
    }
});
