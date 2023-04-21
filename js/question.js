var questions = [
  "1. Welche Orte liegen über 1000 Meter?",
  "2. Welche Orte liegen in den Tropen?",
  "3. Welche Orte sind in Japan?",
  "4. Welche Orte sind an der Küste?",
  "5. Welche Orte sind auf der Südhalbkugel?",
  "6. Welche Orte sind in den Alpen?"];
var currentQuestionIndex = 0;


function annotateList(){
  for(i = 0; i < wholeClimate.length - 1; i++){
    wholeClimate[i]['fits'] = evalFunction(wholeClimate[i]);
  }
}

function evalFunction(climateElement){
  switch (currentQuestionIndex) {
    case 0:
      if(parseFloat(climateElement['elevation']) >= 1000){
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
  listResults.children[3].innerHTML = " Ergebnis: " + score  + "%";
}