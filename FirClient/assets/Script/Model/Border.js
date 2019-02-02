const _ = require('lodash');
const Define = require('../Util/Define');
const Tools = require('../Util/Tools');
const CountDown = require('../Util/CountDown');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const ConfigController = require('../Controller/ConfigController');
const Item = require('./Item');
const User = require('./User');
const ViewController = require('../Controller/ViewController');
const UIName = require('../Util/UIName');

let BorderModel = function () {
    this.borderTeamList = {};
    this.myBorderTeamDetail = {};
    this.myBorderTeam = {};
    this.enemyData = {};
    this.borderRewards = [];
    this.status = Define.BorderStatus.Status_Pedding;
}

BorderModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('borderteam.retBorderTeamlist', this, this.onRetBorderTeamlist);
    NetWorkController.AddListener('borderteam.sendBorderTeamDetail', this, this.onBorderTeamDetail);
    NetWorkController.AddListener('borderteam.synBorderTeamIcon', this, this.onSynBorderTeamIcon);
    NetWorkController.AddListener('border.retEnemy', this, this.onRetEnemy);
    NetWorkController.AddListener('borderteam.retLeaveTeam', this, this.onRetLeaveTeam);
    NetWorkController.AddListener('borderteam.retKickOutUser', this, this.onRetKickOutUser);
    NetWorkController.AddListener('borderteam.retDismissTeam', this, this.onRetDismissTeam);
    NetWorkController.AddListener('borderteam.sendBorderPkFinish', this, this.onBorderPkFinish);
    let borderDefines = ConfigController.GetConfig('borderteam_data');
    for (let i = 0; i < borderDefines.length; i++) {
        let define = borderDefines[i];
        let result = Item.GenerateObjectsFromCommonReward(define.rewardId);
        let rewards = result.objs;
        this.borderRewards.push(rewards);
    }
    //初始化奖励
    Tools.InvokeCallback(cb, null);
}
BorderModel.prototype.Reload = function (cb) {
    this.borderTeamList = {};
    this.myBorderTeamDetail = {};
    this.myBorderTeam = {};
    this.enemyData = {};
    this.status = Define.BorderStatus.Status_Pedding;
    Tools.InvokeCallback(cb, null);
}
/**
 * 对外接口
 */
BorderModel.prototype.GetLeftDefenTimes = function () {
    return _.get(this, 'borderTeamList.leftcount', 0);
}
BorderModel.prototype.GetMaxDefenTimes = function () {
    return _.get(this, 'borderTeamList.maxcount', 0);
}
BorderModel.prototype.GetPkTimes = function () {
    return _.get(this, 'borderTeamList.borderpk', 0);
}
BorderModel.prototype.GetPkWinTimes = function () {
    return _.get(this, 'borderTeamList.borderpkwin', 0);
}
BorderModel.prototype.GetBorderTeams = function () {
    return _.get(this, 'borderTeamList.list', []);
}

BorderModel.prototype.GetTeamId = function () {
    let teamid = _.get(this, 'myBorderTeamDetail.teamid', 0);
    if (teamid == 0) {
        teamid = _.get(this, 'myBorderTeam.teamid', 0);
    }
    return teamid;
}
BorderModel.prototype.GetBorderState = function () {
    return _.get(this, 'myBorderTeam.state', 0);
}
BorderModel.prototype.GetBorderCardMembers = function () {
    return _.get(this, 'myBorderTeam.curmember', 0);
}
BorderModel.prototype.SetBorderCardMembers = function (value) {
    _.set(this, 'myBorderTeam.curmember', value);
}
BorderModel.prototype.GetBorderCardMaxMembers = function () {
    return _.get(this, 'myBorderTeam.maxmember', 0);
}
BorderModel.prototype.GetRewardProp = function () {
    return _.get(this, 'myBorderTeamDetail.rewardrate', 0);
}
BorderModel.prototype.GetMaxMember = function () {
    return _.get(this, 'myBorderTeamDetail.maxmember', 0);
}
BorderModel.prototype.GetTotalKill = function () {
    return _.get(this, 'myBorderTeamDetail.totalkill', 0);
}
BorderModel.prototype.GetLeaderId = function () {
    return _.get(this, 'myBorderTeamDetail.leaderid', 0);
}
BorderModel.prototype.GetTeamMembers = function () {
    return _.get(this, 'myBorderTeamDetail.list', []);
}
BorderModel.prototype.GetEnemies = function () {
    return _.get(this, 'enemyData.info', []);
}
BorderModel.prototype.IsTeamLeader = function () {
    return this.GetLeaderId() == User.GetCharid();
}
/**
 * 消息处理接口
 */
BorderModel.prototype.onRetBorderTeamlist = function (msgid, data) {
    this.borderTeamList = _.cloneDeep(data);
    NotificationController.Emit(Define.EVENT_KEY.BORDER_TEAMLISTUPDATE);
}
BorderModel.prototype.onBorderTeamDetail = function (msgid, data) {
    if (this.status == Define.BorderStatus.Status_Pedding) {
        return;
    }
    this.myBorderTeamDetail = _.cloneDeep(data);
    CountDown.SetCountDown(CountDown.Define.TYPE_BORDERTEAM, _.get(data, 'timeleft', 0));
    // if(this._isOpen){
        NotificationController.Emit(Define.EVENT_KEY.BORDER_MYTEAMDETAIL);
    // }else{
    //     ViewController.OpenView(UIName.UI_DEFENBORDER,'ViewLayer');

    // }
    if(data.list && data.list.length > 0){
        this.SetBorderCardMembers(data.list.length);
        NotificationController.Emit(Define.EVENT_KEY.BORDER_MYTEAMICON);
    }
}
BorderModel.prototype.onSynBorderTeamIcon = function (msgid, data) {
    this.myBorderTeam = _.cloneDeep(data);
    if (data.state == 2) {
        this.status = Define.BorderStatus.Status_Fighting;
    } else if (data.state == 1) {
        this.status = Define.BorderStatus.Status_Waitting;
    }
    CountDown.SetCountDown(CountDown.Define.TYPE_BORDERTEAM, _.get(data, 'timeleft', 0));
    NotificationController.Emit(Define.EVENT_KEY.BORDER_MYTEAMICON);
}
BorderModel.prototype.onRetEnemy = function (msgid, data) {
    this.enemyData = _.cloneDeep(data);
    NotificationController.Emit(Define.EVENT_KEY.BORDER_ENEMYUPDATE);
}
BorderModel.prototype.onRetLeaveTeam = function (msgid, data) {
    if (this.GetTeamId() == _.get(data, 'teamid', 0)) {
        this.LeaveTeam();
    }
}
BorderModel.prototype.onRetKickOutUser = function (msgid, data) {
    this.LeaveTeam();
}
BorderModel.prototype.onRetDismissTeam = function (msgid, data) {
    if (this.GetTeamId() == _.get(data, 'teamid', 0)) {
        this.LeaveTeam();
    }
}
BorderModel.prototype.onBorderPkFinish = function (msgid, data) {
    this.LeaveTeam();
}
BorderModel.prototype.LeaveTeam = function () {
    this.status = Define.BorderStatus.Status_Pedding;
    this.myBorderTeamDetail = {};
    this.myBorderTeam = {};
    this.enemyData = {};
    NotificationController.Emit(Define.EVENT_KEY.BORDER_LEAVETEAM);
}
module.exports = new BorderModel();