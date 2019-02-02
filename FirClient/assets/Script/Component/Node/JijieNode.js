const Game = require('../../Game');


cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_name: cc.Label_,
        label_country: cc.Label_,
        label_fight: cc.Label_,
        sprite_icon: cc.Sprite_,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    onEnable(){
        this.updateModel();
        this.updateView()
    },
    onDisable(){},

    updateModel(){
        this.clashobj = this._data.clashobj;
    },

    updateView(){
        var countryid = Game.UserModel.GetCountry();

        this.label_name.setText(`${this.clashobj.name}【${Game.UserModel.GetCountryName(countryid)}】`);
        this.label_fight.setText(this.clashobj.enemyfight);
        var occupation = this.getOccupation();
        this.sprite_icon.SetSprite(Game.UserModel.GetProfessionIcon(occupation));
    },

    getOccupation(){
        var face = this.clashobj.face;
        let occupation = Game.UserDefine.PROFESSION.PROFESSION_JIANSHI;
        if (face >= 10 && face < 20) {
            occupation = Game.UserDefine.PROFESSION.PROFESSION_JIANSHI;
        }
        else if (face >= 20 && face < 30) {
            occupation = Game.UserDefine.PROFESSION.PROFESSION_MOFASHI;
        }
        else if (face >= 30 && face < 40) {
            occupation = Game.UserDefine.PROFESSION.PROFESSION_PAONIANG;
        }
        return occupation;
    },

    onClickJijie(){
        Game.JijieModel.joinJijie(this._data.guid);
        this.onClose();
    },

    // update (dt) {},
});
