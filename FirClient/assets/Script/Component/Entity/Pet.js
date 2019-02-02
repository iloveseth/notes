const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        skeSpine: { default: null, type: sp.Skeleton },

        loaded: { default: false },
        state: { default: Game.Define.PET_STATE.IDLE },
        animaName: { default: '' },
        playTimes: { default: -1 },
        speed: { default: 1 },
    },
    onLoad: function () {
        this.skeSpine.setCompleteListener(this.onAnimaEnd.bind(this));
    },
    start: function () {
    },
    update: function (dt) {
    },
    onDestroy: function () {
        this.unuse();
    },
    // 放回池中了
    unuse: function () {
        this.skeSpine.skeletonData = null;
        this.loaded = false;
    },
    //从池中拿出来了
    reuse: function () {
    },
    onAnimaEnd: function (track) {
        // Game._.get(track, 'animation.name', '')
    },
    //====================  对外接口  ====================
    LoadPet: function (name) {
        if (this.loaded) {
            this.unuse();
        }
        Game.ResController.LoadSpine(name, function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.skeSpine.skeletonData = asset;
                this.loaded = true;
                this._playAnimation();
            }
        }.bind(this));
    },
    ChangeState: function (state) {
        if (this.state != state) {
            this.state = state;
            switch (state) {
                case Game.Define.PET_STATE.IDLE: {
                    this.playTimes = 0;
                    break;
                }
                case Game.Define.PET_STATE.ATTACK: {
                    this.playTimes = 0;
                    break;
                }
                default:
                    break;
            }
        }
        return this._playAnimation();
    },
    //====================  私有接口  ====================
    _playAnimation: function () {
        if (this.loaded) {
            this.skeSpine.timeScale = Game.Define.DEFAULT_SKE_SPEED;
            this.animaName = this.state;
            this.skeSpine.setAnimation(0, this.animaName, this.playTimes == 0);
        }
    },
});
