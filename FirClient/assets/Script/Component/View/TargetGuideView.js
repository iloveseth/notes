const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_finger: { default: null, type: cc.Node },
    },

    onLoad: function () {
        this.name_guidenode = "";
        this.node_guidenode = null;
        this.node_finger.active = false;
    },

    start() {
    },

    update(dt) {
        let isFinish = Game.UserModel.getTargetTaskRed();
        let subId = Game._.get(this.opts, 'id', 0);
        if (isFinish && subId != 100000) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TARGET_GUIDE_END);
            return;
        };
        if (this.name_guidenode != '') {
            //寻找节点
            if (this.node_guidenode == null) {
                //没找到 接着找
                this._findGuideNodeAndClone();
            } else {
                //找到了 动态移动
                this._updateFingerPosition();
            }
        }
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
    },

    initNotification() {
        // this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TOUCH_END, this, this.onTouchEnd);
    },

    removeNotification() {
        // this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.TOUCH_END, this, this.onTouchEnd);
    },

    initView() {
        this.name_guidenode = "";
        this.node_guidenode = null;
        this.node_finger.active = false;
    },

    SetInfo: function (opts) {
        this.name_guidenode = Game._.cloneDeep(Game._.get(opts, 'nodename', ''));
        if (this.name_guidenode == '') {
            //无指向node，TARGET_GUIDE_END
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TARGET_GUIDE_END);
        };
        this.node_guidenode = null;
        this.node_finger.active = false;
        this.opts = opts;
        this.checkTargetNodeName();

    },

    _findGuideNodeAndClone: function () {
        //有没有按钮
        let found = false;
        if (this.name_guidenode != null) {
            let names = this.name_guidenode.split(';');
            this.node_guidenode = Game.ViewController.SeekChildByNameList(cc.director.getScene().getChildByName('Canvas'), names);
            if (this.node_guidenode != null) {
                //手指移动
                found = true;
            };
        };
        this.node_finger.active = found;

    },

    _updateFingerPosition: function () {
        let worldPos = cc.p(0, 0);
        if (this.node_guidenode != null && this.node_guidenode.parent == null) {
            this.node_guidenode = null;
        }
        if (this.node_guidenode != null) {
            worldPos = this.node_guidenode.parent.convertToWorldSpaceAR(this.node_guidenode.position);
        }

        if (this.node_finger.active) {
            this.node_finger.position = this.node_finger.parent.convertToNodeSpaceAR(worldPos);
        }
    },

    onTouchEnd: function (event) {
        cc.log("TargetGuideView onTouchEnd");
        if (this.name_guidenode != '' && this.node_guidenode != null) {
            if (event == null) { return };
            let isInrect = this.checkIsInTargetRect(event);
            if (!isInrect) {
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TARGET_GUIDE_END);
                cc.log("不在手指范围内,中断引导");
                return;
            };


            Game.TargetGuideController.OnGuideComplete(this.opts);
            // Game.NotificationController.Emit(Game.Define.EVENT_KEY.TOUCH_END, event);
            // event.stopPropagation();
        } else {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TARGET_GUIDE_END);
        };
    },

    checkIsInTargetRect(event) {
        let worldPos = this.node_guidenode.parent.convertToWorldSpaceAR(this.node_guidenode.position);
        let width = this.node_guidenode.width;
        let height = this.node_guidenode.height;
        let rect = cc.rect(worldPos.x - width * 0.5, worldPos.y - height * 0.5, width, height);
        let position = event.getLocation();
        if (cc.rectContainsPoint(rect, position)) {
            return true;
        }
        return false;
    },

    checkTargetNodeName() {
        if (this.name_guidenode == '') {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TARGET_GUIDE_END);
            return;
        };

        let checkType = Game._.get(this.opts, 'type', 0);

        if (checkType == 0) {
            //普通
            return;
        } else if (checkType == 1) {
            //是否装备
            for (let i = 0; i < 10; i++) {
                let equipInfo = Game.TargetGuideController.checkConditionEquipFit(i);
                if (equipInfo == null) {
                    this.name_guidenode = this.name_guidenode + (i + 1);
                    return;
                };
            };
        } else if (checkType == 2) {
            //强化等级
            // let needLv = Game._.get(Game.TargetGuideController.taskDetailMsg,"maxnum",0);
            let needLv = 99;
            for (let i = 0; i < 10; i++) {
                let equipInfo = Game.TargetGuideController.checkConditionEquipFit(i);
                if (equipInfo) {
                    let isConform = Game.TargetGuideController.checkConditionEquipLv(i, needLv);
                    if (!isConform) {
                        this.name_guidenode = this.name_guidenode + (i + 1);
                        return;
                    };
                };
            };
        } else if (checkType == 3) {
            //是否镶嵌
            let needLv = 0;
            for (let i = 0; i < 10; i++) {
                let equipInfo = Game.TargetGuideController.checkConditionEquipFit(i);
                if (equipInfo) {
                    let isHole = Game.TargetGuideController.checkConditionEquipHole(i);
                    let isStone = Game.TargetGuideController.checkConditionEquipGem(i);
                    if (isHole && !isStone) {
                        this.name_guidenode = this.name_guidenode + (i + 1);
                        return;
                    };
                };
            };
        } else if (checkType == 4) {
            //是否打孔
            for (let i = 0; i < 10; i++) {
                let equipInfo = Game.TargetGuideController.checkConditionEquipFit(i);
                if (equipInfo) {
                    let isHole = Game.TargetGuideController.checkConditionEquipHole(i);
                    if (!isHole) {
                        this.name_guidenode = this.name_guidenode + (i + 1);
                        return;
                    };
                };
            };
        } else if (checkType == 5) {
            //装备灵魂装备
            for (let i = 0; i < 10; i++) {
                let equipInfo = Game.TargetGuideController.checkConditionEquipFit(i);
                // if(equipInfo){
                //     let isSoul = Game.TargetGuideController.checkConditionEquipSoul(i);
                //     if(!isSoul){
                //         this.name_guidenode = this.name_guidenode + (i+1);
                //         return;
                //     };
                // };
                if (equipInfo == null) {
                    this.name_guidenode = this.name_guidenode + (i + 1);
                    return;
                };
            };
        } else if (checkType == 6) {
            //装备星级
            // let needStar = Game._.get(Game.TargetGuideController.taskDetailMsg,"maxnum",0);
            let needStar = 99;
            for (let i = 0; i < 10; i++) {
                let equipInfo = Game.TargetGuideController.checkConditionEquipFit(i);
                if (equipInfo) {
                    let isConform = Game.TargetGuideController.checkConditionEquipStar(i, needStar);
                    if (!isConform) {
                        this.name_guidenode = this.name_guidenode + (i + 1);
                        return;
                    };
                };
            };
        } else if (checkType == 7) {
            //灵魂装备升级
            for (let i = 0; i < 10; i++) {
                let equipInfo = Game.TargetGuideController.checkConditionEquipFit(i);
                if (equipInfo) {
                    let isSoul = Game.TargetGuideController.checkConditionEquipSoul(i);
                    if (isSoul) {
                        this.name_guidenode = this.name_guidenode + (i + 1);
                        return;
                    };
                };
            };

        };
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TARGET_GUIDE_END);

    },


    //====================  这是分割线  ====================
});
