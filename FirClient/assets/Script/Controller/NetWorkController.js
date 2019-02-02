const _ = require('lodash');
const Buffer = require('buffer/').Buffer;

const Define = require('../Util/Define');
const Tools = require('../Util/Tools');
const NotificationController = require('./NotificationController');
const ProtoMsg = require('../Util/ProtoMsg');
const CppCmd = require('../Util/CppCmd');

var NetWorkController = function () {
    this.tempBuffer = null;
    this.sock = null;
    this.protolisteners = {};
    this.binarylisteners = {};

    this.connectedCallback = null;
    this.closeedCallback = null;
}

NetWorkController.prototype.Init = function (cb) {
    Tools.InvokeCallback(cb, null);
};

NetWorkController.prototype.Connect = function (url, cb) {
    this.Close();
    this.connectedCallback = cb;
    this.sock = new WebSocket(url);
    this.sock.onmessage = this.onMessage.bind(this);
    this.sock.onerror = this.onError.bind(this);
    this.sock.onopen = this.onOpen.bind(this);
    this.sock.binaryType = 'arraybuffer';
    this.sock.onclose = this.onClose.bind(this);
}

NetWorkController.prototype.SendBinary = function (buffer, name, cb) {
    if (name != '') {
        cc.log('发送 ' + name + ' 消息');
    }
    let length = buffer.length;
    let lengthBuf = new Buffer(4);
    lengthBuf.writeInt32LE(length, 0);
    let info = new Uint8Array(length + 4);
    info.set(lengthBuf, 0);
    info.set(buffer, 4);
    if (this.sock == null || this.sock.readyState != WebSocket.OPEN) {
        return;
    }
    this.sock.send(info.buffer);
    Tools.InvokeCallback(cb, null);
};

NetWorkController.prototype.SendProto = function (name, obj, cb) {
    if (this.sock == null || this.sock.readyState != WebSocket.OPEN) {
        return;
    }
    let proto = _.get(ProtoMsg, name, null);
    if (proto == null) {
        cc.log('没有消息体 : ' + proto);
        return;
    }
    let message = proto.fromObject(obj);
    let result = proto.verify(message);
    if (result != null) {
        cc.log('消息内容错误 : ' + result);
        return;
    }
    let msg = proto.encode(message).finish();
    let protolength = msg.length;
    let binarybuffer = CppCmd.NewProtoMessage(name, protolength);
    let info = new Uint8Array(binarybuffer.length + msg.length);
    info.set(binarybuffer, 0);
    info.set(msg, binarybuffer.length);
    cc.log('发送 ' + name + ' 消息');
    this.SendBinary(new Buffer(info), '', cb);
};

NetWorkController.prototype.Close = function (cb) {
    if (this.sock == null || this.sock.readyState != WebSocket.OPEN) {
        Tools.InvokeCallback(cb, '连接不可用');
        // return;
    }
    if (this.sock) {
        this.closeedCallback = cb;
        this.sock.close();
    }
}

NetWorkController.prototype.AddBinaryListener = function (id, caller, handler) {
    let listenerlist = this.binarylisteners[id];
    if (listenerlist == null) {
        listenerlist = [];
        this.binarylisteners[id] = listenerlist;
    }
    listenerlist.push({ caller, handler });
}

NetWorkController.prototype.RemoveBinaryListener = function (id, caller, handler) {
    let listenerlist = this.binarylisteners[id];
    if (listenerlist != null) {
        _.remove(listenerlist, function (h) {
            return h.caller == caller && h.handler == handler;
        })
    }
}

NetWorkController.prototype.IsConnect = function () {
    return !(this.sock == null || this.sock.readyState != WebSocket.OPEN)
}

NetWorkController.prototype.AddListener = function (name, caller, handler) {
    let listenerlist = this.protolisteners[name];
    if (listenerlist == null) {
        listenerlist = [];
        this.protolisteners[name] = listenerlist;
    }
    listenerlist.push({ caller, handler });
}

NetWorkController.prototype.RemoveListener = function (name, caller, handler) {
    let listenerlist = this.protolisteners[name];
    if (listenerlist != null) {
        _.remove(listenerlist, function (h) {
            return h.caller == caller && h.handler == handler;
        })
    }
}

//事件函数
NetWorkController.prototype.onMessage = function (obj) {
    this.handleArrayBuffer(obj.data);
}

NetWorkController.prototype.onClose = function () {
    cc.log(new Date() + '[网络消息] socket closed');
    this.sock = null;
    Tools.InvokeCallback(this.closeedCallback);
    let reason = (this.closeedCallback == null ? 1 : 2);
    this.closeedCallback = null;
    NotificationController.Emit(Define.EVENT_KEY.NET_CLOSE, reason); //主动断开
}

NetWorkController.prototype.onOpen = function (info) {
    cc.log(new Date() + '[网络消息] socket opend ' + JSON.stringify(info));
    this.tempBuffer = null;
    Tools.InvokeCallback(this.connectedCallback);
    this.connectedCallback = null;
    NotificationController.Emit(Define.EVENT_KEY.NET_OPEN);
}

NetWorkController.prototype.onError = function (err) {
    cc.log(new Date() + '[网络消息] socket error ' + err);
    this.connectedCallback = null;
    NotificationController.Emit(Define.EVENT_KEY.NET_CLOSE, 1); //被动断开
}

const ZIP_MASK = 0x40000000;
const PACKET_MASK = 64 * 1024 - 1;
NetWorkController.prototype.handleArrayBuffer = function (buffer) {
    //合包
    if (this.tempBuffer == null) {
        this.tempBuffer = new Buffer(buffer);
    } else {
        let newArray = new Uint8Array(this.tempBuffer.length + buffer.byteLength);
        newArray.set(this.tempBuffer, 0);
        newArray.set(new Uint8Array(buffer), this.tempBuffer.length);
        this.tempBuffer = new Buffer(newArray);
    }
    if (this.tempBuffer.length > 4) {
        let length = this.tempBuffer.readUInt32LE();
        if (length > ZIP_MASK) {
            length = length & PACKET_MASK;
        }
        cc.log(length);
        while (length > 0 && this.tempBuffer.length >= length + 4) {
            //长度足够 可以解包
            let databuffer = this.tempBuffer.subarray(4, length + 4);
            databuffer = new Buffer(databuffer);
            let last = this.tempBuffer.subarray(length + 4);
            this.tempBuffer = new Buffer(last);
            length = this.tempBuffer.length > 4 ? this.tempBuffer.readUInt32LE() : 0;

            let msgbase = CppCmd.ParseBaseMsg(databuffer);
            if (msgbase._id == Define.MSG_ID.stProtoMessage) {
                //proto消息
                let protomsg = CppCmd.ParseProtoMessage(databuffer);
                let name = protomsg.msgname;
                cc.log('收到proto名字为 ' + name + ' 的消息');
                //解析proto数据
                let proto = _.get(ProtoMsg, name, null);
                if (proto == null) {
                    cc.log('没有消息体 : ' + name);
                    return;
                }
                let protobuffer = databuffer.subarray(CppCmd.ProtoMessageSize());
                protobuffer = new Buffer(protobuffer);
                let message = proto.decode(protobuffer);
                // let obj = proto.toObject(message);
                // if (name != 'msg.GW2C_HeartBeat') {
                //     cc.log('收到 ' + name + ' 消息');
                // }
                //调用监听函数
                let listenerlist = this.protolisteners[name];
                if (listenerlist != null) {
                    for (let i = 0; i < listenerlist.length; i++) {
                        let handler = listenerlist[i];
                        handler.handler.call(handler.caller, 0, message);
                    }
                }
            } else {
                cc.log('收到 ' + msgbase._id + ' 号消息');
                let listenerlist = this.binarylisteners[msgbase._id];
                if (listenerlist != null) {
                    for (let i = 0; i < listenerlist.length; i++) {
                        let handler = listenerlist[i];
                        handler.handler.call(handler.caller, databuffer);
                    }
                }
            }
        }
    }
}

module.exports = new NetWorkController();
