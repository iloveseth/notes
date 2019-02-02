const Game = require('../../Game');

const MakeTab = {
    Tab_Smelt: 3,
    Tab_fame: 1,
}

cc.Class({
    extends: require('viewCell'),

    properties: {
        Effect_soul: { default: null, type: cc.Animation },
        Sprite_equip: { default: null, type: cc.Sprite_ },
        Label_equip: { default: null, type: cc.Label_ },
        Label_tips: { default: null, type: cc.Label_ },
        Label_soulLv: { default: null, type: cc.Label_ },
        Label_soulAdd: { default: null, type: cc.Label_ },
        Label_smelt: { default: null, type: cc.Label_ },
        Label_fame: { default: null, type: cc.Label_ },
        spr_red: { default: null, type: cc.Sprite_ },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        if (this._data){
            this.Effect_soul.node.active = Game.GlobalModel.forgeTab == MakeTab.Tab_fame;
            this.Sprite_equip.SetSprite(this._data.pic);
            this.Label_equip.setText(Game.UserModel.GetLevelDesc(this._data.level) + this._data.name);

            if(Game.GlobalModel.forgeTab == MakeTab.Tab_fame && this._data.kind == Game.GlobalModel.choosedSoulType){
                this.spr_red.node.active = true;
            }else{
                this.spr_red.node.active = false;
            };

            if (this._data.kind == Game.ItemDefine.ITEMTYPE.ItemType_Knife || this._data.kind == Game.ItemDefine.ITEMTYPE.ItemType_KnifeAssistant) {
                this.Label_tips.setText('只有大剑士可以装备');
                this.Label_tips.node.active = true;
            } else if (this._data.kind == Game.ItemDefine.ITEMTYPE.ItemType_Stick || this._data.kind == Game.ItemDefine.ITEMTYPE.ItemType_StickAssistant) {
                this.Label_tips.setText('只有魔导师可以装备');
                this.Label_tips.node.active = true;
            } else if (this._data.kind == Game.ItemDefine.ITEMTYPE.ItemType_Bow || this._data.kind == Game.ItemDefine.ITEMTYPE.ItemType_BowAssistant) {
                this.Label_tips.setText('只有炮娘可以装备');
                this.Label_tips.node.active = true;
            } else {
                this.Label_tips.node.active = false;
            }

            this.Label_soulLv.node.active = Game.GlobalModel.forgeTab == MakeTab.Tab_fame;
            this.Label_soulAdd.setText(Game.EquipModel.GetNGodEffectStr(Game.EquipModel.GetSoulTypeByType(this._data.kind), 1));
            this.Label_soulAdd.node.active = Game.GlobalModel.forgeTab == MakeTab.Tab_fame;

            let makeEquipConfig = Game.ConfigController.GetConfigById('makeequipcost_data', (this._data.level*10000) + (this._data.kind*10) + parseInt(Game.GlobalModel.forgeTab));
            if (makeEquipConfig) {
                if (Game.MainUserModel.GetSmelt() >= makeEquipConfig.smelt) {
                    this.Label_smelt.node.color = cc.color(60,182,65);
                } else {
                    this.Label_smelt.node.color = cc.color(231,110,110);
                    this.spr_red.node.active = false;
                }
                this.Label_smelt.setText(`打造值:${makeEquipConfig.smelt}`);

                if (Game.MainUserModel.GetFame() >= makeEquipConfig.fame) {
                    this.Label_fame.node.color = cc.color(60,182,65);
                } else {
                    this.Label_fame.node.color = cc.color(231,110,110);
                    this.spr_red.node.active = false;
                }
                this.Label_fame.setText(`荣誉值:${makeEquipConfig.fame}`);
                this.Label_fame.node.active = Game.GlobalModel.forgeTab == MakeTab.Tab_fame;
            }
        }
        this.node.active = this._data != null;
    },

    onClickMake() {
        Game.NetWorkController.SendProto('msg.MakeEquip', {
            type: parseInt(Game.GlobalModel.forgeTab),
            kind: this._data.kind,
            level: this._data.level
        });
    },

    onClickOpenDesc() {
        let equipConfig = Game._.find(Game.ConfigController.GetConfig('equipbase'), {
            'star': 1, 
            'type': this._data.kind,
            'level':  this._data.level,
            'color': 4
        })
        let mainPropertyStr = '';
        if (equipConfig) {
            if (equipConfig.attmin > 0) {
                mainPropertyStr = `攻击 +${equipConfig.attmin}--${equipConfig.attmax}`;
            } else if (equipConfig.defense > 0) {
                mainPropertyStr = `护甲 +${equipConfig.defense}`;
            } else if (equipConfig.hp > 0) {
                mainPropertyStr = `生命 +${equipConfig.hp}`;
            } else if (equipConfig.mp > 0) {
                mainPropertyStr = `魔法 +${equipConfig.mp}`;
            } else if (equipConfig.dodge > 0) {
                mainPropertyStr = `闪避 +${equipConfig.dodge}`;
            } else if (equipConfig.crit > 0) {
                mainPropertyStr = `暴击 +${equipConfig.crit}`;
            } else if (equipConfig.presis > 0) {
                mainPropertyStr = `物抗 +${equipConfig.presis}`;
            } else if (equipConfig.mresis > 0) {
                mainPropertyStr = `魔抗 +${equipConfig.mresis}`;
            }
        }
        

        let contents = [
            '<color=#FFFFFF>' + Game.UserModel.GetLevelDesc(this._data.level) + this._data.name + '</c>',
            '<color=#FFFFFF>' + Game.EquipModel.GetPosNameByType(this._data.kind) + '</c>',
            '<color=#FFFFFF>' + mainPropertyStr + '</c>',
            '<color=#FFFF00>' + '获得后随机产生' + '</c>' + '<color=#FF0000>' + '4' + '</c>' + '<color=#FFFF00>' + '条随机属性,星标装备更好' + '</c>',
            '<color=#C200FF>' + '可用于进阶生成更高品质装备' + '</c>',
        ]
        Game.TipPoolController.ShowItemInfo(contents, this.Sprite_equip.node.parent.convertToWorldSpaceAR(this.Sprite_equip.node.position), this._target.node);
    }
});