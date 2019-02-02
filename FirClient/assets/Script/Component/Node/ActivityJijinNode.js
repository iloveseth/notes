const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        table_view: cc.tableView,
        button_buy: cc.Button_,
        label_button: cc.Label_,
        label_acceptnum: cc.Label_,
        // label_timeleft: cc.Label_,

        prefab_jijin: cc.Prefab,
        prefab_hongli: cc.Prefab,

        sprite_bgjijin: cc.Sprite_,
        sprite_bghongli: cc.Sprite_,
        sprite_bgchaoji: cc.Sprite_,

        labels_accept: [cc.Label_],

        node_roottip: cc.Node,

        spr_chengzhang_red: { default: null, type: cc.Sprite_ },
        spr_chaoji_red: { default: null, type: cc.Sprite_ },
        spr_hongli_red: { default: null, type: cc.Sprite_ },
    },

    onLoad(){
        this.jijin_data = Game.ConfigController.GetConfig('fund_data');
        this.hongli_data = Game.ConfigController.GetConfig('fundreward_data');
        this.chaoji_data = Game.ConfigController.GetConfig('superfund_data');
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.ACTIVITY_JIJIN,this,this.onRetFund);//基金
        Game.NotificationController.On(Game.Define.EVENT_KEY.ACTIVITY_HONGLI,this,this.onRetFundRew);//红利
        Game.NotificationController.On(Game.Define.EVENT_KEY.ACTIVITY_CHAOJI,this,this.onRetSuperFund);//超级基金
        Game.NotificationController.On(Game.Define.EVENT_KEY.RED_ACTIVITY, this, this._updateJijinRed);
        Game.NetWorkController.AddListener('act.retInsuranceRec', this, this.onRetInsuranceRec);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ACTIVITY_JIJIN,this,this.onRetFund);//基金
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ACTIVITY_HONGLI,this,this.onRetFundRew);//红利
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ACTIVITY_CHAOJI,this,this.onRetSuperFund);//超级基金
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RED_ACTIVITY, this, this._updateJijinRed);
        Game.NetWorkController.RemoveListener('act.retInsuranceRec', this, this.onRetInsuranceRec);
    },

    onRetInsuranceRec(msg,data){
        this.updateAcceptView(data);
    },

    reqAcceptModel(){
        Game.NetWorkController.SendProto('act.reqInsuranceRec',{});
    },

    onRetFund(data){
        this.initData(0);
        this.updateView();
    },
    onRetFundRew(data){
        this.initData(1)
        this.updateView();
    },

    onRetSuperFund(){
        this.initData(2);
        this.updateView();
    },

    onEnable(){
        this.initNotification();
        this.openJijinUI();
        this.schedule(this.updateCd.bind(this),1);
        this._updateJijinRed();
    },

    onDisable(){
        this.unschedule(this.updateCd.bind(this),1);
        this.removeNotification();
    },

    initData(idx){
        this.tabIdx = idx;

        switch(idx){
            case 0:{
                this.jijin_retdata = Game.ActiveModel.fundMsg;
                this.sprite_bgjijin.SetSprite('Image/UI/Common/tongyong_icon_0015');
                this.sprite_bghongli.SetSprite('Image/UI/Common/tongyong_icon_0016');
                this.sprite_bgchaoji.SetSprite('Image/UI/Common/tongyong_icon_0016');
                this.label_button.setText('98元购买');
                this.table_cell = this.prefab_jijin;
                this.table_data = this.jijin_data;

                var userlevel = Game.UserModel.GetLevel();
                var hasgets = this.jijin_retdata.level;
                let hasBuy = Game._.get(this.jijin_retdata,"type",0);
                this.button_buy.node.active = !(hasBuy>0);

                this.table_data.forEach(e => {
                    if(hasgets.includes(e.level)){
                        e.buttonstate = 2;
                    }
                    else{
                        if(userlevel >= e.level && hasBuy > 0){
                            e.buttonstate = 0;
                        }
                        else{
                            e.buttonstate = 1;
                        }
                    }
                });
                this.table_data.sort((a,b) => {
                    if(a.buttonstate != b.buttonstate){
                        return a.buttonstate - b.buttonstate;
                    }
                    else{
                        return a.id - b.id;
                    }
                })

                this.orderid = 15;
                break;
            }
            case 1:{
                this.hongli_retdata = Game.ActiveModel.fundHongliMsg;
                this.sprite_bgjijin.SetSprite('Image/UI/Common/tongyong_icon_0016');
                this.sprite_bghongli.SetSprite('Image/UI/Common/tongyong_icon_0015');
                this.sprite_bgchaoji.SetSprite('Image/UI/Common/tongyong_icon_0016');

                this.button_buy.node.active = false;
                this.table_cell = this.prefab_hongli;
                this.table_data = this.hongli_data;

                var buycount = Game.ActiveModel.fundHongliMsg.buycount;
                var hasgets = Game.ActiveModel.fundHongliMsg.rewardindex;

                this.table_data.forEach(e => {
                    var needcount = e.num;
                    if(needcount > buycount){
                        e.buttonstate = 1;
                    }
                    else{
                        if(hasgets.includes(e.id)){
                            e.buttonstate = 2;
                        }
                        else{
                            e.buttonstate = 0;
                        }
                    }
                });
                this.table_data.sort((a,b) => {
                    if(a.buttonstate != b.buttonstate){
                        return a.buttonstate - b.buttonstate;
                    }
                    else{
                        return a.id - b.id;
                    }
                })
                break;
            }
            case 2:{
                this.chaoji_retdata = Game.ActiveModel.superfundMsg;
                this.chaoji_hasbuy = this.chaoji_retdata.buy;
                this.chaoji_data.forEach( e => {
                    var awardday = e.day;
                    var nextday = this.chaoji_retdata.index;
                    if(awardday == nextday){
                        if(this.chaoji_retdata.todayget){
                            e.buttonstate = 1;
                        }
                        else{
                            e.buttonstate = 0;//可领取
                        }
                    }
                    if(awardday > nextday){
                        e.buttonstate = 1;//不可领取
                    }
                    if(awardday < nextday){
                        e.buttonstate = 2;//已领取
                    }
                    if(!this.chaoji_hasbuy){
                        e.buttonstate = 1;
                    }
                    
                });

                this.chaoji_data.sort((a,b) => {
                    if(a.buttonstate != b.buttonstate){
                        return a.buttonstate - b.buttonstate;
                    }
                    else{
                        return a.id - b.id;
                    }
                })

                this.sprite_bgjijin.SetSprite('Image/UI/Common/tongyong_icon_0016');
                this.sprite_bghongli.SetSprite('Image/UI/Common/tongyong_icon_0016');
                this.sprite_bgchaoji.SetSprite('Image/UI/Common/tongyong_icon_0015');

                this.button_buy.node.active = !this.chaoji_hasbuy;
                this.label_button.setText('328元购买');
                this.table_cell = this.prefab_hongli;
                this.table_data = this.chaoji_data;

                this.orderid = 17;
                break;
            }
        }
        this.reqAcceptModel();
    },

    updateView(){
        this.updateTableView();
    },

    updateTableView(){
        this.table_view.cell = this.table_cell;
        this.table_view.initTableView(this.table_data.length, { array: this.table_data, target: this, appid:this.tabIdx, roottip: this.node_roottip},);
    },

    updateAcceptView(data){
        this.label_acceptnum.setText(data.buynum);
        this.labels_accept.forEach((e,idx) => {
            var active = idx < data.buyname.length;
            e.node.active = active;
            if(active){
                e.setText(data.buyname[idx]);
            }
        });
    },

    onclickBuy(){
        Game.Platform.RequestPay(this.orderid);
    },

    onclickJijin(){
        if(this.tabIdx == 0){
            return;
        }
        this.openJijinUI();
    },

    onclickHongli(){
        if(this.tabIdx == 1){
            return;
        }
        this.openHongliUI();
    },

    onclickChaoji(){
        if(this.tabIdx == 2){
            return;
        }
        this.openChaojiUI();
    },

    updateCd(){
        var time = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_ACTIVITY_HONGLI);

        var day = Math.floor(time / (3600 *24));
        var hour = Math.floor((time - day * 3600 *24)/3600);
        var minute = Math.floor((time % 3600)/60);

        var dayStr = day < 10 ? `0${day}` : `${day}`;
        var hourStr = hour < 10 ? `0${hour}` : `${hour}`;
        var minuteStr = minute < 10 ? `0${minute}` : `${minute}`;
        // this.label_timeleft.string = `${dayStr}天${hourStr}时${minuteStr}分`;

        if(this.time == 0){
            this.unschedule(this.updateCd.bind(this));
        }
    },

    openJijinUI(){
        Game.NetWorkController.SendProto('fund.reqFund', {});
    },

    openHongliUI(){
        Game.NetWorkController.SendProto('fund.reqFundRew', {});
    },

    openChaojiUI(){
        Game.NetWorkController.SendProto('msg.ReqSuperFund', {});
    },

    // update (dt) {},

    _updateJijinRed(){
        this.spr_chengzhang_red.node.active = Game._.find(Game.ActiveModel.jijinPointList, { 'id': 1 }).isfinish;
        this.spr_chaoji_red.node.active = Game._.find(Game.ActiveModel.jijinPointList, { 'id': 3 }).isfinish;
        this.spr_hongli_red.node.active = Game._.find(Game.ActiveModel.jijinPointList, { 'id': 2 }).isfinish;
    },

});
