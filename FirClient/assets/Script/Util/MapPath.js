const _ = require('lodash');
const PF = require('pathfinding');

const Tools = require('./Tools');
/**
 * 创建一个地图路径类
 *
 * @param {Array} matrix        地图上能否行走的数据
 * @param {Number} row          行数
 * @param {Number} col          列数
 * @param {cc.Rect} gridsize    每个格子的大小
 */
let MapPath = function (matrix, row, col, gridsize) {
    this.matrix = matrix;
    this.grids = new PF.Grid(matrix);
    this.row = row;
    this.col = col;
    this.xList = [];
    this.yList = [];
    this.gridSize = gridsize;
    for (let i = 0; i < row; i++) {
        this.xList.push(Tools.CalculateArrange(row, i, gridsize.width));
    }
    for (let i = 0; i < col; i++) {
        this.yList.push(-Tools.CalculateArrange(col, i, gridsize.width));
    }
    this.finderAStar = new PF.AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true,
    });
    this.reachableIndex = [];
    let tempArray = [];
    for (let i = 0; i < matrix.length; i++) {
        let ylist = matrix[i];
        for (let j = 0; j < ylist.length; j++) {
            if (ylist[j] == 0) {
                //可到达
                tempArray.push({ x: j, y: i });
            }
        }
    }
    //每隔8个取一个
    let count = Math.floor(tempArray.length / 8);
    for (let i = 0; i < count; i++) {
        let index = i * 8;
        if (index >= tempArray.length) {
            break;
        }
        this.reachableIndex.push(tempArray[index]);
    }
    this.reachableIndex = _.shuffle(this.reachableIndex);
}

/**
 * 根据坐标点获得对应的Index值
 *
 * @param {cc.Vec2} pos         坐标点
 * @returns                     我在地图中是索引点
 */
MapPath.prototype.GetIndexByPos = function (pos) {
    let x = Tools.GetNearestIndex(this.xList, pos.x, this.gridSize.width);
    let y = Tools.GetNearestIndex(this.yList, pos.y, this.gridSize.height);
    return { x, y };
}

/**
 * 根据index获得坐标点
 *
 * @param {cc.Vec2} index       索引点
 * @returns                     坐标点
 */
MapPath.prototype.GetPosByIndex = function (index) {
    return cc.p(this.xList[index.x], this.yList[index.y]);
}

/**
 * 判断一个位置是否可以到达
 *
 * @param {cc.Vec2} index
 */
MapPath.prototype.CanArrive = function (index) {
    let yList = this.matrix[index.y];
    if (yList == null) {
        return false;
    }
    return yList[index.x] == 0;
}

/**
 * 寻路吧
 *
 * @param {cc.Vec2} originIndex 起点
 * @param {cc.Vec2} targetIndex 终点
 * @returns
 */
MapPath.prototype.FindPathWithAStar = function (originIndex, targetIndex) {
    let path = [];
    if (!this.CanArrive(targetIndex)) {
        //不可到达
        return path;
    }
    path = this.finderAStar.findPath(originIndex.x, originIndex.y, targetIndex.x, targetIndex.y, this.grids.clone());
    // path = PF.Util.compressPath(path);
    if (path.length > 0) {
        path.shift();
    }
    return path;
}
/**
 * 随机几个可行走的点
 *
 * @param {Number} count
 */
MapPath.prototype.RandomPosition = function (count) {
    let ret = [];
    for (let i = 0; i < count; i++) {
        let index = _.sample(this.reachableIndex);
        ret.push(this.GetPosByIndex(index));
    }
    return ret;
}

module.exports = MapPath;