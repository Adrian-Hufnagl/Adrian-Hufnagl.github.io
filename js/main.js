var explainer = false;
localStorage.setItem("selectedColor", 0);
localStorage.setItem("gameStep", 0);
localStorage.setItem("gameEnd", 0);
localStorage.setItem("disabled", []);
var selectedColorElement;
var coloring = '';
var playerRole;
var colorCards;

var selectedCardElements;
var selectedCardContent;
var selectedCard
var colorCard = document.getElementById("big-color-card");

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
  /*save the chosen role */
  playerRole = creator;
  /*alert(playerRole);*/
  setTextForRole();
  setCardsBackground();

  if (!creator) {
    explainer = true;
  }
  var stage1 = document.getElementById("stage-1");
  var start = document.getElementById("start");
  stage1.style.display = "block";
  start.style.display = "none";

}

function setTextForRole() {
  let text1;
  let text2;
  if (playerRole === 'dresser') {
    text1 = "Pick a figure:";
  } else if (playerRole === 'copycat') {
    text1 = "Pick the figure that the Dresser describes to you:";
  }
  document.getElementById("explain-text-stage-1").innerHTML = text1;

  if (playerRole === 'dresser') {
    text2 = "Click on a colour and a piece of clothing to paint it:";
  } else {
    text2 = "Click on a colour and a piece of clothing to paint it. Follow the Dressers' description.";
  }
  document.getElementById("explain-text-stage-2").innerHTML = text2;
}

function setCardsBackground() {
  cardElements = 10;
  var color;
  for (var i = 1; i < cardElements + 1; i++) {
    if (playerRole === 'dresser') {
      color = "#f99443"; /* color-orange */
    } else if (playerRole === 'copycat') {
      color = "#4394f9"; /* color-blue*/
    }
    document.getElementById('card-' + [i]).style.backgroundColor = color;
  }
}

function switchStage(cardNumber) {

  // Zuerst gew??hlte Karte auf neuen Screen ??bertagen
  //
  console.log('switch with cardNumber: ' + cardNumber.toString());
  selectedCard = document.getElementById("card-" + cardNumber.toString());
  selectedCardContent = selectedCard.children[1];
  colorCard.appendChild(selectedCardContent);


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
  delay(500).then(() => makeElementsColorizable());
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function makeElementsColorizable() {
  var script = document.createElement('script');
  var endGame = 0;
  script.src = "../js/main.js";
  selectedCardElements = colorCard.children[0].contentDocument.children[0].children;
  colorCard.children[0].contentDocument.children[0].appendChild(script);
  for (let i = 1; i < selectedCardElements.length; i++) {
    selectedCardElements[i].setAttribute("onclick", "colorObject(this)");
    selectedCardElements[i].classList.add('svg-element');
    selectedCardElements[i].setAttribute("onmouseover", "style='stroke: black; -webkit-filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7)); filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7)); cursor:pointer;'");
    selectedCardElements[i].setAttribute("onmouseout", "style='stroke: none; -webkit-filter: none; filter: none;'");
    if (selectedCardElements[i].classList.contains('svg-element')
      && !selectedCardElements[i].hasAttribute('display')
    && selectedCardElements[i].tagName === 'g'){
      endGame += 1;
    }
  }

  colorCards = document.getElementsByClassName('color-card');
  console.log(colorCards);
  delay(200).then(() => localStorage.setItem("gameEnd", endGame));
}

function lockCharacter() {
  if(localStorage.getItem('gameStep') >= localStorage.getItem('gameEnd')){
    console.log(localStorage.getItem('gameStep'))
    console.log(localStorage.getItem('gameEnd'))
    var stage2 = document.getElementById("stage-2");
    document.getElementById("explain-text-stage-2").innerHTML = 'This is your character!';
    var colors = document.getElementsByClassName('color-column');
    var saveButton = document.getElementById('save-button');
    var restartButton = document.getElementById('restart-button');
    stage2.children[2].appendChild(restartButton);
    saveButton.remove();
    colors[1].remove();
    colors[0].remove();
  }
}

function restartGame() {
  location.reload();
}

function selectColor(color, colorElement) {
  console.log('gameEnd: ' + localStorage.getItem('gameEnd'));
  if (parseInt(localStorage.getItem("selectedColor")) === 0
  && localStorage.getItem('gameStep') < localStorage.getItem('gameEnd')) {
    localStorage.setItem("selectedColor", color);
    selectedColorElement = colorElement;
    //Make border for Clicked Color
    selectedColorElement.setAttribute("style", "opacity: 0.2;");
    selectedColorElement.classList.remove('color-card-hover');
    selectedColorElement.removeAttribute('onclick');

    if(parseInt(localStorage.getItem('gameStep'))+1 >= parseInt(localStorage.getItem('gameEnd'))){
      var saveButton = document.getElementById('save-button');
      saveButton.disabled = false;
      saveButton.setAttribute("style", "opacity: 1;");
    }
    //Make Cursor the color Bucket
    //var cursor = document.body;
    //cursor.setAttribute("style", "cursor: copy;");
    //cursor.setAttribute("style", "cursor: url(../img/buckets/" + localStorage.getItem('selectedColor').toString() + ".png), auto;");
  }
}

function colorObject(object) {
  if(parseInt(localStorage.getItem('selectedColor')) !== 0){
    svgPaths = object.children[0].children;
    object.removeAttribute('onclick');
    console.log('color as received in colorObject: ' + localStorage.getItem('selectedColor'));
    var colorSwitch = localStorage.getItem('selectedColor');
    console.log('colorSwitch ' + colorSwitch);
    var colorString;
    switch (parseInt(localStorage.getItem('selectedColor'))) {
      case 1:
        console.log('Switch')
        coloring = 'grey';
        colorString = '#aaaaaa'
        break;
      case 2:
        console.log('Switch')
        coloring = 'orange';
        colorString = '#f99443'
        break;
      case 3:
        console.log('Switch')
        coloring = 'green';
        colorString = '#33bb33'
        break;
      case 4:
        console.log('Switch')
        coloring = 'pink';
        colorString = '#f75399'
        break;
      case 5:
        console.log('Switch')
        coloring = 'blue';
        colorString = '#4394f9'
        break;
      case 6:
        console.log('Switch')
        coloring = 'black';
        colorString = '#000000'
        break;
      case 7:
        console.log('Switch')
        coloring = 'red';
        colorString = '#d00000'
        break;
      case 8:
        console.log('Switch')
        coloring = 'brown';
        colorString = '#8B4513'
        break;
      case 9:
        console.log('Switch')
        coloring = 'white';
        colorString = '#fff9f8'
        break;
      case 10:
        console.log('Switch')
        coloring = 'yellow';
        colorString = '#f9c403'
        break;
      default:
        console.log('Outside Switch')
        break;
    }
    for (var i = 0; i < svgPaths.length; i++) {
      if(svgPaths[i].hasAttribute('fill')){
        //console.log(svgPaths[i]);
        svgPaths[i].style.fill = colorString;
      }
    }

    localStorage.setItem('selectedColor', 0);
    localStorage.setItem('gameStep', parseInt(localStorage.getItem('gameStep')) + 1 );
    console.log('gamestep: ' + localStorage.getItem('gameStep'));
  }
}

function init(){
  delay(500).then(() => document.getElementById("challenge-button").addEventListener('click', (event) => {
    document.location.href = "../challenge/challenge.html";
  }));

}

init();
