require('./CustomNode/Label_');
require('./CustomNode/Button_');
require('./CustomNode/Sprite_');
require('./CustomNode/tableView/tableView');
require('./CustomNode/tableView/viewCell');
require('./CustomNode/ArrayNode');
const _ = require('lodash');
const Define = require('../Util/Define');
const ViewController = require('../Controller/ViewController');
const NotificationController = require('../Controller/NotificationController');
const LanguageController = require('../Controller/LanguageController');
var GameComponent = cc.Class({
    extends: cc.Component,

    properties: {
        _url: { default: '' },
        _data: { default: {} },

        _oldparentNode: { default: null },
        _autoFitNode: { default: [], type: [cc.Node] }
    },

    /**
     * 生命周期 begin
    */
    onLoad() {      //脚本初始化阶段。执行一次。
        if (_.isArray(this._autoFitNode)) {
            let viewSize = cc.view.getVisibleSize();
            for (let i = 0; i < this._autoFitNode.length; i++) {
                let node = this._autoFitNode[i];
                node.width = viewSize.width;
                node.height = viewSize.height;
            }
        }
    },

    start() {       //在组件激活前，执行一次，在update执行之前 
    },

    update(dt) {    //组件进行更新时执行,帧计时器会一直执行函数中的操作
    },

    lateUpdate(dt) {    //所有组件的 update 都执行完之后调用
    },

    onDestroy() {        //当组件调用了 destroy()，会在该帧结束被统一回收，此时会调用 onDestroy 回调。
    },

    onEnable() {         //当组件的 enabled(active) 属性从 false 变为 true 时，会激活 onEnable 回调。倘若节点第一次被 创建且 enabled(active) 为 true，则会在onLoad 之后，start 之前被调用。
    },

    onDisable() {        //当组件的 enabled(active) 属性从 true 变为 false 时，会激活 onDisable 回调。
    },
    /**
     * 生命周期 end
    */

    initUrl(url) {
        this._url = url;
    },

    setData(data) {
        this._data = data;
    },

    changeMainPage(page) {
        NotificationController.Emit(Define.EVENT_KEY.CHANGE_MAINPAGE, page);
    },

    openView(ui, data = null) {
        ViewController.OpenView(ui, "ViewLayer", data);
    },

    openMaskView(ui, data = null) {
        ViewController.OpenView(ui, "MaskLayer", data);
    },

    closeView(ui, removeView = false) {
        ViewController.CloseView(ui, removeView);
    },

    onClose(removeView = false) { 
        this.closeView(this._url,removeView);
    },

    showTips(data) {
        NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, data);
    },

    localLanguage(id) {   //本地化语言转换
        return LanguageController.FindLanguageStr(id);
    },

    createSingItem(t_Object, parent, scaleX = 1, scaleY = 1) {
        return ViewController.CreateSingItem(t_Object, parent, scaleX, scaleY);
    },

    setNewParent: function (parent) {
        if (_.isFunction(parent.addChild)) {
            this._oldparentNode = this.node.parent;
            this._oldSiblingIndex = this.node.getSiblingIndex();
            this.node.parent = parent;
        }
    },

    backToOldParent: function () {
        if (this._oldparentNode != null && _.isFunction(this._oldparentNode.addChild)) {
            this.node.parent = this._oldparentNode;
            if (this._oldSiblingIndex != null) {
                this.node.setSiblingIndex(this._oldSiblingIndex);
            }
        }
    }
});

cc.GameComponent = module.exports = GameComponent;