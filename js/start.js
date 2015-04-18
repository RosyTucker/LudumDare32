$(function() {
    var game = new Phaser.Game(1100, 800, Phaser.AUTO, 'game0canvas-container', null, false, false);
    var preloader = new Preloader(game);
    game.state.add('preloader', preloader);
    game.state.start('preloader');
});