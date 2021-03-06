class Player {
    constructor(pos, speed) {
      this.pos = pos;
      this.speed = speed;
    }
  
    get type() {
      return "player";
    }
  
    static create(pos) {
      return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0));
    }
  
    update(time, state, keys) {
      let xSpeed = 0;
      if (keys.ArrowLeft) xSpeed -= playerXSpeed;
      if (keys.ArrowRight) xSpeed += playerXSpeed;
      let pos = this.pos;
      let movedX = pos.plus(new Vec(xSpeed * time, 0));
      if (!state.level.touches(movedX, this.size, "wall")) {
        pos = movedX;
      }
  
      let ySpeed = this.speed.y + time * gravity;
      let movedY = pos.plus(new Vec(0, ySpeed * time));
      if (!state.level.touches(movedY, this.size, "wall")) {
        pos = movedY;
        console.log(this,"1");
      } else if (keys.ArrowUp && ySpeed > 0) {
        console.log(this,"2")
        ySpeed = -jumpSpeed;
        console.log(this,"3");
      } else {
        ySpeed = 0;
      }
      return new Player(pos, new Vec(xSpeed, ySpeed));
    }
  }
  
  Player.prototype.size = new Vec(0.8, 1.5);
  
  var playerXSpeed = 7;
  var gravity = 30;
  var jumpSpeed = 17;
  