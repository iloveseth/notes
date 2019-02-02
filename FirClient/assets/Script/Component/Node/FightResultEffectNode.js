const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        img_guangquan: { default: null, type: cc.Sprite_ },
        remdTxt: { default: null, type: cc.Label_ },
        txtWininfo: { default: null, type: cc.Label_ },

        itemBg_tab: { default: [], type: [cc.Sprite_] },
        item_img_tab: { default: [], type: [cc.Sprite_] },
        item_num_tab: { default: [], type: [cc.Label_] },
        item_name_tab: { default: [], type: [cc.Label_] },

        Panel_normal: { default: null, type: cc.Node },
        sliverTxt: { default: null, type: cc.Label_ },
        frameTxt: { default: null, type: cc.Label_ },
        septstore: { default: null, type: cc.Label_ },

        Panel_board: { default: null, type: cc.Node },
        Panel_board_tab: { default: [], type: [cc.Label_] },
        benefitText: { default: null, type: cc.Label_ },
        sliverPropText: { default: null, type: cc.Label_ },
        extraBenefitText: { default: null, type: cc.Label_ },
        sliverTxt_board: { default: null, type: cc.Label_ },
        prestigeText: { default: null, type: cc.Label_ },
        septstore_board: { default: null, type: cc.Label_ },

        Panel_touxiang: { default: null, type: cc.Node },
        nameImg1: { default: null, type: cc.Sprite_ },
        nameImg2: { default: null, type: cc.Sprite_ },
        power1: { default: null, type: cc.Label_ },
        power2: { default: null, type: cc.Label_ },
        name1: { default: null, type: cc.Label_ },
        name2: { default: null, type: cc.Label_ },
    },

    onLoad: function () {

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
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TARGET_GUIDE_END);
        Game.GlobalModel.canShowTargetGuideView = false;
    },

    onDisable() {
        this.removeNotification();
        this.node.stopAllActions();
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.CLOSE_FIGHTSUCCESS, this._data.typeIndex);
        Game.GlobalModel.canShowTargetGuideView = true;
    },

    initNotification() {
        Game.NetWorkController.AddListener('msg.retFreeLuckNeedTime', this, this.onRetFreeLuckNeedTime);//请求杀人数
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('msg.retFreeLuckNeedTime', this, this.onRetFreeLuckNeedTime);
    },

    initView() {
        this.dfTime = 0;
        this.initializeAllNode();

        let enumfType = this._data.typeIndex;
        if (enumfType == Game.Define.ENUMF_TYPE.typeRobGuard) {

        } else if (enumfType == Game.Define.ENUMF_TYPE.typeReRobGuard) {

        } else if (enumfType == Game.Define.ENUMF_TYPE.typeRevenge) {

        } else if (enumfType == Game.Define.ENUMF_TYPE.typeReward) {

        } else if (enumfType == Game.Define.ENUMF_TYPE.typewboss) {
            this.refreshView_WORLDBOSS();
        } else if (enumfType == Game.Define.ENUMF_TYPE.typedigpk) {
            this.refreshView_DIG();//庄园挖宝pk
        } else if (enumfType == Game.Define.ENUMF_TYPE.typeMappk) {

        } else if (enumfType == Game.Define.ENUMF_TYPE.typeBorder) {
            this.refreshView_BORDER();
        } else if (enumfType == Game.Define.ENUMF_TYPE.typeSeptPk) {
            this.refreshView_SEPTPK();
        } else if (enumfType == Game.Define.ENUMF_TYPE.typeCountryPk) {

        } else if (enumfType == Game.Define.ENUMF_TYPE.typeKingPk) {

        } else if (enumfType == Game.Define.ENUMF_TYPE.typeSeptBorder) {

        } else if (enumfType == Game.Define.ENUMF_TYPE.typePvp) {
            this.refreshView_JJC();//竞技场pk
        }
    },

    initializeAllNode() {
        this.remdTxt.string = '';
        this.txtWininfo.string = '';
        this.Panel_normal.active = false;
        this.Panel_board.active = false;

        for (let i = 0; i < 5; i++) {
            this.itemBg_tab[i].node.active = false;
        };
    },

    //------------------------------------------------------------庄园pk系列---------------------------------------------------------
    refreshView_DIG() {
        // this.node.runAction(cc.sequence([
        //     cc.delayTime(3),
        //     cc.callFunc(function () {
        //         this.onClose(true);
        //     }, this)
        // ]));

        this.fightResultInfo = Game.FightModel.getFightResult();
        this.money = Game._.get(this, 'fightResultInfo.money', 0);
        this.myface = Game._.get(this, 'fightResultInfo.winface', 0);
        this.enemyface = Game._.get(this, 'fightResultInfo.loseface', 0);
        this.myname = Game._.get(this, 'fightResultInfo.winname', '无');
        this.enemyname = Game._.get(this, 'fightResultInfo.losename', '无');
        this.myfight = Game._.get(this, 'fightResultInfo.selffight', 0);
        this.enemyfight = Game._.get(this, 'fightResultInfo.enemyfight', 0);
        this.shengwang = Game._.get(this, 'fightResultInfo.fame', 0);
        this.otherid = Game._.get(this, 'fightResultInfo.enemyid', 0);
        this.itemid = Game._.get(this, 'fightResultInfo.itemid', 0);
        this.itemnum = Game._.get(this, 'fightResultInfo.itemnum', 0);
        this.money_septstore = Game._.get(this, 'fightResultInfo.money_septstore', 0);
        this.pknum = Game._.get(this, 'fightResultInfo.pknum', 0);
        this.max_kill = Game._.get(this, 'fightResultInfo.maxkill', 0);
        this.cur_kill = Game._.get(this, 'fightResultInfo.curkill', 0);
        this.list = Game._.get(this, 'fightResultInfo.list', []);
        this.kill_num = 0;

        let fight = this.fightResultInfo;
        //头像
        let winIconPath = Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(this.myface));
        this.nameImg1.SetSprite(winIconPath);
        let lostIconPath = Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(this.enemyface));
        this.nameImg2.SetSprite(lostIconPath);
        //名字
        this.name1.string = this.myname;
        this.name2.string = this.enemyname;
        //战力
        this.power1.string = '战斗力' + this.myfight;
        this.power2.string = '战斗力' + this.enemyfight;

        //胜利信息
        let desString = '无';
        if (fight.fightdig.type == 1) {
            //占领
            if (fight.fightdig.capturesec > 3600) {
                desString = cc.js.formatStr('成功占领宝藏,持续占领%d时%d分%d秒后获得战利品。', (Math.floor(fight.fightdig.capturesec / 3600)) % 24, (Math.floor(fight.fightdig.capturesec / 60)) % 60, fight.fightdig.capturesec % 60)
            } else {
                desString = cc.js.formatStr('成功占领宝藏,持续占领%d分%d秒后获得战利品。', (Math.floor(fight.fightdig.capturesec / 60)) % 60, fight.fightdig.capturesec % 60);
            };
        } else if (fight.fightdig.type == 2) {
            //夺回
            desString = '成功夺回宝藏。';
        }
        this.remdTxt.setText(desString);

        //胜利获得物品
        let get_items = Game._.get(this, 'fightResultInfo.fightdig.get_items', []);
        let get_equips = Game._.get(this, 'fightResultInfo.fightdig.get_items', []);
        if (get_items.length > 0) {
            for (let i = 0; i < get_items.length; i++) {
                let obj_items = Game.ConfigController.GetConfigById('object_data', get_items[i].itemid);
                this.AddItem(obj_items.name, obj_items.pic, get_items[i].num, 1)
            };
        } else if (get_equips.length > 0) {
            for (let i = 0; i < get_equips.length; i++) {
                this.AddItem('装备', 'Image/UI/MiniLevelView/wabao_zhuangbei', get_equips[i].num, i, get_equips[i].color)
            };
        }


    },

    AddItem(name, pic, num, pos, color) {
        let item_img_bg = this.itemBg_tab[pos];
        let item_img_icon = this.item_img_tab[pos];
        let item_num_lab = this.item_num_tab[pos];
        let item_name_lab = this.item_name_tab[pos];

        this.itemBg_tab[pos].node.active = true;
        item_num_lab.setText(num);
        item_name_lab.setText(name);
        item_img_icon.SetSprite(pic);

        let color_path = Game.ItemModel.GetItemQualityIcon(color);
        item_img_bg.SetSprite(color_path);


    },
    //------------------------------------------------------------竞技场pk系列---------------------------------------------------------
    refreshView_JJC() {
        // this.node.runAction(cc.sequence([
        //     cc.delayTime(3),
        //     cc.callFunc(function () {
        //         this.closeView(this._url,true);
        //     }, this)
        // ]))

        //请求杀人次数
        Game.NetWorkController.SendProto('msg.reqFreeLuckNeedTime', { type: 1 });

        let pvpFightResult = this._data.FightResult;

        this.nameImg1.SetSprite(Game.UserModel.GetProfessionIcon(Game.UserModel.GetUserOccupation()));
        this.nameImg2.SetSprite(Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(pvpFightResult.loseface)));
        this.power1.string = '战斗力' + pvpFightResult.winfight;
        this.power2.string = '战斗力' + pvpFightResult.losefight;
        this.name1.string = pvpFightResult.winname;
        this.name2.string = pvpFightResult.losename;

        //说明
        let desc_1 = '你在竞技场中击败了 ' + pvpFightResult.losename;
        let desc_2 = '';
        if (pvpFightResult.exrank == pvpFightResult.rank) {
            desc_2 = '挑战成功，排名不变！';
        } else {
            desc_2 = cc.js.formatStr('挑战成功，排名从%d名提升至%d名', pvpFightResult.exrank, pvpFightResult.rank);
        };
        this.txtWininfo.string = desc_1;
        this.remdTxt.string = desc_2;

        //银子，声望
        let money_id = 108;
        let frame_id = 282;
        let money_obj = Game.ConfigController.GetConfigById('object_data', money_id);
        let frame_obj = Game.ConfigController.GetConfigById('object_data', frame_id);


        this.itemBg_tab[1].node.active = true;
        this.itemBg_tab[3].node.active = true;
        this.itemBg_tab[1].SetSprite(Game.ItemModel.GetItemQualityIcon(money_obj.color));
        this.itemBg_tab[3].SetSprite(Game.ItemModel.GetItemQualityIcon(frame_obj.color));
        this.item_img_tab[1].SetSprite(money_obj.pic);
        this.item_img_tab[3].SetSprite(frame_obj.pic);
        this.item_num_tab[1].string = Game.Tools.UnitConvert(pvpFightResult.money);
        this.item_num_tab[3].string = pvpFightResult.shengwang;
        this.item_name_tab[1].string = '银子';
        this.item_name_tab[3].string = '声望';

    },
    //------------------------------------------------------------边境守卫pk系列---------------------------------------------------------
    refreshView_BORDER() {
        this.fightResultInfo = Game.FightModel.getFightResult();
        //头像
        let winIconPath = Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(Game._.get(this, 'fightResultInfo.winface', '')));
        this.nameImg1.SetSprite(winIconPath);
        let lostIconPath = Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(Game._.get(this, 'fightResultInfo.loseface', '')));
        this.nameImg2.SetSprite(lostIconPath);
        //名字
        this.name1.string = Game._.get(this, 'fightResultInfo.winname', '');
        this.name2.string = Game._.get(this, 'fightResultInfo.losename', '');
        //战力
        this.power1.string = '战斗力' + Game._.get(this, 'fightResultInfo.selffight', '');
        this.power2.string = '战斗力' + Game._.get(this, 'fightResultInfo.enemyfight', '');

        //说明
        let desc_1 = '你在组队守边中中击败了 ' + Game._.get(this, 'fightResultInfo.losename', '');
        let desc_2 = '本日还可以获得全额击杀奖励' + Game._.get(this, 'fightResultInfo.itemtimes', '') + '次';
        this.txtWininfo.string = desc_1;
        this.remdTxt.string = desc_2;

        //胜利获得物品
        let list = Game._.get(this, 'fightResultInfo.list', []);
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let define = Game.ConfigController.GetConfigById('object_data', item.itemid);
            this.AddItem(define.name, define.pic, item.itemnum, i, item.color)
        }
        this.node.runAction(cc.sequence([
            cc.delayTime(3),
            cc.callFunc(function () {
                this.onClose(true);
            }, this)
        ]));
    },
    //------------------------------------------------------------公会pk系列---------------------------------------------------------
    refreshView_SEPTPK() {
        this.fightResultInfo = Game.FightModel.getFightResult();
        //头像
        let winIconPath = Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(Game._.get(this, 'fightResultInfo.winface', '')));
        this.nameImg1.SetSprite(winIconPath);
        let lostIconPath = Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(Game._.get(this, 'fightResultInfo.loseface', '')));
        this.nameImg2.SetSprite(lostIconPath);
        //名字
        this.name1.string = Game._.get(this, 'fightResultInfo.winname', '');
        this.name2.string = Game._.get(this, 'fightResultInfo.losename', '');
        //战力
        this.power1.string = '战斗力' + Game._.get(this, 'fightResultInfo.selffight', '');
        this.power2.string = '战斗力' + Game._.get(this, 'fightResultInfo.enemyfight', '');

        //说明
        let desc_1 = '你在公会战中中击败了 ' + Game._.get(this, 'fightResultInfo.losename', '');
        this.txtWininfo.string = desc_1;
        this.remdTxt.string = '';

        //胜利获得物品
        let list = Game._.get(this, 'fightResultInfo.list', []);
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let define = Game.ConfigController.GetConfigById('object_data', item.itemid);
            this.AddItem(define.name, define.pic, item.itemnum, i, item.color)
        }
        this.node.runAction(cc.sequence([
            cc.delayTime(3),
            cc.callFunc(function () {
                this.onClose(true);
            }, this)
        ]));
    },
    //------------------------------------------------------------世界boss pk系列---------------------------------------------------------
    refreshView_WORLDBOSS() {
        this.fightResultInfo = Game.FightModel.getFightResult();
        //头像
        let winIconPath = Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(Game._.get(this, 'fightResultInfo.winface', '')));
        this.nameImg1.SetSprite(winIconPath);
        let lostIconPath = Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(Game._.get(this, 'fightResultInfo.loseface', '')));
        this.nameImg2.SetSprite(lostIconPath);
        //名字
        this.name1.string = Game._.get(this, 'fightResultInfo.winname', '');
        this.name2.string = Game._.get(this, 'fightResultInfo.losename', '');
        //战力
        this.power1.string = '战斗力' + Game._.get(this, 'fightResultInfo.selffight', '');
        this.power2.string = '战斗力' + Game._.get(this, 'fightResultInfo.enemyfight', '');

        //说明
        let desc_1 = '你在世界boss中中击败了 ' + Game._.get(this, 'fightResultInfo.losename', '');
        let desc_2 = '本日boss战还可以获得全额击杀奖励' + Game._.get(this, 'fightResultInfo.itemtimes', '') + '次';
        this.txtWininfo.string = desc_1;
        this.remdTxt.string = desc_2;

        //胜利获得物品
        let list = Game._.get(this, 'fightResultInfo.list', []);
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let define = Game.ConfigController.GetConfigById('object_data', item.itemid);
            this.AddItem(define.name, define.pic, item.itemnum, i, item.color)
        }
        this.node.runAction(cc.sequence([
            cc.delayTime(3),
            cc.callFunc(function () {
                this.onClose(true);
            }, this)
        ]));
    },

    //====================  这是分割线  ====================
    onBtn_close_Touch() {
        if (this._data.typeIndex == Game.Define.ENUMF_TYPE.typePvp) {
            Game.NetWorkController.SendProto('pvp.ReqPvpInfo', {});
            Game.ViewController.CloseView(Game.UIName.UI_GYM_ANIMATION_VIEW, true);
        }
        this.node.stopAllActions();
        this.onClose(true);
    },

    onRetFreeLuckNeedTime(msgid, data) {
        cc.log('FightResultEffectNode onRetFreeLuckNeedTime');
        let isThroughMap = Game.UserModel.boolThroughMap(51);
        let oldStr = this.remdTxt.string;
        if (data.type == 1 && data.needtime > 0 && isThroughMap && oldStr != '') {
            let newStr = oldStr + cc.js.formatStr('\n再成功PK%d次,可获得免费黄金抽卡的机会！', data.needtime);
            this.remdTxt.string = newStr;
        }
    },


});
