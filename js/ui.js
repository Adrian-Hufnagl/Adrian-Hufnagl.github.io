var climateList = document.getElementById("climate-list");
var listResults = document.getElementById("list-results");
var filterResults = document.getElementById("result-score");
var resultDescription = document.getElementById("result-description");
var diagramContainer = document.getElementById("diagram");
var inputCard = document.getElementById("iCard");
var stationName = document.getElementById("chart-name");
var stationHeight = document.getElementById("chart-height");
var disclaimerLabel = document.getElementById("disclaimer");
var varTable = document.getElementById("var-table");
var taskLabel = document.getElementById("task-label");
var taskSelect = document.getElementById("task-select");
var varTableToggle = document.getElementById("var-table-toggle");
var varTableContent = document.getElementById("var-table-content");

var filterList = document.getElementById("filter-list");
var filterComposer = document.getElementById("filter-composer");
var filterLeftInput = document.getElementById("filter-left");
var filterRightInput = document.getElementById("filter-right");
var filterAddButton = document.getElementById("filter-add");
var filterCountBadge = document.getElementById("filter-count");

var noFilter = true;
var activeFilterIndex = null;

function getCurrentFilters() {
  if (!filters || !filters[currentQuestionIndex]) {
    return [];
  }
  return filters[currentQuestionIndex];
}

function getActiveFiltersLocal() {
  return getCurrentFilters().filter(function (filter) {
    return filter && filter.active && filter.left && filter.right;
  });
}

function updateFilterCount() {
  if (!filterCountBadge) {
    return;
  }
  var activeCount = getActiveFiltersLocal().length;
  var totalCount = getCurrentFilters().length;
  if (totalCount === 0) {
    filterCountBadge.textContent = "0 aktiv";
  } else {
    filterCountBadge.textContent = activeCount + " / " + totalCount + " aktiv";
  }
}

function setComposerStep(step, shouldFocus) {
  if (shouldFocus === false) {
    return;
  }
  if (step === "right") {
    if (filterRightInput) {
      filterRightInput.focus();
    }
  } else {
    if (filterLeftInput) {
      filterLeftInput.focus();
    }
  }
}

function resetComposer(shouldFocus) {
  if (filterLeftInput) {
    filterLeftInput.value = "";
  }
  if (filterRightInput) {
    filterRightInput.value = "";
  }
  activeFilterIndex = null;
  setComposerStep("left", shouldFocus);
  if (filterAddButton) {
    filterAddButton.textContent = "Hinzufügen";
  }
  updateComposerValidity();
}

function loadComposerForFilter(index) {
  var list = getCurrentFilters();
  var filter = list[index];
  if (!filter) {
    return;
  }
  activeFilterIndex = index;
  if (filterLeftInput) {
    filterLeftInput.value = filter.left || "";
  }
  if (filterRightInput) {
    filterRightInput.value = filter.right || "";
  }
  if (filterAddButton) {
    filterAddButton.textContent = "Aktualisieren";
  }
  setComposerStep("left");
  updateComposerValidity();
  renderFilterList();
}

function renderFilterList() {
  if (!filterList) {
    return;
  }
  filterList.innerHTML = "";
  var list = getCurrentFilters();

  if (!list.length) {
    var empty = document.createElement("div");
    empty.className = "filter-empty";
    empty.textContent = "Noch keine Filter hinzugefügt.";
    filterList.appendChild(empty);
    updateFilterCount();
    return;
  }

  list.forEach(function (filter, index) {
    var card = document.createElement("div");
    var stateClass = filter.active ? "active" : "inactive";
    var editingClass = activeFilterIndex === index ? "editing" : "";
    card.className = "filter-card " + stateClass + " " + editingClass;
    card.dataset.index = index;

    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "filter-remove";
    removeBtn.setAttribute("aria-label", "Filter entfernen");
    removeBtn.textContent = "×";

    var header = document.createElement("div");
    header.className = "filter-card-header";

    var toggleLabel = document.createElement("label");
    toggleLabel.className = "filter-toggle";

    var toggleInput = document.createElement("input");
    toggleInput.type = "checkbox";
    toggleInput.checked = !!filter.active;

    var toggleBox = document.createElement("span");
    toggleBox.className = "filter-toggle-box";

    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(toggleBox);

    var expression = document.createElement("div");
    expression.className = "filter-expression";
    expression.textContent =
      (filter.left || "") + " >= " + (filter.right || "");

    header.appendChild(toggleLabel);
    header.appendChild(expression);

    card.appendChild(removeBtn);
    card.appendChild(header);

    if (!filter.active) {
      var meta = document.createElement("div");
      meta.className = "filter-meta";
      meta.textContent = "Inaktiv";
      card.appendChild(meta);
    }

    filterList.appendChild(card);
  });

  updateFilterCount();
}

function validateExpression(value, sideLabel) {
  if (!value) {
    showMessage("Bitte " + sideLabel + "e Seite ausfüllen");
    return false;
  }
  if (!checkSyntax(value)) {
    showMessage("Syntaxfehler " + sideLabel + "e Seite");
    return false;
  }
  if (!testCalc(value)) {
    showMessage(sideLabel + "e Seite lässt sich nicht berechnen");
    return false;
  }
  return true;
}

function isExpressionValid(value) {
  if (!value) {
    return false;
  }
  if (!checkSyntax(value)) {
    return false;
  }
  if (!testCalc(value)) {
    return false;
  }
  return true;
}

function updateComposerValidity() {
  var leftValue = filterLeftInput ? filterLeftInput.value.trim() : "";
  var rightValue = filterRightInput ? filterRightInput.value.trim() : "";
  var leftValid = isExpressionValid(leftValue);
  var rightValid = isExpressionValid(rightValue);
  if (filterLeftInput) {
    filterLeftInput.classList.toggle(
      "is-invalid",
      leftValue.length > 0 && !leftValid,
    );
  }
  if (filterRightInput) {
    filterRightInput.classList.toggle(
      "is-invalid",
      rightValue.length > 0 && !rightValid,
    );
  }
  var isValid = leftValid && rightValid;
  if (filterAddButton) {
    filterAddButton.disabled = !isValid;
    filterAddButton.setAttribute("aria-disabled", isValid ? "false" : "true");
  }
  return isValid;
}

function addOrUpdateFilter() {
  var left = filterLeftInput ? filterLeftInput.value.trim() : "";
  var right = filterRightInput ? filterRightInput.value.trim() : "";
  if (!validateExpression(left, "link")) {
    return;
  }
  if (!validateExpression(right, "recht")) {
    return;
  }

  var list = getCurrentFilters();
  var newFilter = {
    left: left,
    right: right,
    active: true,
  };

  if (activeFilterIndex !== null && list[activeFilterIndex]) {
    newFilter.active = list[activeFilterIndex].active;
    list[activeFilterIndex] = newFilter;
  } else {
    list.push(newFilter);
  }

  filters[currentQuestionIndex] = list;
  activeFilterIndex = null;
  renderFilterList();
  resetComposer();
  showMessage("Filter gespeichert", true);
  createList();
}

function removeFilter(index) {
  var list = getCurrentFilters();
  if (!list[index]) {
    return;
  }
  list.splice(index, 1);
  filters[currentQuestionIndex] = list;
  if (activeFilterIndex === index) {
    resetComposer();
  } else if (activeFilterIndex !== null && activeFilterIndex > index) {
    activeFilterIndex -= 1;
  }
  renderFilterList();
  createList();
}

function toggleFilterActive(index, isActive) {
  var list = getCurrentFilters();
  if (!list[index]) {
    return;
  }
  list[index].active = isActive;
  filters[currentQuestionIndex] = list;
  renderFilterList();
  createList();
}

function setupFilterUI() {
  if (!filterComposer) {
    return;
  }

  if (filterAddButton) {
    filterAddButton.addEventListener("click", function () {
      addOrUpdateFilter();
    });
  }

  if (filterLeftInput) {
    filterLeftInput.addEventListener("input", function () {
      updateComposerValidity();
    });
    filterLeftInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        setComposerStep("right");
      }
    });
  }

  if (filterRightInput) {
    filterRightInput.addEventListener("input", function () {
      updateComposerValidity();
    });
    filterRightInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        addOrUpdateFilter();
      }
    });
  }

  if (filterList) {
    filterList.addEventListener("click", function (event) {
      var removeButton = event.target.closest(".filter-remove");
      if (removeButton) {
        event.stopPropagation();
        var index = parseInt(
          removeButton.closest(".filter-card").dataset.index,
          10,
        );
        removeFilter(index);
        return;
      }

      var toggle = event.target.closest(".filter-toggle");
      if (toggle) {
        event.stopPropagation();
        return;
      }

      var card = event.target.closest(".filter-card");
      if (card) {
        var idx = parseInt(card.dataset.index, 10);
        loadComposerForFilter(idx);
      }
    });

    filterList.addEventListener("change", function (event) {
      if (event.target && event.target.type === "checkbox") {
        event.stopPropagation();
        var card = event.target.closest(".filter-card");
        if (!card) {
          return;
        }
        var index = parseInt(card.dataset.index, 10);
        toggleFilterActive(index, event.target.checked);
      }
    });
  }

  resetComposer();
  renderFilterList();
}

function createElementFromHTML(htmlString) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

function setResultButtonData(button, countText, titleText) {
  if (!button) {
    return;
  }
  if (typeof titleText === "string") {
    button.title = titleText;
  }
  var countEl = button.querySelector(".result-count");
  if (countEl) {
    countEl.textContent = countText;
  } else {
    button.textContent = countText;
  }
}

//Nach Klick wird Liste gefiltert und ausgegeben
function createList() {
  var activeFilters = getActiveFiltersLocal();
  if (!checkInputs()) {
    return;
  }
  if (activeFilters.length > 0) {
    showMessage("Filter wurden korrekt gesetzt!", true);
    noFilter = false;
  } else {
    noFilter = true;
  }
  filterData();
  while (climateList.firstChild) {
    climateList.removeChild(climateList.firstChild);
  }
  filterClimate();
  showAll();
}

function showAll() {
  listResults.children[0].classList.add("selected");
  listResults.children[1].classList.remove("selected");
  listResults.children[2].classList.remove("selected");
  resultDescription.innerHTML = listResults.children[0].title;
  while (climateList.firstChild) {
    climateList.removeChild(climateList.firstChild);
  }
  displayedClimate = filteredClimate;
  for (let i = 0; i < displayedClimate.length; i++) {
    climateList.appendChild(
      createListRow(
        displayedClimate[i]["name"],
        displayedClimate[i]["country"],
        displayedClimate[i]["fits"],
      ),
    );
  }
}

function showCorrect() {
  listResults.children[0].classList.remove("selected");
  listResults.children[1].classList.add("selected");
  listResults.children[2].classList.remove("selected");
  resultDescription.innerHTML = listResults.children[1].title;
  while (climateList.firstChild) {
    climateList.removeChild(climateList.firstChild);
  }
  displayedClimate = filteredClimate.filter(function (el) {
    return el.fits == true;
  });
  for (let i = 0; i < displayedClimate.length; i++) {
    climateList.appendChild(
      createListRow(
        displayedClimate[i]["name"],
        displayedClimate[i]["country"],
        displayedClimate[i]["fits"],
      ),
    );
  }
}

function showIncorrect() {
  listResults.children[0].classList.remove("selected");
  listResults.children[1].classList.remove("selected");
  listResults.children[2].classList.add("selected");
  resultDescription.innerHTML = listResults.children[2].title;
  while (climateList.firstChild) {
    climateList.removeChild(climateList.firstChild);
  }
  displayedClimate = filteredClimate.filter(function (el) {
    return el.fits == false;
  });
  for (let i = 0; i < displayedClimate.length; i++) {
    climateList.appendChild(
      createListRow(
        displayedClimate[i]["name"],
        displayedClimate[i]["country"],
        displayedClimate[i]["fits"],
      ),
    );
  }
}

function createInitialList() {
  filterData();
  filterClimate();
}

function createListRow(name, country, result) {
  const newEl = document
    .getElementsByClassName("climate-list-element")[0]
    .cloneNode();
  var dot = document.createElement("span");
  dot.className = result ? "list-dot list-dot--correct" : "list-dot list-dot--incorrect";
  newEl.appendChild(dot);
  const newName = document.createTextNode(name + " ");
  const newCountry = document.createElement("div");
  newCountry.className = "country-name";
  newCountry.innerHTML = country;
  newEl.appendChild(newName);
  newEl.classList.add(result ? "climate-list-element-correct" : "climate-list-element-incorrect");
  newEl.appendChild(newCountry);
  return newEl;
}

//Nimmt Klimadaten von geklicktem Element und schreibt es ins Diagrammfeld
function createDiagram(e) {
  var el = e.currentTarget;
  var elName = el.innerText.toString();
  var elParent = el.parentNode;
  var displayedIndex = Array.prototype.indexOf.call(elParent.children, el);
  var filteredIndex = filteredClimate.findIndex(
    (element) => element.name === elName.split(/\r?\n|\r|\n/g)[0],
  );
  if (document.getElementsByClassName("climate-list-element-selcted")[0]) {
    var oldEl = document.getElementsByClassName(
      "climate-list-element-selcted",
    )[0];
    oldEl.classList.remove("climate-list-element-selcted");
  }
  el.classList.add("climate-list-element-selcted");

  //Log the same text till there is a breakpoint
  selectPin(filteredIndex);

  stationName.innerHTML = elName;

  for (let i = 0; i < 12; i++) {
    const temperature = displayedClimate[displayedIndex][tMonths[i]];
    const precipitation = displayedClimate[displayedIndex][pMonths[i]];
    data[i].temp = temperature;
    data[i].prec = precipitation;
  }
  showStationData(displayedIndex);
  createNewGraph(data);
}

function deleteDiagram() {
  stationName.innerHTML = "Keine Station ausgewählt";
  stationHeight.innerHTML = "";
  var chartStats = document.getElementById("chart-stats");
  if (chartStats) chartStats.innerHTML = "";
  deleteGraph();
}

//Nimmt Stationsdaten von geklicktem Element und schreibt es ins Diagrammfeld
function showStationData(i) {
  let newStation = displayedClimate[i];
  let newLat = newStation["lat"];
  let newLon = newStation["long"];
  let newHeight = newStation["elevation"];
  stationHeight.innerHTML =
    "Koordinaten: " +
    "( " +
    newLat +
    " / " +
    newLon +
    " ) - Höhe: " +
    newHeight +
    "m";

  // Show average temperature (T) and cumulative precipitation (N)
  var chartStats = document.getElementById("chart-stats");
  if (chartStats) {
    var avgTemp = newStation["T"];
    var cumPrec = newStation["N"];
    chartStats.innerHTML =
      '<span class="chart-stat">' +
      '<span class="chart-stat-label">Ø Temperatur</span> ' +
      '<span class="chart-stat-var">(T)</span>: ' +
      '<span class="chart-stat-value chart-stat-temp">' + avgTemp + '°C</span>' +
      '</span>' +
      '<span class="chart-stat-separator">|</span>' +
      '<span class="chart-stat">' +
      '<span class="chart-stat-label">Σ Niederschlag</span> ' +
      '<span class="chart-stat-var">(N)</span>: ' +
      '<span class="chart-stat-value chart-stat-prec">' + cumPrec + ' mm</span>' +
      '</span>';
  }
}

function showMessage(str, success) {
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");
  x.innerHTML = str;
  if (success) {
    x.style.background = "#3a4";
  } else {
    x.style.background = "#a34";
  }
  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 3000);
}

// Task labels mapping
var taskLabels = [
  "Aufgabe 1",
  "Aufgabe 2",
  "Aufgabe 3",
  "Aufgabe 4",
  "Aufgabe 5",
  "Aufgabe 6",
  "Aufgabe 7",
  "Aufgabe 8",
  "Aufgabe 9",
  "Aufgabe 10",
  "Aufgabe 11",
  "Aufgabe 12",
  "Aufgabe 13",
  "Aufgabe 14",
  "Aufgabe 15",
  "Aufgabe 16",
];

// Function to update the textfield with the current question
function updateQuestion() {
  document.getElementById("question").textContent =
    questions[currentQuestionIndex];

  // Update task label
  if (taskLabel) {
    taskLabel.textContent = taskLabels[currentQuestionIndex] || "Aufgabe";
  }
  if (taskSelect) {
    taskSelect.value = String(currentQuestionIndex);
  }
}

// Function to go to the previous question
function previousQuestion() {
  saveFilters();
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
  saveFilters();
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
  let modal = document.getElementById("help-modal");

  if (modal.classList.contains("active")) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  } else {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

// Close modal on Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    let modal = document.getElementById("help-modal");
    if (modal && modal.classList.contains("active")) {
      toggleTutorial();
    }
  }
});

function toggleVarTable() {
  if (!varTableToggle || !varTableContent) {
    return;
  }
  varTableToggle.classList.toggle("expanded");
  varTableContent.classList.toggle("visible");
}

function setupVarTableToggle() {
  if (varTableToggle) {
    varTableToggle.addEventListener("click", toggleVarTable);
  }
}

function setupTaskSelect() {
  if (!taskSelect) {
    return;
  }
  taskSelect.innerHTML = "";
  questions.forEach(function (question, index) {
    var option = document.createElement("option");
    var label = taskLabels[index] || "Aufgabe " + (index + 1);
    option.value = String(index);
    option.textContent = label + " – " + question;
    taskSelect.appendChild(option);
  });
  taskSelect.value = String(currentQuestionIndex);
  taskSelect.addEventListener("change", function () {
    var nextIndex = parseInt(taskSelect.value, 10);
    if (Number.isNaN(nextIndex)) {
      return;
    }
    saveFilters();
    currentQuestionIndex = nextIndex;
    updateQuestion();
    switchFilters();
  });
}

function setActiveView(view) {
  document.body.setAttribute("data-view", view);
  let buttons = document.querySelectorAll(".view-toggle-btn");
  buttons.forEach(function (button) {
    const isActive = button.dataset.view === view;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function setupViewToggle() {
  let buttons = document.querySelectorAll(".view-toggle-btn");
  if (!buttons.length) {
    return;
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveView(button.dataset.view);
    });
  });

  let mobileQuery = window.matchMedia("(max-width: 980px)");

  function syncView() {
    if (mobileQuery.matches) {
      const currentView = document.body.dataset.view;
      if (currentView === "sidebar" || currentView === "main") {
        setActiveView(currentView);
      } else {
        setActiveView("main");
      }
    } else {
      document.body.setAttribute("data-view", "all");
      buttons.forEach(function (button) {
        button.classList.remove("active");
      });
    }
  }

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", syncView);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(syncView);
  }
  syncView();
}

function setupUI() {
  setupViewToggle();
  setupFilterUI();
  setupVarTableToggle();
  setupTaskSelect();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupUI);
} else {
  setupUI();
}
