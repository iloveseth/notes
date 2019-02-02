const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        info: { default: null, type: cc.RichText_ },
        // sprAtlas: { default: null, type: cc.SpriteAtlas }
        lab_force:{ default: null, type: cc.Label_ },
    },
    //====================  这是分割线  ====================
    Play: function (force, newForce, power, forceCallback) {
        if (force == null || newForce == null ||  power == null) {
            return;
        }
        this.node.stopAllActions();
        this.node.x = 0;
        this.node.y = 0;
        this.node.opacity = 255;
        this.info.node.opacity = 0;
        this._power = power;
        this._fontcolor = this._power > 0 ? '#7BDE63' : '#F96D6D';
        this._forceCallback = forceCallback;
        this.lab_force.setText(force);
        this.node.runAction(cc.scaleTo(0.2, 1.2));
        this.addUpdate(force, newForce, 1);

    },
    setNumText(battleForce, endForce){
        if(battleForce == endForce){
            this.node.stopAllActions();
            this.setTextInfo(battleForce,false);
            this.info.node.opacity = 255;
            this.node.runAction(cc.sequence([
            cc.delayTime(0.5),
            // cc.scaleTo(0.2, 1),
            cc.spawn([
                    // cc.moveBy(0.5, 0, 200),
                     cc.scaleTo(0.2, 1),
                    cc.fadeTo(1, 0)
                ])
            ]));
        }else{
            this.setTextInfo(battleForce,true);
        }
    },
    setTextInfo(battleForce,random){
        if(random){
            let s = Math.floor(battleForce).toString();
            let len = s.length;
            let randomNum = Math.floor(Math.random()*Math.pow(10,len)); 
            this.lab_force.setText(randomNum);
            return;
        }
        this.lab_force.setText(battleForce);
        if (Game._.isFunction(this._forceCallback)) {
            Game.Tools.InvokeCallback(this._forceCallback);
        }
        let x = this.lab_force.node.getPositionX();
        let w = this.lab_force.node.width;
        x = x + w + 30;
        let info = this._power >= 0 ? '+' + this._power : this._power;
        var RichColor = '<b><i><outline color=black width=2><color=%s>%s</c></outline></i></b>';
        // this.info.node.setPositionX(x);
        this.info.string = cc.js.formatStr(RichColor, this._fontcolor, info);
    },

    // getNodeFromPool(index){
    //     let numNode = null;
    //     let numSpr = null;
    //     if(this._poolArr.length == 0 || (index+1) > this._poolArr.length){
    //         numNode = new cc.Node();
    //         numSpr = numNode.addComponent(cc.Sprite);
    //         this._poolArr.push(numNode);
    //     }
    //     numNode = this._poolArr[index];
    //     if(numNode.parent){
    //         numNode.parent.removeChild(numNode);
    //     }
    //     return numNode;
    // },
    // showNumber( num, frameName = "num2-"){
    //     if(this.sprAtlas == null)return;
    //     this.removeReset();
 
    //     let numArr = num.split("");
    //     let numNode = null;
    //     let numSpr = null;
    //     for(let i = 0 ; i < numArr.length; i++){
    //         numNode = this.getNodeFromPool(i);
    //         this.node.addChild(numNode);
    //         numSpr = numNode.getComponent(cc.Sprite);
    //         let s = numArr[i];
    //         numSpr.spriteFrame = this.sprAtlas.getSpriteFrame(frameName+s);
    //         numNode.x = (numSpr.spriteFrame.getRect().width)*i;
    //     }
    // },
    // removeReset() {
    //     this.node.removeAllChildren();
    // },
    addUpdate(startNum, endNum, time){
        this.stopUpdate();
        if(startNum != endNum){
            // this.setNumText = callback;
            this._startNum = parseInt(startNum);
            this._endNum = parseInt(endNum);
            // if(endNum > startNum){
            //     this._perValue = Math.ceil((endNum - startNum) / (time * 30));
            // }else{
            //     this._perValue = Math.floor((endNum - startNum) / (time * 30));
            // }
            this._perValue = (endNum - startNum) / (time * 30);

            this._scheduleCallback = function() {
                   this.onframe();
            }
            this.schedule(this._scheduleCallback,0);
        }else{
            // if(callback){
            //     callback(startNum);
            // }
            this.setNumText(startNum, endNum);
        }
    },
    onframe() {
        this._startNum = this._startNum + this._perValue;
        if((this._perValue > 0 && this._startNum > this._endNum)
            || (this._perValue < 0 && this._startNum < this._endNum)){
            this._startNum = this._endNum;
        }
        this.setNumText(this._startNum, this._endNum);
        if(this._startNum == this._endNum){
            this.stopUpdate();
        }

    },
    stopUpdate(){
        if (this._scheduleCallback){
             this.unschedule(this._scheduleCallback);
             this._scheduleCallback = null;
        }
    },
});
