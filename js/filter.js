// Regex for Linting
const charCheck = /^[\d,nt()+\-*/.\s]*$/;
const varCheck = /^([^\n]*|[nt]\(((0?[0-9]|1[0-2]),\s?)*((0?[0-9]|1[0-2]),?\s?)\))*$/;


// Test Strings
const testString1 = "n(1,2,3,4,5,6,7,8,9,10,11,12)";
const testString2 = "t(1,2,3,4,5,6,7,8,9,10,11,12)";
const testString3 = "n(1,2,3,4,5,6,7,8,9,10,11,12) + t(1,2,3,4,5,6,7,8,9,10,11,12)";
const testString4 = "(n(1,2,3,4,5,6,7,8,9,10,11,12) / 9) -45+ (1*1/1)";

// Checks if input contains valid values
// Checks if string can be calculated
function checkInputs(){
  let inputRows = document.getElementsByClassName("input-row")
  for(i = 0; i < inputRows.length; i++){
    let string1 = inputRows[i].children[1].value;
    let string2 = inputRows[i].children[3].value;
    checkSyntax(string1);
    checkSyntax(string2);
    testCalc(string1);
    testCalc(string2);
  }
}

function testCalc(str) {
  const regex = /[nt]\((\d{1,2}(\s*,\s*\d{1,2})*)?\)/g; // matches "n" or "t" followed by brackets containing one or more comma-separated numbers
  strRepl = str.replace(regex, "1"); // replaces all matches with "1"
  console.log(strRepl)
  console.log(calcString(strRepl))
}

//function calcString(str) {
//  //console.log(str)
//  return new Function(str)();
//}

function calcString(fn) {
  return new Function('return ' + fn)();
}

//Checks if the right characters and variables are used
function checkSyntax(str){
    console.log("check syntax: " + str)
    console.log("Characters: "  + charCheck.test(str));
    console.log("Variables:  "  + varCheck.test(str));
}