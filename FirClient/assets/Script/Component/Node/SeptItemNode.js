const Game = require('../../Game');
cc.Class({
    extends: cc.ArrayNode,

    properties: {
        septdata: { default: null },
        target: { default: null },
        index: { default: 0 }
    },
    //====================  这是分割线  ====================
    init: function (index, data) {
        if (index > data.array.length) {
            this.node.active = false;
            return;
        }
        this.node.active = true;
        this.septdata = data.array[index];
        this.target = data.target;
        this.index = index;
        this._updateView();
    },
    onPKClick: function () {
        if (Game._.isFunction(Game._.get(this, 'target.onPKClick', null))) {
            this.target.onPKClick(Game._.get(this, 'septdata.septid', 0));
        }
    },
    onMemClick: function () {
        if (Game._.isFunction(Game._.get(this, 'target.onMemClick', null))) {
            this.target.onMemClick(Game._.get(this, 'septdata.septid', 0));
        }
    },
    _updateView: function () {
        let info = [
            this.index,
            Game._.get(this, 'septdata.name', ''),
            Game.UserModel.GetCountryShortName(Game._.get(this, 'septdata.country', 1)),
            Game._.get(this, 'septdata.pnum', ''),
            Game.Tools.UnitConvert(Game._.get(this, 'septdata.sumfight', 0))
        ];
        this.SetInfo(info);
        if (Game._.get(this, 'septdata.septid', 0) == Game.UserModel.GetSeptId()) {
            this.SetActive([]);
        } else {
            this.SetActive(['Button_pk', 'Button_mem']);
        }
    }
});
