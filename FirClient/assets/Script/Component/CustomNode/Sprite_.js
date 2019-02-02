const ResController = require('../../Controller/ResController');

var Sprite_ = cc.Class({
    extends: cc.Sprite,

    editor: CC_EDITOR && {
        menu: 'i18n:MAIN_MENU.component.renderers/Sprite',
        help: 'i18n:COMPONENT.help_url.sprite',
        inspector: 'packages://inspector/inspectors/comps/sprite.js',
    },

    SetSprite(path) {
        ResController.SetSprite(this, path);
    },
    setVisible(bool){
    	this.node.active = bool;
    },
});

cc.Sprite_ = module.exports = Sprite_;