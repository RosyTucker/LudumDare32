InGameState = function(game){
    this.game = game
    this.FIRE_RATE = 175;
    this.enemiesTotal = 0;
    this.enemiesAlive = 0;
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
    this.game.load.image('ground', 'assets/ground.png');
};

InGameState.prototype.create = function(){
    this.game.world.setBounds(-550, -400, 1100, 800);
    this.ground = this.game.add.tileSprite(0, 0, 1100, 800, 'ground');
    this.ground.fixedToCamera = true;
    this.createPlayer();
    this.createWorkTops();
    this.createEnemies();
    this.game.camera.follow(this.player);
//    this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    this.game.camera.focusOnXY(0, 0);
    this.cursors = this.game.input.keyboard.createCursorKeys();
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

    this.game.physics.arcade.collide(this.player, this.worktops)
    this.game.physics.arcade.collide(this.worktops, this.enemyAmmo)
    this.game.physics.arcade.overlap(this.enemyAmmo, this.player, this.enemyShotHitPlayer, null, this);

    this.playerAmmo.forEachAlive(function(toast){
        if(this.game.physics.arcade.collide(this.worktops, toast)){
            var tween = this.game.add.tween(toast).to({alpha:0}, 300).start();
            tween.onComplete.add(function(){
                toast.kill();
                toast.alpha = 1;
            })
        }
    }, this);

    this.enemyAmmo.forEachAlive(function(toast){
        if(this.game.physics.arcade.collide(this.worktops, this.toast)){
            var tween = this.game.add.tween(toast).to({alpha:0}, 300).start();
            tween.onComplete.add(function(){
                toast.kill();
                toast.alpha = 1;
            })
        }
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

    if (this.currentSpeed > 0)
    {
        this.game.physics.arcade.velocityFromRotation(this.player.rotation, this.currentSpeed, this.player.body.velocity);
    }

    this.ground.tilePosition.x = -this.game.camera.x;
    this.ground.tilePosition.y = -this.game.camera.y;

    if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
        this.fire();
    }else if(this.playerAnimation.loopCount > this.numLoops){
        this.numLoops ++;
        this.fire();
    }
};

InGameState.prototype.enemyShotHitPlayer = function(player, bullet) {
    bullet.kill();
};

InGameState.prototype.playerShotHitEnemy = function(player, bullet) {
    bullet.kill();
    var destroyed = this.enemies[player.name].damage();
    if (destroyed){
        //do something
    }
};

InGameState.prototype.fire = function () {
    if (this.game.time.now > this.nextFire && this.playerAmmo.countDead() > 0)
    {
        this.nextFire = this.game.time.now + this.FIRE_RATE;
        var toast = this.playerAmmo.getFirstExists(false);
        toast.reset(this.player.x, this.player.y);
        toast.lifespan = 2000;
        toast.rotation = this.player.rotation;
        this.game.physics.arcade.velocityFromRotation(this.player.rotation, 400, toast.body.velocity);
        this.player.animations.stop(null, true);
        this.player.play('toast')
    }
}

InGameState.prototype.render = function() {
//    this.game.debug.text('Active Bullets: ' + this.playerAmmo.countLiving() + ' / ' + this.playerAmmo.length, 32, 32);
    this.game.debug.text('Enemies: ' + this.enemiesAlive + ' / ' + this.enemiesTotal, 32, 32);
}


InGameState.prototype.createPlayer = function () {
    this.player = this.game.add.sprite(0, -250,'player', 'player1.png');
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
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(this.player.width, this.player.height * 2 + 20);

    this.playerAmmo = this.game.add.group();
    this.playerAmmo.enableBody = true;
    this.playerAmmo.physicsBodyType = Phaser.Physics.ARCADE;
    this.playerAmmo.createMultiple(10, 'toast', 0, false);
    this.playerAmmo.setAll('anchor.x', 0.5);
    this.playerAmmo.setAll('anchor.y', 0.5);
    this.playerAmmo.setAll('outOfBoundsKill', true);
    this.playerAmmo.setAll('checkWorldBounds', true);
    console.log('player Created');
    this.player.play('toast');
};

InGameState.prototype.createWorkTops = function() {
    this.worktops = this.game.add.group(undefined, 'group', false, true, Phaser.Physics.ARCADE);
    var cabinet = this.worktops.create(-550, -400,'cabinet');
    cabinet.body.immovable = true;
    this.worktops.create(-550 + cabinet.width, -400,'sink').body.immovable = true;
    this.worktops.create(-550 + (cabinet.width*2), -400,'drainingBoard').body.immovable = true;
    this.worktops.create(-550 + (cabinet.width*3), -400,'cabinet').body.immovable = true;
    this.worktops.create(-550 + (cabinet.width*4), -400,'cabinet2').body.immovable = true;
    this.worktops.create(-550 + (cabinet.width*5), -400,'oven').body.immovable = true;
    this.worktops.create(-550 + (cabinet.width*6), -400,'cabinet').body.immovable = true;
    this.worktops.create(-550, -400 + cabinet.height,'cabinet').body.immovable = true;
    this.worktops.create(-550, -400 + (cabinet.height * 2),'cabinet').body.immovable = true;
    this.worktops.create(-550, -400 + (cabinet.height* 3),'fridge').body.immovable = true;
    this.worktops.create(-550, -400 + (cabinet.height* 4),'bin').body.immovable = true;
};


InGameState.prototype.createEnemies = function () {
    this.enemyAmmo = this.game.add.group();
    this.enemyAmmo.enableBody = true;
    this.enemyAmmo.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyAmmo.createMultiple(100, 'toast');

    this.enemyAmmo.setAll('anchor.x', 0.5);
    this.enemyAmmo.setAll('anchor.y', 0.5);
    this.enemyAmmo.setAll('outOfBoundsKill', true);
    this.enemyAmmo.setAll('checkWorldBounds', true);

    this.enemies = [];
    this.enemiesTotal = 10;
    this.enemiesAlive = 10;
    for (var i = 0; i < this.enemiesTotal; i++){
        this.enemies.push(new Enemy(this.enemiesTotal, i, this.game, this.player, this.enemyAmmo));
    }
};