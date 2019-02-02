const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_name: { default: null, type: cc.Label_ },
        Label_time: { default: null, type: cc.Label_ },
        Label_money: { default: null, type: cc.Label_ },
        Label_getdesc: { default: null, type: cc.Label_ },
        TableView_getinfo: { default: null, type: cc.tableView },
    },

    onEnable() {
        this.dfTime = 0;
        this.refreshData();
        this.updateView();  
    },

    update(dt) {
        this.dfTime += dt;
        if(this.dfTime >= 1) {
            this.dfTime = 0;
            if (this._leftTime > 0) {
                this._leftTime -= 1;
                this.Label_time.setText(Game.moment.duration(this._leftTime, 'second').format('mm:ss'));
            } else {
                this.Label_time.setText('已结束');
            }
        }
    },

    refreshData() {
        //已经打开了一个红包界面则移除一个红包
        Game.TaskModel.luckystarList.splice(0, 1);
        Game.TaskModel.luckystarNum -= 1;
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TASK_LUCKYSTAR_REFRESH);
    },

    updateView() {
        this._leftTime = this._data.lefttime;
        this.Label_name.setText(this._data.name);
        this.Label_money.setText(this._data.mygold);
        this.Label_getdesc.setText(`已领取${this._data.curnum}/${this._data.maxnum}个，共${this._data.curgold}/${this._data.maxgold}金币`);
        this.Label_time.setText(Game.moment.duration(this._data.lefttime, 'second').format('mm:ss'));
        
        this.TableView_getinfo.initTableView(this._data.units.length, { array: this._data.units, target: this });
    }
});
