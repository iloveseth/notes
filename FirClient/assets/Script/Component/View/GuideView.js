const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        ske_role: { default: null, type: sp.Skeleton },
        node_bg: { default: null, type: cc.Node },
        node_dialoguetarget: { default: null, type: cc.Node },
        node_dialogueframe: { default: null, type: cc.Node },
        node_dialogue: { default: null, type: cc.Node },
        richtext_dialogue: { default: null, type: cc.RichText },
        widget_dialogue: { default: null, type: cc.Widget },
        widget_ske: { default: null, type: cc.Widget },
        node_finger: { default: null, type: cc.Node },
        node_clone: { default: null, type: cc.Node },
        node_show: { default: null, type: cc.Node },
        block: { default: null, type: cc.BlockInputEvents },

        data_guide: { default: null },
        func_click: { default: null },
        node_fixed: { default: null },
        end_show: { default: false },
        name_guidenode: { default: '' },
        node_guidenode: { default: null, type: cc.Node },
        node_clones: { default: null, type: cc.Node },
        has_buttonlistener: { default: false },
        force: { default: false }
    },
    update: function () {
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
    onLoad: function () {
        Game.ResController.LoadSpine(Game.GuideController.GetCountryPrincessPath(Game.UserModel.GetCountry()), function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.ske_role.skeletonData = asset;
                this.ske_role.setAnimation(0, 'idle', true);
            }
        }.bind(this));
    },
    onEnable: function () {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TOUCH_END, this, this.onTouchEnd);
        this.block.enabled = true;
    },
    onDisable: function () {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    },
    SetInfo: function (opts) {
        if (this.node_fixed != null) {
            this.node_fixed.destroy();
        }
        this.data_guide = Game._.get(opts, 'data', {});
        this.func_click = Game._.get(opts, 'callback', null);
        this.node_fixed = Game._.get(opts, 'fixednode', null);
        this.name_guidenode = Game._.get(this, 'data_guide.nodename', '');
        let isforce = Game._.get(this, 'data_guide.force', 0);
        this.force = (isforce == 1 && this.name_guidenode != '');
        this.node_bg.opacity = Game._.get(this, 'data_guide.mask', 100);
        this.node_guidenode = null;
        this.node_clones = null;
        this.has_buttonlistener = false;
        this.node_finger.active = false;
        //是不是有延时
        this.end_show = false;
        let delay = Game._.get(this, 'data_guide.delay', 0.1);
        if (delay != 0) {
            this.node_show.active = false;
            this.node.runAction(cc.sequence([
                cc.delayTime(delay),
                cc.callFunc(function () {
                    this.node_show.active = true;
                    this.end_show = true;
                    this._updateView();
                }, this)
            ]));
        } else {
            this.node_show.active = true;
            this.end_show = true;
            this._updateView();
        }
    },
    onTouchEnd: function () {
        if (this.end_show && !(this.name_guidenode != '' && this.node_guidenode == null) && !this.has_buttonlistener && Game.GuideController.runningGuide) {
            Game.Tools.InvokeCallback(this.func_click, this.data_guide);
        }
    },
    onGuideButtonClick: function () {
        if (this.node_guidenode != null) {
            if (this.node_clones != null) {
                this.node_guidenode.position = this.node_clones.position;
                this.node_guidenode.removeFromParent(false);
                let tempName = [];
                for (let i = 0; i < this.node_clone.childrenCount; i++) {
                    let child = this.node_clone.children[i];
                    tempName.push(Game._.get(child, 'name', ''));
                }
                this.node_clones.parent.insertChild(this.node_guidenode, this.node_clones.getSiblingIndex());
                //删掉上面的按钮回调
                let button = this.node_guidenode.getComponent(cc.Button);
                if (button) {
                    button.clickEvents = Game._.filter(button.clickEvents, function (o) {
                        return !(o.component == 'GuideView' && o.handler == "onGuideButtonClick");
                    });
                }
            } else {
                this.node_guidenode.removeFromParent(true);
            }
            this.node_guidenode = null;
        }
        //说明是把节点拉上来了，再给放回去
        if (this.node_clones != null) {
            this.node_clones.removeFromParent(true);
            this.node_clones = null;
        }
        Game.Tools.InvokeCallback(this.func_click, this.data_guide);
    },
    _updateView: function () {
        //有没有对话
        if (this.node_fixed != null) {
            this.richtext_dialogue.node.active = false;
            this.ske_role.node.active = true;
            this.node_dialogueframe.addChild(this.node_fixed);
            this.node_dialogue.active = true;
            let layout = this.node_fixed.getComponent(cc.Layout);
            if (layout) {
                layout.updateLayout();
            }
        } else {
            let desc = Game._.get(this, 'data_guide.desc', '');
            if (desc != '') {
                this.richtext_dialogue.node.active = true;
                this.ske_role.node.active = true;
                this.richtext_dialogue.string = desc;
                this.node_dialogue.active = true;
            } else {
                //不显示就完了，不用干啥了
                this.richtext_dialogue.node.active = false;
                this.ske_role.node.active = false;
                this.node_dialogue.active = false;
            }
        }
        let contentlayout = this.widget_dialogue.node.getComponent(cc.Layout);
        contentlayout.updateLayout();
        this.widget_ske.updateAlignment();
        //计算左右
        if (this.ske_role.node.active) {
            let isleft = Game._.get(this, 'data_guide.isleft', 1);
            if (isleft == 1) {
                //左
                this.ske_role.node.x = -200;
                this.ske_role.node.scaleX = -1;
                this.node_dialogueframe.scaleX = 1;
                if (this.node_fixed != null) {
                    this.node_fixed.scaleX = 1;
                }
                this.richtext_dialogue.node.scaleX = 1;
                this.widget_dialogue.isAlignLeft = true;
                this.widget_dialogue.isAlignRight = false;
                this.widget_dialogue.left = 0;
            } else {
                //右
                this.ske_role.node.x = 200;
                this.ske_role.node.scaleX = 1;
                this.node_dialogueframe.scaleX = -1;
                if (this.node_fixed != null) {
                    this.node_fixed.scaleX = -1;
                }
                this.richtext_dialogue.node.scaleX = -1;
                this.widget_dialogue.isAlignLeft = false;
                this.widget_dialogue.isAlignRight = true;
                this.widget_dialogue.right = 0;
            }
            //计算位置
            this.widget_dialogue.bottom = 0;
            this.widget_dialogue.updateAlignment();
            let dialogueTargetPos = this.node_dialoguetarget.parent.convertToWorldSpaceAR(this.node_dialoguetarget.position);
            this.node_dialogue.position = this.node_dialogue.parent.convertToNodeSpaceAR(dialogueTargetPos);
        }
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
                if (this.force) {
                    //把原来的挪上来 再新建一个放回去占位
                    //把按钮clone 出来
                    this.node_clones = cc.instantiate(this.node_guidenode);
                    // this.node_clone.addChild(this.node_clones);
                    // this.node_clones.active = true;

                    this.node_clone.position = this.node_guidenode.position;
                    this.node_guidenode.parent.insertChild(this.node_clones, this.node_guidenode.getSiblingIndex());
                    this.node_guidenode.removeFromParent(false);
                    this.node_clone.addChild(this.node_guidenode);
                    //打印
                    let tempName = [];
                    for (let i = 0; i < this.node_clone.childrenCount; i++) {
                        let child = this.node_clone.children[i];
                        tempName.push(Game._.get(child, 'name', ''));
                    }
                    let button = this.node_guidenode.getComponent(cc.Button);
                    if (button) {
                        let clickEventHandler = new cc.Component.EventHandler();
                        clickEventHandler.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
                        clickEventHandler.component = "GuideView";//这个是代码文件名
                        clickEventHandler.handler = "onGuideButtonClick";
                        button.clickEvents.push(clickEventHandler);
                        this.has_buttonlistener = true;
                    }
                }
            }
        }
        // 小野说不会有没有要引导的按钮但还是强制的，那么这就是非强制的了
        this.node_finger.active = found;
    },
    _updateFingerPosition: function () {
        let worldPos = cc.p(0, 0);
        if (this.force) {
            if (this.node_clones != null) {
                worldPos = this.node_clones.parent.convertToWorldSpaceAR(this.node_clones.position);
				if(this.node_guidenode != null){
					this.node_clones.scaleX = this.node_guidenode.scaleX;
					this.node_clones.scaleY = this.node_guidenode.scaleY;
				}
            }
            if (this.node_finger.active) {
                this.node_finger.position = this.node_finger.parent.convertToNodeSpaceAR(worldPos);
            }
            if (this.node_guidenode != null) {
                this.node_guidenode.position = this.node_clone.convertToNodeSpaceAR(worldPos);
            }
        } else {
            if (this.node_guidenode != null) {
                worldPos = this.node_guidenode.parent.convertToWorldSpaceAR(this.node_guidenode.position);
            }
            if (this.node_finger.active) {
                this.node_finger.position = this.node_finger.parent.convertToNodeSpaceAR(worldPos);
            }
        }
    }
});

