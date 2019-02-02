const Game = require('../../Game');
cc.Class({
    extends: require('viewCell'),

    properties: {
        nodes_item:[cc.Node],
        label_desc0: cc.Label_,
        label_desc1: cc.Label_,
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

    //data{array({reward:})}
    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        this._appid = data.appid;
        this._sheet = data.sheet;
        this.roottip = data.roottip;
        if (this._data) {
            var award_data = Game.ConfigController.GetConfigById(data.sheet,this._data.reward);
            for(let i = 0; i < 4; i++){
                this.nodes_item[i].active = false;
            };
            let rewardTable = null;
            if(data.sheet == "commonreward_data"){
                rewardTable = Game.ItemModel.GenerateObjectsFromCommonReward(this._data.reward);
            }else if(data.sheet == "award_data"){
                rewardTable = Game.ItemModel.GenerateObjectsFromAwardReward(this._data.reward);
            }
            
            for(let i = 0; i < rewardTable.objs.length; i++){
                this.nodes_item[i].getComponent('SingleItemNode').updateView(rewardTable.objs[i], this.onIconClick.bind(this));
                this.nodes_item[i].active = true;
            };
            // var award_info = new Array();
            // if(award_data.gold > 0){
            //     award_info.push({id:109,num: award_data.gold});
            // }
            // if(award_data.money > 0){
            //     award_info.push({id:108,num: award_data.money});
            // }

            // var items = award_data.item.split(';');
            // items.forEach(e => {
            //     var info = e.split('-');
            //     award_info.push({id:Number(info[0]),num:Number(info[1])});
            // });
            // this.nodes_item.forEach((e,idx) => {
            //     var basicItemNode = e.getComponent('BasicItemNode');
            //     basicItemNode.setInfo(award_info[idx].id,award_info[idx].num,undefined,this.roottip);
            // });


            this.handleAppid();
        }
    },

    handleAppid(){
        switch(this._appid){
            case 0:{//活动奖励
                this.label_desc0.node.active = true;
                this.label_desc1.node.active = false;
                this.button_accept.node.active = false;
                var sortstart = this._data.sortstart;
                var sortend = this._data.sortend;
                if(sortstart == sortend){
                    this.label_desc0.setText(`第${sortstart}名`)
                }
                else{
                    this.label_desc0.setText(`第${sortstart}-${sortend}名`);
                }
                break;
            }
            case 1:{//战力奖励
                this.label_desc0.node.active = true;
                this.label_desc1.node.active = false;
                this.button_accept.node.active = true;
                var state = this._data.state;
                switch(state){
                    case 0:{
                        this.button_accept.interactable = true;
                        this.label_button.setText('领取');
                        break;
                    }
                    case 1:{
                        this.button_accept.interactable = false;
                        this.label_button.setText('领取');
                        break;
                    }
                    case 2:{
                        this.button_accept.interactable = false;
                        this.label_button.setText('已领取');
                        break;
                    }
                }
                this.label_desc0.setText(`战力达到${this._data.goalnum}`);
                this.buttonHandler = function(){
                    var msg = {
                        id: this._data.id,
                        type: this._data.type,
                    }
                    Game.NetWorkController.SendProto('act.getZoneLimitReward', msg);
                }.bind(this);
                break;//战斗奖励
            }
        }
    },

    onclickAccept(){
        cc.log('accept');
        this.buttonHandler();
    },

    onIconClick: function (item,info,src) {
        if (Game._.isFunction(Game._.get(this, '_target.onItemIconClick', null))) {
            let pos = src.node.parent.convertToWorldSpaceAR(src.node.position);
            this._target.onItemIconClick(info, pos);
        }
    },
});
