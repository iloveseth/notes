const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        RunMapNode: { default: null, type: cc.Node },

        Label_title: { default: null, type: cc.Label_ },
        Label_huoCountry: { default: null, type: cc.Label_ },
        Label_huoCountryNum: { default: null, type: cc.Label_ },
        Label_bingCountry: { default: null, type: cc.Label_ },
        Label_bingCountryNum: { default: null, type: cc.Label_ },
        Label_isopenkingtask: { default: null, type: cc.Label_ },
        Label_num: { default: null, type: cc.Label_ },

        Sprite_leftSpar: { default: null, type: cc.Sprite },
        Sprite_rightSpar: { default: null, type: cc.Sprite },
        Sprite_spar: { default: null, type: cc.Sprite_ },

        Button_get: { default: null, type: cc.Button_ },
        Button_build: { default: null, type: cc.Button_ },
        Button_gettask: { default: null, type: cc.Button_ },
        Button_finish: { default: null, type: cc.Button_ },
        Button_plese: { default: null, type: cc.Button_ },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.initView();
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
    },
    initData() {
        //人物跑动代码
        this._runMapCompComponent = this.RunMapNode.getComponent('RunMapNode');
    },

    initView() {
        this.kingtaskTime = 0;

        this.mainRole = this._runMapCompComponent.Init(null, cc.v2(this.Sprite_leftSpar.node.x + (this.Sprite_leftSpar.node.width/2), this.Sprite_leftSpar.node.y), this.onArrive.bind(this), 180);
        this.Sprite_spar.node.x = 0;
        this.Sprite_spar.node.y = 200;
        this.Sprite_spar.node.parent = this.mainRole.node;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.ROBBING_INFO_REFRESH, this, this.updateView);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ROBBING_BTN_REFRESH, this, this.updateButton);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ROBBING_INFO_REFRESH, this, this.updateView);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ROBBING_BTN_REFRESH, this, this.updateButton);
    },

    updateView() {
        this._data = Game.TaskModel.retTempleData;

        
        this.kingtaskTime = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_KINGTASK);
        if (this.kingtaskTime > 0) {
            this.Label_isopenkingtask.setText(`开启(加成${Game.TaskModel.kingtaskAdd}%)`);
        } else {
            this.Label_isopenkingtask.setText('未开启');
        }

        this.Label_title.setText(Game.UserModel.GetCountryName(Game.UserModel.GetCountry()) + ' 晶石祭坛');
        Game._.forEach(this._data.info, function(info) {
            if (info.country == Game.UserDefine.COUNTRY.FIRE) {
                this.Label_huoCountryNum.setText(info.num);
                this.Label_huoCountry.node.color = cc.color(250,222,133);
                this.Label_bingCountry.node.color = cc.color(255,167,167);
            } else if (info.country == Game.UserDefine.COUNTRY.ICE) {
                this.Label_bingCountryNum.setText(info.num);
                this.Label_huoCountry.node.color = cc.color(255,167,167);
                this.Label_bingCountry.node.color = cc.color(250,222,133);
            }
        }.bind(this));
        this.Label_num.setText(this._data.left);

        this.Button_get.node.active = this._data.color == 0;
        if(this._data.color != 0){
            if(Game.TaskModel.robbingHasBless){
                this.Button_finish.node.active = true;
                this.Button_plese.node.active = false;
            }else{
                this.Button_finish.node.active = false;
                this.Button_plese.node.active = true;
            };
        }else{
            this.Button_finish.node.active = false;
            this.Button_plese.node.active = false;
        }
        // this.Button_finish.node.active = this._data.color != 0;
        // this.Button_plese.node.active = this._data.color != 0;
        this.Button_build.node.active = false;
        this.Button_gettask.node.active = false;

        if (this._data.color > 0) {
            this.Sprite_spar.SetSprite('Image/UI/RobbingSparView/touding_zhuan0' + this._data.color);
        }
        this.Sprite_spar.node.active = this._data.color != 0;
    },

    onArrive() {
        this.Button_get.node.active = false;
        this.Button_finish.node.active = false;
        this.Button_plese.node.active = false;
        this.Button_build.node.active = true;
        this.Button_gettask.node.active = false;
    },

    onClickGet() {
        Game.NetWorkController.SendProto('msg.startStealEnemyTemple', {});
        Game.NetWorkController.SendProto('border.reqQuestInfo', {});
    },

    onClickFinish() {
        this._runMapCompComponent.SetTargetPos(this.mainRole.node.uuid, cc.v2(this.Sprite_rightSpar.node.x - (this.Sprite_rightSpar.node.width/2), this.Sprite_rightSpar.node.y));
    },

    onClickBuild() {
        this.removeNotification();
        this.Sprite_spar.node.active = false;
        this.Sprite_spar.node.parent = this.node;
        Game.NetWorkController.SendProto('msg.buildSelfTemple', {});

        this.Button_get.node.active = false;
        this.Button_finish.node.active = false;
        this.Button_plese.node.active = false;
        this.Button_build.node.active = false;
        this.Button_gettask.node.active = true;
        Game.TaskModel.robbingHasBless = false;
    },

    onClickPlese() {
        if (Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_ROBBINGSPARBLESS) > 0) {
            Game.NetWorkController.SendProto('msg.reqBless', {
                type: Game.Define.BlessType.BlessType_Temple,
                blessid: Game.BlessModel.robbingsparIconData.blessid
            });
        } else {
            Game.NetWorkController.SendProto('msg.reqBless', {
                type: Game.Define.BlessType.BlessType_Temple,
                blessid: 0
            });
            // Game.TaskModel.robbingHasBless = true;
            // this.Button_plese.node.active = false;
            // this.Button_finish.node.active = true;
        }
    },

    updateButton(){
        if(this._data.color != 0){
            if(Game.TaskModel.robbingHasBless){
                this.Button_finish.node.active = true;
                this.Button_plese.node.active = false;
            }else{
                this.Button_finish.node.active = false;
                this.Button_plese.node.active = true;
            };
        }else{
            this.Button_finish.node.active = false;
            this.Button_plese.node.active = false;
        }
    },
});
