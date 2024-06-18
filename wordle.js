const ANSWER_LENGTH = 5;
const ROUNDS = 6;

const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");

// Initialize the game
async function init() {
  let currentRow = 0;
  let currentGuess = "";
  let done = false;
  let isLoading = true;

  // Fetch the word of the day
  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  const { word: wordRes } = await res.json();
  const word = wordRes.toUpperCase();
  const wordParts = word.split("");
  isLoading = false;
  setLoading(isLoading);

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    updateLetters(currentRow, currentGuess);
  }

  function commitGuess() {
    if (currentGuess.length !== ANSWER_LENGTH) return;
    const guessParts = currentGuess.split("");
    const map = makeMap(wordParts);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] !== wordParts[i]) {
        if (map[guessParts[i]] && map[guessParts[i]] > 0) {
          letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
          map[guessParts[i]]--;
        } else {
          letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
        }
      }
    }

    currentRow++;
    currentGuess = "";

    if (currentRow === ROUNDS) {
      done = true;
      showMessage(`The word was ${word}.`);
    }

    if (word === currentGuess) {
      done = true;
      showMessage("You Win!", true);
    }
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    updateLetters(currentRow, currentGuess);
  }

  function handleKeyPress(event) {
    if (done || isLoading) return;

    const action = event.key;
    if (action === "Enter") {
      commitGuess();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    }
  }

  function updateLetters(row, guess) {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[row * ANSWER_LENGTH + i].innerText = guess[i] || "";
    }
  }

  function showMessage(message, isWinner = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    if (isWinner) messageDiv.classList.add("winner");
    messageDiv.innerText = message;
    document.body.appendChild(messageDiv);
  }

  function setLoading(isLoading) {
    loadingDiv.classList.toggle("hidden", !isLoading);
  }

  function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
  }

  function makeMap(array) {
    const map = {};
    for (const item of array) {
      if (map[item]) {
        map[item]++;
      } else {
        map[item] = 1;
      }
    }
    return map;
  }

  document.addEventListener("keydown", handleKeyPress);

  setLoading(false);
}

init();
