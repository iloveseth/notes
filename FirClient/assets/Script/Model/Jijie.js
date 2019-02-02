const _ = require('lodash');
const Define = require('../Util/Define');
const Tools = require('../Util/Tools');
const UIName = require('../Util/UIName');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const ViewController = require('../Controller/ViewController');
const CountDown = require('../Util/CountDown');
const UserModel = require('../Model/User');

var JijieModel = function () {
    this.jijieList = [];
    this.jijienum = 0;
    this.firstJijieData = null;
    this.myjijieData = null;
    this.myjijieClash = null;
    this.isMyJijie = false;
    this.is_openui = false;
}

JijieModel.prototype.Init = function (cb) {

    NetWorkController.AddListener('jijie.retJijieMainData', this, this.onRetJijieMainData);
    NetWorkController.AddListener('jijie.sendJijieNum', this, this.onSendJijieNum);
    NetWorkController.AddListener('jijie.retJijieList', this, this.onRetJijieList);
    Tools.InvokeCallback(cb);

    //初始化逻辑：为了设置顶部图标  首先
    //请求集结列表
    //判断集结是否自己参与：请求集结详细数据，对比：进攻方，防守方，发起人
    //如果是自己发起或者自己参与：设置集结图标
    //如果没有自己发起或者参与的集结：
}
JijieModel.prototype.Reload = function (cb) {
    this.jijieList = [];
    this.jijienum = 0;
    this.firstJijieData = null;
    this.myjijieData = null;
    this.myjijieClash = null;
    this.isMyJijie = false;
    this.is_openui = false;
    Tools.InvokeCallback(cb);
}
//发起集结
JijieModel.prototype.callJijie = function (objid, type) {
    var msg = {
        objid: objid,
        type: type,
    }
    this.setOpengui(true);//发起集结的时候，要打开界面
    NetWorkController.SendProto('jijie.reqStartJijie', msg);
}

//加入集结
JijieModel.prototype.joinJijie = function (guid) {
    var msg = {
        guid: guid,
    }
    this.setOpengui(true);//加入集结的时候，要打开界面
    NetWorkController.SendProto('jijie.reqJoinJijie', msg);

}

JijieModel.prototype.reqJijieList = function () {
    NetWorkController.SendProto('jijie.reqJijieList', {});
}

//请求集结详细数据，服务器决定是否打开集结界面
JijieModel.prototype.reqJijieMainData = function (guid) {
    NetWorkController.SendProto('jijie.reqJijieMainData', { guid: guid });
},

    JijieModel.prototype.onRetJijieMainData = function (ret, data) {
        this.firstJijieData = data.data;
        this.isMyJijie = this.checkMyJijie(this.firstJijieData);
        if (this.isMyJijie) {
            this.myJijie = this.jijieList[0];
            CountDown.SetCountDown(CountDown.Define.TYPE_JIJIE, data.data.timeleft);
        }
        else {//不是我的集结
            var randomIdx = Math.floor(Math.random() * this.jijienum);
            this.otherJijie = this.jijieList[randomIdx];
        }
        if (this.is_openui && data.is_openui) {
            ViewController.OpenView(UIName.UI_AGGREGATIONVIEW, 'ViewLayer', data.data);
        }
        else {
            NotificationController.Emit(Define.EVENT_KEY.JIJIE_LIST_REFRESH);
        }
    }

//初始化：服务器会推sendjijienum
JijieModel.prototype.onSendJijieNum = function (ret, data) {
    this.jijienum = data.num;

    this.reqJijieList();
}

JijieModel.prototype.onRetJijieList = function (msgid, data) {
    this.jijieList = data.list;
    this.jijienum = data.list.length;
    if (this.jijienum > 0) {
        this.setOpengui(false);
        this.reqJijieMainData(this.jijieList[0].guid);
    }
    else {
        NotificationController.Emit(Define.EVENT_KEY.JIJIE_LIST_REFRESH);
    }
}
//检查是否是我发起的或者我参与的集结
JijieModel.prototype.checkMyJijie = function (jijiedata) {
    var attlist = jijiedata.attlist;
    var deflist = jijiedata.deflist;
    var isMyJijie = false;
    attlist.forEach(e => {
        if (e.charid == UserModel.GetCharid()) {
            isMyJijie = true;
        }
    });
    deflist.forEach(e => {
        if (e.charid == UserModel.GetCharid()) {
            isMyJijie = true;
        }
    });
    return isMyJijie;
}

JijieModel.prototype.setOpengui = function (open) {
    this.is_openui = open;
}

module.exports = new JijieModel();