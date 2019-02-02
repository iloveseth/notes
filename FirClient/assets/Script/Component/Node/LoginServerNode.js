const Game = require('../../Game');

const ServerInfo = [
    {
        Name: '无双',
        url: 'ws://192.168.30.202:46101/ws_handler'
    },
    {
        Name: '谢建',
        url: 'ws://192.168.30.203:46101/ws_handler'
    },
    {
        Name: '外网',
        url: 'ws://210.73.214.69:48101/ws_handler'
    },
    {
        Name: '策划',
        url: 'ws://192.168.30.206:46101/ws_handler'
    },
    {
        Name: '毕强',
        url: 'ws://192.168.30.205:46101/ws_handler'
    }
    // {
    //     Name: '一区',
    //     url: 'ws://210.73.214.69:47101/ws_handler'
    // },
    // {
    //     Name: '长尾',
    //     url: 'ws://210.73.214.69:49101/ws_handler'
    // },
]

cc.Class({
    extends: cc.GameComponent,

    properties: {
        button_start: { default: null, type: cc.Button },
        accEditBox: { default: null, type: cc.EditBox },
        DebugServerNode: { default: null, type: cc.Node },
        ReleaseServerNode: { default: null, type: cc.Node },
        label_debugServer: { default: null, type: cc.Label_ },
        label_releaseServer: { default: null, type: cc.Label_ },
        Node_selectDebugServer: { default: null, type: cc.Node },
        tableview_selectDebugServer: { default: null, type: cc.tableView },
        Node_selectReleaseServer: { default: null, type: cc.Node },
        percentLabel: { default: null, type: cc.Label },
        label_title: { default: null, type: cc.Label },
        loadProgressBar: { default: null, type: cc.ProgressBar },
        Node_progress: { default: null, type: cc.Node },

        inited: { default: false },
        logining: { default: false },
        loadedDir: { default: false }
    },

    onLoad() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.ROLE_CREATE, this, this.onCreateRole);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ROLE_LOGINFINISH, this, this.onLoginFinish);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SELECT_SERVER_GET, this, this.onSelectServerGet);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TOKEN_LOGIN, this, this.TokenStartGame);
        Game.NotificationController.On(Game.Define.EVENT_KEY.HOTUPDATE_CHECK, this, this.onLoadOver);

        Game.NetWorkController.AddBinaryListener(Game.Define.MSG_ID.stLoginKickReconnect, this, this.onLoginKickReconnect);
        this.accEditBox.node.on("text-changed", () => {
            let oldString = this.accEditBox.string;
            let newString = oldString.replace(/[^\w\.\/]/ig,'');
            this.accEditBox.string = newString;
        });
        this.initData();
        this.initView();
        if(!cc.sys.isNative)
        {
            this.onLoadOver();
        }
    },

    onDestroy() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ROLE_CREATE, this, this.onCreateRole);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ROLE_LOGINFINISH, this, this.onLoginFinish);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SELECT_SERVER_GET, this, this.onSelectServerGet);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.TOKEN_LOGIN, this, this.TokenStartGame);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.HOTUPDATE_CHECK, this, this.onLoadOver);
        Game.NetWorkController.RemoveBinaryListener(Game.Define.MSG_ID.stLoginKickReconnect, this, this.onLoginKickReconnect);
    },
    update: function (dt) {
        if (Game.GameInstance == null || Game.GameInstance.totalCount == 0 || this.inited) {
            return;
        }
        let percent = (Game.GameInstance.loadingCount / Game.GameInstance.totalCount).toFixed(2);
        this.percentLabel.string = Math.ceil(percent * 100) + '%';
        this.loadProgressBar.progress = percent;
        if (Game.GameInstance.loadingCount == Game.GameInstance.totalCount) {
            this.inited = true;
        }
    },

    initData() {
        this.serverData = [];
        this.debugServerStorage = null;
        this.releaseServerStorage = null;
        this.latelyServerStorageList = null;//最近登录数据

        this._isGetedServerData = false; //服务器列表数据获取完毕
    },

    initView() {
        this.button_start.node.active = true;
        this.Node_selectDebugServer.active = false;
        this.Node_selectReleaseServer.active = false;
        this.DebugServerNode.active = false;
        this.ReleaseServerNode.active = false;
        let acc = Game.Platform.GetStorage(Game.Define.DATA_KEY.HISTORY_ACC);
        this.accEditBox.string = acc || '';

        if (!Game.ServerUtil.IsOfficial()) {
            this.localServerData = ServerInfo[Game.Platform.GetStorage('localDebugServer') || 0];
        }
        this.Node_progress.active = false;
    },
    getServerListInfo()
    {
       Game.ServerUtil.SetServerUrl();
        this.serverParams = {"serverstate": 1};

        let latelyData = Game.Platform.GetStorage('latelyServerStorageList') || null;
        if (latelyData) //最近登录数据
        {
            this.latelyServerStorageList = JSON.parse(latelyData);
        }
        if (!this.latelyServerStorageList) {
            this.latelyServerStorageList = [];
        }
        let releaseData = Game.Platform.GetStorage('releaseServerStorage') || null;
        if (releaseData != null) {
            this.releaseServerStorage = JSON.parse(releaseData);
        }
        else{
            // this.releaseServerStorage = 
        }
        if (Game.ServerUtil.isInExamine) //提审中不选服直接连接
        {
            this.releaseServerStorage = { Name: "服务器", Zoneid: 3, url: "wss://dianyou-bh.giantfun.cn/ws_handler" };
            this.updateServerInfo();
        }
        else {
            //http://210.73.214.72:40261 //外网测试
            // this.serverUrl = 'http://122.112.239.83:40261'; //外网正式
            if( Game.ServerUtil.serverUrl)
            {
                this.sendMsg();
            }
            else {
                this.updateServerInfo();
            }
        }
    },
    sendMsg(callBack) {
        Game.HttpUtil.HTTPPost(Game.ServerUtil.serverUrl, this.serverParams, function(info){
            console.log("区服信息：", JSON.stringify(info));
            if(info.Data && info.Data.length > 0)
            {
                 this.serverData = Game._.sortBy(info.Data, function (data) {
                        return -data.Zoneid;
                    });
                if (this.releaseServerStorage == null) {        //如果本地没有选择服务器则默认选择最新的服务器
                   this.releaseServerStorage = this.serverData[0];
                }
                var isLegalServerUrl = false; //本地存储的登录服是否在 服务器返回的列表中
                for (let data of this.serverData) //组装url
                {
                    switch (Game.ServerUtil.channel) {
                        case Game.Define.Channel_Type.Qzone_NotIos:
                        case Game.Define.Channel_Type.Qzone_Ios:
                            data.url = 'wss://' + data.Url + '/ws_handler';
                            break;
                        case Game.Define.Channel_Type.Common_Android:
                        case Game.Define.Channel_Type.Quick_Ios:
                            data.url =  'ws://' + data.Url + '/ws_handler';
                            break;
                        default:
                            data.url = 'ws://' + data.Ip + ':' + data.Port + '/ws_handler';
                            break;
                    }
                    if(this.releaseServerStorage && !isLegalServerUrl) //检测最近登录服务器地址的合法性
                    {
                        if(this.releaseServerStorage.url == data.url || (this.releaseServerStorage.Ip == data.Ip && this.releaseServerStorage.Port == data.Port))
                        {
                            isLegalServerUrl = true;
                        }
                    }
                }
                if(!isLegalServerUrl) //检测到最近登录服务器已经失效 则取最新的合法的服务器地址
                {
                   this.releaseServerStorage = this.serverData[0];
                   Game.Platform.SetStorage('releaseServerStorage', JSON.stringify(this.releaseServerStorage));
                }
            }
            else {
                cc.log("拉取区服列表信息失败！");
            }
            this._isGetedServerData = true;
            this.updateServerInfo();
            if(callBack)
            {
                callBack.call(this);
            }
        }.bind(this));
    },
    onCreateRole: function () {
        this.logining = true;
        Game.GlobalModel.SetIsFirstGame(true);
        this.node.stopAllActions();
        this.Node_progress.active = true;
        this.onLoadDir(function (err) {
            if (err) {
                console.error(err);
            }
            cc.director.loadScene('CreateRoleScene');
        }.bind(this));
    },
    onLoginFinish: function () {
        this.logining = true;
        this.node.stopAllActions();
        this.Node_progress.active = true;
        this.onLoadDir(function (err) {
            if (err) {
                console.error(err);
            }
            this._openMainScene();
        }.bind(this));
    },

    onStartGame() {
        if (!Game.GameInstance.loaded && Game.GameInstance.loadingCount > 0) {
            //正在加载
            return;
        }
        if (Game.NetWorkController.IsConnect()) {
            return;
        }
        this.button_start.node.active = false;
        if (Game.GameInstance.StartLoad(function () {
            if (Game.ServerUtil.channel == Game.Define.Channel_Type.Default || CC_DEBUG || !Game.ServerUtil.serverUrl) {
                Game.UserModel.acc = this.accEditBox.string;
            }
            Game.Platform.SetStorage(Game.Define.DATA_KEY.HISTORY_ACC, this.accEditBox.string);
            Game.Platform.AutoLogin();
            this.node.stopAllActions();
            this.node.runAction(cc.sequence([
                cc.delayTime(5),
                cc.callFunc(function () {
                    if (!this.logining) {
                        this.Node_progress.active = false;
                        this.button_start.node.active = true;
                    }
                }, this)
            ]))
        }.bind(this))) {
            this.Node_progress.active = true;
        }
    },
    TokenStartGame(userid, token) {
        Game.UserModel.acc = userid;
        Game.UserModel.token = token;
        Game.Platform.TokenLogin();
        this._addLatelyServerInfo(); //尝试添加最近登录
    },
    onLoginKickReconnect(buffer) {
        let result = Game.CppCmd.ParseLoginKickReconnect(buffer);
        if (result.connect == 1) {
            this.button_start.interactable = false;
            //重连
            Game.NetWorkController.Close(function () {
                this.scheduleOnce(function () {
                    this.onStartGame();
                }.bind(this), 1);
            }.bind(this));
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '您的账号已登录，正在重新登录中');
        }
    },
    onSelectDebugServer() {
        this.tableview_selectDebugServer.initTableView(ServerInfo.length, { array: ServerInfo, target: this });
        this.Node_selectDebugServer.active = true;
    },

    onSelectReleaseServer() {
        this.sendMsg(this._showZoneNode);
    },
    _showZoneNode()
    {
        let _releaseServerComponet = this.Node_selectReleaseServer.getComponent('SelectReleaseServerNode');
        if (_releaseServerComponet) {
            if (this.serverData.length > 0) {
                // let i = 10;
                // while(i-- > 0)
                // {
                //     this.serverData = Game._.concat(this.serverData, this.serverData);
                // }
                _releaseServerComponet.updateView(this.serverData, this.latelyServerStorageList);      //初始化界面
            }
        }
        this.Node_selectReleaseServer.active = true;
    },
    onServerClick(index) {
        this.localServerData = ServerInfo[index];
        this.updateServerInfo();

        Game.Platform.SetStorage('localDebugServer', index);
        this.Node_selectDebugServer.active = false;
    },

    onSelectServerGet(data) {
        this.releaseServerStorage = data;
        Game.Platform.SetStorage('releaseServerStorage', JSON.stringify(data));
        this.updateServerInfo();
    },

    onLoadOver() {
        var isOffical = Game.ServerUtil.IsOfficial();
        if (isOffical) {
            this.getServerListInfo();
        }
        else {
            this.updateServerInfo();
        }
    },
    updateServerInfo() {
        this.button_start.node.active = true;
        var isOffical = Game.ServerUtil.IsOfficial();
        if (!isOffical) { //根据是否是正式环境 来显示不同的选服逻辑 
            this.label_debugServer.setText(Game._.get(this, 'localServerData.Name', ''));
            Game.GlobalModel.SetLoginServerData(this.localServerData)
        } else {
            this.label_releaseServer.setText(Game._.get(this, 'releaseServerStorage.Name', ''));
            Game.GlobalModel.SetLoginServerData(this.releaseServerStorage)
        }
        if (Game.ServerUtil.isInExamine) {
            this.DebugServerNode.active = false;
            this.ReleaseServerNode.active = false;
        }
        else {
            this.DebugServerNode.active = !isOffical;
            this.ReleaseServerNode.active = isOffical;
        }
    },
    //====================  私有函数  ====================
    _addLatelyServerInfo() {
        let isExist = false;
        if (this.latelyServerStorageList) {
            for (let latelyData of this.latelyServerStorageList) {
                if (latelyData && latelyData.Zoneid === this.releaseServerStorage.Zoneid) {
                    isExist = true;
                    break;
                }
            }
            if (!isExist) {
                this.latelyServerStorageList.unshift(this.releaseServerStorage);
                Game.Platform.SetStorage('latelyServerStorageList', JSON.stringify(this.latelyServerStorageList));
            }
        }
    },
    onLoadDir: function (cb) {
        if (true) {
            Game.Tools.InvokeCallback(cb);
            return;
        }
        let loads = [];
        Game.async.waterfall([
            function (anext) {
                this.label_title.string = "界面资源加载中...";
                this.loadProgressBar.progress = 0;
                this.percentLabel.string = '0%';
                cc.loader.loadResDir('Image/Icon/item01', cc.SpriteFrame, this._progressCallback.bind(this), function (err, ress, urls) {
                    if (err == null) {
                        for (let i = 0; i < urls.length; i++) {
                            Game.ResController.PushSpriteFrames(urls[i], ress[i]);
                        }
                    }
                    anext(err);
                });
            }.bind(this),
            function (anext) {
                this.label_title.string = "界面资源加载中...";
                this.loadProgressBar.progress = 0;
                this.percentLabel.string = '0%';
                cc.loader.loadResDir('Image/Icon/item03', cc.SpriteFrame, this._progressCallback.bind(this), function (err, ress, urls) {
                    if (err == null) {
                        for (let i = 0; i < urls.length; i++) {
                            Game.ResController.PushSpriteFrames(urls[i], ress[i]);
                        }
                    }
                    anext(err);
                });
            }.bind(this),
            function (anext) {
                this.label_title.string = "界面资源加载中...";
                this.loadProgressBar.progress = 0;
                this.percentLabel.string = '0%';
                cc.loader.loadResDir('Animation/Character', cc.SpriteFrame, this._progressCallback.bind(this), function (err, ress, urls) {
                    anext(err);
                });
            }.bind(this),
            function (anext) {
                this.label_title.string = "预制文件加载中...";
                this.loadProgressBar.progress = 0;
                this.percentLabel.string = '0%';
                loads = [
                    'Prefab/View/MainView',
                    'Prefab/View/EquipView',
                    'Prefab/View/PackageView',
                    'Prefab/View/FairyView',
                    'Prefab/View/BattleView',
                ];
                cc.loader.loadResArray(loads, cc.Prefab, this._progressCallback.bind(this), function (err, urls) {
                    anext(err);
                });
            }.bind(this),
        ], function (err) {
            this.loadedDir = true;
            Game.Tools.InvokeCallback(cb, err);
        }.bind(this));
    },
    _openMainScene: function () {
        // cc.log("LoginServerNode _openMainScene() Emit EFFECT_CLOUDMASK");
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.EFFECT_CLOUDMASK, cc.WrapMode.Normal);
        this.node.runAction(cc.sequence([
            cc.delayTime(0.6),
            cc.callFunc(function () {
                cc.log("delay 0.6 loadScene(MainScene)");
                cc.director.loadScene("MainScene");
            })
        ]))
    },
    _progressCallback: function (completeCount, totalCount, res) {   //加载过程中回调
        let percent = (completeCount / totalCount).toFixed(2);
        this.percentLabel.string = Math.ceil(percent * 100) + '%';
        this.loadProgressBar.progress = percent;
    },

    textChangedCallBack(event){
        cc.log("_textChangedCallBack == "+this.accEditBox.string);
    },
});
