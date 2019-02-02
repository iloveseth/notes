const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        richtexts_record: { default: [], type: [cc.RichText] }
    },
    onEnable: function () {
        Game.NotificationController.On(Game.Define.EVENT_KEY.SEPTPK_RECORDUPDATE, this, this.onSeptPkRecordUpdate);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        Game.NetWorkController.SendProto('spk.reqSeptPkRecord', {});
    },
    onDisable: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SEPTPK_RECORDUPDATE, this, this.onSeptPkRecordUpdate);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    },
    //====================  这是分割线  ====================
    onSeptPkRecordUpdate: function () {
        let records = Game.SeptPkModel.GetSeptPkRecords();
        for (let i = 0; i < this.richtexts_record.length; i++) {
            let richtext = this.richtexts_record[i];
            if (i >= records.length) {
                richtext.string = '';
                continue;
            }
            let record = records[i];
            if (record == null) {
                richtext.string = '';
                continue;
            }
            let win = Game._.get(record, 'win', false);
            let att = Game._.get(record, 'att', false);
            let color = win ? cc.Color.GREEN.toHEX() : cc.Color.RED.toHEX();
            let info =
                '<outline color=black width=2><color=#' + color + '>' + Game.moment.unix(Game._.get(record, 'time', 0)).format('M-D h:m ') +
                    att ? '发起对' : '被 ' + '<color=#FFA500>' + Game._.get(record, 'name', '') + '</color> ' +
                        att ? '' : '发起' + '公会战，战斗' + win ? '胜利!' : '失败!' + '</color></outline>';
            richtext.string = info;
        }
    },
    onTouchEnd: function () {
        this.onClose();
    }
});
