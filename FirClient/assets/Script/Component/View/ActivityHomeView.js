const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_act_title: { default: null, type: cc.Label_ },
        scrollview: { default: null, type: cc.ScrollView },
        btnCellNodePrefab: { default: null, type: cc.Prefab },
        content: { default: null, type: cc.Node },
        node_add_child: { default: null, type: cc.Node },
        ActivityXianShiNode: { default: null, type: cc.Prefab },
        ActivityHome_SevenWeal_Node: { default: null, type: cc.Prefab },
        ActivityJijinNode: { default: null, type: cc.Prefab },
        ActivityLeiJiNode: { default: null, type: cc.Prefab },
        ActivityMonthCardNode: { default: null, type: cc.Prefab },
        ActivityXiaoFeiNode: { default: null, type: cc.Prefab },
        ActivetyCdKeyNode: { default: null, type: cc.Prefab }
    },

    onLoad: function () {
        this.curShowNode = null;
    },

    start() {
    },

    update(dt) {
    },

    lateUpdate(dt) {
    },

    onDestroy() {
    },

    onEnable() {
        this.initNotification();
        this.initView();
    },

    onDisable() {
        this.removeNotification();
        if (this.curShowNode != null) {
            this.curShowNode.destroy();
        }
        this.curShowNode = null;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.ACTIVITY_HOME_VIEW_REFRESH, this, this.refreshActShowNode);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ACTIVITY_HOME_VIEW_REFRESH, this, this.refreshActShowNode);
    },

    initView() {
        let actType = this._data || 0;
        Game.ActiveModel.setCurrentActivity(actType);
        this.actType_old = 0;
        this.actType_new = 0;
        this.refreshBtnState();
        this.refreshActShowNode(actType);
        if (actType == 1) {
            this.Label_act_title.string = "开服活动";
        } else if (actType == 2) {
            this.Label_act_title.string = "热门活动";
        }
    },

    refreshBtnState() {
        let actlength = Game.ActiveModel.getActivityNum();
        this.scrollview.scrollToTop();

        let allChildren = this.content.children;
        for (let i1 = 0; i1 < allChildren.length; i1++) {
            allChildren[i1].getComponent('ActivityHomeCellNode').onClose(true);
        }

        for (let i = 0; i < actlength; i++) {
            let tempActive = Game.ActiveModel.getActivityTypeByIndex(i);
            let tempData = Game.ConfigController.GetConfigById("actres_data", tempActive);
            let _view = cc.instantiate(this.btnCellNodePrefab);
            let _gameComponet = _view.getComponent('ActivityHomeCellNode');
            if (_gameComponet) {
                _gameComponet.initUrl(Game.UIName.UI_ACTIVITY_HOME_SCROLL_NODE);//初始化界面的路径
                if (tempData != null) {
                    _gameComponet.setData(tempData);//设置界面数据
                }
            }
            _view.actType = tempActive;
            _view.parent = this.content;


            // let tempActive = Game.ActiveModel.getActivityTypeByIndex(i);
            // let tempData = Game.ConfigController.GetConfigById("actres_data",tempActive);
            // let _view = allChildren[i];
            // _view.active = true;
            // let _gameComponet = _view.getComponent('ActivityHomeCellNode');
            // if(_gameComponet){
            //     _gameComponet.setData(tempData);
            //     _gameComponet.initView();
            // }
        };
    },

    refreshActShowNode(actType) {
        if (Game.GlobalModel.needChangeActiveShowNode) {
            Game.GlobalModel.needChangeActiveShowNode = false;
        } else {
            return;
        };
        this.content.children.forEach(e => {
            e.getComponent('ActivityHomeCellNode').setSelect(e.actType == actType);
        });

        cc.log("refreshActShowNode actType == " + actType);
        this.actType_new = actType;
        if (this.actType_old == this.actType_new) {
            return;
        } else {
            this.actType_old = actType;
        };
        // Game.ViewController.CloseView(this.curShowNode);
        if (this.curShowNode != null) {
            this.curShowNode.destroy();
        }
        if (actType == Game.Define.ActivityType.LOGIN_ACTIVITY) {


        } else if (actType == Game.Define.ActivityType.LIMIT_ACTIVITY) {
            this.addChildActivityNode(this.ActivityXianShiNode, Game.UIName.UI_ACTIVITY_XIANSHI_NODE, "ActivityXianShiNode");

        } else if (actType == Game.Define.ActivityType.SEVEN_ACTIVITY) {
            this.addChildActivityNode(this.ActivityHome_SevenWeal_Node, Game.UIName.UI_ACTIVITY_HOME_SEVENWEAL_NODE, "ActivityHome_SevenWeal_Node");

        } else if (actType == Game.Define.ActivityType.INSURANCE_ACTIVITY) {
            this.addChildActivityNode(this.ActivityJijinNode, Game.UIName.UI_ACTIVITY_JIJIN_NODE, "ActivityJijinNode");

        } else if (actType == Game.Define.ActivityType.FIGTHBOX_ACTIVITY) {


        } else if (actType == Game.Define.ActivityType.CHONGZHI_ACTIVITY) {


        } else if (actType == Game.Define.ActivityType.LEIJI_ACTIVITY) {
            this.addChildActivityNode(this.ActivityLeiJiNode, Game.UIName.UI_ACTIVITY_LEIJI_NODE, "ActivityLeiJiNode");

        } else if (actType == Game.Define.ActivityType.TURNTABLE_ACTIVITY) {


        } else if (actType == Game.Define.ActivityType.REDBAG_ACTIVITY) {


        } else if (actType == Game.Define.ActivityType.YUEKA_ACTIVITY) {
            //月卡
            this.addChildActivityNode(this.ActivityMonthCardNode, Game.UIName.UI_ACTIVITY_MONTH_CARD_NODE, "ActivityMonthCardNode");
        } else if (actType == Game.Define.ActivityType.SMALLTREE_ACTIVITY) {


        } else if (actType == Game.Define.ActivityType.SEVENNUM_ACTIVITY) {


        } else if (actType == Game.Define.ActivityType.COSTSORT_ACTIVITY) {
            this.addChildActivityNode(this.ActivityXiaoFeiNode, Game.UIName.UI_ACTIVITY_XIAOFEI_NODE, "ActivityXiaoFeiNode");

        } else if (actType == Game.Define.ActivityType.ROBFLOOR_ACTIVITY) {


        } else if (actType == Game.Define.ActivityType.CDKEY_ACTIVITY) {
            this.addChildActivityNode(this.ActivetyCdKeyNode, Game.UIName.UI_ACTIVITY_CDKEY, "ActivityCdKeyNode");
        }
        else if (actType >= Game.Define.ActivityType.GUARD_ACTIVITY && actType <= Game.Define.ActivityType.WORLDBOSS_ACTIVITY) {

        }
    },

    addChildActivityNode(prefab, ui, ComName, data = null) {
        // cc.loader.loadRes(ui, function (err, prefab) {
        //     if (err) {
        //         console.log('[严重错误] 奖励资源加载错误 ' + err);
        //     } else {
        //         let _view = cc.instantiate(prefab);
        //         _view.uiname = ui;

        //         let _gameComponet = _view.getComponent(ComName);
        //         if (_gameComponet) {
        //             _gameComponet.initUrl(ui);      //初始化界面的路径
        //             if (data != null) {
        //                 _gameComponet.setData(data);        //设置界面数据
        //             };
        //         };

        //         this.node_add_child.addChild(_view);
        //         this.curShowNode = _view;
        //     };
        // }.bind(this));

        let _view = cc.instantiate(prefab);
        let _gameComponet = _view.getComponent(ComName);
        if (_gameComponet) {
            _gameComponet.initUrl(ui);      //初始化界面的路径
            if (data != null) {
                _gameComponet.setData(data);        //设置界面数据
            };
        };
        this.node_add_child.addChild(_view);
        this.curShowNode = _view;

    },


    //====================  这是分割线  ====================
});
