
WebFontConfig = {
    google: {
        families: ['Revalia']
    }

};

MenuState = function(game){
    this.totalKills = 0;
    this.game = game;
};

MenuState.prototype.preload = function(){
    this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
};

MenuState.prototype.create = function(){
    this.ground = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'ground');
    this.createText();
};

MenuState.prototype.update = function (){
    if(this.game.input.activePointer.isDown){
        this.game.state.start('inGame');
    }
};

MenuState.prototype.render = function() {
};

MenuState.prototype.createText = function () {
    var text = this.game.add.text(410,300, 'You\'re Toast! \n Click to Play!');
    text.anchor.setTo(0.5);

    text.font = 'Revalia';
    text.fontWeight = 800;
    text.fontSize = 60;
    text.align = 'center';
    text.fill = '#A7DCC7';
    text.inputEnabled = true;
    text.events.onInputOver.add(function(){
        text.fill = '#B8D973';
    }, this);
    text.events.onInputOut.add(function(){
        text.fill = '#A7DCC7';
    }, this);

};
