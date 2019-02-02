const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        SingleItemNodeTab: { default: [], type: [cc.Node] },
        btn_share_reward: { default: null, type: cc.Button_ },
        lab_desc: { default: null, type: cc.Label_ },
        _isCanGetReward:{default:false},
    },

    onLoad: function () {

    },
    
    start() {
        // for(let i = 0; i < 8; i++){
        //     this.SingleItemNodeTab[i].active = false;
        // };
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
        Game.NotificationController.On(Game.Define.EVENT_KEY.SHARE_RESULT_EVENT, this, this._shareResultEvent);
        Game.NetWorkController.AddListener('msg.RetGetQzoneShare', this, this._reqGetQzoneShareHandler);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SHARE_RESULT_EVENT, this, this._shareResultEvent);
        Game.NetWorkController.RemoveListener('msg.RetGetQzoneShare', this, this._reqGetQzoneShareHandler);
    },

    initView(){
        for(let i = 0; i < 4; i++){
            this.SingleItemNodeTab[i].active = false;
        };
        //奖励物品
        let rewardId = Game.ConfigController.GetConfigById("share_data",1).reward;
        let rewardTable = Game.ItemModel.GenerateObjectsFromCommonReward(rewardId);
        for(let i = 0; i < rewardTable.objs.length; i++){
            if (i < 4) {
                this.SingleItemNodeTab[i].getComponent('SingleItemNode').updateView(rewardTable.objs[i], this.onIconClick.bind(this));
                this.SingleItemNodeTab[i].active = true;
            }
        };
    },

    onIconClick: function (item,info,src) {
        if (Game._.isFunction(Game._.get(this, 'onItemIconClick', null))) {
            let pos = src.node.parent.convertToWorldSpaceAR(src.node.position);
            this.onItemIconClick(info, pos);
        }
    },
    onItemIconClick: function (goodsinfo, pos) {
        let contents = Game.ItemModel.GenerateCommonContentByObject(goodsinfo);
        Game.TipPoolController.ShowItemInfo(contents, pos, this.node);
    },

    //====================  这是分割线  ====================
    onBtn_share_get(){
        if(this._isCanGetReward)
        {
            Game.NetWorkController.SendProto('msg.ReqGetQzoneShare', {});
        }
        else
        {
            Game.Platform.ShowShareMenu("冰火物语", "大家一起来玩吧", 'https://bh.youngame.com/share/icon1.png');
        }
    },

    onBtn_close_click(){
        this.onClose();
    },

    _shareResultEvent(info){
        if(info == 1){
            //分享成功
            this.lab_desc.string = "领取奖励";
            this._isCanGetReward = true;
        };
    },
    _reqGetQzoneShareHandler(msgid, msg)
    {
        if(msg.ret == 0)
        {
            Game.MainUserModel.onQzoneShare(msgid, { num: 1 });
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.GET_SHARE_REWARD);
            this.onClose();
        }
    },








});
