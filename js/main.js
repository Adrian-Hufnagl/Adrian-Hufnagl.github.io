var explainer = false;

function shuffleCards() {
  var cards1 = document.querySelector('#card-list-1');
  var cards2 = document.querySelector('#card-list-2');
  for (var i = cards1.children.length; i >= 0; i--) {
    cards1.appendChild(cards1.children[Math.random() * i | 0]);
  }
  for (var i = cards2.children.length; i >= 0; i--) {
    cards2.appendChild(cards2.children[Math.random() * i | 0]);
  }
}

function shuffleColors() {
  var colors1 = document.querySelector('#color-column-1');
  var colors2 = document.querySelector('#color-column-2');
  for (var i = colors1.children.length; i >= 0; i--) {
    colors1.appendChild(colors1.children[Math.random() * i | 0]);
  }
  for (var i = colors2.children.length; i >= 0; i--) {
    colors2.appendChild(colors2.children[Math.random() * i | 0]);
  }
}

function startGame(creator) {
  if(!creator){
    explainer = true;
  }
  var stage1 = document.getElementById("stage-1");
  var start = document.getElementById("start");
  stage1.style.display = "block";
  start.style.display = "none";

}

function switchStage() {
  var stage1 = document.getElementById("stage-1");
  var stage2 = document.getElementById("stage-2");

  if (stage1.style.display === "none") {
    stage1.style.display = "block";
  } else {
    stage1.style.display = "none";
  }
  if (stage2.style.display === "none") {
    stage2.style.display = "block";
  } else {
    stage2.style.display = "none";
  }
}

function lockCharacter() {
  var stage2 = document.getElementById("stage-2");
  var stage3 = document.getElementById("stage-3");
  stage2.style.display = "none";
  stage3.style.display = "inline-block";
}

function restartGame(){
  location.reload();
}
