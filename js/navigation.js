// This module handles the high level navigation between the different screens of the game, it exports a function to initialize the navigation
import {renderLeaderboard, renderTitleScreen, setupGameOverScreen} from "./gameEndSetup.js";
import {initializeGame} from "./gameSetup.js";
import {removeGameControls} from "./game.js";

// Initialize the navigation event listener for the back button and handle the state changes
export function initializeNavigation() {
    window.addEventListener("popstate", function(event) {
        if (event.state) {
            // Check state and update UI accordingly
            switch (event.state.page) {
                case "game":
                    clearAllPreviousScreens();
                    initializeGame(navigator.onLine);
                    break;
                case "game-over":
                    clearAllPreviousScreens();
                    setupGameOverScreen();
                    break;
                case "leaderboard":
                    clearAllPreviousScreens();
                    renderLeaderboard();
                    break;
                default:
                    // Default to title screen
                    removeGameControls();
                    clearAllPreviousScreens();
                    renderTitleScreen();
            }
        } else {
            // No state found, reset to initial title screen
            removeGameControls();
            clearAllPreviousScreens();
            renderTitleScreen();
        }
    });
}

// Function to clear all previous screens and UI components from the title screen (excludes event listeners)
function clearAllPreviousScreens() {
    // Clear all previous screens
    const sectionsToClear = ['game-container', 'game-over-section', 'leaderboard-section'];
    sectionsToClear.forEach(id => {
        const elem = document.getElementById(id);
        elem?.remove();
    });

    // Hide UI components from the title screen
    ['main-header', 'user-form-section', 'game-settings'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.style.display = "none";
    });
}

