const ANSWER_LENGTH = 5;
const ROUNDS = 6;
const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
const keyboardContainer = document.getElementById("keyboard");

const KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function createKeyboard() {
  KEYS.forEach(key => {
    const keyElement = document.createElement("div");
    keyElement.className = "key";
    keyElement.innerText = key;
    keyElement.addEventListener("click", () => handleKeyClick(key));
    keyboardContainer.appendChild(keyElement);
  });
}

function handleKeyClick(key) {
  if (done || isLoading) return;

  if (key === "Enter") {
    commit();
  } else if (key === "Backspace") {
    backspace();
  } else if (isLetter(key)) {
    addLetter(key);
    disableKey(key);
  }
}

function disableKey(key) {
  const keyElements = document.querySelectorAll(".key");
  keyElements.forEach(keyElement => {
    if (keyElement.innerText === key) {
      keyElement.classList.add("disabled");
    }
  });
}

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

  createKeyboard();

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText = letter;
  }

  async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) return;

    isLoading = true;
    setLoading(isLoading);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });
    const { validWord } = await res.json();
    isLoading = false;
    setLoading(isLoading);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split("");
    const map = makeMap(wordParts);
    let allRight = true;

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) continue;
      if (map[guessParts[i]] && map[guessParts[i]] > 0) {
        allRight = false;
        letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
        map[guessParts[i]]--;
      } else {
        allRight = false;
        letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
      }
    }

    if (allRight) {
      alert("You win!");
      document.querySelector(".brand").classList.add("winner");
      done = true;
    } else if (currentRow === ROUNDS) {
      alert(`You lose, the word was ${word}`);
      done = true;
    }

    currentRow++;
    currentGuess = "";
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = "";
  }

  function markInvalidWord() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");
      setTimeout(() => letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid"), 10);
    }
  }

  document.addEventListener("keydown", function handleKeyPress(event) {
    if (done || isLoading) return;

    const action = event.key.toUpperCase();
    if (action === "ENTER") {
      commit();
    } else if (action === "BACKSPACE") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action);
      disableKey(action);
    }
  });
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}

function makeMap(array) {
  const obj = {};
  for (const item of array) {
    if (obj[item]) {
      obj[item]++;
    } else {
      obj[item] = 1;
    }
  }
  return obj;
}

init();
