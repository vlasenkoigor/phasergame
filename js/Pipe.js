/**
 * Pipe
 * @param game
 * @param parent
 * @constructor
 */
function Pipe(game, parent) {
    Phaser.Group.call(this, game, parent);
    var middleY = this.game.rnd.integerInRange(250, game.world.height-370),
        trueExpression = this.game.rnd.integerInRange(1, 2), //1 - top, 2 - bottom
        randNumber1 = this.game.rnd.integerInRange(2, 100),
        randNumber2 = this.game.rnd.integerInRange(2, 100),
        //Math expression expected to be: randNumber + 1 = number
        text1 = randNumber1 + "+1=" + (trueExpression==1 ? randNumber1 +1 : this.game.rnd.integerInRange(1, randNumber1-1)),
        text2 = randNumber2 + "+1=" + (trueExpression==2 ? randNumber2 +1 : this.game.rnd.integerInRange( randNumber1+1, 200));

    //solid blocks
    this.topPipe    = new Block(this.game, 0, 0, 0);
    this.middlePipe = new Block(this.game, 0, middleY, 1);
    this.bottomPipe = new Block(this.game, 0, game.world.height-110, 1);

    this.add(this.topPipe);
    this.add(this.middlePipe);
    this.add(this.bottomPipe);

    //Math expressions
    this.topExpression    = new Expression(game,-70, 110 + (middleY - 110) / 2 - 30 ,trueExpression==1, text1);
    this.bottomExpression = new Expression(game,-70, middleY + (game.world.height - middleY ) / 2  -30, trueExpression==2, text2);

    this.add(this.topExpression);
    this.add(this.bottomExpression);

    //put pipe at the end of the world
    this.x = game.world.width + 50;

    //set physic props to children
    this.setAll('body.allowGravity', false);
    this.setAll('body.immovable', true);
    this.setAll('body.velocity.x', config.pipe.VELOCITY);
}

Pipe.prototype = Object.create(Phaser.Group.prototype);
Pipe.prototype.constructor = Pipe;

Pipe.prototype.stop = function () {
    this.setAll('body.velocity.x', 0);
    this.setAll('body.immovable', false);
};

/**
 * Block solid block of the Pipe
 * @param game
 * @param x
 * @param y
 * @constructor
 */
function Block (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'block');
    this.game.physics.arcade.enableBody(this);
}
Block.prototype = Object.create(Phaser.Sprite.prototype);
Block.prototype.constructor = Block;

/**
 * Math expression
 * @param game
 * @param x
 * @param y
 * @param verify
 * @param text
 * @constructor
 */
function Expression(game, x, y, verify, text){
    Phaser.Sprite.call(this, game, x, y, 'question');
    this.addChild(new Phaser.Text(game,  60, 15, text, { font: "28px Arial", fill: "#FFFFFF", align: "center"}));
    game.physics.arcade.enableBody(this);
    //is expression valid or not
    this.verify = verify;
    //set bounding rect little bit smaller
    this.body.setSize(180, 50, 50, 10);
}

Expression.prototype = Object.create(Phaser.Sprite.prototype);
Expression.prototype.constructor = Phaser.Sprite;
