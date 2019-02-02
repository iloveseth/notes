const _ = require('lodash');
const Tools = require('./Tools');
let AsyncGenerator = function () {
    this.pendingList = {};
    this.processFuncs = {};
    this.intervels = {};
    this.passTime = {};
};

AsyncGenerator.prototype.Define = {
    MAINVIEW_CHARACTER: 1,
    DEFENBORDER_ENEMY: 2,
    DEFENBORDER_TEAMMATE: 3,
    SEPTPK_ENEMY: 4,
    SEPTPK_TEAMMATE: 5,
}

AsyncGenerator.prototype.StartGenerate = function (type, interval, list, processfunc, replace) {
    if (replace) {
        this.pendingList[type] = list;
    } else {
        let oldList = this.pendingList[type];
        if (oldList != null) {
            this.pendingList = _.concat(oldList, list);
        }
    }
    this.intervels[type] = interval;
    this.processFuncs[type] = processfunc;
    this.passTime[type] = 0;
}
AsyncGenerator.prototype.StopGenerate = function (type) {
    delete this.pendingList[type];
    delete this.processFuncs[type];
    delete this.intervels[type];
    delete this.passTime[type];
}
AsyncGenerator.prototype.Update = function (dt) {
    let finishList = [];
    _.forIn(this.pendingList, function (value, key) {
        if (value == null || value.length <= 0) {
            finishList.push(key);
        } else {
            let passTime = this.passTime[key] || 0;
            let interval = this.intervels[key] || 0;
            if (passTime >= interval) {
                //需要生成啦
                let obj = value.shift();
                this.pendingList[key] = value;
                let func = this.processFuncs[key] || null;
                Tools.InvokeCallback(func, obj);
                this.passTime[key] = 0;
            } else {
                this.passTime[key] = passTime + dt;
            }
        }
    }.bind(this));
    for (let i = 0; i < finishList; i++) {
        this.StopGenerate(finishList[i]);
    }
}

module.exports = new AsyncGenerator();
