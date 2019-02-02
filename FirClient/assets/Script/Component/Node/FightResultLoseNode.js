const Game = require('../../Game');

var jijieType = cc.Enum({
    BorderPK: 1,//边境PK
    DigRecapture: 2,//庄园战斗
    WorldBoss: 3,//世界BOSS
    Revenge: 4,//复仇
    SeptBorderPK: 5,//工会守边
    SeptTreasure: 6,//工会宝藏
    CountryWar: 7,//王国战争
    KingFight: 8,//争夺王位
    SeptPK: 9,//工会战
    SeptGuard: 10,//截取晶石
});

cc.Class({
    extends: cc.GameComponent,

    properties: {
        txt_dec_: { default: null, type: cc.Label_ },
        reviveBtn: { default: null, type: cc.Button_ },
        btn_jijie: { default: null, type: cc.Button_ },
        img_guangquan2: { default: null, type: cc.Sprite_ },
        selficon: { default: null, type: cc.Sprite_ },
        enemyicon: { default: null, type: cc.Sprite_ },
        fight1: { default: null, type: cc.Label_ },
        fight2: { default: null, type: cc.Label_ },
        name1: { default: null, type: cc.Label_ },
        name2: { default: null, type: cc.Label_ },

        lal_txt_yuandi: { default: null, type: cc.Label_ },
    },

    update(dt) {
        if (this.reviveBtn.node.active) {
            // if(this._data.typeIndex == Game.Define.DEATH_TYPE.DeathType_DigPK){return};
            //有倒计时按钮
            let countDownStr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_REVIVE, 'ss');
            this.reviveBtn.interactable = (countDownStr == '');
            this.lal_txt_yuandi.string = '复活' + countDownStr;
        }
    },

    onEnable() {
        this.initView();
        Game.NetWorkController.AddListener('jijie.retJijieMainData', this, this.onRetJijieMainData);
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TARGET_GUIDE_END);
        Game.GlobalModel.canShowTargetGuideView = false;
    },

    onDisable() {
        Game.NetWorkController.RemoveListener('msg.retJijieMainData', this, this.onRetJijieMainData);
        Game.GlobalModel.canShowTargetGuideView = true;
    },

    initView() {
        this.dfTime = 0;
        this.initializeAllNode();

        let DeathType = this._data.typeIndex;
        if (DeathType == Game.Define.DEATH_TYPE.DeathType_GuardRob) {

        } else if (DeathType == Game.Define.DEATH_TYPE.DeathType_Bianjing) {
            this.refreshView_Common('您在边境pk中被');
            this.jijieType = jijieType.BorderPK;
            this.btn_jijie.node.active = true;
        } else if (DeathType == Game.Define.DEATH_TYPE.DeathType_Recap_Mine) {

        } else if (DeathType == Game.Define.DEATH_TYPE.DeathType_Recap_Guard) {

        } else if (DeathType == Game.Define.DEATH_TYPE.DeathType_WBoss) {
            this.refreshView_Common('您在世界boss的pk中被');
            this.jijieType = jijieType.WorldBoss;
            this.btn_jijie.node.active = true;
        } else if (DeathType == Game.Define.DEATH_TYPE.DeathType_DigPK) {
            this.refreshView_DIG();//庄园挖宝pk
        } else if (DeathType == Game.Define.DEATH_TYPE.DeathType_RewardPK) {
            this.btn_jijie.node.active = true;
            this.jijieType = jijieType.Revenge;
        } else if (DeathType == Game.Define.DEATH_TYPE.DeathType_MapUserPK) {

        } else if (DeathType == Game.Define.DEATH_TYPE.DeathType_SeptBorderPK) {
            this.btn_jijie.node.active = true;
            this.jijieType = jijieType.SeptBorderPK;
        } else if (DeathType == Game.Define.DEATH_TYPE.DeathType_CountryWarPK) {
            this.btn_jijie.node.active = true;
            this.jijieType = jijieType.CountryWar;
        } else if (DeathType == Game.Define.DEATH_TYPE.DeathType_SeptTreasurePK) {
            this.btn_jijie.node.active = true;
            this.jijieType = jijieType.SeptTreasure;
        } else if (DeathType == Game.Define.DEATH_TYPE.DeathType_UserTreasurePK) {

        } else if (DeathType == Game.Define.DEATH_TYPE.DeathType_KingFightPK) {
            this.btn_jijie.node.active = true;
            this.jijieType = jijieType.KingFight;
        } else if (DeathType == Game.Define.DEATH_TYPE.DeatnType_SeptPk) {
            this.refreshView_Common('您在公会战pk中被')
            this.jijieType = jijieType.SeptPK;
            this.btn_jijie.node.active = true;
        } else if (DeathType == Game.Define.DEATH_TYPE.DeatnType_PVP) {
            this.refreshView_JJC();//竞技场pk
        };

        this.btn_jijie.node.active = false;
    },

    initializeAllNode() {
        this.reviveBtn.node.active = false;
        this.btn_jijie.node.active = false;
    },

    //------------------------------------------------------------庄园pk系列---------------------------------------------------------
    refreshView_DIG() {
        // this.node.runAction(cc.sequence([
        //     cc.delayTime(3),
        //     cc.callFunc(function () {
        //         this.closeView(this._url, true);
        //     }, this)
        // ]))

        this.userDeathInfo = Game.FightModel.getUserDeathInfo();
        let info = this.userDeathInfo;
        this.name1.setText(Game.UserModel.GetUserName());
        this.name2.setText(info.name);
        this.fight1.setText("战斗力" + info.myfight);
        this.fight2.setText("战斗力" + info.enemyfight);
        this.selficon.SetSprite(Game.UserModel.GetProfessionIcon(Game.UserModel.GetUserOccupation()));
        this.enemyicon.SetSprite(Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(info.enemyface)));

        this.reviveBtn.node.active = true;
        this.reviveBtn.interactable = true;
        Game.CountDown.SetCountDown(Game.CountDown.Define.TYPE_REVIVE, 3);

        this.txt_dec_.setText("您损失了1点活力");

    },

    //------------------------------------------------------------竞技场pk系列---------------------------------------------------------

    refreshView_JJC() {
        // this.node.runAction(cc.sequence([
        //     cc.delayTime(3),
        //     cc.callFunc(function () {
        //         this.closeView(this._url, true);
        //     }, this)
        // ]))

        this.reviveBtn.node.active = true;
        this.reviveBtn.interactable = true;
        Game.CountDown.SetCountDown(Game.CountDown.Define.TYPE_REVIVE, 3);

        let pvpFightResult = this._data.FightResult;

        this.txt_dec_.setText("挑战失败，排名不变！");

        this.selficon.SetSprite(Game.UserModel.GetProfessionIcon(Game.UserModel.GetUserOccupation()));
        this.enemyicon.SetSprite(Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(pvpFightResult.winface)));
        this.fight1.string = "战斗力" + pvpFightResult.losefight;
        this.fight2.string = "战斗力" + pvpFightResult.winfight;
        this.name1.string = pvpFightResult.losename;
        this.name2.string = pvpFightResult.winname;


    },
    //------------------------------------------------------------通用---------------------------------------------------------
    refreshView_Common(resultprefix) {
        this.reviveBtn.node.active = true;
        this.userDeathInfo = Game.FightModel.getUserDeathInfo();
        this.name1.setText(Game.UserModel.GetUserName());
        this.name2.setText(Game._.get(this, 'userDeathInfo.name', ''));
        this.fight1.setText("战斗力" + Game._.get(this, 'userDeathInfo.myfight', ''));
        this.fight2.setText("战斗力" + Game._.get(this, 'userDeathInfo.enemyfight', ''));
        this.selficon.SetSprite(Game.UserModel.GetProfessionIcon(Game.UserModel.GetUserOccupation()));
        this.enemyicon.SetSprite(Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(Game._.get(this, 'userDeathInfo.enemyface', ''))));
        this.txt_dec_.setText((resultprefix || '') + Game._.get(this, 'userDeathInfo.name', '') + '击败');
    },
    //====================  这是分割线  ====================

    onBtn_close_Touch() {
        if (this.reviveBtn.node.active) {
            //要复活，不能给你关掉了
            return;
        }
        this.onClose(true);
    },

    onBtn_revive_Touch() {
        let DeathType = this._data.typeIndex;
        if (DeathType == Game.Define.DEATH_TYPE.DeatnType_PVP) {
            Game.ViewController.CloseView(Game.UIName.UI_GYM_ANIMATION_VIEW, true);
            //请求刷新主界面信息
            Game.NetWorkController.SendProto('pvp.ReqPvpInfo', {});
        }
        this.onClose(true);
    },
    onBtn_jijie_Touch() {
        Game.JijieModel.callJijie(this.userDeathInfo.charid, this.jijieType);
    },

    onRetJijieMainData(ret, data) {
        if (data.is_openui) {
            this.onClose();
        }
    }
});
