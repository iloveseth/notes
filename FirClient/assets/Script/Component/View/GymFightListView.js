const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        table_view_rank: { default: null, type: cc.tableView },
        table_view_jjc: { default: null, type: cc.tableView },

        btn_jjc: { default: null, type: cc.Button_ },
        btn_rank: { default: null, type: cc.Button_ },

        lab_Settlement_time: { default: null, type: cc.Label_ },

        lab_mine_name: { default: null, type: cc.Label_ },
        lab_mine_level: { default: null, type: cc.Label_ },
        spr_mine_head: { default: null, type: cc.Sprite_ },
        lab_residue_num: { default: null, type: cc.Label_ },
        lab_recovery_time: { default: null, type: cc.Label_ },

        lab_mine_rank: { default: null, type: cc.Label_ },
        lab_mine_rank_change: { default: null, type: cc.Label_ },
        spr_down: { default: null, type: cc.Sprite_ },
        spr_up: { default: null, type: cc.Sprite_ },
        lab_mine_fight: { default: null, type: cc.Label_ },
        lab_mine_reward: { default: null, type: cc.Label_ },

        btn_buy_count: { default: null, type: cc.Button_ },
        btn_huanyipi: { default: null, type: cc.Button_ },
        btn_jjJilu: { default: null, type: cc.Button_ },
    },

    onLoad: function () {

    },
    
    start() {
    },

    update(dt) {
        this.iniTime();
        let recovery_time = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_RECOVERY_TIME);
        if(recovery_time <= 0){
            this.lab_recovery_time.setText("");
        }else{
            let countDownStr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_RECOVERY_TIME, '（mm:ss恢复一次）');
            this.lab_recovery_time.setText(countDownStr);
        };
    },

    lateUpdate(dt) {
    },

    onDestroy() {
    },

    onEnable() {
        cc.log("GymFightListView onEnable()");
        this.initNotification();  
        this.initView();
    },

    onDisable() {
        this.removeNotification();
        Game.NetWorkController.SendProto('msg.reqDayReward', {});
    },

    initNotification() {
        Game.NetWorkController.AddListener('pvp.RetPvpInfo', this, this.onRetPvpInfo);//返回竞技场挑战信息
        Game.NetWorkController.AddListener('pvp.RetPvpSort', this, this.onRetPvpSort);//返回竞技场排行榜
        Game.NetWorkController.AddListener('pvp.RetBuyFightTimesGold', this, this.onRetBuyFightTimesGold);//返回购买pk次数价格
        Game.NetWorkController.AddListener('pvp.RetBuyTimesSuccess', this, this.onRetBuyTimesSuccess);//返回购买成功后的次数
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('pvp.RetPvpInfo', this, this.onRetPvpInfo);
        Game.NetWorkController.RemoveListener('pvp.RetPvpSort', this, this.onRetPvpSort);
        Game.NetWorkController.RemoveListener('pvp.RetBuyFightTimesGold', this, this.onRetBuyFightTimesGold);
        Game.NetWorkController.RemoveListener('pvp.RetBuyTimesSuccess', this, this.onRetBuyTimesSuccess);
    },

    initView(){
        this.sort_data = 0;
        this.is_fuchou = false;
        this.fightTimes = 0;
        this.iniTime();

        Game.NetWorkController.SendProto('pvp.ReqPvpInfo', {});
    },

    iniTime(){
        let m_hours = Game.moment().hour();
        let m_minute = Game.moment().minute();
        let m_second = Game.moment().second();
        let allSecond = m_hours*3600 + m_minute*60 + m_second;

        let time = 15*3600 - allSecond;
        if(time < 0){
            time = 21*3600 - allSecond;
        };
        if( time < 0){
            time = 24 * 3600 - allSecond;
		    time = time + 15*3600;
        };
        this.lab_Settlement_time.setText(Game.moment.duration(time, 'second').format('hh:mm:ss'));
    },



    //====================  这是分割线  ====================

    onBtn_type_list_click(){
        //竞技场列表
        this.btn_jjc.interactable = false;
        this.btn_rank.interactable = true;

        this.btn_buy_count.node.active = true;
        this.btn_huanyipi.node.active = true;
        this.btn_jjJilu.node.active = true;

        Game.NetWorkController.SendProto('pvp.ReqPvpInfo', {});
    },

    onBtn_type_rank_click(){
        //排名列表
        this.btn_jjc.interactable = true;
        this.btn_rank.interactable = false;

        this.btn_buy_count.node.active = false;
        this.btn_huanyipi.node.active = false;
        this.btn_jjJilu.node.active = false;

        Game.NetWorkController.SendProto('pvp.ReqPvpSort', {});
    },

    onBtn_rank_reward_click(){
        //排名奖励界面
        this.openView(Game.UIName.UI_GYM_REWARD_VIEW);
    },

    onBtn_jjJiLu_click(){
        //竞技记录页面
        this.openView(Game.UIName.UI_GYM_RECORD_NODE);
    },

    onBtn_count_buy_click(){
        //次数购买
        Game.NetWorkController.SendProto('pvp.ReqBuyFightTimesGold', {});
    },

    onBtn_change_batch_click(){
        //换一批
        Game.NetWorkController.SendProto('pvp.ChangeRandEnemy', {});
    },

    onRetPvpInfo(msgid, data){
        this.btn_jjc.interactable = false;
        this.btn_rank.interactable = true;

        this.JJCdata = data;
        let user_name = Game.UserModel.GetUserName();
        let user_face = Game.UserModel.GetFace();
        let user_country = Game.UserModel.GetCountry();
        let user_lv = Game.UserModel.GetLevel();
        let user_occupation = Game.UserModel.GetUserOccupation();
        let user_icon = Game.UserModel.GetProfessionIcon(user_occupation);

        this.lab_mine_name.string = user_name;
        this.lab_mine_level.string = Game.UserModel.GetLevelDesc(user_lv);
        this.spr_mine_head.SetSprite(user_icon);
        this.fightTimes = data.left_fight_times;
        this.lab_residue_num.string = this.fightTimes+"/5";
        this.lab_mine_fight.string = Game.UserModel.GetUserMainInfo().fightval;
        let my_rank = Game._.get(data, 'my_rank', 0);
        if(my_rank == 0){
            this.lab_mine_rank.string = "未上榜";
        }else{
            this.lab_mine_rank.string = my_rank + "名";
        };
        //排名变化
        let oldSort = Game.UserModel.getPVPSort();
        let newSort = my_rank;
        if(oldSort == 0){oldSort = 5000;};
        if(newSort == 0){newSort = 5000;};
        this.lab_mine_rank_change.string = "0";
        this.spr_down.node.active = false;
        this.spr_up.node.active = false;
        if(oldSort > newSort){
            //排名提升
            this.lab_mine_rank_change.string = (oldSort - newSort);
            this.spr_up.node.active = true;
        }else if(oldSort < newSort){
            //排名下降
            this.lab_mine_rank_change.string = (newSort - oldSort);
            this.spr_down.node.active = true;
        }else{
            //排名不变
            this.lab_mine_rank_change.string = "";
        };
        Game.UserModel.setPVPSort(newSort);


        //排名奖励
        let awardTab = Game.ConfigController.GetConfig("pvpaward_data");
        let tbxid = 0;
        for(let i = 0; i < awardTab.length; i++){
            if(awardTab[i].roundmax == null && newSort == awardTab[i].roundmin){
                tbxid = awardTab[i].id;
            }else if(newSort <= awardTab[i].roundmax && newSort >= awardTab[i].roundmin){
                tbxid = awardTab[i].id;
            };
        }
        if(tbxid == 0){
            this.lab_mine_reward.string = "";
        }else{
            let awardData = Game.ConfigController.GetConfigById("award_data",tbxid);
            let user_reward = cc.js.formatStr("%d银币,%d荣誉,%d金币",awardData.money,awardData.fame,awardData.gold);
            this.lab_mine_reward.string = user_reward;
        };
        

        //发过来的列表先排序，然后加上仇人
        let rand = Game._.get(data, 'rand', []);
        rand.sort(function(a,b){
            return a.rank - b.rank;
        });
        let enemy = Game._.get(data, 'enemy', null);
        if(enemy && enemy.charid && enemy.charid != 0){
            rand.unshift(enemy);
            this.is_fuchou = true;
        };

        this.table_view_jjc.node.active = true;
        this.table_view_rank.node.active = false;
        this.table_view_jjc.initTableView(rand.length, { array: rand, target: this });

        //挑战次数恢复时间
        let recovery_time = Game._.get(data, 'recoverytime', 0);
        this.lab_recovery_time.setText("");
        Game.CountDown.SetCountDown(Game.CountDown.Define.TYPE_RECOVERY_TIME, recovery_time);
    },

    onRetPvpSort(msgid, data){
        let sortDataList = data.list
        this.btn_jjc.interactable = true;
        this.btn_rank.interactable = false;
        this.table_view_jjc.node.active = false;
        this.table_view_rank.node.active = true;
        this.table_view_rank.initTableView(sortDataList.length, { array: sortDataList, target: this });
    },

    onRetBuyFightTimesGold(msgid, data){
        let title = '提示信息';
        let desc = cc.js.formatStr("是否花费%d金币购买1次挑战",data.gold);
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
            {
                name: '确定',
                handler: function () {
                    Game.Platform.SetTDEventData(Game.Define.TD_EVENT.EventArenaBuy,{gold:data.gold, times:1, charid:Game.UserModel.GetCharid()});
                    Game.NetWorkController.SendProto('pvp.BuyFightTimes', {});
                }.bind(this),
            },
            {
                name: '取消'
            }
        ]);   
    },

    onRetBuyTimesSuccess(msgid, data){
        this.lab_residue_num.string = data.num+"/5";
        this.fightTimes = data.num;
    },

});
