const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_musicvolume: cc.Node,
        node_soundvolume: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad(){
        this.slider_music = this.node_musicvolume.getComponent(cc.Slider);
        this.progress_music = this.node_musicvolume.getComponent(cc.ProgressBar);

        this.slider_sound = this.node_soundvolume.getComponent(cc.Slider);
        this.progress_sound = this.node_soundvolume.getComponent(cc.ProgressBar);

        this.node_musicvolume.on('slide',this.onChangeMusicVolume.bind(this));
        this.node_soundvolume.on('slide',this.onChangeSoundVolume.bind(this));
    },

    onEnable(){
        var musicvolume = Game.AudioController.GetMusicVolume();
        this.progress_music.progress = musicvolume;
        this.slider_music.progress = musicvolume;

        var soundvolume = Game.AudioController.GetEffectsVolume();
        this.progress_sound.progress = soundvolume;
        this.slider_sound.progress = soundvolume;

        this.origin_musicvolume = musicvolume;
        this.origin_aoundvolume = soundvolume;
    },

    setMusicVolume(volume){
        this.progress_music.progress = volume;
        this.slider_music.progress = volume;
        Game.AudioController.SetMusicVolume(volume);
    },

    setEffectsVolume(volume){
        this.progress_sound.progress = volume;
        this.slider_sound.progress = volume;
        Game.AudioController.SetEffectsVolume(volume);
    },

    onChangeMusicVolume(){
        var progress = this.slider_music.progress;
        this.progress_music.progress = progress;
        Game.AudioController.SetMusicVolume(progress);
    },

    onChangeSoundVolume(){
        var progress = this.slider_sound.progress;
        this.progress_sound.progress = progress;
        Game.AudioController.SetEffectsVolume(progress);
    },

    onClickLogOff(){
        // var title = '注销';
        // var desc = '是否确定注销并返回登录页面？'
        // Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
        //     {
        //         name: '确认',
        //         handler: function () {
        //             Game.ViewController.ClearViewData();
        //             Game.NetWorkController.Close();
        //             cc.director.loadScene("LoadScene");
        //         }.bind(this),
        //     },
        //     {
        //         name: '取消'
        //     }
        // ]);
    },

    onClickSave(){
        this.onClose();
    },

    onClickCancel(){
        this.onClose();
    },

    // update (dt) {},
});
