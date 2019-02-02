const _ = require('lodash');
const Define = require('../Util/Define');
const Tools = require("../Util/Tools");
const UIName = require('../Util/UIName');
const CountDown = require('../Util/CountDown');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const ViewController = require('../Controller/ViewController');
const UserModel = require('../Model/User');

var BlessModel = function () {
    this.blessInfo = null;
    this.robbingsparIconData = null;
    this.escortsparIconData = null;
}

BlessModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.retGuardBless', this, this.onretGuardBless);
    NetWorkController.AddListener('msg.retBlessICON', this, this.onretBlessICON);
    Tools.InvokeCallback(cb, null);
}

/**
 * 对外接口
 */
//目前没有

BlessModel.prototype.checkTwoDataHasIdentical = function (oldData,newData) {
    let oldType = _.get(oldData,"type",0);
    let newType = _.get(newData,"type",0);
    if(oldType != newType){return true};

    let oldInfo = _.get(oldData,"info",[]);
    let newInfo = _.get(newData,"info",[]);
    if(oldInfo.length == newInfo.length){return false;};

    return true;
}

/**
 * 消息处理接口
 */
BlessModel.prototype.onretGuardBless = function (msgid, data) {
    if(this.blessInfo && !this.checkTwoDataHasIdentical(this.blessInfo,data)){
        return;
    };

    this.blessInfo = data;
    CountDown.SetCountDown(CountDown.Define.TYPE_BLESS, _.get(data, 'lefttime', 0));
    if (!ViewController.IsOpen(UIName.UI_BLESSVIEW_TEMP)) {
        ViewController.OpenView(UIName.UI_BLESSVIEW_TEMP, "ViewLayer");
    }else{
        NotificationController.Emit(Define.EVENT_KEY.BLESS_INFO_REFRESH,true);
    };
}

BlessModel.prototype.onretBlessICON = function (msgid, data) {
    if (data.type == Define.BlessType.BlessType_Temple) {
        this.robbingsparIconData = data;
        CountDown.SetCountDown(CountDown.Define.TYPE_ROBBINGSPARBLESS, _.get(data, 'time', 0));
        NotificationController.Emit(Define.EVENT_KEY.ROBBINGSPAR_ICON_REFRESH);
    } else if (data.type == Define.BlessType.BlessType_Guard) {
        this.escortsparIconData = data;
        CountDown.SetCountDown(CountDown.Define.TYPE_ESCORTSPARBLESS, _.get(data, 'time', 0));
        NotificationController.Emit(Define.EVENT_KEY.ESCORTSPAR_ICON_REFRESH);
    } else if (data.type == Define.BlessType.BlessType_Dig3) {
        this.DigIconData_3 = data;
        CountDown.SetCountDown(CountDown.Define.TYPE_DIGLESS_3, _.get(data, 'time', 0));
        NotificationController.Emit(Define.EVENT_KEY.DIG_ICON_REFRESH);
    } else if (data.type == Define.BlessType.BlessType_Dig4) {
        this.DigIconData_4 = data;
        CountDown.SetCountDown(CountDown.Define.TYPE_DIGLESS_4, _.get(data, 'time', 0));
        NotificationController.Emit(Define.EVENT_KEY.DIG_ICON_REFRESH);
    }
}

//请求祝福（自己或别人）
BlessModel.prototype.reqBlessCommon = function(type,blessid,charid){
    var msg = null;
    var proto = '';
    //如果charid有值并且不为自己：查看别人的
    if(charid && charid != UserModel.GetCharid()){
        msg = {
            userid: charid,
            type: type,
            blessid: blessid,
        }
        proto = 'msg.reqBlessFriend';
    }
    else{
        msg = {
            type: type,
            blessid: blessid
        };
        proto = 'msg.reqBless'
    }
    NetWorkController.SendProto(proto,msg);
}


module.exports = new BlessModel();