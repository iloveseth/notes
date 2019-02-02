var Label_ = cc.Class({
    extends: cc.Label,

    editor: CC_EDITOR && {
        menu: 'i18n:MAIN_MENU.component.renderers/Label',
        help: 'i18n:COMPONENT.help_url.label',
        inspector: 'packages://inspector/inspectors/comps/label.js',
    },

    onLoad() {
        if (cc.sys.isNative) {
            this.node.y = this.node.y + 6;
        }
    },

    setText: function (text) {
        this.string = text;
    },
    setColor: function (color) {
        this.node.color = color;
    },
    setOutlineColor: function (color) {
        let outline = this.node.getComponent(cc.LabelOutline);
        if (outline != null) {
            outline.color = color;
        }
    },
    setOutlineWidth: function (width) {
        let outline = this.node.getComponent(cc.LabelOutline);
        if (outline != null) {
            outline.width = width;
        }
    },
    enableOutline: function (enable) {
        let outline = this.node.getComponent(cc.LabelOutline);
        if (outline != null) {
            outline.enabled = enable;
        }
    },
});

cc.Label_ = module.exports = Label_;