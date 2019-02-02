const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        name_music: { default: '' },
        playing: { default: false },
        loop: { default: false },
        passed: { default: 1 }
    },
    onEnable: function () {
        this.playing = false;
    },
    onDisable: function () {
        if (this.name_music != '' && this.playing) {
            Game.AudioController.StopMusic();
        }
    },
    update: function (dt) {
        if (!this.playing && this.name_music != '') {
            this.passed += dt;
            if (this.passed > 1) {
                this.passed = 0;
                this.playing = Game.AudioController.PlayMusic(this.name_music, this.loop);
            }
        }
    }
    //====================  这是分割线  ====================
});
