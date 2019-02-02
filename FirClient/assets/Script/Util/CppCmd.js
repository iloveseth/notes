const moment = require('moment');
const Buffer = require('buffer/').Buffer;
const BigInteger = require('big-integer');
var protobuf = require("protobufjs/minimal");
const _ = require('lodash');
let util = protobuf.util;

const struct = require('./CppStruct');
const Define = require('./Define');
const CppCmd = {};

const _null_cmd_id = new struct('_null_cmd_', [
    '_id', struct.uint16(),
    'ordernum', struct.uint32()
]);

CppCmd.ParseBaseMsg = function (buffer) {
    let result = _null_cmd_id.decode(buffer, 0, { endian: "LE" });
    return result;
}

const NullUserCmd = new struct('NullUserCmd', [
    '_null_cmd_cmd', struct.type(_null_cmd_id, 1),
    'timestamp', struct.uint32(),
]);

CppCmd.GetChars = function (str) {
    var strs = _.dropRightWhile(str, function (char) {
        return char == "\0"
    });
    return strs.join('');
}

//====================  proto消息类  ====================
const ProtoMessage = new struct('ProtoMessage', [
    'NullUserCmd', struct.type(NullUserCmd, 1),
    'msgname', struct.char(33),
    'datalen', struct.uint32(),
]);

CppCmd.ProtoMessageSize = function () {
    return ProtoMessage.size();
}
CppCmd.NewProtoMessage = function (name, datalen) {
    var buffer = new Buffer(ProtoMessage.size());
    ProtoMessage.encode(buffer, 0, {
        NullUserCmd: {
            _null_cmd_cmd: {
                _id: Define.MSG_ID.stProtoMessage,
                ordernum: 0
            },
            timestamp: moment().unix()
        },
        msgname: name,
        datalen: datalen,
    }, { endian: "LE" });
    return buffer;
}

CppCmd.ParseProtoMessage = function (buffer) {
    let result = ProtoMessage.decode(buffer, 0, { endian: "LE" });
    return result;
};

//====================  创建cpp连接成功消息  ====================
const AccessCppGateCmd = new struct('AccessCppGateCmd', [
    '_null_cmd_id', struct.type(_null_cmd_id, 1),
    'result', struct.char(1)

]);
CppCmd.ParseAccessCppGateCmd = function (buffer) {
    let result = AccessCppGateCmd.decode(buffer, 0, { endian: "LE" });
    return result;
}
//====================  版本验证消息  ====================
const UserVerifyVerCmd = new struct('NullUserCmd', [
    'NullUserCmd', struct.type(NullUserCmd, 1),
    'reserve', struct.uint32(),
    'version', struct.uint32()
]);
//120 14052201
CppCmd.NewUserVerifyVerCmd = function (version) {
    var buffer = new Buffer(UserVerifyVerCmd.size());
    UserVerifyVerCmd.encode(buffer, 0, {
        NullUserCmd: {
            _null_cmd_cmd: {
                _id: Define.MSG_ID.stUserVerifyVerCmd,
                ordernum: 0
            },
            timestamp: moment().unix()
        },
        reserve: 0,
        version: version,
    }, { endian: "LE" });
    return buffer;
};

CppCmd.ParseVerifyVerCmd = function (buffer) {
    let result = UserVerifyVerCmd.decode(buffer, 0, { endian: "LE" });
    console.log(result);
    return result;
}
//====================  登陆消息  ====================
const IphoneLoginUserCmd = new struct('IphoneLoginUserCmd', [
    'NullUserCmd', struct.type(NullUserCmd, 1),
    'accid', struct.uint32(),
    'zoneid', struct.uint32(),
    'type', struct.uint8(),
    "loginTempID", struct.uint32(),
    'pstrAccount', struct.uint8(48),
    'pstrPassword', struct.char(16),
    'pstrOpenkey', struct.uint8(512),
    'channel', struct.uint32()
    // 'connecttype', struct.uint8(),
    // 'netType', struct.uint32(),
    // 'regchannel', struct.uint32(),
    // 'logchannel', struct.uint32(),
    // 'txtype', struct.uint16(),
    // 'mobiletype', struct.uint16(),
    // 'openkey', struct.char(1024),
    // 'pay_token', struct.char(1024),
    // 'appid', struct.char(48),
    // 'appkey', struct.char(48),
    // 'pf', struct.char(1024),
    // 'pfkey', struct.char(1024),
    // 'telecomOper', struct.char(64),
    // 'network', struct.char(64),
    // 'clientVersion', struct.char(64),
    // 'hardware', struct.char(64),
    // 'friendNum', struct.uint32()
]);

CppCmd.NewIphoneLoginUserCmd = function (acc, openkeyStr, channel, version) {
    var buffer = new Buffer(IphoneLoginUserCmd.size());
    let account = new Uint8Array(48);
    util.utf8.write(acc, account, 0);
    let openkey = new Uint8Array(512);
    util.utf8.write(openkeyStr, openkey, 0);
    // if (openkey == undefined) {
    //     openkey = '';
    // }
    IphoneLoginUserCmd.encode(buffer, 0, {
        NullUserCmd: {
            _null_cmd_cmd: {
                _id: Define.MSG_ID.stIphoneLoginUserCmd,
                ordernum: 0
            },
            timestamp: moment().unix()
        },
        accid: 0,
        zoneid: 0,
        type: 0,                    //0 uuid login 1 account login
        loginTempID: 0,
        pstrAccount: account,
        pstrPassword: '123456',
        pstrOpenkey: openkey,
        channel: channel
        // pstrAccount: window.OPEN_DATA.openid, //todo 屏蔽qzone
        // pstrPassword: '123456',
        // sdkOpenKey: window.OPEN_DATA.openkey,
        // pstrOpenkey:openkey,
        // connecttype: 0,
        // netType: 0,                 //0:3G或者2G,1:WIFI
        // regchannel: 0,              //注册渠道
        // logchannel: 0,              //登陆渠道
        // txtype: 0,                  //0:内部 1:qq登陆 2:微信登陆  
        // mobiletype: 0,              //0:ios  1:android
        // openkey: '',                //token
        // pay_token: '',              //
        // appid: '',
        // appkey: '',
        // pf: '',
        // pfkey: '',
        // telecomOper: '',
        // network: 'WIFI',
        // clientVersion: version,
        // hardware: '',
        // friendNum: 0
    }, { endian: "LE" });
    return buffer;
}

//====================  网关向用户发送游戏时间消息  ====================
const GameTimeTimerUserCmd = new struct('GameTimeTimerUserCmd', [
    'NullUserCmd', struct.type(NullUserCmd, 1),
    'lowTime', struct.uint32(),
    'highTime', struct.uint32()
]);

CppCmd.ParseGameTimeTimerUserCmd = function (buffer) {
    let result = GameTimeTimerUserCmd.decode(buffer, 0, { endian: "LE" });
    let time = new BigInteger(result.lowTime);
    time = time.add(new BigInteger(result.highTime).shiftLeft(32));
    result.qwGameTime = time.value;
    return result;
}
const UserGameTimeTimerUserCmd = new struct('UserGameTimeTimerUserCmd', [
    'NullUserCmd', struct.type(NullUserCmd, 1),
    'dwUserTempID', struct.uint32(),
    'lowTime', struct.uint32(),
    'highTime', struct.uint32()
]);
CppCmd.NewUserGameTimeTimerUserCmd = function (playTime) {
    var buffer = new Buffer(UserGameTimeTimerUserCmd.size());
    let playTimeInt = new BigInteger(playTime);
    UserGameTimeTimerUserCmd.encode(buffer, 0, {
        NullUserCmd: {
            _null_cmd_cmd: {
                _id: Define.MSG_ID.UserGameTimeTimerUserCmd,
                ordernum: 0
            },
            timestamp: moment().unix()
        },
        dwUserTempID: 0,
        lowTime: playTimeInt.and(0xFFFFFFFF).value,
        highTime: playTimeInt.shiftRight(32).value
    }, { endian: "LE" });
    return buffer;
};

//====================  需要创建角色  ====================
const NeedCreateRole = new struct('NeedCreateRole', [
    'NullUserCmd', struct.type(NullUserCmd, 1),
    'size', struct.uint32(),
    'recomCountry', struct.uint32(),
]);
CppCmd.ParseNeedCreateRole = function (buffer) {
    let result = NeedCreateRole.decode(buffer, 0, { endian: "LE" });
    return result;
}

//====================  创建创建角色消息  ====================
const CreateNewRoleUserCmd = new struct('CreateNewRoleUserCmd', [
    'NullUserCmd', struct.type(NullUserCmd, 1),
    'strRoleName', struct.char(33),
    'country', struct.uint32(),
    'face', struct.uint8()
]);
CppCmd.NewCreateNewRoleUserCmd = function (name, country, face) {
    var buffer = new Buffer(CreateNewRoleUserCmd.size());
    CreateNewRoleUserCmd.encode(buffer, 0, {
        NullUserCmd: {
            _null_cmd_cmd: {
                _id: Define.MSG_ID.stCreateNewRoleUserCmd,
                ordernum: 0
            },
            timestamp: moment().unix()
        },
        strRoleName: name,
        country: country,
        face: face
    }, { endian: "LE" });
    return buffer;
};

//====================  创建消息消息  ====================
const ServerChatUserCmd = new struct('CreateNewRoleUserCmd', [
    'NullUserCmd', struct.type(NullUserCmd, 1),
    'dwSysInfoType', struct.uint32(),
    'color', struct.uint8(),
    'noticeid', struct.uint32(),
    'info', struct.char(256)
]);
CppCmd.ParseServerChatUserCmd = function (buffer) {
    let result = ServerChatUserCmd.decode(buffer, 0, { endian: "LE" });
    return result;
};
// ====================== 创建聊天消息   =================
const ChannelChatUserCmd = new struct('ChannelChatUserCmd', [
    'NullUserCmd', struct.type(NullUserCmd, 1),
    'dwType', struct.uint32(),
    'dwFromIDLow', struct.uint32(),
    'dwFromIDHigh', struct.uint32(),
    'toIDLow', struct.uint32(),
    'toIDHigh', struct.uint32(),
    'dwChatTime', struct.uint32(),
    'face', struct.uint16(),
    'level', struct.uint16(),
    'country', struct.uint16(),
    'septName', struct.uint8(32),                    //
    'pstrName', struct.uint8(32),
    'toName', struct.uint8(32),
    'pstrChat', struct.uint8(256),
    'voiceID', struct.uint8(256),                    //
    'isvoice', struct.uint8(),
    'voicetime', struct.uint32(),
    'issysinfo', struct.uint8(),
    'autoVoice', struct.uint8(),
    'isCRandV', struct.uint8(),
    'sysInfoType', struct.uint16(),
    'flowerdeedtime', struct.uint32(),
    'over', struct.uint8(),
    'charHigh', struct.uint16(),
    'issept', struct.uint8(),
    'title', struct.uint32(),
]);
CppCmd.ParseChannelChatUserCmd = function (buffer) {
    let result = ChannelChatUserCmd.decode(buffer, 0, { endian: "LE" });
    // result.dwFromID = result.dwFromIDHigh << 32 | result.dwFromIDLow;
    // result.toID = result.toIDHigh << 32 | result.toIDLow;
    let fromid = new BigInteger(result.dwFromIDLow);
    fromid = fromid.add(new BigInteger(result.dwFromIDHigh).shiftLeft(32));
    result.dwFromID = fromid.value;
    let toid = new BigInteger(result.toIDLow);
    toid = toid.add(new BigInteger(result.toIDHigh).shiftLeft(32));
    result.toID = toid.value;
    result.septName = this.GetChars(util.utf8.read(result.septName, 0, 32));
    result.pstrName = this.GetChars(util.utf8.read(result.pstrName, 0, 32));
    result.toName = this.GetChars(util.utf8.read(result.toName, 0, 32));
    result.pstrChat = this.GetChars(util.utf8.read(result.pstrChat, 0, 256));
    result.voiceID = this.GetChars(util.utf8.read(result.voiceID, 0, 256));
    return result;
};
CppCmd.NewChannelChatUserCmd = function (t) {
    let dwFromID = new BigInteger(t.dwFromID);
    let dwToId = new BigInteger(t.toID);
    let septName = new Uint8Array(32);
    util.utf8.write(t.septName || '', septName, 0);
    let pstrName = new Uint8Array(32);
    util.utf8.write(t.pstrName || '', pstrName, 0);
    let toName = new Uint8Array(32);
    util.utf8.write(t.toName || '', toName, 0);
    let pstrChat = new Uint8Array(256);
    util.utf8.write(t.pstrChat || '', pstrChat, 0);
    let voiceID = new Uint8Array(256);
    util.utf8.write(t.voiceID || '', voiceID, 0);
    var buffer = new Buffer(ChannelChatUserCmd.size());
    ChannelChatUserCmd.encode(buffer, 0, {
        NullUserCmd: {
            _null_cmd_cmd: {
                _id: Define.MSG_ID.stChannelChatUserCmd,
                ordernum: 0
            },
            timestamp: moment().unix()
        },
        dwType: t.dwType,
        dwFromIDLow: dwFromID.and(0xFFFFFFFF).value,
        dwFromIDHigh: dwFromID.shiftRight(32).value,
        toIDLow: dwToId.and(0xFFFFFFFF).value,
        toIDHigh: dwToId.shiftRight(32).value,
        dwChatTime: t.dwChatTime,
        face: t.face,
        level: t.level,
        country: t.country,
        septName: septName,
        pstrName: pstrName,
        toName: toName,
        pstrChat: pstrChat,
        voiceID: voiceID,
        isvoice: t.isvoice,
        voicetime: t.voicetime,
        issysinfo: t.issysinfo,
        autoVoice: t.autoVoice,
        isCRandV: t.isCRandV,
        sysInfoType: t.sysInfoType,
        flowerdeedtime: t.flowerdeedtime,
        over: t.over,
        charHigh: t.charHigh,
        issept: t.issept,
        title: t.title,
    }, { endian: "LE" });
    return buffer;
};
// ====================== 登陆失败消息  =================
const ServerReturnLoginFailedCmd = new struct('ServerReturnLoginFailedCmd', [
    'NullUserCmd', struct.type(NullUserCmd, 1),
    'byReturnCode', struct.uint8(),
]);

CppCmd.ParseServerReturnLoginFailedCmd = function (buffer) {
    let result = ServerReturnLoginFailedCmd.decode(buffer, 0, { endian: "LE" });
    return result;
}
// ====================== 登陆失败消息  =================
const LoginKickReconnect = new struct('LoginKickReconnect', [
    'NullUserCmd', struct.type(NullUserCmd, 1),
    'connect', struct.uint8(),
]);

CppCmd.ParseLoginKickReconnect = function (buffer) {
    let result = LoginKickReconnect.decode(buffer, 0, { endian: "LE" });
    return result;
}

module.exports = CppCmd;