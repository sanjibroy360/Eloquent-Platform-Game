class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  plus(next) {
    return new Vector(this.x + next.x, this.y + next.y);
  }

  times(factor) {
    return new Vector(this.x * factor, this.y * factor);
  }
}

// console.log(new Vector(2,3))

// Player

class Player {
  constructor(position, speed) {
    this.position = position;
    this.speed = speed;
  }
  getType() {
    return "player";
  }

  static create(position) {
    const initialPosition = position.plus(new Vector(0, -5));
    const speed = new Vector(0, 0);
    return new Player(position, speed);
  }
}

Player.prototype.size = new Vector(0.8, 1.5);

// Lava

class Lava {
  constructor(position, speed, reset) {
    this.position = position;
    this.speed = speed;
    this.reset = reset;
  }

  getType() {
    return "lava";
  }

  static create(position, char) {
    const speed = {};
    switch (char) {
      case "=":
        speed = new Vector(2, 0);
        return new Lava(position, speed);
      case "|":
        speed = new Vector(0, 2);
        return new Lava(position, speed);
      case "v":
        speed = new Vector(0, 3);
        return new Lava(position, speed, position);

      default:
        alert("Invalid Symbol!");
    }
  }
}

Lava.prototype.size = new Vector(1, 1);

// Coin

class Coin {
  constructor(position, basePosition, wobble) {
    this.position = position;
    this.basePosition = basePosition;
    this.wobble = wobble;
  }

  getType() {
    return "coin";
  }

  static create(position) {
    const basePosition = position.plus(new Vector(0.2, 0.1));
    const wobble = 2 * Math.PI * Math.random();
    return new Coin(basePosition, basePosition, wobble);
  }
}

Coin.prototype.size = new Vector(0.6, 0.6);

// actors

const actors = {
  "@": Player,
  o: Coin,
  "|": Lava,
  "=": Lava,
  v: Lava,
};

const background = {
  "#": "wall",
  "+": "lava",
};

// Level

class Level {
  constructor(levelPlan) {
    this.rows = levelPlan[0]
      .trim()
      .split("\n")
      .map((eachRow) => [...eachRow]);
    this.height = this.rows.length;
    this.width = this.rows[0].length;
    this.actors = [];
    this.backgroundElments = [];
    this.finishDelay = null;
    this.status = null;

    for (let rowNo = 0; rowNo < this.rows.length; rowNo++) {
      let gridLine = [];
      for (let columnNo = 0; columnNo < this.rows[0].length; columnNo++) {
        let char = this.rows[rowNo][columnNo];
        let Actor = actors[char];
        if (Actor) {
          let x = columnNo;
          let y = rowNo;
          let position = new Vector(x, y);
          this.actors.push(new Actor(position));
        } else if (background[char]) {
          gridLine.push(background[char]);
        } else {
          gridLine.push("null");
        }
      }
      this.backgroundElments.push(gridLine);
    }

    console.log(this.actors);
    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i].getType() === "player") {
        this.player = this.actors[i]; // track player
        break;
      }
    }
  }
}

Level.prototype.isFinished = function () {
  return this.status != null && this.finishDelay < 0;
};

let levelObj = new Level(levelPlan);
// console.log(levelObj.backgroundElments);

// ****************** View ***********************

function createHtmlElement(elementName, attributes = {}, ...children) {
  let element = document.createElement(elementName);

  for (let eachAttribute in attributes) {
    let value = attributes[eachAttribute];
    element.setAttribute(eachAttribute, value);
  }

  for (let eachChild of children) {
    element.appendChild(eachChild);
  }

  return element;
}

class DOMDisplay {
  constructor(parent, level) {
    this.dom = createHtmlElement("div", { class: "game" }, drawGrid(level));
    this.actorLayer = null;
    parent.appendChild(this.dom);
  }

  clear() {
    this.dom.remove();
  }
}

const scale = 20;

function drawGrid(level) {
  return createHtmlElement(
    "table",
    { class: "background", style: `width: ${level.width * scale}px` },
    ...level.rows.map((row) => {
      return createHtmlElement(
        "tr",
        { style: `height: ${scale}px` },
        ...row.map((colElm) => {
          if (background[colElm])
            return createHtmlElement("td", { class: background[colElm] });

          return createHtmlElement("td");
        })
      );
    })
  );
}

function drawActor(actors) {
  return createHtmlElement(
    "div",
    { style: `width: 600px, height:500px` },
    ...actors.map((actor) => {
      return createHtmlElement("div", {
        class: `actor ${actor.getType()}`,
        style: `height: ${actor.size.x * scale}px; width: ${
          actor.size.y * scale
        }px; top: ${actor.position.y * scale}px; left: ${
          actor.position.x * scale
        }px `,
      });
    })
  );
}

DOMDisplay.prototype.syncState = function (level) {
  if (this.actorLayer) this.actorLayer.remove();

  this.actorLayer = drawActor(level.actors);
  this.dom.appendChild(this.actorLayer);
  this.dom.className = `game ${level.status || ""}`;
  this.dom.scrollLeft -= this.dom.clientWidth / 3;
  console.log(this.dom.scrollLeft, this.dom, this.dom.clientWidth / 3);
};

DOMDisplay.prototype.AdjustFrame = function (level) {
  // Viewport(this.dom) position related

  let width = this.dom.clientWidth;
  let height = this.dom.clientHeight;
  // let marginX = width/3;
  // let marginY = height/3;
  let margin = width / 3; // (1/3) of viewport width
  let left = this.dom.scrollLeft;
  let right = left + width;
  let top = this.dom.scrollTop;
  let bottom = top - height;

  // Player's Position Related

  let player = lavel.player;
  let playerPositionVector = player.position;
  let playerSizeVector = player.size;

  let playerCenter = playerPositionVector
    .plus(playerSizeVector.times(0.5))
    .times(scale);

  if (playerCenter.x < left + margin) {
    this.dom.scrollLeft = playerCenter.x - margin;
  } else if (playerCenter.x > right - margin) {
    this.dom.scrollLeft = playerCenter.x + margin - width; //
  }

  if (playerCenter.y < top + margin) {
    this.dom.scrollTop = center.y - margin;
  } else if (playerCenter.y > bottom - margin) {
    this.dom.scrollTop = playerCenter.y + margin - width; //
  }
};

// let simpleLevel = new Level(levelPlan);
// let display = new DOMDisplay(document.body, simpleLevel);
// display.syncState(simpleLevel);


// **************** Control *******************


Level.prototype.detectObstacle = function(position, size, type) {
  var xStart = Math.floor(position.x);
  var xEnd = Math.ceil(position.x + size.x);
  var yStart = Math.floor(position.y);
  var yEnd = Math.ceil(position.y+size.y);
  let obstacle = "";
  for(let y = yStart; y < yEnd; y++) {
    for(let x = xStart; x < xEnd; x++) {
      let isOutside = x < 0 || x > xEnd || y < 0 || y > yEnd;
      obstacle = isOutside ? "wall" : this.backgroundElments[y][x];
    }
  }
  return obstacle;
}

