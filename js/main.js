var explainer = false;
var selectedColor = 0;
var coloring = '';

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

/* save the chosen role */
function saveRole(role_id){
  localStorage.clear();
  localStorage.setItem('role_id', role_id);
}

/* save the chosen figurecard */
function saveFigureCard(chosen_figurecard) {
  localStorage.setItem('figurecard', chosen_figurecard);
}

function readFigureCard() {
  localStorage.getItem('figurecard');
}

function switchStage(cardNumber) {
  newfunction();
  console.log('switch')
  var selectCard = document.getElementById("card-" + cardNumber.toString());
  var selectFigure = selectCard.children[0];
  selectFigure.setAttribute("onclick","colorObject(this)");
  var colorCard = document.getElementById("big-color-card");
  colorCard.appendChild(selectFigure);
  console.log(selectFigure);
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
  var colorCard = document.getElementById("big-color-card");
  var selectFigure =  colorCard.children[0]
  var saveCard = document.getElementById("big-save-card");
  saveCard.appendChild(selectFigure);
  stage2.style.display = "none";
  stage3.style.display = "inline-block";
}

function restartGame(){
  location.reload();
}

function selectColor(color){
  selectedColor = color
  console.log(color);
}

  function colorObject(object) {
  svgimage = object.children[0];
    switch (selectedColor) {
      case 1:
        console.log('colorObject')
        console.log(object)
        coloring = 'grey';
        svgimage.style.fill='grey'
        break;
      case 2:
        coloring = 'orange';
        svgimage.style.fill='orange'
        break;
      case 3:
        coloring = 'green';
        svgimage.style.fill='green'
        break;
      case 4:
        coloring = 'pink';
        svgimage.style.fill='pink'
        break;
      case 5:
        coloring = 'blue';
        svgimage.style.fill='blue'
        break;
      case 6:
        coloring = 'black';
        svgimage.style.fill='black'
        break;
      case 7:
        coloring = 'red';
        svgimage.style.fill='red'
        break;
      case 8:
        coloring = 'brown';
        svgimage.style.fill='brown'
        break;
      case 9:
        coloring = 'white';
        svgimage.style.fill='white'
        break;
      case 10:
        coloring = 'yellow';
        svgimage.style.fill='yellow'
        break;
      default:
        break;
    }
    selectedColor = 0;
  }

function newfunction(){
  var newElement = document.getElementById("test-object").children;
  console.log(newElement[1]);
}
