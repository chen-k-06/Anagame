const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 7;
const MAX_FUN_FACTOR = 40;
const tileCount = 7;
const slider = document.getElementById("slider");
const distToggle = document.getElementById("scrabble-uniform");
let fun_factor = 40 - 20;
let guesses = []; // list of strings, send to python code to calculate correct / incorrect etc
let pairs = []; // list of divs, meant to create elements for formatting 
let currentGuess = "";
let guessCount = 0;
let distrbution_value = "uniform";

if (distToggle.value === "1") {
    console.log("Mode: SCRABBLE");
    distrbution_value = "scrabble"
} else {
    console.log("Mode: UNIFORM");
    distrbution_value = "uniform"
}

/*
Start game logic
*/
let play_button = document.getElementById('play-button');
let in_game = false;
let timerId = 0;

play_button.addEventListener("click", async () => {
    if (in_game == true) {
        console.log("Already in a game.");
        return;
    }

    // make API call for letters
    let letters = getLetters(fun_factor, distrbution_value);

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
    const letters_recieved = await letters;
    console.log("Letters recieved: ", letters_recieved);
    updateTiles(letters_recieved);

    // timer start
    updateTimer();
    timerId = setInterval(updateTimer, 10); // call updateTimer every millisecond
});

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

        const response = await fetch('https://anagame.onrender.com/get_letters', {
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

function updateTiles(letters) {
    const tiles = document.querySelectorAll('.tile');
    for (let i = 0; i < tileCount; i++) {
        tiles[i].textContent = letters[i]
    }
}

/*
Scrabble / uniform distrbution toggle logic
*/

distToggle.addEventListener("input", () => {
    if (distToggle.value === "1") {
        console.log("Mode: SCRABBLE");
    } else {
        console.log("Mode: UNIFORM");
    }
});

slider.addEventListener("input", () => {
    fun_factor = 40 - slider.value;
});

/*
Word entry event listener logic 
*/
document.addEventListener('keydown', async function (event) {
    if (in_game == false) {
        return;
    }
    let key = event.key;
    if (key === 'Enter') {
        if (in_game == true && currentGuess != null && currentGuess.length >= MIN_WORD_LENGTH && currentGuess.length <= 2 * MAX_WORD_LENGTH + 2) {
            // get feedback. log all relevant values into lists
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
        console.log('Deleted. Current guess:', currentGuess);

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

function get_pair(guess) {
    const index = guess.indexOf(',');
    if (index == -1) {
        // comma not found
        return [-1, -1];
    }

    let word1 = guess.slice(0, index);
    let word2 = guess.slice(index + 1, guess.length);
    return [word1, word2];
}

/*
Timer function / end game logic
*/
let timeLeft = 60 * 100; // 60 seconds -> 60 * 1000 milliseconds
const timer = document.getElementById('timer');

function updateTimer() {
    // timeLeft = 0
    const seconds = Math.floor(timeLeft / 100);
    const ms = Math.floor((timeLeft % 100));
    timer.textContent = `${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
    if (timeLeft <= 0) {
        clearInterval(timerId);
        timer.textContent = "Done!";
        endGame();

        // get feedback
        // send API call
    }

    timeLeft -= 1;
}

/*
End of game logic 
*/
function endGame() {
    in_game = false;
    slider.disabled = false;
    slider.classList.remove("disabled");
    play_button.disabled = false;
    play_button.classList.remove("disabled");
    distToggle.disabled = false;
    distToggle.classList.remove("disabled");
    console.log("Game over.");

    // Make API call to get stats
    stats = getStats(guesses,);

    // Display stats
    displayStats(stats);
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

        const response = await fetch('https://anagame.onrender.com/calc_stats"', {
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

function displayStats(stats) {
    console.log("accuracy, valid_guesses, invalid_guesses, skill, final score");
    console.log("Guesses: ", guesses);
    let valid_words = stats["valid"];

    // apply coloring for correct / incorrect
    for (let i = 0; i < guesses.length; i++) {
        console.log("Processing guess \"", guesses[i], "\".");
        if (!valid_words.includes(guesses[i])) {
            guesses[i].classList.add('correct')
        }
        else {
            guesses[i].classList.add('incorrect')
        }
    }
}

function areArraysEq(x, y) {
    return true;
}

/*
Slider styling
*/
function updateSliderBackground(slider) {
    const percent = ((slider.value - slider.min) / (slider.max - slider.min) * 100) + 2;
    slider.style.background = `linear-gradient(to right, red 0%, red ${percent}%, white ${percent}%, white 100%)`;
}

slider.addEventListener('input', () => updateSliderBackground(slider));
updateSliderBackground(slider);

/*
Toggle styling 
*/
distToggle.addEventListener("mousedown", (e) => {
    if (distToggle.value === "1") {
        distrbution_value = "scrabble"
        distToggle.value = 0;
    }
    else {
        distrbution_value = "uniform"
        distToggle.value = 1;
    }
    e.preventDefault();
});