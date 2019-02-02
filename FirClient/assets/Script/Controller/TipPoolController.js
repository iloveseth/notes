const _ = require('lodash');
const async = require('async');

const Tools = require('../Util/Tools');
const Define = require('../Util/Define');
const NetWorkController = require('./NetWorkController');
const NotificationController = require('./NotificationController');
const ViewController = require('./ViewController');

let TipPoolController = function () {
    //====================  血量提示  ====================
    this.tipHpPrefab = null;
    this.tipHpPool = null;
    //====================  脚印  ====================
    this.leftFootPrint = null;
    this.rightFootPrint = null;
    this.footPrintPool = null;
    //====================  物品提示  ====================
    this.itemInfoPrefab = null;
    this.itemInfo = null;
    //====================  通用弹字提示  ====================
    this.tipNotifyPrefab = null;
    this.tipNotifyPool = null;
    //====================  挂机地图地上的宝物  ====================
    this.tipMapRewardItemPrefab = null;
    this.tipMapRewardItemPool = null;
    //====================  确认框  ====================
    this.tipConfirmPrefab = null;
    //====================  弹幕  ====================
    this.tipBarragePrefab = null;
    this.barragePool = null;
};
/**
 * 
 * @param {Function} cb 
 */
TipPoolController.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.sss', this, this.onServerChatUser);
    NotificationController.On(Define.EVENT_KEY.TIP_CONFIRM, this, this.onShowConfirm);
    async.waterfall([
        function (anext) {
            cc.loader.loadResDir('Prefab/Tip', cc.Prefab, function (err, ress, urls) {
                if (err) {
                    console.error('[严重错误] 加载Prefab错误 ' + err);
                    anext(err);
                } else {
                    for (let i = 0; i < ress.length; i++) {
                        let res = ress[i];
                        switch (res.name) {
                            case 'TipHp':
                                this.tipHpPrefab = res;
                                this.tipHpPool = new cc.NodePool('TipHpNode');
                                break;
                            case 'TipItemInfo':
                                this.itemInfoPrefab = res;
                                break;
                            case 'TipNotify':
                                this.tipNotifyPrefab = res;
                                this.tipNotifyPool = new cc.NodePool('TipNotifyNode');
                                break;
                            case 'TipMapRewardItem':
                                this.tipMapRewardItemPrefab = res;
                                this.tipMapRewardItemPool = new cc.NodePool('TipMapRewardItem');
                                break;
                            case 'TipConfirmView':
                                this.tipConfirmPrefab = res;
                                break;
                            case 'TipBarrage':
                                this.tipBarragePrefab = res;
                                this.barragePool = new cc.NodePool('TipMapRewardItem');
                                break;
                            case 'ShowTipNode':
                                let node = cc.instantiate(res);
                                cc.director.getScene().addChild(node);
                                break;
                            default:
                                break;
                        }
                    }
                    anext();
                }
            }.bind(this));
        }.bind(this),
        function (anext) {
            cc.loader.loadResDir('Image/Icon/Character/jiaoyin', cc.SpriteFrame, function (err, ress) {
                if (err) {
                    console.error('[严重错误] 加载SpriteFrames错误 ' + err);
                    anext(err);
                } else {
                    this.leftFootPrint = ress[0];
                    this.rightFootPrint = ress[1];
                    this.footPrintPool = new cc.NodePool();
                    anext();
                }
            }.bind(this));
        }.bind(this),
    ], function (err) {
        Tools.InvokeCallback(cb, err);
    });
};

//====================  血量提示  ====================
TipPoolController.prototype.ShowHpTip = function (info, pos, parent) {
    let tip = null;
    let node = this.tipHpPool.get();
    if (node != null) {
        tip = node.getComponent('TipHpNode');
    }
    if (tip == null) {
        tip = this.CreateNewHpTip();
    }
    parent.addChild(tip.node);
    tip.Play(info, pos, this.ShowHpEnd.bind(this));
}

TipPoolController.prototype.ShowHpEnd = function (tip) {
    this.tipHpPool.put(tip.node);
}

TipPoolController.prototype.ClearAllHpTips = function () {
    this.tipHpPool.clear();
}
TipPoolController.prototype.CreateNewHpTip = function () {
    let node = cc.instantiate(this.tipHpPrefab);
    let tip = node.getComponent('TipHpNode');
    return tip;
}
//====================  脚印  ====================
TipPoolController.prototype.ShowFootPrint = function (pos, rotation, isleft, parent) {
    let print = null;
    let node = this.footPrintPool.get();
    if (node != null) {
        print = node.getComponent(cc.Sprite);
    }
    if (print == null) {
        print = this.CreateFootPrint();
    }
    print.node.position = pos;
    print.node.rotation = rotation;
    print.spriteFrame = isleft ? this.leftFootPrint : this.rightFootPrint;
    parent.addChild(print.node);
    print.node.opacity = 255;
    print.node.runAction(cc.sequence([
        cc.fadeTo(0.5, 0),
        cc.callFunc(this.ShowFootPrintEnd.bind(this, print))
    ]));
}

TipPoolController.prototype.ShowFootPrintEnd = function (print) {
    this.footPrintPool.put(print.node);
}

TipPoolController.prototype.CreateFootPrint = function () {
    let node = new cc.Node("FootPrint");
    let print = node.addComponent(cc.Sprite);
    return print
}

//====================  物品信息  ====================
TipPoolController.prototype.ShowItemInfo = function (contents, pos, parent) {
    if (this.itemInfo == null || this.itemInfo.node == null) {
        let node = cc.instantiate(this.itemInfoPrefab);
        this.itemInfo = node.getComponent('TipItemInfoNode');
    }
    if (this.itemInfo.node.getParent() != null) {
        this.itemInfo.node.removeFromParent(false);
    }
    this.itemInfo.Show(contents, pos, parent);
}

//====================  通用弹字提示  ====================
TipPoolController.prototype.GetTipNotify = function () {
    let node = this.tipNotifyPool.get(this.TipNotifyPlayEnd.bind(this));
    if (node == null) {
        let tip = this.CreateNewTipNotify();
        node = tip.node;
    }
    return node;
}
TipPoolController.prototype.TipNotifyPlayEnd = function (tip) {
    this.tipNotifyPool.put(tip.node);
}
TipPoolController.prototype.CreateNewTipNotify = function () {
    let node = cc.instantiate(this.tipNotifyPrefab);
    let tip = node.getComponent('TipNotifyNode');
    if (_.isFunction(tip.reuse)) {
        tip.reuse(this.TipNotifyPlayEnd.bind(this));
    }
    return tip;
}
//====================  挂机地图地上的宝物  ====================
TipPoolController.prototype.GetTipMapRewardItem = function (id, cb) {
    let node = this.tipMapRewardItemPool.get(id, cb);
    let tip = null;
    if (node == null) {
        tip = this.CreateNewTipMapRewardItem();
    } else {
        tip = node.getComponent('TipMapRewardItem');
    }
    return tip;
}
TipPoolController.prototype.TipMapRewardEnd = function (tip) {
    this.tipMapRewardItemPool.put(_.get(tip, 'node'));
}
TipPoolController.prototype.CreateNewTipMapRewardItem = function (id, cb) {
    let node = cc.instantiate(this.tipMapRewardItemPrefab);
    let tip = node.getComponent('TipMapRewardItem');
    if (_.isFunction(tip.reuse)) {
        tip.reuse(id, cb);
    }
    return tip;
}
//====================  确认框  ====================
TipPoolController.prototype.GetConfirmViewPrefab = function () {
    return this.tipConfirmPrefab;
}
TipPoolController.prototype.onShowConfirm = function (title, content, buttons) {
    if (this.tipConfirmPrefab) {
        let node = cc.instantiate(this.tipConfirmPrefab);
        let parent = cc.director.getScene().getChildByName('Canvas');   //设置界面显示位置
        if (parent != null) {
            parent = ViewController.SeekChildByName(parent, 'MaskLayer');
            if (parent != null) {
                parent.addChild(node);
            }
        }
        let confirm = node.getComponent('TipConfirmView');
        confirm.Show(title, content, buttons);
    }
}
//====================  弹幕  ====================
TipPoolController.prototype.ShowBarrage = function (info, parent) {
    let tip = null;
    let node = this.barragePool.get();
    if (node != null) {
        tip = node.getComponent('TipBarrage');
    }
    if (tip == null) {
        tip = this.CreateNewTipBarrage();
    }
    tip.Play(info, parent, this.TipBarragePlayEnd.bind(this));
}
TipPoolController.prototype.TipBarragePlayEnd = function (tip) {
    this.barragePool.put(tip.node);
}
TipPoolController.prototype.CreateNewTipBarrage = function () {
    let node = cc.instantiate(this.tipBarragePrefab);
    let tip = node.getComponent('TipBarrage');
    return tip;
}

module.exports = new TipPoolController();