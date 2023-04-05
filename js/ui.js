var climateList = document.getElementById('climate-list')
var diagramContainer = document.getElementById('diagram')
var inputCard = document.getElementById('iCard')
var buttonRow = document.getElementsByClassName('btn-row')[0]
var stationName = document.getElementById('chart-name')
var stationHeight = document.getElementById('chart-height')
//var chart = document.getElementById('chartdiv-2')


function createInput(){
  let inputRows = document.getElementsByClassName("input-row")
  let newInput = inputRows[0].cloneNode(true)
  newInput.innerHTML = newInput.innerHTML.replace(/input-1/g, "input-" + (inputRows.length + 1))
  let counter = inputRows.length
  newInput.children[0].children[0].innerHTML = (counter + 1).toString()
  inputCard.insertBefore(newInput, buttonRow);
  attachBtn = createElementFromHTML('<button onclick="deleteInput()" class="btn btn-del"><i class="fa fa-trash"></i></button>')
  inputRows[counter].appendChild(attachBtn)
  if(counter > 1){
    document.getElementsByClassName("btn-del")[0].remove();
  }
}

function deleteInput(){
  let inputRows = document.getElementsByClassName("input-row")
  let newInputs = document.getElementsByClassName("input-row")
  let counter = newInputs.length
  newInputs[counter - 1].remove()
  if(counter > 2){
  attachBtn = createElementFromHTML('<button onclick="deleteInput()" class="btn btn-del"><i class="fa fa-trash"></i></button>')
  inputRows[counter - 2].appendChild(attachBtn)
  }
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

//Nach Klick wird Liste gefiltert und ausgegeben
function createList(){
  while (climateList.firstChild) {
    climateList.removeChild(climateList.firstChild);
  }
  filterClimate()
}

function createListRow(name){
  const newEl = document.getElementsByClassName("climate-list-element")[0].cloneNode()
  const newContent = document.createTextNode(name);
  newEl.appendChild(newContent);
  return newEl
}

//Nimmt Klimadaten von geklicktem Element und schreibt es ins Diagrammfeld
function createDiagram(e){
  var el = e.target;
  var elName = el.innerHTML.toString()
  var elParent = el.parentNode;
  var index = Array.prototype.indexOf.call(elParent.children, el);
  selectPin(index)
  console.log(index)
  stationName.innerHTML = elName

  for(let i = 0; i < 12; i++){
    const temperature =displayedClimate[index][tMonths[i]]
    const precipitation =displayedClimate[index][pMonths[i]]
    data[i].temp = temperature
    data[i].prec = precipitation
  }
  showStationData(index)
  createNewGraph(data);
}

//Nimmt Stationsdaten von geklicktem Element und schreibt es ins Diagrammfeld
function showStationData(i){
  let newStation = filteredClimate[i]
  //let newStation = findObject(filteredStations, 'WMO-StationID', parseInt(stationID))[0];
  //let newName = newStation['StationName']
  let newLat = newStation['lat']
  let newLon = newStation['long']
  let newHeight = newStation['elevation']
  stationHeight.innerHTML = "Koordinaten: " + '(' + newLat + '/' + newLon + ') - Height: ' + newHeight + 'm';
}

