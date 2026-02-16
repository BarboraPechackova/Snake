// This module exports a class Game and function to initialize the game controls
import { Snake } from './snake.js';
import { Fruit } from './fruit.js';
import { setupGameOverScreen } from "./gameEndSetup.js";

const SNAKE_SPEED = 2; // Moves per second
let game; // Game instance to prevent re-initializing the game

// Initializes the game controls, also checks if user is offline
export function initializeGameControls(online) {

    // Check if the user is online
    if (online) {

        // Add event listeners to start the game
        document.getElementById("gameCanvas").addEventListener('click', startGameOnClick);
        document.getElementById('startInstructions').addEventListener('click', startGameOnClick);
        document.addEventListener('keydown', startGameOnClick);
    }

    // If the user is offline, display the message, do not play audio or add event listeners
    else {
        let startInstructions = document.getElementById('startInstructions')
        startInstructions.textContent = 'You are OFFLINE, please check your internet connection and try again';
        startInstructions.classList.add('error-text');
    }

}

// Removes the event listeners to prevent re-initializing the game
export function removeGameControls() {
    document.removeEventListener('keydown', startGameOnClick);
    document.getElementById("gameCanvas")?.removeEventListener('click', startGameOnClick);
    document.getElementById('startInstructions')?.removeEventListener('click', startGameOnClick);
}

// Starts the game when the user clicks on the canvas
async function startGameOnClick() {
    // Prevent starting the game multiple times
    removeGameControls();

    // Remove instructions and create the game instance
    document.getElementById('startInstructions')?.remove();

    // Create a new game instance
    game = new Game(SNAKE_SPEED, document.getElementById('gameCanvas'));

    // Play the click sound
    game.playSound(game.getSound('click'))

    // Start the game
    await game.initializeAndStartGame();
}


class Game {
    #gameEnd = false;
    #snakeSpeed;
    #lastRenderTime = 0;
    #snake;
    #fruit;
    #canvas;
    #ctx;
    #score = 0;
    #gameTime = 0;
    #sounds;
    #soundOn;
    #requestId = null;
    #timerInterval = null;

    constructor(snakeSpeed, canvas) {
        this.#snakeSpeed = snakeSpeed;
        this.#lastRenderTime = 0;
        this.#snake = new Snake(4, 'left', { x: 7, y: 4 });
        this.#fruit = new Fruit(canvas.width, canvas.height);
        this.#canvas = canvas;
        this.#ctx = canvas.getContext('2d');
        this.#sounds = {
            click: new Audio('resources/sounds/click.mp3'),
            eat: new Audio('resources/sounds/yoshi_tongue.mp3'),
            die: new Audio('resources/sounds/game_over.mp3')
        };
        this.#soundOn = window.localStorage.getItem('soundOn');

        // Listen for popstate events to handle browser navigation
        window.addEventListener('popstate', this.endGame.bind(this));
    }

    // Starts the timer
    startTimer() {
        this.#gameTime = 0; // Reset game time
        this.updateTimer(); // Update timer immediately

        // Clear any existing timer interval
        if (this.#timerInterval !== null) {
            clearInterval(this.#timerInterval);
        }

        // Start a new timer interval
        this.#timerInterval = setInterval(() => {
            this.#gameTime++; // Increment game time by one second
            this.updateTimer(); // Update UI timer
        }, 1000); // Update every second
    }

    // Initializes the game and starts the game loop
    async initializeAndStartGame() {
        try {
            // Load images for snake and fruit
            await this.#snake.loadImages();
            await this.#fruit.loadImages();
            // Add event listeners for arrow keys and touch controls
            this.setupKeyControls();
            this.setupTouchControls();
            // Start the timer
            this.startTimer();
            // Start the game loop
            requestAnimationFrame(this.gameLoop.bind(this));
        } catch (error) {
            console.error("Failed to start the game", error);
        }
    }

    // Creates event listeners for arrow keys
    setupKeyControls() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    this.#snake.changeOrientation('up');
                    break;
                case 'ArrowDown':
                    this.#snake.changeOrientation('down');
                    break;
                case 'ArrowLeft':
                    this.#snake.changeOrientation('left');
                    break;
                case 'ArrowRight':
                    this.#snake.changeOrientation('right');
                    break;
            }
        });
    }

    // Creates event listeners for touch controls
    setupTouchControls() {
        const manager = new Hammer.Manager(this.#canvas);
        const Swipe = new Hammer.Swipe();
        manager.add(Swipe);

        manager.on('swipeleft swiperight swipeup swipedown', (e) => {
            let direction;
            switch (e.type) {
                case 'swipeleft':
                    direction = 'left';
                    break;
                case 'swiperight':
                    direction = 'right';
                    break;
                case 'swipeup':
                    direction = 'up';
                    break;
                case 'swipedown':
                    direction = 'down';
                    break;
            }
            this.#snake.changeOrientation(direction);
        });
    }


    // Main game loop
    gameLoop(currentTime) {
        if (this.#gameEnd) {
            cancelAnimationFrame(this.#requestId);
            return;
        }

        // Frame rate control
        this.#requestId = requestAnimationFrame(this.gameLoop.bind(this));
        const secondsSinceLastRender = (currentTime - this.#lastRenderTime) / 1000;
        if (secondsSinceLastRender < 1 / this.#snakeSpeed) return;
        this.#lastRenderTime = currentTime;

        // Snake movement and drawing
        this.#snake.move();
        this.clearCanvas();
        this.#snake.draw(this.#ctx);
        this.#snake.directionChanged = false;

        // Check for self-collision
        if (this.#snake.selfCollision()) {
            this.gameOver();
            return; // Stop the game loop
        }

        // Fruit collision and redrawing
        if (this.checkFruitCollision(this.#snake.getHeadPosition(), this.#fruit.getPosition())) {
            this.#snake.grow();
            this.#score += 1; // Increase the score
            this.updateScore()
            this.#fruit.changeFruit(this.#snake.getBodyPositions()); // Change the fruit to new one
            this.playSound(this.#sounds.eat)
        }

        // Fruit drawing
        this.#fruit.draw(this.#ctx);
    }

    // Check if the snake head and fruit are at the same position
    checkFruitCollision(snakeHead, fruitPosition) {
        return snakeHead.x === fruitPosition.x && snakeHead.y === fruitPosition.y;
    }

    clearCanvas() {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    updateScore() {
        let scoreElement = document.getElementById('score');
        scoreElement.textContent = `Score: ${this.#score}`;
    }

    updateTimer() {
        let timerElement = document.getElementById('timer');
        const time = Math.floor(this.#gameTime);
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        // Conditionally format the output to include minutes only if there is at least one minute
        timerElement.textContent = minutes > 0
            ? `Time: ${minutes}m ${seconds}s`
            : `Time: ${seconds}s`;
    }

    // Ends the game, optionally clears the canvas, saves scores, and sets up the game over screen
    endGame() {
        this.#gameEnd = true; // Stop the game loop
        this.clearCanvas(); // Clear the canvas
        this.#score = 0; // Reset the score
        cancelAnimationFrame(this.#requestId);  // Stop the game loop
        clearInterval(this.#timerInterval); // Stop the timer
    }

    // Ends the game and sets up the game over screen
    gameOver() {
        this.#gameEnd = true; // Stop the game loop
        clearInterval(this.#timerInterval); // Stop the timer
        this.playSound(this.#sounds.die) // Play the game over sound
        this.saveTimeAndScore(); // Save the score and time to local storage
        this.saveToLeaderboard(); // Save the data to the leaderboard
        setupGameOverScreen(); // Set up the game over screen

        // Push a new state into the history
        history.pushState({ page: "game-over" }, "game-over", "#page=game-over");
    }

    playSound(sound) {
        if (this.#soundOn === 'true') {
            sound.play().catch(error => console.error("Failed to play the sound:", error));
        }
    }

    // Saves the score and time to local storage
    saveTimeAndScore() {
        window.localStorage.setItem('score', this.#score.toString());
        window.localStorage.setItem('time', this.#gameTime.toString());
    }

    // Adds the user data, score and time to the leaderboard
    saveToLeaderboard() {
        // Save the score and time and username to the leaderboard
        let leaderboard = window.localStorage.getItem('leaderboard');
        let username = window.localStorage.getItem('username');
        let image = window.localStorage.getItem('image');
        let score = this.#score;
        let time = this.#gameTime;
        let newEntry = { image, username, time, score };

        if (leaderboard) {
            leaderboard = JSON.parse(leaderboard);
            leaderboard.push(newEntry);
        } else {
            leaderboard = [newEntry];
        }
        window.localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }

    getSound(sound) {
        return this.#sounds[sound];
    }
}





