const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_yinzi: { default: null, type: cc.Node },
        node_daoju: { default: null, type: cc.Node },
        node_zhuangbei: { default: null, type: cc.Node },

        lab_title_txt: { default: null, type: cc.Label_ },
        lab_yinzi_num: { default: null, type: cc.Label_ },
        lab_daoju_num: { default: null, type: cc.Label_ },

        spr_daoju_icon: { default: null, type: cc.Sprite_ },
        lab_tab: { default: [], type: [cc.Label_] },
    },

    onLoad() {
        //庄园占领成功界面
        cc.log('DigCapSuccNode onLoad');
        // this.arrayEquip = [];
    },

    start() {
        this.initView();
    },

    update(dt) {
    },

    lateUpdate(dt) {
    },

    onDestroy() {
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

    initView(){
        this.node_yinzi.active = false;
        this.node_daoju.active = false;
        this.node_zhuangbei.active = false;
        // for (let i = 1; i <= 5; i++){
        //     let childStr = "lab_color_" + i;
        //     let zb_lab = this.node_zhuangbei.getChildByName(childStr).getComponent(cc.Label_);
        //     this.arrayEquip.push(zb_lab);
        // };
        this.refreshView();
    },

    refreshView(){
        let mine_info = Game.DigModel.getDigCaptureAward();
        let titleStr = "你成功争夺了"+mine_info.enemyname+"的宝藏，获得如下战利品：";
        this.lab_title_txt.string = titleStr;

        for (let i = 0; i < this.lab_tab.length; i++) {
            this.lab_tab[i].node.active = false;
        }

        if(mine_info.minetype == 1){
            //银币
            this.node_yinzi.active = true;
            let moneyStr = Game.Tools.UnitConvert(mine_info.get_money) + "两"
            this.lab_yinzi_num.string = moneyStr;

        }else if(mine_info.minetype == 2){
            //道具
            this.node_daoju.active = true;
            for(let i = 0; i < mine_info.get_items.length; i++){
                if(i>0){break;};
                let obj = Game.ItemModel.GetItemConfig(mine_info.get_items[i].itemid);
                let picStr = obj.pic;
                this.spr_daoju_icon.SetSprite(picStr);
                let numStr = "" + info.digreward.items[i].num;
                this.lab_daoju_num.string = numStr;
            };

        }else if(mine_info.minetype == 3){
            //装备
            this.node_zhuangbei.active = true;
            for(let i = 0; i < mine_info.get_equips.length; i++){
                let equip_type = mine_info.get_equips[i].color;
                let equip_num = mine_info.get_equips[i].num;
                // let lab_equip = this.arrayEquip[equip_type-1];
                let colorStr = "无";
                if(equip_type == 1){
                    colorStr = "白色*"+equip_num;
                    this.lab_tab[0].node.active = true;
                    this.lab_tab[0].string = colorStr;
                }else if(equip_type == 2){
                    colorStr = "绿色*"+equip_num;
                    this.lab_tab[1].node.active = true;
                    this.lab_tab[1].string = colorStr;
                }else if(equip_type == 3){
                    colorStr = "蓝色*"+equip_num;
                    this.lab_tab[2].node.active = true;
                    this.lab_tab[2].string = colorStr;
                }else if(equip_type == 4){
                    colorStr = "紫色*"+equip_num;
                    this.lab_tab[3].node.active = true;
                    this.lab_tab[3].string = colorStr;
                }else if(equip_type == 5){
                    colorStr = "橙色*"+equip_num;
                    this.lab_tab[4].node.active = true;
                    this.lab_tab[4].string = colorStr;
                }
                // lab_equip.string = colorStr;
            };
        }
    },
    
    //====================  回调类函数  ====================
    onLayout_bg_Touch(){
        cc.log('DigCapSuccNode onLayout_bg_Touch');
        this.closeView(this._url,true);
    },

    onBtn_close_Touch(){
        cc.log('DigCapSuccNode onBtn_close_Touch');
        this.closeView(this._url,true);
    },



});