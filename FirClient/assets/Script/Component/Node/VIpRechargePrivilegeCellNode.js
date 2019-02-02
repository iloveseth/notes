const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        spr_vip_num_left_top: { default: null, type: cc.Sprite_ },
        spr_vip_num_right_top: { default: null, type: cc.Sprite_ },
        lab_RichText_desc: { default: null, type: cc.RichText },
    },

    onLoad() {
 
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        

        let viplevel = this._data.viplevel || 0;
        if(viplevel >= 10){
            this.spr_vip_num_left_top.node.active = true;
            this.spr_vip_num_right_top.node.active = true;
            let path_1 = "Image/UI/Common/chongzhi_" + Math.floor(viplevel/10);
            let path_2 = "Image/UI/Common/chongzhi_" + (viplevel%10);
            this.spr_vip_num_left_top.SetSprite(path_1);
            this.spr_vip_num_right_top.SetSprite(path_2);
        }else{
            this.spr_vip_num_left_top.node.active = false;
            this.spr_vip_num_right_top.node.active = true;
            let path_temp = "Image/UI/Common/chongzhi_" + viplevel;
            this.spr_vip_num_right_top.SetSprite(path_temp);
        };

        let describe = Game.ConfigController.GetConfigByIndex("describe_data",index);
        this.lab_RichText_desc.string = describe.info;


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

    
});