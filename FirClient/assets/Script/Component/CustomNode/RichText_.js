// RichText_.js
const NotificationController = require('../../Controller/NotificationController');
const Define = require('../../Util/Define');
var RichText_ = cc.Class({
    extends: cc.RichText,

    editor: CC_EDITOR && {
        menu: 'i18n:MAIN_MENU.component.renderers/RichText',
        help: 'i18n:COMPONENT.help_url.richtext',
        executeInEditMode: true
    },

    onLoad() {
        if (cc.sys.isNative) {
            this.node.y = this.node.y + 6;
        }
    },

    setRichTarget(target){
    	this._richTarget = target
    },
    handler1(event, param){
    	if(this._richTarget){
    		this._richTarget.handler1(event,param);
            NotificationController.Emit(Define.EVENT_KEY.TOUCH_END, event);
    	}
    },
    handler2(event, param){
    	if(this._richTarget){
    		this._richTarget.handler2(event,param);
            NotificationController.Emit(Define.EVENT_KEY.TOUCH_END, event);
    	}
    },
    handler3(event, param){
    	if(this._richTarget){
    		this._richTarget.handler3(event,param);
            NotificationController.Emit(Define.EVENT_KEY.TOUCH_END, event);
    	}
    },
    handler4(event, param){
    	if(this._richTarget){
    		this._richTarget.handler4(event,param);
            NotificationController.Emit(Define.EVENT_KEY.TOUCH_END, event);
    	}
    },

});

cc.RichText_ = module.export = RichText_;