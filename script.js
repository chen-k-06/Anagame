/*
Timer function logic
*/
let timeLeft = 6000; // seconds
const timer = document.getElementById('timer');

function updateTimer() {
    const seconds = Math.floor(timeLeft / 60);
    const ms = timeLeft % 100;
    timer.textContent = `${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
    if (timeLeft <= 0) {
        clearInterval(timerId);
        timer.textContent = "Time's up!";
    }

    timeLeft--;
}

updateTimer();
const timerId = setInterval(updateTimer, 1);
