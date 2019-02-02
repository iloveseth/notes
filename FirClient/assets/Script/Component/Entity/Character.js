const Game = require('../../Game');
const PetRange = 30;                        //精灵在目标点附近多远的地方飘荡
const FootPrintDistance = 40;
const Character = cc.Class({
    extends: cc.GameComponent,
    properties: {
        skeSpine: { default: null, type: sp.Skeleton },
        footPrintNode: { default: null, type: cc.Node },
        tipNode: { default: null, type: cc.Node },
        petPosNodes: { default: [], type: [cc.Node] },
        petParent: { default: null, type: cc.Node },
        anima_levelup: { default: null, type: sp.Skeleton },
        petPosParent: { default: null, type: cc.Node },
        topNode: { default: null, type: cc.Node },
        bottomNode: { default: null, type: cc.Node },
        label_name: { default: null, type: cc.Label_ },
        label_sept: { default: null, type: cc.Label_ },
        label_title: { default: null, type: cc.Label_ },
        node_autofight: { default: null, type: cc.Node },
        node_autorun: { default: null, type: cc.Node },
        button_character: { default: null, type: cc.Button_ },

        pets: { default: [], type: [require('./Pet')] },
        loaded: { default: false },
        animaName: { default: '' },
        playTimes: { default: -1 },
        speed: { default: 1 },
        state: { default: '' },
        direction: { default: Game.Define.DIRECTION_TYPE.EAST },
        attribute: { default: null },
        maxhp: { default: 0 },
        petsTargetPosition: { default: [], type: [cc.Vec2] },
        fixedAnima: { default: null },
        clickFunc: { default: null }
    },
    onLoad: function () {
        this.skeSpine.setCompleteListener(this.onAnimaEnd.bind(this));
        this.skeSpine.setEventListener(this.onAnimaFrame.bind(this));
        this.anima_levelup.setCompleteListener(this.onLevelupAnimaEnd.bind(this));
    },
    update: function (dt) {
        if (this.loaded) {
            //所有点都根据骨骼定位
            let topbone = this.skeSpine.findBone('position_top');
            if (topbone != null) {
                this.topNode.position = this.topNode.parent.convertToNodeSpaceAR(this.skeSpine.node.convertToWorldSpaceAR(cc.p(topbone.worldX, topbone.worldY)));
            }
            let bottombone = this.skeSpine.findBone('position_bottom');
            if (bottombone != null) {
                this.bottomNode.position = this.bottomNode.parent.convertToNodeSpaceAR(this.skeSpine.node.convertToWorldSpaceAR(cc.p(bottombone.worldX, bottombone.worldY)));
            }
            //先跟随骨骼
            let petbone = this.skeSpine.findBone('dummy');
            if (petbone != null) {
                this.petPosParent.position = cc.p(petbone.worldX, petbone.worldY);
                //精灵跟随
                for (let i = 0; i < this.pets.length; i++) {
                    let pet = this.pets[i];
                    let targetNode = this.petPosNodes[i];
                    if (targetNode) {
                        let centerWorldPos = targetNode.parent.convertToWorldSpaceAR(targetNode.position);
                        let centerPos = this.petParent.convertToNodeSpaceAR(centerWorldPos);
                        let randomNewTarget = false;
                        if (pet.node.getNumberOfRunningActions() == 0) {
                            //可以随机一个位置飞了
                            randomNewTarget = true;
                        } else {
                            let targetPos = this.petsTargetPosition[i];
                            if (cc.pDistance(centerPos, targetPos) > PetRange) {
                                //目标飞了，重新计算目标点吧
                                pet.node.stopAllActions();
                                randomNewTarget = true;
                            }
                        }
                        if (randomNewTarget) {
                            //随机一个范围内的位置飞吧
                            let dis = Math.random() * PetRange;
                            let rotation = Math.random() * 2 * Math.PI;
                            let disVec = cc.v2(dis * Math.sin(rotation), dis * Math.cos(rotation));
                            let finalPos = cc.pAdd(centerPos, disVec);
                            this.petsTargetPosition[i] = finalPos;
                            pet.node.runAction(cc.moveTo(1, finalPos));
                        }
                    }
                }
            }
        }
    },
    onAnimaEnd: function (track) {
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.LEVEL_CHARACTERANIMAEND, Game._.get(track, 'animation.name', ''), this.node.uuid);
    },
    onAnimaFrame: function (track, event) {
        if (Game.EntityController.IsCharacterAttackAnima(Game._.get(track, 'animation.name', ''))) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.LEVEL_CHARACTERHITFRAME, this.node.uuid, Game._.get(event, 'data.name', ''));
        }
    },
    onLevelupAnimaEnd: function () {
        this.anima_levelup.node.active = false;
    },
    onCharacterClick: function () {
        Game.Tools.InvokeCallback(this.clickFunc, this.node.uuid);
    },
    // 放回池中了
    unuse: function () {
        this.skeSpine.skeletonData = null;
        this.loaded = false;
        this.attribute = {};
        this.animaName = '';
        this.fixedAnima = null;
        this.maxhp = 0;
        //清除精灵
        for (let i = 0; i < this.pets.length; i++) {
            let pet = this.pets[i];
            Game.EntityController.ReleaseFairy(pet);
        }
        this.pets = [];
        this.clickFunc = null;
    },
    //从池中拿出来了
    reuse: function () {
    },
    //====================  对外接口  ====================
    SetAttribute: function (info) {
        this.attribute = Game._.cloneDeep(info);
        this.maxhp = Game._.get(this, 'attribute.hp');
    },
    LoadCharacter: function (name, pets, opts) {
        if (this.loaded) {
            this.unuse();
        }
        this.SetDisplayOpts(opts);
        Game.ResController.LoadSpine(Game.EntityController.GetCharacterSpinePath(name), function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.skeSpine.skeletonData = asset;
                this.loaded = true;
                this._playAnimation();
            }
        }.bind(this));
        //创建精灵
        for (let i = 0; i < this.pets.length; i++) {
            let pet = this.pets[i];
            if (pet != null) {
                pet.node.removeFromParent(true)
            }
        }
        this.pets = [];
        this.petsTargetPosition = [];
        for (let i = 0; i < pets.length; i++) {
            let petInfo = pets[i];
            let define = Game.FairyModel.GetFairyBaseConfigById(Game._.get(petInfo, 'pettid', 0));
            if (define == null) {
                continue;
            }
            let pet = Game.EntityController.GetFairy();
            let node = pet.node;
            pet.LoadPet(define.fightmove);
            pet.ChangeState(Game.Define.PET_STATE.IDLE);
            this.petParent.addChild(node);
            this.pets.push(pet);
            this.petsTargetPosition.push(cc.p(0, 0));
        }
        this.clickFunc = Game._.get(opts, 'clickFunc', null);
        this.button_character.enabled = (this.clickFunc != null);
    },
    ChangeState: function (state, fixedAnima) {
        if (this.state != state) {
            this.state = state;
            this.skeSpine.clearTrack(0);
            this.fixedAnima = fixedAnima;
            let petState = Game.Define.PET_STATE.IDLE;
            switch (state) {
                case Game.Define.CHARACTER_STATE.IDLE: {
                    this.playTimes = 0;
                    break;
                }
                case Game.Define.CHARACTER_STATE.RUN: {
                    this.playTimes = 0;
                    break;
                }
                case Game.Define.CHARACTER_STATE.ATTACK: {
                    petState = Game.Define.PET_STATE.ATTACK;
                    this.playTimes = 1;
                    break;
                }
                case Game.Define.CHARACTER_STATE.SIT: {
                    this.playTimes = 0;
                    break;
                }
                default:
                    break;
            }
            for (let i = 0; i < this.pets.length; i++) {
                let pet = this.pets[i];
                pet.ChangeState(petState);
                if (petState == Game.Define.PET_STATE.ATTACK) {
                    pet.node.scaleX = this.direction > Game.Define.DIRECTION_TYPE.SOUTH ? -1 : 1;
                }
            }
        }
        return this._playAnimation();
    },
    ChangeSpeed: function (speed) {
        this.speed = speed;
    },
    ChangeDirection: function (dir) {
        if (this.direction != dir) {
            this.direction = dir;
            // if (this.state == Game.Define.CHARACTER_STATE.ATTACK) {
            for (let i = 0; i < this.pets.length; i++) {
                let pet = this.pets[i];
                pet.node.scaleX = this.direction > Game.Define.DIRECTION_TYPE.SOUTH ? -1 : 1;
            }
            // }
            this._playAnimation();
        }
    },
    GetFootPrintWorldPos: function () {
        let pos = this.footPrintNode.parent.convertToWorldSpaceAR(this.footPrintNode.position);
        return pos;//.sub(cc.p(result.x, result.y));
    },
    GetMaxHp: function () {
        return this.maxhp;
    },
    ReduceHp: function (damage) {
        if (!Game._.has(this, 'attribute.hp')) {
            Game._.set(this, 'attribute.hp', 0);
        }
        this.attribute.hp -= damage;
        return this.attribute.hp;
    },
    GetCurHp: function () {
        return Game._.get(this, 'attribute.hp', 0);
    },
    GetTipNodeWorldPos: function () {
        return this.tipNode.parent.convertToWorldSpaceAR(this.tipNode.position);
    },
    PlayerLevelup: function () {
        this.onLevelupAnimaEnd();
        this.anima_levelup.node.active = true;
        this.anima_levelup.setAnimation(0, 'animation', false);
    },
    /**
     * 为角色添加一个装饰物 记得要给名字，删除是按名字来删除的
     *
     * @param {cc.Node} node
     */
    AddDecorate: function (node) {
        this.tipNode.addChild(node);
    },
    /**
     * 删除一个角色上的装饰物
     *
     * @param {String} name
     */
    RemoveDecorate: function (name) {
        let nodes = [];
        for (let i = 0; i < this.tipNode.childrenCount; i++) {
            let node = this.tipNode.children[i];
            if (node.name == name) {
                nodes.push(node);
            }
        }
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            node.destroy();
        }
    },

    /**
     * 设置展示属性
     * @param {Object} opts
     */
    SetDisplayOpts: function (opts) {
        if (opts != null) {
            this.node_autofight.active = Game._.get(opts, 'showAutoFight', false);
            this.node_autorun.active = Game._.get(opts, 'showAutoRun', false);
            if (opts.charName != null) {
                this.label_name.setText(Game._.get(opts, 'charName', ''));
            }
            if (opts.nameColor != null) {
                this.label_name.setColor(Game._.get(opts, 'nameColor', cc.Color.WHITE));
            }
            if (opts.nameOutlineColor != null) {
                this.label_name.setOutlineColor(Game._.get(opts, 'nameOutlineColor', cc.Color.WHITE));
            }
            if (opts.septName != null) {
                this.label_sept.setText(Game._.get(opts, 'septName', ''));
            }
            if (opts.titleName != null) {
                this.label_title.setText(Game._.get(opts, 'titleName', ''));
            }
        }
    },
    //====================  私有接口  ====================
    _playAnimation: function () {
        if (this.loaded) {
            this.skeSpine.timeScale = Game.Define.DEFAULT_SKE_SPEED * this.speed;
            let scalex = this.direction > Game.Define.DIRECTION_TYPE.SOUTH ? -1 : 1;
            let dir = this.direction > Game.Define.DIRECTION_TYPE.SOUTH ? this.direction - 4 : this.direction;
            this.animaName = '';
            if (this.fixedAnima != null) {
                this.animaName = this.fixedAnima;
            } else {
                switch (this.state) {
                    case Game.Define.CHARACTER_STATE.IDLE:
                        this.animaName = this.state + dir;
                        break;
                    case Game.Define.CHARACTER_STATE.RUN:
                        this.animaName = this.state + dir;
                        break;
                    case Game.Define.CHARACTER_STATE.SIT:
                        this.animaName = this.state;
                        break;
                    case Game.Define.CHARACTER_STATE.ATTACK:
                        this.animaName = Game.EntityController.RandomCharacterAttack();
                        break;
                    default:
                        break;
                }
            }
            this.skeSpine.node.scaleX = scalex;
            if (this.animaName != '') {
                this.skeSpine.setAnimation(0, this.animaName, this.playTimes == 0);
                return this.animaName;
            }
        }
        return '';
    },
});
module.exports = Character;
