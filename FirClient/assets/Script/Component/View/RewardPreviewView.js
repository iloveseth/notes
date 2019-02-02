const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        sprite_title: { default: null, type: cc.Sprite_ },
        sprite_frame: { default: null, type: cc.Sprite_ },
        labels_title: { default: [], type: [cc.Label_] },
        label_desc: { default: null, type: cc.Label_ },
        prefab_packagecell: { default: null, type: cc.Prefab },
        node_rewardparent: { default: null, type: cc.Node },
    },
    onEnable: function () {
        let titleSpriteName = Game._.get(this, '_data.titleSpriteName', '');
        if (titleSpriteName != '') {
            this.sprite_title.SetSprite(titleSpriteName);
        }
        let frameSpriteName = Game._.get(this, '_data.frameSpriteName', '');
        if (frameSpriteName != '') {
            this.sprite_frame.SetSprite(frameSpriteName);
        }
        let title = Game._.get(this, '_data.title', '');
        for (let i = 0; i < this.labels_title.length; i++) {
            let titleLabel = this.labels_title[i];
            titleLabel.setText(title);
        }
        let desc = Game._.get(this, '_data.desc', '');
        this.label_desc.setText(desc);
        Game.ResController.DestoryAllChildren(this.node_rewardparent);
        let rewards = Game._.get(this, '_data.rewards', []);
        let data = {
            target: this,
            array: rewards,
        }
        for (let i = 0; i < rewards.length; i++) {
            let node = cc.instantiate(this.prefab_packagecell);
            let packagecell = node.getComponent('PackageCellNode');
            this.node_rewardparent.addChild(node);
            packagecell.init(i, data);
        }
    },
    //====================  点击回调  ====================
    itemClickedCallback: function (itemid, packagecell) {
        let config = Game.ConfigController.GetConfigById('object_data', itemid);
        let contents = [
            '<color=' + Game.ItemModel.GetItemLabelColorHex(config.color) + '>' + config.name + '</c>',
            '<color=#FFFFFF>' + config.info + '</c>'
        ];
        let pos = packagecell.node.parent.convertToWorldSpaceAR(packagecell.node.position);
        Game.TipPoolController.ShowItemInfo(contents, pos, this.node);
    }
});
