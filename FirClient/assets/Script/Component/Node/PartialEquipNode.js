const Game = require('../../Game');

var EquipType = cc.Enum({
    wuqi       : 101,//刀
    fushou     : 102,//刀副手
    huwan      : 109,//护腕
    kuzi       : 110,//裤子
    xiezi      : 111,//鞋子
    toukui     : 112,//头盔 
    xianglian  : 113,//项链
    yifu       : 114,//衣服
    yaodai     : 115,//腰带
    jiezhi     : 116,//戒指
});

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_star: cc.Node,
        node_intensity: cc.Node,
        node_gem: cc.Node,
        node_soul: cc.Node,

        label_starnum: cc.Label_,
        label_intensity: cc.Label_,
        label_soul: cc.Label_,

        anim_change: cc.Animation,
        button_equip: cc.Button_,
        equipType: { default: EquipType.wuqi, type: EquipType },
    },

    onLoad() {
        this.initView();
        this.Sprite_gems = [
            cc.find('Sprite_back1/Sprite_gem',this.node_gem).getComponent(cc.Sprite_),
            cc.find('Sprite_back2/Sprite_gem',this.node_gem).getComponent(cc.Sprite_),
            cc.find('Sprite_back3/Sprite_gem',this.node_gem).getComponent(cc.Sprite_),
            cc.find('Sprite_back4/Sprite_gem',this.node_gem).getComponent(cc.Sprite_),
        ];
        this.Node_backs = [
            cc.find('Sprite_back1',this.node_gem),
            cc.find('Sprite_back2',this.node_gem),
            cc.find('Sprite_back3',this.node_gem),
            cc.find('Sprite_back4',this.node_gem),
        ];

        this.label_starnum.lineHeight = 30;
        this.label_intensity.lineHeight = 30;
        this.label_soul.lineHeight = 30;

    },

    onEnable() {
        this.initNotification();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.ITEM_REFRESH, this, this.updateView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ITEM_REFRESH, this, this.updateView);
    },

    initView(){
        if(this.anim_change){
            this.anim_change.node.active = false;
            this.anim_change.on('finished', this.onShowChangeEnd, this);
        }
    },

    onShowChangeEnd(event) {
        if(this.anim_change){
            this.anim_change.node.active = false;
        }
    },

    updateView(info) {
        if (this.itemInfo != null) {        //只更新当前在使用的装备
            if (this.itemInfo.thisid != info.thisid) {
                return;
            }
        } else {
            return;
        }

        this.objectInfo = info;
        this.equipInfo = info.equipdata;
        this.resetView();
        
        if (this.itemInfo != null && this.lastItemthisid != 0) {
            if(this.anim_change && !this.anim_change.node.active){
                this.anim_change.node.active = true;
                this.anim_change.play();
            }
        }
        if (this.itemInfo != null) {
            this.lastItemthisid = this.itemInfo.thisid;
        } else {
            this.lastItemthisid = -1;
        }
    },

    refreshEquip() {
        let hole = Game._.get(this, 'equipInfo.hole', 0);
        let stone = Game._.get(this, 'equipInfo.stone', []);

        this.Sprite_gems = [
            cc.find('Sprite_back1/Sprite_gem',this.node_gem).getComponent(cc.Sprite_),
            cc.find('Sprite_back2/Sprite_gem',this.node_gem).getComponent(cc.Sprite_),
            cc.find('Sprite_back3/Sprite_gem',this.node_gem).getComponent(cc.Sprite_),
            cc.find('Sprite_back4/Sprite_gem',this.node_gem).getComponent(cc.Sprite_),
        ];
        this.Node_backs = [
            cc.find('Sprite_back1',this.node_gem),
            cc.find('Sprite_back2',this.node_gem),
            cc.find('Sprite_back3',this.node_gem),
            cc.find('Sprite_back4',this.node_gem),
        ];

        for (let i = 0; i < 4; i++) {    //显示装备已经打孔的个数
            this.Node_backs[i].active = true;
            this.Sprite_gems[i].node.active = true;

            if (i < hole) {
                if(i < stone.length){
                    let gemsInfo = stone[i];
                    let gemsConfig = Game.ItemModel.GetItemConfig(gemsInfo.objid);
                    if (gemsConfig) {
                        this.Sprite_gems[gemsInfo.pos - 1].SetSprite(gemsConfig.pic);
                    }
                    this.Sprite_gems[i].node.active = true;
                } else {
                    this.Sprite_gems[i].node.active = false;
                }
            } else {
                this.Sprite_gems[i].SetSprite('Image/UI/EquipView/btn_suoding_002');
                this.Sprite_gems[i].node.active = true;
            }
        }
    },

    onTouchCallBack() {},

    resetView(){
        switch(this.viewType){
            case 2:{//强化
                this.node_soul.active = false;
                let newstronglevel = Game._.get(this, 'equipInfo.newstronglevel', 0);
                this.label_intensity.setText(`+${newstronglevel}`);
                break;
            }
            case 3:{//升星
                this.node_soul.active = false;
                let stronglevel = Game._.get(this, 'equipInfo.stronglevel', 0);
                this.label_starnum.setText(`+${stronglevel}`);
                break;
            }
            case 4:{//宝石
                this.node_soul.active = false;
                this.refreshEquip();
                break;
            }
            case 5:{
                let soul = Game._.get(this, 'equipInfo.godnormal', null);   //灵魂
                if (soul) {
                    if (soul.level > 0) {
                        this.label_soul.setText(soul.level);
                    }
                    this.node_soul.active = this.viewType == 5 && this.equipInfo.godnormal.level>0;
                } else {
                    this.node_soul.active = false;
                }
                break;
            }
        }

        this.node_intensity.active = this.viewType == 2;
        this.node_star.active = this.viewType == 3;
        this.node_gem.active = this.viewType == 4;
        
    },

    setView(view,info){
        this.lastItemthisid = 0;
        this.viewType = view;
        this.curBaseInfo = info;
        if (this.equipType == 101) {
            this.equipType = Game.EquipModel.GetMainArmsByOccupation(this.curBaseInfo.occupation);
        }
        if (this.equipType == 102) {
            this.equipType = Game.EquipModel.GetViceArmsByOccupation(this.curBaseInfo.occupation);
        }
        this.itemInfo = Game.EquipModel.GetUseEquipByTypes(this.curBaseInfo.packagetype, this.equipType);
        if (this.itemInfo) {
            this.updateView(this.itemInfo);
        } else {
            this.hideAllView();
        }
    },

    hideAllView(){
        this.node_intensity.active = false;
        this.node_star.active = false;
        this.node_gem.active = false;
        this.node_soul.active = false;
    },
    
    onclickEquip(){
        if(!this.itemInfo){
            return;
        }
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.EQUIP_CONTROL_SEL, this.objectInfo);
    },
});
