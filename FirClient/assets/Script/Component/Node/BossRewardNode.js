const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        nodes_reward: { default: [], type: [cc.Node] },
        labels_rewardcount: { default: [], type: [cc.Label_] },
        node_notice: { default: null, type: cc.Node },
        node_function: { default: null, type: cc.Node },
        label_levelcount: { default: null, type: cc.Label_ },
        label_levelname: { default: null, type: cc.Label_ },
        label_function: { default: null, type: cc.Label_ }
    },
    //====================  这是分割线  ====================
    SetInfo: function (mapid) {
        let boss = Game.LevelModel.GetMapBoss(mapid);
        let rewards = [
            Game._.get(boss, 'exp', 0),
            Game._.get(boss, 'money', 0),
            Game._.get(boss, 'wuxianum', 0),
            Game._.get(boss, 'goldnum', 0),
            Game._.get(boss, 'melting', 0)
        ];
        for (let i = 0; i < rewards.length; i++) {
            let num = rewards[i];
            let node = this.nodes_reward[i];
            if (node) {
                node.active = num > 0;
            }
            let label = this.labels_rewardcount[i];
            if (label) {
                label.setText(num);
            }
        }
        let noticeDefine = Game.ConfigController.GetConfigById('stagenotice_data', mapid, 'nowstage');
        if (noticeDefine != null) {
            this.node_notice.active = true;
            this.node_function.active = true;
            this.label_levelcount.setText(Game._.get(noticeDefine, 'stagenum', 0));
            this.label_levelname.setText(Game._.get(noticeDefine, 'targetstage', ''));
            this.label_function.setText(Game._.get(noticeDefine, 'gamefun', ''));
        } else {
            this.node_notice.active = false;
            this.node_function.active = false;
        }
    }
});
