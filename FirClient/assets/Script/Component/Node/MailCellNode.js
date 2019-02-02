// MailCellNode.js
const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        btn_get: { default: null, type: cc.Node },
        btn_remove: { default: null, type: cc.Node },
        lab_get: { default: null, type: cc.Label_ },
        lab_title: { default: null, type: cc.Label_ },
        lab_last_time: { default: null, type: cc.Label_ },
        node_item: { default: null, type: cc.Node },
        lab_richtext: { default: null, type: cc.RichText },
        Label_get: { default: null, type: cc.Label_ },
        Sprite_dot: { default: null, type: cc.Sprite_ },
    },

    onLoad() {
        this._id = 0;
        this._data = null;
    },

    init(index, data, reload, group) {
        if (index >= data.array.length) {
            this.node.active = false;
            return;
        }
        this.node.active = true;
        this._target = data.target;
        this._data = data.array[index];
        this.lab_richtext.setRichTarget(this);
        this._charid = 0;
        if (this._data) {
            this._id = this._data.id;
            this.setMailInfo(this._data);
        }
    },
    handler1(event, param) {
        var msg = {
            charid: this._data.fid,
        }
        Game.NetWorkController.SendProto('msg.ObserveUserInfo',msg);
    },
    handler2(event, param) {
        if(this._charid > 0){
            Game.DigModel.needOpenDigOtherView = true;
            Game.NetWorkController.SendProto('msg.ReqRobDigInfo', {charid:this._charid}); 
        }else{
            Game.GlobalModel.SetIsOpenDigView(true);
            Game.NetWorkController.SendProto('msg.reqAllDigStatus', {}); 
        }
        
    },
    handler3(event, param) {
        this._target.openView(Game.UIName.UI_GYM_FIGHT_LIST_VIEW);
    },

    setMailInfo(mailInfo) {
        var country_txt = Game.UserModel.GetCountryName(mailInfo.country || 2);
        var mailtxt = "";

        var RichColor = "<color=%s>%s</c>"; //#532E11
        var NormalColor = "<color=#532E11>%s</c>";
        var RichLine = "<u click='%s'>%s</u>";
        // var RichClick = "<on click=%s>%s</on>"; 
        switch (mailInfo.type) {
            case 1: // 远古遗迹
                this.lab_get.setText("加仇人");
                mailtxt = mailtxt + country_txt + "的";
                mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler1", cc.js.formatStr(RichColor, "#FF0000", mailInfo.fname));
                mailtxt = mailtxt + mailInfo.text + "<br/>";
                mailtxt = mailtxt + "是否前往";
                mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler2", cc.js.formatStr(RichColor, "#FF0000", "庄园"));
                mailtxt = mailtxt + "夺回";
                break;
            case 2: // 竞技场
                if (mailInfo.fname != "") {//被人击败时
                    this.lab_get.setText("加仇人");
                    mailtxt = mailtxt + country_txt + "的";
                    mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler1", cc.js.formatStr(RichColor, "#FF0000", mailInfo.fname));
                    mailtxt = mailtxt + mailInfo.text + "<br/>";
                    mailtxt = mailtxt + "是否前往";
                    mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler3", cc.js.formatStr(RichColor, "#FF0000", "竞技场"));
                } else {//竞技场排名奖励
                    mailtxt = mailtxt + mailInfo.text;
                }
                break;
            case 3:
            case 8: // 镖车被劫
                this.lab_get.setText("加仇人");
                mailtxt = mailtxt + "晶石";
                mailtxt = mailtxt + "被" + country_txt + "的";
                mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler1", cc.js.formatStr(RichColor, "#FF0000", mailInfo.fname)) + "<br/>";
                mailtxt = mailtxt + mailInfo.text;
                break;
            case 4: //集结
                this.lab_get.setText("加仇人");
                var txtMsg = mailInfo.text;
                txtMsg = txtMsg.gsub(txtMsg, "\<br/>", "<br/>");
                mailtxt = mailtxt + txtMsg;
                break;
            case 6: //升星邮件
            case 9: // 比拼奖励邮件
            case 10:
                var txt = mailInfo.text.split("[**客户端替换**]");
                if (txt[0]) {
                    mailtxt = mailtxt + txt[0];
                }
                mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler1", cc.js.formatStr(RichColor, "#FF0000", mailInfo.fname));
                if (txt[1]) {
                    mailtxt = mailtxt + txt[1];
                }
                break;
            case 7: //赠送金袋邮件
                mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler1", cc.js.formatStr(RichColor, "#00B633", mailInfo.fname));
                mailtxt = mailtxt + "向你赠送了礼物";
                break;
            case 11: // 挖宝占领之后被夺回
                mailtxt = mailtxt + country_txt + "的";
                mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler1", cc.js.formatStr(RichColor, "#FF0000", mailInfo.fname)) + "<br/>";
                mailtxt = mailtxt + mailInfo.text + "<br/>";
                mailtxt = mailtxt + "是否继续前往对方";
                mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler2", cc.js.formatStr(RichColor, "#FF0000", "庄园"));
                mailtxt = mailtxt + "占领";
                this._charid = this._data.fid;
                break;
            case 12: //添加好友邮件
                mailtxt = mailtxt + country_txt + "的";
                mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler1", cc.js.formatStr(RichColor, "#FF0000", mailInfo.fname)) + "<br/>";
                mailtxt = mailtxt + mailInfo.text;
                break;
            default:
                mailtxt = mailtxt + this.getConciseDetailStr(mailInfo.text);
                break;
        }
        this.lab_richtext.string = cc.js.formatStr(NormalColor, mailtxt);

        let canRecieveReward = Game.MailModel.CanMailGetReward(mailInfo.id);
        this.lab_last_time.setText(Game.moment(mailInfo.createtime * 1000).from(Game.TimeController.GetCurTimeMs()));
        this.lab_title.setText(mailInfo.title);
        // this.Sprite_dot.node.active = Game.MailModel.CanMailGetReward(this._data.id);
        this.btn_remove.active = !canRecieveReward;
        this.node_item.active = true;
        Game.ResController.DestoryAllChildren(this.node_item);
        if (Game.MailModel.HasMailReward(mailInfo.id)) {
            let rewards = Game.MailModel.GenerateRewardById(mailInfo.id);
            for (let i = 0; i < rewards.length; i++) {
                let reward = rewards[i];
                let node = cc.instantiate(Game.ViewController._singItemPrefab);
                var item = node.getComponent('SingleItemNode');
                if (item) {
                    item.updateView(reward);
                }
                this.node_item.addChild(node);
            }
        }
        switch (mailInfo.mtype) {
            case Game.Define.MAIL_TYPE.MAIL_TYPE_FIGHT:
                if (Game.MailModel.HasMailReward(mailInfo.id)) {
                    this.lab_get.setText('领 取');
                    if (canRecieveReward) {
                        this.btn_get.active = true;
                    } else {
                        this.btn_get.active = false;
                        this.Label_get.node.active = true;
                    }
                } else {
                    this.btn_get.active = false;
                    this.Label_get.node.active = false;
                }
                break;
            case Game.Define.MAIL_TYPE.MAIL_TYPE_AWARD:
                this.lab_get.setText('领 取');
                if (canRecieveReward) {
                    this.btn_get.active = true;
                } else {
                    this.btn_get.active = false;
                    this.Label_get.node.active = true;
                }
                break;
            case Game.Define.MAIL_TYPE.MAIL_TYPE_SYSTEM:
                this.btn_get.active = true;
                this.lab_get.setText(canRecieveReward ? '领 取' : '查 看');
                break;
            default:
                break;
        }
    },
    getConciseDetailStr(txt) {
        var txtMsg = txt;
        var strlen = txtMsg.length;
        var maxLen = 63;
        if (strlen > maxLen) {
            txtMsg = this.truncateUTF8String(txtMsg, maxLen - 6);
            txtMsg = txtMsg + "......";
        }
        return this.GetChars(txtMsg);
    },
    truncateUTF8String(s, n) {
        var dropping = s.charCodeAt(n + 1);
        if (!dropping) {
            return s
        }
        if (dropping >= 128 && dropping < 192) {
            return this.truncateUTF8String(s, n - 1)
        }
        return s.substr(0, n);
    },
    GetChars(str){
    // var strs =  Game._.dropWhile(str, function(char){
    //     return char == " "});
        str = str.replace(/\s+/g,"");
        return str;
    },
    onTouchGet() {
        let canRecieveReward = Game.MailModel.CanMailGetReward(this._data.id);
        if (canRecieveReward) {
            Game.NetWorkController.SendProto('msg.GetAttachment', { mailid: [this._id] });
        } else {
            this.onTouchToDetail();
        }
    },
    onTouchRemoveMail() {
        if (this._data) {
            var mailid = [];
            mailid.push(this._id);
            Game.NetWorkController.SendProto('msg.DelMail', { mailid: mailid });
        }
    },
    onTouchToDetail() {
        this._target.openView(Game.UIName.UI_MAIL_DETAIL_VIEW, this._data);
    },
});