const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        spr_is_new: { default: null, type: cc.Sprite_ },
        spr_red_point: { default: null, type: cc.Sprite_ },
        btn_cell: { default: null, type: cc.Button_ },
        lab_name: { default: null, type: cc.Label_ },
        node_select:cc.Node,
    },

    onLoad: function () {

    },
    
    start() {
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
        Game.NotificationController.On(Game.Define.EVENT_KEY.RED_ACTIVITY, this, this._updateActivityRed);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RED_ACTIVITY, this, this._updateActivityRed);
    },

    initView(){
        let actData = this._data;
        let pic = Game._.get(actData,"btndark","Image/UI/ActivityHomeView/huodong_img_xiaofei01");
        // this.spt_icon.SetSprite(pic);
        this.btn_cell.node.getComponent('Sprite_').SetSprite(pic);
        this.lab_name.string = Game._.get(actData,"actname","");

        this.spr_is_new.node.active = false;
        this.spr_red_point.node.active = false;
        let actid = Game._.get(actData,"actid",0);
        let redData = Game._.find(Game.ActiveModel.redPointList,{'id': actid});
        if(redData && redData.isfinish){
            this.spr_red_point.node.active = true;
        }
    },

    _updateActivityRed(){
        let actid = Game._.get(this._data,"actid",0);
        let redData = Game._.find(Game.ActiveModel.redPointList,{'id': actid});
        if(redData && redData.isfinish){
            this.spr_red_point.node.active = true;
        }else{
            this.spr_red_point.node.active = false;
        }
        
    },

    //====================  这是分割线  ====================
    onBtn_cell_click(){
        cc.log("onBtn_cell_click == "+this._data.id);
        Game.GlobalModel.needChangeActiveShowNode = true;
        Game.ActiveModel.sendActMsgByType(this._data.id);
    },

    setSelect(isSelect){
        this.node_select.active = isSelect;
    },


});
