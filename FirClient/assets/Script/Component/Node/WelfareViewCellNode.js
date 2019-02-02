const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_cell_name: { default: null, type: cc.Label_ },
        lab_cell_pk: { default: null, type: cc.Label_ },
        lab_cell_zan: { default: null, type: cc.Label_ },
        lab_cell_desc: { default: null, type: cc.Label_ },
        spr_sign_icon: { default: null, type: cc.Sprite_ },
        spr_icon_tab: { default: [], type: [cc.Sprite_] },
        lab_num_tab: { default: [], type: [cc.Label_] },
        lab_cell_progress: { default: null, type: cc.Label_ },
        btn_get_reward: { default: null, type: cc.Button_ },
        btn_get_go: { default: null, type: cc.Button_ },
        lab_get_reward: { default: null, type: cc.Label_ },
    },

    onLoad() {
 
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        this.mtype = this._target.mtype;
        this.mbtnstate = 0;

        this.lab_cell_pk.node.active = false;
        this.lab_cell_zan.node.active = false;

        for(let i = 0; i < 3; i++){
            this.spr_icon_tab[i].node.active = false;
        };

        if(this.mtype == 1){
            //每日试炼
            this.btn_get_reward.node.active = false;
            this.btn_get_go.node.active = false;
            let reward_d = this._data;
            let tmpWard_d = Game.ConfigController.GetConfigById("daygrow_data",reward_d.id);
            if(tmpWard_d == null){return};

            if(tmpWard_d.sort == 3){
                this.lab_cell_pk.node.active = true;
            }else{
                this.lab_cell_pk.node.active = false;
            };
            if(tmpWard_d.sort == 13){
                this.lab_cell_zan.node.active = true;
            }else{
                this.lab_cell_zan.node.active = false;
            };

            this.spr_sign_icon.SetSprite(tmpWard_d.picture);
            this.lab_cell_name.string = tmpWard_d.name;
            this.lab_cell_desc.string = tmpWard_d.desc;
            this.lab_cell_progress.string = reward_d.num+"/"+tmpWard_d.point;
            if(reward_d.progress == Game.Define.DayGrowStatus.DayGrow_UNGET || reward_d.progress == Game.Define.DayGrowStatus.DayGrow_UNCOMPLETE){
                this.mbtnstate = reward_d.progress;
                if(reward_d.progress == Game.Define.DayGrowStatus.DayGrow_UNCOMPLETE){
                    this.lab_get_reward.string = "前 往";
                    this.btn_get_go.node.active = true;
                }else{
                    this.lab_get_reward.string = "领 取";
                    this.btn_get_reward.node.active = true;
                    this.btn_get_reward.interactable = true;
                };

            }else{
                this.btn_get_reward.node.active = true;
                this.btn_get_reward.interactable = false;
                this.lab_get_reward.string = "已领取";
            };

            let limitID = Game._.get(tmpWard_d, 'limitid', 0);
            let isOpen = Game.GuideController.IsFunctionOpen(limitID);
            // if(!isOpen){
            //     this.btn_get_go.interactable = false;
            // };
            this.showRewardData(tmpWard_d.rewardid);

        }else if(this.mtype == 2){
            //成长试炼
            this.btn_get_reward.node.active = true;
            this.btn_get_go.node.active = false;
            let reward_s = this._data;
            let tmpWard_s = Game.ConfigController.GetConfigById("sysreward_data",reward_s.mId);
            let obj = Game.ConfigController.GetConfigById("object_data",tmpWard_s.reward);

            this.spr_sign_icon.SetSprite(obj.pic);
            this.lab_cell_name.string = tmpWard_s.title;
            this.lab_cell_desc.string = tmpWard_s.info;
            this.lab_cell_progress.string = reward_s.presentNum+"/"+reward_s.nextNum;
            if(tmpWard_s.type == 7){
                if(reward_s.presentNum == 0){
                    this.lab_cell_progress.string = "最高排名:无";
                }else{
                    this.lab_cell_progress.string = "最高排名:"+reward_s.presentNum;
                };
            };
            if(reward_s.isGet){
                this.btn_get_reward.interactable = true;
                this.lab_get_reward.string = "领 取";
            }else{
                this.btn_get_reward.interactable = false;
                this.lab_get_reward.string = "未完成";
            };

            //显示最多3个奖励
            let idx = 0;
            let item = tmpWard_s.clientshow;
            if(item !== "" && item !== "0"){
                let items = item.split(";");
                for(let i = 0; i < items.length; i++){
                    let tbitem = items[i].split("-");
                    if(idx <= 2){
                        this.spr_icon_tab[idx].node.active = true;
                        this.spr_icon_tab[idx].SetSprite(Game.ConfigController.GetConfigById("object_data",tbitem[0]).pic);
                        this.lab_num_tab[idx].string = "x" + Game.Tools.UnitConvert(tbitem[1]);
                    };
                    idx = idx + 1;
                };
            };
        };

    },

    showRewardData(rewardid){
        let reward_c = Game.ConfigController.GetConfigById("commonreward_data",rewardid);
        let idx = 0;
        let yuanbao = reward_c.yuanbao;
        let gold = reward_c.gold;
        let money = reward_c.money;
        let fame = reward_c.fame;
        if(yuanbao > 0){
            
            this.spr_icon_tab[idx].node.active = true;
            this.lab_num_tab[idx].string = "x" + Game.Tools.UnitConvert(yuanbao);
            this.spr_icon_tab[idx].SetSprite(Game.ConfigController.GetConfigById("object_data",323).pic);
            idx = idx + 1;
        };
        if(gold > 0){
            
            this.spr_icon_tab[idx].node.active = true;
            this.lab_num_tab[idx].string = "x" + Game.Tools.UnitConvert(gold);
            this.spr_icon_tab[idx].SetSprite(Game.ConfigController.GetConfigById("object_data",109).pic);
            idx = idx + 1;
        };
        if(money > 0){
            
            this.spr_icon_tab[idx].node.active = true;
            this.lab_num_tab[idx].string = "x" + Game.Tools.UnitConvert(money);
            this.spr_icon_tab[idx].SetSprite(Game.ConfigController.GetConfigById("object_data",108).pic);
            idx = idx + 1;
        };
        if(fame > 0){
            
            this.spr_icon_tab[idx].node.active = true;
            this.lab_num_tab[idx].string = "x" + Game.Tools.UnitConvert(fame);
            this.spr_icon_tab[idx].SetSprite(Game.ConfigController.GetConfigById("object_data",282).pic);
            idx = idx + 1;
        };

        let item = reward_c.item;
        if(item !== "" && item !== "0"){
            let items = item.split(";");
            for(let i = 0; i < items.length; i++){
                let tbitem = items[i].split("-");
                if(idx <= 2){
                    this.spr_icon_tab[idx].node.active = true;
                    this.lab_num_tab[idx].string = "x" + Game.Tools.UnitConvert(tbitem[1]);
                    this.spr_icon_tab[idx].SetSprite(Game.ConfigController.GetConfigById("object_data",tbitem[0]).pic);
                };
                idx = idx + 1;
            };
        };
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
    
    clicked() {
    	cc.log("lay WelfareViewCellNode clicked");
       
    },

    onBtn_go_or_get_Touch(){
        cc.log('WelfareViewCellNode onBtn_go_or_get_Touch');
        if(this.mtype == 1){
            if(this.mbtnstate == Game.Define.DayGrowStatus.DayGrow_UNGET){
                Game.NetWorkController.SendProto('daygrow.reqDayGrowReward', {id:this._data.id});//领取每日试炼奖励
            }else{
                //前往完成任务
                let reward_t = this._data;
                let tmpWard_t = Game.ConfigController.GetConfigById("daygrow_data",reward_t.id);
                let limitID = Game._.get(tmpWard_t, 'limitid', 0);
                let isOpen = Game.GuideController.IsFunctionOpen(limitID);
                if(isOpen){
                    this._target.onClose();
                    let tag = tmpWard_t.id||0;
                    Game.WelfareModel.jumpToMissionView(tag);
                }else{
                    let limitConfig = Game.ConfigController.GetConfigById('levellimit_data', limitID);
                    Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, limitConfig.content);
                };  
            };
        }else if(this.mtype == 2){
            Game.NetWorkController.SendProto('msg.getSysReward', {id:this._data.mId});//领取成长试炼奖励
        };

        
    },
});