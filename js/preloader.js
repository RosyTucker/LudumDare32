function Preloader(game)
{
    this.game = game;
}

Preloader.prototype.preload = function() {
    var inGameState = new InGameState(this.game);
    inGameState.preload();
    this.game.state.add('inGame', inGameState);
};

Preloader.prototype.create = function() {
    this.game.state.start('inGame');
};