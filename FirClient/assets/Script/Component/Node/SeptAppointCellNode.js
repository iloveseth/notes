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
        Sprite_select: { default: null, type: cc.Sprite_ },
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

            let secMasterInfo = Game._.find(Game.SeptModel.selectSeptsecmaster, {'userid': this._data.userid});
            this.Sprite_select.node.active = secMasterInfo != null;
        }
    },

    onClickSelect() {
        let secMasterInfo = Game._.find(Game.SeptModel.selectSeptsecmaster, {'userid': this._data.userid});
        if (secMasterInfo) {
            this.Sprite_select.node.active = false;
            Game._.remove(Game.SeptModel.selectSeptsecmaster, function (o) {
                return o.userid == this._data.userid;
            }.bind(this));
        } else {
            if (Game.SeptModel.selectSeptsecmaster.length < 2) {
                this.Sprite_select.node.active = true;
                Game.SeptModel.selectSeptsecmaster.push(this._data);
            } else {
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, '最多只能选择2位副会长...');
            }
        }
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.SEPT_APPOINT_REFRESH);
    },
});
