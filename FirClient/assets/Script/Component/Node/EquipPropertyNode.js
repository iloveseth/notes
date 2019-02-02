const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_tip: { default: null, type: cc.Label_ },
        Node_Stars: { default: null, type: cc.Node },
        Sprite_Stars: { default: [], type: [cc.Sprite_] },
        Animation_Stars: { default: [], type: [cc.Animation] },
        Label_score: { default: null, type: cc.Label_ },
        Label_starScore: { default: null, type: cc.Label_ },
        Node_mainProperty: { default: null, type: cc.Node },
        Label_mainProperty: { default: null, type: cc.Label_ },
        Sprite_mainProperty: { default: null, type: cc.Sprite_ },
        Label_power: { default: null, type: cc.Label_ },
        Label_brain: { default: null, type: cc.Label_ },
        Label_agility: { default: null, type: cc.Label_ },
        Label_patience: { default: null, type: cc.Label_ },
        Node_gemPropertys: { default: [], type: [cc.Node] },
        Label_gemPropertys: { default: [], type: [cc.Label_] },
        Label_gemPropertysAdd: { default: [], type: [cc.Label_] },
        Node_gem: { default: null, type: cc.Node },
        Sprite_gemsBg: { default: [], type: [cc.Sprite_] },
        Sprite_gems: { default: [], type: [cc.Sprite_] },
        Node_soulLv: { default: null, type: cc.Node },
        Label_soulLv: { default: null, type: cc.Label_ },
        Node_soulPropertyAdd: { default: null, type: cc.Node },
        Label_soulPropertyAdd: { default: null, type: cc.Label_ },
        Label_soulPropertyAddNext: { default: null, type: cc.Label_ },
        Node_starSuit: { default: null, type: cc.Node },
        Label_starSuit: { default: null, type: cc.Label_ },
        Node_starSuitAdd: { default: null, type: cc.Node },
        Label_starSuitAdd: { default: null, type: cc.Label_ },
        Label_starSuitAddNext: { default: null, type: cc.Label_ },
        Node_soulNext: { default: null, type: cc.Node },
        Label_soulNext: { default: null, type: cc.Label_ },
        Label_starSuitNext: { default: null, type: cc.Label_ },
    },

    onLoad() {
    },

    onEnable() {
    },

    onDisable() {
    },

    updateView(t_object) {
        this.itemInfo = t_object;
        this.equipInfo = t_object.equipdata;
        this.itemConfig = Game.ItemModel.GetItemConfig(this.itemInfo.baseid);

        //tips
        this.updateTips();

        //星级
        this.updateStar();

        //评分
        this.updateScore();

        //属性
        this.updateFourProp();

        //宝石
        this.updateGem();

        //灵魂属性
        this.updateSoul();
    },

    updateTips() {
        if (this.itemInfo.type == Game.ItemDefine.ITEMTYPE.ItemType_Knife || this.itemInfo.type == Game.ItemDefine.ITEMTYPE.ItemType_KnifeAssistant) {
            this.Label_tip.setText('只有大剑士可以装备');
            this.Label_tip.node.active = true;
        } else if (this.itemInfo.type == Game.ItemDefine.ITEMTYPE.ItemType_Stick || this.itemInfo.type == Game.ItemDefine.ITEMTYPE.ItemType_StickAssistant) {
            this.Label_tip.setText('只有魔导师可以装备');
            this.Label_tip.node.active = true;
        } else if (this.itemInfo.type == Game.ItemDefine.ITEMTYPE.ItemType_Bow || this.itemInfo.type == Game.ItemDefine.ITEMTYPE.ItemType_BowAssistant) {
            this.Label_tip.setText('只有炮娘可以装备');
            this.Label_tip.node.active = true;
        } else {
            this.Label_tip.node.active = false;
        }
    },

    updateStar() {
        this.maxStar = 15;

        let stronglevel = Game._.get(this, 'equipInfo.stronglevel', 0);
        this.Node_Stars.active = stronglevel > 0;

        if (stronglevel > 0) {
            let tIndex = Game.EquipModel.GetStarEffectIndex(stronglevel);
            let tWhole = Math.floor(stronglevel / 2);
            let tHasHalf = stronglevel%2 != 0;
            
            for (let i = 0; i < this.maxStar; i ++) {
                if (i < tWhole) {      //播放全星动画
                    this.Animation_Stars[i].play(`effect_start${tIndex}`);
                    this.Sprite_Stars[i].node.active = true;
                } else if (tHasHalf) {     //播放半星动画
                    tHasHalf = false;
                    this.Animation_Stars[i].play(`effect_bxstar${tIndex}`);
                    this.Sprite_Stars[i].node.active = true;
                } else {
                    this.Sprite_Stars[i].node.active = false;
                }
            }
        }
    },

    updateScore() {
        this.Label_score.setText(`初始评分：+${Game.EquipModel.GetBasicScore(this.equipInfo)}`);
        let stronglevel = Game._.get(this, 'equipInfo.stronglevel', 0);
        if (stronglevel > 0) {
            this.Label_starScore.setText(`升星评分：+${Game.EquipModel.GetStarScore(this.equipInfo)}`);
            this.Label_starScore.node.active = true;
        } else {
            this.Label_starScore.node.active = false;
        }
    },

    updateFourProp() {
        this.Label_power.node.active = false;
        this.Label_agility.node.active = false;
        this.Label_brain.node.active = false;
        this.Label_patience.node.active = false;
        for (let i = 0; i < this.equipInfo.four.length; i ++) {
            let fourProp = this.equipInfo.four[i];
            
            if (fourProp.type == Game.ItemDefine.FOURPROP.FourProp_Str) {
                this.Label_power.setText(`力量  +${fourProp.num}`);
                this.Label_power.node.active = true;
            } else if (fourProp.type == Game.ItemDefine.FOURPROP.FourProp_dex) {
                this.Label_agility.setText(`敏捷  +${fourProp.num}`);
                this.Label_agility.node.active = true;
            } else if (fourProp.type == Game.ItemDefine.FOURPROP.FourProp_men) {
                this.Label_brain.setText(`智力  +${fourProp.num}`);
                this.Label_brain.node.active = true;
            } else if (fourProp.type == Game.ItemDefine.FOURPROP.FourProp_dur) {
                this.Label_patience.setText(`耐力  +${fourProp.num}`);
                this.Label_patience.node.active = true;
            }
        }

        let tPersent = Game.EquipModel.GetIntensifyPersent(this.equipInfo);
        tPersent = tPersent/100 + 1;
        let mainPropertyStr = '';
        if (this.equipInfo.attmin > 0) {
            mainPropertyStr = `攻击 +${Math.round(this.equipInfo.attmin*tPersent)}--${Math.round(this.equipInfo.attmax)}`;
        } else if (this.equipInfo.defense > 0) {
            mainPropertyStr = `护甲 +${Math.round(this.equipInfo.defense*tPersent)}`;
        } else if (this.equipInfo.hp > 0) {
            mainPropertyStr = `生命 +${Math.round(this.equipInfo.hp*tPersent)}`;
        } else if (this.equipInfo.mp > 0) {
            mainPropertyStr = `魔法 +${Math.round(this.equipInfo.mp*tPersent)}`;
        } else if (this.equipInfo.dodge > 0) {
            mainPropertyStr = `闪避 +${Math.round(this.equipInfo.dodge*tPersent)}`;
        } else if (this.equipInfo.crit > 0) {
            mainPropertyStr = `暴击 +${Math.round(this.equipInfo.crit*tPersent)}`;
        } else if (this.equipInfo.presis > 0) {
            mainPropertyStr = `物抗 +${Math.round(this.equipInfo.presis*tPersent)}`;
        } else if (this.equipInfo.mresis > 0) {
            mainPropertyStr = `魔抗 +${Math.round(this.equipInfo.mresis*tPersent)}`;
        }

        if (Game.EquipModel.GetStrongthAddValue(this.itemInfo, false) > 0) {
            this.Label_mainProperty.setText(mainPropertyStr + "  +" + Game.EquipModel.GetStrongthAddValue(this.itemInfo, false));
        } else {
            this.Label_mainProperty.setText(mainPropertyStr);
        }
        this.Sprite_mainProperty.node.active = false;
    },

    updateGem() {
        this.maxGem = 4;
        let stones = Game._.get(this, 'equipInfo.stone', []);
        for (let i = 0; i < this.maxGem; i ++) {
            this.Sprite_gemsBg[i].node.active = i < this.equipInfo.hole;
            this.Sprite_gems[i].node.active = false;
            this.Node_gemPropertys[i].active = false;
        }
        for (let b = 0; b < stones.length; b ++) {
            let stoneInfo = stones[b];
            let itemConfig = Game.ItemModel.GetItemConfig(stoneInfo.objid);
            let holerise = Game.ConfigController.GetConfigById('holerise_data', stoneInfo.pos).rise/100;
            let tLevel = (stoneInfo.objid - 3)%15 + 1;
            this.Label_gemPropertys[b].setText(`${tLevel}级 ${itemConfig.name} +${stoneInfo.num}`);
            if (holerise > 1) {
                this.Label_gemPropertysAdd[b].setText(`+${Math.ceil(stoneInfo.num*(holerise-1))}`);
            } else {
                this.Label_gemPropertysAdd[b].setText('');
            }
            this.Node_gemPropertys[b].active = true;

            this.Sprite_gems[stoneInfo.pos - 1].SetSprite(itemConfig.pic);
            this.Sprite_gems[stoneInfo.pos - 1].node.active = true;
        }
        this.Node_gem.active = this.equipInfo.hole > 0;
    },

    updateSoul() {
        let soul = Game._.get(this, 'equipInfo.godnormal', null);
        let isSoul = false;
        if (soul) {
            isSoul = soul.level > 0;
        }
        let isUserEquip = true;
        let isMeEquip = Game.GlobalModel.GetIsLookMyEquip();
        if (isMeEquip) {
            isUserEquip = Game.EquipModel.IsUseEquip(this.itemInfo.packagetype);
        }
        this.Node_soulLv.active = isSoul;
        this.Node_soulPropertyAdd.active = isSoul;
        this.Label_soulPropertyAddNext.node.active = isSoul;
        this.Node_starSuit.active = isSoul && isUserEquip;
        this.Node_starSuitAdd.active = isSoul && isUserEquip;
        this.Label_starSuitAddNext.node.active = isSoul && isUserEquip;
        this.Node_soulNext.active = isSoul && isUserEquip;
        this.Label_starSuitNext.node.active = isSoul && isUserEquip;

        if (isSoul) {
            this.Label_soulLv.setText(`Lv.${soul.level}`);      //灵魂等级
            
            this.Label_soulPropertyAdd.setText(Game.EquipModel.GetNGodEffectStr(soul.type, soul.level));    //等级效果
            if (soul.level < 15) {
                let godTypeId = (soul.type - 1) * 15 + (soul.level + 1);
                if (godTypeId > 0) { 
                    let persent = Game.ConfigController.GetConfigById('godtype_data', godTypeId).num * 100;
                    this.Label_soulPropertyAddNext.setText(`(下一级${Math.round(persent)}%)`);
                }
                this.Label_soulPropertyAddNext.node.active = true;
            } else {
                this.Label_soulPropertyAddNext.node.active = false;
            }
            
            if (isUserEquip) {      //穿着身上的装备才显示下面属性
                let starSuit = 0;
                if (isMeEquip) {
                    starSuit = Game.UserModel.GetUserMainInfo().starindex;    //星套
                } else {
                    //观察对方的星套
                    starSuit = Game.UserModel.observe.suitlevel;
                }
                this.Label_starSuit.setText(`${starSuit*2}星`);

                let minLv = Math.min(starSuit, soul.level);    //星套加成
                this.Label_starSuitAdd.setText(Game.EquipModel.GetNGodEffectStr(soul.type, minLv));
                if (minLv < 15 && starSuit > 0) {
                    let starTypeId = (soul.type - 1) * 15 + (minLv + 1);
                    if (starTypeId > 0) {
                        let starPersent = Game.ConfigController.GetConfigById('godtype_data', starTypeId).num * 100;
                        if (starPersent) {
                            this.Label_starSuitAddNext.setText(`(下一级${Math.round(starPersent)}%)`);
                            this.Label_starSuitAddNext.node.active = true;
                        } else {
                            this.Label_starSuitAddNext.node.active = false;
                        }
                    } else {
                        this.Label_starSuitAddNext.node.active = false;
                    }
                } else {
                    this.Label_starSuitAddNext.node.active = false;
                }
                
                if (minLv >= 15) {
                    this.Node_soulNext.active = false;
                    this.Label_starSuitNext.node.active = false;
                } else {
                    if (starSuit >= soul.level) {       //下一级条件
                        this.Label_soulNext.setText(`灵魂:Lv.${soul.level + 1}  未达成`);
                        this.Label_soulNext.node.color = cc.color(165, 142, 127);
                    } else {
                        this.Label_soulNext.setText(`灵魂:Lv.${minLv + 1}  已达成`);
                        this.Label_soulNext.node.color = cc.color(233, 233, 233);
                    }

                    if (soul.level >= starSuit) {
                        this.Label_starSuitNext.setText(`全身星套${(starSuit+1)*2}星  未达成`);
                        this.Label_starSuitNext.node.color = cc.color(165, 142, 127);
                    } else {
                        this.Label_starSuitNext.setText(`全身星套${(minLv+1)*2}星  已达成`);
                        this.Label_starSuitNext.node.color = cc.color(233, 233, 233);
                    }
                }
            }
        }
    }
});
