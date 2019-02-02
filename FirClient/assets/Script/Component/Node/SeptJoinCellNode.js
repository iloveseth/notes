const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        Label_septname: { default: null, type: cc.Label_ },
        Label_septnum: { default: null, type: cc.Label_ },
        Label_condition: { default: null, type: cc.Label_ },
        Label_tip: { default: null, type: cc.Label_ },
        Button_join: { default: null, type: cc.Button_ },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        if (this._data) {
            this.Label_septname.setText(this._data.info.name);
            this.Label_septnum.setText(this._data.info.pnum + '/' + this._data.info.maxpnum);

            if (this._data.entertype == 0) {    //战力限制
                this.Label_condition.setText(this._data.entervalue);

                if (this._data.entervalue > Game.UserModel.GetUserMainInfo().fightval) {
                    this.Label_tip.setText('条件不足');
                    this.Button_join.node.active = false;
                } else {
                    this.Label_tip.setText('');
                    this.Button_join.node.active = true;
                }
            } else if (this._data.entertype == 1) {    //会长批准
                this.Label_condition.setText('会长批准');
                this.Label_tip.setText('');
                this.Button_join.node.active = true;
            } else if (this._data.entertype == 2) {    //拒绝加入
                this.Label_condition.setText('拒绝申请');
                this.Label_tip.setText('');
                this.Button_join.node.active = false;
            } else {
                this.Label_condition.setText('无');
                this.Label_tip.setText('');
                this.Button_join.node.active = true;
            }

            if (this._data.info.pnum >= this._data.info.maxpnum) {
                this.Label_tip.setText('人数已满');
                this.Button_join.node.active = false;
            }
        }
    },

    onClickJoin() {
        Game.NetWorkController.SendProto('msg.applyJoinSept', {
            septid: this._data.info.septid
        });
    }
});
