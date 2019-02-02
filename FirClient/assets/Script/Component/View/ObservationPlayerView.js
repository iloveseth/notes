const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_country: { default: null, type: cc.Label_ },//y
        Label_countryname: { default: null, type: cc.Label_ },//y
        Label_sociaty: { default: null, type: cc.Label_ },//y
        Label_sociatyname: { default: null, type: cc.Label_ },//y
        Label_level: { default: null, type: cc.Label_ },//y
        Label_levelnum: { default: null, type: cc.Label_ },//y
        Label_occupation: { default: null, type: cc.Label_ },
        Label_mp: { default: null, type: cc.Label_ },//y
        Label_mpnum: { default: null, type: cc.Label_ },//y
        Label_hp: { default: null, type: cc.Label_ },//y
        Label_hpnum: { default: null, type: cc.Label_ },//y
        Label_playname: { default: null, type: cc.Label_ },//y
        Label_fight: { default: null, type: cc.Label_ },//y
        Label_strength: { default: null, type: cc.Label_ },//y
        Sprite_occupation: { default: null, type: cc.Sprite_ },//
        Node_Equip: { default: [], type: [cc.Node] },
        Skeleton_player: { default: null, type: sp.Skeleton },

        button_detail: {default: null,type: cc.Button_},
        button_giveflower: {default: null,type: cc.Button_},
        button_chat: {default: null,type: cc.Button_},
        button_addfriend: {default: null,type: cc.Button_},
        button_addenemy: {default: null,type: cc.Button_},
        button_addstrengh: {default: null,type: cc.Button_},
        button_lineup: {default: null,type: cc.Button_},

        label_power: { default: null, type: cc.Label_ },
        label_swift: { default: null, type: cc.Label_ },
        label_smart: { default: null, type: cc.Label_ },
        label_resistance: { default: null, type: cc.Label_ },

        sprite_icon:{ default: null, type: cc.Sprite_ },//
    },

    onLoad() {
        this.button_lineup.node.on('click',this.onTouchLineup.bind(this));
    },

    onTouchLineup(){
        let isMeEquip = Game.GlobalModel.GetIsLookMyEquip();
        if(isMeEquip){
            this.changeMainPage(Game.Define.MAINPAGESTATE.Page_Pet);
        }else{
            var msg = {
                charid: this._data.charid
            }
            Game.NetWorkController.SendProto('msg.ObserveUserPet',msg);
        }
        
    },

    onTouchChat(){
        if(this._data.charid){

            Game.NotificationController.Emit(Game.Define.EVENT_KEY.CHAT_VIEW_OPEN_PRIVATE, {charid:this._data.charid, name:this._data.name});
        }
    },

    onEnable() {
        var isMe = this._data.charid == Game.UserModel.GetUserInfo().charid;
        Game.GlobalModel.SetIsLookMyEquip(isMe);    //设置查看的是自己的装备

        this.initNotification();
        this.initData();
    },

    updateView(){
        this.initSkeleton();
        this.initEquipNode();
        this.onUserInfoRefresh();
        this.onUserBaseInfoRefresh();
        this.onUserStrengthRefresh();
        this.updateOther();
    },

    updateOther(){
        // this._data
        this.label_power.string = this.user_first.wdstr;
        this.label_swift.string = this.user_first.wddex;
        this.label_smart.string = this.user_first.wdint;
        this.label_resistance.string = this.user_first.wdcon;

        var occupation = this.getOccupation();
        this.sprite_icon.SetSprite(Game.UserModel.GetProfessionIcon(occupation));
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        // Game.NetWorkController.AddListener('msg.RetObserveInfo', this, this.onRetObserveInfo);
        Game.NetWorkController.AddListener('msg.RetObservePet',this,this.onRetObservePet);
    },

    removeNotification() {
        // Game.NetWorkController.RemoveListener('msg.RetObserveInfo', this, this.onRetObserveInfo);
        Game.NetWorkController.RemoveListener('msg.RetObservePet',this,this.onRetObservePet);
    },

    initData(){
        this.user_all = this._data;
        this.user_base = this._data.ba_info;
        this.user_first = this._data.fi_info;
        this.user_second = this._data.se_info;
        this.user_equips = this._data.equips;

        Game.UserModel.observe = this._data;

        this.updateView();
    },
    onRetObserveInfo(ret,data){
        this.user_all = data;
        this.user_base = data.ba_info;
        this.user_first = data.fi_info;
        this.user_second = data.se_info;
        this.user_equips = data.equips;

        Game.UserModel.observe = data;

        this.updateView();
    },

    onRetObservePet(ret,data){
        data.from = 1;
        this.openView(Game.UIName.UI_FAIRYOBSERVEVIEW,data);
    },

    initEquipNode () {
        this.Node_Equip.forEach((e,idx) => {
            var _equipComponet = e.getComponent('EquipNode');
            if(_equipComponet){
                var equipInfo = Game._.find(this.user_equips, { packagepos: idx + 1 });
                _equipComponet.updateEquipInfoOb(equipInfo);
            }
        }); 
    },

    getEquipByIdx(){},

    initSkeleton() {
        Game.ResController.LoadSpine(Game.UserModel.GetPlayerSkeleton(this.getOccupation()), function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.Skeleton_player.skeletonData = asset;
                this.Skeleton_player.setAnimation(0, Game.Define.MONSTER_ANIMA_STATE.IDLE, true);
            }
        }.bind(this));
    },

    onUserInfoRefresh() {
        this.Label_playname.setText(this.user_all.name);
        this.Label_occupation.setText(Game.UserModel.GetJobName(this.getOccupation()));
        this.Label_levelnum.setText(Game.UserModel.GetLevelDesc(this.user_all.level));
        this.Label_sociatyname.setText(this.user_all.sept_name != '' && this.user_all.sept_name || '无');
        this.Label_countryname.setText(Game.UserModel.GetCountryName(this.user_all.country));
        this.Sprite_occupation.SetSprite(Game.UserModel.GetJobIcon(this.getOccupation()));
    },

    getOccupation(){
        var face = this.user_all.face;
        let occupation = Game.UserDefine.PROFESSION.PROFESSION_JIANSHI;
        if (face >= 10 && face < 20) {
            occupation = Game.UserDefine.PROFESSION.PROFESSION_JIANSHI;
        }
        else if (face >= 20 && face < 30) {
            occupation = Game.UserDefine.PROFESSION.PROFESSION_MOFASHI;
        }
        else if (face >= 30 && face < 40) {
            occupation = Game.UserDefine.PROFESSION.PROFESSION_PAONIANG;
        }
        return occupation;
    },

    onUserBaseInfoRefresh() {
        this.Label_hpnum.setText(this.user_base.hp);
        this.Label_mpnum.setText(this.user_base.mp);

        this.onUserStrengthRefresh();
    },

    onUserStrengthRefresh() {
        let curStrength = this.user_all.cur_strength;
        let maxStrength = this.user_all.max_strength;
        let perval = 0;
        let strengthConfig = Game.ConfigController.GetConfig('strength_data');
        for (let i = 0; i < strengthConfig.length; i ++) {
            let strengInfo = strengthConfig[i];
            if (curStrength >= strengInfo.minval && curStrength <= strengInfo.maxval) {
                perval = strengInfo.perval;
            }
        }

        let tColor = cc.color(0, 255, 0);
        if (perval > 90) {
            tColor = cc.color(0, 255, 0);
        } else if (perval > 70) {
            tColor = cc.color(255, 255, 0);
        } else {
            tColor = cc.color(255, 0, 0);
        }
        this.Label_fight.node.color = tColor;
        this.Label_strength.node.color = tColor;

        this.Label_fight.setText(Game.Tools.UnitConvert(this.user_all.fight_value) + ' (' + perval + '%)');
        this.Label_strength.setText(curStrength + '/' + maxStrength);
        
    },

    onClickAddStrength() {
        Game.NetWorkController.SendProto('msg.AddHuoLiFull', {});
    },

    onClickUserDetail() {
        this.openView(Game.UIName.UI_USERPROERTYNODE);
    },

    onClickOpenStarAttribute() {
        this.openView(Game.UIName.UI_EQUIPSTARATTRIBUTENODE, {
            starSuit: Game.UserModel.GetUserMainInfo().starindex, 
            strongSuit: Game.UserModel.GetUserMainInfo().strongsuit
        });
    },
});
