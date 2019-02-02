const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        Label_rank: { default: null, type: cc.Label_ },
        Label_septname: { default: null, type: cc.Label_ },
        Label_level: { default: null, type: cc.Label_ },
        Label_mainname: { default: null, type: cc.Label_ },
        Label_fight: { default: null, type: cc.Label_ },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        if (this._data) {
            this.Label_rank.setText(`${index+1}`);
            if (this._data.country == Game.UserModel.GetCountry()) {
                this.Label_septname.node.color = cc.color(83,46,17);
            } else {
                this.Label_septname.node.color = cc.color(255,0,0);
            }
            this.Label_septname.setText('['+ Game.UserModel.GetCountryShortName(this._data.country) +']' + this._data.name);
            this.Label_level.setText(`${this._data.level}级`);
            this.Label_mainname.setText(this._data.mastername);
            this.Label_fight.setText(Game.Tools.UnitConvert(this._data.fightval));
        }
    },

    onClickDetail() {
        Game.SeptModel.isOpenSeptMember = true;
        Game.NetWorkController.SendProto('msg.reqSeptMemberList', {
            septid: this._data.septid
        });
    }
});
