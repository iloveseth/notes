// TabButton_.js
const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
       Button_press:{ default: null, type: cc.Sprite_ },
       Button:{ default: null, type: cc.Sprite_ },
       Label: { default: null, type: cc.Label_ },
    },
    onLoad() {
    },

    onEnable() {
    },
    onDisable() {
    },
    setButtonHightLight(bool) {
    	this.Button_press.node.active = bool;
    	this.Button.node.active = !bool;
    },
    setButtonLab(str){
    	this.Label.string = str;
    },
});