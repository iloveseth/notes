const Game = require('../../Game');
cc.Class({
    extends: cc.ArrayNode,

    properties: {
        teamdata: { default: null },
        target: { default: null }
    },
    //====================  这是分割线  ====================
    init: function (index, data) {
        if (index > data.array.length) {
            this.node.active = false;
            return;
        }
        this.node.active = true;
        this.teamdata = data.array[index];
        this.target = data.target;
        this._updateView();
    },
    onJoinClick: function () {
        if (Game._.isFunction(Game._.get(this, 'target.onJoinTeamClick', null))) {
            this.target.onJoinTeamClick(Game._.get(this, 'teamdata.teamid', 0));
        }
    },
    _updateView: function () {
        let info = [
            Game._.get(this, 'teamdata.leadername', ''),
            Game._.get(this, 'teamdata.killnum', ''),
            Game._.get(this, 'teamdata.membernum', '') + '/' + Game._.get(this, 'teamdata.maxmember', '')
        ];
        this.SetInfo(info);
    }
});
