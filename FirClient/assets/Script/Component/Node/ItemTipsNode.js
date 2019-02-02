// ItemTipsNode.js
const Game = require('../../Game');
var ItemTipsNodeNums = ['一','二','三','四','五','六','七','八','九','十'];
cc.Class({
    extends: cc.GameComponent,

    properties: {
    	Label_title: { default: null, type: cc.Label_ },
    	Button_open: { default: null, type: cc.Button_ },
    	Button_token: { default: null, type: cc.Button_ },
    	Button_open_all: { default: null, type: cc.Button_ },
    	Label_open1: { default: null, type: cc.Label_ },
    	Label_open2: { default: null, type: cc.Label_ },
    	Label_open3: { default: null, type: cc.Label_ },
    	Label_item_detail: { default: null, type: cc.Label_ },
    	Label_item_from: { default: null, type: cc.Label_ },
    	Label_item_name: { default: null, type: cc.Label_ },
        node_item: {default:null, type:cc.Node},
        Buttons_Menu:{default: [], type: cc.Button_},
        Labels_Menu:{default: [], type: cc.Label_},

    },

    onLoad() {
        this.levellimit_data = Game.ConfigController.GetConfig('levellimit_data');
    },

    onEnable() {
        this.objectInfo = null;
        this._thisId = 0;
        this._singleItemNode = this.node_item.getComponent('SingleItemNode');
        this.updateView(this._data);
        this.initNotification();
    },

    setDefaultBtn(idx){

    },

    onDisable() {
        this.removeNotification();
    },

    //最多三个按钮  从左到右分别为open_all    token    open
    createBtns(Btns,highlight = 0){

    },

    handleButton(){

    },

    initNotification() {
        Game.NetWorkController.AddListener('msg.insufficientNotice', this, this.onInsufficientNotice);
        Game.NetWorkController.AddListener('msg.RefreshObject', this, this.onRefreshObject);
        Game.NetWorkController.AddListener('msg.RemoveObject', this, this.onRemoveObject);
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('msg.insufficientNotice', this, this.onInsufficientNotice);
        Game.NetWorkController.RemoveListener('msg.RefreshObject', this, this.onRefreshObject);
        Game.NetWorkController.RemoveListener('msg.RemoveObject', this, this.onRemoveObject);
    },

    onInsufficientNotice(msg,data){
        // this.onClose();
        // this.openView(Game.UIName.UI_NOTENOUGHNODE, data);
    },

    onRefreshObject(msg,data){
        data.objs.forEach(e => {
            if(e.baseid == this.objectInfo.baseid){
                this.objectInfo.num = e.num;
                this.updateItemNum(e.num);
            }
        });
    },

    updateItemNum(num){
        if ( this._singleItemNode ){
            this._singleItemNode.updateItemNum(num);
        }
    },

    onRemoveObject(msg,data){
        data.ids.forEach(e => {
            if(e == this.objectInfo.thisid){
                this.onClose();
            }
        });
    },

    updateView(t_Object) {        
        this._thisId = t_Object.thisid;
        this.objectInfo = t_Object;
        this.itemConfig = Game.ItemModel.GetItemConfig(this.objectInfo.baseid);
         // this.itemConfig = Game.ItemModel.GetItemConfig(this.objectInfo.thisid);
        if (this.objectInfo && this.itemConfig) {
           this.Label_item_detail.setText(this.itemConfig.info);
           this.Label_item_from.setText(this.itemConfig.laiyuan && "来源："+this.itemConfig.laiyuan || "");
           this.Label_item_name.setText(this.itemConfig.name);
           let isEquip = Game.EquipModel.IsEquip(this.objectInfo.type); 
           this.Label_item_name.node.color = Game.ItemModel.GetItemLabelColor(isEquip && this.objectInfo.equipdata.color || this.objectInfo.color);
           this.setItemInfo(this.objectInfo);
           this.Button_open.node.active = false;
           this.Button_token.node.active = false;
           this.Button_open_all.node.active = false;
           // open_all    token    open
           cc.log(this.itemConfig.kind);
           switch (this.itemConfig.kind) {
               
           	 	case Game.ItemDefine.ITEMTYPE.ItemType_Normal:
                    // 普通道具
                    
                    if(this.itemConfig.id == 349 || this.itemConfig.id == 350){
                        this.Button_token.node.active = true;
                        this.Label_open2.string = '使 用';
                    }
                    else{
                        this.Button_token.node.active = true;
                        this.Label_open2.string = "确 定";
                    }
                    break;
                // case Game.ItemDefine.ITEMTYPE.ItemType_Stone:
                // 	// 宝石道具
                // 	this.Button_token.node.active = true;
                // 	this.Label_open2.string = "升 级";
                //     break;
                case Game.ItemDefine.ITEMTYPE.ItemType_Hole:
                	// 打孔道具
                    this.Button_token.node.active = true;
                    if(this.objectInfo.baseid == 70){
                        this.Label_open2.string = "确 定";
                    }
                    else{
                        this.Label_open2.string = "兑 换";
                    }
                	
                    break;
                case Game.ItemDefine.ITEMTYPE.ItemType_Gift:
                	// 礼包道具
                	this.Button_open.node.active = true;
                	this.Button_open_all.node.active = true;
                	this.Label_open1.string = "打 开";
                	this.Label_open3.string = "打开全部";
                    break;
                case Game.ItemDefine.ITEMTYPE.ItemType_Ticket:
                	//召唤券
                	this.Button_token.node.active = true;
                	this.Label_open2.string = "召 唤";
                    break;
                case Game.ItemDefine.ITEMTYPE.ItemType_StarStone:
                	// 升星石道具
                	// this.Button_open.node.active = true;
                	// this.Button_open_all.node.active = true;
                	// this.Label_open1.string = "升 星";
                    // this.Label_open3.string = "分 解";
                    this.Button_token.node.active = true;
                    this.Label_open2.string = '分解';
                    break;
                case Game.ItemDefine.ITEMTYPE.ItemType_Flower:
                	// 鲜花
                	this.Button_open.node.active = true;
                	this.Button_token.node.active = true;
                	this.Button_open_all.node.active = true;
                	this.Label_open1.string = "赠送九朵";
                	this.Label_open2.string = "出售一朵";

                	// this.Label_open3.string = "出售十朵";
                    var num = Math.min(this.objectInfo.num,10);
                    this.Label_open3.string = cc.js.formatStr("出售%d朵",num);
                    break;
                case Game.ItemDefine.ITEMTYPE.ItemType_QiYue:
                case Game.ItemDefine.ITEMTYPE.ItemType_GodData:
                case Game.ItemDefine.ITEMTYPE.ItemType_Miansiling:
                case Game.ItemDefine.ITEMTYPE.ItemType_Huwei:
                case Game.ItemDefine.ITEMTYPE.ItemType_ProtectGuard:
                case Game.ItemDefine.ITEMTYPE.ItemType_RedEnvelope:
                case Game.ItemDefine.ITEMTYPE.ItemType_Diamond:
                    this.Button_token.node.active = true;
                    this.Label_open2.string = "使用";
                    if (this.itemConfig.id >= 284 && this.itemConfig.id <= 286){
                        this.Button_open.node.active = true;
                        this.Button_token.node.active = false;
                        this.Button_open_all.node.active = true;
                        this.Label_open1.setText("兑换");
                        this.Label_open3.setText("使用");
                    }
                    break;
                case Game.ItemDefine.ITEMTYPE.ItemType_GiftBag:
                case Game.ItemDefine.ITEMTYPE.ItemType_JokeBox:
                    this.Button_open.node.active = true;
                    this.Button_open_all.node.active = true;
                    var itemNum = this.objectInfo.num;
                    var limitNum= 10;
                    var btnStr = itemNum < limitNum ? '打开全部' : `打开${limitNum}个`;
                    this.Label_open3.string = btnStr;
                    this.Label_open1.string = '打开';
                    break;
                case Game.ItemDefine.ITEMTYPE.ItemType_PetTicket:
                    this.Button_token.node.active = true;
                    this.Label_open2.string = '获取精灵';
                    break;
                default:
                	this.Button_token.node.active = true;
                	this.Label_open2.string = "确 定";
                    break;
            }
        }
        else
        {
        	if (this._singleItemNode != null) {
                this._singleItemNode.destroy();
                this._singleItemNode = null;
            }
        }
    },

    setItemInfo(itemInfo){
        if ( this._singleItemNode ){
            this._singleItemNode.updateView(itemInfo);
        }
    },

    onTouchOpen(){
    	switch (this.itemConfig.kind) {
                case Game.ItemDefine.ITEMTYPE.ItemType_Gift:
                	// 礼包道具
                	cc.log("打开道具礼包");
                    break;
                case Game.ItemDefine.ITEMTYPE.ItemType_StarStone:
                	// 升星石道具
                    cc.log("升星升星石道具");
                    this.openView(Game.UIName.UI_UPGRADESTARNODE, this.objectInfo);
                    break;
                case Game.ItemDefine.ITEMTYPE.ItemType_Flower:
                	// 鲜花
                	cc.log("赠送九朵");
                    break;
                case Game.ItemDefine.ITEMTYPE.ItemType_GiftBag:
                case Game.ItemDefine.ITEMTYPE.ItemType_JokeBox:
                    this.useItemBag(1);
                    break;
                default:
                    break;
            }
    },


    useItemBag(num){
        var msg = {
            objthisid : this.objectInfo.thisid,
            time : num,
        }
        Game.NetWorkController.SendProto('msg.useItemBag',msg)
    },

    onTouchToken(){
    	switch (this.itemConfig.kind) {
            case Game.ItemDefine.ITEMTYPE.ItemType_Normal:
                // 普通道具
                cc.log("确 定");
                if(this.itemConfig.id == 349 || this.itemConfig.id == 350){
                    this.openView(Game.UIName.UI_EQUIPADVANCEDVIEW);
                }
                else{
                    
                }
                this.onClose();
                break;  
            // case Game.ItemDefine.ITEMTYPE.ItemType_Stone:
            // 	// 宝石道具
            // 	cc.log("升 级");
            //     this.openView(Game.UIName.UI_GEM_UPGRADE_VIEW, this.objectInfo);
            //     break;
            case Game.ItemDefine.ITEMTYPE.ItemType_Hole:
                // 打孔道具
                cc.log("兑 换");
                //兑换功能开发
                if(this.objectInfo.baseid == 70){
                    this.onClose();
                }
                else{
                    this.openView(Game.UIName.UI_STONEXCHANGENODE, this.objectInfo);
                }
                
                break;
            case Game.ItemDefine.ITEMTYPE.ItemType_Ticket:
                //召唤券
                cc.log("召 唤");
                break;
            case Game.ItemDefine.ITEMTYPE.ItemType_Flower:
                if(this.objectInfo){
                    var msg = {};
                    msg.baseid = 2;
                    msg.num = 1;
                    Game.NetWorkController.SendProto('msg.reqSellItem',msg);
                    this.onClose();
                }
                break;
            case Game.ItemDefine.ITEMTYPE.ItemType_QiYue:
            case Game.ItemDefine.ITEMTYPE.ItemType_GodData:
            case Game.ItemDefine.ITEMTYPE.ItemType_Miansiling:
            case Game.ItemDefine.ITEMTYPE.ItemType_Huwei:
            case Game.ItemDefine.ITEMTYPE.ItemType_ProtectGuard:
            case Game.ItemDefine.ITEMTYPE.ItemType_RedEnvelope:
            case Game.ItemDefine.ITEMTYPE.ItemType_Diamond:
                if(this.objectInfo){
                    var msg = {};
                    msg.objthisid = this.objectInfo.baseid;
                    msg.time = 1;
                    Game.NetWorkController.SendProto('msg.useItemBag',msg);
                    this.onClose();
                }
                break;
            case Game.ItemDefine.ITEMTYPE.ItemType_PetTicket:
                
                if (Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_FIRSTFAIRY)){
                    if(this.itemConfig.id == 469){
                        Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_item_one });
                    }else if(this.itemConfig.id == 470){
                        Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_item_two });
                    }else if(this.itemConfig.id == 471){
                        Game.NetWorkController.SendProto('msg.LuckDrawReq', { type: Game.Define.LuckDrawType.LuckDraw_item_three });
                    }else{
                        this.openView(Game.UIName.UI_SHOPVIEW, Game.Define.SHOPTAB.Tab_Pet);
                    }
                    this.onClose();
                }
                else{
                    var limitdata = Game._.find(this.levellimit_data, e => {return e.id == 14});
                    this.showTips(limitdata.content);
                }
                break;
            
            case Game.ItemDefine.ITEMTYPE.ItemType_StarStone:
            // 升星石道具
                cc.log("分 解");//、
                var title = '升星石分解';
                var starCfg = null;
                Game.ConfigController.GetConfig('leveldown_data').forEach(e => {
                    var level = this.objectInfo.baseid - 249
                    if(e.level == level){
                        starCfg = e;
                    }
                });
                cc.log(starCfg);
                var desc = `分解${this.itemConfig.name}将会得到${starCfg.wuxianum}个晶石，是否继续？`;
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
                    {
                        name: '确定',
                        handler: function () {
                            var msg = {
                                stonethisid: this.objectInfo.thisid,
                            }
                            Game.NetWorkController.SendProto('msg.reqDeComposeStarStone',msg);
                        }.bind(this),
                    },
                    {
                        name: '取消'
                    }
                ]);
                break;
            default:
                cc.log("确 定");
                this.onClose();
                break;
        }
    },
    onTouchOpenAll(){
    	switch (this.itemConfig.kind) {
                case Game.ItemDefine.ITEMTYPE.ItemType_Gift:
                	// 礼包道具
                	cc.log("打开全部");
                    break;
                // case Game.ItemDefine.ITEMTYPE.ItemType_StarStone:
                // 	// 升星石道具
                //     cc.log("分 解");//、
                //     var title = '升星石分解';
                //     var starCfg = null;
                //     cc.log(this.objectInfo)
                //     Game.ConfigController.GetConfig('leveldown_data').forEach(e => {
                //         var level = this.objectInfo.baseid - 249
                //         if(e.level == level){
                //             starCfg = e;
                //         }
                //     });
                //     cc.log(starCfg);
                //     var desc = `分解${this.itemConfig.name}将会得到${starCfg.wuxianum}个晶石，是否继续？`;
                //     Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
                //         {
                //             name: '确定',
                //             handler: function () {
                //                 var msg = {
                //                     stonethisid: this.objectInfo.thisid,
                //                 }
                //                 Game.NetWorkController.SendProto('msg.reqDeComposeStarStone',msg);
                //             }.bind(this),
                //         },
                //         {
                //             name: '取消'
                //         }
                //     ]);
                //     break;
                case Game.ItemDefine.ITEMTYPE.ItemType_Flower:
                	if(this.objectInfo){
                        var msg = {};
                        msg.baseid = 2;
                        msg.num = Math.min(this.objectInfo.num,10);
                        Game.NetWorkController.SendProto('msg.reqSellItem',msg);
                        this.onClose();
                    }
                    break;
                case Game.ItemDefine.ITEMTYPE.ItemType_QiYue:
                case Game.ItemDefine.ITEMTYPE.ItemType_GodData:
                case Game.ItemDefine.ITEMTYPE.ItemType_Miansiling:
                case Game.ItemDefine.ITEMTYPE.ItemType_Huwei:
                case Game.ItemDefine.ITEMTYPE.ItemType_ProtectGuard:
                case Game.ItemDefine.ITEMTYPE.ItemType_RedEnvelope:
                case Game.ItemDefine.ITEMTYPE.ItemType_Diamond:
                    if(this.objectInfo){
                        var msg = {};
                        msg.objthisid = this.objectInfo.baseid;
                        msg.time = 1;
                        Game.NetWorkController.SendProto('msg.useItemBag',msg);
                        this.onClose();
                    }
                    break;
                case Game.ItemDefine.ITEMTYPE.ItemType_GiftBag:
                case Game.ItemDefine.ITEMTYPE.ItemType_JokeBox:
                    this.useItemBag(10);
                    break;
                default:
                    break;
            }
    },

    onExchange(){
        
    }

});