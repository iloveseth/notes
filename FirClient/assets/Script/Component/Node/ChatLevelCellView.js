// ChatLevelCellView.js
const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_richtext: { default: null, type: cc.RichText },
    },

    onLoad() {
        this._id = 0;
        this._data = null;
        this._touching = false;
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        this._callback = data.callback;
        this.lab_richtext.setRichTarget(this);
        this._bless = data.bless;
        // this.lab_richtext.setRichTarget(this);
        if (this._data){
            this.setChatInfo(this._data);
        }
    },
    setChatInfo(data){
    	if(data.txt2 && data.txt2 != ""){
            var RichColor = '<outline color=%s width=2><color=%s>%s</c></outline>'; 
            let detail = cc.js.formatStr(RichColor, "#6F3312", "#FFF9E6", data.txt2);
            if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_JIJIE){
                detail = detail + cc.js.formatStr(RichColor,"#1b700b", "#32e90e", '[点击集结]');
            }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_CREATESEPT){
                detail = detail + cc.js.formatStr(RichColor,"#1b700b", "#32e90e", '[点击加入]');
            }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_BORDERTEAM){
                detail = detail + cc.js.formatStr(RichColor,"#1b700b", "#32e90e", '[点击加入]');
            }
           this.lab_richtext.string = detail;
        }else if(data){
     		var str = '';
     		var title = '[系统]';
     		var name = '';
     		var detail = '';
     		var RichLine = "<u click='%s'>%s</u>";
     		var RichColor = '<outline color=%s width=2><color=%s>%s</c></outline>';
            if(data.dwFromID == 0){
                title = '';
                // name = cc.js.formatStr(RichLine, "handler1", cc.js.formatStr(RichColor,"#1b700b", "#32e90e", data.pstrName+":"));
                name = cc.js.formatStr(RichColor, "#6F3312", "#FCE181", '['+data.pstrName+']');
            }else{
                if(data.dwType == Game.Define.Enum_enumChatType.CHAT_TYPE_WORLD){
                  	title = '[世界]';
                }else if(data.dwType == Game.Define.Enum_enumChatType.CHAT_TYPE_COUNTRY){
                    title = '[国家]';
                }else if(data.dwType == Game.Define.Enum_enumChatType.CHAT_TYPE_SEPT){
                	title = '[公会]';
                }else if(data.dwType == Game.Define.Enum_enumChatType.CHAT_TYPE_BLESS){
                	title = '[祝福]';
                }
                if(data.country && data.country != Game.UserModel.GetCountry()){
                    name = cc.js.formatStr(RichLine, "handler1", cc.js.formatStr(RichColor,"#A52222", "#FF0000", data.pstrName+":"));
                }else{
                   name = cc.js.formatStr(RichLine, "handler1", cc.js.formatStr(RichColor,"#1b700b", "#32e90e", data.pstrName+":")); 
                }
            }
            title = cc.js.formatStr(RichColor, "#6F3312", "#FCE181", title);
            
            if(data.txt1 && data.txt1 != '' && !this._bless){
                detail = cc.js.formatStr(RichColor, "#6F3312", "#FFF9E6", data.txt1);
            }else{
                detail =  cc.js.formatStr(RichColor, "#6F3312", "#FFF9E6", data.pstrChat);
                if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_BLESS){
                    detail = detail + cc.js.formatStr(RichColor,"#1b700b", "#32e90e", '[点击祝福]');
                }
            }

            
            // else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_JIJIE){
            //     // detail = detail + cc.js.formatStr(RichColor,"#1b700b", "#32e90e", '[点击集结]');
            // }
    		
    		str = title + name + detail;
    		this.lab_richtext.string = str;
    	}
    },
    handler1(event, param){
    	this._touching = true;
        if(this._data && this._data.dwFromID != Game.UserModel.GetCharid()){
            var msg = {
                charid: this._data.dwFromID,
            }
            Game.NetWorkController.SendProto('msg.ObserveUserInfo',msg);
        }
    },
    
    onTouchCallback(){
    	if(this._touching){
    		this._touching = false;
    		return;
    	}
        if(Game._.isFunction(this._callback)){
            Game.Tools.InvokeCallback(this._callback,Game._.get(this, '_data',0));
            return;
        }
    },
});