const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        SingleItemNodeTab: { default: [], type: [cc.Node] },
        btn_collect_reward: { default: null, type: cc.Button_ },
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
        Game.NotificationController.On(Game.Define.EVENT_KEY.COLLECT_RESULT_EVENT, this, this._collectResultEvent);
        Game.NetWorkController.AddListener('msg.RetGetQzoneCollect', this, this._reqGetQzonecollectHandler);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.COLLECT_RESULT_EVENT, this, this._collectResultEvent);
        Game.NetWorkController.RemoveListener('msg.RetGetQzoneCollect', this, this._reqGetQzonecollectHandler);
    },

    initView(){
        for(let i = 0; i < 8; i++){
            this.SingleItemNodeTab[i].active = false;
        };
        //奖励物品
        let rewardId = Game.ConfigController.GetConfigById("share_data",2).reward;
        let rewardTable = Game.ItemModel.GenerateObjectsFromCommonReward(rewardId);
        for(let i = 0; i < rewardTable.objs.length; i++){
            this.SingleItemNodeTab[i].getComponent('SingleItemNode').updateView(rewardTable.objs[i], this.onIconClick.bind(this));
            this.SingleItemNodeTab[i].active = true;
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
    onBtn_collect_get(){
        if(this._isCanGetReward)
        {
            Game.NetWorkController.SendProto('msg.ReqGetQzoneCollect', {});
        }
        else
        {
            Game.Platform.AddShortCut();
            if(Game.ServerUtil.channel == Game.Define.Channel_Type.Qzone_Ios) //ios平台直接领取
            {
                this._collectResultEvent(1);
            }
        }
    },

    onBtn_close_click(){
        this.onClose();
    },

    _collectResultEvent(info){
        if(info == 1){
            //分享成功
            this.lab_desc.string = "领取奖励";
            this._isCanGetReward = true;
        };
    },
    _reqGetQzonecollectHandler(msgid, msg)
    {
        if(msg.ret == 0)
        {
            Game.MainUserModel.onQzoneCollect(msgid, { num: 1 });
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.GET_COLLECT_REWARD);
            this.onClose();
        }
    },








});
