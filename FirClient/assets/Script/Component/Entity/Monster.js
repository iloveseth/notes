const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,
    properties: {
        skeBones: { default: null, type: sp.Skeleton },
        dieSprite: { default: null, type: cc.Sprite },
        tipNode: { default: null, type: cc.Node },
        label_name: { default: null, type: cc.Label_ },
        progressbar_hp: { default: null, type: cc.ProgressBar },

        loaded: { default: false },
        animaName: { default: '' },
        playTimes: { default: -1 },
        animaType: { default: 0 },
        speed: { default: 1 },
        state: { default: '' },
        direction: { default: Game.Define.DIRECTION_TYPE.EAST },
        attribute: { default: null },
        maxhp: { default: 0 },
    },
    onLoad: function () {
        this.ChangeState(Game.Define.MONSTER_ANIMA_STATE.IDLE);
        this.skeBones.setCompleteListener(this.onAnimaEnd.bind(this));
    },
    // 放回池中了
    unuse: function () {
        this.attribute = null;
        this.loaded = false;
        this.state = '';
        this.animaType = 0;
        this.animaName = '';
        this.skeBones.node.active = true;
        this.dieSprite.node.active = false;
        this.dieSprite.node.opacity = 255;
    },
    //从池中拿出来了
    reuse: function () {
    },
    onAnimaEnd: function (track) {
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.LEVEL_MONSTERANIMAEND, Game._.get(track, 'animation.name', ''), this.node.uuid);
    },

    //====================  对外接口  ====================
    SetAttribute: function (conf) {
        this.attribute = Game._.cloneDeep(conf);
        this.maxhp = Game._.get(this, 'attribute.hp');
        this.label_name.setText(Game._.get(this, 'attribute.name', ''));
    },
    LoadMonster: function (name, opts) {
        if (this.loaded) {
            this.unuse();
        }
        this.progressbar_hp.node.active = Game._.get(opts, 'showhp', false);
        this.progressbar_hp.progress = 1;
        Game.ResController.LoadSpine(Game.EntityController.GetMonsterDragonBonePath(name), function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载龙骨资源错误 ' + err);
            } else {
                this.skeBones.skeletonData = asset;
                this.loaded = true;
                this._playAnimation();

            }
        }.bind(this));
        Game.ResController.GetSpriteFrameByName(Game.EntityController.GetMonsterDiePath(name), function (err, res) {
            if (err) {
                console.error('[严重错误] 加载SpriteFrame错误 ' + err);
            } else {
                this.dieSprite.spriteFrame = res;
                this.dieSprite.node.color = cc.Color.BLACK;
            }
        }.bind(this));
    },
    ChangeState: function (state) {
        if (this.state != state) {
            this.state = state;
            let animaData = Game.EntityController.GetMonsterAnimaData(state);
            this.animaName = animaData.name;
            this.animaType = animaData.type;
            this.playTimes = animaData.times;
            if (this.loaded) {
                this._playAnimation();
            }
        }
    },
    ChangeSpeed: function (speed) {
        this.speed = speed;
    },
    ChangeDirection: function (dir) {
        if (this.direction != dir) {
            this.direction = dir;
            let scalex = this.direction > Game.Define.DIRECTION_TYPE.SOUTH ? -1 : 1;
            this.skeBones.node.scaleX = scalex;
            this.dieSprite.node.scaleX = scalex;
        }
    },
    GetMaxHp: function () {
        return this.maxhp;
    },
    GetCurHp: function () {
        return Game._.get(this, 'attribute.hp', 0);
    },
    ReduceHp: function (damage) {
        if (!Game._.has(this, 'attribute.hp')) {
            Game._.set(this, 'attribute.hp', 0);
        }
        this.attribute.hp -= damage;
        if (this.progressbar_hp.node.active) {
            this.progressbar_hp.progress = this.attribute.hp / this.GetMaxHp();
        }
        return this.attribute.hp;
    },
    IsDie: function () {
        return Game._.get(this, 'attribute.hp', 0) <= 0;
    },
    GetTipNodeWorldPos: function () {
        return this.tipNode.parent.convertToWorldSpaceAR(this.tipNode.position);
    },
    IsBoss: function () {
        return Game._.get(this, 'attribute.bossmov', '') != '';
    },
    //====================  私有接口  ====================
    _playAnimation: function () {
        switch (this.animaType) {
            case Game.Define.ANIMA_TYPE.TYPE_DRAGONBONES: {
                this.skeBones.timeScale = Game.Define.DEFAULT_SKE_SPEED * this.speed;
                this.skeBones.setAnimation(0, this.animaName, this.playTimes == 0);
                break;
            }
            case Game.Define.ANIMA_TYPE.TYPE_CC: {
                let name = '_run' + this.animaName;
                if (Game._.isFunction(Game._.get(this, name, null))) {
                    this[name]();
                }
                break;
            }
            default: {
                break;
            }
        }
    },
    _rundie: function () {
        this.skeBones.node.active = false;
        this.dieSprite.node.active = true;
        this.dieSprite.node.runAction(
            cc.sequence([
                cc.fadeOut(0.5),
                cc.callFunc(function () {
                    Game.NotificationController.Emit(Game.Define.EVENT_KEY.LEVEL_REMOVEMONSTER, this);
                }, this)
            ])
        );
    }
});
