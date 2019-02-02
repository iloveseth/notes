const NetWorkController = require('./NetWorkController');
const Tools = require('../Util/Tools');
const Define = require('../Util/Define');
const CppCmd = require('../Util/CppCmd');

let TimeController = function () {
    this._recievedTime = Tools.GetMilliSecond();
    this._clientTime = Tools.GetMilliSecond();

    this._passTime = 0;
};
/**
 * 
 * @param {Function} cb 
 */
TimeController.prototype.Init = function (cb) {
    NetWorkController.AddBinaryListener(Define.MSG_ID.GameTimeTimerUserCmd, this, this.GameTimeTimerUserCmd);
    Tools.InvokeCallback(cb, null);
};

TimeController.prototype.Update = function(dt){
    this._passTime += dt;
}

TimeController.prototype.GetCurTime = function () {
    let cur = Tools.GetMilliSecond();
    return Math.floor((cur - this._clientTime + this._recievedTime) / 1000);
}

TimeController.prototype.GetCurTimeMs = function () {
    let cur = Tools.GetMilliSecond();
    return cur - this._clientTime + this._recievedTime;
}

TimeController.prototype.GetRunTime = function () {
    return Math.floor((Tools.GetMilliSecond() - this._clientTime) / 1000);
}

TimeController.prototype.GameTimeTimerUserCmd = function (buffer) {
    let result = CppCmd.ParseGameTimeTimerUserCmd(buffer);
    cc.log('TimeContoller Test clienttime:',this._clientTime);
    cc.log('TimeContoller Test recievedtime:',this._recievedTime);
    cc.log('TimeContoller Test difftime:', this._recievedTime - this._clientTime);
    cc.log('TimeContoller Test passtime:', this._passTime);
    this._passTime = 0;
    this._clientTime = Tools.GetMilliSecond();
    this._recievedTime = result.qwGameTime * 1000;
    //回消息
    let msg = CppCmd.NewUserGameTimeTimerUserCmd(this.GetRunTime());
    NetWorkController.SendBinary(msg, 'NewUserGameTimeTimerUserCmd');
}

module.exports = new TimeController();