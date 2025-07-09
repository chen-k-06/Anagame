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
    }

    timeLeft -= 1;
}

updateTimer();
const timerId = setInterval(updateTimer, 10); // call updateTimer every millisecond
