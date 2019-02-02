const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_rank: { default: null, type: cc.Label_ },
        lab_name: { default: null, type: cc.Label_ },
        lab_common_num: { default: null, type: cc.Label_ },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        let rankNum = index + 1;
        let rankName = Game._.get(this._data,"name","无");
        let countryID = Game._.get(this._data,"country",0);
        let countryStr = Game.UserModel.GetCountryShortName(countryID);
        let goldNum = Game._.get(this._data,"num",0);

        this.lab_rank.string = rankNum;
        this.lab_name.string = rankName+"["+countryStr+"]";
        this.lab_common_num.string = goldNum;
    },

});
