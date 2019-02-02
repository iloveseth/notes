const Game = require('../../Game');
cc.Class({
    extends: cc.viewCell,

    properties: {
        cells: { default: [], type: [require('./PackageCellNode')] }
    },
    init(index, data) {
        if (index >= data.array.length) {
            this.node.active = false;
        }
        this.node.active = true;
        let arrayData = data.array[index];
        let childdata = {
            target: data.target,
            array: arrayData,
        }

        for (let i = 0; i < this.cells.length; i++) {
            let cell = this.cells[i];
            if (i < arrayData.length) {
                cell.node.active = true;
                cell.init(i, childdata);
            } else {
                cell.node.active = false;
            }
        }
    },
    //====================  这是分割线  ====================
});
