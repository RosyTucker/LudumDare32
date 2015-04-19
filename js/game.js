InGameState = function(game){
    this.game = game;
    this.FIRE_RATE = 175;
    this.currentSpeed = 0;
    this.numLoops = 0;
    this.nextFire = 0;
};

InGameState.prototype.preload = function(){
    this.game.load.image('sink', 'assets/sink.png');
    this.game.load.image('bin', 'assets/bin.png');
    this.game.load.image('cabinet2', 'assets/cabinet2.png');
    this.game.load.image('fridge', 'assets/fridge.png');
    this.game.load.image('drainingBoard', 'assets/drainingBoard.png');
    this.game.load.image('cabinet', 'assets/cabinet.png');
    this.game.load.atlas('player', 'assets/player/player.png', 'assets/player/player.json');
    this.game.load.image('logo', 'assets/logo.png');
    this.game.load.image('oven', 'assets/oven.png');
    this.game.load.image('toast', 'assets/toast.png');
    this.game.load.image('broccoli', 'assets/broccoli.png');
    this.game.load.image('explosion', 'assets/jamExplosion.png');
    this.game.load.image('enemy', 'assets/fryingPan.png');
    this.game.load.image('ground', 'assets/ground.png');
    this.game.load.audio('splodge', 'assets/sounds/splodge.m4a');
    this.game.load.audio('fire', 'assets/sounds/fire.m4a');
    this.game.load.audio('shuffle', 'assets/sounds/shuffle.m4a');
    this.game.load.audio('hit', 'assets/sounds/hit.m4a');
    this.game.load.audio('music', 'assets/sounds/music.m4a');
};

InGameState.prototype.create = function(){
    this.game.world.setBounds(0, 0, 1600, 1200);
    this.ground = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'ground');
    this.ground.fixedToCamera = true;
    this.kills = 0;
    this.createPlayer();
    this.createWorkTops();
    this.createEnemies();
    this.splodgefx = this.game.add.audio('splodge');
    this.firefx = this.game.add.audio('fire');
    this.shufflefx = this.game.add.audio('shuffle');
    this.hitfx = this.game.add.audio('hit');
    this.explosions = this.game.add.group();
    this.explosions.createMultiple(10, 'explosion');
    console.log(this.explosions);
    this.game.camera.follow(this.player);
    this.game.camera.focusOnXY(0, 0);
    this.cursors = this.game.input.keyboard.createCursorKeys();
    if(!this.music) {
        this.music = this.game.add.audio('music');
        this.music.play('', 0, 0.5, true);
    }
};

InGameState.prototype.update = function (){
    this.enemiesAlive = 0;

    for (var i = 0; i < this.enemies.length; i++)
    {
        if (this.enemies[i].alive)
        {
            this.enemiesAlive++;
            this.game.physics.arcade.collide(this.worktops, this.enemies[i].sprite)
            this.game.physics.arcade.collide(this.player, this.enemies[i].sprite);
            this.game.physics.arcade.overlap(this.playerAmmo, this.enemies[i].sprite, this.playerShotHitEnemy, null, this);
            this.enemies[i].update();
        }
    }

    this.game.physics.arcade.collide(this.player, this.worktops);
    this.game.physics.arcade.overlap(this.enemyAmmo, this.player, this.enemyShotHitPlayer, null, this);
    this.game.physics.arcade.overlap(this.enemyAmmo, this.playerAmmo, this.enemyAmmoHitPlayerAmmo, null, this);

    this.playerAmmo.forEachAlive(function(ammo){
        this.killIfNeeded(ammo, this.enemyAmmo);
    }, this);
    this.enemyAmmo.forEach(function(ammo){
        this.killIfNeeded(ammo, this.playerAmmo);
    }, this);

    if (this.cursors.left.isDown){
        this.player.angle -= 4;
    }else if (this.cursors.right.isDown){
        this.player.angle += 4;
    }

    if (this.cursors.up.isDown){
        this.currentSpeed = 300;
    }else if (this.currentSpeed > 0){
        this.currentSpeed -= 4;
    }

    if (this.currentSpeed > 0){
        this.game.physics.arcade.velocityFromRotation(this.player.rotation, this.currentSpeed, this.player.body.velocity);
        this.shufflefx.play('',0,0.4,false, false);
    }else{
        this.shufflefx.pause();
    }

    this.ground.tilePosition.x = -this.game.camera.x;
    this.ground.tilePosition.y = -this.game.camera.y;

    if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
        this.fire();
    }else if(this.playerAnimation.loopCount > this.numLoops){
        this.numLoops ++;
        this.fire();
    }

    if(this.player.health === 0){
        this.game.state.states['gameOver'].totalKills = this.kills;
        this.game.state.start('gameOver');
    }

    if(this.enemiesAlive === 0){
        this.addEnemies(3);
        var total = this.enemiesTotal;
        this.enemies.forEach(function (enemy, index){
            enemy.reset(total, enemy.speed * 1.5, index);
        });
    }
};

InGameState.prototype.killIfNeeded = function(ammo) {
    if(this.game.physics.arcade.collide(ammo, this.worktops)){
        var tween = this.game.add.tween(ammo).to({alpha:0}, 300).start();
        tween.onComplete.add(function(){
            ammo.kill();
            ammo.alpha = 1;
        })
    }
};

InGameState.prototype.enemyAmmoHitPlayerAmmo = function(playerAmmo, enemyAmmo) {
    playerAmmo.kill();
    enemyAmmo.kill();
};

InGameState.prototype.enemyShotHitPlayer = function(player, ammo) {
    ammo.kill();
    this.player.health  = Math.max(0, this.player.health - 1);
};

InGameState.prototype.playerShotHitEnemy = function(enemy, ammo) {
    ammo.kill();
    var destroyed = this.enemies[enemy.name].damage();
    if (destroyed){
        this.kills++;
        var explosion = this.explosions.getFirstExists(false);
        explosion.scaleXY = 0.1;
        explosion.alpha = 1;
        explosion.reset(enemy.x, enemy.y);
        var tween = this.game.add.tween(explosion).to({scaleXY:1, alpha: 0}, 1000,
            Phaser.Easing.Sinusoidal.Out).start();
        this.splodgefx.play('',0,0.7,false);
        tween.onComplete.add(function(){
            explosion.kill();
        })
    }else{
        this.hitfx.play('',0,0.7,false);
    }
};

InGameState.prototype.fire = function () {
    if (this.game.time.now > this.nextFire && this.playerAmmo.countDead() > 0)
    {
        this.nextFire = this.game.time.now + this.FIRE_RATE;
        var toast = this.playerAmmo.getFirstExists(false);
        this.firefx.play('',0,0.15,false);
        toast.reset(this.player.x, this.player.y);
        toast.lifespan = 2000;
        toast.rotation = this.player.rotation;
        this.game.physics.arcade.velocityFromRotation(this.player.rotation, 400, toast.body.velocity);
        this.player.animations.stop(null, true);
        this.player.play('toast')
    }
};

InGameState.prototype.render = function() {
    this.game.debug.text('Enemies: ' + this.enemiesAlive + ' / ' + this.enemiesTotal + '    Health: ' + this.player.health + '     Total Kills: ' + this.kills, 32, 32);
};

InGameState.prototype.createPlayer = function () {
    this.player = this.game.add.sprite(0, 0,'player', 'player1.png');
    this.player.anchor.setTo(0.5, 0.5);
    this.playerAnimation = this.player.animations.add('toast', ['player1.png', 'player1.png','player1.png',
        'player2.png', 'player2.png', 'player2.png', 'player2.png', 'player2.png',
        'player3.png','player4.png', 'player5.png','player6.png',
        'player7.png', 'player8.png','player9.png', 'player10.png',
        'player11.png', 'player12.png', 'player13.png','player14.png',
        'player15.png', 'player16.png', 'player17.png', 'player18.png',
        'player19.png', 'player20.png', 'player21.png', 'player22.png',
        'player23.png', 'player24.png', 'player25.png', 'player26.png',
        'player27.png', 'player27.png', 'player27.png', 'player27.png',
        'player27.png', 'player27.png', 'player27.png', 'player27.png'], 5, true);

    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.drag.set(0.2);
    this.player.body.maxVelocity.setTo(400, 400);
    this.player.position = new Phaser.Point(600,250);
    this.player.health = 20;
    this.player.friction = 0.2;
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(this.player.width, this.player.height * 2 + 20);
    this.player.scale.setTo(0.8,0.8);
    this.playerAmmo = this.game.add.group();
    this.playerAmmo.enableBody = true;
    this.playerAmmo.physicsBodyType = Phaser.Physics.ARCADE;
    this.playerAmmo.createMultiple(10, 'toast', 0, false);
    this.playerAmmo.setAll('anchor.x', 0.5);
    this.playerAmmo.setAll('anchor.y', 0.5);
    this.playerAmmo.setAll('outOfBoundsKill', true);
    this.playerAmmo.setAll('checkWorldBounds', true);
    this.player.play('toast');
};

InGameState.prototype.createWorkTops = function() {
    this.worktops = this.game.add.group(undefined, 'group', false, true, Phaser.Physics.ARCADE);

    var cabinet = this.worktops.create(0, 0,'cabinet');
    cabinet.body.immovable = true;
    this.worktops.create(cabinet.width, 0,'sink').body.immovable = true;
    this.worktops.create(cabinet.width, 0,'sink').body.immovable = true;
    this.worktops.create((cabinet.width*2),0,'drainingBoard').body.immovable = true;
    this.worktops.create((cabinet.width*3),0,'cabinet').body.immovable = true;
    this.worktops.create((cabinet.width*4),0, 'cabinet2').body.immovable = true;
    this.worktops.create((cabinet.width*5), 0,'oven').body.immovable = true;
    this.worktops.create((cabinet.width*6), 0,'cabinet').body.immovable = true;
    this.worktops.create(0, cabinet.height,'cabinet').body.immovable = true;
    this.worktops.create(0, (cabinet.height * 2),'cabinet').body.immovable = true;
    this.worktops.create(0, (cabinet.height* 3),'fridge').body.immovable = true;
    this.worktops.create(0, (cabinet.height* 4),'bin').body.immovable = true;

    this.worktops.create((cabinet.width*3),  (cabinet.height * 3),'cabinet').body.immovable = true;
    this.worktops.create((cabinet.width*4),(cabinet.height * 4),'cabinet').body.immovable = true;
    this.worktops.create((cabinet.width*4),(cabinet.height * 3),'cabinet').body.immovable = true;
    this.worktops.create((cabinet.width*5),(cabinet.height * 4),'cabinet').body.immovable = true;
    this.worktops.create((cabinet.width*5),(cabinet.height * 3),'cabinet').body.immovable = true;
    this.worktops.create((cabinet.width*3),(cabinet.height * 4),'cabinet').body.immovable = true;
};

InGameState.prototype.createEnemies = function () {
    this.enemiesTotal = 0;
    this.enemiesAlive = 0;
    this.enemyAmmo = this.game.add.group();
    this.enemyAmmo.enableBody = true;
    this.enemyAmmo.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyAmmo.createMultiple(30, 'broccoli');
    this.enemyAmmo.setAll('anchor.x', 0.5);
    this.enemyAmmo.setAll('anchor.y', 0.5);
    this.enemyAmmo.setAll('outOfBoundsKill', true);
    this.enemies = [];
    this.addEnemies(10);
};

InGameState.prototype.addEnemies = function(number){
    for (var i = this.enemiesTotal; i < this.enemiesTotal + number; i++){
        this.enemies.push(new Enemy(this.enemiesTotal + number, i, this.game, this.player, this.enemyAmmo));
    }
    this.enemiesTotal += number;
    this.enemiesAlive += number;

};

Object.defineProperty(Phaser.Sprite.prototype, 'scaleXY', {
    get: function() {
        return this.scale.x;
    },
    set: function(v) {
        this.scale.set(v, v);
    }
});