// Last Updated: 01/19/2024

// Constants based on {Set 10, Patch 14.1} game data
const totalUnits = [22, 20, 17, 10, 9];
const distinctChamps = [13, 13, 13, 13, 8];
const costProbs = [
  [1.0, 0.0, 0.0, 0.0, 0.0], // Level 1
  [1.0, 0.0, 0.0, 0.0, 0.0], // Level 2
  [0.75, 0.25, 0.0, 0.0, 0.0], // Level 3
  [0.55, 0.3, 0.15, 0.0, 0.0], // Level 4
  [0.45, 0.33, 0.2, 0.02, 0.0], // Level 5
  [0.3, 0.4, 0.25, 0.05, 0.0], // Level 6
  [0.19, 0.35, 0.35, 0.1, 0.01], // Level 7
  [0.18, 0.25, 0.36, 0.18, 0.03], // Level 8
  [0.1, 0.2, 0.25, 0.35, 0.1], // Level 9
  [0.05, 0.1, 0.2, 0.4, 0.25], // Level 10
];

// Event listeners for input changes
document.getElementById("unitCost").addEventListener("input", function () {
  document.getElementById("unitCostOutput").value = this.value;
  updateTable();
});

document.getElementById("currentLevel").addEventListener("input", function () {
  document.getElementById("currentLevelOutput").value = this.value;
  updateTable();
});

document.getElementById("numCopies").addEventListener("input", function () {
  updateTable();
  console.error("Updated Table");
});

document.getElementById("sameCostUnits").addEventListener("input", function () {
  updateTable();
});

document.getElementById("rollingGold").addEventListener("input", function () {
  updateTable();
});

// Function to update the cost value and trigger graph update
function updateCost() {
  var val = document.getElementById("unitCost").value;
  document.getElementById("unitCostOutput").innerHTML = val;
}

// Function to update the level value and trigger graph update
function updateLevel() {
  var val = document.getElementById("currentLevel").value;
  document.getElementById("currentLevelOutput").innerHTML = val;
}

/**
 * Increments the value of a specified input field by a given amount.
 *
 * @param {string} fieldId The ID of the input field to increment.
 * @param {number} amount The amount to add to the input field's current value.
 */
function incrementField(fieldId, amount) {
  var input = document.getElementById(fieldId);
  var currentValue = parseInt(input.value, 10) || 0;
  var newValue = currentValue + amount;
  var maxValue = fieldId === "rollingGold" ? Infinity : 99;

  if (newValue >= 0 && newValue <= maxValue) {
    input.value = newValue;
  }
  updateTable();
}

function resetField(fieldId) {
  var input = document.getElementById(fieldId);
  input.value = 0;
  updateTable();
}

/**
 * Updates the probability table based on the current input values.
 */
function updateTable() {
  const probabilities = getProbs(
    parseInt(document.getElementById("unitCost").value),
    parseInt(document.getElementById("currentLevel").value),
    parseInt(document.getElementById("numCopies").value),
    parseInt(document.getElementById("sameCostUnits").value),
    parseInt(document.getElementById("rollingGold").value)
  )[1];

  for (let i = 1; i <= 9; i++) {
    const probabilityCell = document.getElementById(`chance-${i}`);
    probabilityCell.textContent = `${(probabilities[i] * 100).toFixed(2)}%`;
  }
}

/** WONG CODE BELOW (Matrix Calculations from @wongkj12) */

function getCostProb(lvl, cost) {
  return costProbs[lvl - 1][cost - 1];
}

// Function to get probabilities for desired unit copies
function getProbs(cost, lvl, a, b, gold) {
  var mat = getTransitionMatrix(cost, lvl, a, b);
  mat = power(mat, 5 * Math.floor(gold / 2));

  // Probabilities for exactly 0, 1, 2, ..., 9 of desired unit
  const pprob = mat[0];

  // Cumulative probabilities for at least 0, 1, 2, ..., 9 of desired unit
  let cprob = [1];
  for (let i = 1; i < 11; i++) {
    let p = 1;
    for (let j = 0; j < i; j++) {
      p -= pprob[j];
    }
    cprob.push(p.toFixed(2));
  }

  return [pprob, cprob];
}

// Function to calculate the transition matrix
function getTransitionMatrix(cost, lvl, a, b) {
  const mat = [];
  for (let i = 0; i < 10; i++) {
    const newRow = [];
    for (let j = 0; j < 10; j++) {
      if (i == 9 && j == 9) {
        newRow.push(1); // from X >= 9 to X >= 9, probability is 1
        continue;
      }
      const p = getTransitionProb(cost, lvl, a + i, b + i);
      if (j == i) {
        newRow.push(1 - p);
      } else if (j == i + 1) {
        newRow.push(p);
      } else {
        newRow.push(0);
      }
    }
    mat.push(newRow);
  }
  return mat;
}

// Function to calculate the transition probability
function getTransitionProb(cost, lvl, a, b) {
  const howManyLeft = Math.max(0, totalUnits[cost - 1] - a);
  const poolSize = totalUnits[cost - 1] * distinctChamps[cost - 1] - b;
  return getCostProb(lvl, cost) * (howManyLeft / poolSize);
}

// Function to multiply matrices
function multiply(a, b) {
  var aNumRows = a.length,
    aNumCols = a[0].length,
    bNumRows = b.length,
    bNumCols = b[0].length,
    m = new Array(aNumRows); // initialize array of rows
  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row
    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0; // initialize the current cell
      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
      m[r][c] = m[r][c];
    }
  }
  return m;
}

// Function to calculate the power of a matrix
function power(a, n) {
  var newmat = a;
  for (let i = 0; i < n - 1; i++) {
    newmat = multiply(newmat, a);
  }
  return newmat;
}