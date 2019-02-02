const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        sprite_npchead: { default: null, type: cc.Sprite_ },
        label_npcname: { default: null, type: cc.Label_ },
        progressbar_npchp: { default: null, type: cc.ProgressBar },
        label_npchp: { default: null, type: cc.Label_ },
        progressbar_npcmp: { default: null, type: cc.ProgressBar },
        label_npcmp: { default: null, type: cc.Label_ },
        node_npcdie: { default: null, type: cc.Node },
        sprite_rolehead: { default: null, type: cc.Sprite_ },
        label_rolename: { default: null, type: cc.Label_ },
        progressbar_rolehp: { default: null, type: cc.ProgressBar },
        label_rolehp: { default: null, type: cc.Label_ },
        progressbar_rolemp: { default: null, type: cc.ProgressBar },
        label_rolemp: { default: null, type: cc.Label_ },
        node_roledie: { default: null, type: cc.Node },
    },
    //====================  对外接口  ====================
    SetInfo: function (role, npc) {
        //npc
        this.sprite_npchead.SetSprite(Game._.get(npc, 'face', ''));
        this.label_npcname.setText(Game._.get(npc, 'name', ''));
        this.progressbar_npchp.progress = 1;
        this.label_npchp.setText(Game._.get(npc, 'hp', ''));
        this.progressbar_npcmp.progress = 1;
        this.label_npcmp.setText(Game._.get(npc, 'mp', ''));
        this.node_npcdie.active = false;
        //role
        this.sprite_rolehead.SetSprite(Game._.get(role, 'face', ''));
        this.label_rolename.setText(Game._.get(role, 'name', ''));
        this.progressbar_rolehp.progress = 1;
        this.label_rolehp.setText(Game._.get(role, 'hp', ''));
        this.progressbar_rolemp.progress = 1;
        this.label_rolemp.setText(Game._.get(role, 'mp', ''));
        this.node_roledie.active = false;
    },
    SetRoleHp: function (curhp, maxhp) {
        this.progressbar_rolehp.progress = curhp / maxhp;
        this.label_rolehp.setText(Math.max(0, curhp));
        this.node_roledie.active = (curhp <= 0);
    },
    SetNpcHp: function (curhp, maxhp) {
        this.progressbar_npchp.progress = curhp / maxhp;
        this.label_npchp.setText(Math.max(curhp, 0));
        this.node_npcdie.active = (curhp <= 0);
    }
});
