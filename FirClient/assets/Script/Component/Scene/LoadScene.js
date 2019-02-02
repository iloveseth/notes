let Game = require('../../Game');
require('../Node/SelectServerNode');

cc.Class({
    extends: cc.Component,

    properties: {
        targetCanvas: { default: null, type: cc.Canvas },
        skeSpine: { default: null, type: sp.Skeleton },
        versionInfoLabel: { default: null, type: cc.Label_ },
        bgNode: { default: null, type: cc.Sprite_ },
        logoNativeNode: { default: null, type: cc.Sprite_ },
        logoWebNode: { default: null, type: cc.Sprite_ }
    },

    onLoad: function () {
        //RGBA4444
        Game.NotificationController.On(Game.Define.EVENT_KEY.HOTUPDATE_CHECK, this, this.onHotUpdateChecked);
        Game.NotificationController.On(Game.Define.EVENT_KEY.HOTUPDATE_UPDATEFAILED, this, this.onHotUpdateFailed);
        Game.Tools.AutoFit(this.targetCanvas);
        this.versionInfoLabel.string = '';
        if (this.skeSpine != null) {
            this.skeSpine.setCompleteListener(this.onAnimaEnd.bind(this));
        }
        if(this.logoWebNode)
        {
            this.logoWebNode.node.active = false;
        }
        if(this.logoNativeNode)
        {
            this.logoNativeNode.node.active = false;
        }
        if (cc.sys.isNative) {
            if(this.logoNativeNode)
            {
                this.logoNativeNode.node.active = true;
            }
            //检测是否有更新
            cc.loader.loadRes('Prefab/Load/HotUpdateNode', function (err, prefab) {
                if (err) {
                    cc.log('[热更节点加载失败]');
                } else {
                    let node = cc.instantiate(prefab);
                    this.node_hotupdate = node.getComponent('HotUpdateNode');
                    this.node_hotupdate.init();
                    this.node.addChild(node);
                    this.node_hotupdate.checkUpdate();
                }
            }.bind(this));
        }
        else
        {
            if(this.logoWebNode)
            {
                this.logoWebNode.node.active = true;
            }
            this.openNoticeView();
        }
        let viewSize = cc.view.getVisibleSize();
        if (viewSize.height - 300 > this.bgNode.node.height) {
            //要拉升了
            this.bgNode.node.scale = (viewSize.height - 300) / this.bgNode.node.height;
        }
        cc.eventManager.resumeTarget(cc.director.getScene(), true);
        this.setChannelImg();
    },
    setChannelImg:function() {
        let logoUrl = '';
        let bgUrl = '';
        switch(Game.ServerUtil.channel)
        {
            case Game.Define.Channel_Type.DianYou:
              logoUrl = 'Image/bg/img_logo2';
               bgUrl = 'Image/bg/denglu_img_02';
             break;
            case Game.Define.Channel_Type.DianYou_Ios_GaungMing:
              logoUrl = 'Image/bg/img_logo3';
              bgUrl = 'Image/bg/denglu_img_03';
             break;
             case Game.Define.Channel_Type.Common_Android:
                logoUrl = 'Image/bg/img_logo2';
                bgUrl = 'Image/bg/denglu_img_02';
              break;
             default:
                logoUrl = 'Image/bg/img_logo2';
                bgUrl = 'Image/bg/denglu_img_02';
              break;
        }
        if(logoUrl)
        {
            this.logoNativeNode.SetSprite(logoUrl);
        }
        if(bgUrl)
        {
            this.bgNode.SetSprite(bgUrl);
        }
    },
    start: function () {
        Game.GlobalModel.loadSceneName = this.node.parent.name;
    },
    onDestroy: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.HOTUPDATE_CHECK, this, this.onHotUpdateChecked);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.HOTUPDATE_UPDATEFAILED, this, this.onHotUpdateFailed);
    },
    onEnable: function(){
        Game.GlobalModel.isFirstGame = false;
    },

    //====================  回调函数  ====================
    onAnimaEnd: function (track) {
        let animaname = Game._.get(track, 'animation.name', '');
        if (animaname == 'duizhuang') {
            this.skeSpine.setAnimation(0, 'stand', true);
        }
    },
    onHotUpdateChecked: function (isNeed, msg) {
        cc.log("热更新检测结果：", msg);
        this.versionInfoLabel.string = "V" + Game.ServerUtil.version;
        if (isNeed) {
            if (this.node_hotupdate) {
                this.node_hotupdate.node.active = true;
            }

        }
        else {
            //显示登录按钮和选服按钮
            this._showLoginInteractive();
        }
    },
    onHotUpdateFailed: function (msg) {
        cc.log("updating-failed-msg:", msg);
        //显示登录按钮和选服按钮
        this._showLoginInteractive();
    },
    //====================  更新函数  ====================
    _showLoginInteractive: function () {
        if (this.node_hotupdate) {
            this.node_hotupdate.node.active = false;
        }
        this.openNoticeView();
    },
    openNoticeView() {
        cc.loader.loadRes('Prefab/Tip/NoticeView', function (err, prefab) {
            if (err) {
                cc.log('[公告加载失败]]');
            } else {
                var url = 'http://bhdl-notice.giantfun.cn/notice-llgj/notice.json';
                let node = cc.instantiate(prefab);
                switch(Game.ServerUtil.channel){
                    case Game.Define.Channel_Type.DianYou:{
                        url = 'http://bhdl-notice.giantfun.cn/notice-llgj/notice.json';
                        break;
                    }
                    case Game.Define.Channel_Type.DianYou_Ios_GaungMing:{
                        url = 'http://bhdl-notice.giantfun.cn/notice-gmsn/notice.json';
                        break;
                    }
                }

                var xhr = new XMLHttpRequest();
                xhr.open('GET',url,true);
                xhr.onreadystatechange = function(){
                    if(xhr.readyState == 4 && xhr.status == 200){
                        node._data = JSON.parse(xhr.response);
                        Game.UserModel.notice = node._data;
                        this.node.addChild(node);
                    }
                }.bind(this);
                xhr.send();

                Game.UserModel.url = url;
            }
        }.bind(this));
    },
});
