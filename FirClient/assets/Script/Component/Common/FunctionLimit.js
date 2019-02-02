const Game = require('../../Game');

const LimitState = {
    limitActive: 1,
    limitInteractable: 2,
    limitTips: 3
}

cc.Class({
    extends: cc.Component,

    properties: {
        limitId: { default: 0 }
    },

    onEnable() {
        this.initNotification();
        this.updateView();
    },
    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_REFRESH, this, this.updateView);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_DATAUPDATE, this, this.updateView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_REFRESH, this, this.updateView);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_DATAUPDATE, this, this.updateView);
    },

    updateView() {
        if (this.node == null) { return; }

        let isOpen = Game.GuideController.IsFunctionOpen(this.limitId);
        this.limitConfig = Game.ConfigController.GetConfigById('levellimit_data', this.limitId);
        let nodeBtn = null;
        if (this.limitConfig) {
            switch (this.limitConfig.buttonstate) {
                case LimitState.limitActive:
                    this.node.active = isOpen && true || false;
                    break;
                case LimitState.limitInteractable:
                    nodeBtn = this.node.getComponent('Button_');
                    if (nodeBtn) {
                        if (nodeBtn.transition == cc.Button.Transition.SPRITE) {
                            Game.ResController.GetSpriteFrameByName(isOpen ? this.limitConfig.normalpath : this.limitConfig.graypath, function (err, res) {
                                if (err) {
                                    cc.error('加载Sprite失败 ' + err);
                                    return;
                                }
                                nodeBtn.normalSprite = res;
                            });
                        } else {
                            let nodeImg = this.node.getComponent('Sprite_');
                            if (nodeImg) {
                                nodeImg.SetSprite(isOpen ? this.limitConfig.normalpath : this.limitConfig.graypath);
                            }
                        }
                    }
                    
                    if (nodeBtn) {
                        if (isOpen) {
                            nodeBtn.RestoreClickEvents();
                        } else {
                            let clickEventHandler = new cc.Component.EventHandler();
                            clickEventHandler.target = this.node;
                            clickEventHandler.component = "FunctionLimit";
                            clickEventHandler.handler = "onTouchFunction";
                            nodeBtn.ReplaceClickEvents([clickEventHandler])
                        }
                    }
                    break;
                case LimitState.limitTips:
                    nodeBtn = this.node.getComponent('Button_');
                    if (nodeBtn) {
                        if (isOpen) {
                            nodeBtn.RestoreClickEvents();
                        } else {
                            let clickEventHandler = new cc.Component.EventHandler();
                            clickEventHandler.target = this.node;
                            clickEventHandler.component = "FunctionLimit";
                            clickEventHandler.handler = "onTouchFunction";
                            nodeBtn.ReplaceClickEvents([clickEventHandler])
                        }
                    }
                    break;
            }
        }
    },

    onTouchFunction() {
        if (this.limitConfig) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, this.limitConfig.content);
        }
    }
});
