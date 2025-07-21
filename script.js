const WORD_LENGTH = 5;
const MAX_TURNS = 6;

// Exemple de mots à tirer aléatoirement :
//const WORD_LIST = 

const solution = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
let currentTurn = 0;

const game = document.getElementById("game");
const form = document.getElementById("guess-form");
const input = document.getElementById("guess-input");
const message = document.getElementById("message");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const guess = input.value.toLowerCase();

  if (guess.length !== WORD_LENGTH) {
    alert("Le mot doit faire 5 lettres.");
    return;
  }

  if (!WORD_LIST.includes(guess)) {
    alert("Mot inconnu.");
    return;
  }

  const row = document.createElement("div");
  row.classList.add("row");

  for (let i = 0; i < WORD_LENGTH; i++) {
    const letterBox = document.createElement("div");
    letterBox.classList.add("tile");
    letterBox.textContent = guess[i];

    if (guess[i] === solution[i]) {
      letterBox.classList.add("correct");
    } else if (solution.includes(guess[i])) {
      letterBox.classList.add("present");
    } else {
      letterBox.classList.add("absent");
    }

    row.appendChild(letterBox);
  }

  game.appendChild(row);
  currentTurn++;

  if (guess === solution) {
    message.textContent = "🎉 Bravo ! Tu as trouvé le mot !";
    input.disabled = true;
  } else if (currentTurn === MAX_TURNS) {
    message.textContent = `❌ Perdu ! Le mot était "${solution}".`;
    input.disabled = true;
  }

  input.value = "";
});
