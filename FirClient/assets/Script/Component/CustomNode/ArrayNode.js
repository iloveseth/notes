const _ = require('lodash');
let ArrayNode = cc.Class({
    extends: cc.viewCell,

    properties: {
        nodes_arr: { default: [], type: [cc.Node] },
        labels_arr: { default: [], type: [cc.Label_] },
    },
    //====================  这是分割线  ====================
    SetInfo: function (strs) {
        for (let i = 0; i < this.labels_arr.length; i++) {
            let label = this.labels_arr[i];
            if (label != null) {
                if (i >= strs.length) {
                    label.setText('');
                } else {
                    label.setText(strs[i]);
                }
            }
        }
    },
    SetLabelColor: function (colors) {
        for (let i = 0; i < this.labels_arr.length; i++) {
            let label = this.labels_arr[i];
            if (label != null) {
                if (i >= colors.length) {
                    return;
                } else {
                    label.node.color = colors[i];
                }
            }
        }
    },
    SetActive: function (activeNames) {
        for (let i = 0; i < this.nodes_arr.length; i++) {
            let node = this.nodes_arr[i];
            node.active = (_.indexOf(activeNames, node.name) != -1);
        }
    },
});
cc.ArrayNode = module.exports = ArrayNode;