const _ = require('lodash');
const Tools = require('../Util/Tools');
const Define = require('../Util/Define');
const ConfigController = require('./ConfigController');
const NotificationController = require('./NotificationController');
const NetWorkController = require('./NetWorkController');
const Level = require('../Model/Level');
const UserModel = require('../Model/User');

var GuideController = function () {
    this.guides = {};
    this.enterDialogues = [];
    this.levelDialogues = {};
    this.unlockFunction = [];
    this.runningGuide = false;
    this.doneGuideList = [];
    //第一次开放功能列表
    this.firstOpenFuncList = [];
    this.functionDefines = [];
}

GuideController.prototype.Init = function (cb) {
    NetWorkController.AddListener('login.synGuideProgMap', this, this.onGuideProgMap);
    NotificationController.On(Define.EVENT_KEY.ROLE_LOGINFINISH, this, this.OnLoginFinish);
    NotificationController.On(Define.EVENT_KEY.TIP_LEVELUP, this, this.checkoutFunctionOpen);
    NotificationController.On(Define.EVENT_KEY.FIRST_OPENFUNCTION, this, this.checkoutFunctionOpen);
    this.enterDialogues = ConfigController.GetConfig('enterdialog_data');
    this.enterDialogues = _.sortBy(this.enterDialogues, ['turn']);
    let levelDialogues = ConfigController.GetConfig('stagedialog_data');
    for (let i = 0; i < levelDialogues.length; i++) {
        let levelid = _.get(levelDialogues[i], 'stageid', -1);
        if (levelid != -1) {
            let dialogues = this.levelDialogues[levelid];
            if (dialogues == null) {
                dialogues = [];
            }
            dialogues.push(levelDialogues[i]);
            this.levelDialogues[levelid] = dialogues;
        }
    }
    _.forIn(this.levelDialogues, function (value, key) {
        this.levelDialogues[key] = _.sortBy(value, ['turn']);
    }.bind(this));
    this.functionDefines = ConfigController.GetConfig('levellimit_data');
    Tools.InvokeCallback(cb, null);
}
GuideController.prototype.Reload = function (cb) {
    this.runningGuide = false;
    this.doneGuideList = [];
    Tools.InvokeCallback(cb, null);
}
//====================  对外接口  ====================
GuideController.prototype.GetCountryPrincessPath = function (countryid) {
    if (countryid == 1) {
        return 'Animation/Npc/huojingling/';
    } else {
        return 'Animation/Npc/bingjingling/';
    }
}

GuideController.prototype.StartGuideWithId = function (id, isFightBoss = false) {
    if (_.indexOf(this.doneGuideList, id) != -1) {
        cc.log('该引导已完成' + id);
        return;
    }
    let guideDefine = ConfigController.GetConfigById('newbieguide_data', id);
    if (guideDefine != null) {
        if (guideDefine.bossfight != 0 && !isFightBoss) {
            return;
        }
        let subguide = ConfigController.GetConfigById('subguide_data', _.get(guideDefine, 'subguide', 0));
        if (subguide != null) {
            this.StartGuide(subguide, null);
        }
        this.doneGuideList.push(id);
    }
}

GuideController.prototype.isFirstTooBossMapGuide = function (mapid){
    let gConfigs = ConfigController.GetConfig('newbieguide_data');
    let gConfig = _.find(gConfigs, { openmap: mapid });
    if(gConfig && gConfig.bossfight != 0 && !this.IsGuideComplete(gConfig.id)){
        return true;
    }
    return false;
}

GuideController.prototype.StartGuideWithSubId = function (id) {
    let subguide = ConfigController.GetConfigById('subguide_data', id);
    if (subguide != null) {
        this.StartGuide(subguide, null, true);
    }
}

GuideController.prototype.StartGuide = function (data, fixednode, ignoreRunning = false) {
    if (!ignoreRunning && this.runningGuide) {
        return;
    }
    cc.log('引导 ' + _.get(data, 'id', 0) + ' 开始');
    this.runningGuide = true;
    let opts = {
        data: data,
        callback: this.OnGuideComplete.bind(this),
        fixednode: fixednode
    }
    NotificationController.Emit(Define.EVENT_KEY.GUIDE_START, opts);
}
GuideController.prototype.GetTrackGuide = function () {
    let id = 0;
    _.forIn(this.guides, function (value, key) {
        if (!value.finished && value.trigger) {
            if (_.indexOf(this.doneGuideList, _.toNumber(key)) != -1) {
                return true;
            }
            id = _.toNumber(key);
            return false;
        }
        return true;
    }.bind(this));
    return id;
}
GuideController.prototype.GetEnterDialogue = function () {
    return this.enterDialogues;
}
GuideController.prototype.GetLevelDialogue = function (id) {
    return this.levelDialogues[id];
}

GuideController.prototype.ShowLevelDialogue = function (id) {
    return;
    let dialogues = this.levelDialogues[id];
    if (dialogues != null) {
        NotificationController.Emit(Define.EVENT_KEY.DIALOGUE_START, {
            dialogues: dialogues
        });
    }
}
GuideController.prototype.ShowEnterDialogue = function () {
    return;
    NotificationController.Emit(Define.EVENT_KEY.DIALOGUE_START, {
        bg: 'Image/LoadSence/denglu_img_02',
        dialogues: this.enterDialogues
    });
}
GuideController.prototype.IsFunctionOpen = function (id) {
    let define = _.find(this.functionDefines, { id: id });
    if (define == null) {
        return true;
    }

    let maplimit = define.limit == null ? 0 : define.limit;
    if (maplimit != 0 && maplimit > Level.GetTopMapId()) {
        return false;
    }
    let guidelimit = define.guidelimit == null ? 0 : define.guidelimit;
    if (guidelimit != 0 && !this.IsGuideComplete(guidelimit)) {
        return false;
    }
    let levellimit = define.levellimit == null ? 0 : define.levellimit;
    if (levellimit != 0 && levellimit > UserModel.GetLevel()) {
        return false;
    }
    return true;
}

GuideController.prototype.IsGuideComplete = function (id) {
    let data = this.guides[id];
    if (data == null) {
        return false;
    }
    return data.finished;
}
//第一次开启的功能提示列表
GuideController.prototype.GetFirstOpenFuncList = function () {
    return this.firstOpenFuncList;
}
//删除第一次开启的功能提示
GuideController.prototype.RemoveFirstOpenFunc = function (id) {
    _.remove(this.firstOpenFuncList, function (info) {
        return info == id;
    });
}
//====================  事件回调  ====================
GuideController.prototype.OnGuideComplete = function (data) {
    let sync = _.get(data, 'sync', 0);
    if (sync == 1) {
        //需要同步
		let group = _.get(data, 'group', 0);
        NetWorkController.SendProto('login.setGuideProg', { id: group });
		this.doneGuideList.push(group);
    }
    let next = _.get(data, 'next', 0);
    if (next != 0) {
        this.StartGuideWithSubId(next);
    } else {
        cc.log('引导 ' + _.get(data, 'id', 0) + ' 结束');
        this.runningGuide = false;
        NotificationController.Emit(Define.EVENT_KEY.GUIDE_END);
    }
}
GuideController.prototype.OnLoginFinish = function () {
    //登陆成功了 可以计算我哪些功能没开启了
    this.unlockFunction = [];
    for (let i = 0; i < this.functionDefines.length; i++) {
        let define = this.functionDefines[i];
        let id = define.id || 0;
        if (!this.IsFunctionOpen(id)) {
            this.unlockFunction.push(id);
        }
    }
}
GuideController.prototype.GetFunctionByMap = function (mapid) {
    for (let i = 0; i < this.functionDefines.length; i++) {
        let define = this.functionDefines[i];
        if (_.get(define, 'showtips', 0) == mapid && _.get(define, 'minitips', '') != '') {
            return define;
        }
    }
    return null;
}
//====================  消息处理  ====================
GuideController.prototype.onGuideProgMap = function (msgid, data) {
    for (let i = 0; i < data.prog.length; i++) {
        let id = data.prog[i].id;
        this.guides[id] = _.cloneDeep(data.prog[i]);
    }
    NotificationController.Emit(Define.EVENT_KEY.GUIDE_UPDATE);
    // NotificationController.Emit(Define.EVENT_KEY.LEVEL_COUNTUPDATE);
    this.checkoutFunctionOpen();
}
//====================  私有函数  ====================
GuideController.prototype.checkoutFunctionOpen = function () {
    let openedList = [];
    for (let i = 0; i < this.unlockFunction.length; i++) {
        let id = this.unlockFunction[i];
        if (this.IsFunctionOpen(id)) {
            //开启了
            openedList.push(id);
            this.firstOpenFuncList.push(id);
        }
    }
    if (openedList.length > 0) {
        for (let i = 0; i < openedList.length; i++) {
            NotificationController.Emit(Define.EVENT_KEY.FUNCTION_OPEN, openedList[i]);
        }
        this.unlockFunction = _.pullAll(this.unlockFunction, openedList);
    }
}

module.exports = new GuideController();