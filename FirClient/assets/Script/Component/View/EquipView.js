const Game = require('../../Game');

const GemTitleColor = [
    '#F96D6D',
    '#7BDE63',
    '#5EBFE9',
    '#E9CA5E',
];
const GemAdditionColor = '#FFF9E6';
const GemGrayColor = '#A58E7F';

const ONE_TYPE = cc.Enum({
    ONE_ZHUANGBEI: 0,
    ONE_QIANGHUA: 1,
    ONE_SHENGXING: 2,
    ONE_BAOSHI: 3,
    ONE_LINGHUN: 4,
});

var oneKeyObj = function (cb) {
    this.time = 0;
    this.state = 0;
    this.callback = cb || new Function();
}
//
cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_country: { default: null, type: cc.Label_ },
        Label_countryname: { default: null, type: cc.Label_ },
        Label_sociaty: { default: null, type: cc.Label_ },
        Label_sociatyname: { default: null, type: cc.Label_ },
        Label_level: { default: null, type: cc.Label_ },
        Label_levelnum: { default: null, type: cc.Label_ },
        Label_occupation: { default: null, type: cc.Label_ },
        Label_mp: { default: null, type: cc.Label_ },
        Label_mpnum: { default: null, type: cc.Label_ },
        Label_hp: { default: null, type: cc.Label_ },
        Label_hpnum: { default: null, type: cc.Label_ },
        Label_playname: { default: null, type: cc.Label_ },
        Label_fight: { default: null, type: cc.Label_ },
        Label_strength: { default: null, type: cc.Label_ },
        Sprite_occupation: { default: null, type: cc.Sprite_ },
        Sprite_onekeyRed: { default: null, type: cc.Sprite_ },
        Sprite_btmEquipRed: { default: null, type: cc.Sprite_ },
        Nodes_EquipNodes: { default: [], type: [require('../Node/EquipNode')] },
        Skeleton_player: { default: null, type: sp.Skeleton },
        Button_addStrength: { default: null, type: cc.Button_ },

        Button_onekeystar: { default: null, type: cc.Button_ },
        Button_luckUp: { default: null, type: cc.Button_ },
        Button_putOnStar: { default: null, type: cc.Button_ },

        Button_equip: { default: null, type: cc.Button_ },
        Button_strong: { default: null, type: cc.Button_ },
        Button_star: { default: null, type: cc.Button_ },
        Button_gem: { default: null, type: cc.Button_ },
        Button_soul: { default: null, type: cc.Button_ },

        Labels_coin: { default: null, type: cc.ArrayNode },
        Node_OnekeyEquip: { default: null, type: cc.Node },
        Node_Equip: { default: null, type: cc.Node },

        Node_strong: { default: null, type: cc.Node },
        Node_strongEffBg: { default: null, type: cc.Node },
        Label_strongPro: { default: null, type: cc.Label_ },
        Label_strongProLast: { default: null, type: cc.Label_ },
        Label_strongProNext: { default: null, type: cc.Label_ },
        Label_strongLvLast: { default: null, type: cc.Label_ },
        Label_strongLvNext: { default: null, type: cc.Label_ },
        Label_onekeystrong: { default: null, type: cc.Label_ },
        Label_strongTip: { default: null, type: cc.Label_ },
        Sprite_btmStrongRed: { default: null, type: cc.Sprite_ },
        Sprite_strongRed: { default: null, type: cc.Sprite_ },

        Node_star: { default: null, type: cc.Node },
        Node_starEffBg: { default: null, type: cc.Node },
        Node_Stars: { default: null, type: cc.Node },
        Sprite_Stars: { default: [], type: [cc.Sprite_] },
        Animation_Stars: { default: [], type: [cc.Animation] },
        Label_starPro: { default: null, type: cc.Label_ },
        Label_starProLast: { default: null, type: cc.Label_ },
        Label_starProNext: { default: null, type: cc.Label_ },
        Label_starLvLast: { default: null, type: cc.Label_ },
        Label_starLvNext: { default: null, type: cc.Label_ },
        Label_luckNum: { default: null, type: cc.Label_ },
        Label_luckperNum: { default: null, type: cc.Label_ },
        Label_onekeystar: { default: null, type: cc.Label_ },
        Sprite_luckProgress: { default: null, type: cc.ProgressBar },
        Node_jingshi: { default: null, type: cc.Node },
        Label_jingshi: { default: null, type: cc.Label_ },
        Sprite_btmStarRed: { default: null, type: cc.Sprite_ },
        Sprite_oneKeyStarRed: { default: null, type: cc.Sprite_ },
        Sprite_putStarRed: { default: null, type: cc.Sprite_ },

        Node_soul: { default: null, type: cc.Node },
        Node_soulEffBg: { default: null, type: cc.Node },
        Label_canSoulTip: { default: null, type: cc.Label_ },
        Label_canFrogeTip: { default: null, type: cc.Label_ },
        Label_soulPro: { default: null, type: cc.Label_ },
        Label_soulProLast: { default: null, type: cc.Label_ },
        Label_soulProNext: { default: null, type: cc.Label_ },
        Label_soulLvLast: { default: null, type: cc.Label_ },
        Label_soulLvNext: { default: null, type: cc.Label_ },
        Label_soulExp: { default: null, type: cc.Label_ },
        Label_onekeySoul: { default: null, type: cc.Label_ },
        Sprite_soulProgress: { default: null, type: cc.ProgressBar },
        Label_soulmaterial: { default: null, type: cc.Label_ },
        Sprite_btmSoulRed: { default: null, type: cc.Sprite_ },
        Sprite_oneKeySoulRed: { default: null, type: cc.Sprite_ },

        Node_gem: { default: null, type: cc.Node },
        Node_gemAttr: { default: null, type: cc.Node },
        Label_addition: { default: null, type: cc.Label_ },
        Nodes_gemSlots: { default: [], type: [cc.Node] },
        Labels_gemAdditionTitle: { default: [], type: [cc.Label_] },
        Labels_gemAddition: { default: [], type: [cc.Label_] },
        Nodes_gemSelected: { default: [], type: [cc.Node] },
        Node_curGem: { default: null, type: cc.Node },
        Label_curGem: { default: null, type: cc.Label_ },
        Label_preAddition: { default: null, type: cc.Label_ },
        Label_nextAddition: { default: null, type: cc.Label_ },
        Node_luck: { default: null, type: cc.Node },
        Progress_rate: { default: null, type: cc.ProgressBar },
        Label_gemLuck: { default: null, type: cc.Label_ },
        Label_rate: { default: null, type: cc.Label_ },
        Node_has: { default: null, type: cc.Node },
        Node_tip: { default: null, type: cc.Node },
        Node_upRed: { default: null, type: cc.Node },
        Node_openSlotRed: { default: null, type: cc.Node },
        Sprite_hasGem: { default: null, type: cc.Sprite_ },
        Label_hasGem: { default: null, type: cc.Label_ },
        Node_oneKeyGemRed: { default: null, type: cc.Node },

        Effect_Sel: { default: null, type: cc.Node },

        Node_Item: cc.Node,

        Node_starcheck: cc.Node,
        Node_strongcheck: cc.Node,
    },

    onLoad() {
        this.initSkeleton();
        this.initOneKeyObjs();
    },

    onEnable() {
        this.autoStar = this.autoStrong = true;
        Game.GlobalModel.SetIsLookMyEquip(true);    //设置查看的是自己的装备
        this.time = 0;
        this.initData();
        this.initEquipNodes();
        this.initNotification();
        this.initEquipNode();
        this.onUserInfoRefresh();
        this.onUserBaseInfoRefresh();
        this.onUserStrengthRefresh();
        this.changePage(Game.Define.EquipPageType.equip);
        this.updateCheck();

        //红点初始化
        this.updateRedAll();
    },

    updateCheck() {
        this.Node_strongcheck.active = this.autoStrong;
        this.Node_starcheck.active = this.autoStar;
        if (this.getOneState(ONE_TYPE.ONE_QIANGHUA) == 0) {
            if (this.autoStrong) {
                this.Label_onekeystrong.setText('自动强化');
            }
            else {
                this.Label_onekeystrong.setText('强 化');
            }
        }
        if (this.getOneState(ONE_TYPE.ONE_SHENGXING) == 0) {
            if (this.autoStar) {
                this.Label_onekeystar.setText('自动升星');
            }
            else {
                this.Label_onekeystar.setText('升 星');
            }
        }
    },

    onDisable() {
        Game.EquipModel.curEquipPage = 0;
        Game.GlobalModel.choosedSoulType = 0;
        this.removeNotification();
    },

    update(dt) {
        this.time += dt;
        if (this.time > 0.33) {
            this.time = 0;
            this.checkAuto();
        }
    },

    checkAuto() {
        if (this.pageState != 2 && this.pageState != 3) {
            return;
        }
        var oneKey = this.oneKeyObjs[this.pageState - 1];
        var state = oneKey.state;
        if (state == 1) {
            oneKey.callback();
        }
    },

    //====================  初始化函数  ====================

    initOneKeyObjs() {
        this.oneKeyCbs = [
            ,
            this.strong.bind(this),
            this.star.bind(this),
            ,
            ,];
        this.oneKeyObjs = new Array(5).fill(0).map((e, idx) => { return new oneKeyObj(this.oneKeyCbs[idx]) });
    },

    initEquipNodes() {
        // return;
        var isMask = this.pageState > 1;
        this.Nodes_EquipNodes.forEach(e => {
            // e.node.active = isMask;
            e.pageState = this.pageState;
            e.mask(isMask);
        });
        this.Node_Item.active = isMask;
        let info = {
            occupation: Game.UserModel.GetUserOccupation(),
            packagetype: Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP,
        }
        if (isMask) {
            this.Node_Item.children.forEach(e => {
                var partialEquipNode = e.getComponent('PartialEquipNode');
                partialEquipNode.setView(this.pageState, info);
            })
        }
        else {
            this.initEquipNode();
        }
    },


    getOneState(type) {
        var oneKey = this.getOneKeyByType(type);
        return oneKey.state;
    },

    setOneState(type, state) {
        var oneKey = this.getOneKeyByType(type);
        oneKey.state = state;
        switch (type) {
            case ONE_TYPE.ONE_QIANGHUA: {
                this.setOneStrongState(state);
                break;
            }
            case ONE_TYPE.ONE_SHENGXING: {
                this.setOneStarState(state);
            }
        }
    },

    getOneKeyByType(type) {
        return this.oneKeyObjs[type];
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_REFRESH, this, this.onUserInfoRefresh);
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERBASEINFO_REFRESH, this, this.onUserBaseInfoRefresh);
        Game.NotificationController.On(Game.Define.EVENT_KEY.STRENGTH_REFRESH, this, this.onUserStrengthRefresh);
        Game.NotificationController.On(Game.Define.EVENT_KEY.OBJECTS_REFRESH, this, this.onUpdateEquip);
        Game.NotificationController.On(Game.Define.EVENT_KEY.EQUIP_CONTROL_SEL, this, this.onEquipControlSel);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LUCKNUM_REFRESH, this, this.onLuckNumRefresh);
        Game.NotificationController.On(Game.Define.EVENT_KEY.RET_STONE_LUCKY, this, this.onLuckyInfoRefresh);
        Game.NotificationController.On(Game.Define.EVENT_KEY.EQUIP_DRESS_RED, this, this.onRefreshEquipDressRed);
        Game.NetWorkController.AddListener('msg.insufficientNotice', this, this.onInsufficientNotice);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_REFRESH, this, this.onUserInfoRefresh);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERBASEINFO_REFRESH, this, this.onUserBaseInfoRefresh);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.STRENGTH_REFRESH, this, this.onUserStrengthRefresh);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.OBJECTS_REFRESH, this, this.onUpdateEquip);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.EQUIP_CONTROL_SEL, this, this.onEquipControlSel);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LUCKNUM_REFRESH, this, this.onLuckNumRefresh);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RET_STONE_LUCKY, this, this.onLuckyInfoRefresh);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.EQUIP_DRESS_RED, this, this.onRefreshEquipDressRed);
        Game.NetWorkController.RemoveListener('msg.insufficientNotice', this, this.onInsufficientNotice);
    },

    onInsufficientNotice() {
        this.setOneState(ONE_TYPE.ONE_BAOSHI, 0);
        this.setOneState(ONE_TYPE.ONE_QIANGHUA, 0);
        this.setOneState(ONE_TYPE.ONE_LINGHUN, 0);
        this.setOneState(ONE_TYPE.ONE_SHENGXING, 0);
    },

    initData() {
        this.pageState = 0;
        this.guideEquip = null;
        this.selEquip = null;
        this.curSelStrongEquip = null;
        this.curSelStarEquip = null;
        this.curSelSoulEquip = null;
        this.curSelGemEquip = null;
        this.curGemIndex = -1;
        this.curGemId = -1;

        this.selectSoulType = 1;
        this.gemAttrPosoition = [];
        for (let i = 0; i < this.Node_gemAttr.childrenCount; i++) {
            //调整宝石数据位置
            let node = this.Node_gemAttr.children[i];
            this.gemAttrPosoition.push(node.position);
        }
    },

    initEquipNode() {
        let info = {
            occupation: Game.UserModel.GetUserOccupation(),
            packagetype: Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP,
        }
        Game._.forEach(this.Nodes_EquipNodes, function (component) {
            component.updateEquipInfo(info);
        });
    },

    initSkeleton() {
        Game.ResController.LoadSpine(Game.UserModel.GetPlayerSkeleton(Game.UserModel.GetUserOccupation()), function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.Skeleton_player.skeletonData = asset;
                this.Skeleton_player.setAnimation(0, Game.Define.MONSTER_ANIMA_STATE.IDLE, true);
            }
        }.bind(this));
    },

    //====================  点击回调  ====================
    onClickPage(event, customEventData) {
        this.changePage(parseInt(customEventData));
    },

    onClickAddStrength() {
        Game.NetWorkController.SendProto('msg.AddHuoLiFull', {});
    },

    onClickUserDetail() {
        this.openView(Game.UIName.UI_USERPROERTYNODE);
    },

    onClickOpenStarAttribute() {
        this.openView(Game.UIName.UI_EQUIPSTARATTRIBUTENODE, {
            starSuit: Game.UserModel.GetUserMainInfo().starindex,
            strongSuit: Game.UserModel.GetUserMainInfo().strongsuit
        });
    },

    onClickOneKeyChange() {
        let equips = Game.EquipModel.FindOneKeyChangeEquips();
        if (equips.length > 0) {
            Game.NetWorkController.SendProto('msg.OneKeyPutOnEquip', {
                thisids: equips
            });
        } else {
            this.showTips('没有可以替换的装备');
        }
    },

    onClickOneKeyStrong() {
        if (this.autoStrong || this.getOneState(ONE_TYPE.ONE_QIANGHUA) == 1) {
            this.toggleOneState(ONE_TYPE.ONE_QIANGHUA);
        }
        else {
            this.strong();
        }

    },

    onClickAutoStrong() {
        this.autoStrong = !this.autoStrong;
        if (this.getOneState(ONE_TYPE.ONE_QIANGHUA) == 1) {
            this.setOneState(ONE_TYPE.ONE_QIANGHUA, 0);
        }
        this.updateCheck();
    },

    strong() {
        let strongEquip = this.curSelStrongEquip;
        // if (Game.UserModel.GetLevel() <= strongEquip.equipdata.newstronglevel) {
        //     this.showTips('装备强化等级不得超过人物等级。');
        //     this.setOneState(ONE_TYPE.ONE_QIANGHUA, 2);
        //     return;
        // }
        if (strongEquip) {
            Game.NetWorkController.SendProto('msg.EquipStrong', {
                thisid: strongEquip.thisid
            });
        }
    },

    setOneStrongState(state) {
        switch (state) {
            case 0: {
                if (this.autoStrong) {
                    this.Label_onekeystrong.setText('自动强化');
                }
                else {
                    this.Label_onekeystrong.setText('强 化');
                }

                break;
            }
            case 1: {
                this.Label_onekeystrong.setText('停止强化');
                break;
            }
            case 2: {
                this.Label_onekeystrong.setText('已满级');
                break;
            }
        }
    },

    setOneStarState(state) {
        switch (state) {
            case 0: {
                if (this.autoStar) {
                    this.Label_onekeystar.setText('自动升星');
                }
                else {
                    this.Label_onekeystar.setText('升 星');
                }
                break;
            }
            case 1: {
                this.Label_onekeystar.setText('停止升星');
                break;
            }
            case 2: {
                this.Label_onekeystar.setText('已满级');
                break;
            }
        }
    },

    onClickOneKeyStar() {
        if (this.autoStar || this.getOneState(ONE_TYPE.ONE_SHENGXING) == 1) {
            this.toggleOneState(ONE_TYPE.ONE_SHENGXING);
        }
        else {
            this.star();
        }
    },

    star() {
        var starEquip = this.curSelStarEquip;//this.selEquip;
        if (starEquip) {
            let itemLv = starEquip.level;
            let starLimitConfig = Game.ConfigController.GetConfigById('starlimit_data', itemLv, 'level');
            let stronglevel = Game._.get(starEquip, 'equipdata.stronglevel', 0);
            if (starLimitConfig) {
                if (stronglevel >= starLimitConfig.star) {
                    this.setOneState(ONE_TYPE.ONE_SHENGXING, 2);
                    this.showTips('装备星级已满级。');
                    return;
                }
            }
        }
        if (this.curSelStarEquip) {
            Game.NetWorkController.SendProto('msg.StrongEquip', {
                thisid: this.curSelStarEquip.thisid,
            });
        }
    },

    onclickAutoStar() {
        this.autoStar = !this.autoStar;
        if (this.getOneState(ONE_TYPE.ONE_SHENGXING) == 1) {
            this.setOneState(ONE_TYPE.ONE_SHENGXING, 0);
        }
        this.updateCheck();
    },

    toggleOneState(type) {
        var state = this.getOneState(type);
        switch (state) {
            case 0: {
                this.setOneState(type, 1);
                break;
            }
            case 1: {
                this.setOneState(type, 0);
                break;
            }
            case 2: {
                this.setOneState(type, 1);
                break;
            }
        }
    },

    onClickLuckUp() {
        if (this.curSelStarEquip) {
            Game.NetWorkController.SendProto('msg.StrongEquip', {
                thisid: this.curSelStarEquip.thisid,
                useluck: 1
            });
        }
    },

    onClickOneKeySoul() {
        if (this.selectSoulType == 1) {
            let equipsId = [];
            equipsId.push(this.curSelSoulEquip.thisid);     //第一位放入要提升的装备

            let soulEquips = Game.EquipModel.GetSoulEquips(this.curSelSoulEquip);
            if (soulEquips.thisid != 0) {
                equipsId.push(soulEquips.thisid);
            }

            let soulLv = Game._.get(this.curSelSoulEquip, 'equipdata.godnormal.level', 0);
            if (soulLv < 15) {
                Game.NetWorkController.SendProto('msg.suckUpGodEquip', {
                    equipthisids: equipsId
                });
            } else {
                this.showTips('神器已经满级，不能升级!');
            }
        } else if (this.selectSoulType == 2) {
            Game.NetWorkController.SendProto('msg.transferGodEquip', {
                mainthisid: this.curSelSoulEquip.thisid,
                secondthisid: this.findSoulEquip.thisid
            });
        } else if (this.selectSoulType == 3) {
            this.openView(Game.UIName.UI_FORGEVIEW, 1);
        }
    },
    onClickPutOnStar() {
        this.curSelStarEquip = Game.EquipModel.GetUseEquipByTypes(Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, this.curSelStarEquip.type);
        this.openView(Game.UIName.UI_EQUIPINLAYNODE, this.curSelStarEquip);
    },
    onClickGemUp() {
        let equiptype = Game._.get(this, 'curSelGemEquip.type', 0);
        let gemtype = Game.EquipModel.GetGemTypeByEquipType(equiptype, this.curGemIndex);
        let gemData = Game.EquipModel.GetGemDataByType(this.curSelGemEquip, gemtype);
        if (gemData == null) {
            //镶嵌
            let id = Game.EquipModel.stoneidByType[gemtype];
            let item = Game.ItemModel.GetItemByBaseId(id);
            Game.NetWorkController.SendProto('msg.putOnStone', {
                equipthisid: this.curSelGemEquip.thisid,
                stonethisid: Game._.get(item, 'thisid', id),
                pos: this.curGemIndex
            });
        } else {
            //升级
            let result = Game.EquipModel.CantGemUp(this.curGemId, Game._.get(this, 'curSelGemEquip.level', 1));
            if (result == 1) {
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '已经满级了');
                return;
            } else {
                Game.NetWorkController.SendProto('msg.levelUpStone', { equipthisid: this.curSelGemEquip.thisid, pos: this.curGemIndex });
            }
        }
    },
    onClickOpenSlot() {
        Game.NetWorkController.SendProto('msg.makeHole', {
            thisid: this.curSelGemEquip.thisid
        });
    },
    //====================  事件回调  ====================
    onUserInfoRefresh() {
        this.Label_playname.setText(Game.UserModel.GetUserName());
        this.Label_occupation.setText(Game.UserModel.GetJobName(Game.UserModel.GetUserOccupation()));
        this.Label_levelnum.setText(Game.UserModel.GetLevelDesc(Game.UserModel.GetLevel()));
        this.Label_sociatyname.setText(Game.UserModel.GetSeptname() != '' && Game.UserModel.GetSeptname() || '无');
        this.Label_countryname.setText(Game.UserModel.GetCountryName(Game.UserModel.GetCountry()));
        this.Sprite_occupation.SetSprite(Game.UserModel.GetJobIcon(Game.UserModel.GetUserOccupation()));
    },

    onUserBaseInfoRefresh() {
        this.Label_hpnum.setText(Game.UserModel.GetUserBaseInfo().hp);
        this.Label_mpnum.setText(Game.UserModel.GetUserBaseInfo().mp);

        this.onUserStrengthRefresh();
    },

    onUserStrengthRefresh() {
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
        this.Label_fight.node.color = tColor;
        this.Label_strength.node.color = tColor;

        this.Label_fight.setText(Game.Tools.UnitConvert(Game.UserModel.GetUserMainInfo().fightval) + ' (' + perval + '%)');
        this.Label_strength.setText(curStrength + '/' + maxStrength);

        this.Button_addStrength.interactable = curStrength < maxStrength;
    },

    onUpdateEquip() {
        switch (this.pageState) {
            case Game.Define.EquipPageType.strong:
                this.onFindCurStrongEquip();
                break;
            case Game.Define.EquipPageType.star:
                this.onFindCurStarEquip();
                break;
            case Game.Define.EquipPageType.soul:
                this.onFindCurSoulEquip();
                break;
            case Game.Define.EquipPageType.gem:
                this.onFindCurGemEquip();
                break;
        }

        this.updateRedAll();
    },

    updateRedAll() {
        if (this.pageState == Game.Define.EquipPageType.equip) {
            this.updateRed(Game.Define.EquipPageType.equip);
            this.updateRed(Game.Define.EquipPageType.strong);
            this.updateRed(Game.Define.EquipPageType.star);
            this.updateRed(Game.Define.EquipPageType.gem);
            this.updateRed(Game.Define.EquipPageType.soul);
        } else if (this.pageState == Game.Define.EquipPageType.soul) {
            this.updateRed(Game.Define.EquipPageType.soul);
        } else {
            this.updateRed(Game.Define.EquipPageType.strong);
            this.updateRed(Game.Define.EquipPageType.star);
            this.updateRed(Game.Define.EquipPageType.gem);
        }
    },

    updateRed(state) {
        switch (state) {
            case Game.Define.EquipPageType.equip:
                let equips = Game.EquipModel.FindOneKeyChangeEquips();
                this.Sprite_onekeyRed.node.active = equips.length > 0;
                this.Sprite_btmEquipRed.node.active = equips.length > 0;
                break;
            case Game.Define.EquipPageType.strong:
                this.Sprite_btmStrongRed.node.active = Game.EquipModel.FindNewStrong();
                this.Sprite_strongRed.node.active = Game.EquipModel.FindNewStrong();
                break;
            case Game.Define.EquipPageType.star:
                this.Sprite_btmStarRed.node.active = Game.EquipModel.FindNewStar() || Game.EquipModel.FindNewStarStone();
                this.Sprite_oneKeyStarRed.node.active = Game.EquipModel.FindNewStar() && !Game.EquipModel.FindNewStarStone();
                this.Sprite_putStarRed.node.active = Game.EquipModel.FindNewStarStone();
                break;
            case Game.Define.EquipPageType.soul:
                this.Sprite_btmSoulRed.node.active = Game.EquipModel.FindNewSoul() || Game.EquipModel.FindNewSoulForge();
                this.Sprite_oneKeySoulRed.node.active = Game.EquipModel.FindNewSoul() || Game.EquipModel.FindNewSoulForge();
                break;
            case Game.Define.EquipPageType.gem:
                this.Node_oneKeyGemRed.active = Game.EquipModel.FindOneKeyGemEquip().type != 0;
                break;
        }
    },

    onLuckNumRefresh(data) {
        this.curSelStarEquip = Game.EquipModel.GetUseEquipByTypes(Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, data.type);
        let stronglevel = Game._.get(this.curSelStarEquip, 'equipdata.stronglevel', 0);
        let starcostNextConfig = Game.ConfigController.GetConfigById('starcost_data', stronglevel + 1, 'star');
        if (starcostNextConfig) {
            this.Label_luckNum.setText(Game.Tools.UnitConvert(data.lucknum) + "/" + Game.Tools.UnitConvert(starcostNextConfig.costluck));
            this.Sprite_luckProgress.progress = (data.lucknum / starcostNextConfig.costluck).toFixed(2);
            this.Label_luckperNum.setText(starcostNextConfig.clientper + "%");

            this.Button_onekeystar.node.active = data.lucknum < starcostNextConfig.costluck;
            this.Button_luckUp.node.active = data.lucknum >= starcostNextConfig.costluck;
        }
    },
    onLuckyInfoRefresh(num) {
        if (this.pageState == Game.Define.EquipPageType.gem) {
            if (this.Node_luck.active) {
                let gemType = Game.EquipModel.GetGemTypeByEquipType(Game._.get(this, 'curSelGemEquip.type', 0), this.curGemIndex);
                let gemData = Game.EquipModel.GetGemDataByType(this.curSelGemEquip, gemType);
                let curLevel = 0;
                if (gemData != null) {
                    curLevel = Game.EquipModel.GetGemLevelById(gemData.objid);
                }
                let stoneDefine = Game.ConfigController.GetConfigById('stone_data', curLevel, 'level');
                let totalLucky = Game._.get(stoneDefine, 'maxlucky', 1);
                if (totalLucky == 0) {
                    this.Progress_rate.progress = 1;
                    this.Label_gemLuck.setText(num);
                } else {
                    this.Progress_rate.progress = num / totalLucky;
                    this.Label_gemLuck.setText(num + '/' + totalLucky);
                }
            }
        }
    },

    onRefreshEquipDressRed() {
        this.Sprite_onekeyRed.node.active = true;
        this.Sprite_btmEquipRed.node.active = true;
    },

    //====================  更新函数  ====================
    changePage(page) {
        if (this.pageState == page) { return; }
        this.pageState = page;
        Game.EquipModel.curEquipPage = page;

        //数据还原
        this.guideEquip = null;
        this.selEquip = null;
        this.curSelStrongEquip = null;
        this.curSelStarEquip = null;
        this.curSelSoulEquip = null;
        this.curSelGemEquip = null;
        this.curGemIndex = -1;
        this.curGemId = -1;
        this.initOneKeyObjs();
        this.initEquipNodes();

        this.setOneState(ONE_TYPE.ONE_BAOSHI, 0);
        this.setOneState(ONE_TYPE.ONE_QIANGHUA, 0);
        this.setOneState(ONE_TYPE.ONE_LINGHUN, 0);
        this.setOneState(ONE_TYPE.ONE_SHENGXING, 0);

        switch (this.pageState) {
            case Game.Define.EquipPageType.equip:
                Game._.forEach(this.Nodes_EquipNodes, function (component) {   //还原坐标
                    component.backToOldParent();
                });
                break;
            case Game.Define.EquipPageType.strong:
                this.onFindCurStrongEquip();
                break;
            case Game.Define.EquipPageType.star:
                this.onFindCurStarEquip();
                break;
            case Game.Define.EquipPageType.gem:
                this.onFindCurGemEquip();
                break;
            case Game.Define.EquipPageType.soul:
                this.onFindCurSoulEquip();
                break;
        }
        this.onUpdateBtnImg();

        this.Node_Equip.active = page == Game.Define.EquipPageType.equip;
        this.Node_OnekeyEquip.active = page != Game.Define.EquipPageType.equip;
        this.Effect_Sel.active = page != Game.Define.EquipPageType.equip;

        this.Node_strong.active = page == Game.Define.EquipPageType.strong;
        this.Node_star.active = page == Game.Define.EquipPageType.star;
        this.Node_gem.active = page == Game.Define.EquipPageType.gem;
        this.Node_soul.active = page == Game.Define.EquipPageType.soul;
    },
    onUpdateBtnImg() {
        this.Button_equip.interactable = this.pageState != Game.Define.EquipPageType.equip;
        this.Button_strong.interactable = this.pageState != Game.Define.EquipPageType.strong;
        this.Button_star.interactable = this.pageState != Game.Define.EquipPageType.star;
        this.Button_gem.interactable = this.pageState != Game.Define.EquipPageType.gem;
        this.Button_soul.interactable = this.pageState != Game.Define.EquipPageType.soul;
    },
    onFindCurStrongEquip() {
        let strongEquip = null;
        if (this.selEquip != null) {
            this.selEquip = Game.EquipModel.GetUseEquipByTypes(Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, this.selEquip.type);
            strongEquip = this.selEquip;
        } else {
            strongEquip = Game.EquipModel.FindOneKeyStrongEquip();
        }
        this.curSelStrongEquip = strongEquip;
        this.onRefreshEquipNodePos(strongEquip);

        if (strongEquip.equipdata.newstronglevel < Game.UserModel.userMaxLv) {
            // this.Label_onekeystrong.setText('一键强化');

            let equipstrongConfig = Game.ConfigController.GetConfigById('newsequipstrong_data', strongEquip.equipdata.newstronglevel + 1);
            if (equipstrongConfig) {
                this.Label_strongProLast.setText(equipstrongConfig.allvalue - equipstrongConfig.addvalue);
                this.Label_strongProNext.setText(equipstrongConfig.allvalue);

                if (Game.CurrencyModel.GetMoney() < equipstrongConfig.strongcost) {
                    this.Labels_coin.SetLabelColor(
                        Game._.fill(Array(3), Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red))
                    );
                } else {
                    this.Labels_coin.SetLabelColor(
                        Game._.fill(Array(3), Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green))
                    );
                }
                this.Labels_coin.SetInfo(
                    Game._.fill(Array(3), Game.Tools.UnitConvert(Game.CurrencyModel.GetMoney()) + "/" + Game.Tools.UnitConvert(equipstrongConfig.strongcost))
                );
            }
            this.Label_strongPro.setText(Game.EquipModel.GetEquipMainProperty(strongEquip));
            this.Label_strongLvLast.setText(strongEquip.equipdata.newstronglevel);
            this.Label_strongLvNext.setText(strongEquip.equipdata.newstronglevel + 1);
        }
        if (strongEquip.equipdata.newstronglevel >= Game.UserModel.userMaxLv) {

            this.setOneState(ONE_TYPE.ONE_QIANGHUA, 2);
        }
        else if (this.getOneState(ONE_TYPE.ONE_QIANGHUA) == 2) {
            this.setOneStrongState(0);
        }
        this.Node_strongEffBg.active = true;
        this.Labels_coin.SetActive(['Node_coin']);
        this.Label_strongTip.node.active = false;
    },
    onFindCurStarEquip() {
        let starEquip = null;
        if (this.selEquip != null) {
            this.selEquip = Game.EquipModel.GetUseEquipByTypes(Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, this.selEquip.type);
            starEquip = this.selEquip;
        } else {
            starEquip = Game.EquipModel.FindOneKeyStarEquip();
        }
        this.onRefreshEquipNodePos(starEquip);

        let stronglevel = Game._.get(starEquip, 'equipdata.stronglevel', 0);
        //星星特效
        if (stronglevel > 0) {
            let tIndex = Game.EquipModel.GetStarEffectIndex(stronglevel);
            let tWhole = Math.floor(stronglevel / 2);
            let tHasHalf = stronglevel % 2 != 0;

            for (let i = 0; i < 15; i++) {
                if (i < tWhole) {      //播放全星动画
                    this.Animation_Stars[i].play(`effect_start${tIndex}`);
                    this.Sprite_Stars[i].node.active = true;
                } else if (tHasHalf) {     //播放半星动画
                    tHasHalf = false;
                    this.Animation_Stars[i].play(`effect_bxstar${tIndex}`);
                    this.Sprite_Stars[i].node.active = true;
                } else {
                    this.Sprite_Stars[i].node.active = false;
                }
            }
        }
        this.Node_Stars.active = stronglevel > 0;

        let itemLv = starEquip.level;
        let starLimitConfig = Game.ConfigController.GetConfigById('starlimit_data', itemLv, 'level');
        if (starLimitConfig) {
            if (stronglevel < starLimitConfig.star) {
                if (this.curSelStarEquip == null) {     //请求幸运值相关信息
                    Game.NetWorkController.SendProto('msg.ReqLuckNum', { type: starEquip.type });
                } else {
                    if (this.curSelStarEquip.thisid != starEquip.thisid) {
                        Game.NetWorkController.SendProto('msg.ReqLuckNum', { type: starEquip.type });
                    }
                }
                //升星石镶嵌处理bengin
                let starStones = Game.ItemModel.GetItemsByType(Game.ItemDefine.ITEMTYPE.ItemType_StarStone);
                if (starStones.length > 0) {
                    starStones = Game._.sortBy(starStones, function (info) {
                        return info.baseid;
                    });

                    let isFlag = false;
                    for (let i = 0; i < starStones.length; i++) {
                        if (Game.ItemModel.GetStarItemLevel(starStones[0]) > stronglevel) {
                            isFlag = true;
                            break;
                        }
                    }
                    this.Button_putOnStar.node.active = isFlag;
                } else {
                    this.Button_putOnStar.node.active = false;
                }
                //升星石镶嵌处理end
                let nextLv = stronglevel + 1;
                let starcostNextConfig = Game.ConfigController.GetConfigById('starcost_data', nextLv, 'star');
                if (starcostNextConfig) {
                    // this.Label_onekeystar.setText('一键升星');
                    this.Label_starPro.setText(Game.EquipModel.GetEquipMainProperty(starEquip));
                    if (stronglevel == 0) {
                        this.Label_starProLast.setText(0);
                    } else {
                        let starcostConfig = Game.ConfigController.GetConfigById('starcost_data', stronglevel, 'star');
                        if (starcostConfig) {
                            this.Label_starProLast.setText(starcostConfig.pow + "%");
                        }
                    }
                    this.Label_starProNext.setText(starcostNextConfig.pow + "%");
                    this.Label_starLvLast.setText(stronglevel);
                    this.Label_starLvNext.setText(nextLv);

                    if (Game.CurrencyModel.GetMoney() < starcostNextConfig.cost) {
                        this.Labels_coin.SetLabelColor(
                            Game._.fill(Array(3), Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red))
                        );
                    } else {
                        this.Labels_coin.SetLabelColor(
                            Game._.fill(Array(3), Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green))
                        );
                    }
                    this.Labels_coin.SetInfo(
                        Game._.fill(Array(3), Game.Tools.UnitConvert(Game.CurrencyModel.GetMoney()) + "/" + Game.Tools.UnitConvert(starcostNextConfig.cost))
                    );

                    if (Game.ItemModel.GetItemNumById(1) < starcostNextConfig.stonenum) {
                        this.Label_jingshi.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
                    } else {
                        this.Label_jingshi.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green);
                    }
                    this.Label_jingshi.setText(Game.Tools.UnitConvert(Game.ItemModel.GetItemNumById(1)) + "/" + Game.Tools.UnitConvert(starcostNextConfig.stonenum));
                    if (this.getOneState(ONE_TYPE.ONE_SHENGXING) == 2) {
                        this.setOneState(ONE_TYPE.ONE_SHENGXING, 0);
                    }
                }
            } else {
                this.setOneState(ONE_TYPE.ONE_SHENGXING, 2);

                // this.Label_onekeystar.setText('已满级');
                this.Button_onekeystar.node.active = true;
                this.Button_luckUp.node.active = false;
                this.Button_putOnStar.node.active = false;
                this.curSelStarEquip = starEquip;
            }
            this.Labels_coin.SetActive([stronglevel < starLimitConfig.star ? 'Node_coin' : '']);
            this.Node_jingshi.active = stronglevel < starLimitConfig.star;
            this.Node_starEffBg.active = stronglevel < starLimitConfig.star;
        }
    },

    onFindCurSoulEquip() {
        let soulEquip = null;
        if (this.selEquip != null) {
            this.selEquip = Game.EquipModel.GetUseEquipByTypes(Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, this.selEquip.type);
            soulEquip = this.selEquip;
        } else {
            soulEquip = Game.EquipModel.FindOneKeySoulEquip();
        }
        this.curSelSoulEquip = soulEquip;
        Game.GlobalModel.choosedSoulType = Game._.get(soulEquip, "type", 0);
        let canForge = Game.EquipModel.checkCanForgeSoulEquipByType(Game.GlobalModel.choosedSoulType);
        this.onRefreshEquipNodePos(soulEquip);

        let isHaveSoul = Game.EquipModel.IsHaveSoul(soulEquip);
        if (isHaveSoul) {       //有灵魂的装备
            this.selectSoulType = 1;

            let soulLv = soulEquip.equipdata.godnormal.level;
            let soulExp = soulEquip.equipdata.godnormal.exp;
            let soulType = soulEquip.equipdata.godnormal.type;

            let godTypeId = (soulType - 1) * 15 + soulLv;
            let godConfigLast = Game.ConfigController.GetConfigById('godtype_data', godTypeId);
            if (godConfigLast) {
                let persentLast = godConfigLast.num * 100;
                this.Label_soulLvLast.setText(soulLv);
                this.Label_soulProLast.setText(`${Math.round(persentLast)}%`);
            }

            this.Label_soulPro.setText(Game.EquipModel.GetNGodStr(soulType));
            if (soulLv >= 15) {
                this.Label_soulProNext.setText('满级');
                this.Label_soulLvNext.setText('满级');
                this.Label_onekeySoul.setText('已满级');
            } else {
                this.Label_onekeySoul.setText('吞噬');
                let godTypeNextId = (soulType - 1) * 15 + (soulLv + 1);
                let godConfigNext = Game.ConfigController.GetConfigById('godtype_data', godTypeNextId);
                if (godConfigNext) {
                    let persentNext = godConfigNext.num * 100;
                    this.Label_soulLvNext.setText(soulLv + 1);
                    this.Label_soulProNext.setText(`${Math.round(persentNext)}%`);
                }
            }

            let soulLvUpConfig = Game.ConfigController.GetConfigById('godlevelup_data', soulLv, 'level');
            if (soulLvUpConfig) {
                let needExp = soulLvUpConfig.upnum;
                if (soulLv >= 15) {
                    this.Sprite_soulProgress.progress = 1;
                } else {
                    this.Sprite_soulProgress.progress = (soulExp / needExp).toFixed(2);
                }
                this.Label_soulExp.setText(soulExp + "/" + needExp);
            }

            let soulLength = Game.EquipModel.GetSoulEquips(soulEquip).num;
            if (soulLength > 0) {
                this.Label_soulmaterial.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green);
            } else {
                this.Label_soulmaterial.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
            }
            this.Label_soulmaterial.setText(soulLength + "/1");
        } else {        //没灵魂的装备
            this.findSoulEquip = Game._.find(Game.ItemModel.GetItems(), function (info) {
                return info.packagetype == Game.ItemDefine.PACKAGETYPE.PACKAGE_EQUIP && info.type == soulEquip.type && Game.EquipModel.IsHaveSoul(info);
            });

            if (this.findSoulEquip != null) {    //当玩家包裹中存在一件灵魂装备，该部位的装备身上没有灵魂时
                this.selectSoulType = 2;
                this.Label_onekeySoul.setText('吸收灵魂');
            } else {    //前往铁匠铺
                this.selectSoulType = 3;
                this.Label_onekeySoul.setText('前往铁匠铺');
                if (canForge) {
                    this.Sprite_oneKeySoulRed.node.active = true;
                } else {
                    this.Sprite_oneKeySoulRed.node.active = false;
                };
            }
        }
        this.Label_canSoulTip.node.active = this.selectSoulType == 2;
        this.Label_canFrogeTip.node.active = this.selectSoulType == 3;
        this.Node_soulEffBg.active = isHaveSoul;
    },
    onFindCurGemEquip() {
        let gemEquip = null;
        if (this.guideEquip != null) {
            gemEquip = Game.EquipModel.GetUseEquipByTypes(Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, this.guideEquip.type);
            this.guideEquip = null;
        } else {
            if (this.selEquip != null) {
                this.selEquip = Game.EquipModel.GetUseEquipByTypes(Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, this.selEquip.type);
                gemEquip = this.selEquip;
            } else {
                let result = Game.EquipModel.FindOneKeyGemEquip();
                gemEquip = result.equip;
            }
        }
        if (Game.GuideController.runningGuide) {
            this.guideEquip = gemEquip;
        }
        this.curSelGemEquip = gemEquip;
        this.onRefreshEquipNodePos(gemEquip);
        let slots = Game._.get(gemEquip, 'equipdata.stone', []);
        let hole = Game._.get(gemEquip, 'equipdata.hole', 0);
        let equipType = Game._.get(gemEquip, 'type', 0);
        //看看有没有开过槽
        this.curGemIndex = 0;
        this.curGemId = 0;
        if (hole > 0) {
            //选一个宝石等级最低的吧
            let minLevelResult = Game.EquipModel.GetEquipMinLevelGem(equipType);
            if (minLevelResult != null) {
                this.curGemIndex = minLevelResult.index;
                this.curGemId = minLevelResult.id;
            }
        }
        //宝石提升的百分比
        let holeRiseDefine = Game.ConfigController.GetConfigById('holerise_data', hole);
        this.Label_addition.setText(Game._.get(holeRiseDefine, 'rise', 0) + '%');
        //宝石现在的增加量
        for (let i = 1; i <= 4; i++) {
            let gemType = Game.EquipModel.GetGemTypeByEquipType(equipType, i);
            //调整宝石数据位置
            let node = this.Nodes_gemSlots[gemType - 1];
            node.setSiblingIndex(i);
            let position = this.gemAttrPosoition[i - 1];
            node.position = position;
            //设置当前宝石的增加量
            let label = this.Labels_gemAddition[gemType - 1];
            let titlelabel = this.Labels_gemAdditionTitle[gemType - 1];
            //找到这个宝石的数据
            if (i > hole) {
                label.setText('未开启');
                label.enableOutline(false);
                titlelabel.enableOutline(false);
                label.setColor(cc.hexToColor(GemGrayColor));
                titlelabel.setColor(cc.hexToColor(GemGrayColor));
            } else {
                label.enableOutline(true);
                titlelabel.enableOutline(true);
                label.setColor(cc.hexToColor(GemAdditionColor));
                titlelabel.setColor(cc.hexToColor(GemTitleColor[gemType - 1]));
                let stone = Game._.find(slots, { type: gemType });
                if (stone == null || stone.objid == null || stone.objid == 0) {
                    label.setText('未镶嵌');
                } else {
                    let stonelevel = (stone.objid - Game.EquipModel.stoneidByType[gemType] + 1);
                    let additionDefine = Game.ConfigController.GetConfigById('stone_data', stonelevel, 'level');
                    label.setText('+' + Game._.get(additionDefine, 'num', 0));
                }
            }

            //是不是选中了这个
            let selectedNode = this.Nodes_gemSelected[gemType - 1];
            selectedNode.active = (this.curGemIndex == i);
            label.fontSize = (this.curGemIndex == i) ? 30 : 24;
            titlelabel.fontSize = (this.curGemIndex == i) ? 30 : 24;
        }
        //当前要操作的宝石
        let gemType = Game.EquipModel.GetGemTypeByEquipType(equipType, this.curGemIndex);
        let gemData = Game.EquipModel.GetGemDataByType(gemEquip, gemType);
        let curLevel = 0;
        if (gemData != null) {
            curLevel = Game.EquipModel.GetGemLevelById(gemData.objid);
        }
        this.Node_curGem.active = (hole > 0);
        if (this.Node_curGem.active) {
            this.Label_curGem.setText(Game.EquipModel.GetGemNameByType(gemType));
            let additionDefine = Game.ConfigController.GetConfigById('stone_data', curLevel, 'level');
            this.Label_preAddition.setText(Game._.get(additionDefine, 'num', 0));
            additionDefine = Game.ConfigController.GetConfigById('stone_data', curLevel + 1, 'level');
            this.Label_nextAddition.setText(Game._.get(additionDefine, 'num', 0));
        }
        //幸运值
        this.Node_luck.active = (hole > 0)
        if (this.Node_luck.active) {
            if (gemData != null) {
                Game.ItemModel.ReqStoneLucky(curLevel);
            }
            this.onLuckyInfoRefresh(Game.ItemModel.GetStoneLuck(curLevel));
            let stoneupDefine = Game.ConfigController.GetConfigById('stoneup_data', Game._.get(gemData, 'objid', 0));
            this.Label_rate.setText(Game._.get(stoneupDefine, 'per', 100) + '%');
        }
        //我拥有的宝石数量
        this.Node_has.active = (hole > 0);
        this.Node_tip.active = (hole == 0);
        if (this.Node_has.active) {
            let gemObjDefine = Game.ItemModel.GetItemConfig(Game.EquipModel.stoneidByType[gemType]);
            this.Sprite_hasGem.SetSprite(Game._.get(gemObjDefine, 'pic', ''));
            let costItem = 1;
            let costMoney = 0;
            if (gemData != null) {
                let costDefine = Game.ConfigController.GetConfigById('stoneup_data', gemData.objid);
                if (costDefine != null) {
                    costItem = Game._.get(costDefine, 'num', 1);
                    costMoney = Game._.get(costDefine, 'money', 0);
                }
            }
            let hasNum = Game.ItemModel.GetItemNumById(Game.EquipModel.stoneidByType[gemType]);
            this.Label_hasGem.setText(hasNum + '/' + costItem);
            this.Label_hasGem.setColor((costItem > hasNum) ? Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red) : Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green));
            if (Game.CurrencyModel.GetMoney() < costMoney) {
                this.Labels_coin.SetLabelColor(
                    Game._.fill(Array(3), Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red))
                );
            } else {
                this.Labels_coin.SetLabelColor(
                    Game._.fill(Array(3), Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green))
                );
            }
            this.Labels_coin.SetInfo(
                Game._.fill(Array(3), Game.Tools.UnitConvert(Game.CurrencyModel.GetMoney()) + "/" + Game.Tools.UnitConvert(costMoney))
            );
        }
        this.Labels_coin.SetActive(['Node_coin']);
        //按钮的红点
        this.Node_upRed.active = (hole > 0 && (Game.EquipModel.CanGemInlay(equipType) == this.curGemIndex || !Game.EquipModel.CantGemUp(this.curGemId, Game._.get(this, 'curSelGemEquip.level', 1))));
        this.Node_openSlotRed.active = Game.EquipModel.GetOpenSlotHasNum(hole) >= Game.EquipModel.GetOpenSlotCostNum(hole)
    },
    onEquipControlSel(data) {
        this.selEquip = data;
        if (this.pageState == Game.Define.EquipPageType.strong) {
            this.onFindCurStrongEquip();
        } else if (this.pageState == Game.Define.EquipPageType.star) {
            this.onFindCurStarEquip();
        } else if (this.pageState == Game.Define.EquipPageType.soul) {
            this.onFindCurSoulEquip();
        } else if (this.pageState == Game.Define.EquipPageType.gem) {
            this.onFindCurGemEquip();
        }
    },
    onRefreshEquipNodePos(equip) {
        // Game._.forEach(this.Nodes_EquipNodes, function (component) {
        //     component.backToOldParent();
        // });

        let equipPos = Game.EquipModel.GetStrongEquipPos(equip);
        this.Effect_Sel.position = this.Nodes_EquipNodes[equipPos].node.position;
        this.Effect_Sel.active = true;

        // let component = this.Nodes_EquipNodes[equipPos];
        // if (component) {
        //     component.setNewParent(this.Node_OnekeyEquip);
        // }
    },

});
