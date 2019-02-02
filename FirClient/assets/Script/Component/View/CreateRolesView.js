// CreateRolesView.js
const Game = require('../../Game');
const CreateRolesState = {
	JIANSHI_TABLE: 1,
	MOFASHI_TABLE: 2,
	PAONIANG_TABLE: 3,
}

const thisLocalZOrder = {
	zOrder1: 1,           //最内层     
	zOrder2: 2,           //中间层 
	zOrder3: 3,           //最外层       
}

const tips = {
	[12]: '角色名称重复！',
	[39]: '角色名称长度太长或为空，无法创建！',
	[40]: '角色名称包含非法字符，无法创建!',
	[41]: '角色face错误！',
	[42]: '角色国家错误！',
	[43]: '角色名称重复！',
};

cc.Class({
	extends: cc.GameComponent,

	properties: {
		Role1: { default: null, type: cc.Node },
		Role2: { default: null, type: cc.Node },
		Role3: { default: null, type: cc.Node },
		Sprite_bg: { default: null, type: cc.Sprite_ },
		Label_name: { default: null, type: cc.Label_ },
		Sprite_tu: { default: null, type: cc.Sprite_ },
		Label_direction: { default: null, type: cc.Label_ },
		Label_describe: { default: null, type: cc.Label_ },
		Label_input: { default: null, type: cc.EditBox },
		Tip: { default: null, type: cc.Node },
        Sprite_left: { default: null, type: cc.Sprite_ },
        Sprite_fire_bg: { default: null, type: cc.Sprite_ },
		Sprite_ice_bg: { default: null, type: cc.Sprite_ },

		Sprites_platform: [cc.Sprite_],
		
		Sprite_light: cc.Sprite_,
	},

	onLoad() {
		this._state = 0;
		this.initData();
		this.initView();
	},

	onDestroy(){
		Game.NotificationController.Off(Game.Define.EVENT_KEY.ROLE_CREATE_RANDOMNAME,this,this.login_retRandomName);
	},

	onEnable() {
		// this.updateView();
		Game.GlobalModel.isFirstGame = true;
		Game.NetWorkController.AddBinaryListener(Game.Define.MSG_ID.stServerReturnLoginFailedCmd, this, this.onServerReturnLoginFailedCmd);		
	},

	onDisable() {
		Game.NetWorkController.RemoveBinaryListener(Game.Define.MSG_ID.stServerReturnLoginFailedCmd, this, this.onServerReturnLoginFailedCmd);
	},

	onServerReturnLoginFailedCmd(buffer){
		//建立cpp连接 成功 可以发消息了
		let result = Game.CppCmd.ParseServerReturnLoginFailedCmd(buffer);
		cc.log(result);
		this.showTips(tips[result.byReturnCode]);
	},

	initData() {
		this.PI = Math.acos(-1);
		this._unitAngle = 2*this.PI/3;
		this._angle = 0;
		this._animationDuration = 0.3;
		this._width = this.node.width;
	    this._height = this.node.height;
	    this._items = [0,this.Role1,this.Role2,this.Role3];
	    this.btn_effect = false;
	    this.node.on(cc.Node.EventType.TOUCH_START,this._onTouchBegan,this);
	    this.node.on(cc.Node.EventType.TOUCH_MOVE,this._onTouchMoved,this);
	    this.node.on(cc.Node.EventType.TOUCH_END,this._onTouchEnded,this);

        Game.NotificationController.On(Game.Define.EVENT_KEY.ROLE_CREATE_RANDOMNAME,this,this.login_retRandomName);
		this.onTouchRandomName();
	},
	initView() {
		this._campState = 0;	
		// this.updateCampView(2); //冰之国
		var country = Math.floor(Math.random() * 2);
		if(country == 0){
			this.updateCampView(1);
		}
		if(country == 1){
			this.updateCampView(2);
		}
		this._state = CreateRolesState.JIANSHI_TABLE;
        this.Sprite_left.node.scaleX = -1;
		this.addRoleSpine(this.Role1, "Animation/Npc/Jianke/Jianke");
		this.addRoleSpine(this.Role2, "Animation/Npc/Yujie/Yujie");
		this.addRoleSpine(this.Role3, "Animation/Npc/Paoniang/Paoniang");
		
	    this.updatePositionWithAnimation();
	},

	 _onTouchBegan: function (event, captureListeners) {
	 	if (this.btn_effect) {return false;}
	 	for (var i = 1; i < this._items.length; i++) {
	    	this._items[i].stopAllActions();
	    }
	    let touch = event.touch;

	    var position = this.node.convertToNodeSpace(touch.getLocation());
    	var rect     = cc.rect(0, 0, this._width, this._height);
	    if (cc.rectContainsPoint(rect, position)){
	        return true;
	    }
    	return false;
    },
	_onTouchMoved: function (event, captureListeners) {
		if (this.btn_effect) {return false;}
		let touch = event.touch;
		var angle = this.disToAngle(touch.getDelta().x);
		this._angle = this._angle + angle;
		this.updatePosition();
    },
    _onTouchEnded: function (event, captureListeners) {
    	if (this.btn_effect) {return false;}
    	let touch = event.touch;
    	let xDelta = touch.getLocation().x - touch.getStartLocation().x;

    	var loc = touch.getLocation();
		var loc_start = touch.getStartLocation();
		var distance = cc.Vec2.prototype.sub.call(loc,loc_start).mag();

	    this.rectify(xDelta>0);
		this.updatePositionWithAnimation();
		var curId = this.getCurrentState();
		if(distance < 20){//优先判断拖动，如果没有移动 按照点击处理
			[this.Role1,this.Role2,this.Role3].forEach((e,idx) => {
				var aabb = e.getBoundingBoxToWorld();
				var roleId = idx + 1;
				if(cc.rectContainsPoint(aabb,loc) && roleId != curId){
					if((roleId == 1 && curId == 2) || (roleId == 2 && curId == 3) || (roleId == 3 && curId == 1)){
						this.turn_left();
					}
					else{
						this.turn_right();
					}
				}
			});
		}
    },
	turn_left() {
		this.btn_effect = true
		this._angle = this._angle + this.PI*2/3;
		this.rectify(true);
		this.updatePositionWithAnimation();
	},
	turn_right() {
		this.btn_effect = true
		this._angle = this._angle - this.PI*2/3;
		this.rectify(false);
		this.updatePositionWithAnimation();
	},
	updatePosition(){
		var disY = this._height / 8;
	    var disX = this._width / 3;
	    for (var index = 1; index < this._items.length; index++) {
	    	var i = index - 1;
	    	var x = disX * Math.sin(i*this._unitAngle + this._angle);
	        var y = - disY * Math.cos(i*this._unitAngle + this._angle) + this.getAddPosY(index);
	        this._items[index].setPosition(cc.p(x, y));
	        this._items[index].setLocalZOrder(-y);
	       
	        this._items[index].setOpacity(192 + 63 * Math.cos(i*this._unitAngle + this._angle));
	        this._items[index].setScale(0.75 + 0.25 * Math.cos(i*this._unitAngle + this._angle));
	    }

	},
	rectify(forward) {
		var angle = this._angle;
    	while(angle < 0){
    		angle = angle + (this.PI * 2);
    	}
    	while (angle > this.PI * 2) {	
    		angle = angle - (this.PI * 2);
    	}
	    if (forward) {
	    	angle = (Math.floor((angle + this._unitAngle / 3*2) / this._unitAngle)) * this._unitAngle;
	    }else{
	    	angle = (Math.floor((angle + this._unitAngle / 3 ) / this._unitAngle)) * this._unitAngle;
	    }
	    this._angle = angle;
	},
	updatePositionWithAnimation(){
	    for (var i = 1; i < this._items.length; i++) {
	    	this._items[i].stopAllActions();
	    }
	    var disY = this._height / 8;
	    var disX = this._width / 3;
    
	    for (var index = 1; index < this._items.length; index++) {
	    	var i = index - 1;
	        var x = disX * Math.sin(i*this._unitAngle + this._angle);
	        var y = - disY * Math.cos(i*this._unitAngle + this._angle) + this.getAddPosY(index);
	  
	        var moveTo = cc.moveTo(this._animationDuration, x, y);
	        var fadeTo = cc.fadeTo(this._animationDuration, 192 + 63 * Math.cos(i*this._unitAngle + this._angle));
	        var scaleTo = cc.scaleTo(this._animationDuration, 0.75 + 0.25 * Math.cos(i*this._unitAngle + this._angle));
	        // 
	        var spawnTo = cc.spawn(moveTo,fadeTo,scaleTo);
	        this._items[index].runAction(spawnTo);
	        this._items[index].setLocalZOrder(-y);
	    }
	    this.node.runAction(cc.sequence( cc.delayTime(this._animationDuration),cc.callFunc(this.actionEndCallBack, this)));
	},
	getAddPosY(idx){
		var index = 0;
    	var _selectedItem = this.getCurrentState();
    	if (_selectedItem == 1) {
    		index = idx;
    	}else if(_selectedItem == 2){
    		if (idx == 1){
    			index = 3;
    		}else if(idx == 2){
    			index = 1;
    		}else{
    			index = 2;
    		}

    	}else{
    		if (idx == 1){
    			index = 2;
    		}else if(idx == 2){
    			index = 3;
    		}else{
    			index = 1;
    		}
    	}
    	return index * 30
	},
	fadeOutAction(type) {
		return cc.sequence(cc.fadeOut(0.1), cc.callFunc(this.setRoleInfo, this, type), cc.fadeIn(0.25));
	},
	actionEndCallBack(){
		this._state = this.getCurrentState();
		this.Tip.runAction(this.fadeOutAction(this._state));
		this.btn_effect = false;
	},
	getCurrentState(){
		//1,2,3
		var index = Math.floor((2 * this.PI - this._angle) / this._unitAngle + 0.1 * this._unitAngle);
    	index = (index + 300) % 3;
    	return index + 1;
	},
	disToAngle(dis){
		var width = this._width / 2;
    	return dis / width * this._unitAngle;
	},
	setRoleInfo(target, type) {
		switch (type) {
			case 1:
				this.Label_name.setText("狂暴战士");
				this.Label_direction.setText("专精：力量");
				this.Label_describe.setText("血液中充斥着无穷力量");
				break;
			case 2:
				this.Label_name.setText("星辰魔导");
				this.Label_direction.setText("专精：智力");
				this.Label_describe.setText("在宇宙中感知到独特能量");
				break;
			case 3:
				this.Label_name.setText("虹幕箭神");
				this.Label_direction.setText("专精：敏捷");
				this.Label_describe.setText("眼神如炬，弹无虚发");
				break;

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
	updateCampView(state) {
		if (state != this._campState) {
			this._campState = state;
			this.Sprite_fire_bg.node.active = false;
			this.Sprite_ice_bg.node.active = false;
			if (state == 1) {
				// 火之国
				
				this.Sprite_bg.SetSprite("Image/Map/map/04di");
				this.Sprite_fire_bg.node.active = true;

				this.Sprites_platform.forEach(e => {
					e.SetSprite('Image/UI/CreateRoleScene/createrole_img_basefire');
				});

				this.Sprite_light.SetSprite('Image/UI/CreateRoleScene/createrole_img_basefire1');
			} else if (state == 2) {
				// 冰之国
				
				this.Sprite_bg.SetSprite("Image/Map/map/img_zc_x_bj");
				this.Sprite_ice_bg.node.active = true;

				this.Sprites_platform.forEach(e => {
					e.SetSprite('Image/UI/CreateRoleScene/createrole_img_baseice');
					
					this.Sprite_light.SetSprite('Image/UI/CreateRoleScene/createrole_img_baseice1');
				});

			}
		}
	},
	login_retRandomName(t) {
		this.Label_input.string = t.name;
	},
	onTouchRight() {
		this.turn_right();
	},
	onTouchLeft() {
		this.turn_left();
	},
	onTouchFireCamp() {
		this.updateCampView(1);
	},
	onTouchIceCamp() {
		this.updateCampView(2);
	},
	onTouchRandomName() {
		Game.NetWorkController.SendProto('login.reqRandomName', {});
	},
	onTouchCreate() {
		var name = this.Label_input.string;
		if(!name){
			this.showTips('角色名称不能为空！');
			return;
		}
		var msg = {};
		msg.name = this.Label_input.string;
		msg.country = this._campState;
		var face = [0, 10, 21, 31];
		msg.face = face[this._state];
		Game.NetWorkController.SendProto('login.reqCreateNewRoleUser', msg);
	},
});
