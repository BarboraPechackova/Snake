// This module exports functions to set up the game over screen and leaderboard screen.

// Renders game over screen with the player's score, buttons and event listeners
export function setupGameOverScreen() {
    // Remove the game canvas
    document.querySelector(".game-container")?.remove();

    // Make body have justify-content center
    document.body.classList.replace("justify-space-between", "justify-center");

    // Create container
    const gameOverContainer = document.createElement("section");
    gameOverContainer.classList.add("form-container");
    gameOverContainer.id = "game-over-section";
    document.body.append(gameOverContainer);

    // Create game over text
    const gameOverText = document.createElement("h2");
    gameOverText.textContent = "Game Over";
    gameOverText.classList.add("game-over-text");

    // Create score display
    const scoreDisplay = document.createElement("h2");
    const score = window.localStorage.getItem("score");
    scoreDisplay.textContent = `Score: ${score}`;
    scoreDisplay.classList.add("score-text");

    // Create a button container
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    // Create "Play Again" button
    const playAgainButton = document.createElement("button");
    playAgainButton.textContent = "Play Again";
    playAgainButton.classList.add("enabled", "play-again-button");
    playAgainButton.addEventListener("click", () => playAgain("game-over-section"));

    // Create "See Leaderboard" button
    const leaderboardButton = document.createElement("button");
    leaderboardButton.textContent = "See Leaderboard";
    leaderboardButton.classList.add("enabled", "leaderboard-button");
    leaderboardButton.addEventListener("click", renderLeaderboard);

    // Append all the elements
    gameOverContainer.appendChild(gameOverText);
    gameOverContainer.appendChild(scoreDisplay);
    gameOverContainer.appendChild(buttonContainer);
    buttonContainer.appendChild(playAgainButton);
    buttonContainer.appendChild(leaderboardButton);
}

// Renders the leaderboard screen with the leaderboard, a play again button and event listeners
export function renderLeaderboard() {
    // Remove the game over form
    document.getElementById("game-over-section")?.remove();

    // Create a container for the leaderboard
    const leaderboardContainer = document.createElement("section");
    leaderboardContainer.classList.add("form-container");
    leaderboardContainer.id = "leaderboard-section";
    document.body.append(leaderboardContainer);

    // Create the title
    const leaderboardTitle = document.createElement("h2");
    leaderboardTitle.textContent = "Leaderboard";
    leaderboardTitle.classList.add("leaderboard-title");
    leaderboardContainer.appendChild(leaderboardTitle);

    renderTable(leaderboardContainer);

    // Create a button
    const playAgainButton = document.createElement("button");
    playAgainButton.textContent = "Play Again";
    playAgainButton.classList.add("enabled", "play-again-button");
    playAgainButton.addEventListener("click", () => playAgain("leaderboard-section"));
    leaderboardContainer.appendChild(playAgainButton);

    // Push a new state into the history
    history.pushState({ page: "leaderboard" }, "leaderboard", "#page=leaderboard");

}

// Renders the leaderboard table (helper function)
function renderTable(leaderboardContainer) {
    // Retrieve the leaderboard from local storage
    let leaderboard = JSON.parse(window.localStorage.getItem('leaderboard') || '[]');

    // Sort the leaderboard by score, descending (optional)
    leaderboard.sort((a, b) => b.score - a.score);

    // Create a table to display the leaderboard
    let table = document.createElement('table');
    table.classList.add('leaderboard-table'); // Add a class for styling if needed

    // Create the table header
    let thead = document.createElement('thead');
    let headerRow = document.createElement('tr');
    ['','Name', 'Time', 'Score'].forEach(headerText => {
        let header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    let tbody = document.createElement('tbody');
    leaderboard.forEach(entry => {
        let row = document.createElement('tr');

        renderUserImage(row, entry);

        // Add the rest
        ['username', 'time', 'score'].forEach(key => {
            let cell = document.createElement('td');
            cell.textContent = entry[key];
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    leaderboardContainer.appendChild(table);
}

// Renders the user image in the leaderboard table (helper function)
function renderUserImage(row, entry) {
    let imageCell = document.createElement('td');
    let img = document.createElement('img');

    if (entry.image) {
        // Use the image from local storage or entry
        img.src = entry.image;
    } else {
        // Create an SVG image if no user image is available (also works as offline fallback)
        const svgData = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path fill="black" d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"/></svg>`;
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData); // Use SVG data as the image source
    }

    img.classList.add('leader-image-preview');
    img.alt = `User ${entry.username} uploaded image`;
    imageCell.appendChild(img);
    row.appendChild(imageCell);
}

// Play again button functionality
function playAgain(section) {
    // Remove the game over form
    document.getElementById(section)?.remove();

    removeEventListeners()

    // Go back to the title screen
    if (section === "game-over-section") {
        history.go(-2);
    }
    else {
        history.go(-3);
    }
}

// Remove event listeners from the buttons
function removeEventListeners() {
    document.getElementById('play-again-button')?.removeEventListener("click", playAgain);
    document.getElementById('leaderboard-button')?.removeEventListener("click", renderLeaderboard);
}

// Renders the title screen and resets local storage
export function renderTitleScreen() {
    removeEventListeners()

    // Change body back to justify-space-between
    document.body.classList.replace("justify-center", "justify-space-between");

    // Show the title page again
    ['main-header', 'user-form-section', 'game-settings'].forEach(id => document.getElementById(id).style.display = "block");

    // Remove the values from local storage
    ['score', 'time', 'image'].forEach(key => window.localStorage.removeItem(key));
    // Remove the name and image from the form
    document.getElementById('username-input').value = '';
    document.getElementById('user-image')?.remove();
    document.getElementById('upload-instructions').style.display = 'block';

    // Push a new state into the history
    history.pushState({ page: "title" }, "title", "#page=title");
}