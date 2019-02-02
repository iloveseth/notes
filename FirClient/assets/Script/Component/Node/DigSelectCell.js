const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_cell_equip: { default: null, type: cc.Label_ },
        lab_cell_name: { default: null, type: cc.Label_ },
        lab_cell_fight: { default: null, type: cc.Label_ },
        lab_cell_zhan: { default: null, type: cc.Label_ },
        lab_cell_score: { default: null, type: cc.Label_ },

        spt_online_point: { default: null, type: cc.Sprite_ },
    },

    onLoad() {
 
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        cc.log("DigSelectCell init index == " + index);
        this.lab_cell_equip.node.active = false;

        this.lab_cell_name.string = this._data.name;
        this.lab_cell_fight.string = this._data.fight;
        this.lab_cell_zhan.string = this._data.can_capture;
        this.lab_cell_score.string = this._data.score;

        if(this._data.online == 0){
            this.spt_online_point.SetSprite("Image/UI/Common/zaixian_02");
        }else if(this._data.online == 1){
            this.spt_online_point.SetSprite("Image/UI/Common/zaixian_01");
        }else if(this._data.online == 2){
            this.spt_online_point.SetSprite("Image/UI/Common/zaixian_03");
        };

        let onlineX = this.lab_cell_name.node.getPositionX() + this.lab_cell_name.node.width;
        this.spt_online_point.node.setPositionX(onlineX);

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
    	cc.log("lay DigSelectCell clicked");
       
    },

    onBtn_look_Touch(){
        cc.log('DigSelectCell onBtn_look_Touch');
        Game.DigModel.needOpenDigOtherView = true;
        Game.NetWorkController.SendProto('msg.ReqRobDigInfo', {charid:this._data.charid});
        Game.ViewController.CloseView(Game.UIName.UI_DIG_SELECT_NODE,true);
    },
});