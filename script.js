/*
Timer function logic
*/
let timeLeft = 60 * 100; // 60 seconds -> 60 * 1000 milliseconds
const timer = document.getElementById('timer');

function updateTimer() {
    const seconds = Math.floor(timeLeft / 100);
    const ms = Math.floor((timeLeft % 100));
    timer.textContent = `${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
    if (timeLeft <= 0) {
        clearInterval(timerId);
        timer.textContent = "Time's up!";
        play_button.classList.remove("disabled")
        in_game = false;
        console.log("Game over.")
    }

    timeLeft -= 1;
}

let play_button = document.getElementById('play-button');
let in_game = false;
let timerId = 0;
play_button.addEventListener("click", () => {
    if (in_game == true) {
        console.log("Already in a game.");
        return;
    }
    in_game = true;
    console.log("Game started.")
    play_button.classList.add("disabled")
    timeLeft = 60 * 100; // 60 seconds -> 60 * 1000 milliseconds
    updateTimer();
    timerId = setInterval(updateTimer, 10); // call updateTimer every millisecond
});
