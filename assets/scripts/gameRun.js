function trackKeys(keys) {
  let down = Object.create(null);
  function track(event) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type == "keydown";
      event.preventDefault();
    }
  }
  window.addEventListener("keydown", track);
  window.addEventListener("keyup", track);
  return down;
}

var arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp"]);

function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function runLevel(level, Display) {
  let parent = document.getElementById("root");
  let display = new Display(parent, level);
  let state = State.start(level);
  let ending = 1;
  return new Promise((resolve) => {
    runAnimation((time) => {
      state = state.update(time, arrowKeys);
      display.syncState(state);
      if (state.status == "playing") {
        return true;
      } else if (ending > 0) {
        setTimeout(function () {
          ending = -1;
          return true;
        }, 500);
      } else {
        display.clear();
        resolve(state.status);
        return false;
      }
    });
  });
}

async function runGame(plans, Display) {
  let lives = 3;
  let parent = document.getElementById("root");

  let scoreBoard = elt("div", { class: "score_board" });
  scoreBoard.innerHTML = `<div class="score_board">
                              <div class="wrapper">
                                <p class="lives"></p>
                                <p class="coin_remaining"></p>
                              </div>
                            </div>`;

  parent.appendChild(scoreBoard);
  let heart = ["❤", "❤ ❤", "❤ ❤ ❤"];
  let liveElm = document.querySelector(".lives");
  liveElm.innerText = `Lives: ${heart[lives - 1]}`;
  for (var level = 0; level < plans.length && lives > 0; ) {
    let status = await runLevel(new Level(plans[level]), Display);
    if (status == "won") level++;
    if (status == "lost") {
      lives--;
      lives
        ? (liveElm.innerText = `Lives: ${heart[lives - 1]}`)
        : (liveElm.innerText = `Game Over`);
    }
  }
  if (!lives) {
    gameOver(Display, plans[level]);
  } else {
    gameWon(Display, plans[level]);
  }
}

function gameOver(Display, plan) {
  let level = new Level(plan);
  let parent = document.getElementById("root");
  parent.classList.add("game_over");
  let display = new Display(parent, level);

  let div = `<div class="finish_page_wrapper">
                <button class="play_btn">Play Again!</button>
              </div>`;
  parent.innerHTML = div;
  let restartBtn = document.querySelector(".play_btn");
  restartBtn.addEventListener("click", (event) => {
    display.clear();
    restart();
  });
}

function gameWon(Display, plan) {
  let level = new Level(levelPlan[0]);
  let parent = document.getElementById("root");
  parent.classList.add("game_over");
  let display = new Display(parent, level);

  let div = `<div class="win_page_wrapper">
                <button class="play_btn">Play Again!</button>
              </div>`;
  parent.innerHTML = div;
  let restartBtn = document.querySelector(".play_btn");
  restartBtn.addEventListener("click", (event) => {
    display.clear();
    restart();
  });
}

function restart() {
  let resultPage =
    document.querySelector(".finish_page_wrapper") ||
    document.querySelector(".win_page_wrapper");
  resultPage.remove();
  runGame(levelPlan, DOMDisplay);
  console.log("Clicked!");
}
