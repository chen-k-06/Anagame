// =======================
// Constants & Globals
// =======================

const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 7;
const MAX_FUN_FACTOR = 20;
const tileCount = 7;

const slider = document.getElementById("slider");
const distToggle = document.getElementById("scrabble-uniform");
const timer = document.getElementById('timer');

const invalid_pair = ["-1", "=1"];

let INITAL_FUN_FACTOR = 5;
let fun_factor = MAX_FUN_FACTOR - INITAL_FUN_FACTOR;

let letters = [];
let letters_recieved = [];
let guesses = []; // list of strings, send to python code to calculate correct / incorrect etc
let pairs = []; // list of divs, meant to create elements for formatting

let currentGuess = "";
let guessCount = 0;
let distrbution_value;

let timeLeft = 60 * 100; // 60 seconds -> 60 * 1000 milliseconds

if (distToggle.value === "1") {
    console.log("Mode: SCRABBLE");
    distrbution_value = "scrabble"
} else {
    console.log("Mode: UNIFORM");
    distrbution_value = "uniform"
}

// =======================
// API call functions
// =======================

async function getLetters(fun_factor, distribution) {
    /**
     * Calls the API. Returns the 7 letters used for an active AnaGame
     *
     * @param fun_factor the minimum number of anagrams in the game
     * @returns {int[]} The reduced list of possible secret words
     */

    let fetchError = null;
    let result = null;
    if (fun_factor < 0 || fun_factor > MAX_FUN_FACTOR) {
        console.warn("Fun factor out of bounds.");
        return;
    }

    console.log("Sending:", JSON.stringify({
        fun_factor: fun_factor,
        distribution: distribution
    }));

    try {
        const response = await fetch('https://api-hosting-cdnc.onrender.com/anagame_get_letters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fun_factor: parseInt(fun_factor),
                distribution: String(distribution)
            })
        });

        result = await response.json();
        console.log('Response:', result);
    } catch (error) {
        fetchError = error;
        console.error('Fetch error:', fetchError);
    }
    return result
}

async function getStats(guesses, letters) {
    /**
     * Calls the API. Returns the 7 letters used for an active AnaGame
     *
     * @param fun_factor the minimum number of anagrams in the game
     * @returns {int[]} The reduced list of possible secret words
     */

    let fetchError = null;
    let result = null;

    console.log("Sending:", JSON.stringify({
        guesses: guesses,
        letters: letters
    }));

    try {

        const response = await fetch('https://api-hosting-cdnc.onrender.com/anagame_calc_stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                guesses: guesses,
                letters: letters
            })
        });

        result = await response.json();
        console.log('Response:', result);
    } catch (error) {
        fetchError = error;
        console.error('Fetch error:', fetchError);
    }
    return result
}


async function getHint(letters) {
    /**
     * Calls the API. Returns the 7 letters used for an active AnaGame
     *
     * @param fun_factor the minimum number of anagrams in the game
     * @returns {int[]} The reduced list of possible secret words
     */

    let fetchError = null;
    let result = null;

    console.log("Sending:", JSON.stringify({
        letters: letters
    }));

    try {
        const response = await fetch('https://api-hosting-cdnc.onrender.com/anagame_get_hint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                letters: letters
            })
        });

        result = await response.json();
        console.log('Response:', result);
    } catch (error) {
        fetchError = error;
        console.error('Fetch error:', fetchError);
    }
    return result
}

// =======================
// Game start logic & UI setup
// =======================

let play_button = document.getElementById('play-button');
let in_game = false;
let timerId = 0;

play_button.addEventListener("click", async () => {
    if (in_game == true) {
        console.log("Already in a game.");
        return;
    }

    // make API call for letters
    letters = getLetters(fun_factor, distrbution_value);
    timer.textContent = ". . .";

    // disable play button and slider
    document.getElementById('slider').disabled = true;
    document.getElementById('play-button').disabled = true;
    document.getElementById('scrabble-uniform').disabled = true;

    // reset containers
    guesses = [];
    pairs = [];

    // create first div for first word
    pairs[guessCount] = document.createElement("div");
    document.getElementById("played-words").appendChild(pairs[guessCount]);

    in_game = true;
    console.log("Game started.");
    play_button.classList.add("disabled");
    slider.classList.add("disabled");
    distToggle.classList.add("disabled");
    timeLeft = 60 * 100; // 60 seconds -> 60 * 1000 milliseconds

    // populate tiles
    letters_recieved = await letters;
    updateTiles(letters_recieved);

    // timer start
    updateTimer();
    timerId = setInterval(updateTimer, 10); // call updateTimer every millisecond
});

// =======================
// Tile update function
// =======================

function updateTiles(letters) {
    const tiles = document.querySelectorAll('.tile');
    for (let i = 0; i < tileCount; i++) {
        tiles[i].textContent = letters[i]
    }
}

// =======================
// Word entry event listener logic
// =======================

document.addEventListener('keydown', async function (event) {
    if (in_game == false) {
        return;
    }
    let key = event.key;
    if (key === 'Enter') {
        if (in_game == true && currentGuess != null) {
            // get feedback. log all relevant values into lists
            pairs[guessCount].classList.add('submitted');
            console.log('Submitting guess:', currentGuess);
            let anagram_pair = get_pair(currentGuess);
            guesses.push(anagram_pair)
            currentGuess = "";
            guessCount++;

            // update the html with the new pair
            console.log("Adding ", anagram_pair, " to guess list.");
            pairs[guessCount] = document.createElement("div"); // create a new div for the next word
            document.getElementById("played-words").appendChild(pairs[guessCount]);
        }
    }

    // backspace key logic
    else if (key === 'Backspace' && currentGuess.length != 0) {
        event.preventDefault();
        currentGuess = currentGuess.slice(0, -1);
        console.log('Deleted. Current guess: ', currentGuess);

        // update the html with the backspace
        pairs[guessCount].textContent = currentGuess;
    }

    // letter key logic
    else if (/^[a-zA-Z]$/.test(key) || /^[,]$/.test(key) || /^[ ]$/.test(key)) {
        currentGuess += key.toUpperCase();
        console.log('Added letter:', key.toUpperCase(), 'Current guess:', currentGuess);

        // still need to update the html with the new letter
        pairs[guessCount].textContent = currentGuess;
    }
});

// =======================
// Guess parsing function
// =======================

function get_pair(guess) {
    const index = guess.indexOf(',');
    if (index == -1) {
        // comma not found
        return invalid_pair;
    }

    let word1 = guess.slice(0, index);
    let word2 = guess.slice(index + 1, guess.length); // skip comma
    word1 = word1.trim();
    word2 = word2.trim();

    // check for multiple commas
    if (word1.indexOf(',') != -1 || word2.indexOf(',') != -1) {
        return invalid_pair;
    }

    return [word1, word2];
}

// =======================
// Timer & end game logic
// =======================

function updateTimer() {
    const seconds = Math.floor(timeLeft / 100);
    const ms = Math.floor((timeLeft % 100));
    timer.textContent = `${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
    if (timeLeft <= 0) {
        clearInterval(timerId);
        timer.textContent = "Done!";
        endGame();
    }

    timeLeft -= 1;
}

async function endGame() {
    in_game = false;
    slider.disabled = false;
    slider.classList.remove("disabled");
    play_button.disabled = false;
    play_button.classList.remove("disabled");
    distToggle.disabled = false;
    distToggle.classList.remove("disabled");
    console.log("Game over.");

    // Make API call to get stats
    stats = await getStats(guesses, letters_recieved);
    if (!stats) {
        console.warn("No stats received.");
        return;
    }

    // Display stats
    displayStats(stats);
}

// =======================
// Display stats / color coding guesses
// =======================

function displayStats(stats) {
    console.log("valid_guesses, invalid_guesses, score, accuracy, skill, guessed, not guessed");
    console.log("Guesses: ", guesses);
    let valid_guesses = stats.valid_guesses;
    let invalid_guesses = stats.invalid_guesses;

    console.log("valid guesses: ", valid_guesses)
    console.log("invalid guesses: ", invalid_guesses)

    // apply coloring for correct / incorrect
    for (let i = 0; i < guesses.length; i++) {
        let guess = pairs[i];
        console.log("Processing pair / div \"", guess, "\".");
        console.log("guess: ", guesses[i])
        console.log("equality: ", arraysEqual(valid_guesses, guesses[i]))
        if (arraysEqual(valid_guesses, guesses[i])) {
            guess.classList.remove('submitted');
            guess.classList.add('correct');
        }
        else {
            guess.classList.add('incorrect');
        }
    }

    let score_box = document.getElementById('score_box');
    let accuracy_box = document.getElementById('accuracy_box');
    let skill_box = document.getElementById('skill_box');
    let not_guessed_box = document.getElementById('not_guessed_box');

    score_box.textContent = `Score: ${stats.score}`;
    accuracy_box.textContent = `Accuracy: ${stats.accuracy}%`;
    skill_box.textContent = `Skill: ${stats.skill}`;
    not_guessed_reformated = reformat_stats(stats.not_guessed_words);
    not_guessed_box.textContent = `Words you could've used: ${not_guessed_reformated}`;
}

function arraysEqual(a, b) {
    // a is an array of possible correct answers 

    let word2 = b;
    word2.sort();

    for (let i = 0; i < a.length; i++) {
        let word1 = a[i]; // ["ATE", "EAT"]
        word1.sort();
        console.log("word 1:", word1, " word2: ", word2)

        let word1_1 = word1[0];
        let word1_2 = word1[1];

        let word2_1 = word2[0];
        let word2_2 = word2[1];

        if (word1_1.length !== word2_1.length) continue;
        if (word1_2.length !== word2_2.length) continue;

        let flag1 = true;

        // check the first words
        for (let j = 0; j < word1_1.length; j++) {
            if (word1_1[j].toLowerCase() !== word2_1[j].toLowerCase()) {
                flag1 = false;
                break;
            }
        }

        let flag2 = true;
        // check the second words 

        for (let j = 0; j < word1_2.length; j++) {
            if (word1_2[j].toLowerCase() !== word2_2[j].toLowerCase()) {
                flag2 = false;
                break;
            }
        }

        if (flag1 && flag2) {
            return true;
        }
    }
    return false;
}

function reformat_stats(words) {
    // pre-sorted by prime hash / alphabetically 
    // add spaces
    copy = "";
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        copy = copy + word + ", "
    }
    return copy;
}

// =======================
// Distribution toggle & slider logic
// =======================

distToggle.addEventListener("input", () => {
    if (distToggle.value === "1") {
        console.log("Mode: SCRABBLE");
    } else {
        console.log("Mode: UNIFORM");
    }
});

slider.addEventListener("input", () => {
    fun_factor = MAX_FUN_FACTOR - slider.value;
});

// =======================
// Slider styling
// =======================

function updateSliderBackground(slider) {
    const percent = ((slider.value - slider.min) / (slider.max - slider.min) * 100) + 2;
    slider.style.background = `linear-gradient(to right, red 0%, red ${percent}%, white ${percent}%, white 100%)`;
}

slider.addEventListener('input', () => updateSliderBackground(slider));
updateSliderBackground(slider);

// =======================
// Distribution toggle styling logic
// =======================

distToggle.addEventListener("mousedown", (e) => {
    if (distToggle.value === "0") {
        distrbution_value = "scrabble"
        distToggle.value = 1;
    }
    else {
        distrbution_value = "uniform"
        distToggle.value = 0;
    }
    e.preventDefault();
});

// =======================
// Help button event listeners
// =======================

document.getElementById("how-to").addEventListener("click", () => {

    // if the help button is click, display the popup with the relevant game information
    console.log('How to button was clicked!');
    const how_to_popup = document.getElementById("how-to-popup");
    const message = document.getElementById("how-to-message");
    message.innerHTML = `In Anagame, you're given 7 letters. <br>Use them to find pairs of valid anagrams separated by a comma, then press Enter to submit.<br>
    Correct pairs turn green, incorrect ones turn red.<br>
    The more valid, unique words you find, the higher your score.`
    how_to_popup.classList.remove("hidden");
});

document.getElementById("close-popup-button").addEventListener("click", () => {
    const how_to_popup = document.getElementById("how-to-popup");
    how_to_popup.classList.add("hidden");
});

// =======================
// Hint button event listeners
// =======================

document.getElementById("hint").addEventListener("click", () => {
    console.log('Hint button was clicked!');
    const how_to_popup = document.getElementById("hint-popup");
    const message = document.getElementById("hint-content");
    let hint = getHint();
    message.innerHTML = `Try working with ${hint}`
    how_to_popup.classList.remove("hidden");
});

document.getElementById("close-hint-button").addEventListener("click", () => {
    const hint_popup = document.getElementById("hint-popup");
    hint_popup.classList.add("hidden");
});