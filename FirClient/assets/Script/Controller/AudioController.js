const _ = require('lodash');
const Define = require('../Util/Define');
const Tools = require('../Util/Tools');
const NotificationController = require('./NotificationController');

let AudioController = function () {
    this.audioClips = {};
    this.audio = null;
    this.effectIds = [];
    this.effectCallbacks = {}
    this.disableMusic = cc.sys.localStorage.getItem(Define.DATA_KEY.DISABLE_MUSIC) == 'true';
    this.disableEffect = cc.sys.localStorage.getItem(Define.DATA_KEY.DISABLE_EFFECT) == 'true';
    this.audioName = '';

    this.bgMusics = [];
    this.musicvolume = 1;//音乐音量
    this.effectsvolume = 1;//音效音量
    this.failList = [];
};

AudioController.prototype.Init = function (cb) {
    NotificationController.On(Define.EVENT_KEY.MUSIC_CHANGE, this, this.onChangeMusic);
    NotificationController.On(Define.EVENT_KEY.EFFECT_CHANGE, this, this.onChangeEffect.bind(this));
    // cc.loader.loadResDir('Audio/', cc.AudioClip, function (err, ress, urls) {
    //     if (err) {
    //         console.log('[严重错误] 奖励资源加载错误 ' + err);
    //     } else {
    //         for (let i = 0; i < ress.length; i++) {
    //             this.audioClips[urls[i]] = ress[i];
    //         }
    //     }
    //     Tools.InvokeCallback(cb, err);
    // }.bind(this));
    Tools.InvokeCallback(cb);
}

AudioController.prototype.PlayMusic = function (name, loop = true) {
    if (this.audioClips[name] == null) {
        if (_.indexOf(this.failList, name) != -1) {
            return false;
        }
        cc.loader.loadRes(name, cc.AudioClip, function (err, res) {
            if (err) {
                this.failList.push(name);
            } else {
                this.audioClips[name] = res;
                this.PlayMusic(name, loop);
            }
        }.bind(this));
        return true;
    }
    this.audioName = name;
    this.bgMusics.push(name);
    if (this.disableMusic) {
        return true;
    }
    let musiclen = this.bgMusics.length
    if (musiclen >= 2 && this.bgMusics[musiclen - 2] == this.bgMusics[musiclen - 1]) {
        return true;
    }
    this.PlayAudio(name, loop);
    return true;
}

AudioController.prototype.StopMusic = function () {
    if (this.bgMusics.length <= 0) {
        return;
    }
    let oldName = this.bgMusics[this.bgMusics.length - 1];
    this.bgMusics = _.take(this.bgMusics, this.bgMusics.length - 1);
    let newName = this.bgMusics[this.bgMusics.length - 1];
    this.audioName = newName;
    if (newName != null && newName != oldName && !this.disableMusic) {
        this.PlayAudio(newName, true);
    }
};
AudioController.prototype.PlayEffect = function (name, cb) {
    if (this.disableEffect) {
        return;
    }
    if (this.audioClips[name] == null) {
        if (_.indexOf(this.failList, name) != -1) {
            return false;
        }
        cc.loader.loadRes(name, cc.AudioClip, function (err, res) {
            if (err) {
                this.failList.push(name);
            } else {
                this.audioClips[name] = res;
                this.PlayEffect(name, cb);
            }
        }.bind(this));
        return true;
    }
    let id = cc.audioEngine.playEffect(this.audioClips[name], false);
    this.effectIds.push(id);
    this.effectCallbacks[id] = cb;
    cc.audioEngine.setFinishCallback(id, this._onEffectFinish.bind(this, id));
};

AudioController.prototype.PlayAudio = function (name, loop) {
    if (this.audioClips[name] == null) {
        return;
    }
    if (this.audio != null) {
        cc.audioEngine.stop(this.audio);
        this.audio = null;
    }
    this.audio = cc.audioEngine.playMusic(this.audioClips[name], loop);
    cc.audioEngine.setFinishCallback(this.audio, this._onMusicFinish.bind(this));
}

AudioController.prototype.StopAllEffect = function () {
    for (let i = 0; i < this.effectIds.length; i++) {
        cc.audioEngine.stop(this.effectIds[i]);
    }
    this.effectIds = [];
    for (let key in this.effectCallbacks) {
        let cb = this.effectCallbacks[key];
        Tools.InvokeCallback(cb);
    }
    this.effectCallbacks = {};
}

AudioController.prototype.SetMusicVolume = function (val) {
    this.musicvolume = val;
    cc.audioEngine.setMusicVolume(val);
}

AudioController.prototype.GetMusicVolume = function () {
    return this.musicvolume;
}

AudioController.prototype.SetEffectsVolume = function (val) {
    this.effectsvolume = val;
    cc.audioEngine.setEffectsVolume(val);
}

AudioController.prototype.GetEffectsVolume = function (val) {
    return this.effectsvolume;
}

AudioController.prototype.onChangeMusic = function (disable) {
    this.disableMusic = disable;
    let Game = require('../Game');
    if (disable == undefined) {
        disable = false;
    }
    Game.Platform.SetStorage(Define.DATA_KEY.DISABLE_MUSIC, disable.toString());
    if (disable) {
        if (this.audio != null) {
            cc.audioEngine.stop(this.audio);
            this.audio = null;
        }
    } else {
        if (this.audioName != null && this.audioName != '') {
            this.PlayAudio(this.audioName, true);
        }
    }
}
AudioController.prototype.onChangeEffect = function (disable) {
    this.disableEffect = disable;
    let Game = require('../Game');
    if (disable == undefined) {
        disable = false;
    }
    Game.Platform.SetStorage(Define.DATA_KEY.DISABLE_EFFECT, disable.toString());
    if (disable) {
        for (let i = 0; i < this.effectIds.length; i++) {
            cc.audioEngine.stop(this.effectIds[i]);
        }
        this.effectIds = [];
        for (let key in this.effectCallbacks) {
            let cb = this.effectCallbacks[key];
            Tools.InvokeCallback(cb);
        }
        this.effectCallbacks = {};
    }
}

AudioController.prototype._onMusicFinish = function () {
    this.audio = null;
    this.audioName = '';
}

AudioController.prototype._onEffectFinish = function (id) {
    _.remove(this.effectIds, function (n) {
        return n == id;
    });
    let cb = this.effectCallbacks[id];
    Tools.InvokeCallback(cb);
    delete this.effectCallbacks[id];
}

module.exports = new AudioController();