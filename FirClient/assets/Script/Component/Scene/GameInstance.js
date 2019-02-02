let Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        loadingCount: { default: 0, type: cc.Integer },
        totalCount: { default: 0, type: cc.Integer },
        loaded: { default: false },
    },

    onLoad() {
        cc.director.setDisplayStats(false);
        cc.game.addPersistRootNode(this.node);
        Game.GameInstance = this;
        //开始加载
        Game.Platform.InitPlatform();
    },

    update(dt) {
        if (this.loaded) {
            for (let i = 0; i < this.ctls.length; i++) {
                let ctl = this.ctls[i];
                if (Game._.isFunction(ctl.Update)) {
                    ctl.Update(dt);
                }
            }
            Game.AsyncGenerator.Update(dt);
            Game.LevelModel.Update(dt);
        }
    },
    StartLoad: function (loadedcb) {
        if (this.loaded) {
            Game.Tools.InvokeCallback(loadedcb);
            return false;
        }
        //初始化游戏
        this.ctls = [
            Game.ConfigController,
            Game.NotificationController,
            Game.NetWorkController,
            Game.AudioController,
            Game.LoginController,
            Game.ResController,
            Game.TimeController,
            Game.ViewController,
            Game.EntityController,
            Game.LanguageController,
            Game.TipPoolController,
            Game.GuideController,
            Game.NativeController,
            Game.TargetGuideController,
        ];

        this.models = [
            Game.UserModel,
            Game.CurrencyModel,
            Game.ItemModel,
            Game.EquipModel,
            Game.LevelModel,
            Game.GlobalModel,
            Game.MainUserModel,
            Game.ShopModel,
            Game.DigModel,
            Game.FightModel,
            Game.MailModel,
            Game.WorldBossModel,
            Game.TaskModel,
            Game.FairyModel,
            Game.RewardModel,
            Game.BorderModel,
            Game.BlessModel,
            Game.WelfareModel,
            Game.SeptModel,
            Game.ActiveModel,
            Game.SeptPkModel,
            Game.ChatModel,
            Game.VipModel,
            Game.JijieModel,
        ];
        this.totalCount = this.ctls.length + this.models.length;
        Game.async.waterfall([
            function (anext) {
                //初始化controller
                Game.async.timesSeries(this.ctls.length, function (n, tnext) {
                    this.loadingCount++;
                    let ctl = this.ctls[n];
                    if (Game._.isFunction(ctl.Init)) {
                        ctl.Init(function (err) {
                            tnext(err);
                        });
                    } else {
                        console.log(ctl);
                        console.log('[警告] 该controller没有init方法');
                        tnext(null);
                    }
                }.bind(this), function (err) {
                    anext(err);
                }.bind(this));
            }.bind(this),
            function (anext) {
                //初始化model
                Game.async.timesSeries(this.models.length, function (n, tnext) {
                    this.loadingCount++;
                    let model = this.models[n];
                    if (Game._.isFunction(model.Init)) {
                        model.Init(function (err) {
                            tnext(err);
                        });
                    } else {
                        console.log(model);
                        console.log('[警告] 该model没有init方法');
                        tnext(null);
                    }
                }.bind(this), function (err) {
                    anext(err);
                }.bind(this));
            }.bind(this),
        ], function (err) {
            if (err) {
                console.log(err);
            } else {
                this.loaded = true;
            }
            Game.Tools.InvokeCallback(loadedcb, err);
        }.bind(this));
        return true;
    },

    Logout() {
        Game.NetWorkController.Close(function () {
            Game.async.waterfall([
                function (anext) {
                    //初始化controller
                    Game.async.timesSeries(this.ctls.length, function (n, tnext) {
                        let ctl = this.ctls[n];
                        if (Game._.isFunction(ctl.Reload)) {
                            ctl.Reload(function (err) {
                                tnext(err);
                            });
                        } else {
                            tnext(null);
                        }
                    }.bind(this), function (err) {
                        anext(err);
                    }.bind(this));
                }.bind(this),
                function (anext) {
                    //初始化model
                    Game.async.timesSeries(this.models.length, function (n, tnext) {
                        let model = this.models[n];
                        if (Game._.isFunction(model.Reload)) {
                            model.Reload(function (err) {
                                tnext(err);
                            });
                        } else {
                            tnext(null);
                        }
                    }.bind(this), function (err) {
                        anext(err);
                    }.bind(this));
                }.bind(this),
            ], function (err) {
                if (Game.GlobalModel.loadSceneName != '') {
                    cc.director.loadScene(Game.GlobalModel.loadSceneName);
                }
            }.bind(this));
        }.bind(this));
    },
    ReLogin: function () {
        if (Game.NetWorkController.IsConnect()) {
            Game.NetWorkController.Close(function () {
                Game.LoginController.ConnectToLoginServer();
            });
        } else {
            Game.LoginController.ConnectToLoginServer();
        }
    }
});
