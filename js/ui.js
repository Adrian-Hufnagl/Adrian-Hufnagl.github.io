var climateList = document.getElementById('climate-list')
var listResults = document.getElementById('list-results')
var filterResults = document.getElementById('result-score')
var resultDescription = document.getElementById('result-description')
var diagramContainer = document.getElementById('diagram')
var inputCard = document.getElementById('iCard')
var inputRowsContainer = document.getElementById('input-rows')
var stationName = document.getElementById('chart-name')
var stationHeight = document.getElementById('chart-height')
var disclaimerLabel = document.getElementById('disclaimer')
var varTable = document.getElementById('var-table')

var noFilter = true;

function createInput(){
  let inputRows = document.getElementsByClassName("input-row")
  let newInput = inputRows[0].cloneNode(true)
  newInput.innerHTML = newInput.innerHTML.replace(/input-1/g, "input-" + (inputRows.length + 1))
  let counter = inputRows.length
  newInput.children[0].children[0].innerHTML = (counter + 1).toString()

  inputRowsContainer.appendChild(newInput);

}

function createInputs(){
  let inputRows = document.getElementsByClassName("input-row")
  for(i = 0; i < filters[currentQuestionIndex].length - 1; i++){
    createInput()
  }
  for(i = 0; i < filters[currentQuestionIndex].length; i++){
    let String1 = filters[currentQuestionIndex][i][0]
    let String2 = filters[currentQuestionIndex][i][1]
    inputRows[i].children[1].value = String1
    inputRows[i].children[3].value = String2
  }
}

function deleteInput(e){
  let newInputs = document.getElementsByClassName("input-row")
  var el = e.currentTarget.parentNode;

  var elParent = el.parentNode;

  var index = Array.prototype.indexOf.call(elParent.children, el);

  if(newInputs.length == 1){
  
    newInputs[0].children[1].value = "";
    newInputs[0].children[3].value = "";
  } else {
  
  newInputs[index].remove()


}
}

function deleteInputs(){
  let newInputs = document.getElementsByClassName("input-row")
  for(i = newInputs.length - 1; i > 0; i--){
    newInputs[i].remove()
  }
  newInputs[0].children[1].value = "";
  newInputs[0].children[3].value = "";
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

//Nach Klick wird Liste gefiltert und ausgegeben
function createList(){
  let firstInput = inputRowsContainer.children[0].children[1].value;


  if(checkInputs()){
    if(firstInput != ""){
    showMessage("Filter wurden korrekt gesetzt!", true)
    noFilter = false;
  }
  filterData();
}
  if(firstInput == ""){
    noFilter = true;
  }
  while (climateList.firstChild) {
    climateList.removeChild(climateList.firstChild);
  }
  filterClimate()
  showAll()
}

function showAll() {
  listResults.children[0].classList.add("selected")
  listResults.children[1].classList.remove("selected")
  listResults.children[2].classList.remove("selected")
  resultDescription.innerHTML = listResults.children[0].title;
  while (climateList.firstChild) {
    climateList.removeChild(climateList.firstChild);
  }
  displayedClimate = filteredClimate;
  for (let i = 0; i < displayedClimate.length; i++) {
    climateList.appendChild(createListRow(displayedClimate[i]['name'], displayedClimate[i]['country'], displayedClimate[i]['fits']));
  }
}

function showCorrect() {
  listResults.children[0].classList.remove("selected")
  listResults.children[1].classList.add("selected")
  listResults.children[2].classList.remove("selected")
  resultDescription.innerHTML = listResults.children[1].title;
  while (climateList.firstChild) {
    climateList.removeChild(climateList.firstChild);
  }
  displayedClimate = filteredClimate.filter(function (el) {
    return el.fits == true;
  });
  for (let i = 0; i < displayedClimate.length; i++) {
    climateList.appendChild(createListRow(displayedClimate[i]['name'], displayedClimate[i]['country'], displayedClimate[i]['fits']));
  }
}

function showIncorrect() {
  listResults.children[0].classList.remove("selected")
  listResults.children[1].classList.remove("selected")
  listResults.children[2].classList.add("selected")
  resultDescription.innerHTML = listResults.children[2].title;
  while (climateList.firstChild) {
    climateList.removeChild(climateList.firstChild);
  }
  displayedClimate = filteredClimate.filter(function (el) {
    return el.fits == false;
  });
  for (let i = 0; i < displayedClimate.length; i++) {
    climateList.appendChild(createListRow(displayedClimate[i]['name'], displayedClimate[i]['country'], displayedClimate[i]['fits']));
  }
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
    newEl.classList.add("climate-list-element-correct")
  } else {
    newEl.appendChild(createElementFromHTML('<i class="fa fa-times iconFalse"></i>)'))
    newEl.style.background = '#fcf4fc'
    newEl.classList.add("climate-list-element-incorrect")
  }
  newEl.appendChild(newCountry);
  return newEl
}

//Nimmt Klimadaten von geklicktem Element und schreibt es ins Diagrammfeld
function createDiagram(e){
  var el = e.currentTarget;
  var elName = el.innerText.toString()
  var elParent = el.parentNode;
  var displayedIndex = Array.prototype.indexOf.call(elParent.children, el);
  var filteredIndex = filteredClimate.findIndex(
    (element) => element.name === elName.split(/\r?\n|\r|\n/g)[0]
  );
  if(document.getElementsByClassName("climate-list-element-selcted")[0]){
    var oldEl = document.getElementsByClassName("climate-list-element-selcted")[0];
    oldEl.classList.remove("climate-list-element-selcted");
  } 
  el.classList.add("climate-list-element-selcted");

  //Log the same text till there is a breakpoint
  selectPin(filteredIndex)

  stationName.innerHTML = elName

  for(let i = 0; i < 12; i++){
    const temperature = displayedClimate[displayedIndex][tMonths[i]]
    const precipitation = displayedClimate[displayedIndex][pMonths[i]]
    data[i].temp = temperature
    data[i].prec = precipitation
  }
  showStationData(displayedIndex)
  createNewGraph(data);
}

function deleteDiagram(){
  stationName.innerHTML = "Keine Station ausgewählt"
  stationHeight.innerHTML = ""
  deleteGraph();
}

//Nimmt Stationsdaten von geklicktem Element und schreibt es ins Diagrammfeld
function showStationData(i){
  let newStation = displayedClimate[i]
  let newLat = newStation['lat']
  let newLon = newStation['long']
  let newHeight = newStation['elevation']
  stationHeight.innerHTML = "Koordinaten: " + '( ' + newLat + ' / ' + newLon + ' ) - Höhe: ' + newHeight + 'm';
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
  switch (currentQuestionIndex) {
    case 0: case 1: case 2: case 3:
      varTable.style.display = "table";
      break;
    case 6:
      disclaimerLabel.innerHTML = densityDisclaimer1; 
      break;
    case 7:
      disclaimerLabel.innerHTML = densityDisclaimer2; 
      break;
    default: 
    disclaimerLabel.innerHTML = "";
    varTable.style.display = "none";
}}

// Function to go to the previous question
function previousQuestion() {
  saveFilters()
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    updateQuestion();
  } else {
    currentQuestionIndex = questions.length - 1;
    updateQuestion();
  }
  switchFilters();
}

// Function to go to the next question
function nextQuestion() {
  saveFilters()
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    updateQuestion();
  } else {
    currentQuestionIndex = 0;
    updateQuestion();
  }
  switchFilters();
}

// Initialize the textfield with the first question
updateQuestion();

function toggleTutorial() {
  let tutorial = document.getElementById('tutorial');
  let button = document.getElementById('toggle-button');

  if (tutorial.style.display === "none") {
    tutorial.style.display = "block";
    button.classList.add('rotated');
  } else {
    tutorial.style.display = "none";
    button.classList.remove('rotated');
  }
}