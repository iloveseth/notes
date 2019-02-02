const Game = require('../../Game');
const AutoActionInterval = 2;
cc.Class({
    extends: cc.GameComponent,

    properties: {
        //上部控件
        node_map: { default: null, type: cc.Node },
        sprite_bg: { default: null, type: cc.Sprite_ },
        label_level: { default: null, type: cc.Label_ },
        label_leveldifficult: { default: null, type: cc.Label_ },
        label_levelname: { default: null, type: cc.Label_ },
        node_quickfight: { default: null, type: cc.Node },
        node_fastaddition: { default: null, type: cc.Node },
        label_additioncountdown: { default: null, type: cc.Label_ },
        spr_WelfareRed: { default: null, type: cc.Sprite_ },
        spr_GiftRed: { default: null, type: cc.Sprite_ },
        //排行数据
        label_levelrank: { default: null, type: cc.Label_ },
        label_powerrank: { default: null, type: cc.Label_ },
        label_passrank: { default: null, type: cc.Label_ },
        //战斗双方的控件
        node_battlehp: { default: null, type: require('../Node/BattleHpNode') },
        //底部控件
        node_bossbutton: { default: null, type: cc.Node },
        node_levelupbutton: { default: null, type: cc.Node },
        node_nextlevelbutton: { default: null, type: cc.Node },
        label_fightboss: { default: null, type: cc.Label_ },
        label_bosscountdown: { default: null, type: cc.Label_ },
        node_bosseffect: { default: null, type: cc.Node },
        label_tipleft: { default: null, type: cc.Label_ },
        label_tipright: { default: null, type: cc.Label_ },
        label_tipcenter: { default: null, type: cc.Label_ },
        label_levelefficiency: { default: null, type: cc.Label_ },
        label_levelcoin: { default: null, type: cc.Label_ },
        label_levelexp: { default: null, type: cc.Label_ },
        label_levelefficiencyOutLine: { default: null, type: cc.LabelOutline },
        label_levelcoinOutLine: { default: null, type: cc.LabelOutline },
        label_levelexpOutLine: { default: null, type: cc.LabelOutline },

        label_levelleveluplast: { default: null, type: cc.Label_ },
        node_autofight: { default: null, type: cc.Node },
        node_autopick: { default: null, type: cc.Node },
        node_autoequip: { default: null, type: cc.Node },
        singleitem_equip: { default: null, type: require('../Node/SingleItemNode') },
        //动画
        node_warnninganima: { default: null, type: cc.Node },
        node_bossreward: { default: null, type: cc.Node },
        node_bossrewardsrc: { default: null, type: cc.Node },
        prefab_bossreward: { default: null, type: cc.Prefab },
        node_lab_light: { default: null, type: cc.Node },

        spr_vipRed: { default: null, type: cc.Sprite_ },

        //数据
        data_level: { default: null },
        view_levelmap: { default: null },
        define_level: { default: null },
        time_enter: { default: 0 },
        loaded: { default: false },
        show_dialogue: { default: false },
        interval_auto: { default: 0 },
        equip_autoequip: { default: null },

        btn_auto_get: { default: null, type: cc.Button_ },
        spr_vip_banner: { default: null, type: cc.Sprite_ },
        Button_VIP: { default: null, type: cc.Button_ },
        btn_vip_banner: { default: null, type: cc.Button_ },

        button_shouchong: cc.Node,
        button_chongzhi: cc.Node,
        sprite_shouchongred: cc.Node,

        sprite_equip: cc.Sprite_,
        sprite_quality: cc.Sprite_,
        node_firstchargebanner: cc.Node,
        node_equip: cc.Node,
        node_roottip: cc.Node,


        sprite_autofight: { default: null, type: cc.Node },
    },
    update: function (dt) {
        this.interval_auto += dt;
        if (this.interval_auto > AutoActionInterval) {
            this._autoAction();
            this.interval_auto = 0;
        }
        this._updateBottomButton();
        this._updateFastAddition();
        this.updateShouchongState();
        this.time_firstchargebanner += dt;
        if (this.time_firstchargebanner > 300) {
            this.showFirstBanner();
        }
    },
    onEnable: function () {
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_DATAUPDATE, this, this.onRetNewFightInfo);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_SORTUPDATE, this, this._updateSortInfo);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_COUNTUPDATE, this, this._updateCountInfo);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_UPDATELEVEL, this, this.onNeedUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_BEATBOSS, this, this.onBeatBoss);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_STARTFIGHT, this, this.onStartFight);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_REDUCEHP, this, this.onReduceHp);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_ROLEDIE, this, this.onRoleDie);
        Game.NotificationController.On(Game.Define.EVENT_KEY.RED_WELFARE, this, this._updateWelfareRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.OBJECTS_REFRESH, this, this._updateAutoEquip);
        Game.NotificationController.On(Game.Define.EVENT_KEY.VIP_RET_INFO1, this, this._updateGiftRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ACTIVITY_OPEN_YUEKA,this,this.onOpenYueka);
        Game.NetWorkController.AddListener('msg.UserLevelUp', this, this._updateLevel);
        Game.NetWorkController.AddListener('msg.oneFight', this, this.onOneFight);
        Game.NetWorkController.AddListener('act.retFirstChargeAct', this, this.updateShouchongState);

        this.onRefreshLevel(false);
        Game.LevelModel.EnterLevelView();
        this._updateAutoFight();

        this.updateShouchongState();
        this.hideFirstBanner();
        this.updateBannerEquip();
    },
    onDisable: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_DATAUPDATE, this, this.onRetNewFightInfo);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_SORTUPDATE, this, this._updateSortInfo);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_COUNTUPDATE, this, this._updateCountInfo);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_UPDATELEVEL, this, this.onNeedUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_BEATBOSS, this, this.onBeatBoss);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_STARTFIGHT, this, this.onStartFight);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_REDUCEHP, this, this.onReduceHp);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_ROLEDIE, this, this.onRoleDie);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_REFRESH, this, this._updateLevel);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RED_WELFARE, this, this._updateWelfareRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.OBJECTS_REFRESH, this, this._updateAutoEquip);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.VIP_RET_INFO1, this, this._updateGiftRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ACTIVITY_OPEN_YUEKA,this,this.onOpenYueka);
        Game.NetWorkController.RemoveListener('act.retFirstChargeAct', this, this.updateShouchongState);
        Game.NetWorkController.RemoveListener('msg.UserLevelUp', this, this._updateLevel);
        Game.NetWorkController.RemoveListener('msg.oneFight', this, this.onOneFight);
        if (this.view_levelmap != null) {
            this.view_levelmap.node.destroy();
            this.view_levelmap = null;
        }
        Game.LevelModel.LeaveLevelView();
    },
    onDestroy: function () {
        this.onDisable();
    },

    showFirstBanner() {
        var msg_firstrecharge = Game.ActiveModel.msg_firstrecharge;
        var status = msg_firstrecharge.getstatus;
        if (status == 1) {//没有进行首充
            this.node_firstchargebanner.active = true;
        }
        this.time_firstchargebanner = 0;
    },

    hideFirstBanner() {
        this.node_firstchargebanner.active = false;
        this.time_firstchargebanner = 0;
    },

    onClickFirstChargeBanner() {
        this.hideFirstBanner();
    },

    onClickBannerEquip() {
        var item_config = Game.ItemModel.GetItemConfig(this.equipbaseid);
        item_config.baseid = this.equipbaseid;
        let contents = Game.ItemModel.GenerateCommonContentByObject(item_config);
        let pos = this.node_equip.parent.convertToWorldSpaceAR(this.node_equip.position);
        Game.TipPoolController.ShowItemInfo(contents, pos, this.node_roottip);
    },

    updateShouchongState() {
        var msg_firstrecharge = Game.ActiveModel.msg_firstrecharge;
        switch (msg_firstrecharge.getstatus) {
            case 0: {//已经领取
                this.button_shouchong.active = false;
                this.button_chongzhi.active = true;
                break;
            }
            case 1: {//不可领取
                this.button_shouchong.active = true;
                this.button_chongzhi.active = false;
                break;
            }
            case 2: {//可以领取
                this.button_shouchong.active = true;
                this.button_chongzhi.active = false;
                break;
            }
        }
        this.sprite_shouchongred.active = Game.ActiveModel.updateShouchongRedPoint();
    },

    updateBannerEquip() {
        var msg_firstcharge = Game.ActiveModel.msg_firstrecharge;
        var award_data = Game.ConfigController.GetConfigById('commonreward_data', msg_firstcharge.reward);
        if (!award_data) {
            return;
        }
        var equipid = award_data.equipid;
        var equip_data = Game.ConfigController.GetConfigById('object_data', equipid);
        this.sprite_equip.SetSprite(equip_data.pic);
        this.sprite_quality.SetSprite(Game.ItemModel.GetItemQualityIcon(award_data.equipcolor));

        this.equipbaseid = equipid;
    },

    //====================  按钮函数  ====================
    //关卡按钮点击
    onLevelButtonClick: function (event) {
        this.openView(Game.UIName.UI_MINILEVEL, Game.LevelModel.GetCurMapId());
    },
    //升级按钮点击
    onLevelupClick: function (event) {
        if (this.view_levelmap == null) {
            return;
        }
        Game.NetWorkController.SendProto('msg.doLevelupSelf', {});
    },
    //挑战boss按钮点击
    onFightBossClick: function (event) {
        if (this.view_levelmap == null) {
            return;
        }
        let curTime = Game.TimeController.GetCurTime();
        if (curTime - this.time_enter < Game.LevelModel.GetBossCd()) {
            return;
        }
        if (this.view_levelmap != null && this.view_levelmap.CanFightBoss()) {
            Game.NetWorkController.SendProto('newfight.NewFightBoss', {});
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TARGET_FIGHT_BOSS);
        }
    },
    //下一关按钮点击
    onNextLevelClick: function (event) {
        if (this.view_levelmap == null) {
            return;
        }
        let mapid = Game.LevelModel.GetNextMapId();
        mapid = Game.LevelModel.GetMaxMapId() >= mapid ? mapid : Game.LevelModel.GetCurMapId();
        this.openView(Game.UIName.UI_MINILEVEL, mapid);
    },
    //快速战斗
    onQuickFightClick: function () {
        this.openView(Game.UIName.UI_FASTFIGHTNODE);
    },
    //试炼按钮
    onClickOpenWelfare: function () {
        this.openView(Game.UIName.UI_WELFAREVIEW);
    },
    //自动战斗
    onAutoFight: function () {

        if (Game.LevelModel.autoing) {
            Game.LevelModel.autoing = false;
        } else {
            //修改：只要激活了月卡功能才能开启自动过图
            if(!Game.ActiveModel.monthcard_common && !Game.ActiveModel.monthcard_zhizun){
                Game.ActiveModel.sendActMsgByType(Game.Define.ActivityType.YUEKA_ACTIVITY);
                return;
            }
            if(Game.ActiveModel.monthcard_common.card_leftday == 0 && Game.ActiveModel.monthcard_zhizun.card_leftday == 0){
                //进入月卡界面
                Game.ActiveModel.sendActMsgByType(Game.Define.ActivityType.YUEKA_ACTIVITY);
                return;
            }

            // if (Game.UserModel.GetVipValue('mapauto') == 0) {
            //     if (Game.ActiveModel.checkHasFirstCharge()) {
            //         Game.VipModel.SetVipType(2);
            //         Game.NetWorkController.SendProto('msg.ReqVipInfo', { noshow: false });
            //     } else {
            //         Game.ViewController.OpenView(Game.UIName.UI_FIRSTRECHARGEVIEW, "ViewLayer");
            //     };

            //     return;
            // }

            // if (!Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_AUTOPASS)) {
            //     return;
            // }
            Game.LevelModel.autoing = true;
        }

        this._updateAutoFight();
    },

    onOpenYueka(){
        this.openView(Game.UIName.UI_ACTIVITY_MONTH_CARD_NODE,{title:true});
    },
    //自动装备
    onAutoEquip: function () {
        let thisid = Game._.get(this, 'equip_autoequip.thisid', '');
        if (thisid != null) {
            Game.NetWorkController.SendProto('msg.PutOnEquip', {
                thisid: thisid,
                packtype: Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP,
            });
        }
    },
    onClickFirstRecharge() {
        this.hideFirstBanner();
        Game.ActiveModel.sendActMsgByType(Game.Define.ActivityType.FIRSTRECHARGE_ACTIVITY);
    },
    onClickCharge() {
        if (Game.ActiveModel.checkHasFirstCharge()) {
            Game.VipModel.SetVipType(2);
            Game.NetWorkController.SendProto('msg.ReqVipInfo', { noshow: false });
        } else {
            Game.ViewController.OpenView(Game.UIName.UI_FIRSTRECHARGEVIEW, "ViewLayer");
        };
    },
    onClickDailyGift() {
        Game.ActiveModel.sendActMsgByType(Game.Define.ActivityType.DAILYGIFT_ACTIVITY);
    },

    onClickAutoGetLab() {
        if (Game.ActiveModel.checkHasFirstCharge()) {
            Game.VipModel.SetVipType(2);
            Game.NetWorkController.SendProto('msg.ReqVipInfo', { noshow: false });
        } else {
            Game.ViewController.OpenView(Game.UIName.UI_FIRSTRECHARGEVIEW, "ViewLayer");
        };
    },

    onClickVipIcon() {
        Game.VipModel.SetVipType(1);
        Game.NetWorkController.SendProto('msg.ReqVipInfo', { noshow: false });
        this.spr_vip_banner.node.active = false;
    },

    onClickVipBanner() {
        Game.VipModel.SetVipType(1);
        Game.NetWorkController.SendProto('msg.ReqVipInfo', { noshow: false });
        this.spr_vip_banner.node.active = false;
    },

    onClickFirstChargeBanner() {
        this.hideFirstBanner();
        Game.ActiveModel.sendActMsgByType(Game.Define.ActivityType.FIRSTRECHARGE_ACTIVITY);
    },

    //====================  回调函数  ====================
    onNeedUpdate: function (mapid) {
        this._updateAutoEquip();
        this.node.runAction(cc.sequence([
            cc.delayTime(0.5),
            cc.callFunc(function () {
                this.onRefreshLevel(true, mapid);
            }, this)
        ]))
    },
    onOneFight: function (msgid, data) {
        //打boss消息回复
        //先判断能不能打
        if (this.view_levelmap != null) {
            let guide = Game.GuideController.GetTrackGuide();
            if (guide != 0) {
                cc.eventManager.pauseTarget(cc.director.getScene(), true);
            }
            this.node_warnninganima.active = true;
            this.view_levelmap.FightBoss(Game._.get(data, 'result_type', false));
            this._updatePkInfo(true);
        }
    },
    onRetNewFightInfo: function () {
        if (this.loaded) {
            return;
        }
        this.loaded = true;
        this.data_level = Game.LevelModel.levelInfo;
        this.define_level = Game.ConfigController.GetConfigById('newmap_data', Game.LevelModel.GetCurMapId());
        if (this.define_level == null) {
            cc.error('[严重错误] 没有该关卡的配置 -> ' + Game.LevelModel.GetCurMapId());
            return;
        }
        if (this.show_dialogue) {
            Game.GuideController.ShowLevelDialogue(Game.LevelModel.GetCurMapId());
        }
        //更新界面
        this._updateLevelMap();
        this._updateLevelInfo();
        this._updateQuickFight();
        this._updateAutoEquip();
        this._updateGiftRed();
        this.node.stopAllActions();
        this.node.runAction(cc.sequence([
            cc.delayTime(1),
            cc.callFunc(function () {
                // cc.log("LevelView onRetNewFightInfo() Emit EFFECT_CLOUDMASK");
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.EFFECT_CLOUDMASK, cc.WrapMode.Reverse);
            })
        ]));

        let autopick = Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_AUTOPICK);
        let autopass = Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_AUTOPASS);
        if (Game.GlobalModel.isMapGo) {
            cc.log("vipbanner,过图调用");
            //vipbanner,过图调用
            if (Game.UserModel.GetVipValue('mapauto') == 0 && autopass && !Game.GlobalModel.vip_2_is_show) {
                this.spr_vip_banner.node.active = true;
                Game.GlobalModel.vip_2_is_show = true;
                this.spr_vip_banner.SetSprite("Image/UI/LevelView/image_VIP2");
                Game.GlobalModel.vipBannerHasShow = true;
            } else if (Game.UserModel.GetVipValue('maploot') == 0 && autopick && !Game.GlobalModel.vip_1_is_show) {
                this.spr_vip_banner.node.active = true;
                Game.GlobalModel.vip_1_is_show = true;
                this.spr_vip_banner.SetSprite("Image/UI/LevelView/image_VIP1");
                Game.GlobalModel.vipBannerHasShow = true;
            };

            //首冲banner
            let limitConfig = Game.ConfigController.GetConfigById('levellimit_data', 79);
            let limit = Game._.get(limitConfig, "limit", 0);
            let curMapid = Game.LevelModel.GetCurMapId();
            if (curMapid == limit) {
                this.showFirstBanner();
            };
        } else {
            cc.log("vipbanner,非过图调用");
            //vipbanner,非过图调用
            if (Game.GlobalModel.vipBannerHasShow) {
            } else {
                if (Game.UserModel.GetVipValue('maploot') == 0 && autopick) {
                    Game.GlobalModel.vipBannerHasShow = true;
                    this.spr_vip_banner.node.active = true;
                    this.spr_vip_banner.SetSprite("Image/UI/LevelView/image_VIP1");
                    Game.GlobalModel.vip_1_is_show = true;
                } else if (Game.UserModel.GetVipValue('maploot') != 0 && Game.UserModel.GetVipValue('mapauto') == 0 && autopass) {
                    Game.GlobalModel.vipBannerHasShow = true;
                    this.spr_vip_banner.node.active = true;
                    this.spr_vip_banner.SetSprite("Image/UI/LevelView/image_VIP2");
                    Game.GlobalModel.vip_2_is_show = true;
                } else if (Game.UserModel.GetVipValue('maploot') != 0 && Game.UserModel.GetVipValue('mapauto') != 0) {
                    this.spr_vip_banner.node.active = false;
                    Game.GlobalModel.vip_1_is_show = true;
                    Game.GlobalModel.vip_2_is_show = true;
                }
            };
        };

    },
    onRefreshLevel: function (playcloudmast, mapid = null) {
        // cc.log("LevelView onRefreshLevel()");
        this.loaded = false;

        //不显示vipbanner
        this.spr_vip_banner.node.active = false;


        if (playcloudmast) {
            // cc.log("LevelView onRefreshLevel() Emit EFFECT_CLOUDMASK");
            Game.GlobalModel.isMapGo = true;
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.EFFECT_CLOUDMASK, cc.WrapMode.Normal);
        } else {
            Game.GlobalModel.isMapGo = false;
        };

        this.show_dialogue = false;
        if (mapid != null && mapid == Game.LevelModel.GetMaxMapId() && mapid > Game.LevelModel.GetTopMapId()) {
            this.show_dialogue = true;
        }
        Game.LevelModel.ClearEnemy();
        //播放云层动画
        this._updateLevel(true);
        this._updatePkInfo(false);
        this._updateWelfareRed();
        this._updateGiftRed();
        this.node.stopAllActions();
        this.node.runAction(cc.sequence([
            cc.delayTime(0.5),
            cc.callFunc(function () {
                //发消息
                if (mapid != null) {
                    Game.NetWorkController.SendProto('newfight.NewChangeMap', { mapid: mapid });
                } else {
                    // cc.log("LevelView onRefreshLevel()  newfight.ReqNewFightInfo");
                    Game.NetWorkController.SendProto('newfight.ReqNewFightInfo', {});
                }
                Game.NetWorkController.SendProto('msg.reqFightCount', {});
            }, this)
        ]));

    },
    onBeatBoss: function () {
        //生成奖励并播放动画
        cc.eventManager.resumeTarget(cc.director.getScene(), true);
        this._updatePkInfo(false);
        Game.NetWorkController.SendProto('newfight.reqBossReward', {});
        let worldPoss = this.view_levelmap.GetBossRewardsWorldPosition();
        //随机几个
        let targetWorldPos = this.node_bossbutton.parent.convertToWorldSpaceAR(this.node_bossbutton.position);
        let count = Game.Tools.GetRandomInt(worldPoss.length - 3, worldPoss.length);
        for (let i = 0; i < count; i++) {
            let node = cc.instantiate(this.node_bossrewardsrc.children[Game.Tools.GetRandomInt(0, this.node_bossrewardsrc.childrenCount)]);
            node.position = this.node_bossreward.convertToNodeSpaceAR(worldPoss[i]);
            this.node_bossreward.addChild(node);
            node.runAction(cc.sequence([
                cc.delayTime(Math.random() * 0.6),
                cc.moveTo(0.5, this.node_bossreward.convertToNodeSpaceAR(targetWorldPos)).easing(cc.easeIn(4)),
                cc.removeSelf(true)
            ]));
        }
        //弹提示
        let rewardnode = cc.instantiate(this.prefab_bossreward);
        let bossRewardNode = rewardnode.getComponent('BossRewardNode');
        bossRewardNode.SetInfo(Game.LevelModel.GetCurMapId());
        Game.GuideController.StartGuide({
            id: -1,
            next: 0,
            isleft: 1,
            sync: 0,
            delay: 0.2,
            mask: 0,
        }, rewardnode);
    },
    onStartFight: function (isboss) {
        if (isboss && this.node_warnninganima.active) {
            this.node_warnninganima.active = false;
        }
    },
    onReduceHp: function (hitnpc, maxhp, curhp) {
        if (hitnpc) {
            this.node_battlehp.SetNpcHp(curhp, maxhp);
        } else {
            this.node_battlehp.SetRoleHp(curhp, maxhp);
        }
    },
    onRoleDie: function (round, maxhp, curhp, misstimes) {
        cc.eventManager.resumeTarget(cc.director.getScene(), true);
        this._updatePkInfo(false);
        this.openMaskView(Game.UIName.UI_FIGHTFAIL, {
            round: round,
            lasthp: curhp + '(' + ((curhp * 100 / maxhp).toFixed(2)) + '%)',
            miss: misstimes
        });
        let guide = Game.GuideController.GetTrackGuide();
        if (guide != 0) {
            Game.GuideController.StartGuideWithId(guide, true);
        } else {
            this.showFirstBanner();
        };
        Game.LevelModel.autoing = false;
        this._updateAutoFight();
    },
    //====================  更新函数  ====================
    _updateLevelMap: function () {
        if (this.view_levelmap != null) {
            this.view_levelmap.node.destroy();
            this.view_levelmap = null;
        }
        this.node_warnninganima.active = false;
        this.time_enter = Game.TimeController.GetCurTime();
        this.sprite_bg.SetSprite(this.define_level.bg);
        //创建新的场景
        cc.loader.loadRes('Prefab/LevelMap/' + this.define_level.newmapid, cc.Prefab, function (err, prefab) {
            if (err) {
                cc.error('[严重错误] 加载prefab -> ' + err);
            } else {
                let node = cc.instantiate(prefab);
                this.view_levelmap = node.getComponent('LevelMapView');
                this.view_levelmap.SetLevelConfig(this.define_level);
                this.node_map.addChild(node)
            }
        }.bind(this));
    },
    _updateLevelInfo: function () {
        let disc = this.define_level.disc;
        let infos = disc.split(' ');
        this.label_leveldifficult.setText(infos[0]);
        this.label_levelname.setText(infos[2]);
        this.node_autopick.active = Game.UserModel.GetVipValue('maploot') == 0 && Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_AUTOPICK);
        this.node_lab_light.active = this.node_autopick.active;
    },
    _updateLevel: function (nonAnima) {
        this.label_level.setText(Game.UserModel.GetLevelDesc(Game.UserModel.GetLevel()));
        Game.AudioController.PlayEffect('Audio/UI/UI_LevelUp');
        if (!nonAnima && this.view_levelmap != null) {
            this.view_levelmap.PlayLevelupAnima();
        }
    },
    _updateQuickFight: function () {
        this.node_quickfight.active = Game.UserModel.GetVipValue('quickfight') > 0;
    },
    _updateSortInfo: function () {
        this.label_levelrank.setText(Game.LevelModel.GetLevelSort());
        this.label_powerrank.setText(Game.LevelModel.GetFightSort());
        this.label_passrank.setText(Game.LevelModel.GetMapSort());
    },
    _updatePkInfo: function (show) {
        if (!show) {
            this.node_battlehp.node.active = false;
        } else {
            let bossconf = Game.ConfigController.GetConfigById('newboss_data', Game._.get(this, 'define_level.boss', 0));
            this.node_battlehp.node.active = true;
            let role = {
                face: Game.UserModel.GetProfessionIcon(Game.UserModel.GetUserOccupation()),
                name: Game.UserModel.GetUserName(),
                hp: Game.UserModel.GetUserBaseInfo().hp,
                mp: Game.UserModel.GetUserBaseInfo().mp
            };
            let npc = {
                face: Game.EntityController.GetBossHeadPath(bossconf.bossicon),
                name: bossconf.name,
                hp: Game.UserModel.GetUserBaseInfo().minatt * 6,
                mp: 100
            }
            this.node_battlehp.SetInfo(role, npc);
        }
    },
    _updateCountInfo: function () {
        this.label_levelefficiency.setText(Game.LevelModel.GetLevelEffectStr());
        this.label_levelcoin.setText(Game.LevelModel.GetCoinSpeedStr());
        this.label_levelexp.setText(Game.LevelModel.GetExpSpeedStr());
        this.label_levelleveluplast.setText(Game.LevelModel.GetLevelupCountDown());
        this.label_tipright.setText('');
        let effect = Game.LevelModel.GetLevelEffect();
        if (effect < 0.9) {
            //红了
            this.label_levelefficiency.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
            this.label_levelefficiencyOutLine.color = Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
            this.label_levelcoin.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
            this.label_levelcoinOutLine.color = Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
            this.label_levelexp.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
            this.label_levelexpOutLine.color = Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
            this.label_tipleft.setText('效率低于90%无法过关');
        } else if (effect >= 0.9 && effect < 1) {
            this.label_levelefficiency.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Yellow);
            this.label_levelefficiencyOutLine.color = Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Yellow);
            this.label_levelcoin.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Yellow);
            this.label_levelcoinOutLine.color = Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Yellow);
            this.label_levelexp.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Yellow);
            this.label_levelexpOutLine.color = Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Yellow);
            this.label_tipleft.setText('效率不足100%有几率挑战失败');
        } else {
            this.label_levelefficiency.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green);
            this.label_levelefficiencyOutLine.color = Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Green);
            this.label_levelcoin.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green);
            this.label_levelcoinOutLine.color = Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Green);
            this.label_levelexp.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green);
            this.label_levelexpOutLine.color = Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Green);
            this.label_tipleft.setText('');
        }
        if (Game.GuideController.isFirstTooBossMapGuide(Game.LevelModel.GetCurMapId()) && Game.LevelModel.GetCurMapId() == Game.LevelModel.GetMaxMapId()) {
            this.label_tipleft.setText('效率低于90%无法过关');
            this.label_levelefficiency.setText('50%');
            this.label_levelcoin.setText(Game.LevelModel.GetCoinSpeedStrHalf());
            this.label_levelexp.setText(Game.LevelModel.GetExpSpeedStrHalf());
            this.label_levelleveluplast.setText(Game.LevelModel.GetLevelupCountDownDouble());
            this.label_levelefficiency.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
            this.label_levelefficiencyOutLine.color = Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
            this.label_levelcoin.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
            this.label_levelcoinOutLine.color = Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
            this.label_levelexp.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
            this.label_levelexpOutLine.color = Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
        }
    },
    _updateBottomButton: function () {
        if (Game.UserModel.GetExp() >= Game.UserModel.GetLevelupExp()) {
            this.node_levelupbutton.active = true;
            this.node_bossbutton.active = false;
            this.node_nextlevelbutton.active = false;
        } else {
            if (Game.LevelModel.GetMaxMapId() == Game.LevelModel.GetCurMapId()) {
                this.node_levelupbutton.active = false;
                this.node_bossbutton.active = true;
                this.node_nextlevelbutton.active = false;
                let button = this.node_bossbutton.getComponent(cc.Button);
                let curTime = Game.TimeController.GetCurTime();
                if (curTime - this.time_enter < Game.LevelModel.GetBossCd()) {
                    this.label_bosscountdown.setText(Game.LevelModel.GetBossCd() - (curTime - this.time_enter));
                    this.label_fightboss.setText('冷却中');
                    this.node_bosseffect.active = false;
                    button.interactable = false;
                } else {
                    this.node_bosseffect.active = true;
                    button.interactable = true;
                    this.label_bosscountdown.setText('');
                    if (this.node_battlehp.node.active) {
                        this.label_fightboss.setText('挑战中');
                    } else {
                        this.label_fightboss.setText('挑战boss');
                    }
                }
            } else {
                this.node_levelupbutton.active = false;
                this.node_bossbutton.active = false;
                this.node_nextlevelbutton.active = true;
                let nextLevelID = Game.LevelModel.GetNextMapId();
                if (nextLevelID == 0) {
                    this.node_nextlevelbutton.active = false;
                };
            }
        }
    },
    _updateFastAddition: function () {
        if (this.node_quickfight.active) {
            //这时候才有可能有加成
            if (Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_FASTFIGHTBUFF) > 0) {
                this.node_fastaddition.active = true;
                this.label_additioncountdown.setText(Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_FASTFIGHTBUFF, 'm:s'));
            } else {
                this.node_fastaddition.active = false;
            }
        }
    },

    _updateWelfareRed() {
        //试炼任务
        let isTargetRed = Game.WelfareModel.updateWelfareRedPoint();
        this.spr_WelfareRed.node.active = isTargetRed;
    },
    _updateGiftRed() {
        //每日礼包
        let hasBuyGift = Game.ActiveModel.hasBuyFirstDailygift();
        this.spr_GiftRed.node.active = !hasBuyGift;

        this._updateVipRed();
    },
    _updateAutoFight: function () {
        this.sprite_autofight.active = false;
        if (Game.UserModel.GetViplevel() >= 1 || Game.GuideController.IsFunctionOpen(72)) {
            this.sprite_autofight.active = true;
        }
        this.node_autofight.active = Game.LevelModel.autoing;
    },
    _updateAutoEquip: function () {
        this.equip_autoequip = null;
        if (Game.UserModel.GetLevel() < 50 && Game.LevelModel.GetMaxMapId() > 10002) {
            let equipTypes = Game.EquipModel.FindUserEquipTypes();
            for (let i = 0; i < equipTypes.length; i++) {
                let type = equipTypes[i];
                let curEquip = Game.EquipModel.GetUseEquipByTypes(Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, type)
                if (curEquip == null) {
                    let targetEquips = Game.EquipModel.GetNoEquipsByType(type);
                    if (targetEquips.length > 0) {
                        this.equip_autoequip = targetEquips[0];
                        break;
                    }
                }
            }
        }
        this.node_autoequip.active = (this.equip_autoequip != null);
        if (this.equip_autoequip != null) {
            this.singleitem_equip.updateView(this.equip_autoequip, function () { });
        }
    },

    _updateVipRed() {
        //vip
        let hasRed = Game.VipModel.checkVipGiftCanBuy()
        this.spr_vipRed.setVisible(hasRed);
    },

    //====================  私有函数  ====================
    _autoAction: function () {
        //自动操作
        // if (Game.UserModel.GetVipValue('mapauto') == 0 || !Game.LevelModel.autoing || !Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_AUTOPASS)) {
        //     return;
        // }
        if (Game.UserModel.GetVipValue('mapauto') == 0 || !Game.LevelModel.autoing) {
            return;
        }
        if (this.node_levelupbutton.active) {
            //自动升级
            this.onLevelupClick();
        } else if (this.node_nextlevelbutton.active) {
            //跳下一关
            let nextid = Game.LevelModel.GetNextMapId();
            if (nextid != 0) {
                this.onRefreshLevel(true, nextid);
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TOUCH_END, null);
            }
        } else if (this.node_bossbutton.active) {
            let button = this.node_bossbutton.getComponent(cc.Button);
            if (button.interactable && !this.node_battlehp.node.active) {
                //自动打boss
                this.onFightBossClick();
            }
        }
    },
});
