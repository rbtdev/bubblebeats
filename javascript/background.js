var Background = {
	initialize: function (ctx, imageSource, spriteSources, color) {
		
		this.ctx = ctx;
		this.color = color;
		if (spriteSources.length != 0) {
			this.sprites = [];
			for (var d = 0; d < 2; d++) {
				var spriteCollection = spriteSources[d];
				for (var i = 0; i<6; i++) {
					var sprite = {};
					var shapeIndex = Math.floor(Math.random()*(spriteCollection.sources.length));
					//Mojo.Log.info("Shape Index = " + shapeIndex)
					sprite.image = new Image ();
					sprite.image.src = "./images/" + spriteCollection.sources[shapeIndex];
					sprite.direction = spriteCollection.direction;
					sprite.vx = this.setSpeed(sprite.direction);
					sprite.vy = 0;
					sprite.x = Math.random()*(this.ctx.canvas.width-sprite.image.width);
					sprite.y = Math.random()*(this.ctx.canvas.height-sprite.image.height);
					this.sprites.push(sprite);
				}
			}
			this.image = new Image();
			this.image.src = "./images/" + imageSource;
			this.useImage = true;
			this.spriteIndex = 0;
		}
		else {
			this.useImage = false;
		}
},
	reset: function () {
		this.framePos = 0;
},
	setColor: function (color) {
		this.color = color;
},

	draw: function () {
		if (this.useImage) {
			this.ctx.drawImage(this.image, 0, 0);
			for (this.spriteIndex = 0; this.spriteIndex < this.sprites.length; this.spriteIndex++) {
				this.ctx.drawImage(this.sprites[this.spriteIndex].image, this.sprites[this.spriteIndex].x, this.sprites[this.spriteIndex].y);
				this.sprites[this.spriteIndex].x += this.sprites[this.spriteIndex].vx;
				this.sprites[this.spriteIndex].y += this.sprites[this.spriteIndex].vy;
				
				if (this.sprites[this.spriteIndex].x < -this.sprites[this.spriteIndex].image.width) {
					this.sprites[this.spriteIndex].x = this.ctx.canvas.width;
					this.sprites[this.spriteIndex].vx = this.setSpeed(this.sprites[this.spriteIndex].direction);
					this.sprites[this.spriteIndex].y = Math.random()*(this.ctx.canvas.height-this.sprites[this.spriteIndex].image.height);
				}
				else if (this.sprites[this.spriteIndex].x > this.ctx.canvas.width) {
						this.sprites[this.spriteIndex].x = -this.sprites[this.spriteIndex].image.width;
						this.sprites[this.spriteIndex].vx = this.setSpeed(this.sprites[this.spriteIndex].direction);
						this.sprites[this.spriteIndex].y = Math.random()*(this.ctx.canvas.height-this.sprites[this.spriteIndex].image.height);
				}
			}
		}
		else {
			this.ctx.fillStyle = this.color;
			this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		}
},
	setSpeed: function (direction) {
		return direction*((Math.random()*1) + .5);
}
};