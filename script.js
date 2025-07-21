const WORD_LENGTH = 5;
const MAX_TURNS = 6;

// Exemple de mots à tirer aléatoirement :
const WORD_LIST = mots.map(mot => mot.toLowerCase());

const solution = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
let currentTurn = 0;

const game = document.getElementById("game");
const form = document.getElementById("guess-form");
const input = document.getElementById("guess-input");
const message = document.getElementById("message");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitGuess();

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

document.querySelectorAll('.key').forEach(button => {
  button.addEventListener('click', () => {
    if (locked) return;
    const action = button.dataset.action;
    const value = button.textContent.toUpperCase();

    if (action === 'enter') {
      submitGuess();
    } else if (action === 'back') {
      deleteLastLetter();
    } else if (currentGuess.length < WORD_LENGTH) {
      addLetter(value);
    }
  });
});

function updateKeyboardColors(guess, feedback) {
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i].toUpperCase();
    const key = document.querySelector(`.key:not([data-action])`);

    const button = Array.from(document.querySelectorAll('.key')).find(
      b => b.textContent === letter
    );

    if (!button) continue;

    const state = feedback[i]; // "correct", "present", "absent"

    // Met à jour la couleur uniquement si c'est une meilleure info
    const current = button.dataset.state;
    if (current === "correct") continue; // pas besoin de changer
    if (current === "present" && state === "absent") continue;

    button.dataset.state = state;
  }
}

function getFeedback(guess, solution) {
  const feedback = Array(guess.length).fill("absent");
  const solutionArr = solution.split('');
  const guessArr = guess.split('');
  let used = Array(solution.length).fill(false);

  for (let i = 0; i < guessArr.length; i++) {
    if (guessArr[i] === solutionArr[i]) {
      feedback[i] = "correct";
      used[i] = true;
      solutionArr[i] = null;
      guessArr[i] = null;
    }
  }

  for (let i = 0; i < guessArr.length; i++) {
    if (!guessArr[i]) continue;
    const idx = solutionArr.indexOf(guessArr[i]);
    if (idx !== -1 && !used[idx]) {
      feedback[i] = "present";
      used[idx] = true;
      solutionArr[idx] = null;
    }
  }

  return feedback;
}


let currentGuess = '';
let locked = false;

function addLetter(letter) {
  if (currentGuess.length < WORD_LENGTH) {
    currentGuess += letter;
    synchronizeInput();
  }
}

function deleteLastLetter() {
  currentGuess = currentGuess.slice(0, -1);
  synchronizeInput();
}

function synchronizeInput() {
  input.value = currentGuess.toUpperCase();
}

function submitGuess() {
  if (locked) return;
  const guess = currentGuess.toLowerCase();

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
  const feedback = getFeedback(guess, solution);
  for (let i = 0; i < WORD_LENGTH; i++) {
    const letterBox = document.createElement("div");
    letterBox.classList.add("tile");
    letterBox.textContent = guess[i].toUpperCase();
    letterBox.classList.add(feedback[i]);
    row.appendChild(letterBox);
  }

  input.addEventListener('input', (e) => {
  const sanitized = e.target.value.replace(/[^a-zA-ZÀ-ÿ]/g, '').toUpperCase().slice(0, WORD_LENGTH);
  currentGuess = sanitized;
  input.value = sanitized;
});

  game.appendChild(row);
  updateKeyboardColors(guess, feedback);

  currentTurn++;
  if (guess === solution) {
    message.textContent = "🎉 Bravo ! Tu as trouvé le mot !";
    locked = true;
    input.disabled = true;
  } else if (currentTurn === MAX_TURNS) {
    message.textContent = `❌ Perdu ! Le mot était "${solution.toUpperCase()}".`;
    locked = true;
    input.disabled = true;
  }

  currentGuess = "";
  synchronizeInput();
}



