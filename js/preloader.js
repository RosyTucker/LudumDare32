function Preloader(game)
{
    this.game = game;
}

Preloader.prototype.preload = function() {
    var inGameState = new InGameState(this.game);
    var gameOverState = new GameOverState(this.game);
    inGameState.preload();
    gameOverState.preload();
    this.game.state.add('inGame', inGameState);
    this.game.state.add('gameOver', gameOverState);
};

Preloader.prototype.create = function() {
    this.game.state.start('inGame');
};