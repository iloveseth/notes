const Game = require('../../Game');
const MaxNotifyLength = 50;
const NotifyInterval = 200;         //ms

const MaxAnnouncementLength = 50;
const AnnouncementSpeed = 100;

const MaxTvLength = 10;
const NotifyColor = [
    'yellow',
    'orange',
    'red',
    'purple'
]
cc.Class({
    extends: cc.Component,
    ctor: function () {
        //====================  通用弹字提示  ====================
        this.notifyList = [];
        this.preNotifyTime = 0;
        //====================  公告提示  ====================
        this.announcementList = [];
        //====================  上电视了提示  ====================
        this.tvList = [];
        this._force = 0;
        this.notifycache = [];
    },
    properties: {
        tipParentNode: { default: null, type: cc.Node },
        tipWarnPop: { default: null, type: require('../Tip/TipWarningPop') },
        tipPowerChange: { default: null, type: require('../Tip/TipPowerChange') },
        tipLevelup: { default: null, type: require('../Tip/TipLevelup') },
        tipTv: { default: null, type: require('../Tip/TipTv') },
        //公告
        node_announcement: { default: null, type: cc.Node },
        richtext_announcement: { default: null, type: cc.RichText },
        playing_announcement: { default: false },
        playing_tv: { default: false },
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
        this.needCache = true;
    },

    start: function () {
        Game.NetWorkController.AddListener('msg.SendNotify', this, this.onSendNotify);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TIP_TIPS, this, this.onShowTips);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TIP_WARNPOP, this, this.onShowWarnPop);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TIP_POWERCHANGE, this, this.onPowewrChange);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TIP_LEVELUP, this, this.onLevelup);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ITEM_NOTIFY,this,this.onItemNotify);
    },

    onItemNotify(item){
        var infoStr = '';
        var fullStr = '';
        var head = '';
        var body = '';
        var color = 0;
        if(item.num > item.beforenum){
            head = '获得了:';
            color = Game.ItemDefine.ITEMCOLOR.Item_Green;
        }else if(item.num < item.beforenum){
            head = '扣除了:'
            color = Game.ItemDefine.ITEMCOLOR.Item_Red;
        }
        else{
            return;
        }

        let isEquip = Game.EquipModel.IsEquip(item.type);
        if(!isEquip){
            body = `${item.name}*${Math.abs(item.num - item.beforenum)}`
            infoStr = `${head} ${body}`; 
            fullStr = '<outline color=' + Game.ItemModel.GetItemLabelOutlineColorHex(color) +
                    ' width=2><color=' + Game.ItemModel.GetItemLabelColorHex(color) + '>' +
                    infoStr + '</color></outline>';
        }
        else{
            var equipdata = item.equipdata;
            body = `${item.level}级 ${item.name}`;
            infoStr = `${head} ${body}`
            fullStr = '<outline color=' + Game.ItemModel.GetItemLabelOutlineColorHex(equipdata.color) +
                    ' width=2><color=' + Game.ItemModel.GetItemLabelColorHex(equipdata.color) + '>' +
                    infoStr + '</color></outline>';
        }
        this._addNotify(fullStr);
        // if(this.needCache){
        //     this.needCache = false;
        //     this.scheduleOnce(() => {
        //         var length = this.notifycache.length;
        //         for(let idx = 0;idx != length; ++idx){
        //             this._addNotify(this.notifycache[idx]);
        //         }
        //         this.notifycache = [];
        //         this.needCache = true;
        //     },1);
        // }
        // if(this.notifycache.length < MaxNotifyLength){
        //     this.notifycache.push(fullStr);
        // }
        // else {
        //     let index = Game.Tools.GetRandomInt(0, MaxNotifyLength);
        //     this.notifycache[index] = fullStr;
        // }
    },

    update: function (dt) {
        //播放通用弹字提示
        if (this.notifyList.length > 0) {
            let curms = Game.TimeController.GetCurTimeMs();
            if (curms - this.preNotifyTime >= NotifyInterval) {
                this.preNotifyTime = curms;
                let info = this.notifyList.shift();
                this._playNotify(info);
            }
        }
        //播放公告
        if (!this.playing_announcement && this.announcementList.length > 0) {
            let info = this.announcementList.shift();
            this._playAnnouncement(info);
        }
        //tv
        if (!this.playing_tv && this.tvList.length > 0) {
            let info = this.tvList.shift();
            this._playTv(info);
        }
    },
    onDestroy: function () {

    },
    //====================  回调函数  ====================
    //     INFO_TYPE_NO_EFFECT: 21,	        //荣誉公告无特效
    onSendNotify: function (msgid, data) {
        let type = Game._.get(data, 'infotype', 0);
        let color = Game._.get(data, 'color', 0);
        let info = Game._.get(data, 'txt', '');
        switch (type) {
            case Game.Define.NotifyType.INFO_TYPE_NORMAL:
                info = '<outline color=black width=2><color=white>' + info + '</color></outline>';
                this._addNotify(info);
                break;
            case Game.Define.NotifyType.INFO_TYPE_GAME:
                info = '<outline color=black width=2><color=green>' + info + '</color></outline>';
                this.onShowWarnPop(info);
                break;
            case Game.Define.NotifyType.INFO_TYPE_FAIL:
                info = '<outline color=black width=2><color=red>' + info + '</color></outline>';
                this.onShowWarnPop(info);
                break;
            case Game.Define.NotifyType.INFO_TYPE_GM:
                info = '<outline color=#213516 width=2><color=#9EF888>' + info + '</color></outline>';
                this._addAnnouncement(info);
                break;
            case Game.Define.NotifyType.INFO_TYPE_MSG:
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, '消息提示', info, [
                    {
                        name: '确定',
                    }
                ]);
                break;
            case Game.Define.NotifyType.INFO_TYPE_USER:
                info = '<outline color=black width=2><color=green>' + info + '</color></outline>';
                Game.TipPoolController.ShowBarrage(info, this.tipParentNode);
                break;
            case Game.Define.NotifyType.INFO_TYPE_TEMPLE:
                //源码注释掉了
                break;
            case Game.Define.NotifyType.INFO_TYPE_CITAN:
                //源码派发的事件没人监听
                break;
            case Game.Define.NotifyType.INFO_TYPE_BORDERWORLD:
                //源码根本没case这个类型
                break;
            case Game.Define.NotifyType.INFO_TYPE_BORDERPERSON:
                //源码根本没case这个类型
                break;
            case Game.Define.NotifyType.INFO_TYPE_EQUIP_WHITE:
                info = '<outline color=' + Game.ItemModel.GetItemLabelOutlineColorHex(Game.ItemDefine.ITEMCOLOR.Item_White) +
                    ' width=2><color=' + Game.ItemModel.GetItemLabelColorHex(Game.ItemDefine.ITEMCOLOR.Item_White) + '>' +
                    info + '</color></outline>';
                this._addNotify(info);
                break;
            case Game.Define.NotifyType.INFO_TYPE_EQUIP_BLUE:
                info = '<outline color=' + Game.ItemModel.GetItemLabelOutlineColorHex(Game.ItemDefine.ITEMCOLOR.Item_Blue) +
                    ' width=2><color=' + Game.ItemModel.GetItemLabelColorHex(Game.ItemDefine.ITEMCOLOR.Item_Blue) + '>' +
                    info + '</color></outline>';
                this._addNotify(info);
                break;
            case Game.Define.NotifyType.INFO_TYPE_EQUIP_YELLOW:
                info = '<outline color=' + Game.ItemModel.GetItemLabelOutlineColorHex(Game.ItemDefine.ITEMCOLOR.Item_Orange) +
                    ' width=2><color=' + Game.ItemModel.GetItemLabelColorHex(Game.ItemDefine.ITEMCOLOR.Item_Orange) + '>' +
                    info + '</color></outline>';
                this._addNotify(info);
                break;
            case Game.Define.NotifyType.INFO_TYPE_EQUIP_GREEN:
                info = '<outline color=' + Game.ItemModel.GetItemLabelOutlineColorHex(Game.ItemDefine.ITEMCOLOR.Item_Green) +
                    ' width=2><color=' + Game.ItemModel.GetItemLabelColorHex(Game.ItemDefine.ITEMCOLOR.Item_Green) + '>' +
                    info + '</color></outline>';
                this._addNotify(info);
                break;
            case Game.Define.NotifyType.INFO_TYPE_EQUIP_PURPLE:
                info = '<outline color=' + Game.ItemModel.GetItemLabelOutlineColorHex(Game.ItemDefine.ITEMCOLOR.Item_Purple) +
                    ' width=2><color=' + Game.ItemModel.GetItemLabelColorHex(Game.ItemDefine.ITEMCOLOR.Item_Purple) + '>' +
                    info + '</color></outline>';
                this._addNotify(info);
                break;
            case Game.Define.NotifyType.INFO_TYPE_ITEM_ADD:
                info = '<outline color=' + Game.ItemModel.GetItemLabelOutlineColorHex(Game.ItemDefine.ITEMCOLOR.Item_Green) +
                    ' width=2><color=' + Game.ItemModel.GetItemLabelColorHex(Game.ItemDefine.ITEMCOLOR.Item_Green) + '>' +
                    info + '</color></outline>';
                this._addNotify(info);
                break;
            case Game.Define.NotifyType.INFO_TYPE_ITEM_REMOVE:
                info = '<outline color=' + Game.ItemModel.GetItemLabelOutlineColorHex(Game.ItemDefine.ITEMCOLOR.Item_Red) +
                    ' width=2><color=' + Game.ItemModel.GetItemLabelColorHex(Game.ItemDefine.ITEMCOLOR.Item_Red) + '>' +
                    info + '</color></outline>';
                this._addNotify(info);
                break;
            case Game.Define.NotifyType.INFO_TYPE_RUNHORSELAMP_SYS:
                info = '<color=#6f4122>' + info + '</color>';
                this._addTv({
                    info: info,
                    particles: ['Node_RongYao']
                })
                break;
            case Game.Define.NotifyType.INFO_TYPE_SENDFLOWER:
                info = '<color=#6f4122>' + info + '</color>';
                this._addTv({
                    info: info,
                    particles: ['Node_Rain']
                });
                break;
            case Game.Define.NotifyType.INFO_TYPE_15X:
                info = '<color=#6f4122>' + info + '</color>';
                this._addTv({
                    info: info,
                    particles: ['Node_Xing']
                });
                break;
            case Game.Define.NotifyType.INFO_TYPE_KILLER:
                info = '<color=#6f4122>' + info + '</color>';
                this._addTv({
                    info: info,
                    particles: ['Node_RongYao']
                });
                break;
            case Game.Define.NotifyType.INFO_TYPE_NO_EFFECT:
                info = '<color=#6f4122>' + info + '</color>';
                this._addTv({
                    info: info,
                    particles: []
                });
                break;
            case Game.Define.NotifyType.INFO_TYPE_EQUIPOVERTOP: {
                break;
            }
            default: {
                info = '<outline color=black width=2><color=' + NotifyColor[color] + '>' + info + '</color></outline>';
                this._addNotify(info);
                break;
            }
        }
    },
    onShowTips: function (info) {
        this._addNotify('<outline color=black width=2>' + info + '</outline>');
    },
    onShowWarnPop: function (info) {
        this.tipWarnPop.Show(info);
    },
    onPowewrChange: function (data) {
        this._scheduleCallback = function () {
            this._force = 0;
        }.bind(this);
        this._force = this._force + data.newPower - data.oldPower;
        if (this._force == 0) {
            return;
        }
        this.tipPowerChange.Play(data.oldPower, data.newPower, this._force, this._scheduleCallback);
    },
    onLevelup: function (level) {
        this.tipLevelup.Show(Game.UserModel.GetLevelDesc(level));
    },
    onTvPlayEnd: function () {
        this.playing_tv = false;
    },
    //====================  私有函数函数  ====================
    _addNotify: function (info) {
        if (this.notifyList.length < MaxNotifyLength) {
            this.notifyList.push(info);
        } else {
            let index = Game.Tools.GetRandomInt(0, MaxNotifyLength);
            this.notifyList[index] = info;
        }
    },
    _playNotify: function (info) {
        let node = Game.TipPoolController.GetTipNotify();
        this.tipParentNode.addChild(node);
        let notifyNode = node.getComponent('TipNotifyNode');
        notifyNode.Fly(info);
    },
    _addAnnouncement: function (info) {
        if (this.announcementList.length < MaxAnnouncementLength) {
            this.announcementList.push(info);
        } else {
            let index = Game.Tools.GetRandomInt(0, MaxAnnouncementLength);
            this.announcementList[index] = info;
        }
    },
    _playAnnouncement: function (info) {
        let viewSize = cc.view.getVisibleSize();
        this.node_announcement.active = true;
        this.richtext_announcement.string = info;
        this.playing_announcement = true;
        this.richtext_announcement.node.x = viewSize.width / 2;
        let distance = viewSize.width + this.richtext_announcement.node.width;
        this.richtext_announcement.node.stopAllActions();
        this.richtext_announcement.node.runAction(cc.sequence([
            cc.moveBy(distance / AnnouncementSpeed, -distance, 0),
            cc.callFunc(function () {
                this.node_announcement.active = false;
                this.playing_announcement = false;
            }, this)
        ]));
    },
    _addTv: function (data) {
        if (this.tvList.length < MaxTvLength) {
            this.tvList.push(data);
        } else {
            let index = Game.Tools.GetRandomInt(0, MaxTvLength);
            this.tvList[index] = data;
        }
    },
    _playTv: function (data) {
        this.playing_tv = true;
        this.tipTv.Play(data, this.onTvPlayEnd.bind(this))
    },
});
