const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        lab_count_down: { default: null, type: cc.Label_ },
        lab_cur_rank: { default: null, type: cc.Label_ },
        lab_cur_xiaofei: { default: null, type: cc.Label_ },
        node_AllReward: { default: null, type: cc.Node },
        tableView_AllReward: { default: null, type: cc.tableView },
        node_PersonReward: { default: null, type: cc.Node },
        tableView_PersonReward: { default: null, type: cc.tableView },
        node_Rank: { default: null, type: cc.Node },
        tableView_Rank: { default: null, type: cc.tableView },
        Button_huodong: { default: null, type: cc.Button_ },
        Button_xiaofei: { default: null, type: cc.Button_ },
        Button_paiming: { default: null, type: cc.Button_ },
        spr_reward_red: { default: null, type: cc.Sprite_ },
        node_bg: cc.Node,
    },

    onLoad: function () {

    },
    
    start() {
    },

    update(dt) {
        //剩余时间
        let timeStr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_ACTIVITY_XIAOFEI, 'D天hh时mm分');
        this.lab_count_down.string = timeStr;
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
        Game.NotificationController.On(Game.Define.EVENT_KEY.ACTIVITY_CONSUME_SORT, this, this.onRetConsumeSort);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ACTIVITY_CONSUME_INFO, this, this.onRetConsumeInfo);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ACTIVITY_CONSUME_SORT, this, this.onRetConsumeSort);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ACTIVITY_CONSUME_INFO, this, this.onRetConsumeInfo);
    },

    initView(){
        let consume_curnum = Game.ActiveModel.consume_curnum;
        this.lab_cur_xiaofei.string = consume_curnum;

        this.onBtn_huodong_onClick();

        this.checkXiaoFeiRedPoint();
    },






    //====================  这是分割线  ====================

    onRetConsumeSort(){
        cc.log("ActivityXiaoFeiNode onRetConsumeSort");
        let costsort_index = Game.ActiveModel.costsort_index;
        let costsort_tab = Game.ActiveModel.costsort_tab;
        if(costsort_index > 0){
            this.lab_cur_rank.string = cc.js.formatStr("第%d名",costsort_index);
        }else{
            this.lab_cur_rank.string = "未上榜";
        };

        //刷新排行榜
        if(this.node_Rank.active == true){
            let costsort_tab = Game.ActiveModel.costsort_tab;
            this.tableView_Rank.initTableView(costsort_tab.length, { array: costsort_tab, target: this });
        };
    },

    onRetConsumeInfo(){
        cc.log("ActivityXiaoFeiNode onRetConsumeInfo");
        let consume_curnum = Game.ActiveModel.consume_curnum;
        this.lab_cur_xiaofei.string = consume_curnum;

        //刷新个人消费奖励
        if(this.node_PersonReward.active == true){
            let consumereward_data = Game._.cloneDeep(Game.ConfigController.GetConfig("consumereward_data"));
            let consume_hasget = Game.ActiveModel.consume_hasget;
            for (let i = 0; i < consumereward_data.length; i++) {
                let element = consumereward_data[i];
                if(consume_hasget[i] == 1){
                    element.hasGet = true;
                }else{
                    element.hasGet = false;
                };
            };
            consumereward_data.sort(function(val1,val2){
                if(val1.hasGet && !val2.hasGet){return 1;}
                if(!val1.hasGet && val2.hasGet){return -1;}
                return val1.id-val2.id;
            });
            
            this.tableView_PersonReward.initTableView(consumereward_data.length, { array: consumereward_data, target: this });
        };

        this.checkXiaoFeiRedPoint();
    },

    checkXiaoFeiRedPoint(){
        //红点
        let redData = Game._.find(Game.ActiveModel.redPointList,{'id': 8});
        if(redData.isfinish){
            this.spr_reward_red.node.active = true;
        }else{
            this.spr_reward_red.node.active = false;
        };
    },

    onBtn_huodong_onClick(){
        cc.log("onBtn_huodong_onClick");
        this.node_AllReward.active = true;
        this.node_PersonReward.active = false;
        this.node_Rank.active = false;

        this.Button_huodong.interactable = false;
        this.Button_xiaofei.interactable = true;
        this.Button_paiming.interactable = true;

        //consumesort_data
        let huodong_data = Game.ConfigController.GetConfig("consumesort_data");
        this.tableView_AllReward.initTableView(huodong_data.length, { array: huodong_data, target: this });
    },
    onBtn_xiaofei_onClick(){
        cc.log("onBtn_xiaofei_onClick");
        this.node_AllReward.active = false;
        this.node_PersonReward.active = true;
        this.node_Rank.active = false;

        this.Button_huodong.interactable = true;
        this.Button_xiaofei.interactable = false;
        this.Button_paiming.interactable = true;

        // consumereward_data
        Game.NetWorkController.SendProto('consume.reqConsumeInfo', {});
    },
    onBtn_paiming_onClick(){
        cc.log("onBtn_paiming_onClick");
        this.node_AllReward.active = false;
        this.node_PersonReward.active = false;
        this.node_Rank.active = true;

        this.Button_huodong.interactable = true;
        this.Button_xiaofei.interactable = true;
        this.Button_paiming.interactable = false;

        Game.NetWorkController.SendProto('consume.reqConsumeSort', {});
    },

    onItemIconClick: function (goodsinfo, pos) {
        let contents = Game.ItemModel.GenerateCommonContentByObject(goodsinfo);
        Game.TipPoolController.ShowItemInfo(contents, pos, this.node_bg);
    },
});
