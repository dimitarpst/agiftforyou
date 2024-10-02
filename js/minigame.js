document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('player');
    const gameArea = document.getElementById('game-area');
    const bottomLine = document.createElement('div');
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
    let playerSpeed = 7;
    let fallingSpeed = 2;
    let keys = {};
    let volume = 1;
    let animationFrameId;
    let pointsPerHeart = 1;
    let isTouchingBasket = false;
    let heartCreationInterval;
    let hasShown2xPopup = false;
    let hasShown3xPopup = false;
    let hasShown4xPopup = false;

    const gameOverlay = document.getElementById('game-overlay');
    const playGameBtn = document.getElementById('play-game-btn');
    playGameBtn.addEventListener('click', () => {
        gameOverlay.style.display = 'none';
        startGame();
        // testIncreaseFallingSpeed();
    });

    function startGame() {
        score = 0;
        updateScore(0);
        isPaused = false;
        fallingSpeed = 2;
        if (heartCreationInterval) {
            clearInterval(heartCreationInterval);
        }
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        heartCreationInterval = setInterval(createFallingHeart, 2000);
        increaseFallingSpeed();

    
        requestAnimationFrame(updatePlayerPosition);
    }

    bottomLine.style.position = 'absolute';
    bottomLine.style.height = '4px';
    bottomLine.style.width = '100%';
    bottomLine.style.backgroundColor = '#ff6f91';
    bottomLine.style.bottom = '80px';
    bottomLine.style.zIndex = '2';
    gameArea.appendChild(bottomLine);

    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resumeGameBtn.addEventListener('click', resumeGame);
    playAgainBtn.addEventListener('click', () => {
        resetGame();
        gameOverModal.hide();
    });
    restartGameBtn.addEventListener('click', () => {
        resetGame();
        pauseMenuModal.hide();
    });
    exitGameBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    goBackBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    volumeControl.addEventListener('input', (e) => {
        volume = e.target.value;
        collectSound.volume = volume;
        notCollectSound.volume = volume;
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            togglePause();
            if (isPaused) {
                openPauseMenu();
            }
        }
    });

    function createFallingHeart() {
        if (isPaused || score < 0 || score >= 150) return;
    
        const heart = document.createElement('div');
        heart.classList.add('falling-heart');
        heart.style.left = `${Math.random() * (gameArea.offsetWidth - 50)}px`;
        gameArea.appendChild(heart);
    
        let heartFall = setInterval(() => {
            if (isPaused) return;
    
            let heartTop = parseInt(window.getComputedStyle(heart).getPropertyValue('top'));
            if (heartTop > gameArea.offsetHeight - 80) {
                heart.remove();
                clearInterval(heartFall);
                notCollectSound.play();
                score = score - 3;
                updateScore(score);
                if (score < 0) {
                    clearInterval(heartFall);
                    showGameOverModal();
                }
            } else {
                heart.style.top = `${heartTop + fallingSpeed}px`;
            }
    
            if (checkTopCollision(player, heart)) {
                score += pointsPerHeart;
                increaseFallingSpeed();
                updateScore(score);
                heart.remove();
                clearInterval(heartFall);
    
                if (score >= 30 && !hasShown2xPopup) {
                    pointsPerHeart = 2;
                    hasShown2xPopup = true;
                    showMultiplierAnnouncement(2);
                    return;
                }
                if (score >= 60 && !hasShown3xPopup) {
                    pointsPerHeart = 3;
                    hasShown3xPopup = true;
                    showMultiplierAnnouncement(3);
                    return;
                }
                if (score >= 90 && !hasShown4xPopup) {
                    pointsPerHeart = 4;
                    hasShown4xPopup = true;
                    showMultiplierAnnouncement(4);
                    return;
                }
                
    
                if (score >= 150) {
                    showWinModal();
                    return;
                }
            }
        }, 20);
    }

    function showWinModal() {
        clearInterval(gameInterval);
        cancelAnimationFrame(animationFrameId);
        const hearts = document.querySelectorAll('.falling-heart');
        hearts.forEach(heart => {
            heart.remove();
        });
        gameOverModal.hide();
        const winModal = new bootstrap.Modal(document.getElementById('winModal'));
        winModal.show();
    }

    document.getElementById('play-again-btn-win').addEventListener('click', () => {
        resetGame();
        const winModal = bootstrap.Modal.getInstance(document.getElementById('winModal'));
        winModal.hide();
    });

    document.getElementById('go-back-btn-win').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    function checkTopCollision(player, heart) {
        let playerRect = player.getBoundingClientRect();
        let heartRect = heart.getBoundingClientRect();
        if (
            heartRect.y + heartRect.height > playerRect.y &&
            heartRect.y < playerRect.y + playerRect.height / 2 &&
            playerRect.x < heartRect.x + heartRect.width &&
            playerRect.x + playerRect.width > heartRect.x
        ) {
            collectSound.play();
            return true;
        }
        return false;
    }

    function increaseFallingSpeed() {
        const baseSpeed = 2;
        const maxSpeed = 10;
        const accelerationFactor = 0.035;
    
        fallingSpeed = baseSpeed + (1 - Math.exp(-accelerationFactor * score)) * (maxSpeed - baseSpeed);
        fallingSpeed = Math.min(fallingSpeed, maxSpeed);
    }
     
//TEST
    // function testIncreaseFallingSpeed() {
    //     console.log("Starting test for increaseFallingSpeed...");
    //     const testScores = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140];
    //     testScores.forEach((testScore) => {
    //         score = testScore;
    //         increaseFallingSpeed();
    //         console.log(`Score: ${score}, Falling Speed: ${fallingSpeed}`);
    //     });
    //     console.log("Test completed.");
    // }

    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    function updatePlayerPosition() {
        if (!isPaused && score >= 0) {
            let playerLeft = parseInt(window.getComputedStyle(player).getPropertyValue('left'));
            if (keys['ArrowLeft'] && playerLeft > 0) {
                player.style.left = `${playerLeft - playerSpeed}px`;
            }
            if (keys['ArrowRight'] && playerLeft < gameArea.offsetWidth - player.offsetWidth) {
                player.style.left = `${playerLeft + playerSpeed}px`;
            }
        }
        animationFrameId = requestAnimationFrame(updatePlayerPosition);
    }

    function showMultiplierAnnouncement(multiplier) {
        updateMultiplierDisplay(multiplier);
        isPaused = true;
        let modal;
        if (multiplier === 2) {
            modal = document.getElementById('multiplier-2x-modal');
        } else if (multiplier === 3) {
            modal = document.getElementById('multiplier-3x-modal');
        } else if(multiplier === 4){
            modal = document.getElementById('multiplier-4x-modal');
        }
        const countdownElement = modal.querySelector('.countdown');
        modal.style.display = 'flex';
        let countdown = 3;
        countdownElement.textContent = countdown;
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            if (countdown === 0) {
                clearInterval(countdownInterval);
                modal.style.display = 'none';
                isPaused = false;
                increaseFallingSpeed();
            }
        }, 1000);
    }

    function updateMultiplierDisplay(multiplier) {
        const multiplierIndicator = document.getElementById('multiplier-indicator');
        multiplierIndicator.textContent = `${multiplier}x`;
    }
    

    function updateScore(newScore) {
        const heartEmoji = "❤️";
        scoreDisplay.textContent = `${heartEmoji} x ${newScore}`;
        scoreDisplay.style.position = "absolute";
        scoreDisplay.style.top = "10px";
        scoreDisplay.style.left = "20px";
        scoreDisplay.style.fontSize = "30px";
        scoreDisplay.style.color = "white";
        scoreDisplay.style.fontFamily = "'Pacifico', cursive";
        scoreDisplay.style.background = "linear-gradient(45deg, #ff9aa2, #ff6f91)";
        scoreDisplay.style.padding = "10px 20px";
        scoreDisplay.style.borderRadius = "12px";
        scoreDisplay.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
        scoreDisplay.style.border = "2px solid #ffffff";
        scoreDisplay.style.textShadow = "2px 2px 5px rgba(0, 0, 0, 0.2)";
    }
    
    

    function togglePause() {
        isPaused = !isPaused;
        if (isPaused) {
            openPauseMenu();
        } else {
            increaseFallingSpeed();
        }
        pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    }

    function openPauseMenu() {
        pauseScore.textContent = score;
        volumeControl.value = volume;
        pauseMenuModal.show();
    }

    function resumeGame() {
        pauseMenuModal.hide();
        isPaused = false;
        pauseBtn.textContent = 'Pause';
    }

    function showGameOverModal() {
        clearInterval(gameInterval);
        cancelAnimationFrame(animationFrameId);
        const hearts = document.querySelectorAll('.falling-heart');
        hearts.forEach(heart => {
            heart.remove();
        });
        finalScore.textContent = score;
        gameOverModal.show();
    }

    function resetGame() {
        const hearts = document.querySelectorAll('.falling-heart');
        hearts.forEach(heart => heart.remove());
        if (heartCreationInterval) {
            clearInterval(heartCreationInterval);
        }
        score = 0;
        updateScore(0);
        fallingSpeed = 2;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        startGame();
    }

    gameArea.addEventListener('touchstart', handleTouchStart);
    gameArea.addEventListener('touchmove', handleTouchMove);
    gameArea.addEventListener('touchend', handleTouchEnd);

    let touchStartX = 0;

    function handleTouchStart(event) {
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        const playerRect = player.getBoundingClientRect();
    
        if (
            touchX >= playerRect.left &&
            touchX <= playerRect.right &&
            touchY >= playerRect.top &&
            touchY <= playerRect.bottom
        ) {
            isTouchingBasket = true;
            touchStartX = touchX;
        }
    }

    function handleTouchMove(event) {
        if (!isPaused && score >= 0 && isTouchingBasket) {
            const touchX = event.touches[0].clientX;
            const deltaX = touchX - touchStartX;
            let playerLeft = parseInt(window.getComputedStyle(player).getPropertyValue('left'));
            let newPlayerLeft = playerLeft + deltaX;
    
            if (newPlayerLeft < 0) {
                newPlayerLeft = 0;
            } else if (newPlayerLeft > gameArea.offsetWidth - player.offsetWidth) {
                newPlayerLeft = gameArea.offsetWidth - player.offsetWidth;
            }
            player.style.left = `${newPlayerLeft}px`;
            touchStartX = touchX;
        }
    }

    function handleTouchEnd() {
        isTouchingBasket = false;
    }

    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    const sensitivitySlider = document.getElementById('sensitivity-slider');
    const sensitivityValue = document.getElementById('sensitivity-value');

    sensitivitySlider.addEventListener('input', () => {
    playerSpeed = parseInt(sensitivitySlider.value);
    sensitivityValue.textContent = playerSpeed;
    });

});
