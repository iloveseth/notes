let viewCell = cc.Class({
    extends: cc.Component,

    properties: {
        tableView: {
            default: null,
            visible: false
        },
        _isCellInit_: false,
        _longClicked_: false,
    },
    onEnable: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancle, this);
    },
    onDisable: function () {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancle, this);
    },
    //不可以重写
    _cellAddMethodToNode_: function () {
        this.node.clicked = this.clicked.bind(this);
    },
    _cellInit_: function (tableView) {
        this.tableView = tableView;
        if (!this._isCellInit_) {
            this._cellAddMethodToNode_();
            this._isCellInit_ = true;
        }
    },
    _longClicked: function () {
        this._longClicked_ = false;
        this.node.emit(cc.Node.EventType.TOUCH_CANCEL);
        this.longClicked();
    },
    //可以重写的方法

    //需要重写的方法
    longClicked: function () {

    },
    //被点击时相应的方法
    clicked: function () {

    },

    //加载需要初始化数据时调用
    init: function (index, data, reload, group) {

    },
    onTouchStart: function () {
        if (this.node.active === true && this.node.opacity !== 0) {
            if (!this._longClicked_) {
                this._longClicked_ = true;
                this.scheduleOnce(this._longClicked, 1.5);
            }
        }
    },
    onTouchMove: function () {
        if (this._longClicked_) {
            this._longClicked_ = false;
            this.unschedule(this._longClicked);
        }
    },
    onTouchEnd: function () {
        this.clicked();
        if (this._longClicked_) {
            this._longClicked_ = false;
            this.unschedule(this._longClicked);
        }
    },
    onTouchCancle: function () {
        if (this._longClicked_) {
            this._longClicked_ = false;
            this.unschedule(this._longClicked);
        }
    }
});

cc.viewCell = module.exports = viewCell;