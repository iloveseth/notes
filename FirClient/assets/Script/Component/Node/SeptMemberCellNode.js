const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        Label_name: { default: null, type: cc.Label_ },
        Label_fight: { default: null, type: cc.Label_ },
        Label_online: { default: null, type: cc.Label_ },
        Label_job: { default: null, type: cc.Label_ },
        Sprite_head: { default: null, type: cc.Sprite_ },
        Sprite_online: { default: null, type: cc.Sprite_ },
        Button_transfermaster: { default: null, type: cc.Button_ },
        Button_kick: { default: null, type: cc.Button_ },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        if (this._data) {
            let jobStr = '成员';
            if (this._data.postion == Game.Define.SEPTPOSITION.SEPTNORMAL) {
                jobStr = '成员';
            } else if (this._data.postion == Game.Define.SEPTPOSITION.SEPTMASTER) {
                jobStr = '会长';
            } else if (this._data.postion == Game.Define.SEPTPOSITION.SEPTSECMASTER) {
                jobStr = '副会长';
            }
            this.Label_job.setText(jobStr);

            if (this._data.online == 1) {
                this.Label_online.setText('在线');
                this.Label_name.node.color = cc.color(255, 255, 255);
            } else {
                this.Label_name.node.color = cc.color(175, 175, 175);
                this.Label_online.setText('离线:'+ Game.moment(this._data.leavetime*1000).from(Game.TimeController.GetCurTimeMs()));
            }
            this.Label_name.setText(this._data.name);
            this.Label_fight.setText('战力：' + Game.Tools.UnitConvert(this._data.fight));

            this.Sprite_head.SetSprite(Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(this._data.face)));
            this.Sprite_online.SetSprite(Game.UserModel.GetOnlineImg(this._data.online));

            if (Game.SeptModel.septMemberData.septid == Game.UserModel.GetSeptId()) {
                let septpermissionConfig = Game.ConfigController.GetConfigById('septpermission_data', Game.UserModel.GetSeptpostion(), 'position');
                
                if (septpermissionConfig) {
                    if (septpermissionConfig.kickuser == 1 && this._data.userid != Game.UserModel.GetCharid()) {
                        if (Game.UserModel.GetSeptpostion() == Game.Define.SEPTPOSITION.SEPTMASTER) {
                            this.Button_kick.node.active = true;
                        } else if (Game.UserModel.GetSeptpostion() == Game.Define.SEPTPOSITION.SEPTSECMASTER && this._data.postion == Game.Define.SEPTPOSITION.SEPTNORMAL) {
                            this.Button_kick.node.active = true;
                        } else {
                            this.Button_kick.node.active = false;
                        }
                    } else {
                        this.Button_kick.node.active = false;
                    }
                } else {
                    this.Button_kick.node.active = false;
                }
                this.Button_transfermaster.node.active = Game.UserModel.GetSeptpostion() == Game.Define.SEPTPOSITION.SEPTMASTER && this._data.userid != Game.UserModel.GetCharid();
            } else {
                this.Button_kick.node.active = false;
                this.Button_transfermaster.node.active = false;
            }
        }
    },

    onClickLook() {
        Game.NetWorkController.SendProto('msg.ObserveUserInfo', {charid: this._data.userid});
    },

    onClickKick() {
        Game.NetWorkController.SendProto('msg.removeSeptMember', {
            userid: this._data.userid
        });
    },

    onClickTransfermaster() {
        let title = '转让会长';
        let desc = '确认选择'+ this._data.name +'为新会长？';
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
            {
                name: '确定',
                handler: function () {                                
                    Game.NetWorkController.SendProto('msg.transferSeptMaster', {
                        userid: this._data.userid
                    });
                }.bind(this),
            },
            {
                name: '取消'
            }
        ]);
    }

});
