shapes = document.getElementById('shape-collection').children;
svgTmpl = document.getElementsByClassName('play-object')[0];
randomFactor = parseInt(document.getElementById('randomFactor').value);;
numberRows = parseInt(document.getElementById('xObjects').value);
numberCols = parseInt(document.getElementById('yObjects').value);

function goToPreviousPage() {
   if (localStorage.getItem("exp-0") !== null) {
      document.location.href = "../labor/labor.html";
   } else {
      document.location.href = "../index/index.html";
   }
}


function init() {
   console.log('init lab')
   initFieldWithSize(numberCols,numberRows)
}

challenge = 0

function initFieldWithSize(x,y){
   removeField();
   numberRows = parseInt(document.getElementById('xObjects').value);
   numberCols = parseInt(document.getElementById('yObjects').value);
   field = document.getElementById('object-field');
   for(let i = 0; i < x; i++){
      newRow = document.createElement('div');
      newRow.setAttribute('class','column');
      field.appendChild(newRow);
      for(let j = 0; j < y; j++){
         newSvg = svgTmpl.cloneNode(true);
         field.children[i].appendChild(newSvg);
         field.children[i].children[j].appendChild(createElement());
      }
   }

   let numCells = numberRows * numberCols;
   var cellNames = ["TL", "T", "TR", "L", "M", "R", "BL", "B", "BR"]

   // generate 2 different rules
   var rule1Src = Math.floor(Math.random() * numCells)
   var rule1To = rule1Src;
   while (rule1Src === rule1To) {
      rule1To = Math.floor(Math.random() * numCells)
   }
   var rule2Src = rule1Src
   var rule2To = rule1To
   while (rule1Src === rule2Src && rule1To === rule2To) {
      rule2Src = Math.floor(Math.random() * numCells)
      while (rule2Src === rule2To) {
         rule2To = Math.floor(Math.random() * numCells)
      }
   }
   challenge = Math.floor(Math.random() * 2)

   document.getElementById("rule1-src").innerHTML = cellNames[rule1Src]
   document.getElementById("rule1-to").innerHTML = cellNames[rule1To]
   document.getElementById("rule2-src").innerHTML = cellNames[rule2Src]
   document.getElementById("rule2-to").innerHTML = cellNames[rule2To]
   document.getElementById("challenge-result").innerHTML = ""

}

function removeField(){
   field = document.getElementById('object-field');
   let columns = field.children.length
   for(let i = 0; i < columns; i++){
      field.removeChild(field.children[0]);
   }
}

function createElement(){
   object = createShape();
   changeColor(object);
   return object;
}

function stepForward(){
   randomFactor = parseInt(document.getElementById('randomFactor').value);
   for(let i = 0; i < numberCols; i++){
      for(let j = 0; j < numberRows; j++){
         let randomInt = Math.floor(Math.random() * randomFactor);
         if(randomInt === 0){
            randomAction(field.children[i].children[j].children[0]);
         }
      }
   }
}

// Changes either shape or color 50:50
function randomAction(object){
   let randomInt = Math.floor(Math.random() * 2);
   if(randomInt === 0){
      var currentColor = object.style.fill;
      while (object.style.fill === currentColor){
         changeColor(object);
      }
   }else{
      changeShape(object)
   }
}

function changeColor(object) {
   var randomInt = Math.floor(Math.random() * 4);
   switch (randomInt){
      case 0:
         object.style.fill = 'red'
         break;
      case 1:
         object.style.fill = 'green';
         break;
      case 2:
         object.style.fill = 'blue';
         break;
      case 3:
         object.style.fill = 'yellow';
         break;
      default:
         break;
   }
}

function changeShape(object){
   oldNode = object;
   currentShape = oldNode.nodeName;
   currentColor = oldNode.style.fill;
   newNode = createShape();
   while(newNode.nodeName === currentShape){
      newNode = createShape();
   }
   newNode.style.fill = currentColor;
   oldNode.parentNode.insertBefore(newNode, oldNode);
   oldNode.parentNode.removeChild(oldNode);
}

function createShape(){
   var randomInt = Math.floor(Math.random() * 4);
   newShape = shapes[randomInt].cloneNode(true);
   return newShape;
}

function challengeGuess(v) {
   var result
   if (challenge === v) {
      result = "correct"
   } else {
      result = "incorrect"
   }
   document.getElementById("challenge-result").innerHTML = result
}

function findObjInField(object) {
   for(let i = 0; i < numberCols; i++){
      for(let j = 0; j < numberRows; j++){
         if (field.children[i].children[j].children[0] == object) {
            return [i,j]
         }
      }
   }
}

var overlay = document.getElementById("field-overlay")
var arrowStartObj;
var arrowToObj;
function arrowStart(object){
   // console.log("start", object)
   arrowStartObj = object
}
function arrowEnd(object){
   arrowToObj = object
   // console.log("arrow", arrowStartObj, arrowToObj)
   // do not draw loop arrows
   if (arrowToObj === arrowStartObj) {
      return
   }
   var startCoords = findObjInField(arrowStartObj)
   var endCoords = findObjInField(arrowToObj)

   var arrowDir = "right"
   var width = 0
   var height = 0
   if (startCoords[1] === endCoords[1] && startCoords[0] > endCoords[0]) {
      arrowDir = "left"
      width = startCoords[0] - endCoords[0]
      var t = endCoords
      endCoords = startCoords
      startCoords = t
   } else if (startCoords[0] == endCoords[0] && startCoords[1] < endCoords[1]) {
      arrowDir = "down"
      height = endCoords[1] - startCoords[1]
   } else if (startCoords[0] == endCoords[0] && startCoords[1] > endCoords[1]) {
      arrowDir = "up"
      height = startCoords[1] - endCoords[1]
      var t = endCoords
      endCoords = startCoords
      startCoords = t
   }

   var pxOffsetTop = 80*startCoords[1]
   var pxOffsetLeft = 128*startCoords[0]
   var arrowHeight;
   var arrowWidth;
   switch (arrowDir) {
      case "up": case "down":
         arrowHeight = 50
         arrowWidth = 40
         pxOffsetTop += 60
         pxOffsetLeft += 20
         break;
      case "left": case "right":
         arrowHeight = 90
         arrowWidth = 100
         pxOffsetLeft += 50
         break;
      default:
         break;
   }


   var arrow = document.createElement('div');
   arrow.className = "arrow"
   arrow.style.position = "absolute"
   console.log(pxOffsetTop, pxOffsetLeft)
   arrow.style.top = "calc(20vh + " + pxOffsetTop + "px)"
   arrow.style.left = "calc(9vh + " + pxOffsetLeft + "px)"
   arrow.style.height = arrowHeight + "px"
   arrow.style.width = arrowWidth + "px"
   arrow.style.backgroundImage = "url('arrows/arrow-" + arrowDir + ".png')"
   arrow.style.backgroundSize = "100% 100%"
   arrow.style.backgroundRepeat = "no-repeat"
   overlay.appendChild(arrow)
   console.log(arrow)
}
function arrowTo(object){
   // console.log("to", object)
   arrowToObj = object;
}

init();
