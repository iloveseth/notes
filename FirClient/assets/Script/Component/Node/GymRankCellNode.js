const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_name: { default: null, type: cc.Label_ },
        lab_level: { default: null, type: cc.Label_ },
        spr_head: { default: null, type: cc.Sprite_ },
        lab_fight: { default: null, type: cc.Label_ },
        lab_rank: { default: null, type: cc.Label_ },
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

        this.lab_name.string = "["+country_name+ "]"+user_name;
        this.lab_level.string = Game.UserModel.GetLevelDesc(user_lv);
        this.spr_head.SetSprite(user_icon);
        this.lab_fight.string = this._data.fvalue;
        if(this._data.rank == 0){
            this.lab_rank.string = "未上榜";
        }else{
            this.lab_rank.string = this._data.rank;
        };
        
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
        cc.log("lay GymRankCellNode clicked");
        Game.ViewController.OpenView(Game.UIName.UI_OBSERVATIONPLAYER,"ViewLayer",this._data);
       
    },

    onBtn_head_click(){

    },

});