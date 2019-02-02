// FairyView.js
const Game = require('../../Game');

cc.Class({

	extends: cc.GameComponent,

	properties: {
		lab_job:{default: null,type: cc.Label_},
		sprite_job:{default: null,type: cc.Sprite_},
		lab_level:{default: null,type: cc.Label_},
		lab_power:{default: null,type: cc.Label_},
		lab_agile:{default: null,type: cc.Label_},
		lab_intelligence:{default: null,type: cc.Label_},
        btn_detail:{default: null,type: cc.Node},
		lab_endurance:{default: null,type: cc.Label_},
		// lab_combat:{default: null,type: cc.Label_},
		// lab_combat_addition:{default: null,type: cc.Label_},
        // lab_add_fight:{default: null,type: cc.Label_},
        // lab_add_vip:{default: null,type: cc.Label_},
		node_fairy_head:{default:[],type:[cc.Node]},
        selected_node:{ default: null, type: sp.Skeleton },
        lab_name:{default: null,type: cc.Label_},
        lab_fight:{default: null,type: cc.Label_},
		sprite_star:{default:[],type:[cc.Sprite_]},
        node_role:{default: null,type: cc.Node},

        node_equip_parent:{default:null,type:cc.Node},
        node_equip:{default:[],type:[cc.Node]},
        node_equip_select:{default: null,type: cc.Node},
		node_detail:{default: null,type: cc.Node},
        fairyEquipNode:{default: null,type: cc.Node},
        lab_equip_name:{default: null,type: cc.Label_},
		lab_equip_lv:{default: null,type: cc.Label_},
        lab_equip_prop:{default:[],type:[cc.Node]},
        Sprite_mar_icon:{default: null,type: cc.Sprite_},
        Label_mar_num:{default: null,type: cc.Label_},
        Label_mar_name:{default: null,type: cc.Label_},
        node_money:{default: null,type: cc.Node},
        lab_silver_spend:{default: null,type: cc.Label_},
        btn_level:{default: null,type: cc.Node},
        btn_onclick:{default: null,type: cc.Node},
        btn_grade:{default: null,type: cc.Node},
        lab_btn_onclick_upgrade:{default: null,type: cc.Label_},
        lab_equip_max:{default: null,type: cc.Label_},
        node_mar_item:{default:null,type:cc.Node},

        node_jiban_bg:{default: null,type: cc.Node},
        node_jiban:{default: null,type: cc.Node},
        sprite_jiban_icon:{default: null,type: cc.Sprite_},
        sprite_jiban_love:{default: null,type: cc.Sprite_},
        Label_jiban_name:{default: null,type: cc.Label_},
        Label_jiban_star:{default: null,type: cc.Label_},
        lab_jiban_staroutline:{default: null,type: cc.LabelOutline},
        sprite_jiban_bar:{default: null,type: cc.Sprite_},
        sprite_jiban_shut:{default: null,type: cc.Node},
        node_jiban_main_star:{default: [],type: [cc.Node]},
        node_jiban_detail:{default: null,type: cc.Node},
        node_jiban_prop:{default: null,type: cc.Node},
        progress_bar:{default: null,type: cc.ProgressBar},
        lab_fate_item_name:{default: null,type: cc.Label_},
        lab_fate_item_value:{default: null,type: cc.Label_},
        // jiban_spend_money:{default: null,type: cc.Label_},
        node_jiban_star:{default: [],type: [cc.Node]},
        node_jiban_next_star:{default: [],type: [cc.Node]},

        node_jiban_star_node:{default: null,type: cc.Node},
        node_jiban_next_star_node:{default: null,type: cc.Node},
        btn_jiban_upgrade:{default: null,type: cc.Node},
        node_jiban_progress:{default:null,type:cc.Node},
        node_jiban_prop_max:{default:null,type:cc.Node},
        node_jiban_prop_next:{default:null,type:cc.Node},


        btn_culture:{default:null,type:cc.Sprite_},
        btn_upGrade:{default:null,type:cc.Sprite_},
        btn_upStar:{default:null,type:cc.Sprite_},

        Sprite_obtian_red:{default: null,type: cc.Sprite_},
    },

    onLoad() {
    },
    
    onEnable() {
    	this.initNotification();
        this.initData();
    },

    onDisable() {
        this.removeNotification();
    
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.RET_PET_MAIN_INFO,this,this.onPosInfoRefresh);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FAIRY_RET_FIGHT_POS,this,this.onPosInfoRefresh);
        Game.NotificationController.On(Game.Define.EVENT_KEY.OBJECTS_REFRESH,this,this.refreshObj);
        Game.NotificationController.On(Game.Define.EVENT_KEY.UPDATE_FAIRYRED, this, this.refreshBtnDot);
    },
    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RET_PET_MAIN_INFO,this,this.onPosInfoRefresh);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FAIRY_RET_FIGHT_POS,this,this.onPosInfoRefresh);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.OBJECTS_REFRESH,this,this.refreshObj);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.UPDATE_FAIRYRED, this, this.refreshBtnDot);
    },
    onPosInfoRefresh(){
        this.refreshViewWithIndex(this._fairyindex);
    },
    initData(){
        this._fairyindex = 1;
        this._pos = 1;
        this._fairyEquipNode = this.fairyEquipNode.getComponent('FairyEquipNode');
        this.equipState = 0;
        this.isOpening = false;
        this.isMaxEquipLv = false;
        this._FairyPosLockIds = [
            Game.Define.FUNCTION_TYPE.TYPE_FIRSTFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_SECONDFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_THIRDFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_FOURTHFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_FIFTHFAIRY,
            Game.Define.FUNCTION_TYPE.TYPE_SIXTHFAIRY,
        ];

        this.refreshViewWithIndex(this._fairyindex);
        this.updateFairyShopRedDot();
    },
    refreshViewWithIndex(index){
        this._fairyindex = index;
        this._fairy = null;
        this._fairyData = null;
        this._fairyEquips = [];
        var fairyMsg = Game.FairyModel.GetFairyFightInfoByIndex(this._fairyindex);
        if(fairyMsg && fairyMsg.petid){
             this._fairy = Game.FairyModel.GetFairyInfoById(fairyMsg.petid);
             if(this._fairy){
                this._fairyData = this._fairy.data;
                this._fairyEquips = this._fairyData.equips;
            }
        }
        this.updateView();
    },
    updateView() {
        this.setFariyInfo();
        this.setFariyHead();
        this.setFairyEquip();
        this.setjibanInfo();
        this.setFairyDetail();
    },
    
    setFariyInfo() {
        if(this._fairy){
            this._fairyBaseConfig = Game.FairyModel.GetFairyBaseConfigById(this._fairyData.id);
            var addId = this._fairyBaseConfig.fairycolor+this._fairyBaseConfig.fairystar*10;
            this._fairyAddConfig = Game.FairyModel.GetFairyAddConfigById(addId);

            this.sprite_job.setVisible(true);
            this.btn_detail.active = true;
            this.node_equip_parent.active = true;

            this.setBtnState(this.btn_culture, 63, Game.FairyModel.GetCultivateRedDotByIndex(this._pos));
            this.setBtnState(this.btn_upGrade, 64, Game.FairyModel.GetUpgradeRedDotByIndex(this._pos));
            this.setBtnState(this.btn_upStar,  65, Game.FairyModel.GetFairyStarRedDot(this._pos));
            // this.btn_culture.SetSprite(this.getBtnIconBylimitId(63));
            // this.btn_upGrade.SetSprite(this.getBtnIconBylimitId(64));
            // this.btn_upStar.SetSprite(this.getBtnIconBylimitId(65));

            // this.Sprite_occupation.SetSprite();
            // Game.UserModel.GetJobIcon(Game.UserModel.GetUserOccupation())
            // this._fairyBaseConfig.fairyjob
            this.sprite_job.SetSprite(Game.FairyModel.GetJobIcon(this._fairyBaseConfig.fairyjob));
            this.lab_job.setText(Game.FairyModel.GetJobName(this._fairyBaseConfig.fairyjob));
            this.lab_name.setText(this._fairyBaseConfig.fairyname);
            this.lab_name.node.color = Game.FairyModel.GetFairyLabelColor(this._fairyBaseConfig.fairycolor);
            this.lab_fight.setText(Game.Tools.UnitConvert(this._fairyData.fight_val));

            this.lab_power.setText(Game.Tools.UnitConvert(this._fairy.fi_info.wdstr));
            this.lab_agile.setText(Game.Tools.UnitConvert(this._fairy.fi_info.wddex));
            this.lab_intelligence.setText(Game.Tools.UnitConvert(this._fairy.fi_info.wdint));
            this.lab_endurance.setText(Game.Tools.UnitConvert(this._fairy.fi_info.wdcon));

            // this.lab_combat.setText(Game.Tools.UnitConvert(this._fairyData.fight_val));
            this.lab_level.setText(this._fairyData.level);
            var addValue =  parseInt(Game._.get(this._fairyAddConfig, 'fairyadd'+this._fairyindex, 0))*100;
            // this.lab_add_fight.setText(addValue + "%");
            // this.lab_add_vip.setText(Game.UserModel.GetVipValue("huwei") + "%");
            // cc.log(addValue);
            // var addValue = parseInt(this._fairyAddConfig['fairyadd'+this._fairyindex])*100;
            // this.lab_combat_addition.setText(addValue + "%");
            

            for (var i = 0; i < this.sprite_star.length; i++) {
                this.sprite_star[i].node.active = false;
                if(i < this._fairyData.star){
                    this.sprite_star[i].node.active = true;
                }
            }
            // var skeletonPath = this._fairyBaseConfig.skani.split('.');
            var skeletonPath = this._fairyBaseConfig.fairyavatar;
            this.node_role.getChildByName('Sprite_tip').active = false;
            this.addRoleSpine(this.node_role, skeletonPath);
        }else{
            this.node_role.getChildByName('Sprite_tip').active = true;
            this.node_role.getChildByName('sp_player').active = false;
            this.sprite_job.setVisible(false);
            this.btn_detail.active = false;
            this.lab_job.setText("");
            this.lab_name.setText("");
            this.lab_fight.setText("");
            this.lab_power.setText("");
            this.lab_agile.setText("");
            this.lab_intelligence.setText("");
            this.lab_endurance.setText("");
            // this.lab_combat.setText("");
            this.lab_level.setText("");
            // this.lab_add_fight.setText("0");
            // this.lab_add_vip.setText("0");
            this.node_equip_parent.active = false;
            // this.btn_culture.interactable = false;
            // this.btn_upGrade.interactable = false;
            // this.btn_upStar.interactable = false;
            // this.btn_culture.SetSprite(Game.FairyModel.GetFairyBtnGray());
            // this.btn_upGrade.SetSprite(Game.FairyModel.GetFairyBtnGray());
            // this.btn_upStar.SetSprite(Game.FairyModel.GetFairyBtnGray());
            this.setBtnState(this.btn_culture, 63, Game.FairyModel.GetCultivateRedDotByIndex(this._pos));
            this.setBtnState(this.btn_upGrade, 64, Game.FairyModel.GetUpgradeRedDotByIndex(this._pos));
            this.setBtnState(this.btn_upStar,  65, Game.FairyModel.GetFairyStarRedDot(this._pos));
            for (var i = 0; i < this.sprite_star.length; i++) {
                this.sprite_star[i].node.active = false;
            }

        }
    },
    getBtnIconBylimitId(limitId){
        let isOpen = Game.GuideController.IsFunctionOpen(limitId);
        if(isOpen){
            return Game.FairyModel.GetFairyBtnNormal();
        }
        return Game.FairyModel.GetFairyBtnGray();
    },
    setBtnState(parent, limitId, dot){
        let child = parent.node.getChildByName('Sprite_dot');
        child.active = false;
        let isOpen = Game.GuideController.IsFunctionOpen(limitId);
        if(isOpen){
           parent.SetSprite(Game.FairyModel.GetFairyBtnNormal());
           child.active = dot; 
        }else{
             parent.SetSprite(Game.FairyModel.GetFairyBtnGray());
        }
    },
    refreshBtnDot(){
        this.setBtnState(this.btn_culture, 63, Game.FairyModel.GetCultivateRedDotByIndex(this._pos));
        this.setBtnState(this.btn_upGrade, 64, Game.FairyModel.GetUpgradeRedDotByIndex(this._pos));
        this.setBtnState(this.btn_upStar,  65, Game.FairyModel.GetFairyStarRedDot(this._pos));
        this.updatePosView();
        this.setFairyEquip();
        this.updateFairyShopRedDot();
    },
    updateFairyShopRedDot(){
        this.Sprite_obtian_red.setVisible(Game.ShopModel.GetFreeRedDot());
    },
    setFariyHead(){
        this.updateViewWithPos(this._pos);
        this.updatePosView();
    },
    updatePosView(){
        let priority = false;
        for (var i = 0; i < this.node_fairy_head.length; i++) {
            var fairyHeadNode = this.node_fairy_head[i].getComponent('FairyHeadNode');
            var data = {};
            var islock = true;
            var des = "";
            if(this._FairyPosLockIds[i]){
                islock = !Game.GuideController.IsFunctionOpen(this._FairyPosLockIds[i]);
            }
            data.unlock = islock;
            data.dot = true;
            data.pos = i+1;
            var fairyInfo = Game.FairyModel.GetFairyFightInfoByIndex(data.pos);
            if(fairyInfo){
                if(Game.FairyModel.GetFairyRedDotByIndex(data.pos) && !priority){
                   data.dot = true; 
                   priority = true;
                }else{
                    data.dot = false;
                }
            }
            data.fairyInfo = fairyInfo;
            if(fairyHeadNode){
                fairyHeadNode.updatePosView(data, function (pos) {
                    this.fairyPosClickedCallback(pos, this);
                }.bind(this));
            }
        }
    },
    updateViewWithPos(pos){
        if (pos > 0) {
            this.setSelectPos(pos);
            if (this._fairyindex != pos) {
                this._fairyindex = pos;
                this.refreshViewWithIndex(this._fairyindex);
            }else{
               this.updatePosView();
           }
        }else{
            this.selected_node.node.active = false;
        }
    },
    setSelectPos(pos){
        this.selected_node.node.active = true;
        this.selected_node.node.setPositionX((pos-1)*140-355);
        // this.selected_node.playAnimation('Sprite', 0);
    },
    fairyPosClickedCallback(pos){
        // || this.equipState > 0
        if(this.isOpening ){return;}
        if(this._pos != pos){
            this._pos = pos;
            this.updateViewWithPos(this._pos);
            if(this._fairy == null){
                this.openView(Game.UIName.UI_FAIRY_ARRAYVIEW,this._pos);
            }
        }else{
            if(this._fairy == null){
                this.openView(Game.UIName.UI_FAIRY_ARRAYVIEW,this._pos);
            }
        }
    },

    setFairyEquip() {
        if(this._fairy){
            for (var i = 0; i < this.node_equip.length; i++) {
                var equip = this.node_equip[i].getComponent('FairyEquipNode');
                var data = {};
                data.pos = i+1;
                var equipInfo = this.GetFairyInfoByWeapon(data.pos);
                data.dot = false;
                let level = equipInfo.level;
                var equipConfig = Game.FairyModel.GetFairyEquipConfigById(data.pos*10000+level);
                var itemConfig = Game.ItemModel.GetItemConfig(equipConfig.itemid);
                var num = Game.ItemModel.GetItemNumById(equipConfig.itemid);
                if(level < this._fairyData.level && num >= equipConfig.num && Game.GuideController.IsFunctionOpen(78)){
                    data.dot = true;
                }
                data.equipInfo = equipInfo;
                if(equip){
                    equip.updateView(data,function (pos) {
                        this.onTouchEquip(pos, this);
                    }.bind(this));
                }
            }
        }
    },

    GetFairyInfoByWeapon(pos){
        var fairy = null;
        for (var i = 0; i < this._fairyEquips.length; i++) {
            if(this._fairyEquips[i] && this._fairyEquips[i].weapon == pos){
                fairy = this._fairyEquips[i];
            }
        }
        return fairy;
    },
    setjibanInfo(){
        if(this._fairy){
            this.node_jiban.active = true;
            var fairyBaseConfig = Game.FairyModel.GetFairyBaseConfigById(this._fairyData.id);
            if(fairyBaseConfig){
                var jibanKind = fairyBaseConfig.fairykind+1;
                var level = this._fairyData.fatelevel || 1;
                var fateId = fairyBaseConfig.fairykind*100 + level;
                var fateConfig = Game.FairyModel.GetFairyFateConfigById(fateId);
                if(fateConfig){
                    jibanKind = fateConfig.fate;
                    this.fateItemId = fateConfig.itemid
                }
                var jibanConfig = Game.FairyModel.GetFairyBaseConfigByKind(jibanKind);
                this.sprite_jiban_icon.SetSprite(jibanConfig.fairyhead);
                this.Label_jiban_name.setText(jibanConfig.fairyname);
                this.Label_jiban_star.setText(level);
                // this.Label_jiban_name.node.color = Game.FairyModel.GetFairyLabelColor(jibanConfig.fairycolor);

                // this.sprite_jiban_icon._sgNode.setState(1);
                if(this._fairyData.fateon){
                    this.sprite_jiban_shut.active = false;
                    this.sprite_jiban_icon._sgNode.setState(0);
                    // this.Label_jiban_star.setText(level);
                    this.lab_jiban_staroutline.color = cc.color(173,32,94);
                    this.sprite_jiban_love._sgNode.setState(0);
                    var bar = Math.min(level/5,1);
                    this.sprite_jiban_bar.fillRange = bar;
                }else{
                    this.sprite_jiban_shut.active = true;
                    this.sprite_jiban_icon._sgNode.setState(1);
                    this.sprite_jiban_love._sgNode.setState(1); 
                    this.sprite_jiban_bar.fillRange = 0;
                    this.lab_jiban_staroutline.color = cc.color(0,0,0);

                    this.Label_jiban_star.setText(level);
                }
            }
        }else{
            this.node_jiban.active = false;
        }
        this.setJibanDetail();
    },
    setJibanDetail(){
        if(this.isOpening){
            this.node_jiban_detail.active = true;

            var level = this._fairyData.fatelevel || 1;
            for (var i = 0; i < this.node_jiban_star.length; i++) {
                this.node_jiban_star[i].active = false;
                if(i < level){
                    this.node_jiban_star[i].active = true;
                }
            }
            if(level < 5){
                 var nextLevel = level+1;
                 for (var i = 0; i < this.node_jiban_next_star.length; i++) {
                    this.node_jiban_next_star[i].active = false;
                    if(i < nextLevel){
                        this.node_jiban_next_star[i].active = true;
                    }
                }
            }
            var fairyBaseConfig = Game.FairyModel.GetFairyBaseConfigById(this._fairyData.id);
            var fateId = fairyBaseConfig.fairykind*100 + level;
            var fateConfig = Game.FairyModel.GetFairyFateConfigById(fateId);
            if(fateConfig){
                var fateItemId = fateConfig.itemid;
                var fateItemUseNum = fateConfig.num;
                var num = Game.ItemModel.GetItemNumById(fateItemId);
                var itemConfig = Game.ItemModel.GetItemConfig(fateItemId) || {};
                this.lab_fate_item_name.setText(itemConfig.name || "");
                var tNumCur = num > fateItemUseNum && fateItemUseNum || num;
                this.lab_fate_item_value.setText(tNumCur+"/"+fateItemUseNum);
                var progress = tNumCur/fateItemUseNum;
                this.progress_bar.progress = progress;
            }
            var prop = Game.FairyModel.GetFairyFatePropByConfig(fateId);
            var lab_title = this.node_jiban_prop_max.getChildByName('lab_title').getComponent('Label_');
            var lab_value = this.node_jiban_prop_max.getChildByName('lab_value').getComponent('Label_');
            var lab_value_next = this.node_jiban_prop_next.getChildByName('lab_value_next').getComponent('Label_');
            if(prop){
                 lab_title.setText(prop.title);
                 lab_value.setText(prop.value+"%"); 
            }
            if(level < 5){
                var propNext = Game.FairyModel.GetFairyFatePropByConfig(fateId+1);
                lab_value_next.setText(propNext.value+"%");
                this.node_jiban_star_node.setPositionX(-180);
                this.node_jiban_next_star_node.active = true;
                this.btn_jiban_upgrade.active = true;
                this.node_jiban_prop_next.active = true;
                this.node_jiban_prop_max.setPositionX(-200);
                this.node_jiban_progress.active = true;
            }else{
                lab_value_next.setText("");
                this.node_jiban_star_node.setPositionX(0);
                this.node_jiban_next_star_node.active = false;
                this.btn_jiban_upgrade.active = false;

                this.node_jiban_prop_next.active = false;
                this.node_jiban_prop_max.setPositionX(-50);
                this.node_jiban_progress.active = false;
            }
        }else{
            this.node_jiban_detail.active = false;
        }
    },

    setFairyDetail(){
        // this.onTouchEquip(this.equipState);
        this.updateEquipDetail(this.GetFairyInfoByWeapon(this.equipState));
        this.selectEquip(this.equipState);
    },

    updateEquipDetail(equipInfo){
        if(equipInfo){
            var eid = equipInfo.weapon*10000+equipInfo.level;
            var equipConfig = Game.FairyModel.GetFairyEquipConfigById(eid);
            var level = equipInfo.level;
            var maxLevel = Game.FairyModel.GetEquipMaxLevelByColor(equipInfo.weapon,equipInfo.color,equipInfo.star)
            this.lab_equip_lv.setText("等级"+level+"/"+maxLevel);
            
            this.lab_equip_name.setText("");
            if(this._fairyEquipNode){
                var data = {};
                data.equipInfo = equipInfo;
                this._fairyEquipNode.updateView(data);
            }
            var props = Game.FairyModel.GetEquipPropByConfig(equipInfo);
            var config = Game.FairyModel.GetFairyEquipConfigById(eid+1)
            var propsNext = Game.FairyModel.GetEquipPropByConfig(config);
            var fairyBaseConfig = Game.FairyModel.GetFairyBaseConfigById(this._fairyData.id);
            for (var i = 0; i < this.lab_equip_prop.length; i++) {
                var lab_title = this.lab_equip_prop[i].getChildByName('lab_title').getComponent('Label_');
                var lab_value = this.lab_equip_prop[i].getChildByName('lab_value').getComponent('Label_');
                var lab_value_next = this.lab_equip_prop[i].getChildByName('lab_value_next').getComponent('Label_');
                var sprite_arrow = this.lab_equip_prop[i].getChildByName('Sprite_arrow');
                if (props[i]) {
                    lab_title.setText(props[i].title);
                    lab_value.setText(props[i].value);
                }
                if(propsNext && propsNext[i]){
                    lab_value_next.node.active = true;
                    sprite_arrow.active = true;
                    var value = props[i].value + parseInt(propsNext[i].value * fairyBaseConfig.equip/100);
                    lab_value_next.setText(value);
                }else{
                    lab_value_next.node.active = false;
                    // 箭头屏蔽
                    sprite_arrow.active = false;
                }
            }
            if(config){
                var itemConfig = Game.ItemModel.GetItemConfig(equipConfig.itemid);
                this.isunLackMaterial = false;
                if(itemConfig){
                    this.Sprite_mar_icon.SetSprite(itemConfig.pic);
                    var num = Game.ItemModel.GetItemNumById(equipConfig.itemid);
                    if(num >= equipConfig.num){
                        this.isunLackMaterial = true;
                    }
                    this.Label_mar_num.setText(num+"/"+equipConfig.num);
                    this.Label_mar_num.node.color = num>=equipConfig.num && cc.color(8,255,8) || cc.color(255,0,0);
                    this.Label_mar_name.setText(itemConfig.name);
                    this.Label_mar_name.node.color = Game.ItemModel.GetItemLabelColor(itemConfig.color);
                }
                this.node_money.active = false;
                if(equipConfig.money > 0){
                    this.node_money.active = true;
                    var money = Game.UserModel.GetMoney();
                    this.lab_silver_spend.setText(Game.Tools.UnitConvert(money)+"/"+Game.Tools.UnitConvert(equipConfig.money));
                    this.lab_silver_spend.node.color = money>=equipConfig.money && cc.color(8,255,8) || cc.color(255,0,0);
                }


                 this.lab_equip_max.setText("");
                 this.node_mar_item.active = true;
                 if(level >= maxLevel){
                    // 升阶
                    this.btn_level.active = false;
                    this.btn_onclick.active = false;
                    this.btn_grade.active = true;
                    this.lab_equip_lv.setText("进阶");
                    this.removeSchedule();
                }else{
                    // 升级
                    this.btn_grade.active = false;
                    this.btn_level.active = true;
                    this.btn_onclick.active = true;
                }
                this.isMaxEquipLv = false;
                if(level >= this._fairyData.level){
                    this.isMaxEquipLv = true;
                    this.removeSchedule();
                }
            }else{
                this.node_money.active = false;
                this.node_mar_item.active = false;
                this.btn_level.active = false;
                this.btn_onclick.active = false;
                this.btn_grade.active = false; 
                this.lab_equip_max.setText("已达最大等级");
                this.isMaxEquipLv = true;
                this.removeSchedule();
            }

        }else{
            this.equipState = 0;
            this.node_detail.active = false;
        }
    },
    refreshObj(){
        if(this.isOpening){
            let level = this._fairyData.fatelevel || 1;
            let fairyBaseConfig = Game.FairyModel.GetFairyBaseConfigById(this._fairyData.id);
            let fateId = fairyBaseConfig.fairykind*100 + level;
            let fateConfig = Game.FairyModel.GetFairyFateConfigById(fateId);
            if(fateConfig){
                let fateItemId = fateConfig.itemid;
                let fateItemUseNum = fateConfig.num;
                let num = Game.ItemModel.GetItemNumById(fateItemId);
                var tNumCur = num > fateItemUseNum && fateItemUseNum || num;
                this.lab_fate_item_value.setText(tNumCur+"/"+fateItemUseNum);
                var progress = tNumCur/fateItemUseNum;
                this.progress_bar.progress = progress;
            }
        }else{
            let equipInfo = this.GetFairyInfoByWeapon(this.equipState);
            if(equipInfo){
                let eid = equipInfo.weapon*10000+equipInfo.level;
                let equipConfig = Game.FairyModel.GetFairyEquipConfigById(eid);
                let num = Game.ItemModel.GetItemNumById(equipConfig.itemid);
                if(num >= equipConfig.num){
                    this.isunLackMaterial = true;
                }
                this.Label_mar_num.setText(num+"/"+equipConfig.num);
                this.Label_mar_num.node.color = num>=equipConfig.num && cc.color(8,255,8) || cc.color(255,0,0); 
            }
        }
    },
    selectEquip(state){
        if(state > 0){
            this.node_equip_select.active = true;
            var x = -262;
            var y = 84
            if(state > 2){
                x = 262;
            }
            if(state%2 == 0){
                y = -115;
            }
            this.node_equip_select.setPosition(cc.p(x,y));

        }else{
            this.node_equip_select.active = false;
        }
    },
    oneClickedUpgrading(){
        if (this.equipState > 0 && this._fairyData){
            var msg = {};
            msg.uuid = this._fairyData.uuid;
            msg.type = this.equipState;
            Game.NetWorkController.SendProto('pet.ReqLevelUpPetEquip', msg);
        }
       if(!this.checkCanUpgrade()){
          this.removeSchedule();
       }
    },
    checkCanUpgrade(){
        if(!this._fairyData){
            return false;
        }
        if(!this.isunLackMaterial){
            return false;
        }
        if(!this._autoUsing){
            return false;
        }
        return true;
    },
    setOnClicking(bool){
        if(bool){
            this._autoUsing = true;
            this.lab_btn_onclick_upgrade.setText("停止一键");
        }else{
            this._autoUsing = false;
            this.lab_btn_onclick_upgrade.setText("一键升级");
        }
    },

    addRoleSpine(parent, Res) {
        var spineNode = parent.getChildByName('sp_player');
        spineNode.active = true;
        Game.ResController.LoadSpine(Res, function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {

                spineNode.getComponent("sp.Skeleton").skeletonData = asset;
                spineNode.getComponent("sp.Skeleton").setAnimation(0, Game.Define.MONSTER_ANIMA_STATE.IDLE, true);
            }
        }.bind(this));

    },
    onTouchFairyjiban(){
        if(this.equipState > 0){return;}
        if(this._fairyData && this._fairyData.fateon){
            if(this.isOpening){
                this.isOpening = false;
            }else{
                this.isOpening = true;
            }
            this.setJibanDetail();
        }else{
             // var pos = this.node_jiban_bg.getPosition();
            let pos = this.node_jiban_bg.parent.convertToWorldSpaceAR(this.node_jiban_bg.position);
           
            var content = ["<color=#FFFFFF>同时上阵此精灵可激活羁绊！</c>"];
            Game.TipPoolController.ShowItemInfo(content, pos, this.node);
          // Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "同时上阵此精灵可激活羁绊！");  
          // let title = '系统提示';
          // let desc = "同时上阵此精灵可激活羁绊！";
          //  Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
          //       {
          //           name: '确定',
          //       },
          //   ]);
        }
    },
    onTouchFairyFateUpgrade(){
        if(this.equipState > 0){return;}

        if(this._fairyData){
            Game.NetWorkController.SendProto('pet.ReqLevelUpFate',{uuid : this._fairyData.uuid}); 
        }
    },
    onTouchCloseJibanDetail(){
        if(this.equipState > 0){return;}
        this.isOpening = false;
        this.setJibanDetail();
    },
    onTouchCloseEquipDetail(){
        if(this.isOpening || this._autoUsing ){return;}

        this.equipState = 0;
        this.node_detail.active = false;
        this.selectEquip(this.equipState);
    },
    onTouchEquip(state){
        if(this.isOpening || this._autoUsing ){return;}

        if(this.equipState != state){
            this.equipState = state;
            this.node_detail.active = true;
            this.updateEquipDetail(this.GetFairyInfoByWeapon(state));
        }else{
            this.equipState = 0;
            this.node_detail.active = false;
        }
        this.selectEquip(this.equipState);
    },

    onTouchDetail(){
        if(this.isOpening || this.equipState > 0){return;}
    	// 详细
        if(this._fairy){
            // this.openMaskView(Game.UIName.UI_FAIRY_PROPERTY_NODE,this._fairy);
            this.openMaskView(Game.UIName.UI_FAIRY_PICTUREVIEW);

        }
    },
    onTouchAdjustFairys(){
        if(this.isOpening || this.equipState > 0){return;}
    	// 调整阵容
        this.openView(Game.UIName.UI_FAIRY_ARRAYVIEW,this._pos);
    },
    onTouchStarDetail(){
    	// 星星详情
        if(this.isOpening || this.equipState > 0){return;}

    },
    // 
    onTouchFairyCulture(){
        if(this.isOpening || this.equipState > 0){return;}
    	// 前往精灵培养
        if(this._fairy){
            this.openView(Game.UIName.UI_FAIRY_CULTIVATEVIEW,this._fairyindex);
        }
    },
    onTouchFairyUpgrade(){
        if(this.isOpening || this.equipState > 0){return;}
    	// 精灵升级
        if(this._fairy){
            this.openView(Game.UIName.UI_FAIRY_UPGRADEVIEW,this._fairyindex);
        }
    },
    onTouchFairyStarUp(){
        if(this.isOpening || this.equipState > 0){return;}
    	// 精灵升星
        if(this._fairy){
            this.openView(Game.UIName.UI_FAIRY_STARVIEW,this._fairyindex);
        }
    },
    onTouchFairyObtain(){
        if(this.isOpening || this.equipState > 0){return;}
    	// 精灵获取
        // 抽取精灵界面
        // this.openMaskView();
        this.openView(Game.UIName.UI_SHOPVIEW, Game.Define.SHOPTAB.Tab_Pet);
    },

    // 装备详情
    onTouchEquipUpgrade(){
        if(this.isOpening || this._autoUsing){return;}
        if(this.isMaxEquipLv){
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "装备等级不得超过精灵等级！");
            return;        
        }
    	// 升级
         if (this.equipState > 0 && this._fairyData){
            var msg = {};
            msg.uuid = this._fairyData.uuid;
            msg.type = this.equipState;
            Game.NetWorkController.SendProto('pet.ReqLevelUpPetEquip', msg);
        }
    },
    onTouchEquipAdvance(){
        if(this.isOpening || this._autoUsing){return;}
    	// 进阶
        if (this.equipState > 0 && this._fairyData){
            var msg = {};
            msg.uuid = this._fairyData.uuid;
            msg.type = this.equipState;
            Game.NetWorkController.SendProto('pet.ReqLevelUpPetEquip', msg);
        }
    },
    onTouchOneClickUpgrade(){
        if(this.isOpening){return;}
    	// 一键升级
        if(this.isMaxEquipLv){
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "装备等级不得超过精灵等级！");
            return;        
        }
        if(this._autoUsing){
            this.removeSchedule();
        }else{

            if (this.equipState > 0 && this._fairyData){
                this._scheduleCallback = function() {
                   this.oneClickedUpgrading();
                }
                this.setOnClicking(true);
                this.schedule(this._scheduleCallback,0.5);
            }
        }
    },
    removeSchedule(){
      if(this._scheduleCallback){
        this.unschedule(this._scheduleCallback);
      }
      this.setOnClicking(false);
    },
});