var densityDisclaimer = "Bedenke, dass die Daten von den Wetterstationien die Klimazonen nicht vollständig erfassen. Zonen außerhalb von Wetterstationen werden nicht berücksichtigt. Ebenso fallen Zonen in denen viele Wetterstationen liegen mehr ins Gewicht."
var questions = [
  "Probier die Filter- und Suchfunktionen aus. Wenn du auf den Pfeil klickst, kommst du zu den Aufgaben.",
  "1. Welche Orte haben eine Jahresdurchschnittstemperatur von über 20°C?",
  "2. Welche Orte haben eine Jahresdurchschnittstemperatur von über 10°C, und haben einen jährlichen Niederschlag von weniger als 1000mm?",
  "3. Welche Orte haben eine Jahresdurchschnittstemperatur von über 12°C, haben einen jährlichen Niederschlag von weniger als 500mm und sind im Jänner über 10°C wärmer als im Juli?",
  "4. Welche Orte haben in der ersten Jahreshälfte drei mal so viel Niederschlag wie in der zweiten Hälfte?",
  "5. Welche Orte sind auf der Südhalbkugel?",
  "6. Welche Orte liegen in den Tropen? (Solare Abgrenzung: Tropen liegen zwischen 23°26′ nördlicher und südlicher Breite)",
  "7. Welche Orte liegen weder in den nördlichen gemäßigten Breiten noch in den nördlichen Subtropen? (Solare Abgrenzung: Nördliche Gemäßigte Breiten liegen zwischen 66°33′55″ und 45° nördlicher Breite. Nördliche Subtropen liegen zwischen 45° und 23°26′ nördlicher Breite)",
  "8. Welche Orte liegen in Argentinien oder Chile?",
  "9. Welche Orte liegen auf den Britischen Inseln?",
  "10. Welche Orte liegen auf Madagaskar?"
];
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
        return true;     
    case 1:
      if(parseFloat(climateElement['T']) >= 20){
        return true;
      } return false;
    case 2:
      if(parseFloat(climateElement['T']) >= 10 && parseFloat(climateElement['N']) <= 1000){
        return true;
      } return false;
    case 3:
      if(parseFloat(climateElement['T']) >= 12 && parseFloat(climateElement['N']) <= 500 && climateElement['t1'] >= climateElement['t7'] + 10){
        return true;
      } return false;
    case 4:
      if(
        (parseFloat(climateElement['n1']) +
         parseFloat(climateElement['n2']) +
         parseFloat(climateElement['n3']) +
         parseFloat(climateElement['n4']) +
         parseFloat(climateElement['n5']) +
         parseFloat(climateElement['n6'])) >=
         (parseFloat(climateElement['n7']) +
          parseFloat(climateElement['n8']) +
          parseFloat(climateElement['n9']) +
          parseFloat(climateElement['n10']) +
          parseFloat(climateElement['n11']) +
          parseFloat(climateElement['n12'])) * 3
         ){
        return true;
      } return false;
    case 5:
      if((parseFloat(climateElement['lat'].replace(',', '.'))) <= 0){
        return true;
      } return false;
      case 6:
      if((parseFloat(climateElement['lat'].replace(',', '.'))) <= 23.5 && (parseFloat(climateElement['lat'].replace(',', '.'))) >= -23.5){
        return true;
      } return false;
      case 7:
        if((parseFloat(climateElement['lat'].replace(',', '.'))) <= 23.5 || (parseFloat(climateElement['lat'].replace(',', '.'))) >= 66.5){
        return true;
      } return false;
      case 8:
      if(climateElement['country'] == "Argentina" || climateElement['country'] == "Chile"){
        return true;
      } return false;
      case 9:
      if(climateElement['country'] == "United Kingdom of Great Britain and N.-Irela." || climateElement['country'] == "Ireland"){
        return true;
      } return false;
      case 10:
      if(climateElement['country'] == "Madagascar"){
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
  //listResults.children[0].innerHTML = " Von " + numWholeResults + " verfügbaren Orten befinden sich " + numResults + " im Suchergebnis.";
  listResults.children[0].innerHTML = + numResults + " / " + numWholeResults;
  listResults.children[0].title = "Von " + numWholeResults + " verfügbaren Orten befinden sich " + numResults + " im Suchergebnis.";
  listResults.children[1].title = " Insgesamt gibt es " + numWholeCorrectResults + " zutreffende Orte. Im Suchergebnis befinden sich " + numCorrectResults + " davon.";
  listResults.children[1].innerHTML = numCorrectResults + " / " + numWholeCorrectResults;
  listResults.children[2].title = " Insgesamt gibt es " +  + numWholeIncorrectResults  + " Orte außerhalb der gefragten Zone. Im Suchergebnis befinden sich noch " + numIncorrectResults + " davon.";
  listResults.children[2].innerHTML =  numIncorrectResults + " / " + numWholeIncorrectResults;
  filterResults.innerHTML = score  + "%";
}