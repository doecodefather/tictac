
let redWins = 0;
let blueWins = 0;


let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; // 
let gameActive = false;

function startgame() {
  gameActive = true;
  resetBoard();
}


function restartgame() {
  gameActive = false;
  resetBoard();
}


function resetBoard() {
  board = ["", "", "", "", "", "", "", "", ""];
  const cells = document.getElementsByClassName('point');
  for (let i = 0; i < cells.length; i++) {
    cells[i].innerHTML = "";       
    cells[i].style.color = "#000"; 
  }
  currentPlayer = "X";
}


function pointClicked(index) {
  if (!gameActive) return;        
  if (board[index] !== "") return; 

  board[index] = currentPlayer;
  const cell = document.getElementsByClassName('point')[index];
  cell.innerHTML = currentPlayer;

  
  cell.style.color = "#000";
  cell.style.fontSize = "60px";
  cell.style.textAlign = "center";
  cell.style.lineHeight = "100px";

  checkWinner(); 

 
  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

const winningCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];


function checkWinner() {
  for (let combo of winningCombos) {
    const [a,b,c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      endGame(board[a]);
      return;
    }
  }

  if (!board.includes("")) {
    gameActive = false;
    alert("Unentschieden! Kein Gewinner in dieser Runde.");
  }
}


function endGame(winner) {
  gameActive = false;

  if (winner === "X") {
    redWins++; 
    document.getElementById("redScore").innerText = `Rot: ${redWins}`;
    document.getElementById("blueScore").innerText = `Blau: ${blueWins}`;
    alert(`X (Rot) hat gewonnen!\nSpielstand: Rot ${redWins} : ${blueWins} Blau`);
  }

  if (winner === "O") {
    blueWins++; 
    document.getElementById("redScore").innerText = `Rot: ${redWins}`;
    document.getElementById("blueScore").innerText = `Blau: ${blueWins}`;
    alert(`O (Blau) hat gewonnen!\nSpielstand: Rot ${redWins} : ${blueWins} Blau`);
  }
  saveResult(redWins, blueWins);
}


let db;
const request = indexedDB.open("TicTacToeDB", 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;

  
  if (!db.objectStoreNames.contains("results")) {
    const store = db.createObjectStore("results", { keyPath: "id", autoIncrement: true });
    store.createIndex("date", "date", { unique: false });
  }
};

request.onsuccess = function(event) {
  db = event.target.result;
  console.log("IndexedDB bereit");
  displayResults(); 
};

request.onerror = function(event) {
  console.error("Fehler beim Öffnen der DB:", event.target.errorCode);
};


function saveResult(rotScore, blauScore) {
  if (!db) return;
  const transaction = db.transaction(["results"], "readwrite");
  const store = transaction.objectStore("results");

  const result = {
    rot: rotScore,
    blau: blauScore,
    date: new Date().toLocaleString()
  };

  store.add(result);

  transaction.oncomplete = () => {
    console.log("Ergebnis in der DB gespeichert");
    displayResults(); 
  };

  transaction.onerror = () => console.error("Fehler beim Speichern des Ergebnises");
}


function displayResults() {
  if (!db) return;
  const resultsContainer = document.getElementById("results");
  if (!resultsContainer) return;
  resultsContainer.innerHTML = "";

  const transaction = db.transaction(["results"], "readonly");
  const store = transaction.objectStore("results");
  const request = store.openCursor();

  request.onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      const result = cursor.value;
      const div = document.createElement("div");
      div.textContent = `${result.date} - Rot: ${result.rot} | Blau: ${result.blau}`;
      resultsContainer.appendChild(div);
      cursor.continue();
    }
  };
}





