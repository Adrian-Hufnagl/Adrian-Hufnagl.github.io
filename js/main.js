var wholeClimate
var filteredClimate = [];
var displayedClimate

var tMonths = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12",]
var pMonths = ["n1", "n2", "n3", "n4", "n5", "n6", "n7", "n8", "n9", "n10", "n11", "n12",]
var correctAnswers = 0;

initData()

//JSON wird eingelesen und als JS-Objekt gespeichert
function initData() {
  fetch('./masterdata.json')
    .then((response) => response.json())
    .then(json => wholeClimate = json)
    .then(console.log("done"))
}

//Klima und Stationsdaten werden gefiltert und in Liste und Karte angegeben
function filterClimate() {
  annotateList();
  annotateListHeader();
  displayedClimate = filteredClimate
  deleteMarkers();
  for (let i = 0; i < displayedClimate.length; i++) {
    climateList.appendChild(createListRow(displayedClimate[i]['name'], displayedClimate[i]['country'], displayedClimate[i]['fits']));
    if (i === displayedClimate.length - 1) {
      addStationToMap(i, true, 0xd43456)
    } else {
      addStationToMap(i, false, 0xd43456)
    }
  }
  if(climateList.children.length > 0){
    climateList.children[0].click();
  }
}

const findObject = (obj = {}, key, value) => {
  const result = [];
  const recursiveSearch = (obj = {}) => {
    if (!obj || typeof obj !== 'object') {
      return;
    }
    if (obj[key] === value) {
      result.push(obj);
    }
    Object.keys(obj).forEach(function (k) {
      recursiveSearch(obj[k]);
    });
  }
  recursiveSearch(obj);
  return result;
}
