const Game = require('../../Game');
var crypto = require('crypto');
var Buffer = require('buffer/').Buffer;
cc.Class({
    extends: cc.GameComponent,

    properties: {
        byteProgressBar: { default: null, type: cc.ProgressBar },
        bytePercentLabel: { default: null, type: cc.Label_ },
        fileProgressBar: { default: null, type: cc.ProgressBar },
        filePercentLabel: { default: null, type: cc.Label_ },
        mendBtn: { default: null, type: cc.Button },
        retryBtn: { default: null, type: cc.Button },
        updateBtn: { default: null, type: cc.Button },
        updateInfoLabel: { default: null, type: cc.Label_ },
        fileInfoLabel: { default: null, type: cc.Label_ },
        manifestUrl: {
            type: cc.Asset,
            default: null
        },
        _updating: false,
        _canRetry: false,
        _storagePath: '',
        _isAutoUpdate: false,
        _mobileFreeSize: 0,
        _retryTimes:0,
    },
    onLoad: function () {
    },
    //====================  这是分割线  ====================
    //检测结果
    checkCb: function (event) {
        cc.log('HotUpdate-EventCode: ' + event.getEventCode());
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.fileInfoLabel.string = "未找到本地manifest文件, 跳过热更新.";
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.HOTUPDATE_CHECK, false, this.fileInfoLabel.string);
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.fileInfoLabel.string = "manifest文件下载失败, 跳过热更新.";
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.HOTUPDATE_CHECK, false, this.fileInfoLabel.string);
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.fileInfoLabel.string = "已经是最新的版本，无需热更.";
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.HOTUPDATE_CHECK, false, this.fileInfoLabel.string);
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                this.fileInfoLabel.string = '发现新版本，请更新.';

                this.updateInfoLabel.string = "更新文件数：" + event.getTotalFiles() + "更新大小：" + event.getTotalBytes();
                this.updateInfoLabel.node.active = true;

                this.fileProgressBar.progress = 0;
                this.byteProgressBar.progress = 0;

                Game.NotificationController.Emit(Game.Define.EVENT_KEY.HOTUPDATE_CHECK, true, this.fileInfoLabel.string);
                if (this._isAutoUpdate) {
                    this.hotUpdate();
                }
                break;
            // case jsb.EventAssetsManager.READY_TO_UPDATE:
            //     this.fileInfoLabel.string = '发现新版本，请更新.';

            //     this.updateInfoLabel.string = "更新文件数：" + event.getTotalFiles() + "更新大小：" + event.getTotalBytes();

            //     this.fileProgressBar.progress = 0;
            //     this.byteProgressBar.progress = 0;

            //     Game.NotificationController.Emit(Game.Define.EVENT_KEY.HOTUPDATE_CHECK, true, this.fileInfoLabel.string);
            // break;
            default:
                return;
        }

        cc.eventManager.removeListener(this._checkListener);
        this._checkListener = null;
        this._updating = false;
    },
    //更新中回调
    updateCb: function (event) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.fileInfoLabel.string = '未找到本地manifest文件, 跳过热更新.';
                failed = true;
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.HOTUPDATE_UPDATEFAILED, this.fileInfoLabel.string);
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                var willUpdateBytes = event.getTotalBytes();
                if (this._mobileFreeSize > 0 && this._mobileFreeSize < willUpdateBytes) {
                    this.fileInfoLabel.string = '手机存储空间不足无法更新.';
                    // Game.NotificationController.Emit(Game.Define.EVENT_KEY.HOTUPDATE_UPDATEFAILED, this.fileInfoLabel.string);
                    return;
                }
                this.byteProgressBar.progress = event.getPercent();
                this.fileProgressBar.progress = event.getPercentByFile();
                this.filePercentLabel.string = event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
                let downloadedBytes = event.getDownloadedBytes();
                var downLoadedSizeStr = this.bytesToSize(downloadedBytes);
                var totalLoadSizeStr = this.bytesToSize(willUpdateBytes);
                this.bytePercentLabel.string = downLoadedSizeStr + ' / ' + totalLoadSizeStr;
                var msg = event.getMessage();
                if (msg) {
                    this.fileInfoLabel.string = '文件更新成功: ' + msg;
                    // cc.log(event.getPercent()/100 + '% : ' + msg);
                }
                if (willUpdateBytes == downloadedBytes) {
                    this.fileInfoLabel.string = '更新完毕，即将重启游戏. ' + event.getMessage();
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.fileInfoLabel.string = 'manifest文件下载失败, 跳过热更新.';
                failed = true;
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.HOTUPDATE_UPDATEFAILED, this.fileInfoLabel.string);
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.fileInfoLabel.string = '已经是最新的版本，无需热更.';
                failed = true;
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.HOTUPDATE_UPDATEFAILED, this.fileInfoLabel.string);
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.fileInfoLabel.string = '更新完毕，即将重启游戏. ' + event.getMessage();
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                this.fileInfoLabel.string = '更新失败，点击重试按钮. ' + event.getMessage();
                this._canRetry = true;
                failed = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                this.fileInfoLabel.string = '资源更新出错: ' + event.getAssetId() + ', ' + event.getMessage();
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.fileInfoLabel.string = "资源解压出错：" + event.getMessage();
                break;
            // case jsb.EventAssetsManager.READY_TO_UPDATE:
            //     this.updateInfoLabel.string = "更新文件数：" + event.getTotalFiles() + "更新大小：" + event.getTotalBytes();
            //     break;
            default:
                break;
        }

        if (failed) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            this._updating = false;
            this.retryBtn.node.active = true;
            if(this._retryTimes >= 3)
            {
                this.mendBtn.node.active = true;
            }
            this.updateBtn.node.active = false;
        }

        if (needRestart) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            // Prepend the manifest's search path
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            console.log(JSON.stringify(newPaths));
            Array.prototype.unshift(searchPaths, newPaths);
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            let appid = this.getAppId();
            appid = appid.replace(/\//g, '');
            console.log("appid后", appid);
            cc.sys.localStorage.setItem('HotUpdateSearchPaths' + appid, JSON.stringify(searchPaths)); //兼容老包
            cc.sys.localStorage.setItem('HotUpdateSearchPaths-' + appid, JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);

            cc.audioEngine.stopAll();
            cc.game.restart();
        }
    },
    //检测是否有更新
    checkUpdate: function (isAuto) {
        if (this._updating) {
            this.fileInfoLabel.string = '检测中...或者更新中...';
            return;
        }
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            this._am.loadLocalManifest(this.manifestUrl.nativeUrl);
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            this.fileInfoLabel.string = '本地manifest文件加载失败 ...';
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.HOTUPDATE_CHECK, false, this.fileInfoLabel.string);
            return;
        }
        if(!this._checkListener)
        {
            this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));
        }
        cc.eventManager.addListener(this._checkListener, 1);
        var manifestData = this._am.getLocalManifest();
        Game.ServerUtil.versionUrl = manifestData.remoteVersionUrl; //赋值
        this._isAutoUpdate = isAuto;
        this._am.checkUpdate();
        this._updating = true;
    },
    //开始更新
    hotUpdate: function () {
        if (this._am && (!this._updating || this._isAutoUpdate)) {
            if(!this._updateListener)
            {
                this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));
            }
            cc.eventManager.addListener(this._updateListener, 1);

            if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
                this._am.loadLocalManifest(this.manifestUrl.nativeUrl);
            }

            let ret = jsb.reflection.callStaticMethod("GameLib", "getFreeDiskspace");
            this._mobileFreeSize = parseInt(ret);
            this._failCount = 0;
            this._am.update();
            this.updateBtn.node.active = false;
            this._updating = true;
        }
    },
    //重新加载失败资源
    retry: function () {
        if (!this._updating && this._canRetry) {
            this.retryBtn.node.active = false;
            this.mendBtn.node.active = false;
            this._canRetry = false;
            if(this._retryTimes == undefined)
            {
                this._retryTimes = 0;
            }
            this._retryTimes++;
            this.fileInfoLabel.string = '重新加载失败的资源...';
            this._am.downloadFailedAssets();
        }
    },
    mend: function () {
        cc.log("尝试修复！");
        if (!this._updating) {
            this._retryTimes = 0;
            this.retryBtn.node.active = false;
            this.mendBtn.node.active = false;
            this._isAutoUpdate = true;
            var result = jsb.fileUtils.removeDirectory(this._storagePath); //清理缓存目录，重新更新
            let appid = this.getAppId();
            var path = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'guaji-remote-asset/' + appid);
            cc.log("清理缓存目录结果：", result, "path:", path);
            if (!jsb.fileUtils.isDirectoryExist(path)) {
                result = jsb.fileUtils.createDirectory(path);
                cc.log("创建缓存目录：", result, "path:", path);
                if (result) {
                    // this.checkUpdate(true);
                    this.hotUpdate();
                }
            }
            else {
                // this.checkUpdate(true);
                this.hotUpdate();
            }
        }
    },
    //初始化完成
    init: function () {
        // Hot update is only available in Native build
        if (!cc.sys.isNative) {
            return;
        }
        let appid =  this.getAppId();
        //远程仓库下载到本地的存储路径
        this._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'guaji-remote-asset/' + appid);
        cc.log('Storage path for remote asset : ' + this._storagePath);
        // Setup your own version compare handler, versionA and B is versions in string
        // if the return value greater than 0, versionA is greater than B,
        // if the return value equals 0, versionA equals to B,
        // if the return value smaller than 0, versionA is smaller than B.
        this.versionCompareHandle = function (versionA, versionB) { //暂未实现
            Game.ServerUtil.version = versionA;
            cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                }
                else {
                    if (a > b) {
                        Game.ServerUtil.isInExamine = true;
                    }
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            }
            else {
                return 0;
            }
        };

        // Init with empty manifest url for testing custom manifest
        this._am = new jsb.AssetsManager('', this._storagePath, this.versionCompareHandle);
        if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.retain();
        }

        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this._am.setVerifyCallback(function (path, asset) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            if (compressed) {
                this.fileInfoLabel.string = "验证通过 : " + relativePath;
                return true;
            }
            else {
                var md5 = this.calculateMD5(path);
                if (md5 === expectedMD5) {
                    this.fileInfoLabel.string = "验证通过  : " + relativePath + ' (' + expectedMD5 + ')';
                    return true;
                }
                else {
                    this.fileInfoLabel.string = "验证失败  : " + relativePath + ' (' + expectedMD5 + ')';
                    return false;
                }
            }
        }.bind(this));

        this.fileInfoLabel.string = '热更新已就绪，请检查或者直接更新';

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // Some Android device may slow down the download process when concurrent tasks is too much.
            // The value may not be accurate, please do more test and find what's most suitable for your game.
            this._am.setMaxConcurrentTask(2);
            this.fileInfoLabel.string = "最大并发2个加载任务";
        }

        this.byteProgressBar.progress = 0;
        this.fileProgressBar.progress = 0;
    },
    onLoad: function () {
        this.retryBtn.node.active = false;
        this.mendBtn.node.active = false;
        this.updateBtn.node.active = true;
        this.updateInfoLabel.node.active = false;
    },
    onDestroy: function () {
        if (this._updateListener) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
        if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.release();
        }
    },
    bytesToSize: function (bytes) {
        if (bytes === 0) return '0 B';
        var k = 1024;
        var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));

        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },
    calculateMD5: function (filePath) {
        var data = jsb.fileUtils.getDataFromFile(filePath);
        data = Buffer.from(data);
        var ocmd5 = crypto.createHash("md5").update(data).digest("hex");
        cc.log("ocmd5", ocmd5);
        return ocmd5;
    },
    getAppId:function()
    {
        let appid = '';
        if(Game.ServerUtil.channelInfo && Game.ServerUtil.channelInfo.gameid)
        {
            appid = Game.ServerUtil.channelInfo.gameid;
            appid = appid || '';
        }
        if(Game.ServerUtil.channel > Game.Define.DianYou_Ios_GaungMing) //光明萝莉以后用channel做为附加存储路径！
        {
            appid = Game.ServerUtil.channel;
        }
        if(appid)
        {
            appid = appid + '/';
        }
        console.log("获取appid-----" + appid);
        return appid;
    }
});