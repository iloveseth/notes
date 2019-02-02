const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        sprite_occupation: cc.Sprite_,
        label_occupation: cc.Label_,
        label_level: cc.Label_,
        label_power: cc.Label_,
        label_smart: cc.Label_,
        label_swift: cc.Label_,
        label_resistance: cc.Label_,
        label_strength: cc.Label_,
        nodes_fairyhead: [cc.Node],
        sprites_star: [cc.Sprite_],
        label_fairyname: cc.Label_,
        nodes_equip: [cc.Node],
        node_fairy: cc.Node,

        node_jiban: cc.Node,
        sprite_jibanbar: cc.Sprite_,
        sprite_jibanicon: cc.Sprite_,
        sprite_jibanshut: cc.Node,
        label_jibanname: cc.Label_,
        label_jibanstar: cc.Label_,

        node_selected:{ default: null, type: sp.Skeleton },

        node_tip: cc.Node,
    },

    onEnable(){
        this.initData();
        this.initView();
        this.updateView();
    },

    initData(){
        this.selectPos(0);
    },

    selectPos(idx){
        this.selectidx = idx;
        this.item_fairy = this._data.pets[idx];
        if(this.item_fairy){
            this.item_equips = this.item_fairy.equips;
            this.item_fairyconfig = Game.FairyModel.GetFairyBaseConfigById(this.item_fairy.id);
            this.hasfairy = this.item_fairy.id > 0;
        }
        else{
            this.hasfairy = false;
            this.item_equips = [];
        }
    },

    trySelectPos(idx){
        if(idx == this.selectidx){
            return;
        }
        var item_fairy = this._data.pets[idx];
        var hasfairy = item_fairy && item_fairy.id > 0;
        if(item_fairy && hasfairy){
            this.selectPos(idx);
            this.initView();
            this.updateFairy();
        }
    },

    initView(){
        this.label_fairyname.string = '';
        this.showStar(0);
    },

    showStar(num){
        this.sprites_star.forEach((e,idx) => {
            e.node.active = idx < num;
        });
    },

    updateView(){
        this.updateFairyHead();//精灵选择按钮
        this.updateFairy();//精灵信息
    },

    updateFairy(){
        this.updateTop();//精灵基础信息
        this.updateEquips();//精灵装备
        this.updateBody();//精灵形象
        this.updateJiban();//精灵羁绊
        this.updateSelectPos();//选择动画
    },

    updateFairyHead(){
        this.nodes_fairyhead.forEach((e,idx) => {
            var fairyHeadNode = e.getComponent('FairyHeadNode');
            fairyHeadNode.from = 'observe';
            var item_pets = this._data.pets[idx];
            var info = {};
            info.pos = idx + 1;
            if(item_pets && item_pets.id > 0){
                info.fairyInfo = {
                    isopen: true,
                    pettid: item_pets.id,
                    petid: item_pets.id,
                    pos: idx + 1
                };
            }
            if(!item_pets){
                info.unlock = true;
            }
            fairyHeadNode.updatePosView(info,this.onTouchFiaryHead.bind(this,idx));
        });
    },

    onTouchFiaryHead(idx){
        this.trySelectPos(idx);
    },

    updateTop(){
        this.sprite_occupation.node.active = false;
        this.label_occupation.setText('');
        if(this.item_fairy){
            this.label_level.string = this.item_fairy.level || '';

            this.label_power.string = Game.Tools.UnitConvert(this.item_fairy.wdstr);
            this.label_swift.string = Game.Tools.UnitConvert(this.item_fairy.wddex);
            this.label_smart.string = Game.Tools.UnitConvert(this.item_fairy.wdint);
            this.label_resistance.string = Game.Tools.UnitConvert(this.item_fairy.wdcon);
            this.label_strength.string = Game.Tools.UnitConvert(this.item_fairy.fight);
            if(this.item_fairyconfig){
                this.sprite_occupation.node.active = true;
                this.sprite_occupation.SetSprite(Game.FairyModel.GetJobIcon(this.item_fairyconfig.fairyjob));
                this.label_occupation.setText(Game.FairyModel.GetJobName(this.item_fairyconfig.fairyjob));

                // Game.FairyModel.GetJobName(this._fairyBaseConfig.fairyjob))
            }
        }
        else{
            this.label_level.string = '';

            this.label_power.string = 0;
            this.label_swift.string = 0;
            this.label_smart.string = 0;
            this.label_resistance.string = 0;
            this.label_strength.string = 0;
        }
    },

    updateEquips(){
        this.nodes_equip.forEach((e,idx) => {
            var fairyEquipNode = e.getComponent('FairyEquipNode');
            var data = {};
            data.pos = idx + 1;
            data.equipInfo = this.item_equips[idx];
            fairyEquipNode.updateView(data);
        });
    },

    updateBody(){
        if(!this.item_fairyconfig){
            return;
        }
        if(!this.item_fairy){
            return;
        }
        //精灵名称
        this.label_fairyname.setText(this.item_fairyconfig.fairyname);
        this.label_fairyname.node.color = Game.FairyModel.GetFairyLabelColor(this.item_fairyconfig.fairycolor);

        //精灵星级
        this.showStar(this.item_fairy.star);

        //精灵形象
        var skeletonPath = this.item_fairyconfig.fairyavatar;
        this.addRoleSpine(this.node_fairy, skeletonPath);

        this.node_tip.active = !this.hasfairy;
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

    updateJiban(){
        if(this.hasfairy){
            this.node_jiban.active = true;
            if(this.item_fairyconfig){
                var jibanKind = this.item_fairyconfig.fairykind+1;
                var level = this.item_fairy.fatelevel || 1;
                var fateId = this.item_fairyconfig.fairykind * 100 + level;
                var fateConfig = Game.FairyModel.GetFairyFateConfigById(fateId);
                if(fateConfig){
                    jibanKind = fateConfig.fate;
                    this.fateItemId = fateConfig.itemid;
                }
                var jibanConfig = Game.FairyModel.GetFairyBaseConfigByKind(jibanKind);
                this.sprite_jibanicon.SetSprite(jibanConfig.fairyhead);
                this.label_jibanname.setText(jibanConfig.fairyname);
                this.label_jibanstar.setText("0");
                // this.Label_jiban_name.node.color = Game.FairyModel.GetFairyLabelColor(jibanConfig.fairycolor);

                this.sprite_jibanicon._sgNode.setState(1);

                if(this.item_fairy.fateon){
                    this.sprite_jibanshut.active = false;
                    this.sprite_jibanicon._sgNode.setState(0);
                    this.label_jibanstar.setText(level);
                    var bar = Math.min(level/5,1);
                    this.sprite_jibanbar.fillRange = bar;
                }else{
                    this.sprite_jibanshut.active = true;
                    this.sprite_jibanicon._sgNode.setState(1);
                    this.sprite_jibanbar.fillRange = 0;
                }
            }
        }else{
            this.node_jiban.active = false;
        }
    },

    updateSelectPos(){
        this.node_selected.node.active = this.hasfairy;
        this.node_selected.node.setPositionX((this.selectidx)*140-355);
    }

    // update (dt) {},
});
