var questions = [
  "1. Welche Orte liegen in den Tropen?",
  "2. Welche Orte liegen über 1000 Meter?",
  "3. Welche Orte liegen in Japan?",
  "4. Welche Orte sind auf der Südhalbkugel?",
  "5. Welche Orte liegen in Brasilien?",
  "6. Welche Orte sind im Januar über 10 Grad wärmer als im Juli?"];
var currentQuestionIndex = 0;

var filters = new Array(questions.length);
for (let i = 0; i < questions.length; i++) {
  filters[i] = [];
  filters[i][0] = ["", ""];
}

function saveFilters(){
  let inputRows = document.getElementsByClassName("input-row")
  filters[currentQuestionIndex] = [];
  for(i = 0; i < inputRows.length; i++){
    let string1 = inputRows[i].children[1].value;
    let string2 = inputRows[i].children[3].value;
    filters[currentQuestionIndex][i] = [string1, string2]
  }
}

function switchFilters(){
  deleteInputs();
  createInputs();
  createList();
}

function annotateList(){
  for(i = 0; i < wholeClimate.length - 1; i++){
    wholeClimate[i]['fits'] = evalFunction(wholeClimate[i]);
  }
}

function evalFunction(climateElement){
  switch (currentQuestionIndex) {
    case 0:
      if((parseFloat(climateElement['lat'].replace(',', '.'))) <= 23.5 && (parseFloat(climateElement['lat'].replace(',', '.'))) >= -23.5){
        return true;
      } return false;
    case 1:
      if(parseFloat(climateElement['elevation']) >= 1000){
        return true;
      } return false;
    case 2:
      if(climateElement['country'] == "Japan"){
        return true;
      } return false;
    case 3:
      if((parseFloat(climateElement['lat'].replace(',', '.'))) <= 0){
        return true;
      } return false;
      case 4:
      if(climateElement['country'] == "Brazil"){
        return true;
      } return false;
      case 5:
      if(climateElement['t1'] >= climateElement['t7'] + 10){
        return true;
      } return false;
    default:
      return false;
  }
}

function annotateListHeader(){
  let numResults = filteredClimate.length
  let numWholeResults = wholeClimate.length
  let numCorrectResults = Object.values(filteredClimate).reduce((a, { fits }) => a + fits, 0)
  let numWholeCorrectResults = Object.values(wholeClimate).reduce((a, { fits }) => a + fits, 0)
  let numIncorrectResults = numResults - numCorrectResults
  let numWholeIncorrectResults = numWholeResults - numWholeCorrectResults
  // multiplies the share of correct answers with the share of incorrect answers
  let score = parseInt(((numCorrectResults / numWholeCorrectResults) * (1 - numIncorrectResults / numResults) * 100))
  listResults.children[0].innerHTML = "Ergebnisse:   " + numResults + " von " + numWholeResults;
  listResults.children[1].innerHTML = " Korrekt:   " + numCorrectResults + " von " + numWholeCorrectResults;
  listResults.children[2].innerHTML = " Falsch:   " + numIncorrectResults  + " von " + numWholeIncorrectResults;
  filterResults.innerHTML = score  + "%";
}