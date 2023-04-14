// Test Strings
const testString1 = "n(1,2,3,4,5,6,7,8,9,10,11,12)";
const testString2 = "t(1,2,3,4,5,6,7,8,9,10,11,12)";
const testString3 = "n(1,2,3,4,5,6,7,8,9,10,11,12) + t(1,2,3,4,5,6,7,8,9,10,11,12)";
const testString4 = "(n(1,2,3,4,5,6,7,8,9,10,11,12) / 9) -45+ (1*1/1)";

// Regex for Linting
const charCheck = /^[\d,ntNT()+\-*/.\s]*$/;
const varCheck = /^([^\n]*|[nt]\(((0?[0-9]|1[0-2]),\s?)*((0?[0-9]|1[0-2]),?\s?)\))*$/;


let input = "";

var tokens = ["T", "N", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11",
  "t12", "n1", "n2", "n3", "n4", "n5", "n6", "n7", "n8", "n9", "n10", "n11", "n12"]
var tokenReplacement = {
  "T": "\uD83C\uDF21",
  "N": "\uD83C\uDF27",
  "t1": "\u2776",
  "t2": "\u2777",
  "t3": "\u2778",
  "t4": "\u2779",
  "t5": "\u277A",
  "t6": "\u277B",
  "t7": "\u277C",
  "t8": "\u277D",
  "t9": "\u277E",
  "t10": "\u277F",
  "t11": "\u2780",
  "t12": "\u2781",
  "n1": "\uD83D\uDC04",
  "n2": "\uD83D\uDC04",
  "n3": "\uD83D\uDC04",
  "n4": "\uD83D\uDC04",
  "n5": "\uD83D\uDC04",
  "n6": "\uD83D\uDC04",
  "n7": "\uD83D\uDC04",
  "n8": "\uD83D\uDC04",
  "n9": "\uD83D\uDC04",
  "n10": "\uD83D\uDC04",
  "n11": "\uD83D\uDC04",
  "n12": "\uD83D\uDC04",
};

var tokenReplacement = {
  "T": "\uD83C\uDF21",
  "N": "\uD83C\uDF27",
  "t1": "\u2776",
  "t2": "\u2777",
  "t3": "\u2778",
  "t4": "\u2779",
  "t5": "\u277A",
  "t6": "\u277B",
  "t7": "\u277C",
  "t8": "\u277D",
  "t9": "\u277E",
  "t10": "\u277F",
  "t11": "\u2780",
  "t12": "\u2781",
  "n1": "\uD83D\uDC04",
  "n2": "\uD83D\uDC04",
  "n3": "\uD83D\uDC04",
  "n4": "\uD83D\uDC04",
  "n5": "\uD83D\uDC04",
  "n6": "\uD83D\uDC04",
  "n7": "\uD83D\uDC04",
  "n8": "\uD83D\uDC04",
  "n9": "\uD83D\uDC04",
  "n10": "\uD83D\uDC04",
  "n11": "\uD83D\uDC04",
  "n12": "\uD83D\uDC04",
};

function tokenizeInput(e){
  /*
  var output = tokens.reduce((acc, str) => {
    if (acc.includes(str)) {
      const replacement = tokenReplacement[str];
      return acc.replace(str, replacement);
    }
    return acc;
  }, e.target.value);
  e.target.value = output;
  */
}

// Checks if input contains valid values
// Checks if string can be calculated
function checkInputs(){
  let inputRows = document.getElementsByClassName("input-row")
  for(i = 0; i < inputRows.length; i++){
    console.log("Row " + i)
    let string1 = inputRows[i].children[1].value;
    let string2 = inputRows[i].children[3].value;
    if(checkSyntax(string1)){
      console.log(i + "(str1) Correct")
      console.log(i + "(str1) testcalc = " + testCalc(string1))
      if(testCalc(string1)){
        console.log(i + "(str1) Calculated")
      } else {
        showMessage("Zeile " + (i+1) + ": linkes Feld lässt sich nicht berechnen")
        return false;
      }
    } else{
      showMessage("Syntaxfehler in Zeile " + (i+1) + " linke Seite")
      return false;
    }
    if(checkSyntax(string2)){
      console.log(i + "(str2) Correct")
      console.log(i + "(str2) testcalc = " + testCalc(string2))
      if(testCalc(string2)){
        console.log(i + "(str2) Calculated")
      } else {
        showMessage("Zeile " + (i+1) + ": rechtes Feld lässt sich nicht berechnen")
        return false;
      }
    } else {
      showMessage("Syntaxfehler in Zeile " + (i+1) + " rechte Seite")
      return false;
    }
  }
  return true;
}

function testCalc(str){
  let stringsToReplace = tokens
  stringsToReplace.sort((a, b) => b.length - a.length);
  
  // Replace all occurrences of each string in the array with the replacement string
  for (let i = 0; i < stringsToReplace.length; i++) {
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${stringsToReplace[i]}($|[^a-zA-Z0-9])`, "g");
    str = str.replace(regex, `$1${1}$2`);
  }
  console.log(str)
  try {
    // Try to evaluate the string as a mathematical expression
    eval(str);
    if(eval(str) == Infinity){
      return false
    }
    return true;
  } catch (e) {
    // If an error occurs during evaluation, the string is not calculable
    return false;
  }
}

// Filters wholeClimate based on comparing the input values
function filterData(){
  filteredClimate = [];
  let inputRows = document.getElementsByClassName("input-row")
  let inputStrings = [];
  // For every station and input calculate the comparator
  for(i = 0; i < inputRows.length; i++){
    let string1 = inputRows[i].children[1].value;
    let string2 = inputRows[i].children[3].value;
    inputStrings[i] = [string1, string2] 
  }
  console.log("Input =>")
  console.log(inputStrings)
  for(i = 0; i < wholeClimate.length; i++){
    for(j = 0; j < inputRows.length; j++){
      let str1 = replaceTokens(inputStrings[j][0], wholeClimate[i]);
      let str2 = replaceTokens(inputStrings[j][1], wholeClimate[i]);
      console.log(calcString(str1) +" < "+ calcString(str2))
      if(calcString(str1) < calcString(str2)){
        console.log("true -> continue")
        break;
      } else {
        if (j === inputRows.length - 1){
          filteredClimate.push(wholeClimate[i])
        }
      }
    }
  }
  console.log(filteredClimate);
};

// Returns the result of a given function
function calcString(fn) {
  return new Function('return ' + fn)();
}

//function testCalc(str) {
//  const regex = /[nt]\((\d{1,2}(\s*,\s*\d{1,2})*)?\)/g; // matches "n" or "t" followed by brackets containing one or more comma-separated numbers
//  strRepl = str.replace(regex, "1"); // replaces all matches with "1"
//  console.log(strRepl)
//  console.log(calcString(strRepl))
//}


//Checks if the right characters and variables are used
function checkSyntax(str){
    console.log("Vars:  "  + varCheck.test(str));
    return charCheck.test(str)
    //return charCheck.test(str) && varCheck.test(str)
}


function replaceTokens(str, station) {
  // Escape special characters in tokens to prevent them from being interpreted as regular expressions
  const escapedTokens = tokens.map(token => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // Create a regular expression to match any of the tokens with word boundaries and lookarounds
  const tokenRegex = new RegExp(`(?<!\\w)(${escapedTokens.join('|')})(?!\\w)`, 'g');
  // Replace all matches of the regular expression with the corresponding value from wholeClimate
  const outputStr = str.replace(tokenRegex, (match, token) => station[token]);
  return outputStr;
}