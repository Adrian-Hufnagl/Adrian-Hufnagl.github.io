var explainer = false;
localStorage.setItem("selectedColor", 0);
var selectedColorElement;
var coloring = '';
var playerRole;
var characterCards;

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

  // Zuerst gewählte Karte auf neuen Screen Übertagen
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
  script.src = "../js/main.js";

  selectedCardElements = colorCard.children[0].contentDocument.children[0].children[0].children[1].children;
  colorCard.children[0].contentDocument.children[0].appendChild(script);
  for (let i = 1; i < selectedCardElements.length; i++) {
    selectedCardElements[i].setAttribute("onclick", "colorObject(this)");
    selectedCardElements[i].classList.add('svg-element');
    var css = 'svg-element:hover{-webkit-filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7));filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7));}';
    var style = document.createElement('style');
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    selectedCardElements[i].appendChild(style);

  }

}

function lockCharacter() {
  var stage2 = document.getElementById("stage-2");
  var stage3 = document.getElementById("stage-3");
  var colorCard = document.getElementById("big-color-card");
  var selectedCardElements = colorCard.children;
  document.getElementById("explain-text-stage-2").innerHTML = 'This is your character!';
  var colors = document.getElementsByClassName('color-column');
  var saveButton = document.getElementById('save-button');
  var restartButton = document.getElementById('restart-button');
  stage2.children[2].appendChild(restartButton);
  saveButton.remove();
  colors[1].remove();
  colors[0].remove();
  /*var saveCard = document.getElementById("big-save-card");
  for (let i = 0; i <= selectedCardElements.length; i++) {
    console.log('lock element: ' + i)
    console.log(selectedCardElements[i])
    saveCard.appendChild(selectedCardElements[0]);
  }
  stage2.style.display = "none";
  stage3.style.display = "inline-block";*/
}

function restartGame() {
  location.reload();
}

function selectColor(color, colorElement) {
  localStorage.setItem("selectedColor", color);
  selectedColorElement = colorElement;
  //Make Cursor the color Bucket
  var cursor = document.body;
  cursor.setAttribute("style", "cursor: url(../img/buckets/" + localStorage.getItem('selectedColor').toString() + ".png), auto;");
  console.log('color as setted in main.js:');
  console.log(localStorage.getItem('selectedColor'));
}

function colorObject(object) {
  if(parseInt(localStorage.getItem('selectedColor')) !== 0){
    svgPaths = object.children[0].children;
    object.removeAttribute('onclick');
    console.log('color as received in colorObject:');
    console.log(localStorage.getItem('selectedColor'));
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
        colorString = '#ffffff'
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
    console.log('colorString');
    console.log(colorString);
    for (var i = 0; i < svgPaths.length; i++) {
      if(svgPaths[i].hasAttribute('fill')){
        //console.log(svgPaths[i]);
        svgPaths[i].style.fill = colorString;
      }
    }

    localStorage.setItem('selectedColor', 0);
    selectedColorElement.style.display = 'none';
  }
}
