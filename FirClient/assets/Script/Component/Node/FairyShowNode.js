const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_one: { default: null, type: cc.Node },
        animation_one: { default: null, type: cc.Animation },
        spe_partsfairy: { default: null, type: sp.Skeleton },
        spe_goldfairy: { default: null, type: sp.Skeleton },
        spe_targetfairy: { default: null, type: sp.Skeleton },
        label_fairy: { default: null, type: cc.Label_ },
        node_onebuttons: { default: null, type: cc.ArrayNode },
        node_onedrawcost: { default: null, type: cc.Node },
        sprite_onedrawcost: { default: null, type: cc.Sprite_ },
        label_onedrawcost: { default: null, type: cc.Label_ },
        label_onedrawfree: { default: null, type: cc.Label_ },
        node_mask: { default: null, type: cc.Node },
        node_circle: { default: null, type: cc.Node },
        node_node1: { default: null, type: cc.Node },
        node_node2: { default: null, type: cc.Node },
        node_animation: { default: null, type: cc.Node },
        node_info: { default: null, type: cc.Node },

        animation_ten: { default: null, type: cc.Animation },
        node_ten: { default: null, type: cc.Node },
        nodes_draw: { default: [], type: [require('./LuckDrawNode')] },
        node_tenbuttons: { default: null, type: cc.Node },
        node_tendrawcost: { default: null, type: cc.Node },
        sprite_tendrawcost: { default: null, type: cc.Sprite_ },
        label_tendrawcost: { default: null, type: cc.Label_ },
        label_tendrawfree: { default: null, type: cc.Label_ },
        node_tendrawgold: { default: null, type: cc.Node },
        node_tendrawpart: { default: null, type: cc.Node },
        node_whiteMask: { default: null, type: cc.Node },

        playing_one: { default: false },
        index_playing: { default: null }
    },
    onEnable: function () {
        this.index_playing = null;
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.spe_partsfairy.setEventListener(this.onPartsFairyAnimaEvent.bind(this));
        this.spe_goldfairy.setEventListener(this.onPartsFairyAnimaEvent.bind(this));
        let drawType = Game._.get(this, '_data.type', 0)
        if (drawType == Game.Define.LuckDrawType.LuckDraw_chip || drawType == Game.Define.LuckDrawType.LuckDraw_count_down) {
            //碎片单抽
            this.node_ten.active = false;
            this.PlayPartDrawOneResult(Game._.get(this, '_data.items.0', null));
        } else if (drawType == Game.Define.LuckDrawType.LuckDraw_gold_free || drawType == Game.Define.LuckDrawType.LuckDraw_gold_once) {
            //金币单抽
            this.node_ten.active = false;
            this.PlayGoldDrawOneResult(Game._.get(this, '_data.items.0', null));
        } else if (drawType == Game.Define.LuckDrawType.LuckDraw_chip_ten) {
            //碎片十连
            this.node_tendrawgold.active = false;
            this.node_tendrawpart.active = true;
            this.node_ten.active = true;
            this.PlayPartDrawTenResult();
        } else if (drawType == Game.Define.LuckDrawType.LuckDraw_free_ten || drawType == Game.Define.LuckDrawType.LuckDraw_gold_ten) {
            //金币十连
            this.node_tendrawgold.active = true;
            this.node_tendrawpart.active = false;
            this.node_ten.active = true;
            this.PlayGoldDrawTenResult();
        } else if (drawType == Game.Define.LuckDrawType.LuckDraw_item_one || drawType == Game.Define.LuckDrawType.LuckDraw_item_two || drawType == Game.Define.LuckDrawType.LuckDraw_item_three) {
            this.node_ten.active = false;
            this.PlayPartDrawOneResult(Game._.get(this, '_data.items.0', null));
        };
    },
    onDisable: function () {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.CloseOneDrawAnima();
    },
    //====================  回调函数  ====================
    onPartsFairyAnimaEvent: function () {
        if (this.playing_one) {
            this.animation_one.play('DrawOne');
        }
    },
    onFairyShowEnd: function (event) {
        if (Game._.get(event, 'detail._name', '') == 'DrawOne') {
            //前缀动画播完了,进入循环播放吧
            this.animation_one.play('DrawCircle');
            this.node_whiteMask.runAction(cc.fadeTo(0.5, 0));
            this.node_info.active = true;
            this.spe_targetfairy.setAnimation(0, 'idle', true);
            let drawType = Game._.get(this, '_data.type', 0);
            if (drawType == Game.Define.LuckDrawType.LuckDraw_chip || drawType == Game.Define.LuckDrawType.LuckDraw_count_down) {
                //金币单抽 要显示再来一次
                this.node_onebuttons.SetActive(['Button_Confirm', 'Button_Again']);
                if (Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_PARTDRAWONCE) > 0) {
                    //要花钱
                    this.node_onedrawcost.active = true;
                    this.label_onedrawfree.node.active = false;
                    let itemdefine = Game.ItemModel.GetItemConfig(467);
                    this.sprite_onedrawcost.SetSprite(Game._.get(itemdefine, 'pic', ''));
                    this.label_onedrawcost.setText(Game.ConfigController.GetConfigById('price_data', Game.Define.PRICE_TYPE.DRAWONCE_PART).consume);
                } else {
                    // 还有免费次数哦
                    this.node_onedrawcost.active = false;
                    this.label_onedrawfree.node.active = true;
                    this.label_onedrawfree.setText('免费*1');
                }

            } else if (drawType == Game.Define.LuckDrawType.LuckDraw_gold_free || drawType == Game.Define.LuckDrawType.LuckDraw_gold_once) {
                this.node_onebuttons.SetActive(['Button_Confirm', 'Button_Again']);
                if (Game.ShopModel.GetGoldDrawOnceFree() > 0) {
                    //免费
                    this.node_onedrawcost.active = false;
                    this.label_onedrawfree.node.active = true;
                    this.label_onedrawfree.setText('免费*' + Game.ShopModel.GetGoldDrawOnceFree());
                } else {
                    //要花钱
                    this.node_onedrawcost.active = true;
                    this.label_onedrawfree.node.active = false;
                    let itemdefine = Game.ItemModel.GetItemConfig(Game.ItemDefine.SPECIALITEM_TYPE.TYPE_GOLD);
                    this.sprite_onedrawcost.SetSprite(Game._.get(itemdefine, 'pic', ''));
                    this.label_onedrawcost.setText(Game.ConfigController.GetConfigById('price_data', Game.Define.PRICE_TYPE.DRAWONCE_GOLD).consume);
                }

            } else if (drawType == Game.Define.LuckDrawType.LuckDraw_chip_ten || drawType == Game.Define.LuckDrawType.LuckDraw_free_ten || drawType == Game.Define.LuckDrawType.LuckDraw_gold_ten) {
                //十连 只显示ok
                this.node_onebuttons.SetActive(['Button_Confirm']);
            }else if (drawType == Game.Define.LuckDrawType.LuckDraw_item_one || drawType == Game.Define.LuckDrawType.LuckDraw_item_two || drawType == Game.Define.LuckDrawType.LuckDraw_item_three) {
                //碎片抽奖
                this.node_onebuttons.SetActive(['Button_Confirm', 'Button_Again']);
                this.sprite_onedrawcost.node.active = false;
                this.node_onedrawcost.active = false;
                this.label_onedrawfree.setText("");
                this.label_onedrawcost.setText("");
            }
        }
    },
    onDrawTenAnimaEnd: function () {
        this.animation_ten.off('finished', this.onDrawTenAnimaEnd, this);
        this.onFlapEnd(-1);
    },
    onOneOkClick: function () {
        this.playing_one = false;
        let drawType = Game._.get(this, '_data.type', 0)
        if (drawType == Game.Define.LuckDrawType.LuckDraw_chip || drawType == Game.Define.LuckDrawType.LuckDraw_count_down
            || drawType == Game.Define.LuckDrawType.LuckDraw_gold_free || drawType == Game.Define.LuckDrawType.LuckDraw_gold_once
            || drawType == Game.Define.LuckDrawType.LuckDraw_item_one || drawType == Game.Define.LuckDrawType.LuckDraw_item_two
            || drawType == Game.Define.LuckDrawType.LuckDraw_item_three) {
            //单抽
            this.onClose();
        } else if (drawType == Game.Define.LuckDrawType.LuckDraw_chip_ten || drawType == Game.Define.LuckDrawType.LuckDraw_free_ten || drawType == Game.Define.LuckDrawType.LuckDraw_gold_ten) {
            //十连
            this.CloseOneDrawAnima();
            this.FlapNext();
        }
    },
    onOneAgainClick: function () {
        let drawType = Game._.get(this, '_data.type', 0);
        if (drawType == Game.Define.LuckDrawType.LuckDraw_chip || drawType == Game.Define.LuckDrawType.LuckDraw_count_down) {
            //金币单抽 要显示再来一次
            if (Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_PARTDRAWONCE) > 0) {
                //要花钱
                let itemnum = Game.ItemModel.GetItemNumById(467);
                let cost = Game.ConfigController.GetConfigById('price_data', Game.Define.PRICE_TYPE.DRAWONCE_PART);
                if (itemnum < cost.consume) {
                    Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '精灵碎片不足');
                } else {
                    Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_chip });
                }
            } else {
                // 还有免费次数哦
                Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_count_down });
            }
        } else if (drawType == Game.Define.LuckDrawType.LuckDraw_gold_free || drawType == Game.Define.LuckDrawType.LuckDraw_gold_once) {
            if (Game.ShopModel.GetGoldDrawOnceFree() > 0) {
                Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_gold_free });
            } else {
                Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_gold_once });
            }
        } else if (drawType == Game.Define.LuckDrawType.LuckDraw_item_one || drawType == Game.Define.LuckDrawType.LuckDraw_item_two || drawType == Game.Define.LuckDrawType.LuckDraw_item_three) {
            Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: drawType });
        }
        this.onClose();
    },
    onTenOkClick: function () {
        this.onClose();
    },
    onTenAgainClick: function () {
        let drawType = Game._.get(this, '_data.type', 0);
        if (drawType == Game.Define.LuckDrawType.LuckDraw_chip_ten) {
            //碎片 没有免费的
            let itemnum = Game.ItemModel.GetItemNumById(467);
            let cost = Game.ConfigController.GetConfigById('price_data', Game.Define.PRICE_TYPE.DRAWTEN_PART);
            if (itemnum < cost.consume) {
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '精灵碎片不足');
            } else {
                Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_chip_ten });
            }
        } else {
            //金币
            if (Game.ShopModel.GetGoldDrawTenFree() > 0) {
                Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_free_ten });
            } else {
                Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_gold_ten });
            }
        }
        this.onClose();
    },
    onFlapEnd: function (index) {
        let items = Game._.get(this, '_data.items', []);
        if (index >= (items.length - 1)) {
            this.FlapNext();
        } else {
            let item = items[index + 1];
            let ani = Game._.get(item, 'playani', 0);
            if (ani == 0) {
                //不播放动画 继续下一个
                this.FlapNext();
            } else {
                //要播放
                this.PlayGoldDrawOneResult(item);
            }
        }
    },
    onTouchEnd: function () {
        if (this.playing_one) {
            this.playing_one = false;
            this.onFairyShowEnd(Game._.set({}, 'detail._name', 'DrawOne'));
        }
    },
    //====================  界面函数  ====================
    PlayPartDrawOneResult: function (data) {

        this.animation_one.on('finished', this.onFairyShowEnd, this);
        // this.animation_one.setCurrentTime(0.016, 'DrawOne');
        this.node_mask.opacity = 0;
        this.node_circle.active = false;
        this.node_node1.active = false;
        this.node_node2.active = false;
        this.node_animation.active = false;
        this.node_info.active = false;
        this.node_one.active = true;
        this.playing_one = true;
        let fairyDefine = Game.ConfigController.GetConfigById('fairybase_data', Game._.get(data, 'id', 0));
        this.spe_targetfairy.skeletonData = null;
        Game.ResController.LoadSpine(Game._.get(fairyDefine, 'fairyavatar', ''), function (err, assets) {
            if (err) {
                cc.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.spe_targetfairy.skeletonData = assets;
                let state = this.animation_one.getAnimationState();
                if (Game._.get(state, 'name', '') == 'DrawCircle') {
                    this.spe_targetfairy.setAnimation(0, 'idle', true);
                }
            }
        }.bind(this));
        this.label_fairy.setText(Game._.get(fairyDefine, 'fairyname', ''));
        this.label_fairy.setColor(Game.ItemModel.GetItemLabelColor(Game._.get(fairyDefine, 'fairycolor', 1)));
        this.label_fairy.setOutlineColor(Game.ItemModel.GetItemLabelOutlineColor(Game._.get(fairyDefine, 'fairycolor', 1)))
        //判断是金币还是碎片
        let drawType = Game._.get(this, '_data.type', 0);
        if (drawType == Game.Define.LuckDrawType.LuckDraw_chip || drawType == Game.Define.LuckDrawType.LuckDraw_count_down || drawType == Game.Define.LuckDrawType.LuckDraw_chip_ten) {
            //碎片
            this.spe_partsfairy.setAnimation(0, 'specialidle', false);
            this.spe_goldfairy.node.active = false;
            this.spe_partsfairy.node.active = true;
        } else if (drawType == Game.Define.LuckDrawType.LuckDraw_gold_free || drawType == Game.Define.LuckDrawType.LuckDraw_gold_once
            || drawType == Game.Define.LuckDrawType.LuckDraw_free_ten || drawType == Game.Define.LuckDrawType.LuckDraw_gold_ten) {
            //金币
            this.spe_goldfairy.setAnimation(0, 'specialidle', false);
            this.spe_goldfairy.node.active = true;
            this.spe_partsfairy.node.active = false;
        } else if (drawType == Game.Define.LuckDrawType.LuckDraw_item_one || drawType == Game.Define.LuckDrawType.LuckDraw_item_two || drawType == Game.Define.LuckDrawType.LuckDraw_item_three){
            this.spe_partsfairy.setAnimation(0, 'specialidle', false);
            this.spe_goldfairy.node.active = false;
            this.spe_partsfairy.node.active = true;
        }
    },
    PlayGoldDrawOneResult: function (data) {
        this.PlayPartDrawOneResult(data)
    },
    PlayPartDrawTenResult: function () {
        let data = {
            array: Game._.get(this, '_data.items', []),
            targetFlapCb: this.onFlapEnd.bind(this),
        }
        for (let i = 0; i < this.nodes_draw.length; i++) {
            let node = this.nodes_draw[i];
            node.init(i, data);
        }
        //再来一次的按钮
        //都初始化好了，开始播吧;
        this.node_tenbuttons.active = false;
        this.animation_ten.play();
        this.animation_ten.on('finished', this.onDrawTenAnimaEnd, this);
    },
    PlayGoldDrawTenResult: function () {
        this.PlayPartDrawTenResult();
    },
    CloseOneDrawAnima: function () {
        this.animation_one.off('finished', this.onFairyShowEnd, this);
        this.node_one.active = false;
        this.playing_one = false;
        this.animation_one.stop();
    },
    FlapNext: function () {
        if (this.index_playing == null) {
            this.index_playing = 0;
        } else {
            this.index_playing++;
        }
        if (this.index_playing >= this.nodes_draw.length) {
            //都播完了
            let drawType = Game._.get(this, '_data.type', 0);
            if (drawType == Game.Define.LuckDrawType.LuckDraw_chip_ten) {
                //碎片 没有免费的
                this.node_tendrawcost.active = true;
                this.label_tendrawfree.node.active = false;
                let itemdefine = Game.ItemModel.GetItemConfig(467);
                this.sprite_tendrawcost.SetSprite(Game._.get(itemdefine, 'pic', ''));
                this.label_tendrawcost.setText(Game.ConfigController.GetConfigById('price_data', Game.Define.PRICE_TYPE.DRAWTEN_PART).consume);
            } else {
                //金币
                if (Game.ShopModel.GetGoldDrawTenFree() > 0) {
                    // 还有免费
                    this.node_tendrawcost.active = false;
                    this.label_tendrawfree.node.active = true;
                    this.label_tendrawfree.setText('免费*' + Game.ShopModel.GetGoldDrawTenFree());
                } else {
                    //要花钱
                    this.node_tendrawcost.active = true;
                    this.label_tendrawfree.node.active = false;
                    let itemdefine = Game.ItemModel.GetItemConfig(Game.ItemDefine.SPECIALITEM_TYPE.TYPE_GOLD);
                    this.sprite_tendrawcost.SetSprite(Game._.get(itemdefine, 'pic', ''));
                    this.label_tendrawcost.setText(Game.ConfigController.GetConfigById('price_data', Game.Define.PRICE_TYPE.DRAWTEN_GOLD).consume);
                }
            }
            this.node_tenbuttons.active = true;
            return;
        }
        let node = this.nodes_draw[this.index_playing];
        node.PlayFlap();
    }
});
