const Game = require('../../Game');
const buttonUrl = 'Image/UI/Common/tongyong_icon_0002';
const greyUrl = 'Image/UI/Common/tongyong_icon_gray';
cc.Class({
    extends: require('viewCell'),

    properties: {
        nodes_item:[cc.Node],
        label_0: cc.Label_,
        label_1: cc.Label_,
        node_root: cc.Node,
        button_accept: cc.Button_,
        label_button: cc.Label_,
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
        this.appid = data.appid;
        this.resetItems();
        if (this._data) {
            var award_data = Game.ConfigController.GetConfigById('commonreward_data',this._data.reward);
            var award_info = new Array();
            if(award_data.gold > 0){
                award_info.push({id:109,num: award_data.gold});
            }
            if(award_data.money > 0){
                award_info.push({id:108,num: award_data.money});
            }
            var items = award_data.item.split(';');
            items.forEach(e => {
                var info = e.split('-');
                award_info.push({id:Number(info[0]),num:Number(info[1])});
            });
            if(award_data.equipid > 0){
                award_info.push({id: Number(award_data.equipid),num: 1,color:award_data.equipcolor});
            }
            this.nodes_item.forEach((e,idx) => {
                var isActive = idx < award_info.length;
                e.active = isActive;
                if(isActive){
                    var basicItemNode = e.getComponent('BasicItemNode');
                    basicItemNode.setInfo(award_info[idx].id,award_info[idx].num,award_info[idx].color,data.roottip);
                }
            });
            this.handleAppid();
        }
    },

    resetItems(){
        this.nodes_item.forEach(e => {
            e.active = false;
        })
    },

    onclickAccept(){
        this.buttonhandler();
    },

    handleAppid(){
        this.handleButtonState();
        switch(this.appid){
            case 1:{
                this.label_0.node.active = true;
                this.label_1.node.active = true;
                this.label_0.setText('全服购买基金的人数达到')
                this.label_1.setText(`${Game.ActiveModel.fundHongliMsg.buycount}/${this._data.num}`);
                this.buttonhandler = () => {
                    var msg = {
                        index: this._data.id,
                    };
                    Game.NetWorkController.SendProto('fund.gainFundRewHongli', msg);
                }
                break;
            }
            case 2:{
                this.label_0.node.active = true;
                this.label_1.node.active = false;
                this.label_0.setText(`第${this._data.day}天`);
                this.buttonhandler = () => {
                    Game.NetWorkController.SendProto('msg.GetSuperFund', {});
                }
                break;
            }
        }
    },

    handleButtonState(){
        if(this._data.buttonstate == 0){
            this.button_accept.getComponent(cc.Sprite_).SetSprite(buttonUrl);            
            this.label_button.setText('领取');
        }
        if(this._data.buttonstate == 1){
            this.button_accept.getComponent(cc.Sprite_).SetSprite(greyUrl);
            this.label_button.setText('领取');
        }
        if(this._data.buttonstate == 2){
            this.button_accept.getComponent(cc.Sprite_).SetSprite(greyUrl);
            this.label_button.setText('已领取');
        }
    }
});
