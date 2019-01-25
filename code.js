/* global Phaser*/

const BGCOLORS = [0xF16745, 0xFFC65D, 0x7BC8A4, 0x4CC3D9, 0x93648D, 0x7C786A, 0x588C73, 0x8C4646, 0x2A5B84, 0x73503C];
const MH_POSITIONS = [224, 416];
const MH_XSTART = 128;
const MH_ANIMATIONS = ['top', 'bottom'];
const SHOWDEBUG = false;
const MH_XEND = 832;
const MH_VELOCITY = 50;

var game = new Phaser.Game(960, 640, Phaser.AUTO, "", {preload: preload, create: create, update: update, render: render});
var gameState = "";

var tunnelSpeed = 200; //  ...px/sec
var launchTimer = false;
var launchGap = 250; // px between each launch
var score = 0;
var newSize = 1;
var menuIsOpen = false;
var magnetHeadText, playGameText;
var tunnelTile, tintColor, magnetHead, stuffGroup, smokeEmitter, iceEmitter, goldEmitter, snowEmitter, snowTween, scoreText, stateText, shake, bgBar, progressBar, titleMusic, getReadySound, gameMusic,
slap, collectSound, gameVolume = 1, musicVolume = 1, pause_label, menu, resumeButton, musicButton, soundButton, musicButtonText, soundButtonText, optionsText, resumeText, restartButton, restartText;
var extraLifeSize = 1.35;




/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
/* P H A S E R   S T A T E   F U N C T I O N S */
/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */

function preload(){
    game.load.bitmapFont("titleFont100", "assets/test2.png", "assets/test2.fnt");
    game.load.bitmapFont("typeFont32", "assets/font3.png", "assets/font3.fnt");
    game.load.image("tunnelTile", "assets/iceTunnel.png");
    game.load.spritesheet("stuffSS", "assets/stuff.png", 64, 64);
    game.load.spritesheet("menuButtons", "assets/menuButtons.png", 64, 64);
    game.load.image("smoke", "assets/smoke.png");
    game.load.image("goldEmitter", "assets/goldParticle.png");
    game.load.image("iceEmitter", "assets/iceParticle.png");
    game.load.image("snowEmitter", "assets/snowParticle.png");
    game.load.image("snowBall", "assets/snow.png");
    game.load.image("cogWheel", "assets/CogwheelWhite.png");
    
    game.load.audio('title', 'assets/TitleScreen.wav');
    game.load.audio('getReady', 'assets/getReady.mp3');
    game.load.audio('gameMusic', 'assets/gameSong2.wav');
    game.load.audio('slap', 'assets/slap.wav');
    game.load.audio('collect', "assets/coin.mp3");
}

function create(){
    
    titleMusic = game.add.audio('title');
    titleMusic.loop = true;
    titleMusic.play();
    
    getReadySound = game.add.audio("getReady");
    gameMusic = game.add.audio("gameMusic");
    slap = game.add.audio("slap");
    collectSound = game.add.audio('collect');
    
    //music = gameMusic, titleMusic
    
    
    
    //sound effects = slap, collectSound, getReadySound
    
    
    
    
    
    tunnelTile = game.add.tileSprite(0,128,game.width,384,"tunnelTile");
    
    tunnelTile.kill();
    tintColor = BGCOLORS[(game.rnd.integerInRange(0, BGCOLORS.length - 1))];
            game.stage.backgroundColor = 0x75cfff;
    //tunnelTile.tint = tintColor;

    magnetHeadText = game.add.bitmapText(game.width/2, 96, "titleFont100", "AVALANCHE", 90);
    magnetHeadText.anchor.setTo(0.5);
    game.add.tween(magnetHeadText.scale).to( {x:1.2, y:1.2}, 2000, "Linear", true, 0, -1, true);
    
    playGameText = game.add.bitmapText(game.width/2, game.height/2 + 96, "typeFont32", "Tap to Play!", 32);
    playGameText.anchor.setTo(0.5);
    game.add.tween(playGameText.scale).to( {x:1.2, y:1.2}, 2000, "Linear", true, 0, -1, true);
    
    scoreText = game.add.bitmapText(game.width/2, game.height - 90, "typeFont32", "WORDS", 50);
    scoreText.anchor.setTo(0.5);
    
    //Get Ready, Game Over 
    stateText = game.add.bitmapText(game.width/2, game.height/2, "titleFont100", "GET READY",100);
    stateText.anchor.setTo(0.5);
    
    stuffGroup = game.add.group();
    stuffGroup.createMultiple(20, "stuffSS");
    stuffGroup.forEach(stuffInit);
    
    smokeEmitter = game.add.emitter(0,0,20);
    smokeEmitter.makeParticles("smoke");
    smokeEmitter.flow(1000, 30);
    smokeEmitter.minParticleSpeed.setTo(-40,-40);
    smokeEmitter.maxParticleSpeed.setTo(-300,-300);
    
    
    magnetHead = game.add.sprite(MH_XSTART, 416, "snowBall");
    magnetHead.anchor.setTo(0.5);
    magnetHead.frame = 5;
    game.physics.arcade.enable(magnetHead);
    magnetHead.data.side = 1;
    magnetHead.data.canFlip = true;
    magnetHead.data.canRetreat = true;
    
    
    snowEmitter = game.add.emitter(0,0,300);
    snowEmitter.makeParticles("snowEmitter");
    snowEmitter.minParticleScale = 0.4;
    snowEmitter.maxParticleScale = 1.5;
    snowEmitter.minParticleSpeed.setTo(-100, 10);
    snowEmitter.maxParticleSpeed.setTo(100, 200);
    snowEmitter.start(false, 5000, 130);
    snowTween = game.add.tween(snowEmitter).to( {x:game.width}, 1000, "Quad", true, 0, -1, true);
    
    iceEmitter = game.add.emitter(0,0,300);
    iceEmitter.makeParticles("iceEmitter");
    iceEmitter.minParticleScale = 0.8;
    iceEmitter.maxParticleScale = 3;
    iceEmitter.minParticleSpeed.setTo(-300, -300);
    iceEmitter.maxParticleSpeed.setTo(300, 300);
    iceEmitter.minParticleAlpha = 0.5;
    iceEmitter.maxParticleAlpha = 1;
    
    goldEmitter = game.add.emitter(0,0,300);
    goldEmitter.makeParticles("goldEmitter");
    goldEmitter.minParticleScale = 0.8;
    goldEmitter.maxParticleScale = 3;
    goldEmitter.minParticleSpeed.setTo(-300, -300);
    goldEmitter.maxParticleSpeed.setTo(300, 300);
    goldEmitter.minParticleAlpha = 0.5;
    goldEmitter.maxParticleAlpha = 1;

    
    //green : 0x33FF00
    
    bgBar = game.add.graphics(30, 610);
    bgBar.lineStyle(20, 0x404040);
    bgBar.lineTo(900, 0);
    
    progressBar = game.add.graphics(30, 610);
    progressBar.lineStyle(20, 0xFFFFFF);
    progressBar.lineTo(1, 0);
    updateProgressBar();
    
    
    
    game.input.onTap.add(onTapClick);
    
    
    var margin = 50;
  // and set the world's bounds according to the given margin
  var x = -margin;
  var y = -margin;
  var w = game.world.width + margin * 2;
  var h = game.world.height + margin * 2;
  // it's not necessary to increase height, we do it to keep uniformity
  game.world.setBounds(x, y, w, h);
  
  // we make sure camera is at position (0,0)
  game.world.camera.position.set(0);
    
    menu = game.add.graphics(-430,-270);
    menu.lineStyle(5, 0x000, 1);
    menu.beginFill(0x212121, 1);
    menu.drawRect(game.width/2, game.height/2, 860, 540);
    menu.kill();
    
    resumeButton = game.add.button((game.width/2)-200, 450, 'menuButtons', resumeGame, this, 0, 0);
    resumeButton.anchor.setTo(0.5);
    resumeButton.scale.setTo(1.2);
    resumeButton.kill();
    resumeText = game.add.text((game.width/2)-200, 510, 'Resume', { font: '24px Arial', fill: '#fff' });
    resumeText.anchor.setTo(0.5);
    resumeText.kill();
    
    restartButton = game.add.button((game.width/2)+200, 450, 'menuButtons', function(){startState("TITLE_SCREEN"); resumeGame();}, this, 1, 1);
    restartButton.anchor.setTo(0.5);
    restartButton.kill();
    restartText = game.add.text((game.width/2)+200, 510, 'Restart', { font: '24px Arial', fill: '#fff' });
    restartText.anchor.setTo(0.5);
    restartText.kill();
    
    musicButton = game.add.button((game.width/2)-200, 240, 'menuButtons', changeMusicVolume, this, 2, 2);
    musicButton.anchor.setTo(0.5);    
    musicButton.scale.setTo(1.5);
    musicButtonText = game.add.text((game.width/2)-200, 310, 'Music Volume', { font: '24px Arial', fill: '#fff' });
    musicButtonText.anchor.setTo(0.5);
    musicButton.kill();
    musicButtonText.kill();
    
    soundButton = game.add.button((game.width/2)+200, 240, 'menuButtons', changeSoundVolume, this, 2, 2);
    soundButton.anchor.setTo(0.5); 
    soundButton.scale.setTo(1.5);
    soundButtonText = game.add.text((game.width/2)+200, 310, 'SFX Volume', { font: '24px Arial', fill: '#fff' });
    soundButtonText.anchor.setTo(0.5);
    soundButton.kill();
    soundButtonText.kill();
    
    optionsText = game.add.text(game.width/2, 105, 'Options Menu', { font: '48px Helvetica', fill: '#fff', fontWeight: 'bold' });
    optionsText.anchor.setTo(0.5);
    optionsText.kill();
    
    pause_label = game.add.image(game.width - 40, 40, 'cogWheel');
    pause_label.anchor.setTo(0.5);
    pause_label.scale.setTo(0.8);
    pause_label.visible = true;
    pause_label.events.onInputUp.add(pauseGame);
    
    startState("TITLE_SCREEN");
    
}

function update(){
    switch(gameState){
        case "TITLE_SCREEN":
            break;
        case "GET_READY":
            updateSmokeEmitter();
            magnetHead.rotation += 0.05;
            break;
        case "PLAY_GAME":
            tunnelTile.tilePosition.x -= tunnelSpeed/60;
            
            if(magnetHead.data.side == 1){
                magnetHead.rotation += tunnelSpeed/2000;    
            }
            else{
                magnetHead.rotation -=tunnelSpeed/2000;
            }
            game.physics.arcade.overlap(magnetHead, stuffGroup, killMagnetHead);
            updateSmokeEmitter();
            
            if(magnetHead.x > MH_XEND){
                magnetHead.body.velocity.x = 0;
                magnetHead.x = MH_XEND;
            }
            break;
        case "GAME_OVER":
            break;
    }
}

function render(){
}



/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
/* S T A T E   F U N C T I O N S */
/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */


function startState(newState){
    switch(newState){
        case "TITLE_SCREEN":
            //end game
            magnetHead.kill();
            smokeEmitter.kill();
            smokeEmitter.killAll();
            stateText.kill();
            gameMusic.stop();
            
    
            //revive
            magnetHeadText.revive();
            playGameText.revive();
            
            //kill
            
            tunnelTile.kill();
            magnetHead.kill();
            smokeEmitter.kill();
            smokeEmitter.killAll();
            scoreText.kill();
            stateText.kill();
            stuffGroup.killAll();
            bgBar.alpha = 0;
            progressBar.visible = false;
            bgBar.kill();
            
            
             game.world.camera.position.set(0);
             game.world.camera.reset();
            newSize = 1;
            magnetHead.scale.setTo(1);
            tunnelSpeed = 150;
            score = 0;
            updateProgressBar();
            clearLaunchTimer();
            gameState = "TITLE_SCREEN";

            break;
        case "GET_READY":
            startSong();
            
            tunnelTile.revive();
            titleMusic.stop();
            progressBar.visible = true;
            bgBar.visible = true;
            game.add.tween(bgBar).to({alpha:1}, 800, "Linear", true);
            playGameText.kill();
            magnetHead.reset(-100, MH_POSITIONS[1]);
            scoreText.revive();
            scoreText.text = score;
            smokeEmitter.flow(1000, 40);
            magnetHead.body.velocity.x = 100;
            magnetHead.data.side = 1;
            startMagnetHeadPostion();
            updateSmokeEmitter();
            stateText.revive();
            stateText.text = "GET READY";
            stateText.scale.setTo(0);
            var zoomTween = game.add.tween(stateText.scale).to({x:1, y:1}, 1500, "Bounce", true);
            zoomTween.onComplete.add(function() { startState("PLAY_GAME")});

            gameState = "GET_READY";
            break;
        case "PLAY_GAME":
            //revive

            
            //kill
            stateText.kill();
            
            magnetHead.data.side = 1;
            startMagnetHeadPostion(); 
            
            setLaunchTimer(1000);                                                 ////    turn back on to turn on enemies
            
            gameState = "PLAY_GAME";
            break;
        case "GAME_OVER":
            //revive
            titleMusic.play();
            
            //kill
            magnetHead.kill();
            smokeEmitter.kill();
            smokeEmitter.killAll();
            stateText.kill();
            gameMusic.stop();
            
            
            clearLaunchTimer();
            newSize = 1;
            updateProgressBar();
            stateText.revive();
            stateText.text = "GAME OVER";
            stateText.scale.setTo(0);
            var gameOverTween = game.add.tween(stateText.scale).to({x:1, y:1}, 1500, "Bounce", true);
            gameOverTween.onComplete.add(function() { 
                startState("GAME_OVER_WAITING");
                scoreText.text = `You scored ${score} points!`;
            });
            
            
            gameState = "GAME_OVER";
            break;
        case "GAME_OVER_WAITING":
            game.add.tween(bgBar).to({alpha:0}, 800, "Linear", true);
            var changeStateTween = game.add.tween(stateText.scale).to({x:0, y:0}, 800, "Linear", true);
            changeStateTween.onComplete.add(function() {
                stateText.text = "Click to play again!";
                changeStateTween = game.add.tween(stateText.scale).to({x:0.8, y:0.8}, 800, "Linear", true);
            });
            gameState = "GAME_OVER_WAITING";
            break;
    }
    console.log(`game state = ${gameState}`);
}

/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
/* C U S T O M   F U N C T I O N S */
/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */


function onTapClick(pointer, doubleTap){
    //console.log("Screen was tapped!");
    if(!menuIsOpen){
        console.log("pointer.x = " + pointer.x);
        if(pointer.x >= game.width-70 && pointer.y <= 70){
            pauseGame();
        }
        else{
            if(gameState === "TITLE_SCREEN"){
                startState("GET_READY");
            }
            else if(gameState === "GAME_OVER_WAITING"){
                startState("TITLE_SCREEN");
            }
            else if(gameState === "PLAY_GAME"){
                //flip the 'side' variable      1 => 0 and 0 => 1
                
                if(pointer.x > game.width/2){
                //Tap on Right side. FLIP
                    
                    if(magnetHead.data.canFlip){
                        magnetHead.data.side = 1 - magnetHead.data.side;
                        magnetHead.data.canFlip = false;
                        var flipTween = game.add.tween(magnetHead).to( {y:MH_POSITIONS[magnetHead.data.side]}, 100, "Linear", true);
                        flipTween.onComplete.add(positionMagnethead);
                }
                }
                else{
                //Tap on Left side. RETREAT
                    
                    if(magnetHead.data.canRetreat){
                        magnetHead.data.canRetreat = false;
                        magnetHead.data.invincible = true;
                        var retreatTween = game.add.tween(magnetHead).to({x:MH_XSTART, rotation:-(Phaser.Math.PI2)}, 200, "Quad", true); // change based on size of snowball.
                        retreatTween.onComplete.add(doneRetreating);
                
                    }
                }
            }
        }
    }
}

function changeMusicVolume(){
    if(musicVolume <= 0){
        musicVolume = 1;
    }
    else{
        musicVolume-= 0.5;
    }
    updateVolume();
}

function changeSoundVolume(){
    
    if(gameVolume <= 0){
        gameVolume = 1;
    }
    else{
        gameVolume-= 0.5;
    }
    updateVolume();
}

function resumeGame(){
    game.paused = false;
    menu.kill();
    resumeButton.kill();
    resumeText.kill();
    restartText.kill();
    restartButton.kill();
    restartText.kill();
    musicButton.kill();
    musicButtonText.kill();
    soundButton.kill();
    soundButtonText.kill();
    pause_label.revive();
    menuIsOpen = false;
    optionsText.kill();
}

function pauseGame() {
    optionsText.revive();
    pause_label.kill();
    game.paused = true;
    menu.revive();
    resumeButton.revive();
    resumeText.revive();
    restartText.revive();
    restartButton.revive();
    restartText.revive();
    musicButton.revive();
    musicButtonText.revive();
    soundButton.revive();
    soundButtonText.revive();
    menuIsOpen = true;
        
}
function updateVolume(){
    console.log(musicVolume);
    gameMusic.volume = musicVolume;
    titleMusic.volume = musicVolume;
    getReadySound.volume = musicVolume;
    slap.volume = gameVolume;
    collectSound.volume = gameVolume;
    switch(musicVolume){
        case 1:
            musicButton.setFrames(2,2);
            break;
        case 0.5:
            musicButton.setFrames(3,3);
            break;
        case 0:
            musicButton.setFrames(4,4);
            break;
    }
    switch(gameVolume){
        case 1:
            soundButton.setFrames(2,2);
            break;
        case 0.5:
            soundButton.setFrames(3,3);
            break;
        case 0:
            soundButton.setFrames(4,4);
            break;
    }
}

function startSong(){
    getReadySound.play();
    getReadySound.onStop.add(function() {
        gameMusic.play();
    });
}

function updateProgressBar(){
    if(newSize >1.57){
        game.add.tween(progressBar.scale).to({x:900}, 1500, "Quad", true);
    }
    else{
        game.add.tween(progressBar.scale).to({x:(newSize-1)* 1576}, 1500, "Quad", true);
    }
    if(newSize >= extraLifeSize){
        progressBar.tint = 0xff690c; //orange
        progressBar.alpha = 0;
        game.add.tween(progressBar).to({alpha:1}, 500, "Quad", true);
    }
    else{
        progressBar.tint = 0x33FF00; //green
    }
}



function startMagnetHeadPostion(){
    magnetHead.y = MH_POSITIONS[magnetHead.data.side];
    magnetHead.data.canFlip = true;
}
function positionMagnethead(){
    //magnetHead.x = MH_XSTART;
    magnetHead.y = MH_POSITIONS[magnetHead.data.side];
    magnetHead.data.canFlip = true;
    shake = game.add.tween(game.camera).to({y: game.camera.y -10}, 100, "Linear", true, 0, 1, true);
    shake.onComplete.add(function() {
        game.world.camera.reset();
    });
    iceEmitter.x = magnetHead.x;
    iceEmitter.y = magnetHead.y;
    iceEmitter.explode(2000, 5);
    
    
}

function doneRetreating(){
    magnetHead.data.canRetreat = true;
    magnetHead.body.velocity.x = MH_VELOCITY;
    tunnelSpeed += 100;
    //gameMusic.setRate(tunnelSpeed/200);
    stuffGroup.forEachAlive(function(badguy) {badguy.body.velocity.x = -tunnelSpeed; });
    magnetHead.data.invincible = false;
    
}








function setLaunchTimer(delayTime){
    clearLaunchTimer();
    launchTimer = game.time.events.add(delayTime, executeLaunchTimer);
    
}

function clearLaunchTimer(){
    if(launchTimer){
        game.time.events.remove(launchTimer);   
    }
    launchTimer = false;
}

function executeLaunchTimer(){
    deployStuff();
    var launchDelay = (launchGap/tunnelSpeed) * 1000;
    setLaunchTimer(launchDelay);
    score += Math.floor(magnetHead.x/250);
    scoreText.text = score;
}

function stuffInit(stuff){
    stuff.outOfBoundsKill = true;
    stuff.checkWorldBounds = true;
    game.physics.arcade.enable(stuff);
    stuff.anchor.setTo(0.5);
    stuff.animations.add("bottom", [0,1,2,3,4], 10, true);       //Icicle  [0,1,2,3,4]
    stuff.animations.add("top",  [6,9,8,11,10], 10, true);         //Icicle  [6,9,8,11,10]
    stuff.animations.add("gem", [12,13,14,15,16,15,14,13], 10, true);
    
}

function deployStuff(){
    var stuff = stuffGroup.getFirstExists(false);
    if(stuff){
        var launchType = game.rnd.integerInRange(0,1);
        if (launchType == 0) {
            //launch a bad guy
            stuff.data.side = game.rnd.integerInRange(0,1);
            stuff.reset(game.width + 31, MH_POSITIONS[stuff.data.side]); // 31 based on bad guy sprite width
            stuff.animations.play(MH_ANIMATIONS[stuff.data.side]);
            stuff.body.velocity.x = -tunnelSpeed;
            stuff.data.type = "bad";
            
        }
        else{
            //launch a gem
            stuff.data.side = game.rnd.integerInRange(0,1);
            stuff.reset(game.width + 31, MH_POSITIONS[stuff.data.side]); // 31 based on bad guy sprite width
            stuff.animations.play("gem");
            stuff.body.velocity.x = -tunnelSpeed;
            stuff.data.type = "gem";
        }
        
        
        
        
    }
}

function killMagnetHead(player, badguy){
    badguy.kill();
    if(magnetHead.data.invincible == true){
        iceEmitter.x = badguy.x;
        iceEmitter.y = badguy.y;
        iceEmitter.explode(2000, 10);
    }
    else if(badguy.data.type == "bad"){
        if(magnetHead.scale.x > extraLifeSize){
            slap.play();
            iceEmitter.x = magnetHead.x;
            iceEmitter.y = magnetHead.y;
            iceEmitter.explode(2000, 10);
            newSize = 1;
            resizeMagnetHeadTween();
            updateProgressBar();
        }
        else{
            slap.play();
            player.kill();                                                    /// Turn on to die to enemies
            iceEmitter.x = badguy.x;
            iceEmitter.y = badguy.y;
            iceEmitter.explode(2000, 10);
            startState("GAME_OVER");
        }
    }
    
    else if(badguy.data.type == "gem"){
        goldEmitter.x = badguy.x;
        goldEmitter.y = badguy.y;
        collectSound.play();
        score+=10;
        scoreText.text = score;
        console.log(magnetHead.scale.x);
        if(magnetHead.scale.x < 1.57){
            newSize +=0.03; 
            resizeMagnetHeadTween();
            updateProgressBar();
        }
        if(magnetHead.scale.x > 1.57){
            newSize =1.57; 
            resizeMagnetHeadTween();
            updateProgressBar();
        }
        
        goldEmitter.explode(2000, 10);
    }
       
}

function resizeMagnetHeadTween(){
    game.add.tween(magnetHead.scale).to({x:newSize, y:newSize}, 1500, "Quad", true);
}
function updateSmokeEmitter(){
    if(magnetHead.data.side == 0){
        smokeEmitter.y = magnetHead.y - 32;
        smokeEmitter.minParticleSpeed.setTo(-200, 120);
        
    }
    else{
        smokeEmitter.y = magnetHead.y + 32;
        smokeEmitter.minParticleSpeed.setTo(-200, -120);
        
    }
    
    smokeEmitter.maxParticleSpeed.setTo(-100, 0);
    smokeEmitter.x = magnetHead.x - 20;
}



















   

//snowball size bar.