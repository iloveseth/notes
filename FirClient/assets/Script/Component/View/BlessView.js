const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_title: { default: null, type: cc.Label_ },
        Label_timetitle: { default: null, type: cc.Label_ },
        Label_name: { default: null, type: cc.Label_ },
        Label_reason: { default: null, type: cc.Label_ },
        Label_result: { default: null, type: cc.Label_ },
        RichText_reward: { default: null, type: cc.RichText_ },
        Label_time: { default: null, type: cc.Label_ },
        Label_btnbless: { default: null, type: cc.Label_ },

        Tableview_role: { default: null, type: cc.tableView },
        Tableview_desc: { default: null, type: cc.tableView },

        Button_invitation: { default: null, type: cc.Button_ },
        Button_invitationLeft: { default: null, type: cc.Button_ },
        Button_ok: { default: null, type: cc.Button_ },
        Button_bless: { default: null, type: cc.Button_ },
    },

    onEnable() {
        this.initNotification();
        this.initView();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
        Game.BlessModel.blessInfo = null;
    },

    update(dt) {
        this.dfTime += dt;
        this.reqTime += dt;

        if (this.dfTime >= 1) {
            this.dfTime = 0;
            if (this._data.lefttime > 0) {
                // this.Label_timetitle.node.active = true;
                var time = Game.CountDown.GetCountDown(this.blesstype);
                if(time > 0){
                    this.Label_time.setText(Game.CountDown.FormatCountDown(this.blesstype, 'mm:ss'));
                }
                else{
                    this.Label_time.setText('已结束');
                }
            }
            else{
                // this.Label_timetitle.node.active = false;
                this.Label_time.setText('已结束');
            }
            this.refreshBtnLabel();
        }
        if(this.reqTime >= 2){
            this.reqTime = 0;
            let msg = null;
            let proto = '';
            let mine_other = Game._.get(this._data,"self",10);
            if(mine_other == 1){
                //自己
                msg = {
                    type: this._data.type,
                    blessid: this._data.blessid,
                };
                proto = 'msg.reqBless'
            }else if(mine_other == 0){
                //别人
                msg = {
                    userid: this._data.dwfromid,
                    type: this._data.type,
                    blessid: this._data.blessid,
                }
                proto = 'msg.reqBlessFriend';
            };
            Game.NetWorkController.SendProto(proto,msg);
        };
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.BLESS_INFO_REFRESH, this, this.blessInfoRefresh);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.BLESS_INFO_REFRESH, this, this.blessInfoRefresh);
    },

    onClosePanel() {
        if (Game.ViewController.IsOpen(Game.UIName.UI_ESCORTSPARVIEW)) {
            Game.NetWorkController.SendProto('border.gotoQuest', {type: Game.Define.CstoreItemType.CStoreType_YUNBIAO});
        }else if(this._data.type == Game.Define.BlessType.BlessType_Dig3 || this._data.type == Game.Define.BlessType.BlessType_Dig4){
            Game.NetWorkController.SendProto('msg.reqAllDigStatus', {});
        }
        this.onClose();
    },

    initView() {
        this.dfTime = 0;
        this.reqTime = 0;
        this.blessIntervalTime = 0;
        this.blesstype = 23;
        this.countDowmType = 0;
        this.Button_ok.node.active = false;
        this.Label_btnbless.setText('祝 福');
        this.Button_bless.interactable = true;

        this._blessTimes = 0;
    },

    blessInfoRefresh() {
        this.updateView(true);
    },

    updateView(isEvent=false) {
        // cc.log("BlessView updateView()");
        this._data = Game.BlessModel.blessInfo;

        let dwfromId = Game._.get(this, '_data.dwfromid', 0);
        this.Button_invitation.node.active = dwfromId == 0;
        this.Button_invitationLeft.node.active = dwfromId != 0;
        this.Button_bless.node.active = dwfromId != 0;
        this.Label_name.setText(this._data.name);
        let addper = Game._.get(this, '_data.addper', 0);

        if (this._data.type == Game.Define.BlessType.BlessType_Temple) {
            this.countDowmType = Game.CountDown.Define.TYPE_ROBBINGSPARBLESS;
        } else if (this._data.type == Game.Define.BlessType.BlessType_Guard) {
            this.countDowmType = Game.CountDown.Define.TYPE_ESCORTSPARBLESS;
        } else if (this._data.type == Game.Define.BlessType.BlessType_Dig3) {
            this.countDowmType = Game.CountDown.Define.TYPE_DIGLESS_3;
        } else if (this._data.type == Game.Define.BlessType.BlessType_Dig4) {
            this.countDowmType = Game.CountDown.Define.TYPE_DIGLESS_4;
        }
        if (this._data.lefttime != 0) {
            this.Label_time.setText(Game.CountDown.FormatCountDown(this.blesstype, 'mm:ss'));
        }
        else{
            this.Label_time.setText('已结束');
        }
        // this.Label_timetitle.node.active = this._data.lefttime > 0;

        // 祝福剩余次数
        this._blessTimes = this._data.myblessnum || 0;
        this.refreshBtnLabel(false);

        let blessList = Game._.get(this, '_data.info', []);
        let blessRoleList = [];
        let isAdd = true;
        for (let i = 0; i < blessList.length; i ++) {
            let blessInfo = blessList[i];
            isAdd = true;
            for (let b = 0; b < blessRoleList.length; b ++) {
                let blessRoleInfo = blessRoleList[b];
                if (blessRoleInfo.charid == blessInfo.charid) {
                    isAdd = false;
                    blessRoleList[b].num += 1;
                    if (blessInfo.type == 1) {
                        blessRoleList[b].addper += blessInfo.num;
                    } else if (blessInfo.type == 2) {
                        blessRoleList[b].addper -= blessInfo.num;
                    }
                }
            }

            if (isAdd) {
                let curaddper = 0;
                if (blessInfo.type == 1) {
                    curaddper += blessInfo.num;
                } else if (blessInfo.type == 2) {
                    curaddper -= blessInfo.num;
                }
                let roleblessInfo = {
                    charid: blessInfo.charid,
                    name: blessInfo.name,
                    num: 1,
                    addper: curaddper
                }
                blessRoleList.push(roleblessInfo);
            }
        }

        if(isEvent){
            this.Tableview_role.reloadTableView(blessRoleList.length, { array: blessRoleList, target: this });
            this.Tableview_desc.reloadTableViewJustAdd(blessList.length, { array: blessList, target: this });
            // this.Tableview_desc.reloadTableView(blessList.length, { array: blessList, target: this });
        }else{
            this.Tableview_role.initTableView(blessRoleList.length, { array: blessRoleList, target: this });
            this.Tableview_desc.initTableView(blessList.length, { array: blessList, target: this });
        }

        let strdesc = '';
        switch (this._data.type) {
            case Game.Define.BlessType.BlessType_Temple:
                // this.Button_ok.node.active = true && dwfromId != 0;
                this.Button_ok.node.active = false;
                this.Label_title.setText('晶石祝福');
                this.Label_reason.setText('晶石祝福');
                this.Label_result.setText(`${addper}%`);

                let rate = [0, 1, 1.5, 2, 3, 5];
                strdesc = '<outline color=#537E36 width=2><color=#ffffff>再祝福</color></outline>';
                strdesc = strdesc + '<outline color=#537E36 width=2><color='+ Game.ItemModel.GetItemLabelColorHex(this._data.nextcolor) +'>'+ this._data.nextper + '%' +'</color></outline>';
                strdesc = strdesc + '<outline color=#537E36 width=2><color=#ffffff>可必定刷出</color></outline>';
                strdesc = strdesc + '<outline color=#537E36 width=2><color='+ Game.ItemModel.GetItemLabelColorHex(this._data.nextcolor) +'>'+ Game.ItemModel.GetColorLabel(this._data.nextcolor) + '色(' + rate[this._data.nextcolor] + '倍奖励)' +'</color></outline>';
                this.RichText_reward.string = strdesc;
                let mine_other = Game._.get(this._data,"self",10);
                if(mine_other == 0){
                    //别人
                    this.Button_invitation.node.active = false;
                    this.Button_ok.node.active = false;
                };
                break;
            case Game.Define.BlessType.BlessType_Guard:
                this.Label_title.setText('护送晶石祝福');
                this.Label_reason.setText('护送晶石祝福');
                this.Label_result.setText(`提升${addper}%奖励`);

                let addexp = Game._.get(this, '_data.addexp', 0);
                let addmoney = Game._.get(this, '_data.addmoney', 0);
                strdesc = '<outline color=#537E36 width=2><color=#ffffff>提升经验'+ Game.Tools.UnitConvert(addexp) + '提升银币' + Game.Tools.UnitConvert(addmoney)+ '</color></outline>';
                break;
            case Game.Define.BlessType.BlessType_Dig3:
            case Game.Define.BlessType.BlessType_Dig4:
                this.Label_title.setText('庄园祝福');
                this.Label_reason.setText('庄园祝福');
                this.Label_result.setText(`提升${addper}%奖励`);

                let addmoney_dig = Game._.get(this, '_data.addmoney', 0);
                let addequip_dig = Game._.get(this, '_data.equipnum', 0);
                let additem_dig = Game._.get(this, '_data.items', null);
                if(addmoney_dig != 0){
                    strdesc = "<color=#ffffff>"+"提升银币*"+addmoney_dig+"</color>";
                }else if(addequip_dig != 0){
                    strdesc = "<color=#ffffff>"+"提升装备*"+addequip_dig+"</color>";
                }else if(additem_dig != null){
                    let itemid = Game._.get(additem_dig, 'itemid', 0);
                    let itemNum = additem_dig.num;
                    if(itemid == 0){
                        strdesc = "<color=#ffffff>"+"提升道具*"+itemNum+"</color>";
                    }else{
                        let itemName = Game.ConfigController.GetConfigById("object_data",itemid).name;
                        strdesc = "<color=#ffffff>"+"提升"+itemName+"*"+itemNum+"</color>";;
                    }
                }else{
                    strdesc = "";
                };
                break;
        }
        this.RichText_reward.string = strdesc;
        if(this.Button_invitationLeft.node.active && this._data.self != 1){
            this.Button_invitationLeft.node.active = false;
        }
    },

    refreshBtnLabel(needCountDown=true) {
        if(this._data.type == Game.Define.BlessType.BlessType_Dig3 || this._data.type == Game.Define.BlessType.BlessType_Dig4){
            this.Label_btnbless.setText(this._blessTimes > 0 ? `祝 福 (${this._blessTimes})` : '祝 福');
            // this.Button_bless.SetSprite(this._blessTimes > 0 ? 'Image/UI/Common/tongyong_icon_0002' : 'Image/UI/Common/tongyong_icon_gray');
            this.Button_bless.interactable = this._blessTimes > 0;
        }else{
            if(!needCountDown){return};
            if (this.blessIntervalTime > 0) {
                this.blessIntervalTime -= 1;
                if (this.blessIntervalTime > 0) {
                    this.Label_btnbless.setText(`祝 福 (${this.blessIntervalTime})`);
                    this.Button_bless.interactable = false;
                    
                } else {
                    this.Label_btnbless.setText('祝 福');
                    this.Button_bless.interactable = true;
                }
            }
        }
    },

    onClickInvitation() {
        Game.NetWorkController.SendProto('msg.startBless', {
            type: this._data.type,
            blessid: this._data.blessid
        });
        if(this._data.type == Game.Define.BlessType.BlessType_Temple) {
            Game.TaskModel.robbingHasBless = true;
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.ROBBING_BTN_REFRESH);
        };

        Game.BlessModel.blessInfo = null;
    },

    onClickEnd() {
        Game.NetWorkController.SendProto('msg.startChangeEnemyTemple', {});
        this.onClose();
    },

    onClickBless() {
        if(this._data.type == Game.Define.BlessType.BlessType_Dig3 || this._data.type == Game.Define.BlessType.BlessType_Dig4) {
            if(this._blessTimes <= 0){
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "祝福次数已经用完！");  
                return;
            }
        } else {
            this.blessIntervalTime = 4;
            this.Button_bless.interactable = false;  
        }
        this.dfTime = 1;
        this.reqTime = 0;
        Game.NetWorkController.SendProto('msg.blessFriend', {
            userid: this._data.dwfromid,
            type: this._data.type,
            blessid: this._data.blessid
        });
    }
});
