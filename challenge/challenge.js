shapes = document.getElementById('shape-collection').children;
svgTmpl = document.getElementsByClassName('play-object')[0];
randomFactor = parseInt(document.getElementById('randomFactor').value);;
numberRows = parseInt(document.getElementById('xObjects').value);
numberCols = parseInt(document.getElementById('yObjects').value);
firstAdd = true;

//var eventChain = [[false,false,false],[[0,1],false,[1,0]],[false,false,false]]
var eventChain = [[false,false,false],[false,false,false],[false,false,false]]
var lastStep = [[false,false,false],[false,false,false],[false,false,false]]
var currentSource = 0;

function goToPreviousPage() {
   if (localStorage.getItem("exp-0") !== null) {
      document.location.href = "../labor/labor.html";
   } else {
      document.location.href = "../index/index.html";
   }
}


function init() {
   console.log('init lab')
   initFieldWithSize(numberCols,numberRows);
   console.log(eventChain);
}

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

// iterates over every filed
// when not part of event chain
// -> behave randomly
// when part of event chain
// check for changes in last step
// and overwrite last step
function stepForward(){
   randomFactor = parseInt(document.getElementById('randomFactor').value);
   var newStep = [[false,false,false],[false,false,false],[false,false,false]]
   for(let i = 0; i < numberCols; i++){
      for(let j = 0; j < numberRows; j++){
         if(eventChain[j][i] === false){
            let randomInt = Math.floor(Math.random() * randomFactor);
            if(randomInt === 0){
               console.log('perform random action on eventC because eventC j i == false')
               console.log(j.toString() + i.toString())

               randomAction(field.children[i].children[j].children[0]);
               newStep[j][i] = true;
            }
         } else{
            if(lastStep[eventChain[j][i][0]][eventChain[j][i][1]]){
               console.log('--------------------------')
               console.log('-> scheduled: EventChain i j values')
               console.log(i.toString() + j.toString())
               console.log(eventChain[j][i][0].toString() + [eventChain[j][i][1]].toString() + ' --> ' + i.toString() + j.toString())
               console.log('change field: ' + i.toString() + ',' + j.toString());
               randomAction(field.children[i].children[j].children[0]);
               newStep[j][i] = true;
            }
         }
         currentTile = document.getElementById('memory')
         if(newStep[j][i] === true){
            currentTile.children[j].children[i].innerHTML = '1';
         }else {
            currentTile.children[j].children[i].innerHTML = '0';
         }
      }
   }
   lastStep = newStep;
   console.log('--------------------------Step-Over-------')

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
         object.style.fill = '#c59434'
         break;
      case 1:
         object.style.fill = '#6f7498';
         break;
      case 2:
         object.style.fill = '#a3b7f9';
         break;
      case 3:
         object.style.fill = '#092c48';
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

function openPopup(popupContainer){
   var popup = popupContainer.children[1];
   popup.classList.toggle("show");
   for (let i = 0; i < eventChain.length; i++) {
      for (let j = 0; j < eventChain[0].length; j++) {
         if(eventChain[i][j]){
            popup.children[i].children[j].setAttribute('style','opacity: 0.3; cursor: default');
            popup.children[i].children[j].classList.remove('add-number-hover');
            popup.children[i].children[j].removeAttribute('onclick');
         }else{
            popup.children[i].children[j].setAttribute('style','opacity: 1; cursor: pointer');
            popup.children[i].children[j].classList.add('add-number-hover');
            popup.children[i].children[j].setAttribute('onclick','addNumber(' + i + ',' + j + ',this);');
         }
      }
   }
   if(currentSource !== 0){
      console.log('entferne source')
      console.log(currentSource);
      console.log(parseInt(currentSource/3-1));
      console.log((currentSource-1)%3);

      popup.children[parseInt(currentSource/3-1)].children[(currentSource-1)%3].setAttribute('style','opacity: 0.3; cursor: default');
      popup.children[parseInt(currentSource/3-1)].children[(currentSource-1)%3].classList.remove('add-number-hover');
      popup.children[parseInt(currentSource/3-1)].children[(currentSource-1)%3].removeAttribute('onclick');
   }
}

function addNumber(x,y,addObject){
   console.log('changeNumber ' + x + ' ' + y);
   console.log(addObject);
   var colCurrent = addObject.parentNode.parentNode.parentNode.parentNode;
   var colParent = colCurrent.parentNode;
   console.log(colParent);
// The equivalent of parent.children.indexOf(child)
   var colNumber = Array.prototype.indexOf.call(colParent.children, colCurrent);
   console.log('colNumber')
   console.log(colNumber)
   if(colNumber === 0){
      currentSource = addObject.innerHTML;
      console.log('currentSource')
      console.log(currentSource)
   }else{
      colLengthBefore = colParent.children[colNumber-2].children.length-1
      heritage = colParent.children[colNumber-2].children[colLengthBefore].innerHTML - 1;
      console.log('heritage');
      console.log(heritage);
      //chainVal = parseInt((lastCol[x].innerHTML-1))
      //currentXY = [parseInt(chainVal/3),chainVal%3]

      eventChain[x][y] = [parseInt(heritage/3),heritage%3]
   }
   buildChain();
}

function buildChain(){
   var chainField = document.getElementById('chain-tree');
   reduceChainToButton();
   buildChainSource();
   buildChainAddExtension();
   var hasMoreSteps = true;
   while(hasMoreSteps){
      hasMoreSteps = false;
      lastCol = chainField.children[chainField.children.length-3].children;
      for (let x = 0; x < lastCol.length; x++) {
         chainVal = parseInt((lastCol[x].innerHTML-1))
         currentXY = [parseInt(chainVal/3),chainVal%3]
         for (let i = 0; i < eventChain.length; i++) {
            for (let j = 0; j < eventChain[0].length; j++) {
               if(eventChain[i][j][0] === currentXY[0]
                   && eventChain[i][j][1] === currentXY[1]){
                  chainField.children[chainField.children.length-1].appendChild(buildChainNode(i*3+j+1));
                  //trying to put add icon in the back
                  //oldAdd = chainField.children[chainField.children.length-1].children[chainField.children[chainField.children.length-1].children.length-1];
                  //chainField.children[chainField.children.length-1].appendChild(oldAdd);
                  hasMoreSteps = true;
               }
            }
         }
   }
      if(hasMoreSteps){
         buildChainAddExtension()
      }
   }
   console.log('-------------------------------------');
   console.log('after building was finished');
   console.log('Event Chain is now:');
   console.log(eventChain);
}

function buildChainSource(){
   var chainField = document.getElementById('chain-tree');
   chainField.appendChild(buildColumn());
   var reverseArr = buildArrow();
   reverseArr.textContent = '<-';
   chainField.lastChild.appendChild(reverseArr);
   chainField.appendChild(buildColumn());
   chainField.lastChild.appendChild(buildChainNode(findSource()));
}

function buildChainAddExtension(){
   var chainField = document.getElementById('chain-tree');
   chainField.appendChild(buildColumn());
   chainField.lastChild.appendChild(buildArrow());
   chainField.appendChild(buildColumn());
   chainField.lastChild.appendChild(buildAddNode());
}

function buildColumn(){
   var buildCol = document.createElement('div');
   buildCol.setAttribute('class','column');
   buildCol.setAttribute('style','border-left: 1px solid #000;');
   return buildCol;
}

function buildChainNode(input){
   var chainNode = document.getElementsByClassName('chain-number')[0].cloneNode(true);
   chainNode.textContent = input;
   return chainNode
}

function buildAddNode(){
   var addNode = document.getElementById('add-button').cloneNode(true);
   if(firstAdd){
      addNode.children[1].classList.toggle("show");
      firstAdd = false;
   }
   return addNode;
}

function buildArrow(){
   var buildArrs = document.getElementsByClassName('chain-arrow');
   return buildArrs[buildArrs.length - 1].cloneNode(true);
}

function reduceChainToButton(){
   var chainField = document.getElementById('chain-tree');
   for (let i = 2; i <= chainField.children.length;){
      chainField.children[1].remove();
   }
}

function findSource(){
   for(let i = 0; i < eventChain.length; i++) {
      for (let j = 0; j < eventChain[0].length; j++) {
         if (eventChain[i][j] && !eventChain[eventChain[i][j][0]][eventChain[i][j][1]]){
            return eventChain[i][j][0]*3 + eventChain[i][j][1] + 1;
         }
      }
   }
   console.log('currentSource')
   console.log(currentSource)
   return currentSource;

}



init();
