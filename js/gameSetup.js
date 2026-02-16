// This module exports a function to render the game screen
import {initializeGameControls} from "./game.js";

// Initialize the game screen with the canvas and instructions based on the online status
export function initializeGame(online) {
    setupGameScreen(online);
    initializeGameControls(online);
    if (!online) {
        // listen for online status change if user was offline
        window.addEventListener('online', () => {
            let online = navigator.onLine;
            rerenderGameScreen(online);
            initializeGameControls(online);
            // delete the event listener
            window.removeEventListener('online' , () => {});
        });
    }
}

// Renders the game screen with the canvas, timer, score, audio control and instructions
function setupGameScreen(online) {
    // Hide the header, form and game settings
    ['main-header', 'user-form-section', 'game-settings'].forEach(id => document.getElementById(id).style.display = "none");

    // Create and append game container
    let gameContainer = document.createElement("section");
    gameContainer.classList.add("game-container");
    gameContainer.id = 'game-container';
    document.body.append(gameContainer);

    // Create a container for the timer and score to use CSS grid for layout
    let infoContainer = document.createElement("div");
    infoContainer.classList.add("info-container");

    // Create the timer element
    let timer = document.createElement("div");
    timer.id = 'timer';
    timer.classList.add("timer");
    timer.textContent = "Time: 0s";
    infoContainer.append(timer); // Append the timer to the info container

    // Create the score counter element
    let scoreCounter = document.createElement("div");
    scoreCounter.id = 'score';
    scoreCounter.classList.add("score-counter");
    scoreCounter.textContent = "Score: 0";
    infoContainer.append(scoreCounter); // Append the score counter to the info container

    // Append the info container directly above the canvas in the canvas container
    gameContainer.prepend(infoContainer);

    // Create the instruction text and append it to the canvas container
    let instructionText = document.createElement("p");
    instructionText.id = 'startInstructions';
    instructionText.classList.add("instruction-text");
    instructionText.textContent = "CLICK to start the game";
    gameContainer.prepend(instructionText);

    // Create and append canvas
    let canvas = document.createElement("canvas");
    canvas.id = 'gameCanvas';
    canvas.width = 500;
    canvas.height = 500;
    gameContainer.append(canvas);


    // Create the audio control element
    let audioControl = document.createElement("audio");
    audioControl.controls = true;
    audioControl.loop = true;
    audioControl.type = "audio/mp3";
    if (online) {
        audioControl.src = "resources/sounds/audio.mp3";
    }
    gameContainer.append(audioControl);

    // Autoplay the audio if the user has enabled music and is online
    if (online && (window.localStorage.getItem('musicOn') === 'true') && audioControl.src !== "") {
        audioControl.play().catch(error => console.error("Failed to play the sound:", error));
    }

}

// Rerenders the game screen with the canvas if the user goes online after being offline
function rerenderGameScreen(online) {
    // Clear the game container
    document.getElementById('game-container').remove();

    // Re-render the game screen
    setupGameScreen(online);
}
