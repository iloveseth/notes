const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        lab_country: { default: null, type: cc.Label_ },
        lab_name: { default: null, type: cc.Label_ },
        lab_zhanshi: { default: null, type: cc.Label_ },
        lab_level: { default: null, type: cc.Label_ },
        lab_fight: { default: null, type: cc.Label_ },
        // lab_chenghao: { default: null, type: cc.Label_ },
        // lab_biaoqian: { default: null, type: cc.Label_ },

        spr_touxiang: { default: null, type: cc.Sprite_ },
        spr_vip_1: { default: null, type: cc.Sprite_ },
        spr_vip_2: { default: null, type: cc.Sprite_ },

        lab_fight_rank: { default: null, type: cc.Label_ },
        lab_lv_rank: { default: null, type: cc.Label_ },
        lab_online_time: { default: null, type: cc.Label_ },
        lab_get_exp: { default: null, type: cc.Label_ },
        lab_get_equip: { default: null, type: cc.Label_ },
        lab_get_gem: { default: null, type: cc.Label_ },
        lab_login_num: { default: null, type: cc.Label_ },
        lab_get_yinzi: { default: null, type: cc.Label_ },
        lab_get_jinzi: { default: null, type: cc.Label_ },
        lab_getSpar_num: { default: null, type: cc.Label_ },
        lab_guozhan_win_num: { default: null, type: cc.Label_ },
        lab_guozhan_num: { default: null, type: cc.Label_ },
        lab_win_rate: { default: null, type: cc.Label_ },
        lab_pk_day_num: { default: null, type: cc.Label_ },
        lab_pk_win_num: { default: null, type: cc.Label_ },
        lab_pk_num: { default: null, type: cc.Label_ },
        lab_pk_win_day_num: { default: null, type: cc.Label_ },
        lab_kill_boss_cheng: { default: null, type: cc.Label_ },
        lab_kill_boss_lan: { default: null, type: cc.Label_ },
        lab_kill_boss_zi: { default: null, type: cc.Label_ },
        lab_kill_boss_lv: { default: null, type: cc.Label_ },
        lab_dig_occupy_num: { default: null, type: cc.Label_ },
        lab_dig_item_num: { default: null, type: cc.Label_ },
        lab_dig_equip_num: { default: null, type: cc.Label_ },
        lab_crystal_num_cheng: { default: null, type: cc.Label_ },
        lab_fifteen_star_num: { default: null, type: cc.Label_ },
        lab_send_flower_num: { default: null, type: cc.Label_ },
        lab_get_flower_num: { default: null, type: cc.Label_ },
        lab_get_luck_jinbi_num: { default: null, type: cc.Label_ },
        lab_spar_num_cheng: { default: null, type: cc.Label_ },
        lab_gonghui_husong: { default: null, type: cc.Label_ },

        // btn_yimin: { default: null, type: cc.Button_ },
        // btn_xiugai: { default: null, type: cc.Button_ },
        // btn_biaoqian: { default: null, type: cc.Button_ },
        Button_xuanyao: { default: null, type: cc.Button_ },

        sprite_shutmusic: cc.Sprite_,
        sprite_shuteffect: cc.Sprite_,
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
        Game.NetWorkController.AddListener('msg.retFightInfo', this, this.refreshExtraInfo);//返回额外战力信息
        Game.NetWorkController.AddListener('msg.retTitleShow', this, this.onRetTitleShow);//返回显示的称号信息
        Game.NetWorkController.AddListener('msg.reqPersonalTagInfo', this, this.refreshTagInfo);//返回标签信息

        Game.NetWorkController.AddListener('msg.retTitleSet', this, this.onRetTitleSet);//返回称号列表
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('msg.retFightInfo', this, this.refreshExtraInfo);
        Game.NetWorkController.RemoveListener('msg.retTitleShow', this, this.onRetTitleShow);
        Game.NetWorkController.RemoveListener('msg.reqPersonalTagInfo', this, this.refreshTagInfo);

        Game.NetWorkController.RemoveListener('msg.retTitleSet', this, this.onRetTitleSet);
    },

    initView(){

        Game.NetWorkController.SendProto('msg.reqFightInfo', {});//请求额外战力信息
        Game.NetWorkController.SendProto('msg.reqPersonalTagInfo', {});//请求标签信息

        // this.btn_yimin.node.active = false;
        // this.btn_xiugai.node.active = false;
        // this.btn_biaoqian.node.active = false;
        this.Button_xuanyao.node.active = true;
        
        this.setBasicInfo();
        this.initVolumeInfo();
        //设置称号
        // this.setTitleXinxi();

    },

    initVolumeInfo(){
        // var musicvolume = Game.AudioController.GetMusicVolume();
        // this.sprite_shutmusic.node.active = musicvolume == 0;
        var disableMusic = Game.AudioController.disableMusic;
        this.sprite_shutmusic.node.active = disableMusic;

        // var soundvolume = Game.AudioController.GetEffectsVolume();
        // this.sprite_shuteffect.node.active = soundvolume == 0;
        var disableEffect = Game.AudioController.disableEffect;
        this.sprite_shuteffect.node.active = disableEffect;
    },

    setBasicInfo(){
        //基本信息
        let country_id = Game.UserModel.GetCountry();
        let country_name = Game.UserModel.GetCountryShortName(country_id);

        let face_id = Game.UserModel.GetFace();
        let occupation = Game.UserModel.GetOccupation(face_id);
        let chat_head_icon = Game.UserModel.GetProfessionIcon(occupation);
        let job_name = Game.UserModel.GetJobName(occupation);

        let level_num = Game.UserModel.GetLevel();
        let level_desc = Game.UserModel.GetLevelDesc(level_num);

        this.lab_country.string = country_name;
        this.lab_name.string = Game.UserModel.GetUserName();
        this.lab_zhanshi.string = job_name;
        this.lab_level.string = level_desc;
        this.lab_fight.string = Game.UserModel.GetUserMainInfo().fightval;

        this.spr_touxiang.SetSprite(chat_head_icon);

        let vip_lv = Game.UserModel.GetViplevel();
        if(vip_lv >= 10){
            this.spr_vip_1.node.active = true;
            this.spr_vip_2.node.active = true;
            let path_1 = "Image/UI/Common/chongzhi_" + Math.floor(vip_lv/10);
            let path_2 = "Image/UI/Common/chongzhi_" + (vip_lv%10);
            this.spr_vip_1.SetSprite(path_1);
            this.spr_vip_2.SetSprite(path_2);
        }else{
            this.spr_vip_1.node.active = false;
            this.spr_vip_2.node.active = true;
            let path_temp = "Image/UI/Common/chongzhi_" + vip_lv;
            this.spr_vip_2.SetSprite(path_temp);
        }

        // this.lab_chenghao.string = "";
        // this.lab_biaoqian.string = "";
    },

    setTitleXinxi(titleData){
        let m_title_id = 0;
        if(titleData === null ||titleData === undefined){
            m_title_id = Game.UserModel.GetmTitle();
        }else{
            m_title_id = titleData.title;
        }
        if(m_title_id == 0){
            // this.lab_chenghao.string = "";
        }else{
            let title_str = Game.ConfigController.GetConfigById("title_data",m_title_id);
            // this.lab_chenghao.string = title_str;
        };
    },

    setTagXinxi(listindex){
        let tag_all_str = "";
        for(let i = 0; i < listindex.length; i++){
            if(listindex[i] != 0){
                let tag = Game.ConfigController.GetConfigById("personaltag_data",listindex[i]);
                let tag_name = tag.name || "";
                tag_all_str = tag_all_str + tag_name;
                tag_all_str = tag_all_str + "  ";
            }
        }
    },

    //====================  这是分割线  ====================
    refreshExtraInfo(msgid, data){
        
        //额外信息
        this.lab_fight_rank.string = data.fightsort;
        this.lab_lv_rank.string = data.levelsort;
        this.lab_online_time.string = data.onlinetime;
        this.lab_get_exp.string = data.getexp;
        this.lab_get_equip.string = data.getequip;
        this.lab_get_gem.string = data.getstone;
        this.lab_login_num.string = data.logintimes;
        this.lab_get_yinzi.string = data.getmoney;
        this.lab_get_jinzi.string = data.getgold;
        if(this.lab_getSpar_num)
            this.lab_getSpar_num.string = data.guardrob;
        if(this.lab_guozhan_win_num)
            this.lab_guozhan_win_num.string = data.cwarwin;
        if(this.lab_guozhan_num)
            this.lab_guozhan_num.string = data.cwar;
        if(data.pknum == 0){
            this.lab_win_rate.string = "0%";
        }else{
            let w_rate = data.pkwin * 100 / data.pknum;
            this.lab_win_rate.string = Game.Tools.toDecimal(w_rate) + "%";
        };
        this.lab_pk_day_num.string = data.dailypk;
        this.lab_pk_win_num.string = data.pkwin;
        this.lab_pk_num.string = data.pknum || 0;
        if(this.lab_pk_win_day_num)
            this.lab_pk_win_day_num.string = data.dailypkwin;
        this.lab_kill_boss_cheng.string = data.killyellowboss;
        this.lab_kill_boss_lan.string = data.killblueboss;
        this.lab_kill_boss_zi.string = data.killpurpleboss;
        this.lab_kill_boss_lv.string = data.killgreenboss;
        this.lab_dig_occupy_num.string = data.digcap;
        this.lab_dig_item_num.string = data.baozangitem;
        this.lab_dig_equip_num.string = data.baozangequip;
        if(this.lab_crystal_num_cheng)
            this.lab_crystal_num_cheng.string = data.templepurple;
        if(this.lab_fifteen_star_num)
            this.lab_fifteen_star_num.string = data.fifthstars;
        if(this.lab_send_flower_num)
            this.lab_send_flower_num.string = data.giveflower;
        if(this.lab_get_flower_num)
            this.lab_get_flower_num.string = data.receflower;
        if(this.lab_get_luck_jinbi_num)
            this.lab_get_luck_jinbi_num.string = data.snatchredenvelope;
        if(this.lab_spar_num_cheng)    
            this.lab_spar_num_cheng.string = data.guardpurple;
        if(this.lab_gonghui_husong)
            this.lab_gonghui_husong.string = data.septguard;

    },

    refreshTagInfo(msgid, data){
        //标签信息
        let listindex = [];
        let tag_1 = Game._.get(data,"tag",0);
        let tag_2 = Game._.get(data,"tag2",0);
        listindex.push(tag_1);
        listindex.push(tag_2);
        this.setTagXinxi(listindex);
    },

    onRetTitleShow(msgid, data){
        if(typeof(data) == "undefined"){return};
        //返回显示的称号
        this.setTitleXinxi(data);
    },

    onRetTitleSet(msgid, data){
        //返回称号列表
    },

    //移民
    onBtn_yimin_Click(){
        // Game.NetWorkController.SendProto('msg.reqChangeCountryInfo', {});
        this.openView(Game.UIName.UI_PERSONAL_YIMIN_NODE);
    },

    //修改称号
    onBtn_change_title_Click(){
        // Game.NetWorkController.SendProto('msg.reqTitleSet', {});
        this.openView(Game.UIName.UI_PERSONAL_TITLE_NODE);
    },

    //修改标签
    onBtn_change_tag_Click(){
        this.openView(Game.UIName.UI_PERSONAL_TAG_NODE);
    },

    //炫耀
    onBtn_display_Click(){
        Game.Platform.Logout();
    },

    onBtn_revise_Click(){
        this.openView(Game.UIName.UI_SETUPNODE);
    },

    onclickShutMusic(){
        // var musicvolume = Game.AudioController.GetMusicVolume();
        // if(musicvolume == 0){
        //     this.setMusicVolume(1);
        //     if(Game.AudioController.audioName){
        //         Game.AudioController.PlayMusic(Game.AudioController.audioName);
        //     }
        // }
        // else{
        //     this.setMusicVolume(0);
        // }
        var isDisable = Game.AudioController.disableMusic;
        this.disableMusic(!isDisable);
    },
    onclickShutEffect(){
        // var soundvolume = Game.AudioController.GetEffectsVolume();
        // if(soundvolume == 0){
        //     this.setEffectsVolume(1);
        // }
        // else{
        //     this.setEffectsVolume(0);
        // }
        var isDisable = Game.AudioController.disableEffect;
        this.disableEffect(!isDisable);
    },

    setMusicVolume(volume){
        Game.AudioController.SetMusicVolume(volume);
        this.sprite_shutmusic.node.active = volume == 0;
    },

    setEffectsVolume(volume){
        Game.AudioController.SetEffectsVolume(volume);
        this.sprite_shuteffect.node.active = volume == 0;
    },

    disableMusic(isDisable){
        this.sprite_shutmusic.node.active = isDisable;
        Game.AudioController.onChangeMusic(isDisable);
        cc.sys.localStorage.setItem(Game.Define.DATA_KEY.DISABLE_MUSIC,isDisable);
    },

    disableEffect(isDisable){
        this.sprite_shuteffect.node.active = isDisable;
        Game.AudioController.onChangeEffect(isDisable);
        cc.sys.localStorage.setItem(Game.Define.DATA_KEY.DISABLE_EFFECT,isDisable);
    }

});
