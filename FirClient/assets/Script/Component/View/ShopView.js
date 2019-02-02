const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        buttons_tab: { default: [], type: [cc.Button_] },
        nodes_content: { default: [], type: [cc.Node] },
        node_bg: { default: null, type: cc.Node },

        tableview_generalgoods: { default: null, type: cc.tableView },

        tableView_nbgoods: { default: null, type: cc.tableView },
        label_freshcost: { default: null, type: cc.Label_ },
        label_free_times: { default: null, type: cc.Label_ },
        node_nb_refresh_money: { default: null, type: cc.Node },
        label_nbfreshcountdown: { default: null, type: cc.Label_ },

        slider_selector: { default: null, type: cc.Slider },
        label_exchangecount: { default: null, type: cc.Label_ },
        label_curgold: { default: null, type: cc.Label_ },
        label_exchangecoin: { default: null, type: cc.Label_ },
        label_totalexchangecoind: { default: null, type: cc.Label_ },
        node_viptip: { default: null, type: cc.Node },

        label_petpartscount: { default: null, type: cc.Label_ },
        node_partonecost: { default: null, type: cc.Node },
        node_partonefree: { default: null, type: cc.Node },
        node_parttencost: { default: null, type: cc.Node },
        node_parttenfree: { default: null, type: cc.Node },
        node_coinonecost: { default: null, type: cc.Node },
        node_coinonefree: { default: null, type: cc.Node },
        node_cointencost: { default: null, type: cc.Node },
        node_cointenfree: { default: null, type: cc.Node },
        label_partonefree: { default: null, type: cc.Label_ },
        label_parttenfree: { default: null, type: cc.Label_ },
        label_coinonefree: { default: null, type: cc.Label_ },
        label_cointenfree: { default: null, type: cc.Label_ },
        label_parttip: { default: null, type: cc.Label_ },
        label_cointip: { default: null, type: cc.Label_ },
        labels_cost: { default: [], type: [cc.Label_] },

        tab: { default: 0 },
        data_general: { default: null },
        data_nb: { default: null },
        curexchange_gold: { default: 0 },                           //当前兑换的金币总数
        curexchange_coin: { default: 0 },                           //当前兑换银币的总数
        lastexchagne_coin: { default: 0 },                          //还能兑换多少银币
        maxexchange_gold: { default: 0 },                           //可兑换金币的上限
        maxexchange_coin: { default: 0 },
    },
    onEnable: function () {
        let initTab = Game._.get(this, '_data', Game.Define.SHOPTAB.Tab_NB) || Game.Define.SHOPTAB.Tab_NB;
        this.onTabClick(null, initTab);
        Game.NetWorkController.SendProto('msg.reqTradeShop', {});
        Game.NetWorkController.SendProto('msg.reqTradeMoney', {});
        Game.NetWorkController.SendProto('msg.reqFreeLuckTime', {});
        Game.NetWorkController.SendProto('msg.reqLuckCountDown', {});
        Game.NotificationController.On(Game.Define.EVENT_KEY.SHOP_DATAUPDATE, this, this.onNBShopUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SHOP_MONEYUPDATE, this, this.onExchangeUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SHOP_FREETIMEUPDATE, this, this.onPetUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.OBJECTS_REFRESH, this, this.onItemUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SHOP_LUCKDRAWRET, this, this.onRetLuckDraw);
        this.slider_selector.handle.node.on(cc.Node.EventType.TOUCH_END, this.onSlideEnd, this);
        this.slider_selector.handle.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onSlideEnd, this);
    },
    update: function () {
        switch (this.tab) {
            case Game.Define.SHOPTAB.Tab_NB:
                this.label_nbfreshcountdown.setText('自动刷新 ' + Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_NBSHOP, 'hh:mm:ss'));
                break;
            case Game.Define.SHOPTAB.Tab_Pet: {
                let lastStr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_PARTDRAWONCE, 'h:m:s');
                if (lastStr != '') {
                    this.node_partonecost.active = true;
                    this.node_partonefree.active = false;

                    this.label_parttip.setText(lastStr + ' 后免费召唤');
                } else {
                    this.node_partonecost.active = false;
                    this.node_partonefree.active = true;
                    this.label_parttip.setText('当前可免费抽取一次');
                }
                break;
            }
            default:
                break;
        }
    },
    onDisable: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SHOP_DATAUPDATE, this, this.onNBShopUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SHOP_MONEYUPDATE, this, this.onExchangeUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SHOP_FREETIMEUPDATE, this, this.onPetUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.OBJECTS_REFRESH, this, this.onItemUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SHOP_LUCKDRAWRET, this, this.onRetLuckDraw);
        this.slider_selector.handle.node.off(cc.Node.EventType.TOUCH_END, this.onSlideEnd, this);
        this.slider_selector.handle.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onSlideEnd, this);
    },
    //====================  按钮回调  ====================
    onTabClick: function (event, tab) {
        this.tab = parseInt(tab);
        for (let i = Game.Define.SHOPTAB.Tab_Start; i < Game.Define.SHOPTAB.Tab_End; i++) {
            let button = this.buttons_tab[i];
            if (button) {
                button.interactable = (i != tab);
            }
            let node = this.nodes_content[i];
            if (node) {
                node.active = (i == tab);
            }
        }
        switch (this.tab) {
            // case Game.Define.SHOPTAB.Tab_General:
            //     this._updateGeneralView();
            //     break;
            case Game.Define.SHOPTAB.Tab_NB:
                this._updateNBView();
                break;
            case Game.Define.SHOPTAB.Tab_Currency:
                this.onExchangeUpdate();
                break;
            case Game.Define.SHOPTAB.Tab_Pet:
                this._updatePetView();
                break;
            default:
                break;
        }
    },
    onBuyGeneralGoodsClick: function (index) {
        // if (this.tab == Game.Define.SHOPTAB.Tab_General) {
        //     let generalGoods = Game.ConfigController.GetConfigById('generalshop_data', index);
        //     if (generalGoods != null) {
        //         // if (Game.CurrencyModel.GetGold() < generalGoods.gold) {
        //         //     Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '您的金币不足');
        //         // } else {
        //         Game.NetWorkController.SendProto('msg.buyTradeGeneralShop', { index: index, num: 1 });
        //         // }
        //     }
        // } else
        if (this.tab == Game.Define.SHOPTAB.Tab_NB) {
            let goods = Game.ShopModel.GetNBGoodsByIndex(index);
            if (goods != null && (goods.isbuy == null || goods.isbuy == 0)) {
                //钱够不够
                let cost = Math.floor(goods.costmoney * goods.discount / 10);
                Game.NetWorkController.SendProto('msg.buyTradeShop', { index: index });
            } else {

            }
        }
    },
    onItemIconClick: function (goodsinfo, pos) {
        let contents = Game.ItemModel.GenerateCommonContentByObject(goodsinfo.obj);
        Game.TipPoolController.ShowItemInfo(contents, pos, this.node_bg);
    },
    onBuyAllNBGoodsClick: function () {
        Game.NetWorkController.SendProto('msg.buyTradeShopAll', {});
    },
    onFreshNBShopClick: function () {
        Game.NetWorkController.SendProto('msg.refreshTradeShop', {});
    },
    onMinusCurrencyClick: function () {
        if (this.curexchange_gold > 0) {
            this.curexchange_gold--;
            this._calculateExchangeCurrency(false);
            this._updateCurrencyView(true);
        }
    },
    onAddCurrencyClick: function () {
        if (this.maxexchange_gold <= 0) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '今天已达兑换上限');
        } else if (this.curexchange_gold < Game.CurrencyModel.GetGold()) {
            this.curexchange_gold++;
            this._calculateExchangeCurrency(false);
            this._updateCurrencyView(true);
        }
    },
    onSelectorSlide: function (slider) {
        let newcount = Math.floor(slider.progress * this.maxexchange_gold);
        if (newcount != this.curexchange_gold) {
            this.curexchange_gold = newcount;
            this._calculateExchangeCurrency(false);
            this._updateCurrencyView(false);
        }
    },
    onSlideEnd: function () {
        if (this.maxexchange_gold > 0) {
            this._updateCurrencyView(true);
        } else {
            this.slider_selector.progress = 0;
        }
    },
    onExchangeCurrencyClick: function () {
        if (Game.CurrencyModel.GetGold() > 0) {
            if (this.curexchange_gold > 0) {
                Game.Platform.SetTDEventData(Game.Define.TD_EVENT.EventExchangGold,{gold:this.curexchange_gold, times:1, charid:Game.UserModel.GetCharid()});
                Game.NetWorkController.SendProto('msg.buyTradeGold', {
                    value: this.curexchange_gold,
                    type: 0
                })
            };
        }
    },
    onPartDrawOne: function () {
        if (Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_PARTDRAWONCE) > 0) {
            Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_chip });
        } else {
            Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_count_down });
        }
    },
    onPartDrawTen: function () {
        Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_chip_ten });
    },
    onCoinDrawOne: function () {
        if (Game.ShopModel.GetGoldDrawOnceFree() > 0) {
            Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_gold_free });
        } else {
            // let cost = Game.ConfigController.GetConfigById('price_data', Game.Define.PRICE_TYPE.DRAWONCE_GOLD);
            // if (Game.CurrencyModel.GetGold() < cost.consume) {
            //     Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '您的金币不足');
            //     return;
            // }
            Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_gold_once });
        }
    },
    onCoinDrawTen: function () {
        if (Game.ShopModel.GetGoldDrawTenFree() > 0) {
            Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_free_ten });
        } else {
            // let cost = Game.ConfigController.GetConfigById('price_data', Game.Define.PRICE_TYPE.DRAWTEN_GOLD);
            // if (Game.CurrencyModel.GetGold() < cost.consume) {
            //     Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '您的金币不足');
            //     return;
            // }
            Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_gold_ten });
        }
    },
    //====================  回调函数  ====================
    onNBShopUpdate: function () {
        if (this.tab == Game.Define.SHOPTAB.Tab_NB) {
            this._updateNBView();
        }
    },
    onExchangeUpdate: function () {
        if (this.tab == Game.Define.SHOPTAB.Tab_Currency) {
            this._calculateExchangeCurrency(true);
            if (this.maxexchange_coin == 0) {
                this.maxexchange_gold = Game.CurrencyModel.GetGold();
            } else {
                this.maxexchange_gold = Math.min(Game.ShopModel.GetMaxExchangeGold() - Game.ShopModel.GetExchangedGoldHistory(), Game.CurrencyModel.GetGold());
            }
            this.slider_selector.handle.interactable = (this.maxexchange_gold > 0);
            this._updateCurrencyView(true);
        }
    },
    onPetUpdate: function () {
        if (this.tab == Game.Define.SHOPTAB.Tab_Pet) {
            this._updatePetView();
        }
    },
    onItemUpdate: function () {
        let num = Game.ItemModel.GetItemNumById(467);
        this.label_petpartscount.setText(num);
        let pRedDot = this.node_parttencost.getChildByName('Sprite_red');
        if(pRedDot){
            pRedDot.active = num >= 100;
        }
    },
    onRetLuckDraw: function (data) {
        Game.ViewController.OpenView(Game.UIName.UI_FAIRY_SHOW, 'MaskLayer', data);
    },
    //====================  私有函数  ====================
    _calculateExchangeCurrency: function (init) {
        if (init) {
            this.curexchange_gold = Math.min(this.maxexchange_gold, Game.CurrencyModel.GetGold(), 500);
        }
        this.maxexchange_coin = Game.UserModel.GetVipValue("exchange");
        if (this.maxexchange_coin > 0) {
            this.lastexchagne_coin = this.maxexchange_coin - this._calculateExchangeCoin() - Game.ShopModel.GetExchangedCoinHistory();
            this.curexchange_gold = Math.min(this.curexchange_gold, this.maxexchange_gold);
        } else {
            this._calculateExchangeCoin();
            this.lastexchagne_coin = 999;
        }
    },
    _calculateExchangeCoin: function () {
        if (this.curexchange_gold == 0) {
            this.curexchange_coin = 0;
            return 0;
        }
        let exchangeGoldHistory = Game.ShopModel.GetExchangedGoldHistory();
        let preMax = 0;
        let exchangeGoldCur = this.curexchange_gold;
        let allGold = exchangeGoldHistory + exchangeGoldCur;
        let result = 0;
        let exchangeProDefines = Game.ConfigController.GetConfig('exchange_data');
        for (let i = 0; i < exchangeProDefines.length; i++) {
            let define = exchangeProDefines[i];
            if (define.minnum > allGold) {
                //达不到这个级别了
                continue;
            }
            //把兑换记录减完先
            if (exchangeGoldHistory > define.maxnum) {
                preMax = define.maxnum;
                continue;
            }
            //记录用完了
            result += define.pro * (Math.min(allGold, define.maxnum) - Math.max(preMax, exchangeGoldHistory));
            preMax = define.maxnum;
        }
        this.curexchange_coin = result;
        return result;
    },
    //====================  更新函数  ====================
    _updateGeneralView: function () {
        this.data_general = Game.ShopModel.GetGeneralShopData();
        this.tableview_generalgoods.initTableView(this.data_general.length, { array: this.data_general, target: this });
    },
    _updateNBView: function () {
        this.data_nb = Game.ShopModel.GetNBShopGoods(true);
        this.tableView_nbgoods.initTableView(this.data_nb.length, { array: this.data_nb, target: this });

        var freeTimes = Game.ShopModel.GetNBShopFreeRefresh();
        if (freeTimes > 0) {
            // 免费（freeTimes）
            this.node_nb_refresh_money.active = false;
            this.label_free_times.setText('免费');
        } else {
            this.label_free_times.setText('');
            this.node_nb_refresh_money.active = true;
            this.label_freshcost.setText(Game.ShopModel.GetNBShopRefreshCost());
        }
    },
    _updateCurrencyView: function (updateslide) {
        this.label_exchangecount.setText(this.curexchange_gold);
        this.label_curgold.setText(Game.CurrencyModel.GetGold());
        this.label_exchangecoin.setText(this.curexchange_coin);
        if (this.maxexchange_coin == 0) {
            this.label_totalexchangecoind.setText('不限量');
            this.node_viptip.active = false;
        } else {
            this.label_totalexchangecoind.setText(this.lastexchagne_coin);
            this.node_viptip.active = (this.lastexchagne_coin == 0);
        }
        if (updateslide) {
            this.slider_selector.progress = this.maxexchange_gold == 0 ? 0 : this.curexchange_gold / this.maxexchange_gold;
        }
    },
    _updatePetView: function () {
        let num = Game.ItemModel.GetItemNumById(467);
        this.label_petpartscount.setText(num);
        let pRedDot = this.node_parttencost.getChildByName('Sprite_red');
        if(pRedDot){
            pRedDot.active = num >= 100;
        }
        this.node_parttencost.active = true;
        this.node_parttenfree.active = false;
        this.node_coinonecost.active = (Game.ShopModel.GetGoldDrawOnceFree() <= 0);
        this.node_coinonefree.active = (Game.ShopModel.GetGoldDrawOnceFree() > 0);
        this.node_cointencost.active = (Game.ShopModel.GetGoldDrawTenFree() <= 0);
        this.node_cointenfree.active = (Game.ShopModel.GetGoldDrawTenFree() > 0);
        if (Game.ShopModel.GetGoldDrawOnceFree() > 0) {
            this.label_coinonefree.setText('免费*' + Game.ShopModel.GetGoldDrawOnceFree());
            this.label_parttip.setText('')
        }
        if (Game.ShopModel.GetGoldDrawTenFree() > 0) {
            this.label_cointenfree.setText('免费*' + Game.ShopModel.GetGoldDrawTenFree());
        }
        for (let i = 0; i < this.labels_cost.length; i++) {
            let label = this.labels_cost[i];
            if (label != null) {
                let cost = Game.ConfigController.GetConfigById('price_data', i);
                label.setText(Game._.get(cost, 'consume', ''));
            }
        }
    }
});
