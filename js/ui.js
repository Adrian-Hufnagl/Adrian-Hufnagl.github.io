var climateList = document.getElementById('climate-list')
var listResults = document.getElementById('list-results')
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
}

function deleteInput(e){
  let newInputs = document.getElementsByClassName("input-row")
  var el = e.currentTarget.parentNode;
  console.log(el)
  var elParent = el.parentNode;
  console.log(elParent)
  var index = Array.prototype.indexOf.call(elParent.children, el);
  console.log('delete' + index)
  if(newInputs.length == 1){
    console.log(newInputs[0].children[1])
    newInputs[0].children[1].value = "";
    newInputs[0].children[3].value = "";
  } else {
  newInputs[index - 2].remove()
  //console.log(index)
  console.log(newInputs.length)
}
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

//Nach Klick wird Liste gefiltert und ausgegeben
function createList(){
  if(checkInputs()){
    showMessage("Filter wurden korrekt gesetzt!", true)
    filterData();
  }
  while (climateList.firstChild) {
    climateList.removeChild(climateList.firstChild);
  }
  filterClimate()
}

function createInitialList(){
  filterData();
  filterClimate()
}

function createListRow(name, country, result){
  const newEl = document.getElementsByClassName("climate-list-element")[0].cloneNode()
  const newName = document.createTextNode(name + " ");
  const newCountry = document.createElement('div');
  newCountry.className = "country-name"
  newCountry.innerHTML = country;
  newEl.appendChild(newName);
  if(result){
    newEl.appendChild(createElementFromHTML('<i class="fa fa-check iconCheck"></i>'))
    newEl.style.background = '#f3fcf4'
  } else {
    newEl.appendChild(createElementFromHTML('<i class="fa fa-times iconFalse"></i>)'))
    newEl.style.background = '#fcf4fc'
  }
  newEl.appendChild(newCountry);
  //const newResult = document.createTextNode(result);
  //newEl.appendChild(newResult);
  
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

function showMessage(str,success){
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");
  x.innerHTML = str;
  if(success){
    x.style.background ="#3a4";
  } else {
    x.style.background ="#a34";
  }
  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

// Function to update the textfield with the current question
function updateQuestion() {
  document.getElementById("question").textContent = questions[currentQuestionIndex];
}

// Function to go to the previous question
function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    updateQuestion();
  } else {
    currentQuestionIndex = questions.length - 1;
    updateQuestion();
  }
  createList();
}

// Function to go to the next question
function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    updateQuestion();
  } else {
    currentQuestionIndex = 0;
    updateQuestion();
  }
  createList();
}

// Initialize the textfield with the first question
updateQuestion();

function deleteTutorial(){
  console.log('remove tutorial')
  let tutorial = document.getElementById('tutorial')
  tutorial.remove();
}