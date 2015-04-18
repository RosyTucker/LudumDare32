

GameOverState = function(game){
    this.didWin = false;
    this.game = game;
};

GameOverState.prototype.preload = function(){
};

GameOverState.prototype.create = function(){
    console.log('game over: ' + this.didWin);
};

GameOverState.prototype.update = function (){
};

GameOverState.prototype.render = function() {
};