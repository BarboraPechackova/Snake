// Module with functions for the title screen (saving of user data, enabling the start button, and image upload functionality)

// Saves the user data to local storage (username, soundOn, musicOn)
export function saveUserData() {
    const username = document.getElementById("username-input").value;
    window.localStorage.setItem('username', username);

    const soundOn = document.getElementById("sound").checked;
    window.localStorage.setItem('soundOn', soundOn.toString());

    const musicOn = document.getElementById("music").checked;
    window.localStorage.setItem('musicOn', musicOn.toString());
}

// Enables the start button when the user has entered a username
export function enableButton(input, button) {
    if (input.length > 0) {
        button.classList.add("enabled");
    }
    if (input.length === 0 && button.classList.contains("enabled")) {
        button.classList.remove("enabled")
    }
}

// Sets up the file upload functionality
export function setupImageUpload() {
    const dropArea = document.getElementById('drop-area');
    const fileElement = document.getElementById('fileElement');

    // Open file dialog when drop area is clicked
    dropArea.addEventListener('click', () => {
        fileElement.click();
    });

    // Prevent opening the file when the drop area is clicked
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    // Handle the file drop
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('active');
        const files = e.dataTransfer.files;
        handleFiles(files);  // Process files
    });

    // Handle the file input
    fileElement.addEventListener('change', (e) => {
        const files = e.target.files;
        handleFiles(files);
    });
}

// Uses file api to save and display the image (helper function)
function handleFiles(files) {
    if (files.length) {
        const file = files[0]
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if(file.size > 307200) {
                    alert('Uploaded image is to big! (max 300kb is allowed) Please upload a smaller image.');
                    return;
                }
                try {
                    // Save the image to local storage
                    window.localStorage.setItem('image', e.target.result.toString());

                    // Hide the drop area text
                    document.getElementById('upload-instructions').style.display = 'none';

                    // Remove any existing image previews
                    document.querySelector('.image-preview')?.remove();

                    // Display the image
                    const image = document.createElement('img');
                    image.src = e.target.result.toString();
                    image.classList.add('image-preview');
                    image.alt = 'User uploaded image';
                    image.id = 'user-image';
                    document.getElementById('drop-area').append(image);
                } catch (error) {
                    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                        // Handle QuotaExceededError
                        alert('Unable to save image! Local storage capacity has been exceeded. Try saving a smaller image or clearing your local storage.');
                    } else {
                        // Handle generic errors
                        console.error('Failed to save image:', error);
                    }
                }
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please upload an image');
        }
    }
}