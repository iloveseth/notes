const Game = require('../../Game');
const FootPrintGenInterval = 300;       //脚印生成间隔 ms
cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_back: { default: null, type: cc.Node },
        node_item: { default: null, type: cc.Node },

        character_me: { default: null },
        characters_npc: { default: {} },
        poss_targets: { default: {} },
        times_footprint: { default: {} },
        bools_isleft: { default: {} },
        speed_move: { default: 180 },
        map_path: { default: null }
    },
    start: function () {
    },
    update: function (dt) {
        this._updateCharactersPostion(dt);
        this._updateZIndex();
    },
    onEnable: function () {
        //把所有东西都移除掉
        this.onDisable();
        this.poss_targets = {};
        this.times_footprint = {};
        this.bools_isleft = {};
        //再这里要创建出我来
        this.map_path = new Game.MapPath(Game.GlobalModel.septMapData, 64, 64, new cc.Rect(0, 0, 25, 25));///
        this.character_me = Game.EntityController.GetCharacter();
        this.character_me.node.name = 'PlayerNode';
        this.character_me.node.position = cc.v2(-128, -128);
        this.node_item.addChild(this.character_me.node);
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
    },
    onDisable: function () {
        this.map_path = null;
        if (this.character_me != null) {
            Game.EntityController.ReleaseCharacter(this.character_me);
        }
        this.character_me = null;
        Game._.forIn(this.characters_npc, function (value, key) {
            Game.EntityController.ReleaseCharacter(value);
        });
        this.characters_npc = {};
        this.node_item.removeAllChildren();
    },
    //====================  对外函数  ====================
    GetCharacterMe: function () {
        return this.character_me;
    },
    /**
     *设置我的目标点 是我的节点坐标系下的位置 只有在有效范围内的才处理
     *
     * @param {String} uuid
     * @param {cc.Vec2} targetpos
     */
    SetTargetPos: function (uuid, targetpos, isWorldPostion = false) {
        let character = this._getCharacterByUUid(uuid);
        if (character == null) {
            return;
        }
        let nodePos = targetpos;
        if (isWorldPostion) {
            nodePos = this.node_item.convertToNodeSpaceAR(targetpos);
        }
        let targetIndex = this.map_path.GetIndexByPos(nodePos);
        if (!this.map_path.CanArrive(targetIndex)) {
            //都到不了 就return 吧
            return;
        }
        let originIndex = this.map_path.GetIndexByPos(character.node.position);
        if (originIndex.x == targetIndex.x && originIndex.y == targetIndex.y) {
            //原地踏步
            return;
        }
        let path = this.map_path.FindPathWithAStar(originIndex, targetIndex);
        if (path.length <= 0) {
            //都没路径 跑个毛哦
            return;
        }
        this.poss_targets[uuid] = path;
        character.ChangeState(Game.Define.CHARACTER_STATE.RUN);
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
            return null;
        }
        let playerNode = character.node;
        playerNode.name = 'NpcNode';
        playerNode.position = opts.pos || cc.v2(0, 0);
        this.node_item.addChild(playerNode);
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
    RandomSomePosition: function (count) {
        return this.map_path.RandomPosition(count);
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
            if (value.length > 0) {
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
                let nextIndex = value[0];
                let position = this.map_path.GetPosByIndex({ x: nextIndex[0], y: nextIndex[1] });
                let dis = cc.pDistance(character.node.position, position);
                if (dis <= 5) {
                    // 跑到下一个点了 要跑下一个点
                    value.shift();
                    if (value.length > 0) {
                        nextIndex = value[0];
                        position = this.map_path.GetPosByIndex({ x: nextIndex[0], y: nextIndex[1] });
                    } else {
                        //点都跑完了
                        character.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
                        removeTarget.push(key);
                        return true;
                    }
                }
                //上下判断 1上 0中 -1下
                let updown = Math.abs(position.y - character.node.y) <= 3 ? 0 : (position.y > character.node.y ? 1 : -1);
                //左右判断 1右 0中 -1做
                let leftright = Math.abs(position.x - character.node.x) <= 3 ? 0 : (position.x > character.node.x ? 1 : -1);
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
                    let pos = this.node_back.convertToNodeSpaceAR(character.GetFootPrintWorldPos());
                    Game.TipPoolController.ShowFootPrint(pos, Game.Define.DIRECTION_ROTATION[dir], isleft, this.node_back);
                    this.bools_isleft[key] = !isleft;
                }
            } else {
                removeTarget.push(key);
            }
        }.bind(this));
        for (let i = 0; i < removeTarget.length; i++) {
            delete this.poss_targets[removeTarget[i]];
        }
        this._updateMapPosition();
    },
    _updateZIndex: function () {
        for (let i = 0; i < this.node_item.childrenCount; i++) {
            let child = this.node_item.children[i];
            child.zIndex = -child.y;
        }
    },
    //====================  私有函数  ====================
    _getCharacterByUUid: function (uuid) {
        if (this.character_me.node.uuid == uuid) {
            return this.character_me;
        } else {
            return this.characters_npc[uuid];
        }
    }
});
