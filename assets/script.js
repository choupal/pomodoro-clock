// VARIABLES
// Timer settings
let timerSettings = {
  focus: 25,
  short: 5,
  long: 15,
  maxRounds: 4,
  currentRound: 1,
  currentSession: "Focus",
};

let timerDuration = dayjs.duration(timerSettings.focus, "minutes");
let timeLeft = timerDuration;
let timerInterval;
let timerPaused = true;

// Timer display
const timerDisplay = document.querySelector("#timer-display");
const sessionDisplay = document.querySelector("#session-display");
const roundsDisplay = document.querySelector("#rounds-display");

// Timer circle display
const fullCircle = 283;
let circleRemaining = document.querySelector("#timer-circle-remaining");

// Buttons
const settingsButton = document.querySelector("#settings-button");
const resetButton = document.querySelector("#reset-button");
const playButton = document.querySelector("#play-button");

// Settings panel pop-up
const mainContent = document.querySelector("#main-content");
const settingsContainer = document.querySelector("#settings-container");
const closeSettingsButton = document.querySelector("#close-settings-button");
const addButtons = document.getElementsByClassName("add-button");
const minusButtons = document.getElementsByClassName("minus-button");
const focusInput = document.querySelector("#focus-input");
const shortInput = document.querySelector("#short-input");
const longInput = document.querySelector("#long-input");
const roundsInput = document.querySelector("#rounds-input");
focusInput.innerHTML = timerSettings.focus;
shortInput.innerHTML = timerSettings.short;
longInput.innerHTML = timerSettings.long;
roundsInput.innerHTML = timerSettings.maxRounds;

// User feedback panel
const messageContainer = document.querySelector("#message-container");
const messageText = document.querySelector("#message");
const audioElement = document.querySelector("#audio");
const closeMessageButton = document.querySelector("#close-message-button");
let message;
let audio;

// BUTTONS SETUP AND ELEMENTS DISPLAY
// Display timer informations
function displayTimer(timeLeft) {
  let seconds = timeLeft.$d.seconds;
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  let minutes = timeLeft.$d.minutes;
  if (minutes < 10 || minutes === 0) {
    minutes = `0${minutes}`;
  }
  timerDisplay.innerHTML = `${minutes}:${seconds}`;
  roundsDisplay.innerHTML = `${timerSettings.currentRound}/${timerSettings.maxRounds}`;
  sessionDisplay.innerHTML = timerSettings.currentSession;
  if (timerSettings.currentSession === "Focus") {
    sessionDisplay.classList.add("red");
    sessionDisplay.classList.remove("green", "blue");
    circleRemaining.classList.add("red");
    circleRemaining.classList.remove("green", "blue");
  } else if (timerSettings.currentSession === "Short Break") {
    sessionDisplay.classList.add("green");
    sessionDisplay.classList.remove("red", "blue");
    circleRemaining.classList.add("green");
    circleRemaining.classList.remove("red", "blue");
  } else if (timerSettings.currentSession === "Long Break") {
    sessionDisplay.classList.add("blue");
    sessionDisplay.classList.remove("red", "green");
    circleRemaining.classList.add("blue");
    circleRemaining.classList.remove("red", "green");
  }
}

// Divides time left by the defined time limit. Returns a number to be used for the remaining circle length
function calculateTimeFraction() {
  const rawTimeFraction = timeLeft.$ms / timerDuration.$ms;
  return rawTimeFraction - (1 / timerDuration.$ms) * (1 - rawTimeFraction);
}

// Update the dasharray value (circle length) as time passes, starting with full circle
function setCircleDasharray() {
  const circleDasharray = `${(calculateTimeFraction() * fullCircle).toFixed(
    0,
  )} ${fullCircle}`;
  circleRemaining.setAttribute("stroke-dasharray", circleDasharray);
}

// Play/Pause button
playButton.addEventListener("click", () => {
  timerPaused ? startTimer() : pauseTimer();
});

// Reset button
resetButton.addEventListener("click", () => resetTimer());

// Settings buttons
settingsButton.addEventListener("click", () => {
  settingsContainer.classList.add("active");
  mainContent.classList.add("blur");
  resetTimer();
});

closeSettingsButton.addEventListener("click", () => {
  settingsContainer.classList.remove("active");
  mainContent.classList.remove("blur");
  displayTimer(timeLeft);
});

// TIMER SETUP
// Start Timer
function startTimer() {
  playButton.classList.toggle("fa-play-circle");
  playButton.classList.toggle("fa-pause-circle");
  playButton.classList.toggle("green");
  playButton.classList.toggle("white");
  clearInterval(timerInterval);
  timerPaused = false;
  timerInterval = setInterval(() => {
    timeLeft = timeLeft.subtract(1, "second");
    displayTimer(timeLeft);
    setCircleDasharray();
    sessionSwitch();
  }, 1000);
}

// Pause the timer
function pauseTimer() {
  clearInterval(timerInterval);
  timerPaused = true;
  playButton.classList.toggle("fa-play-circle");
  playButton.classList.toggle("fa-pause-circle");
  playButton.classList.toggle("green");
  playButton.classList.toggle("white");
}

// Reset the timer
function resetTimer() {
  clearInterval(timerInterval);
  timerPaused = true;
  if (timerSettings.currentSession === "Focus") {
    timerDuration = dayjs.duration(timerSettings.focus, "minutes");
  } else if (timerSettings.currentSession === "Short Break") {
    timerDuration = dayjs.duration(timerSettings.short, "minutes");
  } else if (timerSettings.currentSession === "Long Break") {
    timerDuration = dayjs.duration(timerSettings.long, "minutes");
  }
  timeLeft = timerDuration;
  displayTimer(timeLeft);
  setCircleDasharray();
  if (playButton.classList.contains("fa-pause-circle")) {
    playButton.classList.toggle("fa-play-circle");
    playButton.classList.toggle("fa-pause-circle");
    playButton.classList.toggle("green");
    playButton.classList.toggle("white");
  }
}

// SETTINGS
function changeSettings() {
  // Set add buttons to add 5 to settings and input display (for focus, short/long break), or 1 to rounds
  for (let index = 0; index < addButtons.length; index++) {
    addButtons[index].addEventListener("click", () => {
      let input = addButtons[index].previousElementSibling;
      if (input === focusInput) {
        input.innerHTML = Number(input.innerHTML) + 5;
        timerSettings.focus += 5;
        timerDuration = dayjs.duration(timerSettings.focus, "minutes");
        timeLeft = timerDuration;
      } else if (input === shortInput) {
        input.innerHTML = Number(input.innerHTML) + 5;
        timerSettings.short += 5;
      } else if (input === longInput) {
        input.innerHTML = Number(input.innerHTML) + 5;
        timerSettings.long += 5;
      } else if (input === roundsInput) {
        input.innerHTML = Number(input.innerHTML) + 1;
        timerSettings.maxRounds++;
      }
    });
  }
  // Set minus buttons to substract 5 to settings and input display (for focus, short/long break), or 1 to rounds
  for (let index = 0; index < minusButtons.length; index++) {
    minusButtons[index].addEventListener("click", () => {
      let input = minusButtons[index].nextElementSibling;
      if (input === focusInput) {
        input.innerHTML = Number(input.innerHTML) - 5;
        timerSettings.focus -= 5;
        timerDuration = dayjs.duration(timerSettings.focus, "minutes");
        timeLeft = timerDuration;
      } else if (input === shortInput) {
        input.innerHTML = Number(input.innerHTML) - 5;
        timerSettings.short -= 5;
      } else if (input === longInput) {
        input.innerHTML = Number(input.innerHTML) - 5;
        timerSettings.long -= 5;
      } else if (input === roundsInput) {
        input.innerHTML = Number(input.innerHTML) - 1;
        timerSettings.maxRounds--;
      }
    });
  }
}

// SESSION SWITCH
function sessionSwitch() {
  // At the end of the "Focus" timer switch to "Short/Long Break" timer
  if (timeLeft.$ms === 0 && timerSettings.currentSession === "Focus") {
    // If at the last round, switch to "Long Break" timer
    if (timerSettings.currentRound === timerSettings.maxRounds) {
      timerSettings.currentSession = "Long Break";
      timerDuration = dayjs.duration(timerSettings.long, "minutes");
      timeLeft = timerDuration;
      pauseTimer();
      displayTimer(timeLeft);
      setCircleDasharray();
      // User feedback display & audio
      audio = "assets/sounds/notif.mp3";
      message = `Stunning ! You have been <span class="red bold">focused</span> on a task for <span class="bold">${timerSettings.focus} min </span>! <br><br> You have completed <span class="bold">${timerSettings.currentRound} pomodoros</span>. Time for a <span class="blue bold">Long Break</span> !`;
      messagePopUp(message, audio);
    } else {
      // Switch to "Short Break" timer
      timerSettings.currentSession = "Short Break";
      timerDuration = dayjs.duration(timerSettings.short, "minutes");
      timeLeft = timerDuration;
      pauseTimer();
      displayTimer(timeLeft);
      setCircleDasharray();
      // User feedback display & audio setup
      audio = "assets/sounds/notif.mp3";
      message = `Bravo ! You have been <span class="red bold">focused</span> on a task for <span class="bold">${timerSettings.focus} min</span> ! <br><br> Time for a <span class="green bold">Short Break</span> !`;
      messagePopUp(message, audio);
    }
  }
  // At the end of the "Short Break" timer switch to "Focus" timer
  else if (
    timeLeft.$ms === 0 &&
    timerSettings.currentSession === "Short Break"
  ) {
    timerSettings.currentSession = "Focus";
    timerSettings.currentRound++;
    timerDuration = dayjs.duration(timerSettings.focus, "minutes");
    timeLeft = timerDuration;
    pauseTimer();
    displayTimer(timeLeft);
    setCircleDasharray();
    // User feedback display & audio setup
    audio = "assets/sounds/notif.mp3";
    message = `Wake Up ! The <span class="bold">${timerSettings.short} min</span> <span class="green bold">Short Break</span> is over ! <br><br> Time to <span class="red bold">focus</span> on a new task !`;
    messagePopUp(message, audio);
  }
  // At the end of the "Long Break" timer switch to "Focus" timer
  else if (
    timeLeft.$ms === 0 &&
    timerSettings.currentSession === "Long Break"
  ) {
    timerSettings.currentSession = "Focus";
    timerSettings.currentRound = 1;
    timerDuration = dayjs.duration(timerSettings.focus, "minutes");
    timeLeft = timerDuration;
    pauseTimer();
    displayTimer(timeLeft);
    setCircleDasharray();
    // User feedback display & audio setup
    audio = "assets/sounds/notif-long.mp3";
    message = `Wake Up ! The <span class="bold">${timerSettings.long} min</span> <span class="blue bold">Long Break</span> is over ! <br><br> You have done <span class="bold">${timerSettings.maxRounds} full</span> <span class="grey bold">Rounds</span> of pomodoros. Congratulations !!!`;
    messagePopUp(message, audio);
  }
}

// USER FEEDBACK MESSAGE
function messagePopUp(message, audio) {
  // Display user feedback message & play sound
  messageContainer.classList.add("active");
  mainContent.classList.add("blur");
  messageText.innerHTML = message;
  audioElement.setAttribute("src", audio);
  // Close message panel
  closeMessageButton.addEventListener("click", () => {
    messageContainer.classList.remove("active");
    mainContent.classList.remove("blur");
  });
}

// INIT ALL FUNCTIONS
displayTimer(timeLeft);
changeSettings();
