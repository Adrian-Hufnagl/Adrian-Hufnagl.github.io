var climateList = document.getElementById("climate-list");
var listResults = document.getElementById("list-results");
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
var helpModal = document.getElementById("help-modal");
var helpChoiceCards = document.querySelectorAll(".help-choice-card");
var helpDismissButtons = document.querySelectorAll("[data-help-dismiss]");
var tourOverlay = document.getElementById("tour-overlay");
var tourTooltip = document.querySelector(".tour-tooltip");
var tourTitle = document.querySelector(".tour-title");
var tourText = document.querySelector(".tour-text");
var tourProgress = document.querySelector(".tour-progress");
var tourReadingNav = document.querySelector(".tour-reading-nav");
var tourReadingNavList = document.querySelector(".tour-reading-nav-list");
var tourPrev = document.querySelector(".tour-prev");
var tourNext = document.querySelector(".tour-next");
var tourClose = document.querySelector(".tour-close");
var tourShield = document.querySelector(".tour-shield");
var tourSpotlight = document.querySelector(".tour-spotlight");

var resultDock = document.getElementById("result-dock");
var resultDockPanel = document.getElementById("result-dock-panel");
var resultTargetValue = document.getElementById("result-target-value");
var resultScoreBar = document.getElementById("result-score-bar");
var resultScoreTarget = document.getElementById("result-score-target");
var resultCorrectCount = document.getElementById("result-correct-count");
var resultCorrectShare = document.getElementById("result-correct-share");
var resultIncorrectCount = document.getElementById("result-incorrect-count");
var resultIncorrectShare = document.getElementById("result-incorrect-share");
var resultFinalScore = document.getElementById("result-final-score");

var resultDockState = {
  lastStats: null,
  stepTimers: [],
  collapseTimer: null,
  hasInitialized: false,
};

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
  resetComposer(false);
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

  resetComposer(false);
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

function clampValue(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatCount(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }
  return value.toLocaleString("de-DE");
}

function formatPercentRatio(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.round(value * 100);
}

function animateNumber(el, fromValue, toValue, duration, formatter) {
  if (!el) {
    return;
  }
  var start = null;
  var startValue = typeof fromValue === "number" ? fromValue : 0;
  var endValue = typeof toValue === "number" ? toValue : 0;
  var totalDuration = duration || 600;
  var animId = (parseInt(el.dataset.animId || "0", 10) || 0) + 1;
  el.dataset.animId = String(animId);

  function step(timestamp) {
    if (el.dataset.animId !== String(animId)) {
      return;
    }
    if (!start) {
      start = timestamp;
    }
    var progress = Math.min((timestamp - start) / totalDuration, 1);
    var currentValue = startValue + (endValue - startValue) * progress;
    if (typeof formatter === "function") {
      el.textContent = formatter(currentValue, endValue);
    } else {
      el.textContent = Math.round(currentValue);
    }
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function setBarProgress(el, fromPercent, toPercent, animate) {
  if (!el) {
    return;
  }
  var startValue = clampValue(fromPercent || 0, 0, 100);
  var endValue = clampValue(toPercent || 0, 0, 100);
  if (!animate) {
    el.style.transition = "none";
    el.style.width = endValue + "%";
    return;
  }
  el.style.transition = "none";
  el.style.width = startValue + "%";
  requestAnimationFrame(function () {
    el.style.transition = "width 700ms var(--ease-out)";
    el.style.width = endValue + "%";
  });
}

function clearStepTimers() {
  if (!resultDockState.stepTimers) {
    return;
  }
  resultDockState.stepTimers.forEach(function (timer) {
    clearTimeout(timer);
  });
  resultDockState.stepTimers = [];
}

function setActiveStep(stepKey) {
  if (!resultDockPanel) {
    return;
  }
  var stepOrder = ["correct", "incorrect"];
  var activeIdx = stepKey ? stepOrder.indexOf(stepKey) : stepOrder.length;
  var steps = resultDockPanel.querySelectorAll(".result-step");
  steps.forEach(function (step) {
    var idx = stepOrder.indexOf(step.dataset.step);
    step.classList.toggle("is-active", step.dataset.step === stepKey);
    step.classList.toggle("is-done", idx >= 0 && idx < activeIdx);
  });
}

function expandResultDock() {
  if (!resultDock) {
    return;
  }
  resultDock.classList.add("is-expanded");
  if (resultDockState.collapseTimer) {
    clearTimeout(resultDockState.collapseTimer);
  }
}

function scheduleCollapse(delay) {
  if (resultDockState.collapseTimer) {
    clearTimeout(resultDockState.collapseTimer);
  }
  resultDockState.collapseTimer = setTimeout(function () {
    if (resultDock && !resultDock.matches(":hover")) {
      resultDock.classList.remove("is-expanded");
    }
  }, delay);
}

if (resultDock) {
  resultDock.addEventListener("mouseenter", function () {
    if (resultDockState.collapseTimer) {
      clearTimeout(resultDockState.collapseTimer);
    }
    resultDock.classList.add("is-expanded");
  });
  resultDock.addEventListener("mouseleave", function () {
    if (resultDockState.collapseTimer) {
      clearTimeout(resultDockState.collapseTimer);
    }
    resultDockState.collapseTimer = setTimeout(function () {
      if (resultDock) {
        resultDock.classList.remove("is-expanded");
      }
    }, 2000);
  });
}

function updateResultDock(stats, options) {
  if (!resultDock || !stats) {
    return;
  }

  var prev = resultDockState.lastStats || stats;
  resultDockState.lastStats = stats;
  var shouldAnimate = !(options && options.animate === false);
  var shouldExpand = resultDockState.hasInitialized;

  if (options && options.expand === false) {
    shouldExpand = false;
  }
  if (options && options.expand === true) {
    shouldExpand = true;
  }

  if (!resultDockState.hasInitialized) {
    shouldAnimate = false;
  }

  if (shouldExpand) {
    expandResultDock();
  }

  resultDockState.hasInitialized = true;

  var scoreValue = clampValue(stats.score || 0, 0, 100);
  var thresholdValue = clampValue(stats.threshold || 0, 0, 100);
  var prevScore = clampValue(prev.score || 0, 0, 100);

  // Compute share values
  var correctShare = stats.totalCorrect
    ? stats.queryCorrect / stats.totalCorrect
    : 0;
  var incorrectShare = stats.totalIncorrect
    ? stats.queryIncorrect / stats.totalIncorrect
    : 0;
  var correctPct = formatPercentRatio(correctShare);
  var incorrectPct = formatPercentRatio(incorrectShare);

  var prevCorrectShare = prev.totalCorrect
    ? prev.queryCorrect / prev.totalCorrect
    : 0;
  var prevIncorrectShare = prev.totalIncorrect
    ? prev.queryIncorrect / prev.totalIncorrect
    : 0;

  // The bar intermediate position: new Treffer + old Nicht Treffer penalty
  var prevCleanFactor = prev.queryTotal
    ? 1 - prev.queryIncorrect / prev.queryTotal
    : 1;
  var intermediateBar = clampValue(
    Math.round(correctShare * prevCleanFactor * 100),
    0,
    100,
  );

  if (resultTargetValue) {
    resultTargetValue.textContent = thresholdValue + " %";
  }
  if (resultScoreTarget) {
    resultScoreTarget.style.left = thresholdValue + "%";
  }

  clearStepTimers();

  // --- No animation: set everything immediately ---
  if (!shouldAnimate) {
    if (resultFinalScore) {
      resultFinalScore.textContent = stats.hasScore ? scoreValue + " %" : "—";
    }
    if (resultScoreBar) {
      setBarProgress(resultScoreBar, 0, scoreValue, false);
    }
    if (resultCorrectCount) {
      resultCorrectCount.textContent =
        formatCount(stats.queryCorrect) +
        " / " +
        formatCount(stats.totalCorrect);
    }
    if (resultCorrectShare) {
      resultCorrectShare.textContent = correctPct + "%";
    }
    if (resultIncorrectCount) {
      resultIncorrectCount.textContent =
        formatCount(stats.queryIncorrect) +
        " / " +
        formatCount(stats.totalIncorrect);
    }
    if (resultIncorrectShare) {
      resultIncorrectShare.textContent = incorrectPct + "%";
    }
    if (shouldExpand) {
      scheduleCollapse(2000);
    }
    return;
  }

  // --- Animated sequence ---
  // Timeline:
  //   t1  200ms  – highlight "Treffer", animate share numbers
  //   t2  700ms  – bar moves to intermediate (correctShare%), score counts up
  //   t3 1600ms  – highlight "Nicht Treffer", animate share numbers
  //   t4 2100ms  – bar moves to final score, score counts to final

  // Step 1: Treffer share
  var t1 = 200;
  var s1 = setTimeout(function () {
    setActiveStep("correct");
    animateNumber(
      resultCorrectCount,
      prev.queryCorrect || 0,
      stats.queryCorrect,
      600,
      function (v) {
        return (
          formatCount(Math.round(v)) + " / " + formatCount(stats.totalCorrect)
        );
      },
    );
    animateNumber(
      resultCorrectShare,
      formatPercentRatio(prevCorrectShare),
      correctPct,
      600,
      function (v) {
        return Math.round(v) + "%";
      },
    );
  }, t1);

  // Step 2: bar moves to intermediate, score animates to intermediate
  var t2 = t1 + 500;
  var s2 = setTimeout(function () {
    setBarProgress(resultScoreBar, prevScore, intermediateBar, true);
    if (resultFinalScore) {
      animateNumber(
        resultFinalScore,
        prevScore,
        intermediateBar,
        700,
        function (v) {
          return Math.round(v) + " %";
        },
      );
    }
  }, t2);

  // Step 3: Nicht Treffer share
  var t3 = t2 + 900;
  var s3 = setTimeout(function () {
    setActiveStep("incorrect");
    animateNumber(
      resultIncorrectCount,
      prev.queryIncorrect || 0,
      stats.queryIncorrect,
      600,
      function (v) {
        return (
          formatCount(Math.round(v)) + " / " + formatCount(stats.totalIncorrect)
        );
      },
    );
    animateNumber(
      resultIncorrectShare,
      formatPercentRatio(prevIncorrectShare),
      incorrectPct,
      600,
      function (v) {
        return Math.round(v) + "%";
      },
    );
  }, t3);

  // Step 4: bar moves to final score, score animates to final
  var t4 = t3 + 500;
  var s4 = setTimeout(function () {
    setActiveStep(null);
    setBarProgress(resultScoreBar, intermediateBar, scoreValue, true);
    if (resultFinalScore) {
      animateNumber(
        resultFinalScore,
        intermediateBar,
        scoreValue,
        700,
        function (v) {
          return Math.round(v) + " %";
        },
      );
    }
  }, t4);

  resultDockState.stepTimers.push(s1, s2, s3, s4);

  // Schedule collapse after the last animation finishes (~700ms) + a short viewing buffer
  if (shouldExpand) {
    scheduleCollapse(t4 + 700 + 1500);
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
  dot.className = result
    ? "list-dot list-dot--correct"
    : "list-dot list-dot--incorrect";
  newEl.appendChild(dot);
  const newName = document.createTextNode(name + " ");
  const newCountry = document.createElement("div");
  newCountry.className = "country-name";
  newCountry.innerHTML = country;
  newEl.appendChild(newName);
  newEl.classList.add(
    result ? "climate-list-element-correct" : "climate-list-element-incorrect",
  );
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
      '<span class="chart-stat-value chart-stat-temp">' +
      avgTemp +
      "°C</span>" +
      "</span>" +
      '<span class="chart-stat-separator">|</span>' +
      '<span class="chart-stat">' +
      '<span class="chart-stat-label">Σ Niederschlag</span> ' +
      '<span class="chart-stat-var">(N)</span>: ' +
      '<span class="chart-stat-value chart-stat-prec">' +
      cumPrec +
      " mm</span>" +
      "</span>";
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

var tourState = {
  mode: null,
  index: 0,
  activeTarget: null,
  previousView: null,
  wasMobile: false,
};

var studentTourSteps = [
  {
    title: "Aufgabe verstehen",
    text: "Lies die Aufgabe oben <strong>genau</strong>. Nutze die Pfeile oder das Dropdown, um die Aufgabe zu wechseln.",
    target: ".task-description-box",
    view: "sidebar",
  },
  {
    title: "Variablen-Tabelle öffnen",
    text: "Hier stehen die Variablen, die in den Diagrammen dargestellt werden. <strong>t1–t12</strong> = Monats‑Temperaturen, <strong>n1–n12</strong> = Monats‑Niederschläge, <strong>T</strong> = Jahresmittel‑Temperatur, <strong>N</strong> = Jahresniederschlag.",
    target: ".var-table-section",
    view: "sidebar",
  },
  {
    title: "Filterformel bauen",
    text: "Links und Rechts können <strong>Formeln</strong> eingegeben werden (z.B. <strong>t1 + t2</strong>) und rechts (z.B. <strong>40</strong>). So entsteht eine Bedingung, die jede Station erfüllen muss, um als Treffer zu gelten. Klicken Sie auf Hinzufügen, um die Bedingung zu speichern.",
    target: "#filter-composer",
    view: "sidebar",
  },
  {
    title: "Filterliste steuern",
    text: "Klicke <strong>Hinzufügen</strong> und Filter werden hier in einer Liste gespeichert. Mehrere Filter wirken gemeinsam als <strong>Gesamtbedingung</strong> – nur Stationen, die alles erfüllen, bleiben.",
    target: ".filter-panel",
    view: "sidebar",
  },
  {
    title: "Karte lesen",
    text: "Auf der <strong>Karte</strong> zeigen <strong>grüne</strong> Punkte passende Stationen, <strong>rote</strong> passen nicht. Achte auf räumliche Muster.",
    target: ".map-section",
    view: "main",
  },
  {
    title: "Ergebnisse filtern",
    text: "Wechsle in der Liste zwischen <strong>Alle</strong>, <strong>Treffer</strong> und <strong>Nicht Treffer</strong>. Wähle eine Station, um das Diagramm und die Details zu aktualisieren.",
    target: ".list-container",
    view: "main",
  },
  {
    title: "Klimadiagramm lesen",
    text: "Im <strong>Klimadiagramm</strong> siehst du den Monatsverlauf von Temperatur und Niederschlag. Vergleiche Höhen, Tiefen und Jahreszeiten.",
    target: "#diagram",
    view: "main",
  },
  {
    title: "Ergebnisziel prüfen",
    text: "Das <strong>Ergebnis‑Dock</strong> zeigt <strong>Treffer</strong>, <strong>Nicht Treffer</strong> und den <strong>Zielwert</strong>. Passe Filter an, bis du das Ziel erreichst.",
    target: "#result-dock",
    view: "main",
  },
  {
    title: "Auf dem Handy umschalten",
    text: "Auf kleinen Bildschirmen wechselst du unten zwischen <strong>Filter</strong> und <strong>Karte & Liste</strong>. So bleibt alles gut lesbar.",
    target: ".view-toggle-dock",
    view: "main",
  },
];

var teacherTourSteps = [
  {
    title: "Geofilter",
    buzzword: "Geofilter",
    text: "<p>Die Anwendung ist ein <strong>Arbeitswerkzeug</strong>, mit dem Schülerinnen und Schüler <strong>Klimazonen</strong> anhand realer <strong>Klimadaten</strong> untersuchen und begründen können.</p>",
    view: "sidebar",
  },
  {
    title: "Anwendung",
    buzzword: "Anwendung",
    text: "<p>Geofilter stellt eine Sammlung von Orten mit zugehörigen <strong>Klimadaten</strong> bereit: <strong>Temperatur-</strong> und <strong>Niederschlagswerte</strong> über das Jahr.</p><p>Schülerinnen und Schüler formulieren <strong>Kriterien</strong> und prüfen, auf welche Orte diese zutreffen.</p>",
    view: "sidebar",
  },
  {
    title: "Beispielfragen",
    buzzword: "Beispielfragen",
    text: '<ul class="tour-reading-list"><li>Wo herrscht ganzjährig viel <strong>Niederschlag</strong>?</li><li>Welche Orte haben ausgeprägte <strong>Trockenzeiten</strong>?</li><li>Welche Orte passen zu einer bestimmten <strong>Klimazone</strong>?</li></ul><p>Zu jedem Ort kann ein <strong>Klimadiagramm</strong> angezeigt werden. Ergebnisse können dadurch überprüft und fachlich begründet werden.</p><p>Ziel ist nicht das schnelle Finden der "richtigen Lösung", sondern das Nachvollziehen von Zusammenhängen zwischen <strong>Daten</strong> und <strong>geografischer Einordnung</strong>.</p>',
    view: "sidebar",
  },
  {
    title: "Lernziel",
    buzzword: "Lernziel",
    text: "<p>Die Anwendung unterstützt vor allem folgende fachliche Kompetenzen:</p><ul class=\"tour-reading-list\"><li><strong>Klimadiagramme</strong> lesen und interpretieren</li><li><strong>Temperatur-</strong> und <strong>Niederschlagsverläufe</strong> vergleichen</li><li><strong>Klimazonen</strong> anhand von Merkmalen begründen</li><li>Aussagen über <strong>Regionen</strong> mit <strong>Daten</strong> belegen</li></ul><p>Schüler arbeiten damit mit denselben Informationen wie im Buch, jedoch nicht nur beschreibend, sondern <strong>untersuchend</strong>.</p>",
    view: "sidebar",
  },
  {
    title: "Lehrperson",
    buzzword: "Lehrperson",
    text: "<p>Die Lehrperson bleibt ein zentraler Bestandteil des Unterrichts.</p><ul class=\"tour-reading-list\"><li>Sie stellt die <strong>Aufgabenstellung</strong>.</li><li>Sie begleitet die <strong>Bearbeitung</strong>.</li><li>Sie bespricht die <strong>Ergebnisse</strong> im Anschluss gemeinsam.</li></ul><p>Die Anwendung dient dabei als Arbeitsmaterial, vergleichbar mit <strong>Karte</strong>, <strong>Atlas</strong> oder <strong>Experiment</strong> im naturwissenschaftlichen Unterricht.</p>",
    view: "sidebar",
  },
  {
    title: "Einsatz",
    buzzword: "Einsatz",
    text: "<p>Der Einsatz bietet sich besonders an:</p><ul class=\"tour-reading-list\"><li>nach einer Einführung in <strong>Klimadiagramme</strong>,</li><li>bei der Festigung von <strong>Klimazonen</strong>,</li><li>oder als <strong>Übungs-</strong> bzw. <strong>Vertiefungsphase</strong>.</li></ul><p>Er ist nicht als alleinstehende Unterrichtsstunde gedacht, sondern als Teil einer <strong>Unterrichtssequenz</strong>.</p>",
    view: "sidebar",
  },
  {
    title: "Arbeitsweise",
    buzzword: "Arbeitsweise",
    text: "<ul class=\"tour-reading-list\"><li>Die Klasse erhält eine <strong>Fragestellung</strong>.</li><li>Schüler probieren <strong>Kriterien</strong> aus und prüfen verschiedene Orte.</li><li>Sie vergleichen <strong>Klimadiagramme</strong>.</li><li>Ergebnisse werden anschließend gemeinsam besprochen.</li></ul><p>Die Anwendung bietet damit eine Möglichkeit, Inhalte aktiv zu bearbeiten, während die fachliche <strong>Einordnung</strong> im Unterrichtsgespräch erfolgt.</p><p><strong>Im nächsten Schritt startet der Walkthrough durch die Oberfläche.</strong></p>",
    view: "sidebar",
  },
  {
    title: "Lernziel & Leitfrage",
    buzzword: "Lernziel",
    text: "Formulieren Sie das <strong>Lernziel</strong> und lesen Sie die <strong>Aufgabe</strong> gemeinsam. Mit den Pfeilen oder dem Dropdown wechseln Sie Aufgaben und Vergleichsziele.",
    target: ".task-description-box",
    view: "sidebar",
  },
  {
    title: "Variablen klären",
    buzzword: "Variablen",
    text: "Erklären Sie die Bedeutung von <strong>t1–t12</strong>, <strong>n1–n12</strong>, <strong>T</strong> und <strong>N</strong> als Klimamittelwerte, wie sie auch in Diagrammen dargestellt werden.",
    target: ".var-table-section",
    view: "sidebar",
  },
  {
    title: "Hypothesen als Filter",
    buzzword: "Filterregeln",
    text: "Die Filter werden mit einem Größer-Gleich-Operator definiert. Überführen Sie die Fragestellung in <strong>Filterregeln</strong> (z.B. <strong>t1 + t2 ≥ 40</strong>). Nutzen Sie einfache Beispiele, bevor Sie komplexe Bedingungen kombinieren. In einer Zeile können beliebige mathematische Konstrukte verwendet werden.",
    target: "#filter-composer",
    view: "sidebar",
  },
  {
    title: "Vergleichen & justieren",
    buzzword: "Vergleich",
    text: "Hier werden Filter hinterlegt, damit Sie <strong>kombiniert</strong> und <strong>verändert</strong> werden können.",
    target: ".filter-panel",
    view: "sidebar",
  },
  {
    title: "Räumliche Muster",
    buzzword: "Muster",
    text: "Nutzen Sie die <strong>Karte</strong>, um passende <strong>Klimadiagramme</strong> zu öffnen. Achten Sie auf Unterschiede, nachdem Filter angewendet wurden.",
    target: ".map-section",
    view: "main",
  },
  {
    title: "Ergebnisse fokussieren",
    buzzword: "Ergebnisse",
    text: "Hier werden die Wetterstationen aufgelistet. Wechseln Sie zwischen <strong>Alle</strong>, <strong>Treffer</strong> und <strong>Nicht Treffer</strong>, um zu sehen, was deren klimatische Eigenschaften sind.",
    target: ".list-container",
    view: "main",
  },
  {
    title: "Klimadiagramm interpretieren",
    buzzword: "Klimadiagramm",
    text: "Lesen Sie im <strong>Klimadiagramm</strong> den Jahresverlauf und lassen Sie Aussagen mit Daten belegen. Beim Überfahren des Diagramms mit der Maus werden die zugehörigen Variablenwerte sichtbar.",
    target: "#diagram",
    view: "main",
  },
  {
    title: "Zielwert & Reflexion",
    buzzword: "Reflexion",
    text: "Prüfen Sie den <strong>Zielwert</strong> im <strong>Ergebnis‑Dock</strong>. Lassen Sie Lernende begründen, warum Filter passen oder nicht.",
    target: "#result-dock",
    view: "main",
  },
  {
    title: "Arbeitsform mobil",
    buzzword: "Mobil",
    text: "Auf Tablets/Handys wechseln Sie unten zwischen <strong>Filter</strong> und <strong>Karte & Liste</strong> – ideal für Gruppenarbeit.",
    target: ".view-toggle-dock",
    view: "main",
  },
];

function getAutoBuzzword(title) {
  if (!title) {
    return "Weiter";
  }
  var words = title
    .replace(/[^\wÄÖÜäöüß\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  var ignore = {
    was: true,
    wie: true,
    ist: true,
    die: true,
    der: true,
    das: true,
    im: true,
    in: true,
    und: true,
    mit: true,
    für: true,
    fur: true,
    zur: true,
    zum: true,
    den: true,
    des: true,
    als: true,
  };
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    if (ignore[word.toLowerCase()]) {
      continue;
    }
    return word;
  }
  return words[0] || "Weiter";
}

function getNextStepButtonLabel(steps, index) {
  return "Weiter";
}

function getTourProgressLabel(mode, steps, index, step) {
  if (mode === "teacher") {
    if (!step.target) {
      return "";
    }
    var walkthroughTotal = 0;
    var walkthroughCurrent = 0;
    for (var i = 0; i < steps.length; i++) {
      if (!steps[i].target) {
        continue;
      }
      walkthroughTotal += 1;
      if (i <= index) {
        walkthroughCurrent += 1;
      }
    }
    return "Schritt " + walkthroughCurrent + " / " + walkthroughTotal;
  }
  return "Schritt " + (index + 1) + " / " + steps.length;
}

function getTourSteps(mode) {
  return mode === "teacher" ? teacherTourSteps : studentTourSteps;
}

function getTeacherIntroStepIndexes(steps) {
  var indexes = [];
  if (!steps || !steps.length) {
    return indexes;
  }
  for (var i = 0; i < steps.length; i++) {
    if (steps[i].target) {
      break;
    }
    indexes.push(i);
  }
  return indexes;
}

function renderTeacherIntroNavigation(steps, index, isReadingStep) {
  if (!tourReadingNav || !tourReadingNavList) {
    return;
  }

  var shouldShow = tourState.mode === "teacher" && isReadingStep;
  tourReadingNav.classList.toggle("is-visible", shouldShow);

  if (!shouldShow) {
    tourReadingNavList.innerHTML = "";
    return;
  }

  var introIndexes = getTeacherIntroStepIndexes(steps);
  tourReadingNavList.innerHTML = "";

  introIndexes.forEach(function (stepIndex, itemIndex) {
    var item = document.createElement("li");
    item.className = "tour-reading-nav-item";
    if (stepIndex < index) {
      item.classList.add("is-done");
    }
    if (stepIndex === index) {
      item.classList.add("is-active");
    }

    var button = document.createElement("button");
    button.type = "button";
    button.className = "tour-reading-nav-btn";
    button.textContent = steps[stepIndex].title || "Thema " + (itemIndex + 1);
    if (stepIndex === index) {
      button.setAttribute("aria-current", "step");
    }
    button.addEventListener("click", function () {
      tourState.index = stepIndex;
      renderTourStep();
    });

    item.appendChild(button);
    tourReadingNavList.appendChild(item);
  });
}

function clearTourHighlight() {
  tourState.activeTarget = null;
  if (tourSpotlight) {
    tourSpotlight.style.display = "none";
  }
}

function applyTourView(view) {
  if (!view) {
    return;
  }
  var mobileQuery = window.matchMedia("(max-width: 980px)");
  if (mobileQuery.matches) {
    setActiveView(view);
  }
}

function positionTourSpotlight(target) {
  if (!tourSpotlight) {
    return;
  }
  if (!target) {
    tourSpotlight.style.display = "none";
    return;
  }

  var rect = target.getBoundingClientRect();
  var padding = 12;
  var minEdge = 8;
  var top = rect.top - padding;
  var left = rect.left - padding;
  var width = rect.width + padding * 2;
  var height = rect.height + padding * 2;

  top = Math.max(minEdge, top);
  left = Math.max(minEdge, left);
  width = Math.max(0, Math.min(width, window.innerWidth - left - minEdge));
  height = Math.max(0, Math.min(height, window.innerHeight - top - minEdge));

  tourSpotlight.style.display = "block";
  tourSpotlight.style.top = top + "px";
  tourSpotlight.style.left = left + "px";
  tourSpotlight.style.width = width + "px";
  tourSpotlight.style.height = height + "px";
}

function positionTourTooltip(target) {
  if (!tourTooltip) {
    return;
  }
  var resolvedTarget =
    target && typeof target.getBoundingClientRect === "function"
      ? target
      : tourState.activeTarget;
  positionTourSpotlight(resolvedTarget);
  var padding = 16;
  var gap = 14;
  var viewportWidth = window.innerWidth;
  var viewportHeight = window.innerHeight;
  var tooltipRect = tourTooltip.getBoundingClientRect();
  var top = (viewportHeight - tooltipRect.height) / 2;
  var left = (viewportWidth - tooltipRect.width) / 2;

  if (resolvedTarget) {
    var rect = resolvedTarget.getBoundingClientRect();
    var placeBottom = rect.top < viewportHeight / 2;
    if (placeBottom) {
      top = rect.bottom + gap;
    } else {
      top = rect.top - tooltipRect.height - gap;
    }
    left = rect.left + rect.width / 2 - tooltipRect.width / 2;
  }

  left = Math.max(
    padding,
    Math.min(left, viewportWidth - tooltipRect.width - padding),
  );
  top = Math.max(
    padding,
    Math.min(top, viewportHeight - tooltipRect.height - padding),
  );

  tourTooltip.style.left = left + "px";
  tourTooltip.style.top = top + "px";
}

function renderTourStep() {
  var steps = getTourSteps(tourState.mode);
  if (!steps || !steps.length) {
    return;
  }

  var index = Math.max(0, Math.min(tourState.index, steps.length - 1));
  tourState.index = index;
  var step = steps[index];
  var isReadingStep = !step.target;

  if (tourOverlay) {
    tourOverlay.classList.toggle("tour-overlay--reading", isReadingStep);
  }

  if (tourTooltip) {
    tourTooltip.classList.toggle("tour-tooltip--reading", isReadingStep);
  }
  renderTeacherIntroNavigation(steps, index, isReadingStep);

  if (tourTitle) {
    tourTitle.textContent = step.title;
  }
  if (tourText) {
    tourText.innerHTML = step.text;
  }
  if (tourProgress) {
    var progressLabel = getTourProgressLabel(
      tourState.mode,
      steps,
      index,
      step,
    );
    tourProgress.textContent = progressLabel;
    tourProgress.classList.toggle("is-hidden", !progressLabel);
  }
  if (tourPrev) {
    tourPrev.disabled = index === 0;
  }
  if (tourNext) {
    tourNext.textContent = getNextStepButtonLabel(steps, index);
  }

  applyTourView(step.view);

  window.requestAnimationFrame(function () {
    clearTourHighlight();
    var target = step.target ? document.querySelector(step.target) : null;
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    tourState.activeTarget = target;
    positionTourTooltip(target);
  });
}

function startTour(mode) {
  if (!tourOverlay) {
    return;
  }

  if (tourOverlay.classList.contains("active")) {
    closeTour();
  }

  if (helpModal && helpModal.classList.contains("active")) {
    closeHelpModal();
  }

  tourState.mode = mode;
  tourState.index = 0;
  tourState.wasMobile = window.matchMedia("(max-width: 980px)").matches;
  tourState.previousView = document.body.dataset.view || null;

  tourOverlay.classList.add("active");
  tourOverlay.setAttribute("aria-hidden", "false");
  renderTourStep();

  window.addEventListener("resize", positionTourTooltip);
  window.addEventListener("scroll", positionTourTooltip, true);
}

function closeTour() {
  if (!tourOverlay) {
    return;
  }
  tourOverlay.classList.remove("active");
  tourOverlay.classList.remove("tour-overlay--reading");
  tourOverlay.setAttribute("aria-hidden", "true");
  clearTourHighlight();

  window.removeEventListener("resize", positionTourTooltip);
  window.removeEventListener("scroll", positionTourTooltip, true);

  if (
    tourState.wasMobile &&
    (tourState.previousView === "sidebar" || tourState.previousView === "main")
  ) {
    setActiveView(tourState.previousView);
  }
}

function setupTour() {
  if (!tourOverlay) {
    return;
  }

  if (tourPrev) {
    tourPrev.addEventListener("click", function () {
      tourState.index = Math.max(0, tourState.index - 1);
      renderTourStep();
    });
  }

  if (tourNext) {
    tourNext.addEventListener("click", function () {
      var steps = getTourSteps(tourState.mode);
      if (!steps || !steps.length) {
        return;
      }
      if (tourState.index >= steps.length - 1) {
        closeTour();
      } else {
        tourState.index += 1;
        renderTourStep();
      }
    });
  }

  if (tourClose) {
    tourClose.addEventListener("click", closeTour);
  }

  if (tourShield) {
    tourShield.addEventListener("click", closeTour);
  }
}

function openHelpModal() {
  if (!helpModal) {
    return;
  }
  if (helpModal.classList.contains("active")) {
    return;
  }
  helpModal.classList.add("active");
  helpModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeHelpModal() {
  if (!helpModal) {
    return;
  }
  if (!helpModal.classList.contains("active")) {
    return;
  }
  helpModal.classList.remove("active");
  helpModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function setupHelpModal() {
  if (!helpModal) {
    return;
  }

  helpChoiceCards.forEach(function (card) {
    card.addEventListener("click", function () {
      var mode = card.dataset.helpTarget || "student";
      startTour(mode);
    });
  });

  helpDismissButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      closeHelpModal();
    });
  });
}

function toggleTutorial() {
  if (!helpModal) {
    return;
  }

  if (helpModal.classList.contains("active")) {
    closeHelpModal();
  } else {
    openHelpModal();
  }
}

// Close modal on Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (tourOverlay && tourOverlay.classList.contains("active")) {
      closeTour();
      return;
    }
    let modal = document.getElementById("help-modal");
    if (modal && modal.classList.contains("active")) {
      toggleTutorial();
    }
  }

  if (tourOverlay && tourOverlay.classList.contains("active")) {
    if (e.key === "ArrowRight") {
      if (tourNext) {
        tourNext.click();
      }
    }
    if (e.key === "ArrowLeft") {
      if (tourPrev) {
        tourPrev.click();
      }
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

function syncListDiagramHeight() {
  var diagram = document.getElementById("diagram");
  var listCard = document.querySelector(".list-card");
  if (!diagram || !listCard) return;

  var isDesktop = window.matchMedia("(min-width: 1101px)").matches;
  if (!isDesktop) {
    listCard.style.height = "";
    listCard.classList.remove("height-synced");
    return;
  }

  var diagramHeight = diagram.offsetHeight;
  if (diagramHeight > 0) {
    listCard.style.height = diagramHeight + "px";
    listCard.classList.add("height-synced");
  }
}

function setupListDiagramSync() {
  syncListDiagramHeight();
  window.addEventListener("resize", syncListDiagramHeight);
}

function setupUI() {
  setupViewToggle();
  setupFilterUI();
  setupVarTableToggle();
  setupTaskSelect();
  setupHelpModal();
  setupTour();
  setupListDiagramSync();
  openHelpModal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupUI);
} else {
  setupUI();
}
