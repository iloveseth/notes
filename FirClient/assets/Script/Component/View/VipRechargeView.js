const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        spr_vip_num_left: { default: null, type: cc.Sprite_ },
        spr_vip_num_right: { default: null, type: cc.Sprite_ },
        lab_need_money: { default: null, type: cc.Label_ },
        lab_next_vip_level: { default: null, type: cc.Label_ },
        lab_rechange_persent: { default: null, type: cc.Label_ },
        ProgressBar_rechange: { default: null, type: cc.ProgressBar },
        btn_privilege_rechange: { default: null, type: cc.Button_ },
        lab_privilege_rechange: { default: null, type: cc.Label_ },
        btn_rechange: { default: null, type: cc.Button_ },
        node_rechange: { default: null, type: cc.Node },
        lab_gift_left_time: { default: null, type: cc.Label_ },
        scroll_content: { default: null, type: cc.Node },
        spr_privilege: { default: null, type: cc.Sprite_ },
        PrivilegeTableView: { default: null, type: cc.tableView },
        GiftTableView: { default: null, type: cc.tableView },
        btn_arrow_left: { default: null, type: cc.Button_ },
        btn_arrow_right: { default: null, type: cc.Button_ },
        RechargeItemCellPrefab: {default: null, type: cc.Prefab},
        spr_rechange_picture: { default: null, type: cc.Sprite_ },
        spr_privilege_picture: { default: null, type: cc.Sprite_ },
    },

    onLoad: function () {
        this.showType = 1;
    },
    
    start() {
        
    },

    update(dt) {
        this.lab_gift_left_time.string = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_GIFT_LEFT_TIME, 'hh:mm:ss');
    },

    lateUpdate(dt) {
    },

    onDestroy() {
    },

    onEnable() {
        this.savePageIndex = 0;
        this.initNotification();
        if(this._data && this._data.type ){
            this.showType = this._data.type;
        }
        this._data = null;
        this.initView();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.VIP_RET_INFO, this, this.refreshView);
        Game.NotificationController.On(Game.Define.EVENT_KEY.VIP_NOTIFY_VIP_EXP, this, this._updateVipInfo);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.VIP_RET_INFO, this, this.refreshView);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.VIP_NOTIFY_VIP_EXP, this, this._updateVipInfo);
    },

    initView(){
        let msg = Game.VipModel.retVipInfo;
        this.msg = msg;

        this.lab_privilege_rechange.string = "充 值";

        this._updateVipInfo();

        //首冲信息
        let first_charge = Game._.get(msg,"first_charge",[]);
        first_charge.sort(function(val1,val2){
            return val1.id - val2.id;
        });

        let allChild = this.scroll_content.children;
        for (let i = 0; i < allChild.length; ++i) {
            allChild[i].destroy();
        }

        for (let i = 0; i < first_charge.length; i++) {
            let data = Game.ConfigController.GetConfigById("mall_data",first_charge[i].id);
            data.isget = first_charge[i].isget;
            data.tempindex = i;
            let _view = cc.instantiate(this.RechargeItemCellPrefab);
            let _gameComponet = _view.getComponent('VIpRechargeItemCellNode');
            if (_gameComponet) {
                _gameComponet.initUrl(Game.UIName.UI_VIP_RECHARGE_ITEM);//初始化界面的路径
                if (data != null) {
                    _gameComponet.setData(data);//设置界面数据
                }
            }
            _view.parent = this.scroll_content;
            
        }
        

        //特权信息
        let gifts = Game._.get(msg,"gifts",[]);
        gifts.sort(function(a,b){
            return a.viplevel - b.viplevel;
        });
        let viplevel = Game.UserModel.GetViplevel();
        this.curPage = viplevel+2;
        
        if(this.savePageIndex != 0){
            this.curPage = this.savePageIndex;
        }

        for (let i = 0; i < gifts.length; i++) {
            let giftInfo = gifts[i];
            let viplevel_1 = Game._.get(giftInfo,"viplevel",0);
            if(!giftInfo.isget && viplevel >= viplevel_1){
                this.curPage = viplevel_1+1;
                break;
            };
        };

        if(this.curPage > 12){
            this.curPage = 12;
        };

        this.PrivilegeTableView.initTableView(gifts.length, { array: gifts, target: this },this.curPage);
        // this.PrivilegeTableView.scrollToPage(this.curPage,false);
        this.GiftTableView.initTableView(gifts.length, { array: gifts, target: this },this.curPage);
        // this.GiftTableView.scrollToPage(this.curPage,false);

        this.PrivilegeTableView.addPageEvent(this.node, 'VipRechargeView', 'PrivilegePageChange');
        this.GiftTableView.addPageEvent(this.node, 'VipRechargeView', 'GiftPageChange');

        if(this.curPage == 1){
            this.btn_arrow_left.node.active = false;
            this.btn_arrow_right.node.active = true;
        }else if(this.curPage == gifts.length){
            this.btn_arrow_left.node.active = true;
            this.btn_arrow_right.node.active = false;
        }

        this.node_rechange.active = false;
        this.spr_privilege.node.active = true;

        //礼包大图片
        let charge_gift = Game._.get(Game.VipModel.retVipInfo,"charge_gift",[]);
        let signIDIndex = Game.VipModel.signIDIndex;
        let giftData = Game.ConfigController.GetConfigById("mall_data",charge_gift[signIDIndex].id);
        this.spr_rechange_picture.SetSprite(giftData.pic);

        if(this.showType == 2){
            this.openRecharge();
        };
        this._resetPrivilegePicture();
    },
    _updateVipInfo(){
        let viplevel = Game.UserModel.GetViplevel();
        if(viplevel >= 10){
            this.spr_vip_num_left.node.active = true;
            this.spr_vip_num_right.node.active = true;
            let path_1 = "Image/UI/Common/chongzhi_" + Math.floor(viplevel/10);
            let path_2 = "Image/UI/Common/chongzhi_" + (viplevel%10);
            this.spr_vip_num_left.SetSprite(path_1);
            this.spr_vip_num_right.SetSprite(path_2);
        }else{
            this.spr_vip_num_left.node.active = false;
            this.spr_vip_num_right.node.active = true;
            let path_temp = "Image/UI/Common/chongzhi_" + viplevel;
            this.spr_vip_num_right.SetSprite(path_temp);
        };

        let totalexp = Game.VipModel.GetVipTotleExp();
        let vipexp = Game.VipModel.GetVipExp();
        let exp = totalexp - vipexp;
        if(exp < 0){exp = 0};
        //再充值
        this.lab_need_money.string = (exp/100)+"元";
        
        this.ProgressBar_rechange.progress = vipexp/totalexp;
        let strExp = vipexp/100 + "/" + totalexp/100;
        this.lab_rechange_persent.string = strExp;

        this.lab_next_vip_level.string = "VIP" + (viplevel+1);
        if(exp == 0){
            this.lab_next_vip_level.string = "VIP12"
            this.ProgressBar_rechange.progress = 1;
            let strExp_t = totalexp/100 + "/" + totalexp/100;
            this.lab_rechange_persent.string = strExp_t;
        }

    },

    PrivilegePageChange(page, total){
        this.GiftTableView.scrollToPage(page,false);
        this.rechangeArrow();
        
    },
    GiftPageChange(page, total){
        this.PrivilegeTableView.scrollToPage(page,false);
        this.rechangeArrow();
    },

    rechangeArrow(){
        this.curPage = this.GiftTableView._page;
        this.savePageIndex = this.curPage;
        let gifts = Game._.get(this.msg,"gifts",[]);
        if(this.curPage == 1){
            this.btn_arrow_left.node.active = false;
            this.btn_arrow_right.node.active = true;
        }else if(this.curPage == gifts.length){
            this.btn_arrow_left.node.active = true;
            this.btn_arrow_right.node.active = false;
        }else{
            this.btn_arrow_left.node.active = true;
            this.btn_arrow_right.node.active = true;
        }

        this._resetPrivilegePicture();
    },

    _resetPrivilegePicture(){
        let curVipLv = this.curPage;
        let RewardDataTab = Game.ConfigController.GetConfig("vipreward_data");
        let rewardData = Game._.find(RewardDataTab, {'level': curVipLv});
        if(rewardData){
            this.spr_privilege_picture.SetSprite(rewardData.banner);
        };
    },

    openRecharge(){
        this.node_rechange.active = true;
        this.spr_privilege.node.active = false;
        this.btn_privilege_rechange.interactable = true;
        this.lab_privilege_rechange.string = "特 权";
    },
    //====================  这是分割线  ====================

    onBtn_Privilege_Recharge_click(){
        // if(this.showType == 1){
        //     this.showType = 2;
        //     this.spr_privilege.node.rotationY = 0;
        //     this.spr_privilege.node.runAction(cc.sequence([
        //         cc.callFunc(function () {
        //             this.node_rechange.active = true;
        //             this.node_rechange.rotationY = -90;
        //             // this.node_rechange.runAction(cc.rotateBy(0,0,-90));
        //             this.btn_privilege_rechange.interactable = false;
        //         }.bind(this)),
        //         cc.rotateBy(0,0,-180),
        //         cc.rotateBy(0.25,0,90),
        //         cc.callFunc(function () {
        //             this.spr_privilege.node.active = false;
        //             this.node_rechange.runAction(cc.rotateBy(0.25,0,90));
        //             this.btn_privilege_rechange.interactable = true;
        //             this.lab_privilege_rechange.string = "特 权";
        //         }.bind(this)),
        //     ]));
        // }else if(this.showType == 2){
        //     this.showType = 1;
        //     this.node_rechange.rotationY = 0;
        //     this.node_rechange.runAction(cc.sequence([
        //         cc.callFunc(function () {
        //             this.spr_privilege.node.active = true;
        //             this.spr_privilege.node.rotationY = -90;
        //             // this.spr_privilege.node.runAction(cc.rotateBy(0,0,-90));
        //             this.btn_privilege_rechange.interactable = false;
        //         }.bind(this)),
        //         cc.rotateBy(0,0,-180),
        //         cc.rotateBy(0.25,0,90),
        //         cc.callFunc(function () {
        //             this.node_rechange.active = false;
        //             this.spr_privilege.node.runAction(cc.rotateBy(0.25,0,90));
        //             this.btn_privilege_rechange.interactable = true;
        //             this.lab_privilege_rechange.string = "充 值";
        //         }.bind(this)),
        //     ]));
        // };

        if(this.showType == 1){
            if(!Game.ActiveModel.checkHasFirstCharge()){
                Game.ViewController.OpenView(Game.UIName.UI_FIRSTRECHARGEVIEW, "ViewLayer");
                return;
            };
            this.showType = 2;
            this.node_rechange.active = true;
            this.spr_privilege.node.active = false;
            this.lab_privilege_rechange.string = "特 权";
            Game.VipModel.SetVipType(2);
        }else if(this.showType == 2){
            this.showType = 1;
            this.node_rechange.active = false;
            this.spr_privilege.node.active = true;
            this.lab_privilege_rechange.string = "充 值";
            Game.VipModel.SetVipType(1);
        };
    },

    onBtn_left_click(){
        this.curPage = this.curPage - 1;
        if(this.curPage <= 1){
            this.curPage = 1;
            this.btn_arrow_left.node.active = false;
        };
        this.btn_arrow_right.node.active = true;
        this.PrivilegeTableView.scrollToPage(this.curPage,true);
        this.GiftTableView.scrollToPage(this.curPage,true);
    },

    onBtn_right_click(){
        let gifts = Game._.get(this.msg,"gifts",[]);
        this.curPage = this.curPage + 1;
        if(this.curPage >= gifts.length){
            this.curPage = gifts.length;
            this.btn_arrow_right.node.active = false;
        };
        this.btn_arrow_left.node.active = true;
        this.PrivilegeTableView.scrollToPage(this.curPage,true);
        this.GiftTableView.scrollToPage(this.curPage,true);
    },

    refreshView(){
        this.initView();
    },

    onClickDailyGift() {
        Game.ActiveModel.sendActMsgByType(Game.Define.ActivityType.DAILYGIFT_ACTIVITY);
    },

});
