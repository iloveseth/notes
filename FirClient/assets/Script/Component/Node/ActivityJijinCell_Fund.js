const Game = require('../../Game');
const buttonUrl = 'Image/UI/Common/tongyong_icon_0002';
const greyUrl = 'Image/UI/Common/tongyong_icon_gray';
cc.Class({
    extends: require('viewCell'),

    properties: {
        sprite_quality: cc.Sprite_,
        sprite_item: cc.Sprite_,
        label_itemnum: cc.Label_,
        
        button_accept: cc.Button_,
        label_button: cc.Label_,

        label_gold: cc.Label_,
        label_level: cc.Label_,

    },
    onLoad: function () {
    },
    start: function () {
    },
    update: function(dt){
    },
    onDestroy: function(){
    },
    //====================  这是分割线  ====================

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        if (this._data) {
            this.label_gold.string = `${this._data.goldshow}金币`;
            this.label_level.string = `${this._data.level}级`;
            this.updateButtonView();
        }
    },

    updateButtonView(){
        var buttonstate = this._data.buttonstate;
        switch(buttonstate){
            case 0:{//kelingqu
                this.button_accept.getComponent(cc.Sprite_).SetSprite(buttonUrl);
                this.label_button.setText('领取');
                break;
            }
            case 1:{//bukelingqu
                this.button_accept.getComponent(cc.Sprite_).SetSprite(greyUrl);
                this.label_button.setText('领取');
                break;
            }
            case 2:{//yilingqu
                this.button_accept.getComponent(cc.Sprite_).SetSprite(greyUrl);
                this.label_button.setText('已领取');
                break;
            }
        }
    },

    onclickAccept(){
        var msg = {
            type: this._data.type,
            level:this._data.level,
        };
        Game.NetWorkController.SendProto('fund.getFundReward', msg);
    },
});
