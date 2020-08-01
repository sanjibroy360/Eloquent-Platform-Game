// Vector (It contains co-ordinate related values and methods)

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
  x: "wall",
  "#": "wall",
  "+": "lava",
  "!": "lava",
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
        let fieldType = null;
        if (Actor) {
          let position = new Vector(columnNo, rowNo);
          this.actors.push(new Actor(position, char));
        } else if (background[char]) {
          gridLine.push(background[char]);
        } else {
          gridLine.push("null");
        }
      }
      this.backgroundElments.push(gridLine);
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
    {style: `width: 600px, height:500px`},
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
    
    // 
  );
}

DOMDisplay.prototype.syncState = function (level) {
  if (this.actorLayer) this.actorLayer.remove();

  this.actorLayer = drawActor(level.actors);
  this.dom.appendChild(this.actorLayer);
  this.dom.className = `game ${level.status}`;
  console.log(this.dom);
};

let simpleLevel = new Level(levelPlan, 0);
let display = new DOMDisplay(document.body, simpleLevel);
display.syncState(simpleLevel);

// console.log(simpleLevel.backgroundElments);
