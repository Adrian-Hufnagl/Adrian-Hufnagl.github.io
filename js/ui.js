var climateList = document.getElementById('climate-list')
var listResults = document.getElementById('list-results')
var filterResults = document.getElementById('result-score')
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
  newInputs[index - 1].remove()
  //console.log(index)
  console.log(newInputs.length)
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
  if(checkInputs()){
    showMessage("Filter wurden korrekt gesetzt!", true)
    filterData();
  }
  while (climateList.firstChild) {
    climateList.removeChild(climateList.firstChild);
  }
  filterClimate()
}

function showAll() {
  listResults.children[0].style.fontWeight = "bold"
  listResults.children[1].style.fontWeight = "normal"
  listResults.children[2].style.fontWeight = "normal"
  while (climateList.firstChild) {
    climateList.removeChild(climateList.firstChild);
  }
  displayedClimate = filteredClimate;
  for (let i = 0; i < displayedClimate.length; i++) {
    climateList.appendChild(createListRow(displayedClimate[i]['name'], displayedClimate[i]['country'], displayedClimate[i]['fits']));
  }
}

function showCorrect() {
  listResults.children[0].style.fontWeight = "normal"
  listResults.children[1].style.fontWeight = "bold"
  listResults.children[2].style.fontWeight = "normal"
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
  listResults.children[0].style.fontWeight = "normal"
  listResults.children[1].style.fontWeight = "normal"
  listResults.children[2].style.fontWeight = "bold"
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
  } else {
    newEl.appendChild(createElementFromHTML('<i class="fa fa-times iconFalse"></i>)'))
    newEl.style.background = '#fcf4fc'
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
  console.log(elName.split(/\r?\n|\r|\n/g)[0])
  console.log(filteredIndex)
  //Log the same text till there is a breakpoint
  selectPin(filteredIndex)
  console.log(displayedIndex)
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
}

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

function deleteTutorial(){
  console.log('remove tutorial')
  let tutorial = document.getElementById('tutorial')
  tutorial.remove();
}