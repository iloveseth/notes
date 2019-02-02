const Game = require('../../Game');
cc.Class({
    extends: cc.viewCell,

    properties: {
        sprite_bg: { default: null, type: cc.Sprite_ },
        label_difficult: { default: null, type: cc.Label_ },
        buttons_level: { default: [], type: [cc.Button_] },
        labels_level: { default: [], type: [cc.Label_] },
        nodes_level: { default: [], type: [cc.Node] },
        sprites_function: { default: [], type: [cc.Sprite_] },
        labels_function: { default: [], type: [cc.Label_] },
        node_role: { default: null, type: cc.Node },
        sprite_head: { default: null, type: cc.Sprite_ },
        sprite_function: { default: null, type: cc.Sprite_ },
        label_function: { default: null, type: cc.Label_ },
        node_finger: { default: null, type: cc.Node },

        data_scene: { default: null },
        func_click: { default: null },
    },
    //====================  回调接口  ====================
    onLevelClick: function (event, index) {
        index = Game._.toNumber(index);
        Game.Tools.InvokeCallback(this.func_click, this.data_scene.min_pass + index);
    },
    //====================  对外接口  ====================
    init: function (index, data, reload, group) {
        if (index >= data.array.length) {
            this.node.active = false;
            return;
        }
        this.func_click = data.callback;
        this.node.active = true;
        this.data_scene = data.array[index];
        this.node.name = 'MiniLevelMap' + this.data_scene.id;
        let bgpath = 'Image/Map/map/' + this.data_scene.minmap;
        this.sprite_bg.SetSprite(bgpath);
        let findPlayer = false;

        for (let i = 0; i < 5; i++) {
            let mapid = this.data_scene.min_pass + i;
            let btn = this.buttons_level[i];
            if (btn) {
                btn.interactable = (Game.LevelModel.GetMaxMapId() >= mapid);
            }
            let lab = this.labels_level[i];
            if (lab) {
                lab.setText(Game.LevelModel.GetMapIndex(mapid));
            }
            if (Game.LevelModel.GetCurMapId() == mapid) {
                //玩家当前在这
                findPlayer = true;
                let targetnode = this.nodes_level[i];
                this.node_role.position = targetnode.position;
            }
            this.label_difficult.setText(Game.LevelModel.GetMapDifficult(mapid));
            //找找看有没有未解锁的功能
            let sprite_function = this.sprites_function[i];
            let unlockFunction = false;
            if (mapid > Game.LevelModel.GetTopMapId()) {
                //这时候才有可能为开启
                let define = Game.GuideController.GetFunctionByMap(mapid);
                if (define != null) {
                    unlockFunction = true;
                    sprite_function.SetSprite(Game._.get(define, 'minitips', ''));
                    let label_function = this.labels_function[i];
                    label_function.setText(Game._.get(define, 'function', ''))
                }
            }
            sprite_function.node.active = unlockFunction;
        }
        this.node_role.active = findPlayer;
        if (findPlayer) {
            this.sprite_head.SetSprite(Game.UserModel.GetProfessionIcon(Game.UserModel.GetUserOccupation()));
        }
        //是不是有引导的手指
        let guideInfo = data.guideInfo;
        let active = false;
        if (guideInfo != null) {
            if (Game._.get(guideInfo, 'scene', 0) == this.data_scene.id) {
                //就是我
                let index = Game._.get(guideInfo, 'button', 0);
                let target = this.nodes_level[index];
                if (target) {
                    this.node_finger.position = target.position;
                    active = true;
                }
            }
        }
        this.node_finger.active = active;
    }
});
