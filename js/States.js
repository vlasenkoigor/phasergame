/**
 * Created by i.vlasenko on 18.04.2016.
 */
/** Boot State **/
function Boot() {}
Boot.prototype = {
    preload: function() {
        this.load.image('background', 'assets/background.png');
        this.load.image('ground1', 'assets/ground1.png');
        this.load.image('ground2', 'assets/ground2.png');
        this.load.image('block', 'assets/block.png');
        this.load.image('question', 'assets/question.png');
        this.load.image('explosion', 'assets/explosion.png');
        this.load.image('smoke', 'assets/smoke.png');
        this.game.load.spritesheet('button-simple', 'assets/button-simple.png', 200, 80);
        this.game.load.spritesheet('button-close', 'assets/button-close.png', 80, 80);
        this.game.load.spritesheet('player', 'assets/player.png', 151, 57);
    },
    create: function() {
        this.game.state.start('menu');
    }
};

/**Menu state**/
function Menu() {}

Menu.prototype = {
    create: function() {
        this.background = this.game.add.tileSprite(0,0,1024, 768,'background');
        this.button = game.add.button(this.game.world.centerX - 100, 400, 'button-simple', this.startGame, this, 2, 1, 0);
        game.add.text(this.button.x + 50, this.button.y + 25, "START", { font: "32px Arial", fill: "#FFFFFF", align: "center"});
   },

    startGame : function () {
        this.game.state.start('play');
    }
};

/**Play State**/
function Play() {}

Play.prototype = {
    create : function () {
        //init Arcade Physic
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        //gameover flag
        this.gameover = false;

        // set gravity
        this.game.physics.arcade.gravity.y = 1200;

        this.background = this.game.add.tileSprite(0,0,1024, 768,'background');
        this.background.autoScroll(config.scrollSpeed.background,0);

        this.ground1 = this.game.add.tileSprite(0,this.game.world.height - 64,1024, 64,'ground1');
        this.ground1.autoScroll(config.scrollSpeed.ground1,0);

        //create pipes group
        this.pipes = this.game.add.group();

        this.ground2 = this.game.add.tileSprite(0,this.game.world.height - 32,1024, 32,'ground2');
        this.ground2.autoScroll(config.scrollSpeed.ground2,0);

        //enable global physics
        this.game.physics.enable(this.ground2, Phaser.Physics.ARCADE);
        this.ground2.body.immovable = true;
        this.ground2.body.allowGravity = false;

        //Player object
        this.player = this.game.player = new Player(this.game, 150, 300);
        this.game.add.existing(this.player);

        //player score
        this.game.score = 0;
        this.scoreLabel = this.game.add.text(25,  25, "Score : ", { font: "32px Arial", fill: "#FFFFFF", align: "center"});

        //close button
        game.add.button(this.game.world.width - 110, 25, 'button-close', this.closeGame, this, 1, 2, 0);

        //pipe generator ticker
        this.ticker = this.game.time.events.loop(Phaser.Timer.SECOND * 3, this.createPipe, this);
        this.ticker.timer.start();

        //start moving up when down the input
        game.input.onDown.add(this.player.gas, this.player);

        //start moving down when up the input
        game.input.onUp.add(this.player.stopGas, this.player);

        //create first pipe immediately
        this.createPipe();
    },

    update : function () {

        this.scoreLabel.setText("Score : " + this.game.score);

        if (!this.gameover)
        {
            this.performCollide();
        } else {
            //go to game over state while player reaches floor
            if (this.player.body.onFloor())
            {
                this.game.state.start('gameOver');
            }
        }
    },

    render : function () {
        // game.debug.geom(this.player.getBounds());

        // this.pipes.forEach(function (pipe) {
            // game.debug.geom(pipe.topPipe.getBounds());
            // game.debug.geom(pipe.middlePipe.getBounds());
            // game.debug.geom(pipe.bottomPipe.getBounds());

            // game.debug.body(pipe.topExpression);
            // game.debug.body(pipe.bottomExpression);

        // })
    },

    //check all collides and overlaps
    performCollide : function () {
        var that = this;
        this.game.physics.arcade.collide(this.player, that.ground2, that.collisionHandler,null, that);
        this.pipes.forEach(function (pipe) {
            //detect collides with solid blocks
            that.game.physics.arcade.collide(that.player, pipe.topPipe, that.collisionHandler,null, that);
            that.game.physics.arcade.collide(that.player, pipe.middlePipe, that.collisionHandler,null, that);
            that.game.physics.arcade.collide(that.player, pipe.bottomPipe, that.collisionHandler,null, that);

            //detect expression overlaps
            that.game.physics.arcade.overlap(that.player, pipe.topExpression, that.expressionCollide,null, that);
            that.game.physics.arcade.overlap(that.player, pipe.bottomExpression, that.expressionCollide,null, that);

        })
    },

    createPipe : function () {
        new Pipe(this.game, this.pipes);
    },

    //expression overlap handler
    expressionCollide : function (player, s) {
        if (s.verify === true)
        {
            this.score();
            s.destroy();
        } else if (s.verify === false) {
            this.collisionHandler();
        }
    },

    //solid block collision handler
    collisionHandler : function () {
        this.gameover = true;
        this.player.boom();
        this.background.stopScroll();
        this.ground1.stopScroll();
        this.ground2.stopScroll();
        this.pipes.callAll('stop');
        this.ticker.timer.stop();
    },


    //close btn click handler
    closeGame : function () {
        this.game.state.start('menu');
    },

    score : function () {
        this.game.score++;
    }
};

/** GameOver state - show result and offer play more*/
function GameOver() {}

GameOver.prototype = {
    create : function () {
        this.game.add.tileSprite(0,0,1024, 768,'background');
        game.add.text(this.game.world.centerX - 70, this.game.world.centerY - 200,  "Score : " + this.game.score, { font: "40px Arial", fill: "#FFFFFF", align: "center"});

        game.add.button(this.game.world.centerX - 350, this.game.world.centerY, 'button-simple', this.play, this, 2, 1, 0);
        game.add.text(this.game.world.centerX - 325, this.game.world.centerY + 25,  "Play again", { font: "32px Arial", fill: "#FFFFFF", align: "center"});
        game.add.button(this.game.world.centerX + 150, this.game.world.centerY, 'button-simple', this.exit, this, 2, 1, 0);
        game.add.text(this.game.world.centerX + 220, this.game.world.centerY + 25,  "Exit", { font: "32px Arial", fill: "#FFFFFF", align: "center"});
    },

    play : function () {
        this.game.state.start('play');
    },

    exit : function () {
        this.game.state.start('menu');
    }
};