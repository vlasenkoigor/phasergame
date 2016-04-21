/**
 * Player
 * @param game
 * @param x
 * @param y
 * @constructor
 */
function Player(game, x, y){
    Phaser.Sprite.call(this, game, x, y, 'player');

    this.animations.add('fly');
    this.animations.play('fly', 20, true);
    this.anchor.setTo(0.5, 0.5);

    //enable physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = true;
    this.body.collideWorldBounds = true;
    this.body.bounce.y = config.player.BOUNCE; //player bounces when it collides with solid objects

    //explosion frame
    this.boomSprite = this.addChild(game.make.sprite(0, 0, "explosion"));
    this.boomSprite.anchor.setTo(0.5, 0.5);
    this.boomSprite.visible = false;
    
    this.ACCELERATION = config.player.ACCELERATION;
    this.START_SPEED = config.player.START_SPEED;

    this.flying = false;
    this.smokeInterval = 50;
    this.nextSmoke = 0;

    this.events.onKilled.add(this.onKilled, this);
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;


Player.prototype.boom = function () {
    this.boomSprite.visible = true;
    this.kill();
};

//start flying up
Player.prototype.gas = function () {
    if (!this.alive) { return }
    this.game.add.tween(this).to({angle: -20}, 100).start();
    this.flying = true;
    this.body.velocity.y = this.START_SPEED;
    this.body.acceleration.y = this.ACCELERATION;
};

//stop flying
Player.prototype.stopGas = function () {
    this.flying = false;
    this.body.acceleration.y = 0;
};

//death handler
Player.prototype.onKilled = function() {
    this.exists = true;
    this.visible = true;
    this.animations.stop();
    this.body.bounce.y = 0;
};

Player.prototype.update = function () {
    if (!this.alive)
    {
        return;
    }
    //release smoke
    if (this.flying && this.game.time.now > this.nextSmoke)
    {
        this.nextSmoke = this.game.time.now + this.game.rnd.integerInRange(1, this.smokeInterval);
        this.game.add.existing(new Smoke(game, this.x -60, this.y+40));
    }
    if(this.angle < 0 && !this.flying) {
        this.angle += 2.5;
    }
};

function Smoke(game, x, y){
    Phaser.Sprite.call(this, game, x, y, 'smoke');
    var maxDuration = 200, //max input touchdown duration
        downDuration = game.input.activePointer.duration,
        coeff = downDuration > maxDuration ? 1 : downDuration / maxDuration,
        randFrac= this.game.rnd.frac();

    this.anchor.setTo(0.5, 0.5);

    //set scale depends down duration and rand coeff
    this.scale.setTo(0.2 + 0.8 * coeff * randFrac, 0.2 + 0.8 * randFrac);
    //tween smoke
    this.game.add.tween(this).to({alpha: 0}, 1000).start();
    this.game.add.tween(this).to({x: -100}, 600).start();
    this.game.add.tween(this).to({y: this.y + 50}, 600).start();
}

Smoke.prototype = Object.create(Phaser.Sprite.prototype);
Smoke.prototype.constructor = Smoke;



