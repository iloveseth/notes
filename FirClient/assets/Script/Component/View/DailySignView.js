const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        btn_date_tab: { default: [], type: [cc.Button_] },
        lab_date_tab: { default: [], type: [cc.Label_] },
        btn_item_bg_tab: { default: [], type: [cc.Button_] },
        spr_item_icon_tab: { default: [], type: [cc.Sprite_] },
        lab_item_num_tab: { default: [], type: [cc.Label_] },
        lab_has_signed: { default: null, type: cc.Label_ },
        btn_has_signed: { default: null, type: cc.Button_ },
        scrollview_main: { default: null, type: cc.ScrollView },
        content: { default: null, type: cc.Node },
        itemCellNodePrefab: {default: null, type: cc.Prefab},
        spr_red_point: { default: null, type: cc.Sprite_ },
    },

    onLoad: function () {

    },
    
    start() {
        //累计签到数据
        this.totalsign = Game.ConfigController.GetConfig("totalsign_data");
        //各累计签到天数
        for(let i = 0; i < this.totalsign.length; i++){
            this.lab_date_tab[i].string = this.totalsign[i].desc;
        };

        //当月签到数据
        let month = Game.moment.unix(Game.TimeController.GetCurTime()).month() + 1;
        let monthData = Game.ConfigController.GetConfig("sign_data");
        this.curMonthData = [];
        for(let i = 0; i < monthData.length; i++){
            if(month == monthData[i].month){
                this.curMonthData.push(monthData[i]);
            };
        };
        this.refreshScrollViewByData(this.curMonthData);
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
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NetWorkController.AddListener('sign.retSignNew', this, this.onRetSignNew);
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('sign.retSignNew', this, this.onRetSignNew);
    },

    initView(){
        //初始化数据
        this.b_getSign = false;
        this.b_getSign_Leiji = false;
        
        this.MAX_LINE = 5;
        this.GOODS_DEC = 1000;

        this.frist_sign_ = true;
        this.isget_  = false;
        this.is_klq_ = false;

        this.signType = 1;
        this.sign_num_ = 0;
        this.signList = [];
        this.rewardObjId = [];

        this.vec_frames_ = [];
        this.vec_goods_node_ = [];

        this.arrayQdBtn = [];
        this.arrayCountImg = [];
        this.arrayTxtNum = [];

        this.svBodyHeight = 0;
        this.svBodyInnerHeight = 0;

        let temp_index = 0;
        for(let i = 0; i < 5; i++){
            this.btn_date_tab[i].interactable = true;
        };
        this.btn_date_tab[temp_index].interactable = false;

        this.spr_red_point.node.active = false;

        //请求每日签到数据
        Game.NetWorkController.SendProto('sign.reqSign', {});

    },

    refreshCountSignView(){
        let typenum = Number(this.signType);
        let temp_index = typenum -1;
        for(let i = 0; i < 5; i++){
            this.btn_date_tab[i].interactable = true;
        };
        this.spr_red_point.node.active = false;
        this.btn_date_tab[temp_index].interactable = false;
        let curTotalSignData = Game._.find(this.totalsign,{'id':typenum});
        if(curTotalSignData && curTotalSignData.signcount <= this.sign_num_ ){
            if(this.signList[temp_index] != null){
                let isget = Game._.get(this.signList[temp_index],"isget",false);
                if(isget == false){
                    this.lab_has_signed.string = "可领取";
                    this.spr_red_point.node.active = true;
                }else{
                    this.lab_has_signed.string = "已领取";
                    this.spr_red_point.node.active = false;
                };
            }else{
                this.lab_has_signed.string = cc.js.formatStr("已签到%d天",this.sign_num_);
                this.spr_red_point.node.active = false;
            };
        }else{
            this.lab_has_signed.string = cc.js.formatStr("已签到%d天",this.sign_num_);
            this.spr_red_point.node.active = false;
        }

        for(let i = 0; i < 4; i++){
            this.btn_item_bg_tab[i].node.active = false;
        };

        let index = 0;
        let signData = Game.ConfigController.GetConfigById("totalsign_data",this.signType);
        let com_reward = Game.ConfigController.GetConfigById("commonreward_data",signData.reward);
        if(com_reward.gold > 0){
            this.btn_item_bg_tab[index].node.active = true;
            this.lab_item_num_tab[index].string = "x" + Game.Tools.UnitConvert(com_reward.gold);
            this.spr_item_icon_tab[index].SetSprite(Game.ConfigController.GetConfigById("object_data",109).pic);
            index = index + 1;
        };
        if(com_reward.money > 0){
            this.btn_item_bg_tab[index].node.active = true;
            this.lab_item_num_tab[index].string = "x" + Game.Tools.UnitConvert(com_reward.money);
            this.spr_item_icon_tab[index].SetSprite(Game.ConfigController.GetConfigById("object_data",108).pic);
            index = index + 1;
        };
        let item = com_reward.item;
        if(item !== "" && item !== "0"){
            let items = item.split(";");
            for(let i = 0; i < items.length; i++){
                let tbitem = items[i].split("-");
                if(index <= 3){
                    this.btn_item_bg_tab[index].node.active = true;
                    this.lab_item_num_tab[index].string = "x" + Game.Tools.UnitConvert(tbitem[1]);
                    this.spr_item_icon_tab[index].SetSprite(Game.ConfigController.GetConfigById("object_data",tbitem[0]).pic);
                };
                index = index + 1;
            };
        };

    },


    refreshScrollViewByData(scrollData){
        this.scrollview_main.scrollToTop();
        this._itemList = [];
        let data_length = scrollData.length;
        this.content.height = Math.ceil(data_length/5)*160 + 15;
        for(let i = 0; i < data_length; i++){
            let data = scrollData[i];
            let _view = cc.instantiate(this.itemCellNodePrefab);
            let _gameComponet = _view.getComponent('DailySignScrollNode');
            if (_gameComponet) {
                _gameComponet.initUrl(Game.UIName.UI_DAILY_SIGN_SCROLL_NODE);//初始化界面的路径
                if (data != null) {
                    _gameComponet.setData(data);//设置界面数据
                }
            }
            
            this._itemList.push(_view);
            let posX = 46 + 35 + (i%5)*140;
            let posY = -46 - 25 - Math.floor(i/5)*160;
            _view.setPosition(cc.p(posX, posY));
            _view.parent = this.content;
        };

    },



    //====================  这是分割线  ====================

    onBtn_date_click(event,dateNum){
        this.signType = dateNum;
        this.refreshCountSignView();
    },


    onBtn_has_signed_get(){
        let typenum = Number(this.signType);
        let curTotalSignData = Game._.find(this.totalsign,{'id':typenum});
        if(curTotalSignData && curTotalSignData.signcount <= this.sign_num_ ){
            let msg = {};
            msg.totalsignid = this.signType;
            Game.NetWorkController.SendProto('sign.reqGetTotalSignReward', msg);
            this.b_getSign_Leiji = false;
        }else{
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "累计天数未满足要求");
        }
    },


    onRetSignNew(msgid, msg){
        //今天是否可以领取
        let is_sign = false;
        let today = msg.today;

        //遮罩是否显示
        for(let i = 0; i < this._itemList.length; i++){
            let _view = this._itemList[i];
            let _gameComponet = _view.getComponent('DailySignScrollNode');
            _gameComponet.spr_gray.node.active = false;//灰层
            _gameComponet.spr_stale.node.active = false;//过期
            _gameComponet.spr_sign.node.active = false;//签到
            _gameComponet.setAni_Light_show(false);//光圈
            let temp_day = i+1;
            if(temp_day < today){
                _gameComponet.spr_gray.node.active = true;//灰层
                _gameComponet.spr_stale.node.active = true;//过期
            }else{
                _gameComponet.spr_gray.node.active = false;
                _gameComponet.spr_stale.node.active = false;
            };
            _gameComponet.spr_sign.node.active = false;//签到

            
            if(temp_day == today){
                _gameComponet.setAni_Light_show(true);
            };
        };

        //是否签到
        let hassignList = Game._.get(msg,"hassign",[]);
        for(let i = 0; i < hassignList.length; i++){
            let hassignDay = hassignList[i];
            if(hassignDay <= this._itemList.length ){
                let list_index = hassignDay-1;
                let _view = this._itemList[list_index];
                let _gameComponet = _view.getComponent('DailySignScrollNode');
                _gameComponet.spr_sign.node.active = true;//签到
                _gameComponet.spr_stale.node.active = false;//过期
                _gameComponet.spr_gray.node.active = true;//灰层

                if(hassignDay == today){
                    is_sign = true;
                    _gameComponet.setAni_Light_show(false);
                };
            };
        };

        Game.GlobalModel.SetDailyHasSign(is_sign);
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.RED_DAILY_SIGN);
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.UPDATE_MAINRED);

        if(today > 16){
            this.scrollview_main.scrollToBottom();
        }

        //初始化累计签到
        this.signList = Game._.get(msg,"totalsign",[]);
        this.signList.sort(function(val1,val2){
            return val1.totalsignid - val2.totalsignid;
        });

        // this.signList = Game._.sortBy(this.signList, function (info) {
        //     return info.totalsignid;
        // });
        this.sign_num_ = hassignList.length;

        //默认打开正在进行中的分页
        for(let i = 0; i < this.totalsign.length; i++){
            if(this.totalsign[i].signcount > this.sign_num_){
                this.signType = this.totalsign[i].id;
                break;
            }else{
                this.signType = this.totalsign[i].id;
            };
        };

        //如果有未领取的打开未领取的分页
        for(let i = 0; i < this.signList.length; i++){
            let iscanget = Game._.get(this.signList[i],"iscanget",false);
            let isget = Game._.get(this.signList[i],"isget",false);
            if(iscanget && !isget){
                this.signType = this.signList[i].totalsignid;
            }
        };


        this.refreshCountSignView();

    },





});
