var questions = [
  "Welche Orte haben eine Jahresdurchschnittstemperatur von über 20°C?",
  "Welche Orte haben eine Jahresdurchschnittstemperatur von über 10 °C und einen jährlichen Niederschlag von weniger als 1000 mm?",
  "Welche Orte haben eine Jahresdurchschnittstemperatur von über 12 °C, haben einen jährlichen Niederschlag von weniger als 500 mm und sind im Januar über 10 °C wärmer als im Juli?",
  "An welchen Orten ist der Niederschlag in der ersten Jahreshälfte mindestens drei mal so hoch wie in der zweiten?",
  "Welche Orte befinden sich auf der Südhalbkugel?",
  "Welche Orte befinden sich in den tropischen Zone?",
  "Welche Orte befinden sich weder in den nördlichen gemäßigten Zone noch in der nördlichen subtropischen Zone?",
  "Welche Orte befinden sich in der Mongolei?",
  "Welche Orte befinden sich in Argentinien?",
  "Welche Orte befinden sich auf den Britischen Inseln?",
  "Welche Orte befinden sich auf Madagaskar?",
  "Welche Orte befinden sich in Nordamerika (USA, Kanada, Mexiko)?",
  "Welche Orte befinden sich in Westafrika?",
  "Welche Orte befinden sich in Skandinavien?",
  "Welche Orte befinden sich in Japan?",
  "Welche Orte befinden sich in Indien?",
];

// Ergebnis-Schwellenwert für jede Aufgabe (in Prozent).
// Definiert, ab welchem Score das Ergebnis als gut gilt.
var questionThresholds = [
  90,  // 1: Einfacher Temperatur-Schwellenwert
  85,  // 2: Zwei einfache Schwellenwerte
  75,  // 3: Komplexer, erfordert Hemisphären-Verständnis
  65,  // 4: Knifflige Niederschlagsberechnung
  95,  // 5: Südhalbkugel – einfach über Breitengrad
  90,  // 6: Tropische Zone – einfach über Breitengrad
  80,  // 7: Kombinierte Zonen-Ausschlüsse
  40,  // 8: Mongolei – markantes Kontinentalklima
  30,  // 9: Argentinien – sehr vielfältiges Klima
  35,  // 10: Britische Inseln – gemäßigtes Seeklima
  35,  // 11: Madagaskar – tropische Insel
  20,  // 12: Nordamerika – riesig, extrem vielfältig
  40,  // 13: Westafrika – heiß, tropisch/Monsun
  45,  // 14: Skandinavien – kalt, ausgeprägte Jahreszeiten
  30,  // 15: Japan – maritim mit Monsuneinfluss
  35,  // 16: Indien – Monsun, tropisch bis gemäßigt
];
var currentQuestionIndex = 0;

var filterResultsLabel = document.getElementById("result-score-label");

var filters = new Array(questions.length);
for (let i = 0; i < questions.length; i++) {
  filters[i] = [];
}

function saveFilters() {
  // Filters are stored live; no action needed here.
}

function switchFilters() {
  if (typeof renderFilterList === "function") {
    renderFilterList();
  }
  if (typeof resetComposer === "function") {
    resetComposer(false);
  }
  if (typeof createList === "function") {
    createList();
  }
}

function annotateList() {
  for (i = 0; i < wholeClimate.length; i++) {
    wholeClimate[i]["fits"] = evalFunction(wholeClimate[i]);
  }
}

function evalFunction(climateElement) {
  switch (currentQuestionIndex) {
    case 0:
      // 1) T >= 20°C
      if (parseFloat(climateElement["T"]) >= 20) {
        return true;
      }
      return false;
    case 1:
      // 2) T >= 10°C und N <= 1000mm
      if (
        parseFloat(climateElement["T"]) >= 10 &&
        parseFloat(climateElement["N"]) <= 1000
      ) {
        return true;
      }
      return false;
    case 2:
      // 3) T >= 12°C, N <= 500mm, Jan > Jul+10
      if (
        parseFloat(climateElement["T"]) >= 12 &&
        parseFloat(climateElement["N"]) <= 500 &&
        climateElement["t1"] >= climateElement["t7"] + 10
      ) {
        return true;
      }
      return false;
    case 3:
      // 4) Niederschlag 1. Halbjahr >= 3x 2. Halbjahr
      if (
        parseFloat(climateElement["n1"]) +
          parseFloat(climateElement["n2"]) +
          parseFloat(climateElement["n3"]) +
          parseFloat(climateElement["n4"]) +
          parseFloat(climateElement["n5"]) +
          parseFloat(climateElement["n6"]) >=
        (parseFloat(climateElement["n7"]) +
          parseFloat(climateElement["n8"]) +
          parseFloat(climateElement["n9"]) +
          parseFloat(climateElement["n10"]) +
          parseFloat(climateElement["n11"]) +
          parseFloat(climateElement["n12"])) *
          3
      ) {
        return true;
      }
      return false;
    case 4:
      // 5) Südhalbkugel
      if (parseFloat(climateElement["lat"].replace(",", ".")) <= 0) {
        return true;
      }
      return false;
    case 5:
      // 6) Tropische Zone
      if (
        parseFloat(climateElement["lat"].replace(",", ".")) <= 23.5 &&
        parseFloat(climateElement["lat"].replace(",", ".")) >= -23.5
      ) {
        return true;
      }
      return false;
    case 6:
      // 7) Weder nördl. gemäßigt noch nördl. subtropisch
      if (
        parseFloat(climateElement["lat"].replace(",", ".")) <= 23.5 ||
        parseFloat(climateElement["lat"].replace(",", ".")) >= 66.5
      ) {
        return true;
      }
      return false;
    case 7:
      // 8) Mongolei
      if (climateElement["country"] == "Mongolia") {
        return true;
      }
      return false;
    case 8:
      // 9) Argentinien
      if (climateElement["country"] == "Argentina") {
        return true;
      }
      return false;
    case 9:
      // 10) Britische Inseln
      if (
        climateElement["country"] == "United Kingdom" ||
        climateElement["country"] == "Ireland"
      ) {
        return true;
      }
      return false;
    case 10:
      // 11) Madagaskar
      if (climateElement["country"] == "Madagascar") {
        return true;
      }
      return false;
    case 11:
      // 12) Nordamerika (USA, Kanada, Mexiko)
      if (
        climateElement["country"] == "USA" ||
        climateElement["country"] == "Canada" ||
        climateElement["country"] == "Mexico"
      ) {
        return true;
      }
      return false;
    case 12:
      // 13) Westafrika
      if (
        climateElement["country"] == "Benin" ||
        climateElement["country"] == "Cameroon" ||
        climateElement["country"] == "Cote d'Ivoire" ||
        climateElement["country"] == "Guinea" ||
        climateElement["country"] == "Mali" ||
        climateElement["country"] == "Niger" ||
        climateElement["country"] == "Nigeria" ||
        climateElement["country"] == "Sierra Leone" ||
        climateElement["country"] == "Togo" ||
        climateElement["country"] == "Gabon"
      ) {
        return true;
      }
      return false;
    case 13:
      // 14) Skandinavien (Norwegen, Schweden, Finnland, Island)
      if (
        climateElement["country"] == "Norway" ||
        climateElement["country"] == "Sweden" ||
        climateElement["country"] == "Finland" ||
        climateElement["country"] == "Iceland"
      ) {
        return true;
      }
      return false;
    case 14:
      // 15) Japan
      if (climateElement["country"] == "Japan") {
        return true;
      }
      return false;
    case 15:
      // 16) Indien
      if (climateElement["country"] == "India") {
        return true;
      }
      return false;
    default:
      return false;
  }
}

function annotateListHeader() {
  let numResults = filteredClimate.length;
  let numWholeResults = wholeClimate.length;
  let numCorrectResults = Object.values(filteredClimate).reduce(
    (a, { fits }) => a + fits,
    0,
  );
  let numWholeCorrectResults = Object.values(wholeClimate).reduce(
    (a, { fits }) => a + fits,
    0,
  );
  let numIncorrectResults = numResults - numCorrectResults;
  let numWholeIncorrectResults = numWholeResults - numWholeCorrectResults;
  // multiplies the share of correct answers with the share of incorrect answers
  let score = parseInt(
    (numCorrectResults / numWholeCorrectResults) *
      (1 - numIncorrectResults / numResults) *
      100,
  );
  let wholeButton = listResults ? listResults.children[0] : null;
  let correctButton = listResults ? listResults.children[1] : null;
  let incorrectButton = listResults ? listResults.children[2] : null;
  let setButton =
    typeof setResultButtonData === "function"
      ? setResultButtonData
      : function (button, countText, titleText) {
          if (!button) {
            return;
          }
          button.title = titleText;
          button.innerHTML = countText;
        };
  //listResults.children[0].innerHTML = " Von " + numWholeResults + " verfügbaren Orten befinden sich " + numResults + " im Suchergebnis.";
  if (noFilter) {
    setButton(
      wholeButton,
      String(numWholeResults),
      " Insgesamt gibt es " + numWholeResults + " verfügbaren Orte.",
    );
    setButton(
      correctButton,
      String(numWholeCorrectResults),
      " Insgesamt gibt es " + numWholeCorrectResults + " zutreffende Orte.",
    );
    setButton(
      incorrectButton,
      String(numWholeIncorrectResults),
      " Insgesamt gibt es " +
        numWholeIncorrectResults +
        " Orte außerhalb der gefragten Zone.",
    );
    filterResultsLabel.innerHTML = "Genauigkeit:";
    filterResults.innerHTML = "—";
    filterResults.classList.add("is-empty");
    filterResults.classList.remove("score-good");
    filterResults.classList.remove("score-bad");
  } else {
    filterResults.classList.remove("is-empty");
    if (numResults == 0) {
      deleteDiagram();
      console.log("no results");
      filterResultsLabel.innerHTML = "Kein Treffer:";
      filterResults.innerHTML = " 0 %";
      filterResults.classList.add("score-bad");
      filterResults.classList.remove("score-good");
    } else {
      console.log("schon results");
      setButton(
        wholeButton,
        numResults + " / " + numWholeResults,
        "Von " +
          numWholeResults +
          " verfügbaren Orten befinden sich " +
          numResults +
          " im Suchergebnis.",
      );
      setButton(
        correctButton,
        numCorrectResults + " / " + numWholeCorrectResults,
        " Insgesamt gibt es " +
          numWholeCorrectResults +
          " zutreffende Orte. Im Suchergebnis befinden sich " +
          numCorrectResults +
          " davon.",
      );
      setButton(
        incorrectButton,
        numIncorrectResults + " / " + numWholeIncorrectResults,
        " Insgesamt gibt es " +
          numWholeIncorrectResults +
          " Orte außerhalb der gefragten Zone. Im Suchergebnis befinden sich noch " +
          numIncorrectResults +
          " davon.",
      );
      var threshold = questionThresholds[currentQuestionIndex] || 0;
      filterResultsLabel.innerHTML = "Genauigkeit (Ziel: " + threshold + " %):";
      filterResults.innerHTML = score + " %";
      if (score >= threshold) {
        filterResults.classList.add("score-good");
        filterResults.classList.remove("score-bad");
      } else {
        filterResults.classList.add("score-bad");
        filterResults.classList.remove("score-good");
      }
    }
  }
}
