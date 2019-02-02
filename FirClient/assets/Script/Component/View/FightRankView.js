const Game = require('../../Game');
const countPerPage = 20;
cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_currank: cc.Label_,
        label_timeleft: cc.Label_,
        table_view: cc.tableView,
        prefab_cell: [cc.Prefab],
        label_desc: cc.Label_,
        table_head: cc.Node,
        buttons_group: [cc.Button_],
        node_roottip: cc.Node,

        page: { default: 1 },
        load_complete: { default: false },
        loading: { default: false },
        spr_red: { default: null, type: cc.Sprite_ },
    },
    update: function () {
        this.updateCd();
    },
    onEnable() {
        this.initNotification();
        this.setView(0);
        this.table_data = [];
    },
    onDisable() {
        this.removeNotification();
    },
    //====================  初始化函数  ====================
    initNotification() {
        Game.NetWorkController.AddListener('msg.retFightSort', this, this.onRetFightSort);
        Game.NetWorkController.AddListener('act.retZoneLimitAct', this, this.onRetZoneLimitAct);
        this.table_view.addScrollEvent(this.node, 'FightRankView', 'onTabel_Scroll');
        Game.NetWorkController.AddListener('act.reqFightActHistory',this,this.onRetFightActHistory);
        Game.NotificationController.On(Game.Define.EVENT_KEY.RED_FIGHT_SORT, this, this._updateActFightSort);
    },
    removeNotification() {
        Game.NetWorkController.RemoveListener('msg.retFightSort', this, this.onRetFightSort);
        Game.NetWorkController.RemoveListener('act.retZoneLimitAct', this, this.onRetZoneLimitAct);
        this.table_view.clearScrollEvent();
        Game.NetWorkController.RemoveListener('act.reqFightActHistory',this,this.onRetFightActHistory);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.RED_FIGHT_SORT, this, this._updateActFightSort);
    },

    initModel(idx) {
        this.uiIdx = idx;
        switch (idx) {
            case 0: {
                this.table_data = Game.ConfigController.GetConfig('zonefightsort_data');
                this.appid = 0;
                this.sheet = 'award_data';
                this.table_view.cell = this.prefab_cell[0];
                this.updateView();
                break;
            }
            case 1: {
                Game.NetWorkController.SendProto('act.reqZoneLimitAct', { type: 1 });
                break;
            }
            case 2: {
                this.page = 1;
                this.load_complete = false;
                this.table_data = [];
                this.loading = true;
                this.table_view.stopAutoScroll();
                this.table_view.cell = this.prefab_cell[1];
                var time = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_ACTIVITY_FIGHTRANK);
                this.reqname = 'msg.reqFightSort';
                if(time <= 0){
                    this.reqname = 'act.reqFightActHistory';
                }
                Game.NetWorkController.SendProto(this.reqname, { type: Game.Define.ENUM_COMMON_SORT.CommonSort_Fight, page: this.page, count: countPerPage });
                break;
            }
        }
    },

    initView() {
        this.label_timeleft.string = Game.moment.duration(this._data.timeleft).format('dd天hh时mm分');
    },
    //====================  回调函数  ====================
    onRetFightSort(msg, data) {
        this.loading = false;
        let list = Game._.get(data, 'list', []);
        let isfirst = (this.table_data.length == 0);
        this.load_complete = (list.length < countPerPage) || this.page >= 5;
        this.table_data = Game._.concat(this.table_data, list);
        this.updateView(isfirst);
    },
    onRetFightActHistory(msg,data){
        this.loading = false;
        let list = Game._.get(data, 'list', []);
        let isfirst = (this.table_data.length == 0);
        this.load_complete = (list.length < countPerPage) || this.page >= 5;
        this.table_data = Game._.concat(this.table_data, list);
        this.updateView(isfirst);
    },
    onRetZoneLimitAct(msg, data) {
        if (data.type != 1) {
            return;
        }
        var sheet_data = Game.ConfigController.GetConfig('zonelimit_data');
        this.table_data = new Array();
        sheet_data.forEach(e => {
            if (e.type == 1) {
                if (data.hasget.includes(e.id)) {
                    //已领取
                    e.state = 2;
                }
                else {
                    if (data.fightcanget.includes(e.id)) {
                        //可领取
                        e.state = 0;
                    }
                    else {
                        //等级不够无法领取
                        e.state = 1;
                    }
                }
                this.table_data.push(e);
            }
        });
        this.table_data.sort((a, b) => {
            if(a.state != b.state){
                return a.state - b.state;
            }else{
                return a.id - b.id;
            }
            
        })
        this.appid = 1;
        this.sheet = 'commonreward_data';
        this.table_view.cell = this.prefab_cell[0];
        this.updateView();
    },
    
    onClickActiveAward() {
        this.setView(0);
    },

    onClickFightAward() {
        this.setView(1);
    },

    onClickFightRank() {
        this.setView(2);
    },
    /**
     * ScrollView 滚动函数
     *
     * @param {cc.tableView} tableview
     * @param {cc.ScrollView.EventType} eventtype
     */
    onTabel_Scroll: function (tableview, eventtype) {
        if (this.uiIdx != 2) {
            //不是战力排行榜 直接返回
            return;
        }
        if (eventtype == cc.ScrollView.EventType.SCROLLING) {
            if (!this.loading && !this.load_complete) {
                //判断有没有到底
                if (this.table_view.getScrollOffset().y - this.table_view.getMaxScrollOffset().y > -5) {
                    //请求新的数据
                    this.page++;
                    this.loading = true;
                    Game.NetWorkController.SendProto(this.reqname, { type: Game.Define.ENUM_COMMON_SORT.CommonSort_Fight, page: this.page, count: countPerPage });
                }
            }
        }
    },
    //====================  更新函数  ====================
    updateView(isfirst = true) {

        this.label_currank.setText(this._data.fightsort || '未上榜');
        switch (this.uiIdx) {
            case 0: {
                this.label_desc.node.active = true;
                this.table_head.active = false;
                this.label_desc.setText('活动结束后，战力排行榜前100的玩家通过邮件获得丰富奖励');
                break;
            }
            case 1: {
                this.label_desc.node.active = true;
                this.table_head.active = false;
                this.label_desc.setText('达到指定战力将可获得丰富奖励');
                break;
            }
            case 2: {
                this.label_desc.node.active = false;
                this.table_head.active = true;
                break;
            }
        }
        this.updateTableView(isfirst);
    },

    updateTableView(isfirst) {
        let data = {
            array: this.table_data,
            target: this,
            sheet: this.sheet,
            appid: this.appid,
            boardtype: Game.Define.ENUM_COMMON_SORT.CommonSort_Fight,
            roottip: this.node_roottip
        };
        if (isfirst) {
            this.table_view.initTableView(this.table_data.length, data);
        } else {
            this.table_view.reloadTableView(this.table_data.length, data);
        }

    },

    updateCd() {
        var timeStr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_ACTIVITY_FIGHTRANK, 'dd天hh时mm分');
        let lefttime = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_ACTIVITY_FIGHTRANK);
        if(lefttime >= 24*60*60){
            this.label_timeleft.string = timeStr;
        }else{
            this.label_timeleft.string = '已结束';
        }
        
    },

    setView(idx) {
        if (this.uiIdx == idx) {
            return;
        }
        this.selectButton(idx);
        this.initModel(idx);
        this._updateActFightSort();
    },
    selectButton(idx) {
        this.buttons_group.forEach((e, id) => {
            e.interactable = !(id == idx);
        });
    },

    _updateActFightSort() {
        //冲榜
        let hasRed = Game.ActiveModel.fightSortHasRedPoint();
        this.spr_red.setVisible(hasRed);
    },

    onItemIconClick: function (goodsinfo, pos) {
        let contents = Game.ItemModel.GenerateCommonContentByObject(goodsinfo);
        Game.TipPoolController.ShowItemInfo(contents, pos, this.node);
    },
});
