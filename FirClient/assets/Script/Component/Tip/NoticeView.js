cc.Class({
    extends: cc.Component,

    properties: {
        ScrollView_content: { default: null, type: cc.ScrollView },
        rich: cc.RichText,
    },

    onClosePanel() {
        this.node.destroy();
    },

    onLoad(){
        var data = this.node._data;
        this.rich.node.active = false;

        if(data){
            this.rich.string = data.content;
        }else{
            this.rich.string = '';
        }

        this.scheduleOnce(function(){
			this.rich.node.active = true;
		}.bind(this), 0.1);
    },
});
