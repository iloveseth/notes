const Game = require('../../Game');

const pageSystem = {
    system_strong: 1,           //强化
    system_star: 2,             //升星
    system_gem: 3,              //宝石
    system_soul: 4,             //灵魂
    system_advance: 5,          //进阶
}

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_equipName: { default: null, type: cc.Label_ },
        Label_equipNameOutline: { default: null, type: cc.LabelOutline },
        Sprite_superStar: { default: null, type: cc.Sprite },
        Sprite_changeRed: { default: null, type: cc.Sprite_ },
        Button_change: { default: null, type: cc.Button_ },
        Button_smelt: { default: null, type: cc.Button_ },
        Node_System: { default: null, type: cc.Node },
        Node_strong: { default: null, type: cc.Node },
        Node_star: { default: null, type: cc.Node },
        Node_gem: { default: null, type: cc.Node },
        Node_soul: { default: null, type: cc.Node },
        Node_lockEquip: { default: null, type: cc.Node },
        Sprite_lockEquip: { default: null, type: cc.Sprite_ },
        Sprite_strong: { default: null, type: cc.Sprite_ },
        Sprite_star: { default: null, type: cc.Sprite_ },
        Sprite_gem: { default: null, type: cc.Sprite_ },
        Sprite_soul: { default: null, type: cc.Sprite_ },
        
        Node_singleItem: { default: null, type: cc.Node },
        Node_equipPropertyNode: { default: null, type: cc.Node },

        Label_strongResult: { default: null, type: cc.Label_ },
        Label_strongLv: { default: null, type: cc.Label_ },
        Label_strongCost: { default: null, type: cc.Label_ },

        Label_starSucc: { default: null, type: cc.Label_ },
        Label_maxStar: { default: null, type: cc.Label_ },
        Label_starNum: { default: null, type: cc.Label_ },
        Label_starSplit: { default: null, type: cc.Label_ },
        Label_money: { default: null, type: cc.Label_ },
        Label_starLuckNum: { default: null, type: cc.Label_ },
        Label_starVipAdd: { default: null, type: cc.Label_ },
        Button_luckUp: { default: null, type: cc.Button_ },

        Label_topLvProperty: { default: null, type: cc.Label_ },
        Sprite_selgem: { default: null, type: cc.Sprite_ },
        Sprite_locks: { default: [], type: [cc.Sprite_] },
        Sprite_gems: { default: [], type: [cc.Sprite_] },
        Button_takeoffAll: { default: null, type: cc.Button_ },
        Button_lvupgem: { default: null, type: cc.Button_ },
        Button_cancelgem: { default: null, type: cc.Button_ },
        Button_selgemok: { default: null, type: cc.Button_ },

        Button_advanced: { default: null, type: cc.Button_ },
        Node_advance: { default: null, type: cc.Node },
        Sprite_advances: { default: [], type: [cc.Sprite_] },
        Label_advanceTip: { default: null, type: cc.Label_ },
        Label_putinAll: { default: null, type: cc.Label_ },

        Node_soulInit: { default: null, type: cc.Node },
        Node_soulup: { default: null, type: cc.Node },
        Node_soulinherit: { default: null, type: cc.Node },
        Node_soulinheritBm: { default: null, type: cc.Node },
        Node_curUpSingleItem: { default: null, type: cc.Node },
        Node_selUpSingleItem: { default: [], type: [cc.Node] },
        Node_curTransferSingleItem: { default: null, type: cc.Node },
        Node_selTransferSingleItem: { default: null, type: cc.Node },
        Node_nosoul: { default: null, type: cc.Node },
        Sprite_soulProgressTarget: { default: null, type: cc.ProgressBar },
        Sprite_soulProgress: { default: null, type: cc.ProgressBar },
        Label_soulLv: { default: null, type: cc.Label_ },
        Label_soulExp: { default: null, type: cc.Label_ },
        Label_upmoney: { default: null, type: cc.Label_ },
        Label_targetTransferEquip: { default: null, type: cc.Label_ },
        Label_selectTransferEquip: { default: null, type: cc.Label_ },
        Label_transferPro: { default: null, type: cc.Label_ },
        Label_transferMoney: { default: null, type: cc.Label_ },
        Label_selectSoulequip: { default: [], type: [cc.Label_] },
        Button_changeTransfer: { default: null, type: cc.Button_ },
        Button_changeUp: { default: null, type: cc.Button_ },

        button_hide: [cc.Button_],
    },

    onLoad() {
        this.initView();
    },

    onEnable() {
        this.initData();
        this.initNotification();
        this.handleHideButton();
        this.updateView(this._data);
        this.onChangePage(pageSystem.system_strong);
    },

    handleHideButton(){
        let isMeEquip = Game.GlobalModel.GetIsLookMyEquip();
        if(!isMeEquip){
            this.button_hide.forEach(e => {
                e.node.active = false;
            });
        }
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.ITEM_REFRESH, this, this.updateView);
        Game.NotificationController.On(Game.Define.EVENT_KEY.GET_SEL_EQUIP, this, this.updateSoul);
        Game.NotificationController.On(Game.Define.EVENT_KEY.GET_SEL_ITEM, this, this.onBackSelStone);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ITEM_REFRESH, this, this.updateView);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GET_SEL_EQUIP, this, this.updateSoul);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GET_SEL_ITEM, this, this.onBackSelStone);
    },

    initData() {
        this.itemInfo = null;
        this.equipInfo = null;
        this.itemConfig = null;
        this.isLvupStone = true;
        this.selectStonePos = 1;
        this.selectStoneLvupPos = 0;

        this.curPage = 0;
    },

    initView() {
        this._singleItemComponent = this.Node_singleItem.getComponent('SingleItemNode');
        this._equipPropertyComponent = this.Node_equipPropertyNode.getComponent('EquipPropertyNode');
    },

    updateView(info) {
        if (this.itemInfo != null) {        //只更新当前在使用的装备
            if (this.itemInfo.thisid != info.thisid) {
                return;
            }
        }
        this.itemInfo = info;
        this.equipInfo = info.equipdata;
        this.itemConfig = Game.ItemModel.GetItemConfig(this.itemInfo.baseid);
        if (this.itemConfig) {
            this.Label_equipName.node.color = Game.ItemModel.GetItemLabelColor(this.equipInfo.color);
            this.Label_equipNameOutline.color = Game.ItemModel.GetItemLabelOutlineColor(this.equipInfo.color);
            let newstronglevel = Game._.get(this, 'itemInfo.equipdata.newstronglevel', 0);
            if (newstronglevel > 0) {
                this.Label_equipName.setText(Game.UserModel.GetLevelDesc(this.itemInfo.level) + this.itemConfig.name + '  +' + this.equipInfo.newstronglevel);
            } else {
                this.Label_equipName.setText(Game.UserModel.GetLevelDesc(this.itemInfo.level) + this.itemConfig.name);
            }
        }
        
        this.Sprite_changeRed.node.active = Game.EquipModel.FindEquipNewFlagByType(this.itemInfo.type);
        this.Button_change.node.active = this.itemInfo.packagetype == Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP;
        this.Button_smelt.node.active = this.itemInfo.packagetype == Game.ItemDefine.PACKAGETYPE.PACKAGE_EQUIP;
        this.Button_advanced.node.active = this.equipInfo.color == Game.ItemDefine.ITEMCOLOR.Item_Purple;    //暂时屏蔽
        this.Sprite_lockEquip.node.active = this.equipInfo.lock > 0;
        this.Node_System.active = Game.GlobalModel.GetIsLookMyEquip();   //暂时屏蔽
        this.Node_lockEquip.active = Game.GlobalModel.GetIsLookMyEquip();

        this.updateViewData();

        let star = Game._.get(this, 'equipInfo.star', 0);
        this.Sprite_superStar.node.active = star > 1;
        
        if (this._singleItemComponent) {
            this._singleItemComponent.updateView(this.itemInfo);
        }

        if (this._equipPropertyComponent) {
            this._equipPropertyComponent.updateView(this.itemInfo);
        }

        this.handleHideButton();
    },

    updateViewData() {
        switch (this.curPage) {
            case pageSystem.system_strong:
                this.updateStrong();
                break;
            case pageSystem.system_star:
                this.updateStar();
                break;
            case pageSystem.system_gem:
                this.updateGems();
                break;
            case pageSystem.system_soul:
                Game.EquipModel.selectEquips = [];
                let soul = Game._.get(this, 'equipInfo.godnormal', null);
                if (soul != null) {
                    if (soul.level > 0) {
                        this.updateSoul();
                    }
                }
                break;
            case pageSystem.system_advance:
                this.curSelAdavance = 0;
                this.updateAdvance();
                break;
        }
    },

    onClickChange() {
        let info = {
            equipType: this._data.type, 
            selectType: Game.Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_CHANGE
        }
        this.openView(Game.UIName.UI_EQUIPSELECT, info);
    },

    onClickSmelt() {
        Game.NetWorkController.SendProto('msg.smeltEquip', {
            equips: [this.itemInfo.thisid]
        });
        this.onClose();
    },

    onClickLock() {
        Game.NetWorkController.SendProto('msg.lockEquip', {
            thisid: this.itemInfo.thisid
        });
    },

    onClickPage(event, customEventData) {
        this.onChangePage(customEventData)
    },

    onChangePage(page) {
        if (page == this.curPage) {return;}

        this.curPage = parseInt(page);
        this.updateViewData();

        if (this.curPage == pageSystem.system_soul) {
            if (Game.EquipModel.IsHaveSoul(this.itemInfo)) {
                this.Node_soulInit.active = true;
                this.Button_changeTransfer.node.active = true;
                this.Button_changeUp.node.active = true;
                this.Node_nosoul.active = false;
            } else {
                this.Node_soulInit.active = false;
                this.Button_changeTransfer.node.active = false;
                this.Button_changeUp.node.active = false;
                this.Node_nosoul.active = true;
            }
        }
        this.Node_soulup.active = false;
        this.Node_soulinherit.active = false;
        this.Node_soulinheritBm.active = false;
        
        this.Node_strong.active = page == pageSystem.system_strong;
        this.Node_star.active = page == pageSystem.system_star;
        this.Node_gem.active = page == pageSystem.system_gem;
        this.Node_soul.active = page == pageSystem.system_soul;
        this.Node_advance.active = page == pageSystem.system_advance;

        let isOpen = false;
        isOpen = Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_STRENGTH);
        if (isOpen) {
            this.Sprite_strong.SetSprite(page == pageSystem.system_strong && 'Image/UI/Common/tongyong_icon_0015' || 'Image/UI/Common/tongyong_icon_0016');
        } else {
            this.Sprite_strong.SetSprite('Image/UI/Common/tongyong_icon_0016gray');
        }
        
        isOpen = Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_STARUP);
        if (isOpen) {
            this.Sprite_star.SetSprite(page == pageSystem.system_star && 'Image/UI/Common/tongyong_icon_0015' || 'Image/UI/Common/tongyong_icon_0016');
        } else {
            this.Sprite_star.SetSprite('Image/UI/Common/tongyong_icon_0016gray');
        }
        
        isOpen = Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_GEM);
        if (isOpen) {
            this.Sprite_gem.SetSprite(page == pageSystem.system_gem && 'Image/UI/Common/tongyong_icon_0015' || 'Image/UI/Common/tongyong_icon_0016');
        } else {
            this.Sprite_gem.SetSprite('Image/UI/Common/tongyong_icon_0016gray');
        }

        isOpen = Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_SOUL);
        if (isOpen) {
            this.Sprite_soul.SetSprite(page == pageSystem.system_soul && 'Image/UI/Common/tongyong_icon_0015' || 'Image/UI/Common/tongyong_icon_0016');
        } else {
            this.Sprite_soul.SetSprite('Image/UI/Common/tongyong_icon_0016gray');
        }
    },

    //装备强化数据begin
    updateStrong() {
        let strongLv = Game._.get(this, 'equipInfo.newstronglevel', 0);
        let equipLv = this.itemInfo.level || 1;
        let limitConfig = Game.ConfigController.GetConfigById('stronglimit_data', equipLv, 'level');
        
        if (limitConfig) {
            let limitLv = limitConfig.limit;
            if (strongLv < limitLv) {
                this.Label_strongResult.setText('增加副属性' + Game.EquipModel.GetStrongthAddValue(this.itemInfo, true));
                this.Label_strongLv.setText(strongLv + "/" + limitLv);
                this.Label_strongCost.setText(Game.Tools.UnitConvert(Game.CurrencyModel.GetMoney()) + "/" + Game.Tools.UnitConvert(Game.EquipModel.GetStrongAddCost(this.itemInfo)));
                if (Game.CurrencyModel.GetMoney() < Game.EquipModel.GetStrongAddCost(this.itemInfo)) {
                    this.Label_strongCost.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
                } else {
                    this.Label_strongCost.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green);
                }
            } else {
                this.Label_strongResult.setText('已强化至最高等级');
                this.Label_strongLv.setText(limitLv + "/" + limitLv);
                this.Label_strongCost.setText('');
            }
        }
    },

    onClickStrong() {
        Game.NetWorkController.SendProto('msg.EquipStrong', {
            thisid: this.itemInfo.thisid
        });
    },
    //装备强化数据end

    //装备升星数据begin
    updateStar() {
        let stronglevel = Game._.get(this, 'equipInfo.stronglevel', 0);
        let itemLv = this.itemInfo.level;
        let starLimitConfig = Game.ConfigController.GetConfigById('starlimit_data', itemLv, 'level');
        if (starLimitConfig) {
            if (stronglevel < starLimitConfig.star) {
                let nextLv = stronglevel + 1;
                let starcostConfig = Game.ConfigController.GetConfigById('starcost_data', nextLv, 'star');
                if (starcostConfig) {
                    this.Label_starSucc.setText('增加主属性' + starcostConfig.pow + "%" + " (成功率" + starcostConfig.clientper + "%)");

                    let needMoney = starcostConfig.cost;
                    if (Game.CurrencyModel.GetMoney() < needMoney) {
                        this.Label_money.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
                    } else {
                        this.Label_money.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green);
                    }
                    this.Label_money.setText(Game.Tools.UnitConvert(Game.CurrencyModel.GetMoney()) + "/" + Game.Tools.UnitConvert(needMoney));

                    let needLuckNum = starcostConfig.costluck;
                    let curLuckNum = Game.MainUserModel.GetMainData().starlucknum;
                    this.Button_luckUp.interactable = curLuckNum >= needLuckNum && stronglevel < starLimitConfig.star;
                    this.Label_starLuckNum.setText(Game.Tools.UnitConvert(curLuckNum) + "/" + Game.Tools.UnitConvert(needLuckNum));

                    let starNum = Game.ItemModel.GetItemNumById(1);
                    let needStarCount = starcostConfig.stonenum;
                    if (starNum < needStarCount) {
                        this.Label_starNum.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
                    } else {
                        this.Label_starNum.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green);
                    }
                    this.Label_starNum.setText(Game.Tools.UnitConvert(starNum) + "/" + Game.Tools.UnitConvert(needStarCount));
                }
            } else {
                this.Label_starSucc.setText('已升至最高等级');
                this.Label_starNum.setText('');
                this.Label_money.setText('');
                this.Label_starLuckNum.setText('');
                this.Button_luckUp.interactable = false;
            }
            this.Label_maxStar.setText(Math.floor(starLimitConfig.star/2) + "星");
        }

        let vipLv = Game.MainUserModel.GetMainData().viplevel;
        let vipRewardConfig = Game.ConfigController.GetConfigById('vipreward_data', vipLv, 'level');
        let vipAddPer = 0;
        if (vipRewardConfig) {
            vipAddPer = vipRewardConfig.luck;
        }
        if (vipLv > 0 && vipAddPer > 0) {
            this.Label_starVipAdd.setText('Vip' + vipLv + "幸运值+" + vipAddPer + "%");
        } else {
            this.Label_starVipAdd.setText('');
        }
        
        if (stronglevel > 0) {
            this.Label_starSplit.setText('拆星');
        } else {
            this.Label_starSplit.setText('镶嵌');
        }
    },

    onClickStarUp() {
        Game.NetWorkController.SendProto('msg.StrongEquip', {
            thisid: this.itemInfo.thisid
        });
    },

    onClickPutOnOrTakeOff() {
        if (this.equipInfo.stronglevel > 0) {       //拆星
            let title = '装备拆星';
            let desc = '拆除星级后可获得对应等级的升星石，升星石可对任意装备升星，是否确定拆除？';
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
                {
                    name: '确定',
                    handler: function () {
                        Game.NetWorkController.SendProto('msg.reqTakeOffStarStone', {
                            equipthisid: this.itemInfo.thisid
                        });
                    }.bind(this),
                },
                {
                    name: '取消'
                }
            ])
        } else {        //镶嵌
            this.openView(Game.UIName.UI_EQUIPINLAYNODE, this.itemInfo);
        }
    },

    onClickLuckUp() {
        let desc = '';
        let title = '幸运值升星';
        let nextLv = this.equipInfo.stronglevel + 1;
        let starcostConfig = Game.ConfigController.GetConfigById('starcost_data', nextLv, 'star');
        if (starcostConfig) {
            let needLuckV = starcostConfig.costluck;
            if ((nextLv % 2) == 0) {
                desc = '是否确定消耗' + needLuckV + '幸运值100% 升至' + nextLv/2 + '星?';
            } else {
                if (Math.floor(nextLv /2) == 0) {
                    desc = '是否确定消耗' + needLuckV + '幸运值100% 升至半星?';
                } else {
                    desc = '是否确定消耗' + needLuckV + '幸运值100% 升至' + Math.floor(nextLv/2) + '星半?';
                }
            }
        }

        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
            {
                name: '确定',
                handler: function () {
                    Game.NetWorkController.SendProto('msg.StrongEquip', {
                        thisid: this.itemInfo.thisid,
                        useluck: 1
                    });
                }.bind(this),
            },
            {
                name: '取消'
            }
        ])
    },
    //装备升星数据end

    //装备宝石数据begin
    updateGems() {
        let hole = Game._.get(this, 'equipInfo.hole', 0);
        let putonlimitConfig = Game.ConfigController.GetConfigById('putonlimit_data', this.itemInfo.level, 'elevel');
        if (putonlimitConfig) {
            this.Label_topLvProperty.setText('该装备最高发挥' + putonlimitConfig.slevel + '级宝石属性');
        }

        for (let i = 0; i < 4; i ++) {
            if (i < hole) {
                this.Sprite_locks[i].node.active = false;
                
                let gemData = Game.EquipModel.GetGemByPos(this.equipInfo, i+1);
                if (gemData) {
                    let itemConfig = Game.ItemModel.GetItemConfig(gemData.objid);
                    if (itemConfig) {
                        this.Sprite_gems[i].SetSprite(itemConfig.pic);
                    }
                }
                this.Sprite_gems[i].node.active = gemData != null;
            } else {
                this.Sprite_locks[i].node.active = true;
                this.Sprite_gems[i].node.active = false;
            }
        }

        this.onRefreshGemBtn();
    },

    onRefreshGemBtn() {
        this.Button_lvupgem.node.active = this.isLvupStone;
        this.Button_takeoffAll.node.active = this.isLvupStone;
        this.Button_selgemok.node.active = !this.isLvupStone;
        this.Button_cancelgem.node.active = !this.isLvupStone;

        this.Sprite_selgem.node.active = !this.isLvupStone;
    },

    onClickTakeoffAll() {
        Game.NetWorkController.SendProto('msg.takeOffStone', {
            equipthisid: this.itemInfo.thisid,
            pos: 0
        });
    },

    onClickLvupgem() {
        let stone = this.equipInfo.stone;
        if (stone.length > 0) {
            this.isLvupStone = false;

            this.Sprite_selgem.node.parent = this.Sprite_gems[0].node.parent;
            this.Sprite_selgem.node.position = this.Sprite_gems[0].node.position;
            this.onRefreshGemBtn();
        } else {
            this.showTips('该装备未镶嵌宝石，无法升级。');
        }
    },

    onClickSelgemOk() {
        var stones = Game._.get(this,'equipInfo.stone',[]);
        var stonePos = this.selectStoneLvupPos+1;
        var stone = Game._.find(stones, {'pos': stonePos});
        var obj = {};
        obj.baseid = stone.objid;
        obj.type = stone.type;
        obj.thisid = 0;
        obj.pos = stone.pos;
        obj.equipId = this.itemInfo.thisid;
        this.openView(Game.UIName.UI_GEM_UPGRADE_VIEW, obj);
    },

    onClickCancelgem() {
        this.isLvupStone = true;
        this.onRefreshGemBtn();
    },

    onClickSelGem(event, _customEventData) {
        let customEventData = parseInt(_customEventData);
        let stone = Game._.get(this, 'equipInfo.stone', []);
        
        if (Game._.find(stone, {'pos': customEventData})) {
            if (this.isLvupStone) {
                Game.NetWorkController.SendProto('msg.takeOffStone', {
                    equipthisid: this.itemInfo.thisid,
                    pos: customEventData
                });
            } else {
                this.selectStoneLvupPos = customEventData - 1;
                this.Sprite_selgem.node.parent = this.Sprite_gems[this.selectStoneLvupPos].node.parent;
                this.Sprite_selgem.node.position = this.Sprite_gems[this.selectStoneLvupPos].node.position;
            }
        } else {
            let hole = Game._.get(this, 'equipInfo.hole', 0);
            if (customEventData <= hole) {
                //选择宝石
                this.selectStonePos = customEventData;
                this.openView(Game.UIName.UI_EQUIPINLAYSELNODE, Game.ItemDefine.ITEMTYPE.ItemType_Stone);
            } else {
                //打孔
                let desc = '';
                let title = '装备打孔';
                let makeholeConfig = Game.ConfigController.GetConfigById('makehole_data', customEventData,'hole');
                if (makeholeConfig) {
                    let needItem = makeholeConfig.item;
                    let needMoney = makeholeConfig.money;
                    if (needItem != 0) {
                        let itemConfig = Game.ItemModel.GetItemConfig(needItem);
                        if (itemConfig) {
                            desc = '开孔将消耗' + itemConfig.name + '' + makeholeConfig.num + '个';
                        }
                    } else {
                        desc = '开孔将消耗银币' + needMoney;
                    }
                }

                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
                    {
                        name: '确定',
                        handler: function () {                                
                            if (customEventData > hole + 1) {
                                this.showTips('请先开启第' + (hole + 1) + "孔");
                            } else {
                                Game.NetWorkController.SendProto('msg.makeHole', {
                                    thisid: this.itemInfo.thisid
                                });
                            }
                        }.bind(this),
                    },
                    {
                        name: '取消'
                    }
                ])
            }
        }
    },

    onBackSelStone(data) {
        Game.NetWorkController.SendProto('msg.putOnStone', {
            equipthisid: this.itemInfo.thisid,
            stonethisid: data.thisid,
            pos: this.selectStonePos
        });
    },
    //装备宝石数据end

    //装备进阶数据begin
    updateAdvance() {
        let itemConfig = Game.ItemModel.GetItemConfig(350);
        if (itemConfig) {
            for (let i = 0; i < 4; i ++) {
                if (i < this.curSelAdavance) {
                    this.Sprite_advances[i].SetSprite(itemConfig.pic);
                    this.Sprite_advances[i].node.active = true;
                } else {
                    this.Sprite_advances[i].node.active = false;
                }
            }
        }

        if (this.curSelAdavance == 0) {
            this.Label_advanceTip.setText('放入橙色进阶石,可将装备提升至下一品质');
        } else {
            let per = this.getAdvanceProbility(this.curSelAdavance);
            this.Label_advanceTip.setText('成功率'+ per + "%");
        }

        if (this.curSelAdavance < 4) {
            this.Label_putinAll.setText('一键放入');
        } else {
            this.Label_putinAll.setText('取消全部');
        }
    },

    onClickPutAdvance(event, customEventData) {
        if (customEventData <= Game.ItemModel.GetItemNumById(350)) {
            if (customEventData > this.curSelAdavance) {
                this.curSelAdavance += 1;
            } else {
                this.curSelAdavance -= 1;
            }
            this.updateAdvance();
        }
    },

    onClickPutAllAdvance() {
        if (this.curSelAdavance >= 4) {
            this.curSelAdavance = 0;
        } else {
            let itemNum = Game.ItemModel.GetItemNumById(350);
            if (itemNum <= 4) {
                this.curSelAdavance = itemNum;
            } else {
                this.curSelAdavance = 4;
            }
        }
        this.updateAdvance();
    },

    onClickAdvance() {
        Game.NetWorkController.SendProto('msg.smeltUpEquip', {
            equip: this.itemInfo.thisid,
            num: this.curSelAdavance
        });
        this.onChangePage(pageSystem.system_strong);
    },

    getAdvanceProbility(count) {
        let probility = 0;
        if (count <= 4 && count >= 1) {
            probility = Game.ConfigController.GetConfigById('smeltup2_data', count).per;
        }
        return probility;
    },
    //装备进阶数据end

    //装备灵魂数据begin
    updateSoul() {
        if (this.Node_soulinherit.active) {
            this.updateTransferSoul();
        } else {
            this.updateUpSoul();
        }
    },

    updateUpSoul() {
        let selectSoulCount = 0;
        for (let i = 0; i < 6; i ++) {
            if (i < Game.EquipModel.selectEquips.length) {
                let _singleItemComponent = this.Node_selUpSingleItem[i].getComponent('SingleItemNode');
                if (_singleItemComponent) {
                    _singleItemComponent.updateView(Game.EquipModel.selectEquips[i], function() {
                        this.onClickSelectSouls();
                    }.bind(this));
                    _singleItemComponent.setNumVisible(false);
                }
                this.Node_selUpSingleItem[i].active = true;
                this.Label_selectSoulequip[i].node.active = false;
                selectSoulCount += 1;
            } else {
                this.Node_selUpSingleItem[i].active = false;
                this.Label_selectSoulequip[i].node.active = true;
            }
        }

        let _node = this.Node_curUpSingleItem.getComponent('SingleItemNode');
        if (_node) {
            _node.updateView(this.itemInfo, function() {});
        }
        
        let soulLv = this.equipInfo.godnormal.level;
        let soulExp = this.equipInfo.godnormal.exp;
        let needExp = 0;
        let soulLvUpConfig = Game.ConfigController.GetConfigById('godlevelup_data', soulLv, 'level');
        if (soulLvUpConfig) {
            needExp = soulLvUpConfig.upnum;
        }
        this.Label_soulLv.setText('灵魂等级:LV' + soulLv);
        this.Label_soulExp.setText('经验：' + soulExp + "/" + needExp);
        if (soulExp+selectSoulCount >= needExp) {
            this.Sprite_soulProgressTarget.progress = 1;
        } else {
            this.Sprite_soulProgressTarget.progress = ((soulExp+selectSoulCount)/needExp).toFixed(2);
        }
        this.Sprite_soulProgress.progress = (soulExp/needExp).toFixed(2);

        let needMoney = 0;
        let haveMoney = Game.CurrencyModel.GetMoney();
        if (Game.EquipModel.selectEquips.length > 0) {
            needMoney = Game.EquipModel.GetSuckupNeedMoney(this.itemInfo, Game.EquipModel.selectEquips);
        }
        if (haveMoney < needMoney) {
            this.Label_upmoney.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
        } else {
            this.Label_upmoney.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green);
        }
        this.Label_upmoney.setText(Game.Tools.UnitConvert(needMoney) + "  (当前拥有：" + Game.Tools.UnitConvert(haveMoney) + ")");
    },

    updateTransferSoul() {
        if (Game.EquipModel.selectEquips[0] != null) {
            let _singleItemComponent = this.Node_selTransferSingleItem.getComponent('SingleItemNode');
            if (_singleItemComponent) {
                _singleItemComponent.updateView(Game.EquipModel.selectEquips[0], function() {
                    this.onClickSelectTransferSoul();
                }.bind(this));
            }
            this.Node_selTransferSingleItem.active = true;
            this.Label_selectTransferEquip.node.color = Game.ItemModel.GetItemLabelColor(Game.EquipModel.selectEquips[0].equipdata.color);
            this.Label_selectTransferEquip.setText(Game.UserModel.GetLevelDesc(Game.EquipModel.selectEquips[0].level) + Game.EquipModel.selectEquips[0].name);
        } else {
            this.Node_selTransferSingleItem.active = false;
        }

        let _node = this.Node_curTransferSingleItem.getComponent('SingleItemNode');
        if (_node) {
            _node.updateView(this.itemInfo, function() {});
            this.Label_targetTransferEquip.node.color = Game.ItemModel.GetItemLabelColor(this.itemInfo.equipdata.color);
            this.Label_targetTransferEquip.setText(Game.UserModel.GetLevelDesc(this.itemInfo.level) + this.itemInfo.name);
        }

        this.Label_transferPro.setText(Game.EquipModel.GetNGodEffectStr(this.equipInfo.godnormal.type, this.equipInfo.godnormal.level));
        let needMoney = 0;
        let haveMoney = Game.CurrencyModel.GetMoney();
        if (Game.EquipModel.selectEquips[0]) {
            needMoney = Game.EquipModel.GetTransferNeedMoney(this.itemInfo, Game.EquipModel.selectEquips[0]);
        }
        if (haveMoney < needMoney) {
            this.Label_transferMoney.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red);
        } else {
            this.Label_transferMoney.node.color = Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green);
        }
        this.Label_transferMoney.setText(Game.Tools.UnitConvert(needMoney) + "  (当前拥有：" + Game.Tools.UnitConvert(haveMoney) + ")");
    },

    onClickChangeSoulUp() {
        this.Node_soulInit.active = true;
        this.Node_soulup.active = true;
        this.Node_soulinherit.active = false;
        this.Node_soulinheritBm.active = false;
        Game.EquipModel.selectEquips = [];
        this.updateUpSoul();
    },

    onClickChangeSoulTransfer() {
        this.Node_soulInit.active = false;
        this.Node_soulup.active = false;
        this.Node_soulinherit.active = true;
        this.Node_soulinheritBm.active = true;
        Game.EquipModel.selectEquips = [];
        this.updateTransferSoul();
    },

    onClickSelectSouls() {
        let info = {
            equipType: this.itemInfo.type, 
            selectType: Game.Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_SOUL,
            targetid: this.itemInfo.thisid
        }
        this.openView(Game.UIName.UI_EQUIPSELECT, info);
    },

    onClickSelectTransferSoul() {
        let info = {
            equipType: this.itemInfo.type, 
            selectType: Game.Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_TRANSFERSOUL,
            targetid: this.itemInfo.thisid
        }
        this.openView(Game.UIName.UI_EQUIPSELECT, info);
    },

    onClickAutoPut() {
        Game.EquipModel.selectEquips = [];
        for (let i = 0; i < Game.ItemModel.GetItems().length; i ++) {
            let itembase = Game.ItemModel.GetItems()[i];

            if (itembase.type == Game.ItemDefine.ITEMTYPE.ItemType_Exp) {
                for (let b = 0; b < itembase.num; b ++) {
                    if (Game.EquipModel.selectEquips.length < 6) {
                        let itembaseClone = Game._.cloneDeep(itembase);
                        itembaseClone.soulIndex = b;
                        Game.EquipModel.selectEquips.push(itembaseClone);
                    }
                }
            }
        }

        for (let i = 0; i < Game.ItemModel.GetItems().length; i ++) {
            let itembase = Game.ItemModel.GetItems()[i];

            if (itembase.packagetype == Game.ItemDefine.PACKAGETYPE.PACKAGE_EQUIP 
                && itembase.thisid != this.itemInfo.thisid
                && Game.EquipModel.IsHaveSoul(itembase)
                && Game.EquipModel.selectEquips.length < 6) {
                Game.EquipModel.selectEquips.push(itembase);
            }
        }
        this.updateUpSoul();
    },

    onClickSoulUp() {
        if (Game.EquipModel.selectEquips.length > 0) {
            let thisids = [];
            thisids.push(this.itemInfo.thisid);     //第一位放入要提升的装备

            for (let i = 0; i < Game.EquipModel.selectEquips.length; i ++) {
                let equipbase = Game.EquipModel.selectEquips[i];
                thisids.push(equipbase.thisid);
            }
            
            Game.NetWorkController.SendProto('msg.suckUpGodEquip', {
                equipthisids: thisids
            });

            Game.EquipModel.selectEquips = [];
        }
    },

    onClickSoulTransfer() {
        if (Game.EquipModel.selectEquips.length > 0) {
            let needMoney = Game.EquipModel.GetTransferNeedMoney(this.itemInfo, Game.EquipModel.selectEquips[0]);
            let haveMoney = Game.CurrencyModel.GetMoney();
            Game.NetWorkController.SendProto('msg.transferGodEquip', {
                mainthisid: Game.EquipModel.selectEquips[0].thisid,
                secondthisid: this.itemInfo.thisid
            });

            if (haveMoney >= needMoney) {
                Game.EquipModel.selectEquips = [];
                this.onClose();
            }
            // } else {
            //     this.showTips('银币不足!');//

            // }
        } else {
            this.showTips('请选择需要传承的装备...');
        }
    },

    onClickGoForge() {
        this.openView(Game.UIName.UI_FORGEVIEW, 1);
    }
    //装备灵魂数据end
});
