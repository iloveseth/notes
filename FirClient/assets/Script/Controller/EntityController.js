const _ = require('lodash');
const async = require('async');
const ConfigController = require('./ConfigController');
const Define = require('../Util/Define');
const Tools = require('../Util/Tools');

let EntityController = function () {
    this.monsterPrefab = null;
    this.characterPrefab = null;
    this.fairyPrefeb = null;
    this.sinhalfPi = Math.sin(Math.PI / 2);
    this.characterPool = null;
    this.monsterPool = null;
    this.fairyPool = null;
};
/**
 * 
 * @param {Function} cb 
 */
EntityController.prototype.Init = function (cb) {
    async.waterfall([
        function (anext) {
            cc.loader.loadResDir('Prefab/Entity/', cc.Prefab, function (err, ress) {
                if (err) {
                    anext(err);
                } else {
                    for (let i = 0; i < ress.length; i++) {
                        let res = ress[i];
                        switch (res.name) {
                            case 'Monster':
                                this.monsterPrefab = res;
                                this.monsterPool = new cc.NodePool('Monster');
                                break;
                            case 'Character':
                                this.characterPrefab = res;
                                this.characterPool = new cc.NodePool('Character');
                                break;
                            case 'Pet':
                                this.fairyPrefeb = res;
                                this.fairyPool = new cc.NodePool('Pet');;
                                break;
                            default:
                                break;
                        }
                    }
                    anext();
                }
            }.bind(this));
        }.bind(this)
    ], function (err) {
        Tools.InvokeCallback(cb, err);
    })
};
//====================  角色  ====================
EntityController.prototype.GetCharacterSpinePath = function (name) {
    return 'Animation/Character/' + name + '/';
}
const AttackName = [
    'attack01',
    'attack02',
    'skill',
]
EntityController.prototype.RandomCharacterAttack = function () {
    let result = Tools.GetRandomInt(0, 100);
    if (result < 70) {
        return AttackName[0];
    } else if (result < 90) {
        return AttackName[1];
    } else {
        return AttackName[2];
    }
}
EntityController.prototype.IsCharacterAttackAnima = function (name) {
    return _.indexOf(AttackName, name) != -1;
}

EntityController.prototype.GetCharacter = function () {
    let node = this.characterPool.get();
    if (node == null) {
        node = cc.instantiate(this.characterPrefab);
    }
    if (node != null) {
        let character = node.getComponent('Character');
        return character;
    }
    return null;
}
EntityController.prototype.ReleaseCharacter = function (character) {
    if (character != null && character.node != null) {
        this.characterPool.put(character.node);
    }
}
//====================  怪物  ====================
EntityController.prototype.GetMonsterDragonBonePath = function (name) {
    return 'Animation/Monster/' + name + '/';
}
EntityController.prototype.GetMonsterDiePath = function (name) {
    return 'Image/Icon/Character/' + name;
}
EntityController.prototype.GetBossHeadPath = function (name) {
    return 'Image/Icon/Character/' + name;
}

EntityController.prototype.GetMonsterAnimaData = function (state) {
    switch (state) {
        case Define.MONSTER_ANIMA_STATE.IDLE:
            return { type: Define.ANIMA_TYPE.TYPE_DRAGONBONES, name: 'idle', times: 0 };
        case Define.MONSTER_ANIMA_STATE.ATTACK:
            return { type: Define.ANIMA_TYPE.TYPE_DRAGONBONES, name: 'attack', times: 0 };
        case Define.MONSTER_ANIMA_STATE.HURT:
            return { type: Define.ANIMA_TYPE.TYPE_DRAGONBONES, name: 'hurt', times: 1 };
        case Define.MONSTER_ANIMA_STATE.DIE:
            return { type: Define.ANIMA_TYPE.TYPE_CC, name: 'die', times: 1 };
        default:
            return { type: Define.ANIMA_TYPE.TTYPE_NONE, name: '', times: 0 }
    }
}


EntityController.prototype.CreateMonster = function (config, opts) {
    let monster = null;
    let npcmov = _.get(config, 'npcmov', '');
    if (npcmov == '') {
        npcmov = _.get(config, 'bossmov', '');
    }
    let node = this.monsterPool.get();
    if (node == null) {
        node = cc.instantiate(this.monsterPrefab);
    }
    let hp = _.get(opts, 'hp', null);
    if (hp != null) {
        _.set(config, 'hp', hp);
    }
    if (node != null) {
        monster = node.getComponent('Monster');
    }
    if (monster != null) {
        monster.SetAttribute(config);
        monster.LoadMonster(npcmov, opts);
        monster.ChangeState(Define.MONSTER_ANIMA_STATE.IDLE);
        monster.ChangeDirection(Define.DIRECTION_TYPE.WEST);
    }
    return monster;
}
EntityController.prototype.ReleaseMonster = function (monster) {
    if (monster != null && monster.node != null) {
        this.monsterPool.put(monster.node);
    }
}
//====================  精灵  ====================
EntityController.prototype.GetFairy = function () {
    let node = this.fairyPool.get();
    if (node == null) {
        node = cc.instantiate(this.fairyPrefeb);
    }
    if (node != null) {
        let pet = node.getComponent('Pet');
        return pet;
    }
    return null;
}
EntityController.prototype.ReleaseFairy = function (pet) {
    if (pet != null && pet.node != null) {
        this.fairyPool.put(pet.node);
    }
}
//====================  工具  ====================
/**
 *通过左右上下返回对应的方向
 *
 * @param {Number} updown       1上 0中 -1下
 * @param {Number} leftright    1右 0中 -1左
 */
EntityController.prototype.CalculateDirection = function (updown, leftright) {
    if (updown > 0) {
        if (leftright > 0) {
            return Define.DIRECTION_TYPE.NORTHEAST;
        } else if (leftright == 0) {
            return Define.DIRECTION_TYPE.NORTH;
        } else {
            return Define.DIRECTION_TYPE.NORTHWEST;
        }
    } else if (updown == 0) {
        if (leftright > 0) {
            return Define.DIRECTION_TYPE.EAST;
        } else if (leftright == 0) {
            return -1;
        } else {
            return Define.DIRECTION_TYPE.WEST;
        }
    } else {
        if (leftright > 0) {
            return Define.DIRECTION_TYPE.SOUTHEAST;
        } else if (leftright == 0) {
            return Define.DIRECTION_TYPE.SOUTH;
        } else {
            return Define.DIRECTION_TYPE.SOUTHWEST;
        }
    }
}
/**
 * 根据移动距离和方向算出两个方向上的分量
 *
 * @param {Number} distance
 * @param {Number} dir
 */
EntityController.prototype.CalculateDistanceByDir = function (distance, dir) {
    switch (dir) {
        case Define.DIRECTION_TYPE.NORTH: {
            return { x: 0, y: distance };
        }
        case Define.DIRECTION_TYPE.NORTHEAST: {
            return { x: distance * this.sinhalfPi, y: distance * this.sinhalfPi };
        }
        case Define.DIRECTION_TYPE.EAST: {
            return { x: distance, y: 0 };
        }
        case Define.DIRECTION_TYPE.SOUTHEAST: {
            return { x: distance * this.sinhalfPi, y: -distance * this.sinhalfPi };
        }
        case Define.DIRECTION_TYPE.SOUTH: {
            return { x: 0, y: -distance };
        }
        case Define.DIRECTION_TYPE.SOUTHWEST: {
            return { x: -distance * this.sinhalfPi, y: -distance * this.sinhalfPi };
        }
        case Define.DIRECTION_TYPE.WEST: {
            return { x: -distance, y: 0 };
        }
        case Define.DIRECTION_TYPE.NORTHWEST: {
            return { x: -distance * this.sinhalfPi, y: distance * this.sinhalfPi };
        }
        default: {
            return { x: distance, y: 0 };
        }
    }
}
const Occupations = [
    'nanzs', 'nvfs', 'nvgs'
]
EntityController.prototype.RandomOccupation = function () {
    return _.sample(Occupations);
}
EntityController.prototype.RandomPlayerName = function () {
    let xingDefines = ConfigController.GetConfig('xingdata');
    let mingDefines = ConfigController.GetConfig('mingdata');
    return _.sample(xingDefines).xingname + _.sample(mingDefines).mingname;
}
module.exports = new EntityController();