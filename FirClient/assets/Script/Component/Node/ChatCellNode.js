// ChatCellNode.js
const Game = require('../../Game');
const NameColor = {
    own    : cc.color(9, 245, 14),
    friend : cc.color(255, 255, 255),
    system : cc.color(255, 255, 255),
    enemy  : cc.color(255, 255, 255),
}
const NameLineColor = {
    own    : cc.color(94, 57, 41),
    friend : cc.color(44, 79, 20),
    system : cc.color(161, 111, 59),
    enemy  : cc.color(255, 81, 81),
}

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_name: { default: null, type: cc.Label_ },
        lab_country: { default: null, type: cc.Label_ },
        lab_detail: { default: null, type: cc.Label_ },
        lab_richtext: { default: null, type: cc.RichText },
        lab_time:{default: null, type: cc.Label_ },
        lab_sept:{default: null, type: cc.Label_ },
        lab_temp:{default: null, type: cc.Label_ },
        sprite_title_icon:{default: null, type: cc.Sprite_ },
        sp_bg:{default: null, type: cc.Sprite_ },
        lab_richtext: { default: null, type: cc.RichText },
    },

    onLoad() {
        this._id = 0;
        this._data = null;
        this.startX = this.lab_name.node.getPositionX();

    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        this._callback = data.callback;
        // this.lab_richtext.setRichTarget(this);
        if (this._data){
            this.setChatInfo(this._data);
        }
    },
    onEnable() {

    },
    onDisable() {

    },
    setChatInfo(data){
    	if(data){
            var x = this.startX;
            if(data.title != 0){
                var titleIcon = Game.ChatModel.getTitleImg(data.title);
                this.sprite_title_icon.setVisible(false);
                // if(titleIcon != ""){
                //     this.sprite_title_icon.setVisible(true);
                //     var path = "Image/Common/UI/MainPage/"+titleIcon;
                //     this.sprite_title_icon.SetSprite(path);
                //     x = x + 30;
                // }
            }
            this.lab_name.node.setPositionX(x);

            if(data.issysinfo > 0){
                this.lab_name.setText("系统消息");
                // this.lab_sept.setText("");
                this.lab_country.setText("");
                this.setTitleColor(NameColor.system);
                this.setTitleLine(NameLineColor.system);
                this.sp_bg.SetSprite(Game.ChatModel.GetChatCellBgImg('icon_xitong'));
            }else{
                this.lab_name.setText(data.pstrName);
                var width = this.lab_name.node.width;
                this.lab_country.setText("");
                this.lab_sept.setText("");
                if(data.dwType == Game.Define.Enum_enumChatType.CHAT_TYPE_WORLD){
                    if(data.country == 1 || data.country == 2){
                        this.lab_country.setText("【"+Game.UserModel.GetCountryShortName(data.country)+"】");
                    }
                    x = x+width+5;
                    this.lab_country.node.setPositionX(x);
                    if(data.issept == 1){
                        this.lab_sept.setText("("+data.septName+")");
                    }else{
                        this.lab_sept.setText(data.septName);
                    }
                    x = x+this.lab_country.node.width+5;
                    this.lab_sept.node.setPositionX(x);
                    var mycountry = Game.UserModel.GetCountry();
                    if(data.country != mycountry){
                        // this.lab_country.node.color = cc.color(165,5,10);
                        //  this.lab_name.node.color = cc.color(165,5,10);
                        this.setTitleColor(NameColor.friend);
                        this.setTitleLine(NameLineColor.friend);
                    }else{
                        // this.lab_country.node.color = cc.color(46, 120, 0);
                        // this.lab_name.node.color = cc.color(46, 120, 0);
                         this.setTitleColor(NameColor.enemy);
                         this.setTitleLine(NameLineColor.enemy);
                    }
                }else if(data.dwType == Game.Define.Enum_enumChatType.CHAT_TYPE_COUNTRY){
                    if(data.issept == 1){
                       this.lab_sept.setText("("+data.septName+")");
                    }else{
                        this.lab_sept.setText(data.septName);
                    }
                    x = x+width+5;
                    this.lab_sept.node.setPositionX(x);
                }else if(data.dwType == Game.Define.Enum_enumChatType.CHAT_TYPE_PRIVATE){

                }else if(data.dwType == Game.Define.Enum_enumChatType.CHAT_TYPE_SEPT){

                }
                this.sp_bg.SetSprite(Game.ChatModel.GetChatCellBgImg(data.dwFromID));
            }
            if(data.dwFromID == Game.UserModel.GetCharid()){
                this.setTitleColor(NameColor.own);
                this.setTitleLine(NameLineColor.own);
            }
            
            this.lab_time.setText(Game.moment.unix(data.dwChatTime).format('HH:mm:ss'));
    		// this.lab_country.setText(Game.UserModel.GetCountryName(data.country));
            this.lab_detail.setText('');
            // let RichColor = '<color=%s>%s</c>';
            let RichColor = '<outline color=%s width=2><color=%s>%s</c></outline>';
            let detail = cc.js.formatStr('<color=%s>%s</c>',"#6F4122",data.pstrChat);
            this.lab_richtext.string = detail;
            this.lab_temp.setText(data.pstrChat);
            let lab_width = this.lab_temp.node.width;
            let lab_height = this.lab_richtext.node.height;
            let new_width = (lab_width + 40) > 480 ? 480 : (lab_width + 40);
            this.sp_bg.node.width = new_width;
            if(lab_height <= 30){
                this.sp_bg.node.height = 50;
            }else{
                this.sp_bg.node.height = 82;
            };

            if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_BLESS){
                // 祝福 #6F4122
                let s_str = detail + cc.js.formatStr('<color=%s>%s</c>',"#6F4122",'[点击祝福]');
                this.lab_richtext.string = s_str;
            }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_JIJIE){
                // 集结
                let s_str = detail + cc.js.formatStr('<color=%s>%s</c>',"#6F4122", '[点击集结]');
                this.lab_richtext.string = s_str;
            }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_CREATESEPT){
                let s_str = detail + cc.js.formatStr('<color=%s>%s</c>',"#6F4122", '[点击加入]');
                this.lab_richtext.string = s_str;
            }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_BORDERTEAM){
                let s_str = detail + cc.js.formatStr('<color=%s>%s</c>',"#6F4122", '[点击加入]');
                this.lab_richtext.string = s_str;
            }

    		// this.lab_time.setText(data.time);
            // if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_BLESS){
            //     // 祝福
            //     // cc.c3b(93,78,38)
            //     this.lab_detail.node.color = cc.color(93,78,38);
            // }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_SPYASSIST){
            //     // 刺探换色
            //     // (cc.c3b(93,44,38)
            //     this.lab_detail.node.color = cc.color(93,44,38);
            // }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_JIJIE){
            //     // 集结
            //     // (cc.c3b(93,44,38)
            //     this.lab_detail.node.color = cc.color(93,44,38);
            // }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_GUARD){
            //     // 镖车
            //     // cc.c3b(93,92,38)
            //     this.lab_detail.node.color = cc.color(93,92,38);
            // }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_BORDER){
            //     // 守边
            //     // (cc.c3b(93,44,38))
            //     this.lab_detail.node.color = cc.color(93,44,38);
            // }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_PROTECTGUARD){
            //     // 救镖
            //     // (cc.c3b(93,44,38))
            //     this.lab_detail.node.color = cc.color(93,44,38);
            // }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_ASSIST){
            //     // 助攻
            //     // (cc.c3b(93,44,38))
            //     this.lab_detail.node.color = cc.color(93,44,38);
            // }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_REDENVELOPE){
            //     // 红包
            //     // (cc.c3b(93,78,38))
            //     this.lab_detail.node.color = cc.color(93,78,38);
            // }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_MISHU){
            //     // -小秘书
            //     // (cc.c3b(93,92,38))
            //     this.lab_detail.node.color = cc.color(93,92,38);
            // }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_CREATESEPT){
            //     // -创建公会
            //     // (cc.c3b(93,92,38))
            //     this.lab_detail.node.color = cc.color(93,92,38);
            // }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_FLOWER){
            //     // 鲜花
            //     // (cc.c3b(93,78,38))
            //     this.lab_detail.node.color = cc.color(93,78,38);
            // }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_BORDERTEAM){
            //     // 组队
            //     // (cc.c3b(93,44,38))
            //     this.lab_detail.node.color = cc.color(93,44,38);
            // }else if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_USERTREASURE){
            //     // 组队
            //     // (cc.c3b(93,44,38))
            //     this.lab_detail.node.color = cc.color(93,44,38);
            // }else{
            //     // self._richlabel:setFontColor(cc.c3b(0,0,0))   
            //     this.lab_detail.node.color = cc.color(0,0,0);  
            // }

            // if(data.dwType == Game.Define.Enum_enumChatType.CHAT_TYPE_BLESS){
            //     var name = cc.js.formatStr("%s",data.septName);
            //     var bclick = null;
            //     // if(data.sysInfoType == Game.Define.Enum_SysChatType.SYS_CHAT_SPYASSIST){
            //     //     bclick = g_ChatData.SpyClick[t.toID]
            //     // }else{
            //     //     bclick = g_ChatData.BlessClick[t.toID]
            //     // }
            //     // cc.js.formatStr
            // }
    		
    	}
    },
    setTitleColor(color){
       this.lab_name.node.color = color;
        // this.lab_name.setOutlineColor();
        this.lab_country.node.color = color;
        this.lab_sept.node.color = color;
    },
    setTitleLine(color){
        this.lab_name.setOutlineColor(color);
        this.lab_country.setOutlineColor(color);
        this.lab_sept.setOutlineColor(color);
    },
    onTouchCallback(){
        if(Game._.isFunction(this._callback)){
            Game.Tools.InvokeCallback(this._callback,Game._.get(this, '_data',0));
            return;
        }
    },
});