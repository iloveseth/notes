const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        diggId: { default: 0 },
        captureId: { default: 0 },
        lab_mine_data: { default: null, type: cc.Label_ },
        lab_value_num: { default: null, type: cc.Label_ },
        spr_red_point: { default: null, type: cc.Sprite_ },
        lab_bless_num: { default: null, type: cc.Label_ },
        lab_dig_captureName: { default: null, type: cc.Label_ },
        lab_total_num: { default: null, type: cc.Label_ },
        spr_total_icon: { default: null, type: cc.Sprite_ },
        spr_dig_capture: { default: null, type: cc.Sprite_ },
        spr_dig_capture_icon: { default: null, type: cc.Sprite_ },
        spr_quality: { default: null, type: cc.Sprite_ },
    },

    onLoad(){
        cc.log('DigItemNode onLoad ' + this.diggId);
        
    },

    start(){
        // this.updateView();
    },

    update(dt){
        this.dfTime = this.dfTime + dt;
        if(this.dfTime >= 1)
        {
            this.dfTime = 0
            let leftTime_up = this.finishTime - Game.TimeController.GetCurTime();
            if(this.diggId <=4){
                //本地矿
                if(leftTime_up > 0){
                    this.lab_mine_data.setText(Game.Tools.FormatSeconds(leftTime_up));
                }else if(leftTime_up <= 0 && this.minesStatus.status != 1 ){
                    // this.node.getChildByName('img_value_bg').active = true;
                    // this.lab_mine_data.setText("种植完成");
                    // this.lab_value_num.node.color = cc.color(251, 237, 60);
                    // this.lab_value_num.setText('可收获');
                }
            }else{
                let capture = Game._.get(Game.DigModel.getAllDigStatus(), 'capture', []);
                if(capture == null){return};
                //占领矿
                if(leftTime_up > 0){
                    this.lab_mine_data.setText(Game.Tools.FormatSeconds(leftTime_up));
                }else if(leftTime_up <= 0){
                    // this.lab_mine_data.setText("");
                    // this.lab_value_num.setText("占领完成");
                }
            }
            
        }
    },

    lateUpdate(dt){
    },

    onDestroy(){
    },

    onEnable() {
        this.captureId = this.diggId - 4;
        this.initDigNode();
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.DIG_RESET_VIEW, this, this.refreshView);

        Game.NetWorkController.AddListener('msg.retQuickDigGold', this, this.onRetQuickDigGold);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.DIG_RESET_VIEW, this, this.refreshView);

        Game.NetWorkController.RemoveListener('msg.retQuickDigGold', this, this.onRetQuickDigGold);
    },


    refreshView(){
        cc.log('DigItemNode refreshView ');
        this.initDigNode();
        this.updateView()
    },

    onRetQuickDigGold(msgid, data){
        if(this.diggId >=5 && this.diggId <= 6){return;};
        if(data.mineid == this.minesStatus.mineid){
            cc.log('DigItemNode onRetQuickDigGold mineid == ' + data.mineid);
            let title = '快速种植';
            let desc = "本次快速种植需要消耗"+data.gold+"金币，快速种植后您可以立即收获！";
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
                {
                    name: '确定',
                    handler: function () {
                        Game.NetWorkController.SendProto('msg.reqQuickDig', {mineid:data.mineid});
                    }.bind(this),
                },
                {
                    name: '取消'
                }
            ]);
        };
        
        //弹出通用确定框,是否快速种植
        // local msg = msg_dig_pb.reqQuickDig()
        // msg.mineid = self.mineId
        // SEND_PROTO_MSG(msg)
    },

    initDigNode(){
        this.dfTime  = 0;
        // this.surplusTime = 0;
        //界面刷新初始化-----start-------
        this.node.getChildByName('btn_quick').active = false;
        this.node.getChildByName('img_total_bg').active = false;
        this.lab_total_num.setText('*0000');
        this.node.getChildByName("node_layout").getChildByName('img_mine_bg').active = false;
        this.lab_mine_data.setText("nothing");//倒计时或收获提示
        this.node.getChildByName('img_value_bg').stopAllActions();
        // this.node.getChildByName('img_value_bg').position = cc.p(0, 90);
        this.node.getChildByName('img_value_bg').active = false;
        this.lab_value_num.setText('可收获');//是否可以收获
        this.node.getChildByName("node_layout").getChildByName('img_bless_bg').active = false;
        this.lab_bless_num.setText('+0');//祝福数值
        this.node.getChildByName("node_layout").getChildByName('spr_dig_capture').active = false;//占领被占领图片
        this.lab_dig_captureName.setText("玩家XXXX");//占领者昵称
        this.spr_quality.SetSprite("Image/Map/zhuangyuan/diggColor_blank");//无植物图片
        this.spr_dig_capture_icon.SetSprite("Image/Map/zhuangyuan/zhuangyuan_zhanling");//修改被占领图片
        this.spr_red_point.node.active = false;
        //界面刷新初始化-----end--------

    },

    updateView(){
        this.finishTime = 0;
        //庄园时间hoecost_data
        var hoe_data = Game.ConfigController.GetConfigById('hoecost_data',this.diggId);
        this.allTime = Game._.get(hoe_data,"needtime",0);
        //颜色数据
        var digcolor_data = Game.ConfigController.GetConfig('digcolor_data');
        //矿点总数据
        this.digInfo = Game.DigModel.getAllDigStatus();
        //本人4块矿的数据
        this.minesStatus = null;

        //当前矿点数据1 2 3 4
        for (let i = 0; i < 4; i++){
            let minesStatus = Game.DigModel.getAllDigStatus().minesStatus[i];
            let mineid = minesStatus.mineid;
            if(mineid == this.diggId){
                this.minesStatus = minesStatus;
                this.refreshDigg();
            }
        };
        
        //占领区数据5 6
        let capture = Game._.get(Game.DigModel.getAllDigStatus(), 'capture', []);
        if (capture.length > 0) {
            //有占领数据
            if(capture.length == 1){
                if(capture[0].index == this.captureId){
                    this.refreshCapture(this.captureId,capture[0]);
                }else{
                    this.refreshCapture(this.captureId,null);
                }
            }else{
                for(let i = 0; i < capture.length; i++){
                    let index = capture[i].index
                    if(index == this.captureId)
                    {
                        this.refreshCapture(index,capture[i]);
                    };
                };
            }
        } else {
            //无占领数据
            this.refreshCapture(1,null);
            this.refreshCapture(2,null);
        };

    },

    refreshDigg(){
        if(this.diggId >=5 && this.diggId <= 6){return;};
        //显示矿点总量
        if(this.minesStatus.minetype == 1 && this.minesStatus.total_money > 0){
            //minetype == 1银币
            this.node.getChildByName('img_total_bg').active = true;
            this.spr_total_icon.SetSprite("Image/UI/Common/image_Silvercoin");
            var numStr = Game.Tools.UnitConvert(this.minesStatus.total_money);
            this.lab_total_num.setText('*' + numStr);
        }else if(this.minesStatus.minetype == 2 && this.minesStatus.total_itemnum > 0){
            //minetype == 2物品
            this.node.getChildByName('img_total_bg').active = true;
            let objData = Game.ItemModel.GetItemConfig(this.minesStatus.total_itemid);
            let picStr = objData.pic;
            this.spr_total_icon.SetSprite(picStr);//变更收获物品图标
            this.lab_total_num.setText(this.minesStatus.total_itemnum);
        }else if(this.minesStatus.minetype == 3 && this.minesStatus.total_equip > 0){
            //minetype == 3装备
            this.node.getChildByName('img_total_bg').active = true;
            this.spr_total_icon.SetSprite("Image/UI/MiniLevelView/wabao_zhuangbei");//变更收获装备图标
            this.lab_total_num.setText(this.minesStatus.total_equip);
        };

        //正在挖并且挖装备可以快速收获,5 6不显示快速探索,且只有装备才显示快速探索
        if (this.minesStatus.minetype == 3 && this.minesStatus.status == 2 && this.minesStatus.rob_status !== Game.Define.DIG_ROB_STATE.DIG_ROB_BE_CAPTURE){
            this.node.getChildByName('btn_quick').active = true;
        };

        //显示矿点占领者
        if(this.minesStatus.rob_status == Game.Define.DIG_ROB_STATE.DIG_ROB_BE_CAPTURE){
            this.node.getChildByName("node_layout").getChildByName('spr_dig_capture').active = true;
            this.lab_dig_captureName.string = this.minesStatus.capture_name;
        };

        
        // if(this.minesStatus.rob_status == Game.Define.DIG_ROB_STATE.DIG_ROB_BE_CAPTURE ){
        //     this.node.getChildByName("node_layout").getChildByName('spr_dig_capture').true;
        //     this.lab_dig_captureName.string = this.minesStatus.capture_name;
        // };

        //判断地图颜色更换图片
        let picStr_2 = "Image/Map/zhuangyuan/diggColor_" + this.minesStatus.color;
        this.spr_quality.SetSprite(picStr_2);

        //右边图片翻转
        if (this.diggId == 2 || this.diggId == 4 ||this.diggId == 6 ) {
            this.spr_quality.node.setScale(-1,1);
        };


        if(this.minesStatus.status == 1)//未挖
        {
            this.node.getChildByName('img_value_bg').active = true;
            var moveBy_1 = cc.moveBy(0.5, cc.p(0, 10));
            var moveBy_2 = cc.moveBy(0.3, cc.p(0, -10));
            var seqAct = cc.sequence([moveBy_1,moveBy_2]);
            // this.node.getChildByName('img_value_bg').runAction(seqAct.repeatForever());

            this.lab_value_num.node.color = cc.color(83, 255, 60);
            this.lab_value_num.setText('可种植');
            this.spr_red_point.node.active = true;
        }else if(this.minesStatus.status == 2)//正在挖
        {
            this.node.getChildByName("node_layout").getChildByName('img_mine_bg').active = true;
            this.node.getChildByName('img_value_bg').active = true;
            this.lab_mine_data.setText(Game.Tools.FormatSeconds(this.minesStatus.timeremain));//倒计时
            // this.lab_mine_data.setText("");
            this.finishTime = Game.TimeController.GetCurTime() + this.minesStatus.timeremain;
            // this.surplusTime = this.minesStatus.timeremain;

            if(this.minesStatus.rob_status == Game.Define.DIG_ROB_STATE.DIG_ROB_BE_CAPTURE){
                this.node.getChildByName('img_value_bg').active = true;
                this.lab_value_num.node.color = cc.color(255, 0, 0);
                this.lab_value_num.setText('被占领');

                // var moveBy_1 = cc.moveBy(0.5, cc.p(0, 10));
                // var moveBy_2 = cc.moveBy(0.3, cc.p(0, -10));
                // var seqAct = cc.sequence([moveBy_1,moveBy_2]);
                // this.node.getChildByName('img_value_bg').runAction(seqAct.repeatForever());
            }else{
                this.lab_value_num.node.color = cc.color(255, 0, 255);
                this.lab_value_num.setText('种植中');
                if (this.diggId == 3 || this.diggId == 4 ) {
                    this.node.getChildByName("node_layout").getChildByName('img_bless_bg').active = true;
                    let blessNum = this.minesStatus.reward;
                    this.lab_bless_num.setText("+"+blessNum);//祝福数值
                    if(this.minesStatus.isinvitebless){
                        this.lab_value_num.node.color = cc.color(43, 233, 255);
                        this.lab_value_num.setText('可祝福');
                    }else{
                        this.lab_value_num.node.color = cc.color(255, 0, 255);
                        this.lab_value_num.setText('种植中');
                    };
                }
                
            };
        }
        else if(this.minesStatus.status == 3)//已挖完未领取
        {
            this.node.getChildByName('img_value_bg').active = true;
            var moveBy_1 = cc.moveBy(0.5, cc.p(0, 10));
            var moveBy_2 = cc.moveBy(0.3, cc.p(0, -10));
            var seqAct = cc.sequence([moveBy_1,moveBy_2]);
            // this.node.getChildByName('img_value_bg').runAction(seqAct.repeatForever());

            this.lab_value_num.node.color = cc.color(251, 237, 60);
            this.lab_value_num.setText('可收获');
            
            this.node.getChildByName("node_layout").getChildByName('img_mine_bg').active = true;
            this.lab_mine_data.setText("种植完成");//种植完成

            this.spr_red_point.node.active = true;

            if (this.diggId == 3 || this.diggId == 4 ) {
                this.node.getChildByName("node_layout").getChildByName('img_bless_bg').active = true;
                let blessNum = this.minesStatus.reward;
                this.lab_bless_num.setText("+"+blessNum);//祝福数值
            };

            // self.arrayTimeSchedule[mineId] = 0  关闭计时器
        }

        

        // this.node.getChildByName('btn_map').on(cc.Node.EventType.TOUCH_END, function (event) {
        //     cc.log("btn_map TOUCH_END " + this.diggId);
        //     this.goMap();
        // }.bind(this));

        // this.node.getChildByName('btn_quick').on(cc.Node.EventType.TOUCH_END, function (event) {
        //     cc.log("refreshDigg btn_quick TOUCH_END " + this.diggId);
        //     this.btnQuickClick();
        // }.bind(this));

    },

    refreshCapture(id,info){
        if(this.captureId != id){return;};

        if(this.diggId >=1 && this.diggId <= 4){return;};

        this.node.getChildByName('btn_quick').active = false;

        if(info != null)//占领区有数据
        {
            this.node.getChildByName('img_total_bg').active = true;//物品图标及数量bg
            this.node.getChildByName('img_value_bg').active = true;//占领状态bg
            var moveBy_1 = cc.moveBy(0.5, cc.p(0, 10));
            var moveBy_2 = cc.moveBy(0.3, cc.p(0, -10));
            var seqAct = cc.sequence([moveBy_1,moveBy_2]);
            // this.node.getChildByName('img_value_bg').runAction(seqAct.repeatForever());

            this.node.getChildByName("node_layout").getChildByName('spr_dig_capture').active = true;//占领被占领图片
            this.spr_dig_capture_icon.SetSprite("Image/Map/zhuangyuan/zhuangyuan_beizhan");//修改被占领图片
            this.lab_dig_captureName.setText(info.name);//占领者昵称
            if(info.colddown == 0)
            {
                this.node.getChildByName("node_layout").getChildByName('img_mine_bg').active = false;//时间或已结束bg
                this.lab_mine_data.setText("");
                this.lab_value_num.setText("占领完成");
            }else
            {
                this.node.getChildByName("node_layout").getChildByName('img_mine_bg').active = true;
                this.lab_mine_data.setText(Game.Tools.FormatSeconds(info.colddown));//倒计时
                // this.lab_mine_data.setText("");
                this.lab_value_num.setText("占领中");
                // this.surplusTime = info.colddown;
                this.finishTime = Game.TimeController.GetCurTime() + info.colddown;
            }

            //被占的类型和数量
            if(info.minetype == 1)//银币
            {
                this.spr_total_icon.SetSprite("Image/UI/Common/image_Silvercoin");
            }
            else if(info.minetype == 2)//物品
            {
                let objData = Game.ItemModel.GetItemConfig(info.itemid);
                let picStr = objData.pic;
                this.spr_total_icon.SetSprite(picStr);//变更收获物品图标
            }
            else if(info.minetype == 3)//装备
            {
                this.spr_total_icon.SetSprite("Image/UI/MiniLevelView/wabao_zhuangbei");
            };
            this.lab_total_num.string = '*' + info.num;
            
            //被战矿品质
            let picStr = "Image/Map/zhuangyuan/diggColor_"+info.color;
            this.spr_quality.SetSprite(picStr);
            //右边图片翻转
            if (this.diggId == 2 || this.diggId == 4 ||this.diggId == 6 ) {
                this.spr_quality.node.setScale(-1,1);
            };
        }
        else
        {
            //占领区空的
            var moveBy_1 = cc.moveBy(0.5, cc.p(0, 10));
            var moveBy_2 = cc.moveBy(0.3, cc.p(0, -10));
            var seqAct = cc.sequence([moveBy_1,moveBy_2]);
            this.node.getChildByName('img_value_bg').active = true;
            // this.node.getChildByName('img_value_bg').runAction(seqAct.repeatForever());
            this.lab_value_num.string = "点击占领";

            // let captureIndex = this.diggId - 4;
            // let robLv = Game.ConfigController.GetConfigById('roblevel_data',captureIndex);
            // let topMapId = Game.UserModel.GetTopMapid()
            let isOpen = Game.GuideController.IsFunctionOpen(36);
            if(!isOpen){
                //开图等级不足
                this.lab_value_num.string = "未开启";
            }

            this.spr_quality.SetSprite("Image/Map/zhuangyuan/diggColor_blank");//无植物图片
            //右边图片翻转
            if (this.diggId == 2 || this.diggId == 4 ||this.diggId == 6 ) {
                this.spr_quality.node.setScale(-1,1);
            };
        }

        // this.node.getChildByName('btn_map').on(cc.Node.EventType.TOUCH_END, function (event) {
        //     cc.log("refreshCapture btn_map TOUCH_END " + this.diggId);
        //     this.goCapture();
        // }.bind(this));
    },

    btnQuickClick(){
        //请求加速探索
        let mine_id = this.minesStatus.mineid;
        Game.NetWorkController.SendProto('msg.reqQuickDigGold', {mineid:mine_id});
    },

    goMap(){
        cc.log("goMap digid == " + this.diggId);
        // 点击自己的4块矿
        if(this.minesStatus.status == 1) //未挖,打开挖宝界面
        {
            let data = {};
            data.mineid = this.minesStatus.mineid;
            data.color = this.minesStatus.color;
            this.openView(Game.UIName.UI_DIG_SETTING_NODE,data);
        }else if(this.minesStatus.status == 2)//正在挖
        {
            if(this.minesStatus.rob_status == Game.Define.DIG_ROB_STATE.DIG_ROB_BE_CAPTURE)//已经被占领了
            {
                //请求单个矿点信息
                Game.NetWorkController.SendProto('msg.ReqOneMineInfo', {mineid:this.minesStatus.mineid});
            }
            else
            {
                //只有3 和4 可以祝福
                if (this.diggId == 3) {
                    if(this.minesStatus.isinvitebless || Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_DIGLESS_3) > 0){

                        if(Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_DIGLESS_3) > 0){
                            Game.NetWorkController.SendProto('msg.reqBless', {
                                type: this.minesStatus.mineid,
                                blessid: Game.BlessModel.DigIconData_3.blessid
                            });
                        }else{
                            Game.NetWorkController.SendProto('msg.reqBless', {
                                type: this.minesStatus.mineid,
                                blessid: 0
                            });
                        }
                    };
                
                };

                if (this.diggId == 4) {
                    if(this.minesStatus.isinvitebless || Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_DIGLESS_4) > 0){

                        if(Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_DIGLESS_4) > 0){
                            Game.NetWorkController.SendProto('msg.reqBless', {
                                type: this.minesStatus.mineid,
                                blessid: Game.BlessModel.DigIconData_4.blessid
                            });
                        }else{
                            Game.NetWorkController.SendProto('msg.reqBless', {
                                type: this.minesStatus.mineid,
                                blessid: 0
                            });
                        }
                    };
                
                };
            }
        }
        else if(this.minesStatus.status == 3)//挖完未领取
        {
            //请求收获挖宝完成的矿
            Game.NetWorkController.SendProto('msg.reqGetDigReward', {mineid:this.minesStatus.mineid});
        }
    },

    goCapture(){
        cc.log("goCapture");
        if(this.digInfo == null){return};
        //点击可占领的2块矿 5 6 数据index 1 2
        // if(this.digInfo != null)
        // {
        //     Game.DigModel.setCaptrueMineId(this.captureId)
        //     let captureIndex = this.diggId - 4;
        //     let robLv = Game.ConfigController.GetConfigById('roblevel_data',captureIndex);
        //     let topMapId = Game.UserModel.GetTopMapid()

        //     if(robLv.level > topMapId){
        //         //开图等级不足
        //         let mapData = Game.ConfigController.GetConfigById('newmap_data',robLv.level);
        //         let tipStr = "进入"+mapData.disc+"后开放此占领区";
        //         Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, tipStr);
        //     }else{
                

        //     };
        // };
        Game.DigModel.setCaptrueMineId(this.captureId)
        let captureIndex = this.diggId - 4;
        let goSelect = true;
        let charId = 0;
        let mineId = 0;
        let capture = Game._.get(this.digInfo, 'capture', []);
        for(let i = 0; i < capture.length; i++){
            if(capture[i].index == captureIndex){
                //已经占领
                goSelect = false;
                charId = capture[i].charid;
                mineId = capture[i].mineid;
            }
        }

        if(goSelect){
            //未占领,打开掠夺列表UIDiggSelect
            this.openView(Game.UIName.UI_DIG_SELECT_NODE);
        }else{
            let leftTime = this.finishTime - Game.TimeController.GetCurTime();

            if(leftTime<=0){
                //打开占领成功界面
                let msg = {};
                msg.charid = charId;
                msg.mineid = mineId;
                Game.NetWorkController.SendProto('msg.GetDigCaptureAward', msg);
            }else{
                //请求占领区矿点信息
                let msg = {};
                msg.charid = charId;
                msg.mineid = mineId;
                Game.NetWorkController.SendProto('msg.ReqCaptureMineInfo', msg);
            }

        };
    },

});
