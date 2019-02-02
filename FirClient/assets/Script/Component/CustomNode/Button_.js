const NotificationController = require('../../Controller/NotificationController');
const AudioController = require('../../Controller/AudioController');
const Define = require('../../Util/Define');
var Button_ = cc.Class({
    extends: cc.Button,
    properties: {
        default_audioeffect: { default: 'Audio/UI/UI_Click_Default' },
        old_events: { default: [] },
        replaced: { default: false }
    },
    editor: CC_EDITOR && {
        inspector: 'packages://Button_/inspector.js',
        executeInEditMode: true
    },
    setVisible(bool) {
        this.node.active = bool;
    },
    onLoad: function () {
        this._oldTouchEnded = this._onTouchEnded;
        this._onTouchEnded = this.onTouchEnd.bind(this);
    },
    onDestroy: function () {
        this._onTouchEnded = this._oldTouchEnded;

    },
    onEnable: function () {
        this._super();
        // NotificationController.On(Define.EVENT_KEY.TOUCH_END, this, this.onUpperClick);
    },
    onDisable: function () {
        this._super();
        // NotificationController.Off(Define.EVENT_KEY.TOUCH_END, this, this.onUpperClick);
    },
    onTouchEnd: function (event) {
        if (this.interactable && this.enabledInHierarchy && this._pressed && this.default_audioeffect != '') {
            AudioController.PlayEffect(this.default_audioeffect);
        }
        NotificationController.Emit(Define.EVENT_KEY.TOUCH_END, event);
        this._oldTouchEnded(event);
    },
    onUpperClick: function (event) {
        //nc冒泡事件传递导致我写下了这段代码 脑壳疼 
        //调用按钮原来的方法
        if (this.isValid && this.enabled && this.interactable) {
            if (this.node.getBoundingBoxToWorld().contains(event.getLocation())) {
                //确实点在这里了
                this._pressed = true;
                this._onTouchEnded(event);
                return true;
            }
        }
        return false;
    },

    /**
     * 替换原有的点击事件 
     *  let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; 
        clickEventHandler.component = "GuideView";
        clickEventHandler.handler = "onGuideButtonClick";
        button.ReplaceClickEvents([clickEventHandler])
     * @param {Array[cc.Component.EventHandler]} events
     */
    ReplaceClickEvents: function (events) {
        if (this.replaced) {
            return;
        }
        this.replaced = true;
        this.old_events = this.clickEvents;
        this.clickEvents = events;
    },
    RestoreClickEvents: function () {
        if (!this.replaced) {
            return;
        }
        this.replaced = false;
        this.clickEvents = this.old_events;
    }
});

cc.Button_ = module.export = Button_;