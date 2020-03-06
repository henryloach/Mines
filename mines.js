"use strict";

function main(map,n) {

  console.log("\nStarting configuration:\n");
  print(arr);

  initActive();

  do {
    loop();
    if (hasChanged == false) {
      let n = activeElements.length;
      while (n-- && nMines > 0) { // try templates
        template1(activeElements[n][0], activeElements[n][1]);
        if (hasChanged == true) { updateValues(); break; }
        template2(activeElements[n][0], activeElements[n][1]);
        if (hasChanged == true) { updateValues(); break; }
        template3(activeElements[n][0], activeElements[n][1]);
        if (hasChanged == true) { updateValues(); break; }
      }

      // Try final solver.
      if (hasChanged == false && nMines <= 5) { tryFinal(); }
    }
  } while (hasChanged == true && numUnknowns > 0);

  console.log("\nResult:\n");
  if (nMines == 0 && numUnknowns == 0) {
    console.log("..Complete..");
    console.log("\nFinal state:\n");
    print(arr);
    return arrToStr(arr);
  } else {
    console.log("..?..");
    console.log("\nFinal state:\n");
    print(arr);
    console.log(`Mines remaining: ${nMines}\n`);
    return "?";
  }
}

function loop() {
  hasChanged = false;
  updateSafe();
  updateUnknowns();
  updateValues();
  updateMines();
  updateValues();
}

function updateSafe() {
  let n = activeElements.length;
  while (n--) {
    let row = activeElements[n][0]; let col = activeElements[n][1];
    if (values[row][col] == 0) {
      setSafe(row, col);
      activeElements.splice(n, 1);
    }
  }
}

function setSafe(row, col) {
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i == row && j == col) continue;
      if (checkBounds(i, j) == false) continue;
      if (arr[i][j] != "?") continue;
      openTile(i, j);
    }
  }
}

function openTile(row, col) {
  if (arr[row][col] == "x") throw "trying to open tile already marked as mine!"
  else if (arr[row][col] != "?") {
    throw `trying to reopen open square at row: ${row} col: ${col}`;
  }
  arr[row][col] = open(row, col);
  values[row][col] = open(row, col);
  activeElements.push([row, col]);
  numUnknowns -= 1;
  hasChanged = true;
}

function updateUnknowns() {
  let n = activeElements.length;
  while (n--) {
    let row = activeElements[n][0]; let col = activeElements[n][1];
    adjUnknowns[row][col] = getUnknowns(row, col);
  }
}

function getUnknowns(row, col) {
  let unknowns = 0;
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i == row && j == col) continue;
      if (checkBounds(i, j) == false) continue;
      if (arr[i][j] == "?") unknowns += 1;
    }
  }
  return unknowns;
}

function updateMines() {
  let n = activeElements.length;
  while (n--) {
    let row = activeElements[n][0]; let col = activeElements[n][1];
    if (values[row][col] >= adjUnknowns[row][col]) setMines(row, col);
  }
}

function setMines(row, col) {
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i == row && j == col) continue;
      if (checkBounds(i, j) == false) continue;
      if (arr[i][j] == "?") markMine(i, j);
    }
  }
}

function markMine(row, col) {
  if (arr[row][col] != "?") throw "marking something not ?";
  arr[row][col] = "x";
  values[row][col] = "x";
  nMines -= 1;
  numUnknowns -= 1;
  hasChanged = true;
}

function revertMine(row, col) {
  if (arr[row][col] != "x") {
    return;
  }
  arr[row][col] = "?";
  values[row][col] = "?";
  nMines += 1;
  numUnknowns += 1;
  hasChanged = false;
}

function updateValues() {
  let n = activeElements.length;
  while (n--) {
    let row = activeElements[n][0]; let col = activeElements[n][1];
    getValues(row, col);
  }
}

function getValues(row, col) {
if (values[row][col] == "x") throw "called get values on a mine"
  values[row][col] = arr[row][col];
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i == row && j == col) continue;
      if (checkBounds(i, j) == false) continue;
      if (arr[i][j] != "x") continue;
      values[row][col] -= 1;
    }
  }
}

//    * . . o
//    * 1 1 %
//    * * * *
function template1(row, col) {
  let flag;
  if ( values[row][col] != 1 ) return;

  flag = true;
  if      ( !isOne(row, col - 1)   ) flag = false;
  else if ( !notWall(row, col + 1) ) flag = false;
  else if ( !leftWall(row, col)    ) flag = false;
  if ( (flag) && aboveOpen(row, col) && belowBlocked(row, col) ) {
    openTile(row - 1, col + 1); return; }
  if ( (flag) && belowOpen(row, col) && aboveBlocked(row, col) ) {
    openTile(row + 1, col + 1); return; }

  flag = true;
  if      ( !isOne(row, col + 1)   ) flag = false;
  else if ( !notWall(row, col - 1) ) flag = false;
  else if ( !rightWall(row, col)   ) flag = false;
  if ( (flag) && aboveOpen(row, col) && belowBlocked(row, col) ) {
    openTile(row - 1, col - 1); return; }
  if ( (flag) && belowOpen(row, col) && aboveBlocked(row, col) ) {
    openTile(row + 1, col - 1); return; }

  flag = true;
  if      ( !isOne(row - 1, col)   ) flag = false;
  else if ( !notWall(row + 1, col) ) flag = false;
  else if ( !upperWall(row, col)   ) flag = false;
  if ( (flag) && rightOpen(row, col) && leftBlocked(row, col) ) {
    openTile(row + 1, col + 1); return; }
  if ( (flag) && leftOpen(row, col) && rightBlocked(row, col) ) {
    openTile(row + 1, col - 1); return; }

  flag = true;
  if      ( !isOne(row + 1, col)   ) flag = false;
  else if ( !notWall(row - 1, col) ) flag = false;
  else if ( !lowerWall(row, col)   ) flag = false;
  if ( (flag) && rightOpen(row, col) && leftBlocked(row, col) ) {
    openTile(row - 1, col + 1); return; }
  if ( (flag) && leftOpen(row, col) && rightBlocked(row, col) ) {
    openTile(row - 1, col - 1); return; }
}

//    ! . .
//    * 2 1
//    * * *
function template2(row, col) {
  let flag;
  if ( values[row][col] != 2 ) return;

  flag = true;
  if  ( !isOne(row, col - 1 )     ) flag = false;
  else if  ( !notHidden(row, col + 1) ) flag = false;
  if ( (flag) && aboveOpen(row, col) && belowBlocked(row, col) ) {
    markMine(row - 1, col + 1); return; }
  if ( (flag) && belowOpen(row, col) && aboveBlocked(row, col) ) {
    markMine(row + 1, col + 1); return; }

  flag = true;
  if  ( !isOne(row, col + 1 )     ) flag = false;
  else if  ( !notHidden(row, col - 1) ) flag = false;
  if ( (flag) && aboveOpen(row, col) && belowBlocked(row, col) ) {
    markMine(row - 1, col - 1); return; }
  if ( (flag) && belowOpen(row, col) && aboveBlocked(row, col) ) {
    markMine(row + 1, col - 1); return; }

  flag = true;
  if  ( !isOne(row - 1, col )     ) flag = false;
  else if  ( !notHidden(row + 1, col) ) flag = false;
  if ( (flag) && rightOpen(row, col) && leftBlocked(row, col) ) {
    markMine(row + 1, col + 1); return; }
  if ( (flag) && leftOpen(row, col) && rightBlocked(row, col) ) {
    markMine(row + 1, col - 1); return; }

  flag = true;
  if  ( !isOne(row + 1, col )     ) flag = false;
  else if  ( !notHidden(row - 1, col) ) flag = false;
  if ( (flag) && rightOpen(row, col) && leftBlocked(row, col) ) {
    markMine(row - 1, col + 1); return; }
  if ( (flag) && leftOpen(row, col) && rightBlocked(row, col) ) {
    markMine(row - 1, col - 1); return; }
}

//    o ! ! o
//    1 2 2 1
//    * * * *
function template3(row ,col) {
  if (values[row][col] != 2) return;

  let flag = true; //right flat
  if      (checkBounds(row, col + 1) != true ||  values[row][col + 1] != 2) flag = false;
  else if (checkBounds(row, col + 2) != true ||  values[row][col + 2] != 1) flag = false;
  else if (checkBounds(row, col - 1) != true ||  values[row][col - 1] != 1) flag = false;

  if (aboveOpen(row, col) == true && aboveOpen(row, col + 1) == true
  && belowBlocked(row, col) == true && belowBlocked(row, col + 1) == true) {
    if (flag == true) { markMine(row - 1, col); markMine(row - 1, col + 1); return }
  }
  else if (belowOpen(row, col) == true && belowOpen(row, col + 1) == true
  && aboveBlocked(row, col) == true && aboveBlocked(row, col + 1) == true) {
    if (flag == true) { markMine(row + 1, col); markMine(row + 1, col + 1); return }
  }

  flag = true; //left flat
  if      (checkBounds(row, col - 1) != true ||  values[row][col - 1] != 2) flag = false;
  else if (checkBounds(row, col - 2) != true ||  values[row][col - 2] != 1) flag = false;
  else if (checkBounds(row, col + 1) != true ||  values[row][col + 1] != 1) flag = false;
  else if (aboveOpen(row, col) == true && aboveOpen(row, col - 1) == true
  && belowBlocked(row, col) == true && belowBlocked(row, col - 1) == true) {
    if (flag == true) { markMine(row - 1, col); markMine(row - 1, col - 1); return }
  }
  else if (belowOpen(row, col) == true && belowOpen(row, col - 1) == true
  && aboveBlocked(row, col) == true && aboveBlocked(row, col - 1) == true) {
    if (flag == true) { markMine(row + 1, col); markMine(row + 1, col - 1); return }
  }

  flag = true; //vert up
  if      (checkBounds(row - 1, col) != true ||  values[row - 1][col] != 2) flag = false;
  else if (checkBounds(row - 2, col) != true ||  values[row - 2][col] != 1) flag = false;
  else if (checkBounds(row + 1, col) != true ||  values[row + 1][col] != 1) flag = false;
  else if (leftOpen(row, col) == true && leftOpen(row, col) == true
  && rightBlocked(row - 1, col) == true && rightBlocked(row - 1, col) == true) {
    if (flag == true) { markMine(row, col - 1); markMine(row - 1, col - 1); return }
  }
  else if (rightOpen(row, col) == true && rightOpen(row, col - 1) == true
  && leftBlocked(row, col) == true && leftBlocked(row, col - 1) == true) {
    if (flag == true) { markMine(row, col + 1); markMine(row - 1, col + 1); return }
  }

  flag = true; //vert dwown
  if      (checkBounds(row + 1, col) != true ||  values[row + 1][col] != 2) flag = false;
  else if (checkBounds(row + 2, col) != true ||  values[row + 2][col] != 1) flag = false;
  else if (checkBounds(row - 1, col) != true ||  values[row - 1][col] != 1) flag = false;
  else if (leftOpen(row, col) == true && leftOpen(row, col) == true
  && rightBlocked(row - 1, col) == true && rightBlocked(row - 1, col) == true) {
    if (flag == true) { markMine(row, col - 1); markMine(row + 1, col - 1); return }
  }
  else if (rightOpen(row, col) == true && rightOpen(row, col - 1) == true
  && leftBlocked(row, col) == true && leftBlocked(row, col - 1) == true) {
    if (flag == true) { markMine(row, col + 1); markMine(row + 1, col + 1); return }
  }
}

function tryFinal() {
  let remUnks = getRemainingUnknowns();
  if (remUnks.length == nMines) { // if remaining unmarked squares = num mines, fill them in
    for (let m = 0; m < remUnks.length; m++) {
      let mine = remUnks[m];
      markMine(mine[0], mine[1]);
    }
    return;
  }

  let combos = combinations(remUnks, nMines);
  let legals = []
  for (let n = 0; n < combos.length; n++) {

    let mineList = combos[n];
    for (let m = 0; m < mineList.length; m++) {
      let mine = mineList[m];
      markMine(mine[0], mine[1]);
    }
    // check if combo is legal
    updateValues();
    if (checkCombo() == true) { // mark as possible and revert
      for (let m = 0; m < mineList.length; m++) {
        let mine = mineList[m];
        revertMine(mine[0], mine[1]);
      }
      legals.push(mineList);
    } else { // revert
      for (let m = 0; m < mineList.length; m++) {
        let mine = mineList[m];
        revertMine(mine[0], mine[1]);
      }
    }
    updateValues();
  }

  if (legals.length == 1) { // check for one legal combo
    let mineList = legals[0];
    for (let m = 0; m < mineList.length; m++) {
      let mine = mineList[m];
      markMine(mine[0], mine[1]);
    }
  } else { //Check for remaining unknowns not on any legal minelist, these are safe.
    let safeList = calcSafe(remUnks, legals);
    for (let i = 0; i < safeList.length; i++) {
      let safe = safeList[i];
      openTile(safe[0], safe[1]);
    }
  }
  updateValues();
}

function calcSafe(remUnks, legals) {
  let safeList = remUnks;
  let i = safeList.length;

  while (i--) {
    loop1:
    for (let n = 0; n < legals.length; n++) {
      let mineList = legals[n];
      for (let m = 0; m < mineList.length; m++) {
        if ( isEqual(mineList[m], safeList[i]) ) {
          safeList.splice(i, 1);
          break loop1;
        }
      }
    }
  }
  return safeList;
}

function isEqual(arr1, arr2) {
  if ( arr1[0] != arr2[0] ) return false;
  if ( arr1[1] != arr2[1] ) return false;
  return true;
}

function getRemainingUnknowns() {
  let remUnks = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[0].length; j++) {
      if (arr[i][j] == "?") remUnks.push([i, j])
    }
  }
  return remUnks;
}

function combinations(items, k){
    let i, subI, ret = [], sub, next;
    for(i = 0; i < items.length; i++){
        if(k === 1){
            ret.push( [ items[i] ] );
        }else{
            sub = combinations(items.slice(i+1, items.length), k-1);
            for(subI = 0; subI < sub.length; subI++ ){
                next = sub[subI];
                next.unshift(items[i]);
                ret.push( next );
            }
        }
    }
    return ret;
}

function checkCombo() {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[0].length; j++) {
      if (values[i][j] != "x" && values[i][j] != "?" && values[i][j] != "0") return false;
    }
  }
  return true;
}

function leftWall(row, col) {
  let flag = true;
  if (checkBounds(row, col - 2) == false)     flag = true;
  else if (values[row][col - 2] == "?")     return false;
  if (checkBounds(row - 1, col - 2) == false) flag = true;
  else if (values[row - 1][col - 2] == "?") return false;
  if (checkBounds(row + 1, col - 2) == false) flag = true;
  else if (values[row + 1][col - 2] == "?") return false;
  return flag;
}

function rightWall(row, col) {
  let flag = true;
  if (checkBounds(row, col + 2) == false)     flag = true;
  else if (values[row][col + 2] == "?")     return false;
  if (checkBounds(row - 1, col + 2) == false) flag = true;
  else if (values[row - 1][col + 2] == "?") return false;
  if (checkBounds(row + 1, col + 2) == false) flag = true;
  else if (values[row + 1][col + 2] == "?") return false;
  return flag;
}

function lowerWall(row, col) {
  let flag = true;
  if (checkBounds(row + 2, col    ) == false) flag = true;
  else if (values[row + 2][col] == "?") return false;
  if (checkBounds(row + 2, col + 1) == false) flag = true;
  else if (values[row + 2][col + 1] == "?") return false;
  if (checkBounds(row + 2, col - 1) == false) flag = true;
  else if (values[row + 2][col - 1] == "?") return false;
  return flag;
}

function upperWall(row, col) {
  let flag = true;
  if (checkBounds(row - 2, col    ) == false) flag = true;
  else if (values[row - 2][col] == "?") return false;
  if (checkBounds(row - 2, col + 1) == false) flag = true;
  else if (values[row - 2][col + 1] == "?") return false;
  if (checkBounds(row - 2, col - 1) == false) flag = true;
  else if (values[row - 2][col - 1] == "?") return false;
  return flag;
}

function checkRow(row, col) {
  if      (checkRowLeft(row, col) == false) return false;
  else if (checkRowRight(row, col) == false) return false;
  else return  true;
}

function checkRowLeft(row, col) {
  if (checkBounds(row, col - 1) == false) return false;
  else if (values[row][col - 1] != 1)          return false;
  else return true;
}

function checkRowRight(row, col) {
  if      (checkBounds(row, col + 1) == false) return false;
  else if (values[row][col + 1] != 1)          return false;
  else return true;
}

function checkCol(row, col) {
  if      (checkColDown(row, col) == false) return false;
  else if (checkColUp(row, col) == false) return false;
  else return  true;
}

function checkColUp(row, col) {
  if      (checkBounds(row - 1, col) == false) return false;
  else if (values[row - 1][col] != 1)          return false;
  else return true;
}

function checkColDown(row, col) {
  if      (checkBounds(row + 1, col) == false) return false;
  else if (values[row + 1][col] != 1)          return false;
  else return true;
}

function aboveBlocked(row, col) {
  if (checkBounds(row - 1, col) == false) return true;
  else if (values[row - 1][col    ] == "?") return false;
  else if (values[row - 1][col - 1] == "?") return false;
  else if (values[row - 1][col + 1] == "?") return false;
  else return true;
}

function aboveOpen(row, col) {
  if (checkBounds(row - 1, col) == false) return false;
  else if (values[row - 1][col    ] != "?") return false;
  else if (values[row - 1][col - 1] != "?") return false;
  else if (values[row - 1][col + 1] != "?") return false;
  else return true;
}

function belowBlocked(row, col) {
  if (checkBounds(row + 1, col) == false) return true;
  else if (values[row + 1][col    ] == "?") return false;
  else if (values[row + 1][col - 1] == "?") return false;
  else if (values[row + 1][col + 1] == "?") return false;
  else return true;
}

function belowOpen(row, col) {
  if (checkBounds(row + 1, col) == false) return false;
  else if (values[row + 1][col    ] != "?") return false;
  else if (values[row + 1][col - 1] != "?") return false;
  else if (values[row + 1][col + 1] != "?") return false;
  else return true;
}

function leftBlocked(row, col) {
  if (checkBounds(row, col - 1) == false) return true;
  else if (values[row    ][col - 1] == "?") return false;
  else if (values[row + 1][col - 1] == "?") return false;
  else if (values[row - 1][col - 1] == "?") return false;
  else return true;
}

function leftOpen(row, col) {
  if (checkBounds(row, col - 1) == false) return false;
  else if (values[row    ][col - 1] != "?") return false;
  else if (values[row + 1][col - 1] != "?") return false;
  else if (values[row - 1][col - 1] != "?") return false;
  else return true;
}

function rightBlocked(row, col) {
  if (checkBounds(row, col + 1) == false) return true;
  else if (values[row    ][col + 1] == "?") return false;
  else if (values[row + 1][col + 1] == "?") return false;
  else if (values[row - 1][col + 1] == "?") return false;
  else return true;
}

function rightOpen(row, col) {
  if (checkBounds(row, col + 1) == false) return false;
  else if (values[row    ][col + 1] != "?") return false;
  else if (values[row + 1][col + 1] != "?") return false;
  else if (values[row - 1][col + 1] != "?") return false;
  else return true;
}

function notHidden(row, col) {
  if (!checkBounds(row, col)) return true;
  else if (arr[row][col] != "?") return true;
  else return false;
}

function notWall(row, col) {
  if (!checkBounds(row, col)) return false;
  else return true;
}

function isOne(row, col) {
  if ( !checkBounds(row, col) ) return false;
  else if (values[row][col] == 1) return true;
  else return false;
}

function isTwo(row, col) {
  if ( !checkBounds(row, col) ) return false;
  else if ( values[row][col] == 2 ) return true;
  else return false;
}

function checkBounds(row, col) {
  if (row == -1 || row == arr.length) return false;
  if (col == -1 || col == arr[0].length) return false;
  return true;
}

function initActive() {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[0].length; j++) {
      if (arr[i][j] == 0) activeElements.push([i, j]);
    }
  }
}

function initUnknowns() {
  let num_unknowns = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[0].length; j++) {
      if (arr[i][j] == "?") num_unknowns += 1;
    }
  }
  return num_unknowns;
}

function strToArr(map) {
   var arr = [];
   let rows = map.split("\n")
   for (let i = 0; i < rows.length; i++) {
     arr[i] = rows[i].split(" ");
   }
   return arr;
}

function arrToStr(arr) {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[0].length; j++) {
      if (arr[i][j] == "?") str += "." + " ";
      else str += arr[i][j] + " ";
    }
    str = str.trim();
    str += "\n";
  }
  str = str.trim();
  return str;
}

function print(arr) {
  console.log(arrToStr(arr));
  console.log("");
}

function show(row, col) {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[0].length; j++) {
      if (i == row && j == col) str += "#" + " ";
      else if (arr[i][j] == "?") str += "." + " ";
      else str += arr[i][j] + " ";
    }
    str = str.trim();
    str += "\n";
  }
  str = str.trim();
  console.log(str);
}

function countMines() { //// DEBUG:
  let mines = 0;
  for (let i = 0; i < resArr.length; i++) {
    for (let j = 0; j < resArr[0].length; j++) {
      if (resArr[i][j] == "x") mines += 1;
    }
  }
  return mines;
}

var map=
`0 0 0 0 0 0 0 0 0 0 ? ? ? ?
? ? ? ? 0 0 0 0 0 0 ? ? ? ?
? ? ? ? 0 0 0 ? ? ? ? ? ? ?
? ? ? ? ? ? ? ? ? ? ? ? ? ?
? ? ? ? ? ? ? ? ? ? ? ? ? ?
? ? ? ? ? ? ? ? ? 0 0 0 0 0
? ? ? ? ? 0 ? ? ? ? ? ? ? 0
? ? ? ? ? 0 ? ? ? ? ? ? ? 0
? ? ? ? ? ? ? ? ? ? ? ? ? 0
? ? ? 0 0 ? ? ? ? ? ? ? 0 0
0 0 0 0 0 ? ? ? ? ? ? ? ? 0
0 0 ? ? ? ? ? ? ? ? ? ? ? ?
0 0 ? ? ? ? ? ? ? ? ? ? ? ?
? ? ? ? ? ? ? ? ? ? ? ? ? ?
? ? ? ? ? 0 0 0 ? ? ? 0 ? ?
? ? ? ? ? ? ? ? ? ? ? 0 0 0
0 0 ? ? ? ? ? ? ? ? ? 0 0 0`,
result=
`0 0 0 0 0 0 0 0 0 0 2 x x 1
1 2 2 1 0 0 0 0 0 0 2 x 4 2
2 x x 1 0 0 0 1 2 3 3 3 4 x
2 x 3 2 1 1 1 2 x x x 2 x x
1 2 2 2 x 1 1 x 3 3 2 2 2 2
1 2 x 3 2 1 1 1 1 0 0 0 0 0
x 2 3 x 2 0 1 1 1 1 2 2 1 0
2 2 3 x 2 0 1 x 2 2 x x 1 0
1 x 2 1 1 1 2 3 x 2 2 2 1 0
1 1 1 0 0 1 x 3 2 3 1 1 0 0
0 0 0 0 0 1 1 2 x 2 x 2 1 0
0 0 1 2 2 2 1 2 1 3 4 x 3 1
0 0 2 x x 2 x 1 1 2 x x x 2
2 2 4 x 4 2 1 1 1 x 3 3 3 x
x x 4 x 3 0 0 0 2 2 2 0 1 1
2 2 3 x 2 1 1 1 1 x 1 0 0 0
0 0 1 1 1 1 x 1 1 1 1 0 0 0`

function open(i, j) {
  if (resArr[i][j] == "x") {
    throw `Opened a Mine! at row: ${i} col: ${j}`;
  } else {
    return resArr[i][j];
  }
}

function genRandom(maxSize) {
  let height = Math.floor(Math.random() * maxSize + 1);
  let width  = Math.floor(Math.random() * maxSize + 1);
  let newArr = new Array(height);
  for (let i = 0; i < newArr.length; i++) {
    let row = new Array(width);
    newArr[i] = row;
  }
  // populate mines
  let minesToPlace = Math.floor(height * width / 5);
  while (minesToPlace--) {
    let row = Math.floor(Math.random() * height);
    let col = Math.floor(Math.random() * width);
    newArr[row][col] = "x";
  }
  // populate values
  for (let row = 0; row < newArr.length; row++) {
    for (let col = 0; col < newArr[0].length; col++) {
      if (newArr[row][col] == "x") continue;
      newArr[row][col] = 0;
      for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
          if (i == row && j == col) continue;
          if (i == -1 || i == newArr.length) continue;
          if (j == -1 || j == newArr[0].length) continue;
          if (newArr[i][j] == "x") newArr[row][col] += 1;
        }
      }
    }
  }
  return newArr;
}

function genPuzzle() {
  for (let i = 0; i < resArr.length; i++) {
    for (let j = 0; j < resArr[0].length; j++) {
      if (resArr[i][j] == "0") arr[i][j] = "0";
      else arr[i][j] = "?"
    }
  }
}

function newEmpty(height, width) {
  let newArr = new Array(height);
  for (let i = 0; i < newArr.length; i++) {
    let row = new Array(width);
    newArr[i] = row;
  }
  return newArr
}

function copyToNewArr(array) {
  let retArr = [];
  for (let i = 0; i < array.length; i++) {
    let row = []
    retArr.push(row);
    for (let j = 0; j < array[i].length; j++) {
      retArr[i].push(array[i][j]);
    }
  }
  return retArr;
}

let random = true;
if (random) {
  var resArr = genRandom(20);
  var arr = newEmpty(resArr.length, resArr[0].length);
  genPuzzle();
  var values = copyToNewArr(arr);
  var adjUnknowns = copyToNewArr(arr);
  var numUnknowns = initUnknowns()
  var activeElements = [];
  var hasChanged = false;
  var nMines = countMines();
} else {
  var resArr = strToArr(result);
  var arr = strToArr(map);
  var values = strToArr(map);
  var adjUnknowns = strToArr(map);
  var numUnknowns = initUnknowns();
  var activeElements = [];
  var hasChanged = false;
  var nMines = countMines();
}

main(map, nMines);
