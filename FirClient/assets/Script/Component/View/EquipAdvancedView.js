const Game = require('../../Game');
const colorname = ['白色','绿色','蓝色','紫色','橙色']

cc.Class({
    extends: cc.GameComponent,

    properties: {
        nodes_equip: [cc.Node],
        node_before: cc.Node,
        node_after: cc.Node,
        label_name: cc.Label_,
        
        label_beforename: cc.Label_,
        sprite_beforequality: cc.Sprite_,
        sprite_beforeitem: cc.Sprite_,

        label_aftername: cc.Label_,
        sprite_afterquality: cc.Sprite_,
        sprite_afteritem: cc.Sprite_,
        
        label_advancecost: cc.Label_,

        node_select: cc.Node,
        node_advance: cc.Node,

        node_advancered: cc.Node,
        sp_player: sp.Skeleton
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.initSpPlayer();
        this.nodes_equip.forEach((e,idx) => {
            e.on('click',this.onclickEquip.bind(this,idx));
        });
    },

    onEnable(){
        this.initNotification();
        this.initUserBasicInfo();
        this.initEquipNodes();
    },

    onDisable(){
        this.removeNotification();
    },

    initUserBasicInfo(){
        Game.GlobalModel.SetIsLookMyEquip(true);
        this.label_name.setText(Game.UserModel.GetUserName());
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.ITEM_REFRESH, this, this.updateItemView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ITEM_REFRESH, this, this.updateItemView);
    },

    updateItemView(){
        this.selectNextAdvanceEquip();
    },

    initSpPlayer() {
        Game.ResController.LoadSpine(Game.UserModel.GetPlayerSkeleton(Game.UserModel.GetUserOccupation()), function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.sp_player.skeletonData = asset;
                this.sp_player.setAnimation(0, Game.Define.MONSTER_ANIMA_STATE.IDLE, true);
            }
        }.bind(this));
    },

    initEquipNodes() {
        let info = {
            occupation: Game.UserModel.GetUserOccupation(),
            packagetype: Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP,
        }
        Game._.forEach(this.nodes_equip, function (e) {
            e.getComponent('EquipNode').from = 'advance';
            e.getComponent('EquipNode').updateEquipInfo(info);
        });
        var equipidx = this.getNextAdvanceEquip();
        if(!equipidx){
            equipidx = 0;
        }
        this.chooseEquip(equipidx);
    },

    getItemInfo(idx){
        return this.nodes_equip[idx].getComponent('EquipNode').itemInfo;
    },

    //获取身上穿的非橙色装备(会影响红点)
    getNextAdvanceEquip(){
        var equipidx = null;
        Game._.forEach(this.nodes_equip, (e,idx) => {
            var quality = e.getComponent('EquipNode').getQuality();
            if(equipidx === null && quality != Game.ItemModel.EQUIP_QUALITY.QUALITY_ORANGE && quality > 0){
                equipidx = idx;
            }
        });
        if(equipidx === null){
            this.node_advancered.active = false;
        }
        else{
            this.node_advancered.active = true;
        }
        return equipidx;
    },

    selectNextAdvanceEquip(){
        var equipidx = this.getNextAdvanceEquip();
        if(equipidx !== null){
            this.chooseEquip(equipidx);
        }
        else{
            this.tryOpenAdvance();
        }
    },

    getQuality(idx){
        return this.nodes_equip[idx].getComponent('EquipNode').getQuality();
    },

    onclickEquip(idx,event){
        var quality = this.getQuality(idx);
        if(quality == Game.ItemModel.EQUIP_QUALITY.QUALITY_ORANGE){
            this.showTips('这件装备已经是橙色品质！');
        }
        if(idx == this.cur_equipidx){
            return;
        }
        this.chooseEquip(idx);
    },

    chooseEquip(idx){
        var quality = this.getQuality(idx);
        if(quality == 0){
            return;
        }
        this.cur_equipidx = idx;
        this.node_select.position = this.nodes_equip[idx].position;
        this.tryOpenAdvance();
    },

    tryOpenAdvance(){
        var idx = this.cur_equipidx;
        var quality = this.getQuality(idx);
        if(quality == Game.ItemModel.EQUIP_QUALITY.QUALITY_ORANGE){
            this.node_advance.active = false;
        }
        else{
            this.node_advance.active = true;
            this.updateAdvanceModel();
            this.updateAdvanceView();
        }
    },

    updateAdvanceModel(){
        this.cur_iteminfo = this.getItemInfo(this.cur_equipidx);
        this.cur_itemcfg = Game.ItemModel.GetItemConfig(this.cur_iteminfo.baseid);
        this.stonenum = Game.ItemModel.GetItemNumById(350);
    },

    updateAdvanceView(){
        this.updateBeforeView();
        this.updateAfterView();
        this.updateCostView();
    },

    updateBeforeView(){
        this.label_beforename.setText(`${colorname[this.cur_iteminfo.equipdata.color - 1]}${this.cur_iteminfo.name}`);
        this.sprite_beforeitem.SetSprite(this.cur_itemcfg.pic);
        this.sprite_beforequality.SetSprite(Game.ItemModel.GetItemQualityIcon(this.cur_iteminfo.equipdata.color));
    },
    updateAfterView(){
        this.label_aftername.setText(`橙色${this.cur_iteminfo.name}`);
        this.sprite_afteritem.SetSprite(this.cur_itemcfg.pic);
        this.sprite_afterquality.SetSprite(Game.ItemModel.GetItemQualityIcon(Game.ItemModel.EQUIP_QUALITY.QUALITY_ORANGE));
    },

    updateCostView(){
        this.label_advancecost.setText(`${this.stonenum}/1`);
    },

    onclickAdvance(){
        if(this.stonenum < 1){
            this.showTips('进阶石不足');
            return;
        }
        var msg = {equip:this.cur_iteminfo.thisid,num:1};
        Game.NetWorkController.SendProto('msg.smeltUpEquip', msg);
    },
    onclickCancel(){
        this.onClose();
    },
});
