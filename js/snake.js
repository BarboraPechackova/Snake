// This module exports a Snake class that handles all snake logic (movement, rendering, growing, self-collision)
export class Snake {
    #length;
    #bodyParts;
    #lastTailOrientation;
    #directionChanged = false;
    #snakeImages = {};

    constructor(length, orientation, position) {
        this.#length = length;
        this.#bodyParts = []; // Store position and orientation of each part of the snake
        this.#lastTailOrientation = orientation; // Initialize lastTailOrientation with the initial orientation

        // Initialize the bodyParts based on the initial position and orientation
        for (let i = 0; i < this.#length; i++) {
            let partOrientation = orientation; // Initial orientation for all parts
            let partPosition;
            switch (orientation) {
                case 'up': partPosition = { x: position.x, y: position.y + i }; break;
                case 'down': partPosition = { x: position.x, y: position.y - i }; break;
                case 'left': partPosition = { x: position.x + i, y: position.y }; break;
                case 'right': partPosition = { x: position.x - i, y: position.y }; break;
            }
            this.#bodyParts.push({ position: partPosition, orientation: partOrientation });
        }
    }

    // Draws the snake on the canvas
    draw(ctx) {
        this.#bodyParts.forEach((part, index, parts) => {
            let imgKey;
            if (index === 0) {
                // Head image is always the first part and default orientation
                imgKey = `head_${part.orientation}`;
            } else if (index === parts.length - 1) {
                // Tail image is always the last part and orientation is based on lastTailOrientation
                imgKey = `tail_${this.#lastTailOrientation}`;
            } else {
                const nextPartOrientation = parts[index + 1].orientation;
                // Corner image is based on the orientation of the current and next part, used only if they are different
                if (nextPartOrientation !== part.orientation) {
                    const cornerKey = part.orientation + '_' + nextPartOrientation;
                    if (this.#snakeImages.hasOwnProperty(`corner_${cornerKey}`)) {
                        imgKey = `corner_${cornerKey}`;
                    }
                } else {
                    imgKey = `body_${part.orientation}`;
                }
            }

            // Check if the image exists before trying to draw it
            if (this.#snakeImages.hasOwnProperty(imgKey)) {
                let img = this.#snakeImages[imgKey];
                ctx.drawImage(img, part.position.x * 50, part.position.y * 50, 50, 50);
            } else {
                console.error(`Image key not found: ${imgKey}`);
            }
        });
    }

    // Load all snake images before drawing
     async loadImages() {
        const orientations = ['up', 'down', 'left', 'right'];
        const parts = ['head', 'body', 'tail'];
        let promises = [];

        orientations.forEach(orientation => {
            parts.forEach(part => {
                promises.push(new Promise((resolve, reject) => {
                    let img = new Image();
                    img.onload = () => {
                        // Store the image with a key indicating its part and orientation
                        this.#snakeImages[`${part}_${orientation}`] = img;
                        resolve();
                    };
                    img.onerror = reject;
                    img.src = `resources/snake_sprite/snake_${part}_${orientation}.png`; // Update path as necessary
                }));
            });
        });

        const corners = ['up_right', 'up_left', 'right_down', 'right_up', 'down_left', 'down_right', 'left_up', 'left_down'];
        corners.forEach(corner => {
            promises.push(new Promise((resolve, reject) => {
                let img = new Image();
                img.onload = () => {
                    this.#snakeImages[`corner_${corner}`] = img;
                    resolve();
                };
                img.onerror = reject;
                img.src = `resources/snake_sprite/snake_corner_${corner}.png`;
            }));
        });
        await Promise.all(promises);
    }

    // Move the snake (called each game loop)
    move() {
        // Calculate new head position based on the orientation
        let headOrientation = this.#bodyParts[0].orientation;
        let newHeadPos = {...this.#bodyParts[0].position}; // Copy the current head position

        switch (headOrientation) {
            case 'up': newHeadPos.y -= 1; break;
            case 'down': newHeadPos.y += 1; break;
            case 'left': newHeadPos.x -= 1; break;
            case 'right': newHeadPos.x += 1; break;
        }

        // Wrap around logic
        if (newHeadPos.x < 0) newHeadPos.x = 9;
        if (newHeadPos.x > 9) newHeadPos.x = 0;
        if (newHeadPos.y < 0) newHeadPos.y = 9;
        if (newHeadPos.y > 9) newHeadPos.y = 0;

        // Update the last tail orientation before adding a new head
        if (this.#bodyParts.length > 1) {
            this.#lastTailOrientation = this.#bodyParts[this.#bodyParts.length - 2].orientation;
        }

        // Add the new head at the front
        this.#bodyParts.unshift({ position: newHeadPos, orientation: headOrientation });

        // Remove the last part of the snake to maintain its length
        this.#bodyParts.pop();

        this.#directionChanged = false; // Reset direction changed flag
    }

    // Changes the snake's orientation
    changeOrientation(newOrientation) {
        // Only allow changing direction if direction hasn't changed this game loop
        if (!this.#directionChanged && ((this.#bodyParts[0].orientation === 'up' && newOrientation !== 'down') ||
            (this.#bodyParts[0].orientation === 'down' && newOrientation !== 'up') ||
            (this.#bodyParts[0].orientation === 'left' && newOrientation !== 'right') ||
            (this.#bodyParts[0].orientation === 'right' && newOrientation !== 'left'))) {
            this.#bodyParts[0].orientation = newOrientation;
            this.#directionChanged = true; // Mark direction as changed
        }
    }

    // Grows the snake after eating food
    grow() {
        // Simply increase the length and do not pop the last body part in the next move
        this.#length++;
        this.#bodyParts.push({ position: this.#bodyParts[this.#bodyParts.length - 1].position, orientation: this.#lastTailOrientation }); // Add a new part at the tail's last position with the correct orientation
    }

    // Checks if the snake has collided with itself
    selfCollision() {
        const head = this.#bodyParts[0];
        for (let i = 1; i < this.#bodyParts.length; i++) {
            if (head.position.x === this.#bodyParts[i].position.x && head.position.y === this.#bodyParts[i].position.y) {
                return true;
            }
        }
        return false;
    }

    getHeadPosition() {
        return this.#bodyParts[0].position; // The head is the first element in bodyParts
    }

    getBodyPositions() {
        return this.#bodyParts.map(part => part.position);
    }


}