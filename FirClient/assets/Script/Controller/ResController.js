const _ = require('lodash');
const Tools = require('../Util/Tools');

var ResController = function () {
    this.spriteFrames = {};
    this.dragonBones = {};
    this.spines = {};
}

ResController.prototype.Init = function (cb) {
    Tools.InvokeCallback(cb);
};

ResController.prototype.GetSpriteFrameByName = function (name, cb) {
    if (name == '' || name == null || !_.isString(name)) {
        Tools.InvokeCallback(cb, null, null);
        return;
    }
    let spriteFrame = this.spriteFrames[name];
    if (spriteFrame == null) {
        cc.loader.loadRes(name, cc.SpriteFrame, function (err, res) {
            if (err) {
                Tools.InvokeCallback(cb, err);
            } else {
                this.PushSpriteFrames(name, res)
                Tools.InvokeCallback(cb, null, res);
            }
        }.bind(this));
    } else {
        Tools.InvokeCallback(cb, null, spriteFrame);
    }
};

ResController.prototype.DestoryAllChildren = function (node, exclud = '') {
    if (node && node.children) {
        let children = node.children;
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child && child.name != exclud) {
                child.destroy();
            }
        }
    }
}

ResController.prototype.SetSprite = function (sprite, path) {
    this.GetSpriteFrameByName(path, function (err, res) {
        if (err) {
            console.log('[严重错误] 奖励资源加载错误 ' + err);
        } else {
            sprite.spriteFrame = res;
        }
    });
}


ResController.prototype.LoadDragonBones = function (path, cb) {
    // if (this.dragonBones[path] != null) {
    //     this.GetDragonBones(this.dragonBones[path], cb);
    // } else {
    //     cc.loader.loadResDir(path, function (err, assets) {
    //         if (err || assets.length <= 0) {
    //             Tools.InvokeCallback(cb, '加载失败 ' + err);
    //             return;
    //         }
    //         this.dragonBones[path] = assets;
    //         this.GetDragonBones(assets, cb);
    //     }.bind(this));
    // }
}
ResController.prototype.GetDragonBones = function (assets, cb) {
    let _dragonAsset = null;
    let _dragonAtlasAsset = null;
    assets.forEach(asset => {
        if (asset instanceof dragonBones.DragonBonesAsset) {
            _dragonAsset = asset;
        }
        if (asset instanceof dragonBones.DragonBonesAtlasAsset) {
            _dragonAtlasAsset = asset;
        }
    });
    Tools.InvokeCallback(cb, null, { _dragonAsset: _dragonAsset, _dragonAtlasAsset: _dragonAtlasAsset });
}

ResController.prototype.LoadSpine = function (path, cb) {
    if (this.spines[path] != null) {
        Tools.InvokeCallback(cb, null, this.spines[path]);
    } else {
        cc.loader.loadResDir(path, sp.SkeletonData, function (err, assets) {
            if (err || assets.length <= 0) {
                Tools.InvokeCallback(cb, '加载失败 ' + err);
                return;
            }
            this.spines[path] = assets[0];
            Tools.InvokeCallback(cb, null, assets[0]);
        }.bind(this));
    }
}

ResController.prototype.PushSpriteFrames = function (name, res) {
    this.spriteFrames[name] = res;
}

module.exports = new ResController();