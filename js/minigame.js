document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('player');
    const gameArea = document.getElementById('game-area');
    const bottomLine = document.createElement('div'); // Create the bottom line
    const scoreDisplay = document.getElementById('score');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const gameOverModal = new bootstrap.Modal(document.getElementById('gameOverModal'));
    const pauseMenuModal = new bootstrap.Modal(document.getElementById('pauseMenuModal'));
    const playAgainBtn = document.getElementById('play-again-btn');
    const goBackBtn = document.getElementById('go-back-btn');
    const finalScore = document.getElementById('final-score');
    const resumeGameBtn = document.getElementById('resume-game-btn');
    const pauseScore = document.getElementById('pause-score');
    const volumeControl = document.getElementById('volume-control');
    const collectSound = document.getElementById('collect-sound');
    const notCollectSound = document.getElementById('not-collect-sound');
    const restartGameBtn = document.getElementById('restart-game-btn');
    const exitGameBtn = document.getElementById('exit-game-btn');

    let score = 0;
    let gameInterval;
    let isPaused = false;
    let playerSpeed = 7;  // Player movement speed
    let fallingSpeed = 2; // Initial falling hearts speed
    let speedIncreaseInterval;  // Interval for increasing heart speed
    let keys = {};  // Track pressed keys
    let volume = 1; // Volume control default
    let animationFrameId;
    let pointsPerHeart = 1;  // Initial points per heart


        // Get the game overlay and play button
        const gameOverlay = document.getElementById('game-overlay');
        const playGameBtn = document.getElementById('play-game-btn');
        
        // Hide the overlay and start the game when the play button is clicked
        playGameBtn.addEventListener('click', () => {
            gameOverlay.style.display = 'none';  // Hide the overlay
            startGame();  // Start the game
        });
    
        // Start Game function with initialization
        function startGame() {
            score = 0;
            updateScore(0);
            isPaused = false;
            fallingSpeed = 2; // Reset falling speed
    
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
    
            gameInterval = setInterval(createFallingHeart, 2000);
            speedIncreaseInterval = setInterval(increaseFallingSpeed, 5000);  // Increase speed every 5 seconds
    
            requestAnimationFrame(updatePlayerPosition);  // Smooth player movement
        }
     
    // Add the bottom line just above the pause button
    bottomLine.style.position = 'absolute';
    bottomLine.style.height = '4px';
    bottomLine.style.width = '100%';
    bottomLine.style.backgroundColor = '#ff6f91'; // Slightly darker line
    bottomLine.style.bottom = '80px'; // Right above the pause button
    bottomLine.style.zIndex = '2'; // Above the hearts but below the player
    gameArea.appendChild(bottomLine);

    // Start Game
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resumeGameBtn.addEventListener('click', resumeGame);

    // Play Again Button in Modal
    playAgainBtn.addEventListener('click', () => {
        resetGame();
        gameOverModal.hide();
    });

    // Restart Game Button in Pause Menu
restartGameBtn.addEventListener('click', () => {
    resetGame();
    pauseMenuModal.hide();
});

// Exit Game Button in Pause Menu
exitGameBtn.addEventListener('click', () => {
    window.location.href = 'index.html';  // Redirect to the main page or wherever you want to exit to
});

    // Back Button in Modal
    goBackBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Volume control change
    volumeControl.addEventListener('input', (e) => {
        volume = e.target.value;
        collectSound.volume = volume;
        notCollectSound.volume = volume;  // Also set the volume for the not collect sound
    });

    // Listen for ESC key to open the pause menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            togglePause();
            if (isPaused) {
                openPauseMenu();
            }
        }
    });

    // Game Start Function
    function startGame() {
        score = 0;
        updateScore(0);
        isPaused = false;
        fallingSpeed = 2; // Reset falling speed

        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';

        gameInterval = setInterval(createFallingHeart, 2000);
        speedIncreaseInterval = setInterval(increaseFallingSpeed, 5000);  // Increase speed every 5 seconds

        requestAnimationFrame(updatePlayerPosition);  // Smooth player movement
    }

    function createFallingHeart() {
        if (isPaused || score < 0 || score >= 150) return;  // Prevent creating hearts if the game is paused, over, or won
        
        const heart = document.createElement('div');
        heart.classList.add('falling-heart');
        heart.style.left = `${Math.random() * (gameArea.offsetWidth - 50)}px`;
        gameArea.appendChild(heart);
        
        let heartFall = setInterval(() => {
            if (isPaused) return; // Prevent hearts from moving when the game is paused
            
            let heartTop = parseInt(window.getComputedStyle(heart).getPropertyValue('top'));
        
            // Check if the heart touches the bottom line
            if (heartTop > gameArea.offsetHeight - 80) {
                heart.remove();
                clearInterval(heartFall);
                notCollectSound.play();  // Play the sound when the heart is not collected
                score = score - 3; // Deduct 3 points
                updateScore(score);
                if (score < 0) {
                    clearInterval(heartFall); // Stop falling hearts when the game ends
                    showGameOverModal();  // End game if score is negative
                }
            } else {
                heart.style.top = `${heartTop + fallingSpeed}px`;
            }
        
            // Check for collision with the top of the player
            if (checkTopCollision(player, heart)) {
                score += pointsPerHeart;  // Add points based on current points per heart
                updateScore(score);
                heart.remove();
                clearInterval(heartFall);
    
                // Check for win condition
                if (score >= 150) {
                    showWinModal();  // Show the win modal if the score reaches 150
                    return;
                }
        
                // Adjust points per heart based on score thresholds
                if (score >= 50) {
                    pointsPerHeart = 3;  // Hearts give 3 points after reaching 50
                } else if (score >= 25) {
                    pointsPerHeart = 2;  // Hearts give 2 points after reaching 25
                }
            }
        }, 20);
    }
    

    function showWinModal() {
        // Stop all intervals and animations
        clearInterval(gameInterval);
        clearInterval(speedIncreaseInterval);
        cancelAnimationFrame(animationFrameId);
        
        // Clear all currently falling hearts
        const hearts = document.querySelectorAll('.falling-heart');
        hearts.forEach(heart => {
            heart.remove(); // Remove each heart from the game area
        });
        
        // Show the win modal
        gameOverModal.hide();  // Hide the game over modal if it's showing
        const winModal = new bootstrap.Modal(document.getElementById('winModal'));
        winModal.show();
    }

    document.getElementById('play-again-btn-win').addEventListener('click', () => {
        resetGame();
        const winModal = bootstrap.Modal.getInstance(document.getElementById('winModal'));
        winModal.hide();
    });
    
    document.getElementById('go-back-btn-win').addEventListener('click', () => {
        window.location.href = 'index.html';  // Redirect to home page
    });
    
    

    // Check for collision between the top of the player and the heart
    function checkTopCollision(player, heart) {
        let playerRect = player.getBoundingClientRect();
        let heartRect = heart.getBoundingClientRect();

        // Only count collisions with the top of the player
        if (
            heartRect.y + heartRect.height > playerRect.y &&
            heartRect.y < playerRect.y + playerRect.height / 2 && // Ensure collision is with the top half of the player
            playerRect.x < heartRect.x + heartRect.width &&
            playerRect.x + playerRect.width > heartRect.x
        ) {
            collectSound.play(); // Play collect sound
            return true;
        }
        return false;
    }

    // Increase Falling Speed Over Time
    function increaseFallingSpeed() {
        fallingSpeed += 0.5;  // Increase the falling speed of hearts
    }

    // Track key presses
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;  // Mark the key as pressed
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;  // Mark the key as released
    });

// Smooth Player Movement
function updatePlayerPosition() {
    if (!isPaused && score >= 0) {  // Prevent movement after game over
        let playerLeft = parseInt(window.getComputedStyle(player).getPropertyValue('left'));

        if (keys['ArrowLeft'] && playerLeft > 0) {
            player.style.left = `${playerLeft - playerSpeed}px`;
        }
        if (keys['ArrowRight'] && playerLeft < gameArea.offsetWidth - player.offsetWidth) {
            player.style.left = `${playerLeft + playerSpeed}px`;
        }
    }

    // Store the animation frame ID and call the function again
    animationFrameId = requestAnimationFrame(updatePlayerPosition);
}


    // Update Score
    function updateScore(newScore) {
        const heartEmoji = "❤️"; // Define the heart emoji
        scoreDisplay.textContent = `${heartEmoji} x ${newScore}`; // Display score as heart emoji followed by score
    }

// Pause/Resume the Game
function togglePause() {
    isPaused = !isPaused;
    
    if (isPaused) {
        clearInterval(speedIncreaseInterval); // Stop increasing the speed during pause
        openPauseMenu();
    } else {
        // Restart the speed increase interval when unpausing
        speedIncreaseInterval = setInterval(increaseFallingSpeed, 5000);
    }
    
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

    // Open the Pause Modal
    function openPauseMenu() {
        pauseScore.textContent = score; // Set current score in the modal
        volumeControl.value = volume; // Set current volume in the slider
        pauseMenuModal.show(); // Show pause modal
    }

    // Resume Game
    function resumeGame() {
        pauseMenuModal.hide();
        isPaused = false;
        pauseBtn.textContent = 'Pause';
    }

    function showGameOverModal() {
        // Stop all intervals
        clearInterval(gameInterval);
        clearInterval(speedIncreaseInterval);
    
        // Stop player movement by canceling the animation
        cancelAnimationFrame(animationFrameId);
    
        // Clear all currently falling hearts
        const hearts = document.querySelectorAll('.falling-heart');
        hearts.forEach(heart => {
            heart.remove(); // Remove each heart from the game area
        });
    
        // Update the final score and show the game-over modal
        finalScore.textContent = score;  // Set the final score in the modal
        gameOverModal.show();  // Display the modal
    }

    function resetGame() {
        // Remove only the falling hearts
        const hearts = document.querySelectorAll('.falling-heart');
        hearts.forEach(heart => heart.remove());
        
        // Reset game variables
        score = 0;
        updateScore(0);
        fallingSpeed = 2;  // Reset the falling speed
        
        // Cancel any ongoing animations before restarting
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    
        // Restart the game and player movement
        startGame();
    }
});
