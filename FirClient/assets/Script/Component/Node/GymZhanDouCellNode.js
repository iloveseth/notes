const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_mine_name: { default: null, type: cc.Label_ },
        lab_mine_level: { default: null, type: cc.Label_ },
        lab_mine_rank: { default: null, type: cc.Label_ },
        lab_mine_fight: { default: null, type: cc.Label_ },
        lab_mine_reward: { default: null, type: cc.Label_ },
        spr_mine_head: { default: null, type: cc.Sprite_ },
        Button_putOrtake: { default: null, type: cc.Sprite_ },
        Button_putRevenge: { default: null, type: cc.Sprite_ },
        Label_putOrtake: { default: null, type: cc.Label_ },
    },

    onLoad() {
 
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        let user_name = this._data.name;
        let user_face = this._data.face;
        let user_country = this._data.country;
        let user_lv = this._data.level;
        let user_occupation = Game.UserModel.GetOccupation(user_face);
        let user_icon = Game.UserModel.GetProfessionIcon(user_occupation);
        let country_name = Game.UserModel.GetCountryShortName(user_country);

        this.lab_mine_name.string = "["+country_name+ "]"+user_name;
        this.lab_mine_level.string = Game.UserModel.GetLevelDesc(user_lv);
        this.spr_mine_head.SetSprite(user_icon);
        this.lab_mine_fight.string = this._data.fvalue;
        if(this._data.rank == 0){
            this.lab_mine_rank.string = "未上榜";
        }else{
            this.lab_mine_rank.string = this._data.rank;
        };

        //排名奖励
        let newSort = Game._.get(this._data, 'rank', 0);
        if(newSort == 0){newSort = 5000;};
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
        

        //复仇
        if(this._target.is_fuchou == true && index == 0 ){
            this.Button_putOrtake.setVisible(false);
            this.Button_putRevenge.setVisible(true);
            this.is_revenge = true;
        }else{
            this.Button_putOrtake.setVisible(true);
            this.Button_putRevenge.setVisible(false);
            this.is_revenge = false;
        }
    },

    onEnable() {
        this.initNotification();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        
    },

    removeNotification() {
        
    },
    
    clicked() {
        Game.ViewController.OpenView(Game.UIName.UI_OBSERVATIONPLAYER,"ViewLayer",this._data);
       
    },

    onBtn_challenge_click(){
        if(this._target.fightTimes == 0){
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, '当前挑战次数已经用完！');
            return;
        }

        let msg = {};
        msg.revenge = this.is_revenge;
        msg.charid  = this._data.charid;
        msg.rank    = this._data.rank;
        msg.name    = this._data.name;
        msg.face    = this._data.face;
        msg.country = this._data.country;
        //打开pk表现场景
        Game.ViewController.OpenView(Game.UIName.UI_GYM_ANIMATION_VIEW,"ViewLayer",msg);
    },

    onBtn_head_click(){

    },

});