const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_title: cc.Label_,
        label_caller: cc.Label_,
        label_callee: cc.Label_,
        label_reason: cc.Label_,
        label_winlose: cc.Label_,//胜负情况
        label_noticecaller: cc.Label_,
        label_fight: cc.Label_,
        label_strength: cc.Label_,
        button_addstrength: cc.Button_,
        table_attack: cc.tableView,
        table_defend: cc.tableView,
        table_notice: cc.tableView,
        button_pk: cc.Button_,
        button_rescue: cc.Button_,

        label_cd: cc.Label_,

        node_left: cc.Node,
        label_left: cc.Label_,

        node_end: cc.Node,

    },

    onEnable(){
        this.initData(this._data);
        
        this.schedule(this.updateCd.bind(this),1);
        this.initNotification();

        this.updateView();
    },

    onDisable(){
        this.removeNotification();
        this.unschedule(this.updateCd.bind(this));
    },

    initNotification() {
        Game.NetWorkController.AddListener('jijie.retJijieMainData', this, this.onRetJijieMainData);
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('jijie.retJijieMainData', this, this.onRetJijieMainData);
    },

    onRetJijieMainData(ret,data){
        if(!data.is_openui){
            this.initData(data.data);
            this.updateView();
        }  
    },

    initData(_data){
        this.call_data = _data;                //全局数据

        this.call_clash = _data.clashobj;      //冲突对象
        this.call_report = _data.report.reverse();       //战斗报告

        this.call_attack = _data.attlist;      //进攻方
        this.call_defend = _data.deflist;      //防守方

        this.call_reason = Game.ConfigController.GetConfigById('jijietype_data',this.call_data.jijietype).jijiereason;

        this.call_cd = this.call_data.timeleft;

        this.call_guid = _data.guid;

        switch(this.call_data.jijietype){
            case 1: case 2: case 3: case 4: case 5: {
                this.call_realtype = 0;
                break;
            }
            case 6: case 7: case 8: case 9: case 10: {
                this.call_realtype = 1;
                break;
            }
        }

        cc.log(this.call_data);
        if(this.call_data.endstate == 0){
            this.call_state = 0;//进行中
        }
        else{
            var winner = this.call_data.winner;
            if(winner == this.call_clash.id){
                this.call_state = 1;//胜利
            }
            else{
                this.call_state = 2;//失败
            }
        }

    },

    updateView(){
        this.updateClashObj();
        this.updateAttack();
        this.updateDefend();
        this.updateFightAndStrength();
        this.updateNotice();
        this.updateCallType();
        this.updateCd();
    },

    updateCallState(){

    },

    updateClashObj(){
        this.label_caller.string = this.call_clash.name;
        this.label_callee.string = this.call_clash.enemyname;
        this.label_reason.string = this.call_reason;
        this.label_winlose.string = ['进行中','胜利','失败'][this.call_state];

        this.node_end.active = this.call_state != 0;
    },

    //fight--战力  strength--活力
    updateFightAndStrength() {
        let curStrength = Game.UserModel.GetUserStrengthInfo().num;
        let maxStrength = Game.UserModel.GetUserStrengthInfo().maxnum;
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
        this.label_fight.node.color = tColor;
        this.label_strength.node.color = tColor;

        this.label_fight.setText(Game.Tools.UnitConvert(Game.UserModel.GetUserMainInfo().fightval) + ' (' + perval + '%)');
        this.label_strength.setText(curStrength + '/' + maxStrength);
        
        this.button_addstrength.interactable = curStrength < maxStrength;
    },

    updateAttack(){
        this.table_attack.initTableView(this.call_attack.length, { array: this.call_attack, target: this });
    },

    updateDefend(){
        this.table_defend.initTableView(this.call_defend.length, { array: this.call_defend, target: this });
    },

    updateNotice(){
        this.table_notice.initTableView(this.call_report.length,{ array: this.call_report, target: this });
    },

    onClickAddStrength() {
        Game.NetWorkController.SendProto('msg.AddHuoLiFull', {});
    },

    updateCallType(){
        if(this.call_realtype == 0){
            this.label_title.setText('PK');
            this.button_pk.node.active = true;
            this.button_rescue.node.active = false;
            this.node_left.active = true;
            this.label_left.string = 5;
            this.call_attack.forEach(e => {
                if(e.charid == Game.UserModel.GetCharid()){
                    this.label_left.string = 5 - e.attnum;
                }
            });
        }
        if(this.call_realtype == 1){
            this.label_title.setText('救援');
            this.button_pk.node.active = false;
            this.button_rescue.node.active = true;
            this.node_left.active = false;
        }
    },

    updateCd(){
        this.call_cd = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_JIJIE);
        this.label_cd.string = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_JIJIE, 'mm:ss');
        this.updateFightAndStrength();
        if(this.call_cd == 0){
            this.unschedule(this.updateCd.bind(this));
            this.button_pk.interactable = false;
            this.button_rescue.interactable = false;
        }
    },

    onTouchPK(){
        var msg = {
            guid:  this.call_guid,
        };
        Game.NetWorkController.SendProto('jijie.reqJijiePk', msg);
    },

    // update (dt) {},
});
