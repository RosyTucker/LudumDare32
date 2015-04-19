
WebFontConfig = {
    google: {
        families: ['Revalia']
    }

};

GameOverState = function(game){
    this.didWin = false;
    this.game = game;
};

GameOverState.prototype.preload = function(){
    this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
};

GameOverState.prototype.create = function(){
    this.game.stage.setBackgroundColor('#000000');
    this.createText();
};

GameOverState.prototype.update = function (){
    if(this.game.input.activePointer.isDown){
        this.game.state.start('inGame');
    }
};

GameOverState.prototype.render = function() {
};

GameOverState.prototype.createText = function () {
    var result = 'Lost :(';
    if(this.didWin) result = 'Won :D';
    var text = this.game.add.text(400,300, "Game Over \n You " + result + '\n\n Click to play again!');
    text.anchor.setTo(0.5);

    text.font = 'Revalia';
    text.fontSize = 60;

    text.align = 'center';
    text.fill = '#FFFFFF';
    text.stroke = '#000000';
    text.strokeThickness = 2;
    text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

    text.inputEnabled = true;
    text.events.onInputOver.add(function(){
        text.fill = '#6A665A';
    }, this);
    text.events.onInputOut.add(function(){
        text.fill = '#FFFFFF';
    }, this);

};
