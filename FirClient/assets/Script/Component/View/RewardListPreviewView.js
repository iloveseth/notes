const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        labels_title: { default: [], type: [cc.Label_] },
        label_desc: { default: null, type: cc.Label_ },
        tableview_rewardlist: { default: null, type: cc.tableView },
        node_leftarrow: { default: null, type: cc.Node },
        node_rightarrow: { default: null, type: cc.Node },
        index_page: { default: 1 },
        array_reward: { default: [] },
        str_desc: { default: '' },
    },
    onEnable: function () {
        let title = Game._.get(this, '_data.title', '');
        for (let i = 0; i < this.labels_title.length; i++) {
            let titleLabel = this.labels_title[i];
            titleLabel.setText(title);
        }
        this.str_desc = Game._.get(this, '_data.desc', '');
        this.array_reward = Game._.get(this, '_data.rewards', []);
        this.index_page = Game._.get(this, '_data.initPage', 1);
        let data = {
            target: this,
            array: this.array_reward,
        }
        this.tableview_rewardlist.addPageEvent(this.node, 'RewardListPreviewView', 'onPageChange');
        this.tableview_rewardlist.initTableView(this.array_reward.length, data, this.index_page);
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
    },
    onLeftClick: function () {
        this.tableview_rewardlist.scrollToLastPage();
    },
    onRightClick: function () {
        this.tableview_rewardlist.scrollToNextPage();
    },
    onPageChange: function (page, total) {
        this.index_page = page;
        this._updateScrollPage();
    },
    _updateScrollPage: function () {
        this.node_leftarrow.active = (this.index_page > 1);
        this.node_rightarrow.active = (this.index_page < this.array_reward.length);
        let desc = cc.js.formatStr(this.str_desc, this.index_page);
        this.label_desc.setText(desc);
    }
});
