const _ = require('lodash');
const moment = require('moment');
const bigInteger = require('big-integer');
let Tools = {
    GetRandomInt: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    },
    GetRandomResult: function () {
        return Math.random() < 0.5;
    },
    CheckParams: function (obj, params) {
        var lostParams = [];
        for (var i = 0; i < params.length; i++) {
            if (obj[params[i]] == null) {
                lostParams.push(params[i]);
            }
        }
        return lostParams;
    },
    GetRandomString: function (len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    },
    InvokeCallback: function (cb) {
        if (_.isFunction(cb)) {
            cb.apply(null, Array.prototype.slice.call(arguments, 1));
            return true;
        }
        return false;
    },
    GetMilliSecond: function () {
        return moment().unix() * 1000 + moment().milliseconds();
    },
    CalculateCouponStr: function (value) {
        let coupon = _.isString(value) ? parseInt(value) : value;
        let info = null;
        if (coupon > 9999) {
            let ret = (coupon / 1000).toFixed(2);
            ret = ret == Math.floor(ret) ? Math.floor(ret) : ret;
            info = { num: ret, suffix: 'k' };
        } else {
            info = { num: coupon, suffix: '' };
        }
        return info;
    },
    AutoFit: function (canvas) {
        let designResolution = canvas.designResolution
        var viewSize = cc.view.getFrameSize()
        if (viewSize.width / viewSize.height > designResolution.width / designResolution.height) {
            canvas.fitHeight = true;
            canvas.fitWidth = false;
        }
        else {
            canvas.fitHeight = false;
            canvas.fitWidth = true
        }
    },
    ObjectLength: function (obj) {
        if (_.isObject(obj)) {
            return _.keys(obj).length;
        }
        return 0;
    },
    toDecimal: function (x) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return;
        }
        f = Math.round(x * 100) / 100;
        return f;
    },
    zeroPadding: function (tbl) {
        return function (num, n) {
            return (0 >= (n = n - num.toString().length)) ? num.toString() : (tbl[n] || (tbl[n] = Array(n + 1).join('0'))) + num.toString();
        };
    }([]),
    ParseQueryParam: function (str) {
        let arr = str.split('&');
        let ret = {};
        arr.forEach(item => {
            let tmp = item.split('=');
            ret[tmp[0]] = tmp[1];
        });
        return ret;
    },
    CalculateArrange: function (len, index, step) {
        return ((1 - len) / 2 + index) * step;
    },
    FormatSeconds: function (value) {
        var theTime = parseInt(value);// 秒
        var theTime1 = 0;// 分
        var theTime2 = 0;// 小时
        // alert(theTime);
        if (theTime > 60) {
            theTime1 = parseInt(theTime / 60);
            theTime = parseInt(theTime % 60);
            // alert(theTime1+"-"+theTime);
            if (theTime1 > 60) {
                theTime2 = parseInt(theTime1 / 60);
                theTime1 = parseInt(theTime1 % 60);
            }
        }
        var result = "";
        if (theTime >= 0 && theTime < 10) {
            result = "0" + parseInt(theTime) + "";
        } else if (theTime >= 10) {
            result = "" + parseInt(theTime) + "";
        }
        if (theTime1 >= 0 && theTime1 < 10) {
            result = "0" + parseInt(theTime1) + ":" + result;
        } else if (theTime1 >= 10) {
            result = "" + parseInt(theTime1) + ":" + result;
        };
        if (theTime2 >= 0 && theTime2 < 10) {
            result = "0" + parseInt(theTime2) + ":" + result;
        } else if (theTime2 >= 10) {
            result = "" + parseInt(theTime2) + ":" + result;
        }
        return result;
    },
    UnitConvert: function (num) {
        let moneyUnits = ["", "万", "亿", "兆", "京", "垓", "秭", "穰", "沟", "涧", "正", "载", "极"];
        let dividend = 10000;
        let curentNum = num; //转换数字 
        let curentUnit = moneyUnits[0]; //转换单位 

        for (let i = 0; i < moneyUnits.length; i++) {
            curentUnit = moneyUnits[i];
            if (Math.floor(curentNum / dividend) <= 0 || i >= moneyUnits.length - 1) { break; }
            curentNum = curentNum / dividend;
        }

        return this.toDecimal(curentNum) + curentUnit;
    },
    toDecimal: function (x) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return;
        }
        f = Math.round(x * 100) / 100;
        return f;
    },
    GetNearestValue: function (arr, val, diff) {
        let index = Tools.GetNearestIndex(arr, val, diff);
        if (index != -1) {
            return arr[index];
        }
        return 0;
    },
    GetNearestIndex: function (arr, val, diff) {
        for (let i = 0; i < arr.length; i++) {
            if (Math.abs(arr[i] - val) <= (diff / 2)) {
                return i;
            }
        }
        return -1;
    }
}

module.exports = Tools;
