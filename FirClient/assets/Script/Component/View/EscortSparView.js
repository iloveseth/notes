const Game = require('../../Game');

const GUARDSTATE =
{
    GUARD_GET: 1,
    GUARD_START: 2,
    GUARD_FINISH: 3,
};

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_isopenkingtask: { default: null, type: cc.Label_ },
        Label_kingtasktimetitle: { default: null, type: cc.Label_ },
        Label_kingtasktime: { default: null, type: cc.Label_ },
        Label_state: { default: null, type: cc.Label_ },
        Label_num: { default: null, type: cc.Label_ },
        Label_spar: { default: null, type: cc.Label_ },
        LabelOutline_spar: { default: null, type: cc.LabelOutline },
        Label_spar2: { default: null, type: cc.Label_ },
        LabelOutline_spar2: { default: null, type: cc.LabelOutline },
        Label_reward: { default: null, type: cc.Label_ },
        Label_exp: { default: null, type: cc.Label_ },
        Label_blessexp: { default: null, type: cc.Label_ },
        // Label_prestige: { default: null, type: cc.Label_ },
        Label_money: { default: null, type: cc.Label_ },
        Label_blessmoney: { default: null, type: cc.Label_ },
        Label_name: { default: null, type: cc.Label_ },
        Label_help: { default: null, type: cc.Label_ },
        lab_refresh_tips: { default: null, type: cc.Label_ },

        Sprite_lastMap: { default: null, type: cc.Sprite },
        Sprite_nextMap: { default: null, type: cc.Sprite },
        Sprite_save: { default: null, type: cc.Sprite_ },
        Sprite_bob: { default: null, type: cc.Sprite_ },
        Sprite_blood: { default: null, type: cc.Sprite_ },

        Button_help: { default: null, type: cc.Button_ },
        Button_get: { default: null, type: cc.Button_ },
        Button_start: { default: null, type: cc.Button_ },
        Button_refresh: { default: null, type: cc.Button_ },
        Button_bless: { default: null, type: cc.Button_ },

        Node_save: { default: null, type: cc.Node },
        Node_bob: { default: null, type: cc.Node },

        sp_car: { default: null, type: sp.Skeleton },

        SingleItemNode: { default: null, type: cc.Node },
        lab_item_num: { default: null, type: cc.Label_ },
    },

    onLoad() {
        this.bolodWidth = this.Sprite_blood.node.width;
    },

    onEnable() {
        this.initData();
        this.initView();
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
        this.Sprite_lastMap.node.stopAllActions();
        this.Sprite_nextMap.node.stopAllActions();
    },

    update(dt) {
        this.dfTime += dt;
        if (this.dfTime >= 1) {
            this.dfTime = 0;
            let laststr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_KINGTASK, 'mm:ss');
            if (laststr == '') {
                this.Label_kingtasktime.setText('');
                this.Label_kingtasktimetitle.node.active = false;
                this.Label_isopenkingtask.setText('未开启');
            } else {
                this.Label_kingtasktime.setText(laststr);
            }
            if (this._data.state == GUARDSTATE.GUARD_START) {
                this.Label_state.setText(Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_ESCORTSPAR, 'mm:ss'));
            }
        }

        //背景动画
        if (this._data.state == GUARDSTATE.GUARD_START) {
            if (this.Sprite_lastMap.node.x <= -this.Sprite_lastMap.node.width) {
                this.Sprite_lastMap.node.x = this.Sprite_nextMap.node.x + this.Sprite_nextMap.node.width;
            } else if (this.Sprite_nextMap.node.x <= -this.Sprite_nextMap.node.width) {
                this.Sprite_nextMap.node.x = this.Sprite_lastMap.node.x + this.Sprite_lastMap.node.width;
            }
            this.Sprite_lastMap.node.x -= 1;
            this.Sprite_nextMap.node.x -= 1;
        }
    },

    initData() {
        this.dfTime = 0;
        this.btnFlag = 0;
    },

    initView() {
        this.Label_exp.setText('0');
        this.Label_blessexp.setText('0');
        // this.Label_prestige.setText('0');
        this.Label_money.setText('0');
        this.Label_blessmoney.setText('0');
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.ESCORTSPAR_INFO_REFRESH, this, this.updateView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ESCORTSPAR_INFO_REFRESH, this, this.updateView);
    },

    updateView() {
        this._data = Game.TaskModel.retGuardSysData;

        let countdown = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_KINGTASK);
        if (countdown > 0) {
            this.Label_kingtasktime.setText(Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_KINGTASK, 'mm:ss'));
            this.Label_kingtasktimetitle.node.active = true;
            this.Label_isopenkingtask.setText(`开启(加成${Game.TaskModel.kingtaskAdd}%)`);
        } else {
            this.Label_kingtasktimetitle.node.active = false;
            this.Label_isopenkingtask.setText('未开启');
        }

        this.Label_num.setText(this._data.left);
        let sparStr = '';
        let sparStrColor = cc.color(255, 237, 216);
        let guardColor = Game._.get(this._data, 'color', 0);
        guardColor = guardColor == 0 && 1 || guardColor;
        if (guardColor == Game.ItemDefine.ITEMCOLOR.Item_White) {
            sparStr = '白色晶石';
            sparStrColor = cc.color(255, 237, 216);
        } else if (guardColor == Game.ItemDefine.ITEMCOLOR.Item_Green) {
            sparStr = '绿色晶石';
            sparStrColor = cc.color(74, 255, 74);
        } else if (guardColor == Game.ItemDefine.ITEMCOLOR.Item_Blue) {
            sparStr = '蓝色晶石';
            sparStrColor = cc.color(101, 237, 255);
        } else if (guardColor == Game.ItemDefine.ITEMCOLOR.Item_Purple) {
            sparStr = '紫色晶石';
            sparStrColor = cc.color(255, 162, 251);
        } else if (guardColor == Game.ItemDefine.ITEMCOLOR.Item_Orange) {
            sparStr = '橙色晶石';
            sparStrColor = cc.color(255, 162, 75);
        }
        this.Label_spar.setText(sparStr);
        this.Label_spar.node.color = sparStrColor;
        // this.LabelOutline_spar.color = sparStrColor;

        this.Label_spar2.setText(sparStr);
        this.Label_spar2.node.color = sparStrColor;
        // this.LabelOutline_spar2.color = sparStrColor;

        this.Label_reward.setText(`${guardColor}倍护送奖励`);

        if (this._data.state == GUARDSTATE.GUARD_GET) {
            this.playIdle()
        } else if (this._data.state == GUARDSTATE.GUARD_START) {
            this.playWalk();
        } else {
            this.playIdle();
        }

        this.Label_name.setText('[' + Game.UserModel.GetCountryShortName(Game.UserModel.GetCountry()) + ']' + Game.UserModel.GetUserName());
        if (this._data.curhp == 1) {
            this.Sprite_blood.node.width = 37;
        } else if (this._data.curhp == 2) {
            this.Sprite_blood.node.width = 71;
        } else {
            this.Sprite_blood.node.width = this.bolodWidth;
        }

        if (this._data.state == GUARDSTATE.GUARD_GET) {
            this.Label_state.setText('已领取晶石');

            this.Button_start.node.active = true;
            this.Button_refresh.node.active = true;
            this.Button_get.node.active = false;
            this.Button_bless.node.active = false;

            let refreshcount = Game._.get(this._data,"refreshcount",0);
            if(refreshcount <= 10){
                this.lab_refresh_tips.setText("1 刷新");
            }else{
                this.lab_refresh_tips.setText("5 刷新");
            };

            Game.NetWorkController.SendProto('border.reqQuestInfo', {});
        } else if (this._data.state == GUARDSTATE.GUARD_START) {
            this.Button_start.node.active = false;
            this.Button_refresh.node.active = false;
            this.Button_get.node.active = false;
            this.Button_bless.node.active = true;
        } else {
            this.Label_state.setText('未领取晶石');

            this.Button_start.node.active = false;
            this.Button_refresh.node.active = false;
            this.Button_get.node.active = true;
            this.Button_bless.node.active = false;
        }

        let guardConfig = Game.ConfigController.GetConfigById('guard_data', this._data.index);
        if (guardConfig) {
            let rewards = guardConfig.reward.split(';');
            for (let i = 0; i < rewards.length; i++) {
                let rewardstr = rewards[i];
                let infostr = rewardstr.split('-');

                if (Game._.toNumber(infostr[0]) == (this._data.rob - this._data.antirobwin)) {
                    let commonReward = Game.ConfigController.GetConfigById('commonreward_data', Game._.toNumber(infostr[1]));
                    if (commonReward) {
                        let per = 1;
                        if (Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_KINGTASK) > 0) {
                            per = 1.2;
                        }
                        this.Label_exp.setText(Game.Tools.UnitConvert(commonReward.exp*per));
                        this.Label_money.setText(Game.Tools.UnitConvert(commonReward.money*per));
                        
                        let itemStr = Game._.get(commonReward,"item","");
                        if(itemStr != "" && itemStr != "0"){
                            let itemTab = itemStr.split(';');
                            let objTab = itemTab[0].split('-');
                            let define = Game.ItemModel.GetItemConfig(Game._.toNumber(objTab[0]));
                            let itemobj = Game.ItemModel.GenerateObjectFromDefine(define,0);
                            this.SingleItemNode.active = true;
                            this.SingleItemNode.getComponent('SingleItemNode').updateView(itemobj, function(){});
                            this.lab_item_num.setText("*"+Game.Tools.UnitConvert(objTab[1]*per));
                        }else{
                            this.SingleItemNode.active = false;
                            this.lab_item_num.setText("");
                        };

                        
                        // this.Label_prestige.setText(Game.Tools.UnitConvert(commonReward.fame*per));

                        //祝福加成
                        this.Label_blessexp.setText(Game.Tools.UnitConvert((this._data.reward - 1) * commonReward.exp));
                        this.Label_blessmoney.setText(Game.Tools.UnitConvert((this._data.reward - 1) * commonReward.money));
                    }
                    break;
                }
            }
        }

        if (this._data.protecter == 0 && this._data.jijierecapture > 0) {
            this.Label_help.setText(`救援( ${this._data.jijierecapture} )`);
            this.Button_help.node.active = true;
        } else {
            this.Button_help.node.active = false;
        }

        this.changeBtn(1);
    },

    changeBtn(type) {
        if (this.btnFlag == type) { return };
        this.btnFlag = type;

        let isTruePath = 'Image/UI/Common/tongyong_icon_0015';
        let isFalsePath = 'Image/UI/Common/tongyong_icon_0016';
        this.Sprite_save.SetSprite(this.btnFlag == 1 && isTruePath || isFalsePath);
        this.Sprite_bob.SetSprite(this.btnFlag == 2 && isTruePath || isFalsePath);
        this.Node_save.active = this.btnFlag == 1;
        this.Node_bob.active = this.btnFlag == 2;
    },

    playIdle() {
        let guardColor = Game._.get(this._data, 'color', 0);
        guardColor = guardColor == 0 && 1 || guardColor;
        let yunbiaoPath = 'yunbiao0' + guardColor;
        Game.ResController.LoadSpine('Animation/Npc/yunbiao/'+ yunbiaoPath + '/' + yunbiaoPath, function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.sp_car.skeletonData = asset;
                this.sp_car.setAnimation(0, 'idle', true);
            }
        }.bind(this));

        this.Sprite_lastMap.node.stopAllActions();
        this.Sprite_lastMap.node.x = 0;
        this.Sprite_nextMap.node.stopAllActions();
        this.Sprite_nextMap.node.x = this.Sprite_lastMap.node.width;
    },

    playWalk() {
        let guardColor = Game._.get(this._data, 'color', 0);
        guardColor = guardColor == 0 && 1 || guardColor;
        let yunbiaoPath = 'yunbiao0' + guardColor;
        Game.ResController.LoadSpine('Animation/Npc/yunbiao/'+ yunbiaoPath + '/' + yunbiaoPath, function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.sp_car.skeletonData = asset;
                this.sp_car.setAnimation(0, 'walk', true);
            }
        }.bind(this));
    },

    onClickSave() {
        this.changeBtn(1);
    },

    onClickBob() {
        this.changeBtn(2);
    },

    onClickHelp() {
    },

    onClickGet() {
        Game.NetWorkController.SendProto('msg.getGuardHouse', {});
    },

    onClickStart() {
        Game.NetWorkController.SendProto('msg.startGuardHouse', {});
    },

    onClickRefresh() {
        Game.Platform.SetTDEventData(Game.Define.TD_EVENT.EventSparAwardRefresh,{gold:0, times:1, charid:Game.UserModel.GetCharid()});
        Game.NetWorkController.SendProto('msg.refreshGuardHouse', {});
    },

    onClickBless() {
        if (Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_ESCORTSPARBLESS) > 0) {
            Game.NetWorkController.SendProto('msg.reqBless', {
                type: Game.Define.BlessType.BlessType_Guard,
                blessid: Game.BlessModel.escortsparIconData.blessid
            });
        } else {
            Game.NetWorkController.SendProto('msg.reqBless', {
                type: Game.Define.BlessType.BlessType_Guard,
                blessid: 0
            });
        }
    }
});
