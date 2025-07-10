const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 7;
let guesses = []; // list of lists, send to python code to calculate correct / incorrect etc
let pairs = []; // list of divs, meant to create elements for formatting 
let currentGuess = "";
let guessCount = 0;

/*
Start game logic
*/
let play_button = document.getElementById('play-button');
let in_game = false;
let timerId = 0;
play_button.addEventListener("click", () => {
    if (in_game == true) {
        console.log("Already in a game.");
        return;
    }

    // disable play button and slider
    document.getElementById('slider').disabled = true;
    document.getElementById('play-button').disabled = true;

    // reset containers
    guesses = [];
    pairs = [];

    // create first div for first word 
    pairs[guessCount] = document.createElement("div");
    document.getElementById("played-words").appendChild(pairs[guessCount]);

    in_game = true;
    console.log("Game started.")
    play_button.classList.add("disabled")
    timeLeft = 60 * 100; // 60 seconds -> 60 * 1000 milliseconds
    updateTimer();
    timerId = setInterval(updateTimer, 10); // call updateTimer every millisecond
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
        if (in_game == true && currentGuess != null && currentGuess.length >= MIN_WORD_LENGTH) {
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
Timer function logic
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
        play_button.classList.remove("disabled")
        in_game = false;
        document.getElementById('slider').disabled = false;
        document.getElementById('play-button').disabled = false;
        console.log("Game over.")

        // get feedback
    }

    timeLeft -= 1;
}