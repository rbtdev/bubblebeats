function Bubble (x,y,r,vx,vy,w,p,c,t,maxV,height)
{
	  this.x = x;
	  this.y = y;
	  this.xw = x; // x with wobble
	  this.r = r;
	  this.rTap = this.r+8;
	  this.r2 = r/2;
	  this.r4 = r/4;
	  this.r5 = r/5;
	  this.vx = vx;
	  this.vy = vy;
	  this.wobble = 100*w/this.r;
	  this.wperiod = p*this.r/100;
	  this.color = c;
	  this.maxV = -maxV/this.r;
	  this.lifetime = t;
	  this.tf = 0;
	  this.float = 0;
	  this.gravity = 0.05;
	  this.lift = -0.01;
	  this.accel = this.lift;
	  this.popped = false;
	  this.died = false;
	  this.image = new Image();
	  this.image.src = "./images/notes.png";
	  this.finalValue = 0;
	  this.twoPi = 2 * Math.PI;
	  this.height = height;
};

Bubble.prototype.value = function ()
{
		return (Math.round(((-200*this.vy/this.r)-(this.y/10))/5)*5) + 100;
};
Bubble.prototype.move = function(dt) {
    	if (this.vy > this.maxV) {
    		this.vy = (this.accel * dt) + this.vy;
    	}
    	//Mojo.Log.info("new vy = " + this.vy);
    	this.x += this.vx;
    	this.y += this.vy;
    	this.tf += dt/1000/this.wperiod;
	    this.xw = this.x + (this.wobble*(Math.sin((this.tf-Math.floor(this.tf))*this.twoPi)-0.5));
};

Bubble.prototype.age = function(time) {
		this.lifetime -= time;
		if (this.lifetime <= 0) {
			this.maxV = -10000000;
			this.accel = this.gravity;
			this.died = true;
			this.value = 0;
		}
		else {this.died = false};
};

Bubble.prototype.checkTap = function(tap) {
			// if this is still a real bubble then check for tap
			if (!this.popped) {
				if    (tap.x>=this.xw-this.rTap && tap.x <=this.xw+this.rTap &&
				   tap.y>=this.y-this.rTap && tap.y<= this.y+this.rTap) {
				//Mojo.Log.info("Bubble tapped");
				this.maxV *= 10;
				this.accel = this.gravity;
				this.finalValue = this.value();
				this.popped = true;
				//delete tap;
				return true;
				} else {
					return false;
					//Mojo.Log.info("Bubble missed");
				}
			}
			else return false;
};