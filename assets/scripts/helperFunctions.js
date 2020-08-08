var levelChars = {
    ".": "empty",
    "#": "wall",
    "+": "lava",
    "@": Player,
    o: Coin,
    "=": Lava,
    "|": Lava,
    v: Lava,
  };
  
  function elt(name, attrs, ...children) {
    let dom = document.createElement(name);
    for (let attribute in attrs) {
      dom.setAttribute(attribute, attrs[attribute]);
    }
    for (let child of children) {
      dom.appendChild(child);
    }
    return dom;
  }
  
  function drawGrid(level) {
    return elt(
      "table",
      {
        class: "background",
        style: `width: ${level.width * scale}px`,
      },
      ...level.rows.map((row) =>
        elt(
          "tr",
          { style: `height: ${scale}px` },
          ...row.map((type) => {
            if (type === "lava") {
              return elt("td", { class: type + " static_lava" });
            } else {
              return elt("td", { class: type });
            }
          })
        )
      )
    );
  }
  
  function drawActors(actors) {
    let coinsRemaining = actors.filter((actor) => actor.type === "coin").length;
    let p = document.querySelector(".coin_remaining");
    p.innerText = `Coins Remaining: ${coinsRemaining}`;
  
    return elt(
      "div",
      {},
      ...actors.map((actor) => {
        let rect = "";
  
        if (actor.type == "lava") {
          rect = elt("img", { class: `actor ${actor.type} fireball` });
          rect.setAttribute("src", "./assets/fireball.gif");
        } else {
          rect = elt("div", { class: `actor ${actor.type}` });
        }
        rect.style.width = `${actor.size.x * scale}px`;
        rect.style.height = `${actor.size.y * scale}px`;
        rect.style.left = `${actor.pos.x * scale}px`;
        rect.style.top = `${actor.pos.y * scale}px`;
        return rect;
      })
    );
  }
  
  function overlap(actor1, actor2) {
    return (
      actor1.pos.x + actor1.size.x > actor2.pos.x &&
      actor1.pos.x < actor2.pos.x + actor2.size.x &&
      actor1.pos.y + actor1.size.y > actor2.pos.y &&
      actor1.pos.y < actor2.pos.y + actor2.size.y
    );
  }
  
  runGame(levelPlan, DOMDisplay);
  