Enemy = function (totalNum, index, game, player, bullets) {

    var x = (game.world.width/totalNum * (index + 0.75)) - game.world.width/2;
    var y = game.world.height/2;

    this.game = game;
    this.health = 3;
    this.player = player;
    this.bullets = bullets;
    this.fireRate = 1000;
    this.nextFire = 0;
    this.alive = true;
    console.log(x, y);
    this.sprite = game.add.sprite(x, y, 'toast');
    this.sprite.anchor.set(0.5);
    this.sprite.name = index.toString();

    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.immovable = false;
    this.sprite.body.bounce.setTo(1, 1);
    this.sprite.angle = game.rnd.angle();
};

Enemy.prototype.damage = function() {
    this.health -= 1;
    if (this.health <= 0){
        this.alive = false;
        this.sprite.kill();
        return true;
    }
    return false;
}

Enemy.prototype.update = function() {
    this.sprite.rotation = this.game.physics.arcade.moveToObject(this.sprite, this.player, 20);
    if (this.game.physics.arcade.distanceBetween(this.sprite, this.player) < 400) {
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0){
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
            bullet.reset(this.sprite.x, this.sprite.y);
            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
        }
    }
};
