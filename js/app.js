var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'stage');

// Game States
game.state.add('boot', Boot);
game.state.add('menu', Menu);
game.state.add('play', Play);
game.state.add('gameOver', GameOver);

//start game from boot state
game.state.start('boot');



