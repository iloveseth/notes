const Game = require('../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        cellList: { default: [], type: [require('./MapCell')] },
        cellMapByPosition: { default: {} },
        posList: { default: [] },
        canrun: { default: null }
    },
    start: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegin, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        for (let i = 0; i < this.node.childrenCount; i++) {
            let child = this.node.children[i];
            let cell = child.getComponent('MapCell');
            this.cellList.push(cell);
            let key = this.makeKey(child.x, child.y);
            this.cellMapByPosition[key] = cell;
        }
        for (let i = 0; i < 64; i++) {
            this.posList.push(Game.Tools.CalculateArrange(64, i, 32));
        }
    },
    onDestroy: function () {

    },
    //====================  回调函数  ====================
    onSaveClick: function () {
        let result = [];
        let arr = [];
        for (let i = 0; i < this.cellList.length; i++) {
            let cell = this.cellList[i];
            arr.push(cell.IsCanRun());
            if (arr.length >= 32) {
                let num = this.makeNumber(arr);
                result.push(num);
                arr = [];
            }
        }
        cc.log(result);
        cc.log(JSON.stringify(result));
    },
    onTouchBegin: function (event) {
        let cell = this.getNodeByPosition(event.getLocation());
        if (cell != null) {
            this.canrun = !cell.IsCanRun();
        }
    },
    onTouchMove: function (event) {
        if (this.canrun != null) {
            let cell = this.getNodeByPosition(event.getLocation());
            if (cell != null) {
                cell.SetCanRun(this.canrun);
            }
        }
    },
    onTouchEnd: function () {
        this.canrun = null;
    },
    //====================  数据处理函数  ====================
    getNodeByPosition: function (worldPos) {
        let pos = this.node.convertToNodeSpaceAR(worldPos);
        let x = this.getNearestValue(pos.x);
        let y = this.getNearestValue(pos.y);
        let key = this.makeKey(x, y);
        return this.cellMapByPosition[key];
    },
    getNearestValue: function (val) {
        for (let i = 0; i < this.posList.length; i++) {
            let pos = this.posList[i];
            if (Math.abs(pos - val) <= 16) {
                return pos;
            }
        }
        return 0;
    },
    makeKey: function (x, y) {
        return (x * 100000 + y);
    },
    makeNumber: function (arr) {
        if (arr.length != 32) {
            cc.error('arr error  : ' + JSON.stringify(arr));
            return 0;
        }
        let num = 0;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i]) {
                num |= (1 << (31 - i))
            }
        }
        return num;
    }
}); 
