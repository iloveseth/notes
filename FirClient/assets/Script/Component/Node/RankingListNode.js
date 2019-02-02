const Game = require('../../Game');
const countPerPage = 20;
cc.Class({
    extends: cc.GameComponent,

    properties: {
        lab_top_1: { default: null, type: cc.Label_ },
        lab_top_2: { default: null, type: cc.Label_ },
        lab_top_3: { default: null, type: cc.Label_ },
        lab_top_other: { default: null, type: cc.Label_ },
        lab_down_1: { default: null, type: cc.Label_ },
        lab_down_2: { default: null, type: cc.Label_ },
        lab_down_3: { default: null, type: cc.Label_ },
        layout_other_btn: { default: null, type: cc.Layout },
        btn_other_yesterday: { default: null, type: cc.Button_ },
        btn_other_today: { default: null, type: cc.Button_ },
        table_view: { default: null, type: cc.tableView },
        Sprite_down: { default: null, type: cc.Sprite_ },
        btn_tab: { default: [], type: [cc.Button_] },

        page: { default: 1 },
        load_complete: { default: false },
        loading: { default: false },
    },

    onLoad: function () {
        this.btntype = 0;
        this.dateType = 0;
        this.board_type_ = 0;
        this.table_list_ = [];
        this.Sprite_down.node.active = false;
    },

    start() {
        this.initView();
    },

    update(dt) {
        //判断是否显示向下箭头
        if (this.table_list_.length == 0) {
            this.Sprite_down.node.active = false;
        } else {
            let curOffect = this.table_view.getScrollOffset();
            let maxOffect = this.table_view.getMaxScrollOffset();
            if (curOffect.y >= maxOffect.y) {
                this.Sprite_down.node.active = false;
            } else {
                this.Sprite_down.node.active = true;
            }
        };
    },

    onEnable() {
        this.initNotification();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NetWorkController.AddListener('msg.retFightSort', this, this.refreshTableViewData);
        this.table_view.addScrollEvent(this.node, 'RankingListNode', 'onTabel_Scroll');
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('msg.retFightSort', this, this.refreshTableViewData);
        this.table_view.clearScrollEvent();
    },

    initView() {
        this.resolveBtnTypeAndDateType(this.btntype, this.dateType);
    },


    resolveBtnTypeAndDateType(btntype, dateType) {
        if (dateType == 0) {
            this.btn_other_today.interactable = false;
            this.btn_other_yesterday.interactable = true;
        } else if (dateType == 1) {
            this.btn_other_today.interactable = true;
            this.btn_other_yesterday.interactable = false;
        }

        if (btntype == 0 && dateType == 0) {
            //今日战力
            this.lab_top_1.string = "名次";
            this.lab_top_2.string = "名字";
            this.lab_top_other.string = "";
            this.lab_top_3.string = "战力";
            this.lab_down_1.string = "您当前战力为";
            this.board_type_ = Game.Define.ENUM_COMMON_SORT.CommonSort_Fight;
        } else if (btntype == 0 && dateType == 1) {
            //昨日战力
            this.lab_top_1.string = "名次";
            this.lab_top_2.string = "名字";
            this.lab_top_other.string = "";
            this.lab_top_3.string = "战力";
            this.lab_down_1.string = "您昨日战力为";
            this.board_type_ = Game.Define.ENUM_COMMON_SORT.CommonSort_Fight_Yesterday;
        } else if (btntype == 1) {
            //过关
            this.lab_top_1.string = "名次";
            this.lab_top_2.string = "名字";
            this.lab_top_other.string = "";
            this.lab_top_3.string = "地图";
            this.lab_down_1.string = "您所在的地图";
            this.board_type_ = Game.Define.ENUM_COMMON_SORT.CommonSort_MAP;
        } else if (btntype == 2 && dateType == 0) {
            //今日护国
            this.lab_top_1.string = "名次";
            this.lab_top_2.string = "名字";
            this.lab_top_other.string = "";
            this.lab_top_3.string = "击杀数";
            this.lab_down_1.string = "您今日击杀数";
            this.board_type_ = Game.Define.ENUM_COMMON_SORT.CommonSort_KILL_TODAY;
        } else if (btntype == 2 && dateType == 1) {
            //昨日护国
            this.lab_top_1.string = "名次";
            this.lab_top_2.string = "名字";
            this.lab_top_other.string = "击杀数";
            this.lab_top_3.string = "奖励";
            this.lab_down_1.string = "您昨日击杀数";
            this.board_type_ = Game.Define.ENUM_COMMON_SORT.CommonSort_KILL_YESTERDAY;
        } else if (btntype == 3) {
            //等级
            this.lab_top_1.string = "名次";
            this.lab_top_2.string = "名字";
            this.lab_top_3.string = "等级";
            this.lab_top_other.string = "";
            this.lab_down_1.string = "您当前等级为";
            this.board_type_ = Game.Define.ENUM_COMMON_SORT.CommonSort_Level;
        };

        Game.GlobalModel.SetBoardType(this.board_type_);

        this.refreshBtnZIndex(btntype);
        this.page = 1;
        this.load_complete = false;
        this.table_list_ = [];
        this.loading = true;
        this.table_view.stopAutoScroll();
        Game.NetWorkController.SendProto('msg.reqFightSort', { type: this.board_type_, page: this.page, count: countPerPage });
    },

    refreshBtnZIndex(zorder) {
        //重设zIndex
        for (let i = 0; i < this.btn_tab.length; i++) {
            let tempBtn = this.btn_tab[i];
            if (i < zorder) {
                tempBtn.node.zIndex = i;
            } else if (i == zorder) {
                tempBtn.node.zIndex = i;
                if (zorder == 0 || zorder == 2) {
                    //昨天 今天
                    this.layout_other_btn.node.active = true;
                    this.layout_other_btn.node.zIndex = i + 1;
                    this.layout_other_btn.node.x = 0;
                } else if (zorder == 1 || zorder == 3) {
                    //无
                    this.layout_other_btn.node.active = false;
                    this.layout_other_btn.node.zIndex = 999;
                    this.layout_other_btn.node.x = -300;
                };
            } else if (i > zorder) {
                tempBtn.node.zIndex = i + 2;
            };
            tempBtn.interactable = true;
        };
        this.btn_tab[zorder].interactable = false;

    },


    //====================  这是分割线  ====================

    onBtn_Type_click(event, btnType) {
        this.btntype = btnType;
        this.dateType = 0;
        this.resolveBtnTypeAndDateType(this.btntype, this.dateType);
    },

    onBtn_today_click() {
        this.dateType = 0;
        this.resolveBtnTypeAndDateType(this.btntype, this.dateType);
    },
    onBtn_yesterday_click() {
        this.dateType = 1;
        this.resolveBtnTypeAndDateType(this.btntype, this.dateType);
    },

    onBtn_Close_click() {
        this.closeView(this._url, true);
    },

    onTabel_Scroll: function (tableview, eventtype) {
        if (eventtype == cc.ScrollView.EventType.SCROLLING) {
            if (!this.loading && !this.load_complete) {
                //判断有没有到底
                if (this.table_view.getScrollOffset().y - this.table_view.getMaxScrollOffset().y > -5) {
                    //请求新的数据
                    this.page++;
                    this.loading = true;
                    Game.NetWorkController.SendProto('msg.reqFightSort', { type: this.board_type_, page: this.page, count: countPerPage });
                }
            }
        }
    },

    refreshTableViewData(msgid, data) {
        this.loading = false;
        let list = Game._.get(data, 'list', []);
        let isfirst = (this.table_list_.length == 0);
        this.load_complete = (list.length < countPerPage) || this.page >= 5;
        this.table_list_ = Game._.concat(this.table_list_, list);
        let this_pm = Game._.get(data, 'rank', 0);

        //更新排名
        if (this_pm == 0 || this_pm > 100) {
            this.lab_down_3.string = "排名在100名以外";
        } else {
            this.lab_down_3.string = cc.js.formatStr("排名：%d", this_pm);
        }

        //更新数据回调
        if (this.board_type_ == Game.Define.ENUM_COMMON_SORT.CommonSort_Fight) {
            this.lab_down_2.string = Game.UserModel.GetUserMainInfo().fightval;
        } else if (this.board_type_ == Game.Define.ENUM_COMMON_SORT.CommonSort_Fight_Yesterday) {
            this.lab_down_2.string = data.value;
        } else if (this.board_type_ == Game.Define.ENUM_COMMON_SORT.CommonSort_MAP) {
            let cur_map_id = Game.UserModel.GetMaxMapid();
            let mapData = Game.ConfigController.GetConfigById('newmap_data', cur_map_id);
            this.lab_down_2.string = mapData.name;
        } else if (this.board_type_ == Game.Define.ENUM_COMMON_SORT.CommonSort_KILL_TODAY) {
            this.lab_down_2.string = data.value;
        } else if (this.board_type_ == Game.Define.ENUM_COMMON_SORT.CommonSort_KILL_YESTERDAY) {
            this.lab_down_2.string = data.value;
        } else if (this.board_type_ == Game.Define.ENUM_COMMON_SORT.CommonSort_Level) {
            let cur_mine_lv = Game.UserModel.GetLevel();
            this.lab_down_2.string = cur_mine_lv;
        }
        if (isfirst) {
            this.table_view.initTableView(this.table_list_.length, { array: this.table_list_, target: this });
        } else {
            this.table_view.reloadTableView(this.table_list_.length, { array: this.table_list_, target: this });
        }
    },
});
