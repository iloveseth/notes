const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        lab_rank: { default: null, type: cc.Label_ },
        lab_name: { default: null, type: cc.Label_ },
        lab_special_num: { default: null, type: cc.Label_ },
        lab_common_num: { default: null, type: cc.Label_ },

        spr_rank: { default: null, type: cc.Sprite_ },
        spr_profession: { default: null, type: cc.Sprite_ },
        spr_online: { default: null, type: cc.Sprite_ },
        btn_award: { default: null, type: cc.Button_ },
    },

    onLoad() {

    },

    init(index, data, reload, group) {
        // cc.log("index == " + index)
        // cc.log(data);
        this._target = data.target;
        this._data = data.array[index];
        // cc.log("RankingListNodeCell init index == " + index);

        let boardType = this._target.board_type_;
        if (!boardType) {
            boardType = data.boardtype;
        }

        //排名
        this.mine_rank = index + 1;
        this.mine_boardType = boardType;
        let mine_sp = index + 1;
        if (mine_sp == 1) {
            this.spr_rank.node.active = true;
            this.spr_rank.SetSprite("Image/UI/Common/xiaotubiao_img_004");
            this.lab_rank.string = "";
        } else if (mine_sp == 2) {
            this.spr_rank.node.active = true;
            this.spr_rank.SetSprite("Image/UI/Common/xiaotubiao_img_005");
            this.lab_rank.string = "";
        } else if (mine_sp == 3) {
            this.spr_rank.node.active = true;
            this.spr_rank.SetSprite("Image/UI/Common/xiaotubiao_img_006");
            this.lab_rank.string = "";
        } else {
            this.spr_rank.node.active = false;
            this.lab_rank.string = mine_sp;
        }

        //职业
        let profession_id = Math.floor(this._data.face / 10);
        let profession_path = "";
        if (profession_id == Game.Define.PROFESSION_KUANGZHAN) {
            profession_path = "Image/Icon/CommonIcon/zhucheng_icon_zs";
        } else if (profession_id == Game.Define.PROFESSION_XINGHUN) {
            profession_path = "Image/Icon/CommonIcon/zhucheng_icon_fs";
        } else if (profession_id == Game.Define.PROFESSION_FEIYU) {
            profession_path = "Image/Icon/CommonIcon/zhucheng_icon_gs";
        };
        this.spr_profession.SetSprite(profession_path);

        //昵称
        this.lab_name.string = this._data.name;
        this.lab_name.setColor(cc.hexToColor(Game.UserModel.GetCountry() == this._data.country ? '#916022' : '#d73a3a'));

        //在线
        if (this._data.online == 0) {
            this.spr_online.SetSprite("Image/UI/Common/zaixian_02");
        } else if (this._data.online == 1) {
            this.spr_online.SetSprite("Image/UI/Common/zaixian_01");
        } else if (this._data.online == 2) {
            this.spr_online.SetSprite("Image/UI/Common/zaixian_03");
        }


        if (boardType == Game.Define.ENUM_COMMON_SORT.CommonSort_Fight) {
            this.lab_special_num.string = "";
            this.lab_common_num.string = this._data.fight;
            this.btn_award.node.active = false;
        } else if (boardType == Game.Define.ENUM_COMMON_SORT.CommonSort_Fight_Yesterday) {
            this.lab_special_num.string = "";
            this.lab_common_num.string = this._data.fight;
            this.btn_award.node.active = false;
        } else if (boardType == Game.Define.ENUM_COMMON_SORT.CommonSort_MAP) {
            this.lab_special_num.string = "";
            let mapData = Game.ConfigController.GetConfigById('newmap_data', this._data.mapid);
            if (mapData) {
                this.lab_common_num.string = mapData.disc;
            } else {
                this.lab_common_num.string = '';
            }
            this.btn_award.node.active = false;
        } else if (boardType == Game.Define.ENUM_COMMON_SORT.CommonSort_KILL_TODAY) {
            this.lab_special_num.string = "";
            this.lab_common_num.string = this._data.killnum;
            this.btn_award.node.active = false;
        } else if (boardType == Game.Define.ENUM_COMMON_SORT.CommonSort_KILL_YESTERDAY) {
            this.lab_special_num.string = this._data.killnum;
            this.lab_common_num.string = "";
            this.btn_award.node.active = true;
            if (mine_sp >= 4) {
                this.btn_award.node.active = false;
            };
        } else if (boardType == Game.Define.ENUM_COMMON_SORT.CommonSort_Level) {
            this.lab_special_num.string = "";
            this.lab_common_num.string = Game.UserModel.GetLevelDesc(this._data.level);
            this.btn_award.node.active = false;
        };

    },

    onEnable() {
        this.initNotification();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {

    },

    removeNotification() {

    },

    clicked() {
        cc.log("lay RankingListNodeCell clicked");
        // var msg = {
        //     charid: this._data.id,
        // }
        // Game.NetWorkController.SendProto('msg.ObserveUserInfo', msg);
        Game.UserModel.observePlayer(this._data.id);
    },

    onBtn_award_click() {
        let rewardid = 0;
        if (this.mine_boardType == Game.Define.ENUM_COMMON_SORT.CommonSort_KILL_YESTERDAY && this.mine_rank == 1) {
            rewardid = Game.ConfigController.GetConfigById("sortreward_data", 8001).mailid;
        } else if (this.mine_boardType == Game.Define.ENUM_COMMON_SORT.CommonSort_KILL_YESTERDAY && this.mine_rank == 2) {
            rewardid = Game.ConfigController.GetConfigById("sortreward_data", 8002).mailid;
        } else if (this.mine_boardType == Game.Define.ENUM_COMMON_SORT.CommonSort_KILL_YESTERDAY && this.mine_rank == 3) {
            rewardid = Game.ConfigController.GetConfigById("sortreward_data", 8003).mailid;
        };
        let result = Game.ItemModel.GenerateObjectsFromAwardReward(rewardid);
        this.openView(Game.UIName.UI_REWARDPREVIEW, {
            titleSpriteName: '',
            frameSpriteName: '',
            title: '奖励预览',
            desc: "",
            rewards: result.objs
        });

    },

});