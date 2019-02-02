const Game = require('../../Game');
const TouchInterval = 0.2;
cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_mainmap: { default: null, type: require('../Node/MainMapNode') },
        sprite_bg: { default: null, type: cc.Sprite_ },
        sprite_map: { default: null, type: cc.Sprite_ },
        sprite_head: { default: null, type: cc.Sprite_ },
        label_name: { default: null, type: cc.Label_ },
        sprite_profession: { default: null, type: cc.Sprite_ },
        name_profession: { default: null, type: cc.Label_ },
        label_level: { default: null, type: cc.Label_ },
        label_country: { default: null, type: cc.Label_ },
        label_union: { default: null, type: cc.Label_ },
        nodes_ice: { default: [], type: [cc.Node] },
        nodes_fire: { default: [], type: [cc.Node] },
        character_me: { default: null },
        characters_npc: { default: {} },
        time_update: { default: 0 },

        node_mailredpoint: { default: null, type: cc.Node },
        node_activity: { default: null, type: cc.Node },

        sprite_septRed: { default: null, type: cc.Sprite_ },
        spr_DailySignRed: { default: null, type: cc.Sprite_ },
        spr_SevenLogin: { default: null, type: cc.Sprite_ },
        spr_DigRed: { default: null, type: cc.Sprite_ },
        spr_zahuoShopRed: { default: null, type: cc.Sprite_ },
        sprite_taskRed: { default: null, type: cc.Sprite_ },
        spr_vip_num_left: { default: null, type: cc.Sprite_ },
        spr_vip_num_right: { default: null, type: cc.Sprite_ },
        spr_FairyShopRed: { default: null, type: cc.Sprite_ },
        spr_miniMapRed: { default: null, type: cc.Sprite_ },
        interval_touch: { default: 0 },
        spr_activityRed: { default: null, type: cc.Sprite_ },
        spr_fightSortRed: { default: null, type: cc.Sprite_ },
        btn_share: { default: null, type: cc.Button_ },
        spr_shareRed: { default: null, type: cc.Sprite_ },
        btn_collect: { default: null, type: cc.Button_ },
        spr_collectRed: { default: null, type: cc.Sprite_ },
        spr_noticered: cc.Node,

        button_gm: { default: null, type: cc.Button_ },
        button_chongbang: { default: null, type: cc.Button_ },

        spr_vipRed: { default: null, type: cc.Sprite_ },

        button_shouchong: cc.Node,
        sprite_shouchongred: cc.Node,

        //分步加载
    },

    onLoad() {
        this.button_gm.node.active = CC_DEBUG;
    },

    updateShouchongState(){
        var msg_firstrecharge = Game.ActiveModel.msg_firstrecharge;
        switch(msg_firstrecharge.getstatus){
            case 0:{//已经领取
                this.button_shouchong.active = false;
                break;
            }
            case 1:{//不可领取
                this.button_shouchong.active = true;
                break;
            }
            case 2:{//可以领取
                this.button_shouchong.active = true;
                break;
            }
        }
        this.sprite_shouchongred.active = Game.ActiveModel.updateShouchongRedPoint();
    },

    onEnable() {
        this._updateView();
        this._updateNoticeRed();
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_REFRESH, this, this._updateTitleInfo);
        Game.NotificationController.On(Game.Define.EVENT_KEY.MAIL_DETAIL_REFRESH, this, this._updateMailRedPoint);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FUNCTION_OPEN, this, this._updateOpenFuncRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.RED_DAILY_SIGN, this, this._updateDailySignRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.RED_DIG, this, this._updateDigRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.RED_SEVEN_LOGIN, this, this._updateSevenLoginRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.RANDOMPLAYER_UPDATE, this, this.onRandomPlayerUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TASK_INFO_REFRESH, this, this._updateTaskRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.UPDATE_FAIRYRED, this, this._updateFairyRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FUNCTION_OPEN, this, this._updateFunctionOpen);
        Game.NotificationController.On(Game.Define.EVENT_KEY.VIP_NOTIFY_VIP_EXP, this, this._updateViplevel);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SHOP_DATAUPDATE, this, this._updateShopRedDot);
        Game.NotificationController.On(Game.Define.EVENT_KEY.RED_ACTIVITY, this, this._updateActivityRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.RED_FIGHT_SORT, this, this._updateActFightSort);
        Game.NotificationController.On(Game.Define.EVENT_KEY.GET_SHARE_REWARD, this, this._updateShareBtn);
        Game.NotificationController.On(Game.Define.EVENT_KEY.GET_COLLECT_REWARD, this, this._updateCollectBtn);
        Game.NotificationController.On(Game.Define.EVENT_KEY.VIP_RET_INFO1, this, this._updateVipRed);
        Game.NetWorkController.AddListener('act.retFirstChargeAct', this, this.updateShouchongState);

        Game.NotificationController.On(Game.Define.EVENT_KEY.NEW_NOTICE,this,this._updateNoticeRed);
        // Game.NetWorkController.AddListener('lvltask.retTaskDetail', this, this.onRetTaskDetail);
        //请求我国的其他npc
        Game.NetWorkController.SendProto('msg.reqRandomUser', { type: 0, country: Game.UserModel.GetCountry() });
    },

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_REFRESH, this, this._updateTitleInfo);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MAIL_DETAIL_REFRESH, this, this._updateMailRedPoint);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FUNCTION_OPEN, this, this._updateOpenFuncRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RED_DAILY_SIGN, this, this._updateDailySignRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RED_DIG, this, this._updateDigRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RED_SEVEN_LOGIN, this, this._updateSevenLoginRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RANDOMPLAYER_UPDATE, this, this.onRandomPlayerUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.TASK_INFO_REFRESH, this, this._updateTaskRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FUNCTION_OPEN, this, this._updateFunctionOpen);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.UPDATE_FAIRYRED, this, this._updateFairyRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.VIP_NOTIFY_VIP_EXP, this, this._updateViplevel);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SHOP_DATAUPDATE, this, this._updateShopRedDot);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RED_ACTIVITY, this, this._updateActivityRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RED_FIGHT_SORT, this, this._updateActFightSort);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GET_SHARE_REWARD, this, this._updateShareBtn);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GET_COLLECT_REWARD, this, this._updateCollectBtn);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.VIP_RET_INFO1, this, this._updateVipRed);
        
        Game.NetWorkController.RemoveListener('act.retFirstChargeAct', this, this.updateShouchongState);

        Game.NotificationController.Off(Game.Define.EVENT_KEY.NEW_NOTICE,this,this._updateNoticeRed);
        // Game.NetWorkController.RemoveListener('lvltask.retTaskDetail', this, this.onRetTaskDetail);
        this.character_me = null;
        this.characters_npc = {};
        Game.AsyncGenerator.StopGenerate(Game.AsyncGenerator.Define.MAINVIEW_CHARACTER);
    },
    update: function (dt) {
        this.interval_touch += dt;
        this._updateNpcTarget(dt);
        this.updateShouchongState();
    },
    //====================  按钮回调  ====================
    onTouchMail() {
        this.openView(Game.UIName.UI_MAILVIEW);
    },
    onClickGm() {
        this.openMaskView(Game.UIName.UI_GMVIEW);
    },
    onClickOpenDigg() {
        Game.GlobalModel.SetIsOpenDigView(true);
        Game.NetWorkController.SendProto('msg.reqAllDigStatus', {});
    },
    onClickOpenForge() {
        this.openView(Game.UIName.UI_FORGEVIEW);
    },
    onClickOpenRank() {
        this.openView(Game.UIName.UI_RANKING_LIST_NODE);
    },
    onClickOpenShop() {
        this.openView(Game.UIName.UI_SHOPVIEW, Game.Define.SHOPTAB.Tab_NB);
    },
    onClickOpenTask() {
        Game.TaskModel.isOpenDailyTask = true;
        Game.NetWorkController.SendProto('border.reqQuestInfo', {});
        this.sprite_taskRed.node.active = false;
    },
    onClickOpenPersonalSet() {
        this.openView(Game.UIName.UI_PERSONAL_SETTING_VIEW);
    },
    onClickOpenJJC() {
        this.openView(Game.UIName.UI_GYM_FIGHT_LIST_VIEW);
    },
    onClickOpenWelfare() {
        this.openView(Game.UIName.UI_WELFAREVIEW);
    },
    onClickOpenTargetTask() {
        // Game.NetWorkController.SendProto('lvltask.reqTaskDetail', {});
    },
    onClickOpenService() {
        // this.openView(Game.UIName.UI_CHATVIEW);
        Game.ActiveModel.updateActiveInfo();
        Game.ActiveModel.setActPanelType(1);
        if (Game.ActiveModel.getActivityNum() >= 1) {
            Game.ActiveModel.sendActMsgByType(Game.ActiveModel.getActivityTypeByIndex(0));
        } else {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "当前没有开启的活动");
        }
    },
    onClickOpenSept() {
        if (Game.UserModel.GetSeptname() != '') {
            Game.NetWorkController.SendProto('msg.reqMySeptInfoNew', {});
        } else {
            this.openView(Game.UIName.UI_SEPTJOINVIEW);
        }
        this.sprite_septRed.node.active = false;
        this._updateMiniMapRed(false);
        Game.GuideController.RemoveFirstOpenFunc(Game.Define.FUNCTION_TYPE.TYPE_SEPT);
    },
    onClickOpenDailySign() {
        this.openView(Game.UIName.UI_DAILY_SIGN_VIEW);
    },
    omClickOpenActivity() {
        Game.ActiveModel.updateActiveInfo();
        Game.ActiveModel.setActPanelType(2);
        if (Game.ActiveModel.getActivityNum() >= 1) {
            Game.GlobalModel.needOpenActivityHome = true;
            Game.GlobalModel.needChangeActiveShowNode = true;
            Game.ActiveModel.sendActMsgByType(Game.ActiveModel.getActivityTypeByIndex(0));
        } else {
            Game.NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, "当前没有开启的活动");
        }

        // Game.ActiveModel.sendActMsgByType(Game.Define.ActivityType.COSTSORT_ACTIVITY);

    },
    onClickOpenSevenLogin() {
        Game.ActiveModel.sendActMsgByType(Game.Define.ActivityType.LOGIN_ACTIVITY);
    },
    onClickCountryClub() {
        this.showTips('功能暂未开放,敬请期待!');
    },
    onClickOpenVipView() {
        Game.VipModel.SetVipType(1);
        Game.NetWorkController.SendProto('msg.ReqVipInfo', { noshow: false });
    },
    onTouchFairyShop() {
        this.openView(Game.UIName.UI_SHOPVIEW, Game.Define.SHOPTAB.Tab_Pet);
    },
    onTouchStart: function (event) {
        if (this.interval_touch < TouchInterval) {
            return;
        }
        this.interval_touch = 0;
        this.node_mainmap.SetTargetPos(this._getCharacterMe().node.uuid, event.getLocation(), true);
    },
    onRetTaskDetail(msgid, msg) {
        if (msg.taskid != 0) {
            this.openView(Game.UIName.UI_TARGET_TASK_NODE, msg);
        };
    },
    onClickMiniMap: function () {
        this.openView(Game.UIName.UI_MAINMINI);
    },
    onClickRecharge() {
        if(Game.ActiveModel.checkHasFirstCharge()){
            Game.VipModel.SetVipType(2);
            Game.NetWorkController.SendProto('msg.ReqVipInfo', { noshow: false });
        }else{
            Game.ViewController.OpenView(Game.UIName.UI_FIRSTRECHARGEVIEW, "ViewLayer");
        };
    },
    onClickFirstRecharge() {
        Game.ActiveModel.sendActMsgByType(Game.Define.ActivityType.FIRSTRECHARGE_ACTIVITY);
    },
    onClickDailyGift() {
        Game.ActiveModel.sendActMsgByType(Game.Define.ActivityType.DAILYGIFT_ACTIVITY);
    },
    onClickFightRank() {
        Game.ActiveModel.sendActMsgByType(Game.Define.ActivityType.FIGHTRANK_ACTIVITY);
    },

    onClickOpenShare() {
        this.openView(Game.UIName.UI_REWARD_SHARE_NODE);
    },
    onClickOpenCollect(){
        this.openView(Game.UIName.UI_REWARD_COLLECT_NODE);
    },

    onClickCharacter: function (uuid) {
        let charid = Game._.get(this, ['characters_npc', uuid, 'charid'], 0);
        let player = Game._.find(Game.GlobalModel.randomPlayers, { charid: charid });
        if (player != null) {
            this.openView(Game.UIName.UI_TIPOTHERCHARVIEW, player);
        }
    },
    onRandomPlayerUpdate: function () {
        //原来有就用原来的，原来没就创建
        let players = Game.GlobalModel.randomPlayers;
        let shouldGeneratePlayers = [];
        let showCount = 0;
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            let find = false;
            Game._.forIn(this.characters_npc, function (value, key) {
                showCount++;
                if (value != null && value.charid == player.charid) {
                    find = true;
                    return false;
                }
            });
            if (!find) {
                shouldGeneratePlayers.push(player);
            }
        }
        let count = 10 - showCount;
        let list = Game._.slice(shouldGeneratePlayers, 0, count);
        Game.AsyncGenerator.StartGenerate(Game.AsyncGenerator.Define.MAINVIEW_CHARACTER, 0.1, list, function (player) {
            let pos = this.node_mainmap.RandomSomePosition(1)[0];
            let character = this.node_mainmap.CreateNpcCharacter({
                pos: pos,
                name: Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetOccupation(Game._.get(player, 'face', 0))),
                showAutoFight: false,
                charName: '[' + Game.UserModel.GetCountryShortName(Game._.get(player, 'country', 0)) + ']' + Game._.get(player, 'name', ''),
                nameColor: Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
                nameOutlineColor: Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
                hp: (Game._.get(player, 'fight', 1000) / 2),
                clickFunc: this.onClickCharacter.bind(this)
            });
            character.charid = Game._.get(player, 'charid', 0);
            this.characters_npc[character.node.uuid] = character;
        }.bind(this), true);
    },
    //====================  更新接口  ====================
    _updateTitleInfo: function () {
        this.sprite_head.SetSprite(Game.UserModel.GetProfessionIcon(Game.UserModel.GetUserOccupation()));
        this.label_name.setText(Game.UserModel.GetUserName());
        this.sprite_profession.SetSprite(Game.UserModel.GetJobIcon(Game.UserModel.GetUserOccupation()));
        this.name_profession.setText(Game.UserModel.GetJobName(Game.UserModel.GetUserOccupation()));
        this.label_level.setText(Game.UserModel.GetLevelDesc(Game.UserModel.GetLevel()));
        this.label_country.setText(Game.UserModel.GetCountryShortName(Game.UserModel.GetCountry()));
        this.label_union.setText(Game.UserModel.GetSeptname());

        //目标任务屏蔽
        // if (Game.UserModel.targetTaskId == 0) {
        //     this.node_activity.getChildByName("Button_mubiao").active = false;
        // };

        var btnFairyShop = this.node_activity.getChildByName('Button_Fairy_zhaohuan');
        if (btnFairyShop) {
            btnFairyShop.active = Game.UserModel.getUnlockById(Game.Define.Unlock_Type.TYPE_FAIRY);
        }
    },
    _updateViplevel() {
        let viplevel = Game.UserModel.GetViplevel();
        if (viplevel >= 10) {
            this.spr_vip_num_left.node.active = true;
            this.spr_vip_num_right.node.active = true;
            let path_1 = "Image/UI/Common/chongzhi_" + Math.floor(viplevel / 10);
            let path_2 = "Image/UI/Common/chongzhi_" + (viplevel % 10);
            this.spr_vip_num_left.SetSprite(path_1);
            this.spr_vip_num_right.SetSprite(path_2);
        } else {
            this.spr_vip_num_left.node.active = false;
            this.spr_vip_num_right.node.active = true;
            let path_temp = "Image/UI/Common/chongzhi_" + viplevel;
            this.spr_vip_num_right.SetSprite(path_temp);
        };
    },
    _updateMapElement: function () {
        let country = Game.UserModel.GetCountry();
        for (let i = 0; i < this.nodes_ice.length; i++) {
            let node = this.nodes_ice[i];
            node.active = (country != 1);
        }
        for (let i = 0; i < this.nodes_fire.length; i++) {
            let node = this.nodes_fire[i];
            node.active = (country == 1);
        }
        this.sprite_bg.SetSprite('Image/Map/map/' + (country == 1 ? 'bg_firecity' : 'bg_icecity'));
        this.sprite_map.SetSprite('Image/Map/map/' + (country == 1 ? 'image_firecity' : 'image_icecity'));
    },
    _updateShareBtn: function () {
        let isGetRewarded = Game.MainUserModel.GetQzoneShare();
        this.btn_share.node.active = isGetRewarded == 0;
        this.checkChannelUpdateBtn();
    },
    _updateCollectBtn: function () {
        let isGetRewarded = Game.MainUserModel.GetQzoneCollect();
        this.btn_collect.node.active = isGetRewarded == 0;
        this.checkChannelUpdateBtn();
    },

    _updateNoticeRed(){
        if(Game.UserModel.newnotice){
            this.spr_noticered.active = Game.UserModel.newnotice;
        }
        else{
            this.spr_noticered.active = false;
        }
        
    },

    checkChannelUpdateBtn(){
        //非玩吧渠道屏蔽分享，收藏功能
        if(Game.ServerUtil.channel != Game.Define.Channel_Type.Qzone_NotIos && Game.ServerUtil.channel != Game.Define.Channel_Type.Qzone_Ios){
            this.btn_share.node.active = false;
            this.btn_collect.node.active = false;
        };
    },

    _updateView: function () {
        this._updateTitleInfo();
        this._updateViplevel();
        this._updateMapElement();
        
        this._updateChannel();
        this._updateShareBtn();
        this._updateCollectBtn();
        this._updateMailRedPoint();
        this._updateDailySignRed();
        this._updateSevenLoginRed();


        this._updateFairyRed();
        // -----------------地图红点-------------
        this._updateDigRed();
        this._updateTaskRed();
        this._updateShopRedDot();
        this._updateActivityRed();
        this._updateActFightSort();
        this._updateVipRed();

        this._updateOpenFuncRed();  //只能在判断所有红点之后再判断

        //冲榜时间
        let lefttime = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_ACTIVITY_FIGHTRANK);
        if(lefttime <= 0){
            this.button_chongbang.node.active = false;
        }else{
            this.button_chongbang.node.active = true;
        };
        this.checkChannelUpdateBtn();
    },
    _updateMailRedPoint: function () {
        this.node_mailredpoint.active = Game.MailModel.GetmailsRedDot();
    },
    _getCharacterMe: function () {
        if (this.character_me == null) {
            this.character_me = this.node_mainmap.GetCharacterMe();
        }
        return this.character_me;
    },
    _updateOpenFuncRed() {
        let funcList = Game.GuideController.GetFirstOpenFuncList();

        let isSeptRed = Game._.find(funcList, function (info) {
            return info == Game.Define.FUNCTION_TYPE.TYPE_SEPT;
        });
        // isSeptRed != null;
        this.sprite_septRed.node.active = false;
        this._updateMiniMapRed(isSeptRed != null);

        let isTaskRed = Game._.find(funcList, function (info) {
            return info == Game.Define.FUNCTION_TYPE.TYPE_TASK;
        });
        this.sprite_taskRed.node.active = isTaskRed != null || Game.TaskModel.IsTaskRed();
    },
    _updateDailySignRed() {
        //签到
        let isSign = Game.GlobalModel.GetDailyHasSign();
        this.spr_DailySignRed.node.active = !isSign;
    },
    _updateDigRed() {
        //庄园
        let isDigRed = Game.DigModel.getIsDigRed();
        this.spr_DigRed.node.active = isDigRed;
        this._updateMiniMapRed();
    },
    _updateSevenLoginRed() {
        //7日登陆
        let isSevenLogin = Game.ActiveModel.getIsSevenloginRed();
        this.spr_SevenLogin.node.active = isSevenLogin;
    },
    _updateChannel() //更新渠道显示
    {
        this.btn_share.node.active = false;
        this.btn_collect.node.active = false;
        switch(Game.ServerUtil.channel)
        {
            case Game.Define.Channel_Type.Qzone_Ios:
            case Game.Define.Channel_Type.Qzone_NotIos:
                this.btn_share.node.active = true;
                this.btn_collect.node.active = true;
            break;
        }
    },
    _updateTaskRed() {
        this.sprite_taskRed.node.active = Game.TaskModel.IsTaskRed();
        this._updateMiniMapRed();
    },
    _updateNpcTarget(dt) {
        this.time_update += dt;
        if (this.time_update > 4) {
            this.time_update = 0;
            let movenpc = [];
            Game._.forIn(this.characters_npc, function (value, key) {
                if (Game.Tools.GetRandomInt(0, 100) < 10) {
                    //跑吧
                    movenpc.push(key);
                }
            });
            let poss = this.node_mainmap.RandomSomePosition(movenpc.length);
            for (let i = 0; i < movenpc.length; i++) {
                this.node_mainmap.SetTargetPos(movenpc[i], poss[i]);
            }
        }
    },
    _updateFunctionOpen(limitId) {
        if (limitId == 13) {
            //庄园
            Game.DigModel.isDigRed = true;
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.RED_DIG);
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.UPDATE_MAINRED);
        }
    },
    _updateFairyRed() {
        this.spr_FairyShopRed.setVisible(Game.ShopModel.GetFreeRedDot());
    },
    _updateShopRedDot() {
        this.spr_zahuoShopRed.setVisible(false);// (Game.ShopModel.GetNbFreeTimesRedDot());
        this._updateMiniMapRed();
    },
    _updateMiniMapRed(bool) {
        var dot = bool || false;
        if (                                    //Game.ShopModel.GetNbFreeTimesRedDot()
            Game.TaskModel.IsTaskRed()
            || Game.DigModel.getIsDigRed()) {
            dot = true;
        }
        this.spr_miniMapRed.setVisible(dot);
    },

    _updateActivityRed() {
        //活动
        let hasRed = Game.ActiveModel.activityHasRedPoint();
        this.spr_activityRed.setVisible(hasRed);
    },

    _updateActFightSort() {
        //冲榜
        let hasRed = Game.ActiveModel.fightSortHasRedPoint();
        this.spr_fightSortRed.setVisible(hasRed);
    },

    _updateVipRed() {
        //vip
        let hasRed = Game.VipModel.checkVipGiftCanBuy()
        this.spr_vipRed.setVisible(hasRed);
    },

    onClickOpenNoticeView() {
        this.spr_noticered.active = false;
        Game.UserModel.newnotice = false;
        cc.loader.loadRes('Prefab/Tip/NoticeView', function (err, prefab) {
            if (err) {
                cc.log('[热更节点加载失败]');
            } else {
                let node = cc.instantiate(prefab);
                node._data = Game.UserModel.notice;
                this.node.addChild(node);
            }
        }.bind(this));
    },
});
