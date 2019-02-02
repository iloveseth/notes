const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Layout_Bg: { default: null, type: cc.Layout },
        Label_strong_suit: { default: null, type: cc.Label_ },
        Label_strong_title: { default: [], type: [cc.Label_] },
        Label_strong_content: { default: [], type: [cc.Label_] },
        Label_star_suit: { default: null, type: cc.Label_ },
        Label_star_title: { default: [], type: [cc.Label_] },
        Label_star_content: { default: [], type: [cc.Label_] },

        Node_newstrong: { default: null, type: cc.Node },
        Node_strong: { default: null, type: cc.Node },
        Node_newstrongNext: { default: null, type: cc.Node },
        Node_strongNext: { default: null, type: cc.Node },
        Label_strongnext_suit: { default: null, type: cc.Label_ },
        Label_strongnext_title: { default: [], type: [cc.Label_] },
        Label_strongnext_content: { default: [], type: [cc.Label_] },
        Label_starnext_suit: { default: null, type: cc.Label_ },
        Label_starnext_title: { default: [], type: [cc.Label_] },
        Label_starnext_content: { default: [], type: [cc.Label_] },
    },

    onEnable() {
        this.updateView();
    },

    updateView() {
        let totalEquipNum = 10;
        let starSuit = this._data.starSuit;
        let strongSuit = this._data.strongSuit;
        let index = 0;
        let strongX = 0;
        let strongY = 0;

        //强化
        let strongsuitConfig = null;
        if (strongSuit < 4) {
            strongsuitConfig = Game.ConfigController.GetConfigById('strongsuit_data', 4, 'level');
            this.Label_strong_suit.setText('10件4强装备获得:');
            this.Label_strong_suit.node.color = cc.color(206, 206, 206);
        } else {
            strongsuitConfig = Game.ConfigController.GetConfigById('strongsuit_data', strongSuit, 'level');
            if (strongSuit > 10000) {
                strongX = Math.floor(strongSuit / 10000);
                strongY = Math.floor(strongSuit % 10000);
                this.Label_strong_suit.setText(`${totalEquipNum - strongY}件${strongX}强和${strongY}件${strongX}强以上获得:`);
            } else {
                this.Label_strong_suit.setText(`${totalEquipNum}件${strongSuit}强装备获得:`);
            }
            this.Label_strong_suit.node.color = cc.color(102, 245, 130);
        }

        if (strongsuitConfig) {
            index = 0;
            if (strongsuitConfig.shengming > 0) {
                this.Label_strong_title[index].setText('生命');
                this.Label_strong_content[index].setText(`+${strongsuitConfig.shengming}`);
                this.Label_strong_title[index].node.active = true;
                index += 1;
            }
            if (strongsuitConfig.gongji > 0) {
                this.Label_strong_title[index].setText('伤害');
                this.Label_strong_content[index].setText(`+${strongsuitConfig.gongji}`);
                this.Label_strong_title[index].node.active = true;
                index += 1;
            }
            if (strongsuitConfig.wukang > 0) {
                this.Label_strong_title[index].setText('物抗');
                this.Label_strong_content[index].setText(`+${strongsuitConfig.wukang}`);
                this.Label_strong_title[index].node.active = true;
                index += 1;
            }
            if (strongsuitConfig.mokang > 0) {
                this.Label_strong_title[index].setText('魔抗');
                this.Label_strong_content[index].setText(`+${strongsuitConfig.mokang}`);
                this.Label_strong_title[index].node.active = true;
                index += 1;
            }
            if (strongsuitConfig.hujia > 0) {
                this.Label_strong_title[index].setText('护甲');
                this.Label_strong_content[index].setText(`+${strongsuitConfig.hujia}`);
                this.Label_strong_title[index].node.active = true;
                index += 1;
            }
            if (strongsuitConfig.mingzhong > 0) {
                this.Label_strong_title[index].setText('命中');
                this.Label_strong_content[index].setText(`+${strongsuitConfig.mingzhong}`);
                this.Label_strong_title[index].node.active = true;
                index += 1;
            }
            if (strongsuitConfig.shanbi > 0) {
                this.Label_strong_title[index].setText('闪避');
                this.Label_strong_content[index].setText(`+${strongsuitConfig.shanbi}`);
                this.Label_strong_title[index].node.active = true;
                index += 1;
            }
            if (strongsuitConfig.baoji > 0) {
                this.Label_strong_title[index].setText('暴击');
                this.Label_strong_content[index].setText(`+${strongsuitConfig.baoji}`);
                this.Label_strong_title[index].node.active = true;
                index += 1;
            }
            if (strongsuitConfig.renxing > 0) {
                this.Label_strong_title[index].setText('韧性');
                this.Label_strong_content[index].setText(`+${strongsuitConfig.renxing}`);
                this.Label_strong_title[index].node.active = true;
                index += 1;
            }
            if (strongsuitConfig.mofazhi > 0) {
                this.Label_strong_title[index].setText('魔法');
                this.Label_strong_content[index].setText(`+${strongsuitConfig.mofazhi}`);
                this.Label_strong_title[index].node.active = true;
                index += 1;
            }

            for (let i = 0; i < 10; i++) {
                if (i >= index) {
                    this.Label_strong_title[i].node.active = false;
                }
                if (strongSuit < 4) {
                    this.Label_strong_title[i].node.color = cc.color(206, 206, 206);
                    this.Label_strong_content[i].node.color = cc.color(206, 206, 206);
                } else {
                    this.Label_strong_title[i].node.color = cc.color(102, 245, 130);
                    this.Label_strong_content[i].node.color = cc.color(255, 255, 255);
                }
            }
        }


        //升星
        let suitbonusConfig = null;
        if (starSuit < 4) {
            suitbonusConfig = Game.ConfigController.GetConfigById('suitbonus_data', 4, 'star');
            this.Label_star_suit.setText('10件4星装备获得:');
            this.Label_star_suit.node.color = cc.color(206, 206, 206);
        } else {
            suitbonusConfig = Game.ConfigController.GetConfigById('suitbonus_data', starSuit, 'star');
            if (starSuit > 10000) {
                strongX = Math.floor(starSuit / 10000);
                strongY = Math.floor(starSuit % 10000);
                this.Label_star_suit.setText(`${totalEquipNum - strongY}件${strongX}星和${strongY}件${strongX}星以上获得:`);
            } else {
                this.Label_star_suit.setText(`${totalEquipNum}件${starSuit}星装备获得:`);
            }
            this.Label_star_suit.node.color = cc.color(102, 245, 130);
        }

        if (suitbonusConfig) {
            index = 0;
            if (suitbonusConfig.shengming > 0) {
                this.Label_star_title[index].setText('生命');
                this.Label_star_content[index].setText(`+${suitbonusConfig.shengming}`);
                this.Label_star_title[index].node.active = true;
                index += 1;
            }
            if (suitbonusConfig.gongji > 0) {
                this.Label_star_title[index].setText('伤害');
                this.Label_star_content[index].setText(`+${suitbonusConfig.gongji}`);
                this.Label_star_title[index].node.active = true;
                index += 1;
            }
            if (suitbonusConfig.wukang > 0) {
                this.Label_star_title[index].setText('物抗');
                this.Label_star_content[index].setText(`+${suitbonusConfig.wukang}`);
                this.Label_star_title[index].node.active = true;
                index += 1;
            }
            if (suitbonusConfig.mokang > 0) {
                this.Label_star_title[index].setText('魔抗');
                this.Label_star_content[index].setText(`+${suitbonusConfig.mokang}`);
                this.Label_star_title[index].node.active = true;
                index += 1;
            }
            if (suitbonusConfig.hujia > 0) {
                this.Label_star_title[index].setText('护甲');
                this.Label_star_content[index].setText(`+${suitbonusConfig.hujia}`);
                this.Label_star_title[index].node.active = true;
                index += 1;
            }
            if (suitbonusConfig.mingzhong > 0) {
                this.Label_star_title[index].setText('命中');
                this.Label_star_content[index].setText(`+${suitbonusConfig.mingzhong}`);
                this.Label_star_title[index].node.active = true;
                index += 1;
            }
            if (suitbonusConfig.shanbi > 0) {
                this.Label_star_title[index].setText('闪避');
                this.Label_star_content[index].setText(`+${suitbonusConfig.shanbi}`);
                this.Label_star_title[index].node.active = true;
                index += 1;
            }
            if (suitbonusConfig.baoji > 0) {
                this.Label_star_title[index].setText('暴击');
                this.Label_star_content[index].setText(`+${suitbonusConfig.baoji}`);
                this.Label_star_title[index].node.active = true;
                index += 1;
            }
            if (suitbonusConfig.renxing > 0) {
                this.Label_star_title[index].setText('韧性');
                this.Label_star_content[index].setText(`+${suitbonusConfig.renxing}`);
                this.Label_star_title[index].node.active = true;
                index += 1;
            }
            if (suitbonusConfig.mofazhi > 0) {
                this.Label_star_title[index].setText('魔法');
                this.Label_star_content[index].setText(`+${suitbonusConfig.mofazhi}`);
                this.Label_star_title[index].node.active = true;
                index += 1;
            }

            for (let i = 0; i < 10; i++) {
                if (i >= index) {
                    this.Label_star_title[i].node.active = false;
                }
                if (starSuit < 4) {
                    this.Label_star_title[i].node.color = cc.color(206, 206, 206);
                    this.Label_star_content[i].node.color = cc.color(206, 206, 206);
                } else {
                    this.Label_star_title[i].node.color = cc.color(102, 245, 130);
                    this.Label_star_content[i].node.color = cc.color(255, 255, 255);
                }
            }
        }

        //下一级属性强化
        if (strongSuit < 15 && strongSuit >= 4) {
            let strongsuitNextConfig = Game.ConfigController.GetConfigById('strongsuit_data', strongsuitConfig.nextlevel, 'level');
            if (strongsuitNextConfig.level > 10000) {
                strongX = Math.floor(strongsuitNextConfig.level / 10000);
                strongY = Math.floor(strongsuitNextConfig.level % 10000);
                this.Label_strongnext_suit.setText(`${totalEquipNum - strongY}件${strongX}强和${strongY}件${strongX}强以上获得:`);
            } else {
                this.Label_strongnext_suit.setText(`${totalEquipNum}件${strongsuitNextConfig.level}强装备获得:`);
            }
            this.Label_strongnext_suit.node.color = cc.color(206, 206, 206);

            if (strongsuitNextConfig) {
                let index = 0;
                if (strongsuitNextConfig.shengming > 0) {
                    this.Label_strongnext_title[index].setText('生命');
                    this.Label_strongnext_content[index].setText(`+${strongsuitNextConfig.shengming}`);
                    this.Label_strongnext_title[index].node.active = true;
                    index += 1;
                }
                if (strongsuitNextConfig.gongji > 0) {
                    this.Label_strongnext_title[index].setText('伤害');
                    this.Label_strongnext_content[index].setText(`+${strongsuitNextConfig.gongji}`);
                    this.Label_strongnext_title[index].node.active = true;
                    index += 1;
                }
                if (strongsuitNextConfig.wukang > 0) {
                    this.Label_strongnext_title[index].setText('物抗');
                    this.Label_strongnext_content[index].setText(`+${strongsuitNextConfig.wukang}`);
                    this.Label_strongnext_title[index].node.active = true;
                    index += 1;
                }
                if (strongsuitNextConfig.mokang > 0) {
                    this.Label_strongnext_title[index].setText('魔抗');
                    this.Label_strongnext_content[index].setText(`+${strongsuitNextConfig.mokang}`);
                    this.Label_strongnext_title[index].node.active = true;
                    index += 1;
                }
                if (strongsuitNextConfig.hujia > 0) {
                    this.Label_strongnext_title[index].setText('护甲');
                    this.Label_strongnext_content[index].setText(`+${strongsuitNextConfig.hujia}`);
                    this.Label_strongnext_title[index].node.active = true;
                    index += 1;
                }
                if (strongsuitNextConfig.mingzhong > 0) {
                    this.Label_strongnext_title[index].setText('命中');
                    this.Label_strongnext_content[index].setText(`+${strongsuitNextConfig.mingzhong}`);
                    this.Label_strongnext_title[index].node.active = true;
                    index += 1;
                }
                if (strongsuitNextConfig.shanbi > 0) {
                    this.Label_strongnext_title[index].setText('闪避');
                    this.Label_strongnext_content[index].setText(`+${strongsuitNextConfig.shanbi}`);
                    this.Label_strongnext_title[index].node.active = true;
                    index += 1;
                }
                if (strongsuitNextConfig.baoji > 0) {
                    this.Label_strongnext_title[index].setText('暴击');
                    this.Label_strongnext_content[index].setText(`+${strongsuitNextConfig.baoji}`);
                    this.Label_strongnext_title[index].node.active = true;
                    index += 1;
                }
                if (strongsuitNextConfig.renxing > 0) {
                    this.Label_strongnext_title[index].setText('韧性');
                    this.Label_strongnext_content[index].setText(`+${strongsuitNextConfig.renxing}`);
                    this.Label_strongnext_title[index].node.active = true;
                    index += 1;
                }
                if (strongsuitNextConfig.mofazhi > 0) {
                    this.Label_strongnext_title[index].setText('魔法');
                    this.Label_strongnext_content[index].setText(`+${strongsuitNextConfig.mofazhi}`);
                    this.Label_strongnext_title[index].node.active = true;
                    index += 1;
                }

                for (let i = 0; i < 10; i++) {
                    if (i >= index) {
                        this.Label_strongnext_title[i].node.active = false;
                    }
                    this.Label_strongnext_title[i].node.color = cc.color(206, 206, 206);
                    this.Label_strongnext_content[i].node.color = cc.color(206, 206, 206);
                }
            }
            this.Node_newstrongNext.active = true;
        } else {
            this.Node_newstrongNext.active = false;
        }


        //下一级属性升星
        if (starSuit < 15 && starSuit >= 4) {
            let suitbonusNextConfig = Game.ConfigController.GetConfigById('suitbonus_data', suitbonusConfig.nextstar, 'star');
            if (suitbonusNextConfig.star > 10000) {
                strongX = Math.floor(suitbonusNextConfig.star / 10000);
                strongY = Math.floor(suitbonusNextConfig.star % 10000);
                this.Label_starnext_suit.setText(`${totalEquipNum - strongY}件${strongX}星和${strongY}件${strongX}星以上获得:`);
            } else {
                this.Label_starnext_suit.setText(`${totalEquipNum}件${suitbonusNextConfig.star}星装备获得:`);
            }
            this.Label_starnext_suit.node.color = cc.color(206, 206, 206);

            if (suitbonusNextConfig) {
                index = 0;
                if (suitbonusNextConfig.shengming > 0) {
                    this.Label_starnext_title[index].setText('生命');
                    this.Label_starnext_content[index].setText(`+${suitbonusNextConfig.shengming}`);
                    this.Label_starnext_title[index].node.active = true;
                    index += 1;
                }
                if (suitbonusNextConfig.gongji > 0) {
                    this.Label_starnext_title[index].setText('伤害');
                    this.Label_starnext_content[index].setText(`+${suitbonusNextConfig.gongji}`);
                    this.Label_starnext_title[index].node.active = true;
                    index += 1;
                }
                if (suitbonusNextConfig.wukang > 0) {
                    this.Label_starnext_title[index].setText('物抗');
                    this.Label_starnext_content[index].setText(`+${suitbonusNextConfig.wukang}`);
                    this.Label_starnext_title[index].node.active = true;
                    index += 1;
                }
                if (suitbonusNextConfig.mokang > 0) {
                    this.Label_starnext_title[index].setText('魔抗');
                    this.Label_starnext_content[index].setText(`+${suitbonusNextConfig.mokang}`);
                    this.Label_starnext_title[index].node.active = true;
                    index += 1;
                }
                if (suitbonusNextConfig.hujia > 0) {
                    this.Label_starnext_title[index].setText('护甲');
                    this.Label_starnext_content[index].setText(`+${suitbonusNextConfig.hujia}`);
                    this.Label_starnext_title[index].node.active = true;
                    index += 1;
                }
                if (suitbonusNextConfig.mingzhong > 0) {
                    this.Label_starnext_title[index].setText('命中');
                    this.Label_starnext_content[index].setText(`+${suitbonusNextConfig.mingzhong}`);
                    this.Label_starnext_title[index].node.active = true;
                    index += 1;
                }
                if (suitbonusNextConfig.shanbi > 0) {
                    this.Label_starnext_title[index].setText('闪避');
                    this.Label_starnext_content[index].setText(`+${suitbonusNextConfig.shanbi}`);
                    this.Label_starnext_title[index].node.active = true;
                    index += 1;
                }
                if (suitbonusNextConfig.baoji > 0) {
                    this.Label_starnext_title[index].setText('暴击');
                    this.Label_starnext_content[index].setText(`+${suitbonusNextConfig.baoji}`);
                    this.Label_starnext_title[index].node.active = true;
                    index += 1;
                }
                if (suitbonusNextConfig.renxing > 0) {
                    this.Label_starnext_title[index].setText('韧性');
                    this.Label_starnext_content[index].setText(`+${suitbonusNextConfig.renxing}`);
                    this.Label_starnext_title[index].node.active = true;
                    index += 1;
                }
                if (suitbonusNextConfig.mofazhi > 0) {
                    this.Label_starnext_title[index].setText('魔法');
                    this.Label_starnext_content[index].setText(`+${suitbonusNextConfig.mofazhi}`);
                    this.Label_starnext_title[index].node.active = true;
                    index += 1;
                }

                for (let i = 0; i < 10; i++) {
                    if (i >= index) {
                        this.Label_starnext_title[i].node.active = false;
                    }
                    this.Label_starnext_title[i].node.color = cc.color(206, 206, 206);
                    this.Label_starnext_content[i].node.color = cc.color(206, 206, 206);
                }
            }
            this.Node_strongNext.active = true;
        } else {
            this.Node_strongNext.active = false;
        }
        this.Layout_Bg.updateLayout();
    },
});
