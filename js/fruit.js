// This module exports a class Fruit and handles all fruit logic (selection, rendering, changing)
const FRUIT_NAMES = ["Apple", "Banana", "Grape", "Cherry", "Kiwi", "Lemon", "Orange", "Peach", "Pear", "Pineapple", "Strawberry", "Watermelon"];

export class Fruit {
    #canvasWidth;
    #canvasHeight;
    #position;
    #name;
    #fruitImages = {};

    constructor(canvasWidth, canvasHeight) {
        this.#canvasWidth = canvasWidth;
        this.#canvasHeight = canvasHeight;
        this.#position = this.randomPosition();
        this.#name = this.randomFruitName();
        this.#fruitImages = {};
    }

    randomPosition() {
        // Calculate a random position within the canvas grid
        const x = Math.floor(Math.random() * (this.#canvasWidth / 50));
        const y = Math.floor(Math.random() * (this.#canvasHeight / 50));
        return { x,y };
    }

    randomFruitName() {
        // Select a random fruit name from the provided list
        const randomIndex = Math.floor(Math.random() * FRUIT_NAMES.length);
        return FRUIT_NAMES[randomIndex];
    }

    draw(ctx) {
        // Check if the image exists before trying to draw it
        if (this.#fruitImages.hasOwnProperty(this.#name)) {
            let img = this.#fruitImages[this.#name];

            // Calculate the offset to center the 32x32 image within the 50x50 space
            const offset = (50 - 32) / 2; // (Cell size - Image size) / 2
            ctx.drawImage(img, this.#position.x *50 + offset, this.#position.y *50 + offset, 32, 32);
        } else {
            console.error(`Image key not found: ${this.#name}`);
        }
    }

    async loadImages() {
        let promises = FRUIT_NAMES.map(FRUIT_NAME => {
            return new Promise((resolve, reject) => {
                let img = new Image();
                img.onload = () => {
                    this.#fruitImages[FRUIT_NAME] = img; // Correctly assign to the object
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Failed to load image for ${FRUIT_NAME}`);
                    reject(`Failed to load image for ${FRUIT_NAME}`);
                };
                img.src = `resources/fruits/${FRUIT_NAME}.png`;
            });
        });

        await Promise.all(promises);
    }

    changeFruit(snakePositions) {
        let position = this.randomPosition(); // Initialize with a random position
        let overlapsWithSnake = true; // Initialize to enter the loop

        while (overlapsWithSnake) {
            overlapsWithSnake = false; // Reset for the current iteration

            // Check for overlap with snake positions
            for (let i = 0; i < snakePositions.length; i++) {
                if (snakePositions[i].x === position.x && snakePositions[i].y === position.y) {
                    overlapsWithSnake = true; // Overlap found, will need another iteration
                    position = this.randomPosition(); // Generate a new position
                    break;
                }
            }
        }

        this.#position = position; // Set the new position
        this.#name = this.randomFruitName();
    }

    getPosition() {
        return this.#position;
    }
}
