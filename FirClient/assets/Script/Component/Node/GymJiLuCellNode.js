const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_txt_jilu: { default: null, type: cc.Label_ },
        spr_head: { default: null, type: cc.Sprite_ },
        spr_win: { default: null, type: cc.Sprite_ },
        spr_lost: { default: null, type: cc.Sprite_ },
    },

    onLoad() {
 
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        //头像
        let user_head_icon = Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(this._data.enemyface));
        this.spr_head.SetSprite(user_head_icon);

        //说明
        let sm = "";
        if(this._data.isatt){
            if(this._data.win){
                if(this._data.oldrank == this._data.newrank){
                    sm = cc.js.formatStr("你挑战%s成功！排名不变！",this._data.enemyname);
                }else{
                    sm = cc.js.formatStr("你挑战%s成功！排名从%d提升至%d!",this._data.enemyname, this._data.oldrank, this._data.newrank);
                };
                this.spr_win.node.active = true;
                this.spr_lost.node.active = false;
            }else{
                sm = cc.js.formatStr("你挑战%s失败！排名不变！",this._data.enemyname);
                this.spr_win.node.active = false;
                this.spr_lost.node.active = true;
            };
        }else{
            if(this._data.win){
                sm = cc.js.formatStr("%s挑战你失败！排名不变！",this._data.enemyname);
                this.spr_win.node.active = true;
                this.spr_lost.node.active = false;
            }else{
                if(this._data.oldrank == this._data.newrank){
                    sm = cc.js.formatStr("%s挑战你成功！排名不变！",this._data.enemyname);
                }else{
                    sm = cc.js.formatStr("%s挑战你成功！排名从%d下降至%d!",this._data.enemyname, this._data.oldrank, this._data.newrank);
                };
                this.spr_win.node.active = false;
                this.spr_lost.node.active = true;
            };
        };
        this.lab_txt_jilu.string = sm;
        
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
    	cc.log("lay GymJiLuCellNode clicked");
       
    },

    onBtn_head_click(){

    },

});