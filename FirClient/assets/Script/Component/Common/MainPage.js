const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_power: { default: null, type: cc.Label_ },
        label_coin: { default: null, type: cc.Label_ },
        label_gold: { default: null, type: cc.Label_ },
        label_exp: { default: null, type: cc.Label_ },
        Sprite_equipRed: { default: null, type: cc.Sprite_ },
        Sprite_bagRed: { default: null, type: cc.Sprite_ },
        Sprite_mainRed: { default: null, type: cc.Sprite_ },
        Sprite_fairyRed: { default: null, type: cc.Sprite_ },
        Sprite_battleRed: cc.Sprite_,
        node_passRed: { default: null, type: cc.Node },
        Button_addStrength: { default: null, type: cc.Button_ },
        progressbar_exp: { default: null, type: cc.ProgressBar },
    },

    onLoad() {
        cc.log("MainPage onLoad()");
        this._pageIndex = 0;
        this.onBattlePkRed();
        this.onBattleRed();
        this.gotoPage(Game.Define.MAINPAGESTATE.Page_Pass);
        this._updatePower();
        this._updateGold();
        this._updateBagRed();
        this._updateMainRed();
        this._updateFairyRed();
        this.initNotification();
    },

    onDestroy: function () {
        this.removeNotification();
    },

    update: function (dt) {
        //更新银币和经验
        this.label_coin.setText(Game.Tools.UnitConvert(Game.CurrencyModel.GetMoney()));
        let curexp = Game.UserModel.GetExp();
        let totalexp = Game.UserModel.GetLevelupExp();
        this.label_exp.setText('经验值:' + Game.Tools.UnitConvert(curexp) + '/' + Game.Tools.UnitConvert(totalexp));
        if (totalexp == 0) {
            this.progressbar_exp.progress = 1;
        } else {
            this.progressbar_exp.progress = curexp / totalexp;
        }
        this._updateImmediateRed();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.GOLD_REFRESH, this, this._updateGold);
        Game.NotificationController.On(Game.Define.EVENT_KEY.MONEY_REFRESH, this, this._updateMoney);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FIGHTVAL_REFRESH, this, this._updatePower);
        Game.NotificationController.On(Game.Define.EVENT_KEY.STRENGTH_REFRESH, this, this._updatePower);
        Game.NotificationController.On(Game.Define.EVENT_KEY.CHANGE_MAINPAGE, this, this.gotoPage);
        Game.NotificationController.On(Game.Define.EVENT_KEY.OBJECTS_REFRESH, this, this._updateBagRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FUNCTION_OPEN, this, this._updateOpenFuncRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.UPDATE_MAINRED, this, this._updateMainRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.UPDATE_FAIRYRED, this, this._updateFairyRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.VIP_RET_INFO1,this,this._updateImmediateRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_DATAUPDATE,this,this._updateImmediateRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FAIRYRED_RED_DOT_TIMER,this,this.redDotTimer);

        Game.NotificationController.On(Game.Define.EVENT_KEY.BATTLE_RED,this,this.onBattleRed);
        Game.NotificationController.On(Game.Define.EVENT_KEY.PK_REWARDUPDATE,this,this.onBattlePkRed);

        Game.NotificationController.On(Game.Define.EVENT_KEY.NEW_NOTICE,this,this._updateMainRed);
        
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GOLD_REFRESH, this, this._updateGold);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MONEY_REFRESH, this, this._updateMoney);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FIGHTVAL_REFRESH, this, this._updatePower);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.STRENGTH_REFRESH, this, this._updatePower);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.CHANGE_MAINPAGE, this, this.gotoPage);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.OBJECTS_REFRESH, this, this._updateBagRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FUNCTION_OPEN, this, this._updateOpenFuncRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.UPDATE_MAINRED, this, this._updateMainRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.UPDATE_FAIRYRED, this, this._updateFairyRed);
        this.stopUpdate();
        Game.NotificationController.Off(Game.Define.EVENT_KEY.VIP_RET_INFO1,this,this._updateImmediateRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_DATAUPDATE,this,this._updateImmediateRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FAIRYRED_RED_DOT_TIMER,this,this.redDotTimer);

        Game.NotificationController.Off(Game.Define.EVENT_KEY.BATTLE_RED,this,this.onBattleRed);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PK_REWARDUPDATE,this,this.onBattlePkRed);

        Game.NotificationController.Off(Game.Define.EVENT_KEY.NEW_NOTICE,this,this._updateMainRed);
    },

    onOpenPass() {
        this.gotoPage(Game.Define.MAINPAGESTATE.Page_Pass, { playCloud: true });
    },

    onOpenMain() {
        this.gotoPage(Game.Define.MAINPAGESTATE.Page_Main);
    },

    onOpenEquip() {
        this.gotoPage(Game.Define.MAINPAGESTATE.Page_Equip);
    },

    onOpenPet() {
        this.gotoPage(Game.Define.MAINPAGESTATE.Page_Pet);
    },

    onOpenBag() {
        this.gotoPage(Game.Define.MAINPAGESTATE.Page_Bag);
    },

    onOpenFight() {
        this.gotoPage(Game.Define.MAINPAGESTATE.Page_Fight);
    },

    onOpenShop() {
        this.openView(Game.UIName.UI_SHOPVIEW, Game.Define.SHOPTAB.Tab_Currency);
    },

    gotoPage(pageIndex, opts) {
        if (this._pageIndex != pageIndex) {
            this._pageIndex = pageIndex;
            switch (pageIndex) {
                case Game.Define.MAINPAGESTATE.Page_Pass:
                    let playCloud = Game._.get(opts, 'playCloud', false);
                    if (playCloud) {
                        cc.log("MainPage gotoPage() Emit EFFECT_CLOUDMASK");
                        Game.NotificationController.Emit(Game.Define.EVENT_KEY.EFFECT_CLOUDMASK, cc.WrapMode.Normal);
                        this.node.runAction(cc.sequence([
                            cc.delayTime(0.6),
                            cc.callFunc(function () {
                                this.openMainView(Game.UIName.UI_LEVEL);
                            }.bind(this))
                        ]));
                    } else {
                        this.openMainView(Game.UIName.UI_LEVEL);
                    }
                    break;
                case Game.Define.MAINPAGESTATE.Page_Main:
                    this.openMainView(Game.UIName.UI_Main);
                    break;
                case Game.Define.MAINPAGESTATE.Page_Equip:
                    this.openMainView(Game.UIName.UI_EQUIP);
                    break;
                case Game.Define.MAINPAGESTATE.Page_Pet:
                    this.openMainView(Game.UIName.UI_FAIRYVIEW);
                    break;
                case Game.Define.MAINPAGESTATE.Page_Bag:
                    this.openMainView(Game.UIName.UI_PACKAGE);
                    break;
                case Game.Define.MAINPAGESTATE.Page_Fight:
                    this.openMainView(Game.UIName.UI_BATTLEVIEW);
                    break;
                default:
                    break;
            }
        } else {
            Game.ViewController.CloseAllView();
        }
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.CHAT_VIEW_CLOSE);
    },

    _updatePower: function () {
        let curStrength = Game.UserModel.GetUserStrengthInfo().num;
        let maxStrength = Game.UserModel.GetUserStrengthInfo().maxnum;
        let perval = 0;
        let strengthConfig = Game.ConfigController.GetConfig('strength_data');
        for (let i = 0; i < strengthConfig.length; i++) {
            let strengInfo = strengthConfig[i];
            if (curStrength >= strengInfo.minval && curStrength <= strengInfo.maxval) {
                perval = strengInfo.perval;
            }
        }

        let tColor = cc.color(0, 255, 0);
        if (perval > 90) {
            tColor = cc.color(0, 255, 0);
        } else if (perval > 70) {
            tColor = cc.color(255, 255, 0);
        } else {
            tColor = cc.color(255, 0, 0);
        }
        this.label_power.node.color = tColor;
        this.label_power.setText(Game.Tools.UnitConvert(Game.UserModel.GetUserMainInfo().fightval));
        this.Button_addStrength.interactable = curStrength < maxStrength;
    },

    _updateGold: function () {
        this.label_gold.setText(Game.Tools.UnitConvert(Game.CurrencyModel.GetGold()));
    },
    _updateMoney: function () {
        // this._updateFairyRed();
        // Math.pow(10,6)
        let normalMoney = Math.pow(10,6);
        if(Game.UserModel.GetMoney() >= normalMoney && !Game.FairyModel._cultivateTimer){
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.UPDATE_FAIRYRED);
        }
    },

    onClickAddStrength() {
        Game.NetWorkController.SendProto('msg.AddHuoLiFull', {});
    },

    openMainView(ui) {
        Game.ViewController.OpenMainView(ui);
    },

    _updateBagRed() {
        if (Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_EQUIP)) {
            let isRed = false;
            let isNewFlag = Game.EquipModel.FindEquipNewFlag();
            if (isNewFlag
                || Game.EquipModel.FindNewStrong()
                || Game.EquipModel.FindNewStar()
                || Game.EquipModel.FindNewStarStone()
                || Game.EquipModel.FindNewSoul()
                || Game.EquipModel.FindNewSoulForge()
                || Game.EquipModel.FindOneKeyGemEquip().type != 0) {
                isRed = true;
            }
            this.Sprite_equipRed.node.active = isRed;
            if(isNewFlag){
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.EQUIP_DRESS_RED);
            };
        } else {
            this.Sprite_equipRed.node.active = false;
        }

        let isBagRed = Game.ItemModel.IsSmeltTipRed()
            || Game.ItemModel.GetItemNumById(97) > 0
            || (Game.ItemModel.GetItemNumById(71) > 0 && Game.ItemModel.GetItemNumById(81) > 0);
        this.Sprite_bagRed.node.active = isBagRed;
    },

    _updateImmediateRed: function () {
        this.node_passRed.active = false;
        if(Game.UserModel.GetExp() >= Game.UserModel.GetLevelupExp()
            // || Game.UserModel.getTargetTaskRed()
            || Game.WelfareModel.updateWelfareRedPoint()
            || Game.ActiveModel.updateShouchongRedPoint()
            || !Game.ActiveModel.hasBuyFirstDailygift()
            || Game.VipModel.checkVipGiftCanBuy()
            ){
                this.node_passRed.active = true;
        }
        // this.node_passRed.active = (Game.UserModel.GetExp() >= Game.UserModel.GetLevelupExp());
    },
    _updateOpenFuncRed() {
        let isMainRed = false;
        let funcList = Game.GuideController.GetFirstOpenFuncList();
        for (let i = 0; i < funcList.length; i++) {
            let funcId = funcList[i];
            if (funcId == Game.Define.FUNCTION_TYPE.TYPE_TASK
                || funcId == Game.Define.FUNCTION_TYPE.TYPE_SEPT) {
                isMainRed = true;
            }
        }
        if (isMainRed || this._getMainRed()) {
            isMainRed = true;
        }
        this.Sprite_mainRed.node.active = isMainRed;
    },
    _updateMainRed() {
        this.Sprite_mainRed.node.active = this._getMainRed();
    },
    _getMainRed() {
        let isMainRed = false;

        let IsDigRed = Game.DigModel.getIsDigRed();
        let IsSevenloginRed = Game.ActiveModel.getIsSevenloginRed();
        let mailsRedDot = Game.MailModel.GetmailsRedDot();
        let DailyHasSign = Game.GlobalModel.GetDailyHasSign();
        let IsTaskRed = Game.TaskModel.IsTaskRed();
        let activityHasRed = Game.ActiveModel.activityHasRedPoint()
        let fightSortHasRed = Game.ActiveModel.fightSortHasRedPoint();
        let vipHasRed = Game.VipModel.checkVipGiftCanBuy();
        if (IsDigRed || IsSevenloginRed || mailsRedDot || !DailyHasSign || IsTaskRed || activityHasRed || fightSortHasRed || vipHasRed) {
            isMainRed = true;
        };
        if(isMainRed && Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_MAINPAGE)){
            isMainRed = true;
        }
        else{
            isMainRed = false;
        }
        if(!isMainRed && Game.UserModel.newnotice){
            isMainRed = true;
        }
        return isMainRed;
    },
    _updateFairyRed(){
        this.Sprite_fairyRed.setVisible(this._getFairyRed());
    },
    _getFairyRed(){
        var fairyRed = false;
        if( Game.UserModel.getUnlockById(Game.Define.Unlock_Type.TYPE_FAIRY) 
            && (Game.ShopModel.GetFreeRedDot() 
                || Game.FairyModel.GetFairyRedDot()) ){
            fairyRed = true;
        }

        return fairyRed;
    },
    redDotTimer(){
        Game.FairyModel._cultivateTimer = true;
        this.addUpdate();
    },
    addUpdate(){
        this.stopUpdate();
        this._scheduleCallback = function() {
            Game.FairyModel._cultivateTimer = false;
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.UPDATE_FAIRYRED);
            this.stopUpdate();
        }
        this.schedule(this._scheduleCallback,1800);
    },
    stopUpdate(){
        if (this._scheduleCallback){
             this.unschedule(this._scheduleCallback);
             this._scheduleCallback = null;
        }
    },

    onBattleRed(){
        var reddata = Game.UserModel.battle_red;
        this.redactive = reddata.pvpred || 
                reddata.bossred ||
                reddata.borderred ||
                reddata.septfightred;
        var battleOpen = Game.GuideController.IsFunctionOpen(16);
        if(!battleOpen){
            this.Sprite_battleRed.node.active = false;
        }
        else{
            this.Sprite_battleRed.node.active = this.pkRed || this.redactive;
        }
        cc.log('pnbattlered');
    },

    onBattlePkRed(){
        this.pkRed = false;
        let winpktime = Game.RewardModel.GetCurPkWinTimes();
        
        let rewardIds = Game.RewardModel.GetRecievedPkWinRewards();
        let boxPoints = [];
        let maxPoint = 0;
        for (let i = 0; i < 10; i++) {
            
            let index = Game._.indexOf(rewardIds, i + 1);
            let define = Game.ConfigController.GetConfigById('pkwinreward_data', i + 1);
            let point = Game._.get(define, 'point', 0);
            if (point > maxPoint) {
                maxPoint = point;
            }
            boxPoints.push(Game._.get(define, 'point', 0));
            if (index != -1) {
                //已领取
                
            } else {
                let point = Game._.get(define, 'point', 0);
                if (winpktime >= point) {
                    //可领取
                    this.pkRed = true;
                } else {
                    //不可领取
                }
            }
        }
        var battleOpen = Game.GuideController.IsFunctionOpen(16);
        if(!battleOpen){
            this.Sprite_battleRed.node.active = false;
        }
        else{
            this.Sprite_battleRed.node.active = this.pkRed || this.redactive;
        }
    },
});