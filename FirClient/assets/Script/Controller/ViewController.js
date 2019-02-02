const _ = require('lodash');
const Tools = require('../Util/Tools');
const NotificationController = require('../Controller/NotificationController');
const Define = require("../Util/Define");

const thisLocalZOrder = {
    zOrder1: 1,                   //mainPage分页层级
    zOrder2: 2,                   //未显示的界面
    zOrder3: 3,                  //当前显示的界面
}

var ViewController = function () {
    this.InitData();
}

ViewController.prototype.InitData = function () {
    this._mianViewList = [];
    this._viewList = [];
    this._singItemPrefab = null;
    this._openingList = [];
}

ViewController.prototype.Init = function (cb) {
    cc.loader.loadRes('Prefab/Node/SingleItemNode', function (err, prefab) {
        if (err) {
            console.log('[严重错误] 奖励资源加载错误 ' + err);
        } else {
            this._singItemPrefab = prefab;
        }
        Tools.InvokeCallback(cb, err);
    }.bind(this));
}

ViewController.prototype.Reload = function (cb) {
    // cc.log("ViewController.prototype.Reload");
    this.CloseAllView(true);
    this.CloseAllMainView(true);
    this._openingList = [];
    Tools.InvokeCallback(cb, null);
}

/**
 * MainPage切换
 */
ViewController.prototype.OpenMainView = function (ui) {
    if (ui != null) {
        let _view = null;
        let _gameComponet = null;

        _.forEach(this._mianViewList, function (v) {
            v.pauseSystemEvents(true);
            v.active = false;
        });

        _view = _.find(this._mianViewList, function (v) {
            return v.uiname == ui;
        });

        if (_view) {
            _view.resumeSystemEvents(true);
            _view.active = true;
            _view.setSiblingIndex(_.get(_view, 'parent.childrenCount', 0));
        } else {
            cc.loader.loadRes(ui, function (err, prefab) {
                if (err) {
                    console.log('[严重错误] 奖励资源加载错误 ' + err);
                } else {
                    _view = cc.instantiate(prefab);
                    _view.uiname = ui;

                    _gameComponet = _view.getComponent('GameComponent');
                    if (_gameComponet) {
                        _gameComponet.initUrl(ui);      //初始化界面的路径
                    }

                    let canvas = cc.director.getScene().getChildByName('Canvas');   //设置界面显示位置
                    let parent = this.SeekChildByName(canvas, 'ViewLayer');
                    parent.addChild(_view);
                    this._mianViewList.push(_view);

                    _view.setLocalZOrder(thisLocalZOrder.zOrder1);
                }
            }.bind(this));
        }

        this.CloseAllView(true);
    }
};

/**
 * 打开界面
 */
ViewController.prototype.OpenView = function (ui, layer, data = null) {
    if (ui != null) {
        let _view = null;
        let _gameComponet = null;
        if (_.indexOf(this._openingList, ui) != -1) {
            return;
        }
        _view = _.find(this._viewList, function (v) {
            return v.uiname == ui;
        });

        if (_view) {
            _gameComponet = _view.getComponent('GameComponent');
            if (_gameComponet) {
                _gameComponet.setData(data);        //设置界面数据
            }

            _.forEach(this._viewList, function (v) {
                if (_view.active) {
                    let active = _view.uiname == v.uiname;
                    v.active = active;
                    if (!active) {
                        _view.pauseSystemEvents(true);
                    }
                }
                v.setLocalZOrder(_view.uiname == v.uiname ? thisLocalZOrder.zOrder3 : thisLocalZOrder.zOrder2);     //重新打开界面设置显示层级
            });
            _view.resumeSystemEvents(true);
            _view.active = true;
            _view.setSiblingIndex(_.get(_view, 'parent.childrenCount', 0));
        } else {
            let index = _.indexOf(this._openingList, ui);
            if (index == -1) {
                this._openingList.push(ui);
            }
            cc.loader.loadRes(ui, function (err, prefab) {
                let index = _.indexOf(this._openingList, ui);
                if (index != -1) {
                    this._openingList.splice(index, 1);
                }
                if (err) {
                    console.log('[严重错误] 奖励资源加载错误 ' + err);
                } else {
                    _view = cc.instantiate(prefab);
                    _view.uiname = ui;

                    _gameComponet = _view.getComponent('GameComponent');
                    if (_gameComponet) {
                        _gameComponet.initUrl(ui);      //初始化界面的路径
                        if (data != null) {
                            _gameComponet.setData(data);        //设置界面数据
                        }
                    }

                    let canvas = cc.director.getScene().getChildByName('Canvas');   //设置界面显示位置
                    let parent = this.SeekChildByName(canvas, layer);
                    parent.addChild(_view);
                    this._viewList.push(_view);

                    _view.setLocalZOrder(thisLocalZOrder.zOrder3);
                }
            }.bind(this));
        }
        // NotificationController.Emit(Define.EVENT_KEY.TARGET_GUIDE_END);
    }
}

/**
 * 关闭界面,参数true彻底删除界面,false隐藏界面(默认false)
 */
ViewController.prototype.CloseView = function (ui, clear = false) {
    if (ui != null) {
        let _view = _.find(this._viewList, function (v) {
            return v.uiname == ui;
        });

        if (_view) {
            if (clear) {
                _view.destroy();
                _.remove(this._viewList, function (v) {
                    return v.uiname == ui;
                });
            } else {
                _view.pauseSystemEvents(true);
                _view.active = false;
            }
        }
    }
}

/**
 * 关闭所有界面(只保留主城),参数true彻底删除界面,false隐藏界面(默认false)
 */
ViewController.prototype.CloseAllView = function (clear = false) {
    for (let i = this._viewList.length - 1; i >= 0; i--) {
        let _view = this._viewList[i];
        if (clear) {
            _view.destroy();
        } else {
            _view.pauseSystemEvents(true);
            _view.active = false;
        }
    }
    if (clear) {
        this._viewList = []
    }
}
ViewController.prototype.CloseAllMainView = function (clear = false) {
    // cc.log("ViewController.prototype.CloseAllMainView");
    for (let i = 0; i < this._mianViewList.length; i++) {
        let _view = this._mianViewList[i];
        if (clear) {
            _view.destroy();
        } else {
            _view.pauseSystemEvents(true);
            _view.active = false;
        }
    }
    if (clear) {
        this._mianViewList = [];
    }
}
/**
 * 获得View目标
 */
ViewController.prototype.GetViewByName = function (ui) {
    let _view = null;
    if (ui != null) {
        _view = _.find(this._viewList, function (v) {
            return v.uiname == ui;
        });
    }
    return _view;
}

/**
 * 传入ui路径跟name获得node
 */
ViewController.prototype.SeekChildByName = function (children, name) {
    //遍历方法
    let _find = function (node, name) {
        if (node != null) {
            if (node.children != null) {
                if (node.name == name) {
                    return node;
                }

                for (let i = 0; i < node.children.length; i++) {
                    let res = _find(node.children[i], name);
                    if (res != null) {
                        return res;
                    }
                }
            }
        }
        return null;
    }

    let _child = null;
    if (children) {
        _child = _find(children, name);
    }
    return _child;
}

ViewController.prototype.SeekChildByPath = function (parent, path) {
    //遍历方法
    let names = path.split('/');
    let ret = parent;
    for (let i = 0; i < names.length; i++) {
        if (ret == null) {
            break;
        }
        let name = names[i];
        ret = ret.getChildByName(name);
    }
    return ret;
}

ViewController.prototype.SeekChildByNameList = function (parent, nameList) {
    let ret = parent;
    for (let i = 0; i < nameList.length; i++) {
        if (ret == null) {
            break;
        }
        let name = nameList[i];
        ret = this.SeekChildByName(ret, name);
    }
    return ret;
}

//找到从canvas开始的层级路径
ViewController.prototype.GetPathByNode = function (node) {
    let path = [];
    while (node != null && node.name != 'Canvas') {
        path.push(_.get(node, 'name', ''));
        node = node.parent;
    }
    path = _.reverse(path);
    return _.join(path, '/');
}

/**
 *  是否已经打开传入的界面
 */
ViewController.prototype.IsOpen = function (ui) {
    let index = _.indexOf(this._openingList, ui);
    if (index != -1) {
        return true;
    }
    let isActive = false;
    if (ui != null) {
        let _view = _.find(this._viewList, function (v) {
            return v.uiname == ui;
        });
        if (_view) {
            isActive = _view.active;
        }
    }
    return isActive;
}

/**
 * 创建一个道具or装备格子 (记：不要重复创建)
 */
ViewController.prototype.CreateSingItem = function (t_Object, parent, scaleX = 1, scaleY = 1) {
    let _view = null;
    if (this._singItemPrefab) {
        _view = cc.instantiate(this._singItemPrefab);
        if (_view) {
            _view.uiname = "item_" + t_Object.thisid;

            let _componet = _view.getComponent('SingleItemNode');
            if (_componet) {
                _componet.updateView(t_Object);
            }
            _view.scaleX = scaleX;
            _view.scaleY = scaleY;
            _view.parent = parent;
        }
    }
    return _view;
}

/**
 * 切换场景清除数据
 */
ViewController.prototype.ClearViewData = function () {
    this.InitData();
    // module.exports = new ViewController();
}

module.exports = new ViewController();