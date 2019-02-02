const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_scenename: { default: null, type: cc.Label_ },
        tableview_scene: { default: null, type: cc.tableView },
        node_leftarrow: { default: null, type: cc.Node },
        node_rightarrow: { default: null, type: cc.Node },
        label_rewardtitle: { default: null, type: cc.Label_ },
        nodes_reward: { default: [], type: [cc.Node] },
        labels_rewardcount: { default: [], type: [cc.Label_] },
        label_droptip: { default: null, type: cc.Label_ },

        data_defines: { default: null },
        index_page: { default: 1 },
        id_map: { default: 1 },
    },
    onEnable: function () {
        //初始化界面
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.data_defines = Game.ConfigController.GetConfig('newscene_data');
        this.id_map = this._data == null ? Game.LevelModel.GetCurMapId() : this._data;
        let scene = Game.LevelModel.GetSceneByMap(this.id_map);
        this.index_page = scene == null ? 1 : Game._.get(scene, 'id', 1);
        let guideInfo = null;
        if (this.id_map == Game.LevelModel.GetMaxMapId() && this.id_map > Game.LevelModel.GetTopMapId()) {
            //最高关卡没到过 
            // let node = Game.ViewController.SeekChildByName(cc.director.getScene().getChildByName('Canvas'), 'MiniLevelMap' + scene.id);
            // let path = Game.ViewController.GetPathByNode(node);
            guideInfo = {
                scene: scene.id,
                button: (this.id_map - scene.min_pass)
            }
        }
        let data = {
            callback: this.onLevelClick.bind(this),
            array: this.data_defines,
            guideInfo: guideInfo
        };
        this.tableview_scene.addPageEvent(this.node, 'MiniMapView', 'onPageChange');
        this.tableview_scene.initTableView(this.data_defines.length, data, this.index_page);
        //看看要不要引导

        this._updateLevelInfo();

        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TARGET_GUIDE_END);
    },
    onDisable: function () {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.tableview_scene.clearPageEvent();
    },
    onDestroy: function () {

    },
    //====================  按钮函数  ====================
    onLeftPageClick: function () {
        this.tableview_scene.scrollToLastPage();
    },
    onRightPageClick: function () {
        this.tableview_scene.scrollToNextPage();
    },
    onLevelClick: function (mapid) {
        this.onClose(true);
        if (Game.LevelModel.GetCurMapId() == mapid) {
            return;
        }
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.LEVEL_UPDATELEVEL, mapid)
    },
    onTouchStart: function () {
        //点击到外面的遮罩区了 关闭
        this.onClose(true);
    },
    //====================  回调函数  ====================
    onPageChange: function (page, total) {
        this.index_page = page;
        this._updateScrollPage();
    },
    //====================  更新界面函数  ====================
    _updateScrollPage: function () {
        let scene = this.data_defines[this.index_page - 1];
        this.label_scenename.setText(scene.name);
        this.node_leftarrow.active = (this.index_page > 1);
        this.node_rightarrow.active = (this.index_page < this.data_defines.length);
    },
    _updateLevelInfo: function () {
        let mapid = Game.LevelModel.GetMaxMapId();
        this.label_rewardtitle.setText('通关 ' + Game.LevelModel.GetMapIndex(mapid) + ' 可获得如下奖励: ');
        let boss = Game.LevelModel.GetMapBoss(mapid);
        let quality = Game._.get(boss, 'quality', '0') == '0' ? 0 : 1;
        let rewards = [
            Game._.get(boss, 'exp', 0),
            Game._.get(boss, 'money', 0),
            Game._.get(boss, 'wuxianum', 0),
            Game._.get(boss, 'goldnum', 0),
            quality
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
    }
});
