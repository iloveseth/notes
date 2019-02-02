const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_liliang: { default: null, type: cc.Label_ },
        Label_zhili: { default: null, type: cc.Label_ },
        Label_minjie: { default: null, type: cc.Label_ },
        Label_naili: { default: null, type: cc.Label_ },
        Label_zhushuxing: { default: null, type: cc.Label_ },
        Label_hp: { default: null, type: cc.Label_ },
        Label_mp: { default: null, type: cc.Label_ },
        Label_shanghai: { default: null, type: cc.Label_ },
        Label_hujia: { default: null, type: cc.Label_ },
        Label_wukang: { default: null, type: cc.Label_ },
        Label_mokang: { default: null, type: cc.Label_ },
        Label_baoji: { default: null, type: cc.Label_ },
        Label_mingzhong: { default: null, type: cc.Label_ },
        Label_shanbi: { default: null, type: cc.Label_ },
        Label_renxing: { default: null, type: cc.Label_ },
        Label_add_baojigailv: { default: null, type: cc.Label_ },
        Label_add_baojishanghai: { default: null, type: cc.Label_ },
        Label_add_hujia: { default: null, type: cc.Label_ },
        Label_add_wukang: { default: null, type: cc.Label_ },
        Label_add_mokang: { default: null, type: cc.Label_ },
        Label_add_mingzhong: { default: null, type: cc.Label_ },
        Label_add_shanbi: { default: null, type: cc.Label_ },
        Label_add_renxing: { default: null, type: cc.Label_ },
        Label_gongji_Soul: { default: null, type: cc.Label_ },
        Label_hp_Soul: { default: null, type: cc.Label_ },
        Label_baoji_Soul: { default: null, type: cc.Label_ },
        Label_hujia_Soul: { default: null, type: cc.Label_ },
        Label_wukang_Soul: { default: null, type: cc.Label_ },
        Label_mokang_Soul: { default: null, type: cc.Label_ },
        Label_shanbi_Soul: { default: null, type: cc.Label_ },
        Label_mp_Soul: { default: null, type: cc.Label_ },
        Label_zhushuxing_Soul: { default: null, type: cc.Label_ },
        Label_baoshi_Soul: { default: null, type: cc.Label_ },
        Scrollview_pro: { default: null, type: cc.ScrollView },
        Widget_pro: { default: null, type: cc.Widget },
    },

    onEnable() {
        this.updateView();
    },

    updateView() {
        this.Widget_pro.updateAlignment();
        this.Scrollview_pro.scrollToTop();

        let baseInfo = Game.UserModel.GetUserMainInfo().ba_info;
        let firtInfo = Game.UserModel.GetUserMainInfo().fi_info;
        let secondInfo = Game.UserModel.GetUserMainInfo().se_info;
        let thirdInfo = Game.UserModel.GetUserMainInfo().th_info;
        let godInfo = Game.UserModel.GetUserMainInfo().god_info;

        this.Label_hp.setText(`${baseInfo.hp}`);
        this.Label_mp.setText(`${baseInfo.mp}`);
        this.Label_shanghai.setText(`${baseInfo.minatt}-${baseInfo.maxatt}`);
        this.Label_hujia.setText(`${baseInfo.def}`);
        this.Label_add_baojishanghai.setText(`${(baseInfo.bangval * 100).toFixed(1)}%`);

        this.Label_liliang.setText(`${firtInfo.wdstr}`);
        this.Label_minjie.setText(`${firtInfo.wdint}`);
        this.Label_zhili.setText(`${firtInfo.wddex}`);
        this.Label_naili.setText(`${firtInfo.wdcon}`);

        this.Label_zhushuxing.setText(Game.UserModel.GetMainProps(Game.UserModel.GetUserOccupation()));

        this.Label_wukang.setText(`${secondInfo.pdef}`);
        this.Label_mingzhong.setText(`${secondInfo.accu}`);
        this.Label_baoji.setText(`${secondInfo.bang}`);
        this.Label_shanbi.setText(`${secondInfo.dodge}`);
        this.Label_mokang.setText(`${secondInfo.mdef}`);
        this.Label_renxing.setText(`${secondInfo.staypow}`);

        this.Label_add_hujia.setText(`${(thirdInfo.dam_reduce_per * 100).toFixed(1)}%`);
        this.Label_add_wukang.setText(`${(thirdInfo.pdam_reduce_per * 100).toFixed(1)}%`);
        this.Label_add_mokang.setText(`${(thirdInfo.mdam_reduce_per * 100).toFixed(1)}%`);
        this.Label_add_baojigailv.setText(`${(thirdInfo.bang_per * 100).toFixed(1)}%`);
        this.Label_add_mingzhong.setText(`${(thirdInfo.accu_per * 100).toFixed(1)}%`);
        this.Label_add_shanbi.setText(`${(thirdInfo.dodge_per * 100).toFixed(1)}%`);
        this.Label_add_renxing.setText(`${(thirdInfo.bangdef_per * 100).toFixed(1)}%`);

        this.Label_gongji_Soul.setText(`${(godInfo.dam_add_per * 100).toFixed(1)}%`);
        this.Label_hp_Soul.setText(`${(godInfo.hp_per * 100).toFixed(1)}%`);
        this.Label_baoji_Soul.setText(`${(godInfo.bang_per * 100).toFixed(1)}%`);
        this.Label_hujia_Soul.setText(`${(godInfo.def_per * 100).toFixed(1)}%`);
        this.Label_wukang_Soul.setText(`${(godInfo.pdef_per * 100).toFixed(1)}%`);
        this.Label_mokang_Soul.setText(`${(godInfo.mdef_per * 100).toFixed(1)}%`);
        this.Label_shanbi_Soul.setText(`${(godInfo.dodge_per * 100).toFixed(1)}%`);
        this.Label_mp_Soul.setText(`${(godInfo.mp_per * 100).toFixed(1)}%`);
        this.Label_zhushuxing_Soul.setText(`${(godInfo.main_prop_per * 100).toFixed(1)}%`);
        this.Label_baoshi_Soul.setText(`${(godInfo.stone_prop_per * 100).toFixed(1)}%`);
    },
});
