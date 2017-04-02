var Bubbler = {
	initialize: function (canvasDiv, canvas) {

		BubblerPrefs = {};
		BubblerPrefs.animation = true;
		BubblerPrefs.playMusic = true;
		this.isPaused = true;
		this.gameOver = false;
		this.changingLevels = false;
		this.startScreen = false;
		this.audioPlaying = false;
		this.frameRate = 30;
		this.width = 500;
		this.height = 800;
		document.getElementById(canvasDiv).style.width = "" + this.width + "px";
		document.getElementById(canvasDiv).style.height = "" + this.height + "px";
		this.canvas = document.getElementById(canvas);
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.tapHandler = this.canvasTap.bind(this);
		this.startTapHandler = this.handleStartTap.bind(this);
		this.upgradeTapHandler = this.handleUpgradeTap.bind(this);
		this.ctx = this.canvas.getContext("2d");
		this.ctx.width = 500;
		this.ctx.height = 1000;
		this.backgroundImage = "seafloor_500x800.png";
		this.background = Background;
		if (this.ctx.canvas.height == 400) {
			this.backgroundImage = "seafloor_320x400.png";
		} else if (this.ctx.canvas.height == 768) {
			this.backgroundImage = "seafloor_768x1024.png";
		}
		if (BubblerPrefs.animation) {
			this.background.initialize(this.ctx, this.backgroundImage, [{
					direction: 1,
					sources: ["clownfish_right.png", "greenfish_right.png"]
				},
				{
					direction: -1,
					sources: ["clownfish_left.png", "greenfish_left.png"]
				}
			], "");
		} else {
			this.background.initialize(this.ctx, "", [], 'rgba(0,0,160,1.0)');
		}

		// if (ScoreList.scores.length > 0) {
		// this.highScore = ScoreList.scores[0];
		// }
		// else {
		// this.highScore = 0;
		// }
		this.newGame();
		this.showStartScreen();
		this.loadAudio();
		this.start();
		this.showStartScreen();

	},
	newGame: function () {

		this.bubbles = new Array();
		this.ltime = 0;
		this.initBubbles = 1;
		this.minBubbles = 5;
		this.score = 0;
		this.tapValue = 50;
		this.tap = null;
		this.level = 1;
		this.maxSpeed = 75;
		this.minSpeed = 0;
		this.missedTaps = 0;
		this.missedTapLimit = 15;
		this.popCount = 0;
		this.newLevelPopCount = 20;
		this.indicatorWidth = 100;
		this.tapIndicatorRatio = this.indicatorWidth / this.missedTapLimit;
		this.twoPI = 2 * Math.PI;
		this.bubbleBonus = 0;
		this.bubbleCount = 0;
		this.timeBonus = 0;
		this.tapBonus = 0;
		this.missed = false;
		this.lostBalls = 0;
		this.makeBubbles();
		this.frameDrawing = false;
		this.bubbleIndex = 0;
		this.dt = 0;

	},
	showStartScreen: function () {
		this.startScreen = true;
		this.drawFrame();
	},

	handleStartTap: function () {
		//Mojo.Event.stopListening(this.canvas, Mojo.Event.tap, this.startTapHandler);
		this.newGame();
		this.start();
	},

	handleUpgradeTap: function () {

	},

	makeBubbles: function () {
		while (this.bubbles.length < this.initBubbles) {
			this.bubbles.push(this.createBubble());
		}
	},
	loadAudio: function () {
		// //this.audioLibs = MojoLoader.require({name: "mediaextension", version: "1.0"});

		this.audio = {};
		this.audio.pop = this.getAudioFile("./audio/pop.wav", false);
		this.audio.music = this.getAudioFile("./audio/music.mp3", true);
	},

	getAudioFile: function (file, loop) {
		var audioObj = {};
		audioObj.sound = document.createElement('audio');
		audioObj.sound.src = file;
		audioObj.sound.load();
		if (loop) {
			// audioObj.sound.loop = true;

			audioObj.sound.addEventListener(
				"ended",
				function (evt) {
					evt.target.play();
				},
				false
			);
		}
		//audioObj.play = audioObj.sound.play;
		return audioObj;
	},

	start: function () {
		this.canvas.onmousedown = this.tapHandler;
		if (BubblerPrefs.playMusic) {
			this.audio.music.sound.play();
			this.audioPlaying = true;
		} else {
			this.audioPlaying = false;
		}
		this.isPaused = false;
		this.changingLevels = false;
		this.gameOver = false;
		this.startScreen = false;
		this.ltime = new Date().getTime();
		this.levelStartTime = this.ltime;
		//this.frameTimer = window.setTimeout(this.drawFrame.bind(this),1000/this.frameRate);
		window.requestAnimationFrame(this.drawFrame.bind(this));
	},
	canvasTap: function (event) {

		this.tap = event;
		this.missedTaps++;
	},

	drawFrame: function () {

		if (!this.frameDrawing && !this.gameOver && !this.isPaused) {
			this.frameDrawing = true;
			this.background.draw();
			time = new Date().getTime();
			this.dt = time - this.ltime;
			this.ltime = time;
			if (!this.changingLevels) {
				for (this.bubbleIndex = this.bubbles.length - 1; this.bubbleIndex >= 0; this.bubbleIndex--) {
					this.drawBubble(this.bubbles[this.bubbleIndex]);
					this.bubbles[this.bubbleIndex].move(this.dt);

					if (this.tap) {
						//Mojo.Log.info ("Checking Tap...");
						if (this.bubbles[this.bubbleIndex].checkTap(this.tap)) {
							// this.audio.pop.sound.play();
							delete this.tap;
							this.score += this.bubbles[this.bubbleIndex].value();
							this.missedTaps--;
							this.popCount++;
							this.bubbles.push(this.createBubble());
						}
						//this.updateScore();
					}
					// check for moving off screen, or popping and delete and add new ball if needed.
					if (this.bubbles[this.bubbleIndex].x > this.ctx.canvas.width + this.bubbles[this.bubbleIndex].r || this.bubbles[this.bubbleIndex].x < -this.bubbles[this.bubbleIndex].r ||
						this.bubbles[this.bubbleIndex].y > this.ctx.canvas.height + this.bubbles[this.bubbleIndex].r || this.bubbles[this.bubbleIndex].y < -this.bubbles[this.bubbleIndex].r) {

						if (this.bubbles[this.bubbleIndex].y < -this.bubbles[this.bubbleIndex].r && !this.bubbles[this.bubbleIndex].popped) {
							this.lostBalls++;
							this.missedTaps++;
						}
						if (this.bubbles.length <= this.minBubbles) {
							this.bubbles.splice(this.bubbleIndex, 1, this.createBubble());
						} else {
							this.bubbles.splice(this.bubbleIndex, 1);
							if (this.bubbleIndex > 0) this.bubbleIndex--;
						}
						//Mojo.Log.info("Bubble Array Length: " + this.bubbles.length)
					}
				}
				if (this.tap) {
					this.tap = null;
				}
				this.updateScore();
			}
			if (this.changingLevels) {
				this.ctx.fillStyle = "rgba(200,200,200,.4)"
				this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
				this.ctx.textBaseline = 'middle';
				this.ctx.fillStyle = "white";
				this.ctx.textAlign = 'center';
				this.ctx.font = 'bold 50px sans-serif';
				this.ctx.fillText("Level " + this.level, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
				this.bonusYOffset = 60;
				if (this.bubbleBonus > 0) {
					this.ctx.textBaseline = 'middle';
					this.ctx.fillStyle = "white";
					this.ctx.textAlign = 'left';
					this.ctx.font = 'bold 30px sans-serif';
					this.ctx.fillText("Great Job!", 60, (this.ctx.canvas.height / 2) - this.bonusYOffset);
					this.ctx.fillText("Bonus: " + this.bubbleBonus, 250, (this.ctx.canvas.height / 2) - this.bonusYOffset)
					this.bonusYOffset += 40;
				}
				if (this.timeBonus > 0) {
					this.ctx.textBaseline = 'middle';
					this.ctx.fillStyle = "white";
					this.ctx.textAlign = 'left';
					this.ctx.font = 'bold 30px sans-serif';
					this.ctx.fillText("Super Fast!", 60, (this.ctx.canvas.height / 2) - this.bonusYOffset);
					this.ctx.fillText("Bonus: " + this.timeBonus, 250, (this.ctx.canvas.height / 2) - this.bonusYOffset);
					this.bonusYOffset += 40;
				}
				if (this.tapBonus > 0) {
					this.ctx.textBaseline = 'middle';
					this.ctx.fillStyle = "white";
					this.ctx.textAlign = 'left';
					this.ctx.font = 'bold 30px sans-serif';
					this.ctx.fillText("Didn't Miss!", 60, (this.ctx.canvas.height / 2) - this.bonusYOffset);
					this.ctx.fillText("Bonus: " + this.tapBonus, 250, (this.ctx.canvas.height / 2) - this.bonusYOffset);
					this.bonusYOffset += 40;
				}

			} else if (this.lostBalls >= this.missedTapLimit) {
				this.endGame(true);
			} else if (this.popCount >= this.newLevelPopCount) {
				this.newLevel();
			}
			this.frameDrawing = false;
			window.requestAnimationFrame(this.drawFrame.bind(this));
			//this.frameTimer = window.setTimeout(this.drawFrame.bind(this),1000/this.frameRate);
		} else {
			//Mojo.Log.info ("Skipped Frame...");
		}
	},

	newLevel: function () {

		this.levelTime = new Date().getTime() - this.levelStartTime;
		//Mojo.Log.info("Level Time: " + this.levelTime);
		this.canvas.onmousedown = null;
		this.changingLevels = true;

		//this.audio.music.sound.pause();
		//this.audio.level.sound.play();
		this.minBubblesSave = this.minBubbles;
		var lostAllowance = Math.round(this.level * 4 * (1 - (1 / (Math.pow(this.level, 0.3)))));
		//Mojo.Log.info("Lost Allowance: " + lostAllowance)
		if (this.lostBalls <= lostAllowance) {
			//if (!this.lostBall) {
			this.bubbleBonus = this.popCount * 50 * this.level;
		}
		if (this.missedTaps == 0) {
			this.tapBonus = 1000;
		}
		if (this.levelTime < this.newLevelPopCount * 1000) {
			this.timeBonus = 1000;
		}
		this.score += this.bubbleBonus + this.tapBonus + this.timeBonus;

		if (this.score >= this.highScore) {
			this.highScore = this.score;
		}

		this.minBubbles = 0;
		this.level++;
		//if (this.level > BubbleBeats.freeLevelMax && BubbleBeats.freeVersion) {
		//	this.changingLevels = false;
		//	this.endGame(false);
		//}
		//else {
		this.delay(4000, this.startNewLevel.bind(this));
		//}

	},
	startNewLevel: function () {
		this.pause(true);
		this.lostBalls = 0;
		this.missed = false;
		this.timeBonus = 0;
		this.tapBonus = 0;
		this.bubbleBonus = 0;
		this.popCount = 0;
		this.bubbleCount = 0;
		this.newLevelPopCount += 5;
		this.minBubbles = this.minBubblesSave;
		this.bubbles = new Array();
		this.missedTaps = 0;
		this.maxSpeed += 25;
		this.minSpeed += 1;
		this.makeBubbles();
		this.start();
	},


	endGame: function (playAgain) {
		if (!this.gameOver) {
			this.gameOver = true;
			this.pause(playAgain);
			var name = BubblerPrefs.playerName;
			if (name == "") {
				name = "???"
			}
			ScoreList.addScore({
				name: name,
				points: this.score
			});
			BubblerPrefs.highScores = ScoreList.scores;
			BubblerPrefs.Cookie.storeCookie();
			if (playAgain) {
				this.ctx.fillStyle = "rgba(200,200,200,.3)";
				this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
				this.ctx.textBaseline = 'middle';
				this.ctx.fillStyle = "red";
				this.ctx.textAlign = 'center';
				this.ctx.font = 'bold 40px sans-serif';
				this.ctx.fillText("Game Over!", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
				this.delay(1000, this.playAgain.bind(this))
			} else if (BubbleBeats.freeVersion) {
				this.ctx.fillStyle = "rgba(200,200,200,.5)";
				this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
				this.ctx.textBaseline = 'middle';
				this.ctx.fillStyle = "black";
				this.ctx.textAlign = 'center';
				this.ctx.font = 'bold 30px sans-serif';
				this.ctx.fillText("For More Levels", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
				this.ctx.fillText("Upgrade to Full Version", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 30);
				this.delay(2000, this.upgrade.bind(this));
			}
		}
	},
	upgrade: function () {
		this.ctx.font = 'bold 24px sans-serif';
		this.ctx.fillStyle = "black";
		this.ctx.fillText("Tap To Upgrade", this.ctx.canvas.width / 2, this.ctx.canvas.height - 50);
		//this.updradeTapListener = Mojo.Event.listen(this.canvas, Mojo.Event.tap, this.upgradeTapHandler);
	},

	playAgain: function () {
		this.ctx.font = 'bold 16px sans-serif';
		this.ctx.fillStyle = "white";
		this.ctx.fillText("Tap To Play Again", this.ctx.canvas.width / 2, this.ctx.canvas.height - 30);
		//this.startTapListener = Mojo.Event.listen(this.canvas, Mojo.Event.tap, this.startTapHandler);
	},

	pause: function (playAudio) {
		//Mojo.Log.info("In Bubbler.pause()...");
		if (this.audioPlaying && !playAudio) {
			// Pause Audio
			this.audio.music.sound.pause();
		}
		if (this.changingLevels) {
			window.clearTimeout(this.delayTimer);
			window.clearTimeout(this.frameTimer);
		} else if (this.startScreen) {
			//Mojo.Event.stopListening(this.canvas, Mojo.Event.tap, this.startTapHandler);
		} else {
			this.isPaused = true;
			//Mojo.Event.stopListening(this.canvas, 'mousedown', this.tapHandler);
			window.clearTimeout(this.frameTimer);
		}

	},

	resume: function () {
		//Mojo.Log.info("In Bubbler.resume()...");
		if (this.audioPlaying) {
			// resume audio
			this.audio.music.sound.play();
		}
		if (this.changingLevels) {
			this.delay(3000, this.startNewLevel.bind(this));
			this.frameTimer = window.setTimeout(this.drawFrame.bind(this), 1000 / this.frameRate);
		} else if (this.startScreen) {
			//this.startTapListener = Mojo.Event.listen(this.canvas, Mojo.Event.tap, this.startTapHandler);
		} else {
			//this.tapListener = Mojo.Event.listen(this.canvas, 'mousedown', this.tapHandler);
			this.audio.music.sound.play();
			this.ltime = new Date().getTime();
			this.isPaused = false;
			this.frameTimer = window.setTimeout(this.drawFrame.bind(this), 1000 / this.frameRate);
		}
	},

	delay: function (time, f) {
		this.delayTimer = window.setTimeout(f.bind(this), time);
	},

	updateScore: function () {
		this.ctx.fillStyle = "rgba(200,200,200,.5)";
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, 60);


		this.ctx.font = 'bold 24px sans-serif';
		this.ctx.fillStyle = "white";
		this.ctx.textBaseline = 'top';
		this.ctx.textAlign = 'center';
		if (this.score >= BubblerPrefs.highScore) {
			BubblerPrefs.highScore = this.score
			this.ctx.fillStyle = "#33ff33";
			this.ctx.textBaseline = 'top';
			this.ctx.textAlign = 'center';
		}
		this.ctx.fillText(this.score, this.ctx.canvas.width / 2, 10);

		this.ctx.font = 'bold 20px sans-serif';
		this.ctx.fillStyle = "#cccccc";
		this.ctx.textBaseline = 'top';
		this.ctx.textAlign = 'center';
		this.ctx.fillText(BubblerPrefs.highScore, this.ctx.canvas.width / 2, 35);


		this.ctx.font = 'bold 20px sans-serif';
		this.ctx.fillStyle = "white";
		this.ctx.textBaseline = 'bottom';
		this.ctx.textAlign = 'center';
		this.ctx.fillText("Progress", this.indicatorWidth / 2 + 10, 35);
		this.ctx.fillStyle = "rgba(255,255,255,.2)";
		this.ctx.fillRect(10, 40, 100, 15);
		this.ctx.fillStyle = "#33ff33";
		this.ctx.fillRect(10, 40, this.indicatorWidth * this.popCount / this.newLevelPopCount, 15);


		//this.ctx.fillStyle = "white";
		//this.ctx.textAlign = 'left';
		//this.ctx.fillText("Level: " + this.level + " (" + this.popCount + "/" + this.newLevelPopCount + ")", 10, 30);
		this.ctx.font = 'bold 20px sans-serif';
		this.ctx.fillStyle = "white";
		this.ctx.textBaseline = 'bottom';
		this.ctx.textAlign = 'center';
		this.ctx.fillText("Health", this.ctx.canvas.width - (this.indicatorWidth / 2 + 10), 35);
		this.ctx.fillStyle = "#33ff33";
		this.ctx.fillRect(this.ctx.canvas.width - (this.indicatorWidth + 10), 40, this.indicatorWidth, 15);
		this.ctx.fillStyle = "red";
		this.ctx.fillRect(this.ctx.canvas.width - (this.indicatorWidth + 10), 40, this.lostBalls * this.tapIndicatorRatio, 15);

		//this.ctx.fillText("Taps:  " + (this.missedTapLimit-this.missedTaps), this.ctx.canvas.width-10, 40)
	},
	drawBubble: function (bubble) {

		if (bubble.popped) {
			this.ctx.font = 'bold 32px sans-serif';
			this.ctx.fillStyle = "#33ff33";
			this.ctx.textBaseline = 'bottom';
			this.ctx.textAlign = 'center';
			this.ctx.fillText(bubble.finalValue, bubble.x, bubble.y - (bubble.image.height / 2));
			//this.ctx.drawImage(bubble.image, bubble.x-bubble.image.width/2, bubble.y-bubble.image.height/2);
		} else {
			this.ctx.fillStyle = bubble.color;
			this.ctx.beginPath();
			this.ctx.arc(bubble.xw, bubble.y, bubble.r, 0, this.twoPI, true);
			this.ctx.fill();
			this.ctx.fillStyle = 'rgba(255,255,255,.7)';
			this.ctx.beginPath();
			this.ctx.arc(bubble.xw + bubble.r4, bubble.y - bubble.r2, bubble.r5, 0, this.twoPI, true);
			this.ctx.fill();
			this.ctx.font = 'bold 24px sans-serif';
			this.ctx.fillStyle = 'white';
			this.ctx.textBaseline = 'middle';
			this.ctx.textAlign = 'center';
			this.ctx.fillText(bubble.value(), bubble.xw, bubble.y);
		}
	},

	createBubble: function () {
		var r = (Math.random() * 31) + 40;
		var x;
		var y;
		x = Math.random() * (this.ctx.canvas.width - (2 * r)) + r;
		y = this.ctx.canvas.height + r;
		var vx = 0;
		var vy = -this.minSpeed;

		clr = "rgba(";
		var red = Math.floor(Math.random() * 256);
		var green = Math.floor(Math.random() * 256);
		var blue = Math.floor(Math.random() * 256);
		var alpha = 0.6;
		clr += red + "," + green + "," + blue + "," + alpha + ")";

		var wob = Math.random() * 3 * this.level * 2 + 1; // wobble amount 0.1-3.1
		var wp = Math.random() * wob + 1; // wobble period 0.1-3.1 sec

		var lifetime = (Math.random() * 5000) + 1000 // 0-4 second lifetime
		this.bubbleCount++;
		return new Bubble(x, y, r, vx, vy, wob, wp, clr, 100000, this.maxSpeed, this.ctx.canvas.height);
	}

};