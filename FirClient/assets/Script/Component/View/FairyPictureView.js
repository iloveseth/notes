// FairyPictureView.js
const Game = require('../../Game');

cc.Class({

	extends: cc.GameComponent,

	properties: {
		lab_job:{default: null,type: cc.Label_},
		lab_name:{default: null,type: cc.Label_},
		lab_fateon:{default: null,type: cc.Label_},
		node_role:{default: null,type: cc.Node},
		lab_power:{default: null,type: cc.Label_},
		lab_intelligence:{default: null,type: cc.Label_},
		lab_agile:{default: null,type: cc.Label_},
		lab_endurance:{default: null,type: cc.Label_},

		tableView: { default: null, type: cc.tableView },
		node_color:{default:[],type:[cc.Node]},
    },

    onLoad() {
    },
    onEnable() {
        this.initData();
    },
    onDisable() {
    },
    initData() {
    	this._color = 6;
    	this._fairyId = 1;
    	this._fairyList = [];
    	this.skeletonPath = "";
    	this._fairyList = Game.FairyModel.GetFairyBaseConfigByColor(1);
  		this.refreshView(false);
    },
    refreshView(isRelod){
    	this.refreshTableView(isRelod);
    	this.refreshBaseInfoView();
    },

    refreshBaseInfoView(){
    	var fairyId = this._fairyId + this._color - 1;
    	var baseConfig = Game.FairyModel.GetFairyBaseConfigById(fairyId);
    	this.lab_job.setText(Game.FairyModel.GetJobName(baseConfig.fairyjob));
    	this.lab_name.setText(baseConfig.fairyname);
    	this.lab_name.node.color = Game.FairyModel.GetFairyLabelColor(baseConfig.fairycolor);

    	var fateId = baseConfig.fairykind*100 + 1;
    	var fateConfig = Game.FairyModel.GetFairyFateConfigById(fateId);
    	var jibanConfig = Game.FairyModel.GetFairyBaseConfigByKind(fateConfig.fate);
    	this.lab_fateon.setText("羁绊："+jibanConfig.fairyname);

    	this.lab_power.setText(Game.Tools.UnitConvert(baseConfig.basestr));
        this.lab_intelligence.setText(Game.Tools.UnitConvert(baseConfig.baseint));
        this.lab_agile.setText(Game.Tools.UnitConvert(baseConfig.basedex));
        this.lab_endurance.setText(Game.Tools.UnitConvert(baseConfig.baseres));

        var skeletonPath = baseConfig.fairyavatar;
        if(this.skeletonPath != skeletonPath){
        	this.skeletonPath = skeletonPath;
        	this.addRoleSpine(this.node_role, skeletonPath);
        }
        

        for (var i = 0; i < this.node_color.length; i++) {
        	var select_color = this.node_color[i].getChildByName('Sprite_select');
        	select_color.active = false;
        	if(this._color == (i + 1)){
        		select_color.active = true;
        	}
        }

    },
    addRoleSpine(parent, Res) {
        var spineNode = parent.getChildByName('sp_player');
        Game.ResController.LoadSpine(Res, function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {

                spineNode.getComponent("sp.Skeleton").skeletonData = asset;
                spineNode.getComponent("sp.Skeleton").setAnimation(0, Game.Define.MONSTER_ANIMA_STATE.IDLE, true);
            }
        }.bind(this));

    },
    refreshTableView(isRelod) {
    	for (var i = 0; i < this._fairyList.length; i++) {
    		this._fairyList[i].selected = false;
    		if(this._fairyId == this._fairyList[i].id){
    			this._fairyList[i].selected = true;
    		}
    	}
		this._fairyList = Game._.sortBy(this._fairyList, function (info) {
            return info.id;
        });
		var callback = function (id) {
            this.fairyClickedCallback(id, this);
        }.bind(this);

        if(isRelod){
        	 this.tableView.reloadTableView(this._fairyList.length, { array: this._fairyList, target: this, callback: callback});
        }else{
        	this.tableView.initTableView(this._fairyList.length, { array: this._fairyList, target: this, callback: callback});
        }
       
    },
    fairyClickedCallback(fairyId){
    	if (fairyId && fairyId != this._fairyId){
    		this._fairyId = fairyId;
    		this.refreshView(true);
    	}
    },
    onTouchSelectColor(evnet,tab){
    	tab = parseInt(tab);
    	if(this._color != tab){
    		this._color = tab;
    		this.refreshView();
    	}
    },
});
