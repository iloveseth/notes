const Game = require('../../Game');
const FootPrintGenInterval = 300;       //脚印生成间隔 ms
cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_initarea: { default: null, type: cc.Node },
        node_npc: { default: null, type: cc.Node },
        node_me: { default: null, type: cc.Node },

        character_me: { default: null },
        characters_npc: { default: {} },
        poss_targets: { default: {} },
        times_footprint: { default: {} },
        bools_isleft: { default: {} },
        rect_active: { default: new cc.Rect() },
        cb_arrival: { default: null },
        speed_move: { default: 180 }
    },
    onLoad: function () {
        this.rect_active = this.node_initarea.getBoundingBox();
    },
    update: function (dt) {
        this._updateCharactersPostion(dt);
    },
    //====================  对外函数  ====================
    /**
     * 初始化脚本的函数 必调
     *
     * @param {cc.Rect} activeRect                  人物跑动的范围，每个系统可能不一样，但要保持不会跑到奇怪的地方，传null用默认值
     * @param {cc.Vec2} myInitPos                   人物初始的坐标，传null用(0,0)
     * @param {Function} arrivalCallBack            跑到目标点的回调，会有很多人在跑，会传uuid来供上层系统区别处理
     * @param {Number} speed                        跑动的速度
     */
    Init: function (activeRect, myInitPos, arrivalCallBack, speed) {
        if (activeRect != null) {
            this.rect_active = activeRect;
        }
        this.cb_arrival = arrivalCallBack;
        this.speed_move = speed;
        //把所有东西都移除掉
        this.onDestroy();
        this.poss_targets = {};
        this.times_footprint = {};
        this.bools_isleft = {};
        Game.ResController.DestoryAllChildren(this.node_initarea);
        //再这里要创建出我来
        this.character_me = Game.EntityController.GetCharacter();
        let playerNode = this.character_me.node;
        playerNode.name = 'PlayerNode';
        playerNode.position = myInitPos || cc.v2(0, 0);
        this.node_me.addChild(playerNode);
        this.character_me.LoadCharacter(
            Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetUserOccupation()),
            Game.FairyModel.GetFightFairys(),
            {
                showAutoFight: false,
                charName: '[' + Game.UserModel.GetCountryShortName(Game.UserModel.GetCountry()) + ']' + Game.UserModel.GetUserName(),
                nameColor: cc.hexToColor(Game.Define.MINE_NAMECOLOR),
                nameOutlineColor: cc.hexToColor(Game.Define.MINE_NAMEOUTLINE)
            }
        );
        this.character_me.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
        this.character_me.ChangeDirection(Game.Define.DIRECTION_TYPE.SOUTH);
        this.character_me.SetAttribute({ hp: Game.UserModel.GetUserBaseInfo().hp });
        this._updateMapPosition();
        return this.character_me;
    },
    onDestroy: function () {
        if (this.character_me != null) {
            Game.EntityController.ReleaseCharacter(this.character_me);
        }
        this.character_me = null;
        Game._.forIn(this.characters_npc, function (value, key) {
            Game.EntityController.ReleaseCharacter(value);
        });
        this.characters_npc = {};
    },
    /**
     *设置我的目标点 是我的节点坐标系下的位置 只有在有效范围内的才处理
     *
     * @param {String} uuid
     * @param {cc.Vec2} targetpos
     */
    SetTargetPos: function (uuid, targetpos) {
        if (this.rect_active.contains(targetpos)) {
            this.poss_targets[uuid] = targetpos;
            let character = null;
            if (uuid == this.character_me.node.uuid) {
                character = this.character_me;
            }
            if (character == null) {
                character = this.characters_npc[uuid];
            }
            if (character != null) {
                character.ChangeState(Game.Define.CHARACTER_STATE.RUN);
            }
        }
    },
    /**
     * 创建其他的角色
     *
     * @param {Object} opts         // pos: 初始位置 name spine文件夹名字['nanzs','nvfs','nvgs'] showAutoFight 是否显示自动打怪中 charName 显示的角色名字
     * @returns
     */
    CreateNpcCharacter: function (opts) {
        let character = Game.EntityController.GetCharacter();
        if (character == null) {
            return;
        }
        let playerNode = character.node;
        playerNode.name = 'NpcNode';
        playerNode.position = opts.pos || cc.v2(0, 0);
        this.node_npc.addChild(playerNode);
        character.LoadCharacter(opts.name || 'nanzs', [], opts);
        character.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
        character.ChangeDirection(Game.Define.DIRECTION_TYPE.SOUTH);
        character.SetAttribute({ hp: opts.hp || 0 });
        this.characters_npc[playerNode.uuid] = character;
        return character;
    },
    /**
     * 删除一个角色
     *
     * @param {String} uuid
     */
    DestroyCharacter: function (uuid) {
        //我不会被删除吧，要删除了再加 
        let character = this.characters_npc[uuid];
        if (character != null) {
            Game.EntityController.ReleaseCharacter(character);
            delete this.characters_npc[uuid];
        }
        delete this.poss_targets[uuid];
        delete this.times_footprint[uuid];
        delete this.bools_isleft[uuid];
    },
    /**
     * 为地图添加一个装饰物 记得要给名字，删除是按名字来删除的
     *
     * @param {cc.Node} node
     */
    AddMapDecorate: function (node) {
        this.node_initarea.addChild(node);
    },
    /**
     * 删除一个地图上的装饰物
     *
     * @param {String} name
     */
    RemoveMapDecorate: function (name) {
        let nodes = [];
        for (let i = 0; i < this.node_initarea.childrenCount; i++) {
            let node = this.node_initarea.children[i];
            if (node.name == name) {
                nodes.push(node);
            }
        }
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            node.destroy();
        }
    },
    RandomSomePosition: function (count) {
        let ret = [];
        let checkDis = function (pos) {
            for (let j = 0; j < ret.length; j++) {
                if (cc.pDistance(ret[j], pos) <= 200) {
                    return false;
                }
            }
            return true;
        }
        for (let i = 0; i < count; i++) {
            let pos = cc.p(0, 0);
            do {
                pos = cc.p(
                    this.rect_active.x + Game.Tools.GetRandomInt(0, this.rect_active.width),
                    this.rect_active.y + Game.Tools.GetRandomInt(0, this.rect_active.height),
                );
            } while (!checkDis(pos));
            ret.push(pos);
        }
        return ret;
    },
    //====================  更新函数  ====================
    _updateMapPosition: function () {
        if (this.character_me == null) {
            return;
        }
        //优先保证在屏幕的中间，如果在不了那就只好让人物靠边了
        //看看世界坐标中的中心点在我的画布的哪里
        let viewSize = cc.view.getVisibleSize();
        let worldCenterPos = cc.p(viewSize.width / 2, viewSize.height / 2);
        //如果不约束我的节点会在哪
        let thisWorldPos = worldCenterPos.add(cc.p(0, 0).sub(this.character_me.node.position));
        //先算算x轴要不要约束
        if (thisWorldPos.x >= this.node.width / 2) {
            thisWorldPos.x = this.node.width / 2;
        }
        if (thisWorldPos.x <= (viewSize.width - this.node.width / 2)) {
            thisWorldPos.x = (viewSize.width - this.node.width / 2);
        }
        //算算y轴
        if (thisWorldPos.y >= this.node.height / 2) {
            thisWorldPos.y = this.node.height / 2;
        }
        if (thisWorldPos.y <= viewSize.height - this.node.height / 2) {
            thisWorldPos.y = viewSize.height - this.node.height / 2;
        }
        this.node.position = this.node.parent.convertToNodeSpaceAR(thisWorldPos);
    },
    _updateCharactersPostion: function (dt) {
        let removeTarget = [];
        let curTimeMs = Game.TimeController.GetCurTimeMs();
        Game._.forIn(this.poss_targets, function (value, key) {
            if (value != null) {
                //跑吧
                let character = null;
                if (key == this.character_me.node.uuid) {
                    character = this.character_me;
                }
                if (character == null) {
                    character = this.characters_npc[key];
                }
                if (character == null) {
                    // 角色都没了 跑个屁屁
                    removeTarget.push(key);
                    return true;
                }
                let dis = cc.pDistance(character.node.position, value);
                if (dis <= 5) {
                    // 跑到了
                    character.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
                    Game.Tools.InvokeCallback(this.cb_arrival, key);
                    removeTarget.push(key);
                    return true;
                }
                //上下判断 1上 0中 -1下
                let updown = Math.abs(value.y - character.node.y) <= 3 ? 0 : (value.y > character.node.y ? 1 : -1);
                //左右判断 1右 0中 -1做
                let leftright = Math.abs(value.x - character.node.x) <= 3 ? 0 : (value.x > character.node.x ? 1 : -1);
                let dir = Game.EntityController.CalculateDirection(updown, leftright);
                character.ChangeDirection(dir);
                let distance = Game.Define.RunSpeed * dt;
                let result = Game.EntityController.CalculateDistanceByDir(distance, dir);
                character.node.x += result.x;
                character.node.y += result.y;
                // if (key == this.character_me.node.uuid) {
                //     this._updateMapPosition();
                // }
                //生成脚印啦
                let preTime = this.times_footprint[key] || 0;
                if (curTimeMs - preTime >= FootPrintGenInterval) {
                    this.times_footprint[key] = curTimeMs;
                    let isleft = this.bools_isleft[key] || false;
                    let pos = this.node_initarea.convertToNodeSpaceAR(character.GetFootPrintWorldPos());
                    Game.TipPoolController.ShowFootPrint(pos, Game.Define.DIRECTION_ROTATION[dir], isleft, this.node_initarea);
                    this.bools_isleft[key] = !isleft;
                }
            }
        }.bind(this));
        for (let i = 0; i < removeTarget.length; i++) {
            delete this.poss_targets[removeTarget[i]];
        }
        this._updateMapPosition();
    }
});
