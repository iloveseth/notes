const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        Label_name: { default: null, type: cc.Label_ },
        Label_time: { default: null, type: cc.Label_ },
        Label_money: { default: null, type: cc.Label_ },
        Label_topget: { default: null, type: cc.Label_ },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        if (this._data){
            this.Label_name.setText('[' + Game.UserModel.GetCountryShortName(this._data.country) + ']' + this._data.name);
            this.Label_time.setText(Game.moment.unix(this._data.time).format('hh:mm:ss'));
            this.Label_money.setText(`${this._data.getgold}金币`);
            this.Label_topget.node.active = this._data.lucky == 1;
        }
        this.node.active = this._data != null;
    },
});