// MailSystemView.js
const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        btn_get: { default: null, type: cc.Node },
        lab_title: { default: null, type: cc.Label_ },
        // lab_detail: { default: null, type: cc.Label_ },
        node_item: { default: null, type: cc.Node },
        lab_richtext: { default: null, type: cc.RichText },
        Label_get: { default: null, type: cc.Label_ },
        node_jiangli: { default: null, type: cc.Node },

        node_union:{default: null, type: cc.Node},
        node_agree:{default: null, type: cc.Node},
    },
    onEnable: function () {
        Game.NotificationController.On(Game.Define.EVENT_KEY.MAIL_DETAIL_REFRESH, this, this.onMailDetailUpdate);
    },
    onDisable: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MAIL_DETAIL_REFRESH, this, this.onMailDetailUpdate);
    },
    setData(data) {
        this._maileInfo = null;
        this._id = 0;
        this.lab_richtext.setRichTarget(this);
        this._maileInfo = data;
        this._id = this._maileInfo.id;
        this._charid = 0;
        this.setMailInfo(this._maileInfo);
    },
    //====================  按钮回调函数  ====================
    handler1(event, param) {
        var msg = {
            charid: this._maileInfo.fid,
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
        this.openView(Game.UIName.UI_GYM_FIGHT_LIST_VIEW);
    },
    onTouchGet() {
        if (this._maileInfo) {
            switch (this._maileInfo.mtype) {
                case Game.Define.MAIL_TYPE.MAIL_TYPE_AWARD:
                    var mailid = [];
                    mailid.push(this._id);
                    Game.NetWorkController.SendProto('msg.GetAttachment', { mailid: mailid });
                    break;
                default:
                    break;
            }
        }
    },
    onTouchJoin(){
        Game.NetWorkController.SendProto('msg.applyJoinSept', {
            septid: this._maileInfo.fid,
        });
        this.onClose();
    },
    onTouchRemoveMail(){
        var mailid = [];
        mailid.push(this._id);
        Game.NetWorkController.SendProto('msg.DelMail', { mailid: mailid });
        this.onClose();
    },
    onIconClick: function (itemid, obj, cell) {
        let content = Game.ItemModel.GenerateCommonContentByObject(obj);
        let pos = cell.node.parent.convertToWorldSpaceAR(cell.node.position);
        Game.TipPoolController.ShowItemInfo(content, pos, this.node);
    },
    onMailDetailUpdate: function () {
        let mailInfo = Game.MailModel.GetMailById(this._id);
        if (mailInfo != null) {
            this.setData(mailInfo);
        }
    },
    //====================  私有函数  ====================
    setMailInfo(mailInfo) {
        var country_txt = Game.UserModel.GetCountryName(mailInfo.country || 2);
        var mailtxt = "";
        var RichColor = "<color=%s>%s</c>"; //#532E11
        var NormalColor = "<color=#532E11>%s</c>";
        var RichLine = "<u click='%s'>%s</u>";
        switch (mailInfo.type) {
            case 1: // 远古遗迹
                mailtxt = mailtxt + country_txt + "的";
                mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler1", cc.js.formatStr(RichColor, "#FF0000", mailInfo.fname));
                mailtxt = mailtxt + mailInfo.text + "<br/>";
                mailtxt = mailtxt + "是否前往";
                mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler2", cc.js.formatStr(RichColor, "#FF0000", "庄园"));
                mailtxt = mailtxt + "夺回";
                break;
            case 2: // 竞技场
                if (mailInfo.fname != "") {//被人击败时
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
                mailtxt = mailtxt + "晶石";
                mailtxt = mailtxt + "被" + country_txt + "的";
                mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler1", cc.js.formatStr(RichColor, "#FF0000", mailInfo.fname)) + "<br/>";
                mailtxt = mailtxt + mailInfo.text;
                break;
            case 4: //集结
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
                this._charid = this._maileInfo.fid;
                break;
            case 12: //添加好友邮件
                mailtxt = mailtxt + country_txt + "的";
                mailtxt = mailtxt + cc.js.formatStr(RichLine, "handler1", cc.js.formatStr(RichColor, "#FF0000", mailInfo.fname)) + "<br/>";
                mailtxt = mailtxt + mailInfo.text;
                break;
            default:
                mailtxt = mailtxt + mailInfo.text;
                break;
        }
        this.lab_richtext.string = cc.js.formatStr(NormalColor, mailtxt);
        this.lab_title.setText(mailInfo.title);
        this.node_union.active = (mailInfo.type == 5 && Game.UserModel.GetSeptname() == '');
        this.node_agree.active = (mailInfo.type == 5 && Game.UserModel.GetSeptname() != '');
        let hasRewards = Game.MailModel.HasMailReward(mailInfo.id);
        this.node_jiangli.active = hasRewards;
        if (hasRewards) {
            let rewards = Game.MailModel.GenerateRewardById(mailInfo.id);
            let width = Math.min(600, rewards.length * 100);
            this.node_item.width = width;
            Game.ResController.DestoryAllChildren(this.node_item);
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
        this.btn_get.active = Game.MailModel.CanMailGetReward(mailInfo.id);
    },

});