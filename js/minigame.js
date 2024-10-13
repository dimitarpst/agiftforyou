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

    //LET variables
    let score = 0;
    let isPaused = false;
    let playerSpeed = 7;
    let fallingSpeed = 2;
    let keys = {};
    let volume = 1;
    let animationFrameId;
    let pointsPerHeart = 1;
    let isTouchingBasket = false;
    let heartCreationInterval;
    let clockCreationInterval;
    let shieldActive = false;
    let shieldStacks = 0;
    let timeRemaining = 60;
    let timerInterval;
    let missedHearts = 0;
    let initialMagnetDuration = 6000;
    let remainingMagnetDuration = 0;
    let magnetActive = false;
    let magnetPaused = false;
    let magnetTimeout;
    let magnetInterval;
    let magnetEndTime = 0;

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            const gameArea = document.documentElement;
            if (gameArea.requestFullscreen) {
                gameArea.requestFullscreen();
            } else if (gameArea.mozRequestFullScreen) {
                gameArea.mozRequestFullScreen();
            } else if (gameArea.webkitRequestFullscreen) {
                gameArea.webkitRequestFullscreen();
            } else if (gameArea.msRequestFullscreen) {
                gameArea.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { 
                document.msExitFullscreen();
            }
        }
    });

    // <---------------------------------PAUSE MENU AND BUTTONS-------------------------------------------->
    
    function openPauseMenu() {
        pauseScore.textContent = score;
        volumeControl.value = volume;
        pauseMenuModal.show();
    }
    const gameOverlay = document.getElementById('game-overlay');
    const playGameBtn = document.getElementById('play-game-btn');
    playGameBtn.addEventListener('click', () => {
        gameOverlay.style.display = 'none';
        startGame();
    });
    bottomLine.style.position = 'absolute';
    bottomLine.style.height = '4px';
    bottomLine.style.width = '100%';
    bottomLine.style.backgroundColor = '#ff6f91';
    bottomLine.style.bottom = '20px';
    bottomLine.style.zIndex = '2';
    gameArea.appendChild(bottomLine);
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resumeGameBtn.addEventListener('click', () => {
        pauseMenuModal.hide();
        togglePause();
    });
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
    document.getElementById('play-again-btn-win').addEventListener('click', () => {
        resetGame();
        const winModal = bootstrap.Modal.getInstance(document.getElementById('winModal'));
        winModal.hide();
    });

    document.getElementById('go-back-btn-win').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    const sensitivitySlider = document.getElementById('sensitivity-slider');
    const sensitivityValue = document.getElementById('sensitivity-value');

    sensitivitySlider.addEventListener('input', () => {
        playerSpeed = parseInt(sensitivitySlider.value);
        sensitivityValue.textContent = playerSpeed;
    });

    // <---------------------------------OBJECT HANDLING-------------------------------------------->
    function checkTopCollision(player, fallingObject) {
        let playerRect = player.getBoundingClientRect();
        let fallingObjectRect = fallingObject.getBoundingClientRect();
        if (
            fallingObjectRect.y + fallingObjectRect.height > playerRect.y &&
            fallingObjectRect.y < playerRect.y + playerRect.height / 2 &&
            playerRect.x < fallingObjectRect.x + fallingObjectRect.width &&
            playerRect.x + playerRect.width > fallingObjectRect.x
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

    // <---------------------------------MOVEMENT-------------------------------------------->
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
    // <---------------------------------GAME START/STOP STUFF-------------------------------------------->


    function updateScore(newScore) {
        const heartEmoji = "❤️";
        scoreDisplay.textContent = `${heartEmoji} ${newScore}`;
    }
    function togglePause() {
        isPaused = !isPaused;
        console.log("Paused state:", isPaused);
        
        if (isPaused) {
            console.log("Game paused.");
            clearInterval(timerInterval);
            pauseMagnetEffect();
            openPauseMenu();
        } else {
            console.log("Game resumed.");
            timerInterval = setInterval(() => {
                timeRemaining--;
                updateTimer(timeRemaining);
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    showGameOverModal();
                }
            }, 1000);
    
            resumeMagnetEffect();
        }
    
        pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    }

    function showGameOverModal() {
        clearInterval(timerInterval);
        clearInterval(heartCreationInterval);
        clearInterval(clockCreationInterval);
        clearInterval(shieldCreationInterval);
        cancelAnimationFrame(animationFrameId);
    
        const hearts = document.querySelectorAll('.falling-heart');
        const clocks = document.querySelectorAll('.falling-clock');
        const shields = document.querySelectorAll('.falling-shield');
        
        hearts.forEach(heart => heart.remove());
        clocks.forEach(clock => clock.remove());
        shields.forEach(shield => shield.remove())
    
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
        pauseBtn.textContent = 'Pause';
        shieldStacks = 0;
        updateShieldVisual();
    }

    function startGame() {
        score = 0;
        timeRemaining = 60;
        updateScore(0);
        updateTimer(timeRemaining);
        isPaused = false;
        fallingSpeed = 2;
        if (heartCreationInterval) clearInterval(heartCreationInterval);
        if (clockCreationInterval) clearInterval(clockCreationInterval);
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        heartCreationInterval = setInterval(createFallingHeart, 2000);
        clockCreationInterval = setInterval(() => createFallingClock(), Math.random() * 4000 + 7456);
        shieldCreationInterval = setInterval(() => createFallingShield(), Math.random() * 8000 + 13000);
        magnetCreationInterval = setInterval(createFallingMagnet, Math.random() * 1000 + 4000);
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimer(timeRemaining);
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                showGameOverModal();
            }
        }, 1000);
        requestAnimationFrame(updatePlayerPosition);
    }

    function updateTimer(time) {
        const timerDisplay = document.getElementById('timer');
        timerDisplay.textContent = `🕒 ${time}`;
    }

    // <---------------------------------HEART-------------------------------------------->
    function createFallingHeart() {
        if (isPaused || score < 0) return;
    
        const heart = document.createElement('div');
        heart.classList.add('falling-heart');
        heart.style.left = `${Math.random() * (gameArea.offsetWidth - 50)}px`;
        gameArea.appendChild(heart);
    
        let heartFall = setInterval(() => {
            if (isPaused) return;
    
            let heartTop = parseInt(window.getComputedStyle(heart).getPropertyValue('top'));
            if (heartTop > gameArea.offsetHeight - 40) {
                heart.remove();
                clearInterval(heartFall);
                notCollectSound.play();
                missedHearts++;
                if (!shieldActive || shieldStacks === 0) {
                    score -= 3;
                } else {
                    if (missedHearts % 1 === 0 && shieldStacks > 0) {
                        shieldStacks--;
                        updateShieldVisual();
                    }
                }
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
            }
        }, 20);
    }
    // <---------------------------------CLOCK-------------------------------------------->
    function createFallingClock() {
        if (isPaused || timeRemaining <= 0) return;
    
        const clock = document.createElement('div');
        clock.classList.add('falling-clock');
        clock.innerHTML = '🕒';
        clock.style.left = `${Math.random() * (gameArea.offsetWidth - 50)}px`;
        gameArea.appendChild(clock);
    
        let clockFall = setInterval(() => {
            if (isPaused) return;
    
            let clockTop = parseInt(window.getComputedStyle(clock).getPropertyValue('top'));
            if (clockTop > gameArea.offsetHeight - 40) {
                clock.remove();
                clearInterval(clockFall);
            } else {
                clock.style.top = `${clockTop + fallingSpeed}px`;
            }
    
            if (checkTopCollision(player, clock)) {
                timeRemaining += 5;
                clock.remove();
                clearInterval(clockFall);
            }
        }, 20);
    }
    // <---------------------------------SHIELD-------------------------------------------->
    function createFallingShield() {
        if (isPaused || timeRemaining <= 0 || shieldStacks >= 3) return; // Only create shield if stacks are less than 3
        
        const shield = document.createElement('div');
        shield.classList.add('falling-shield');
        shield.innerHTML = '🛡️';
        shield.style.left = `${Math.random() * (gameArea.offsetWidth - 50)}px`;
        gameArea.appendChild(shield);
    
        let shieldFall = setInterval(() => {
            if (isPaused) return;
    
            let shieldTop = parseInt(window.getComputedStyle(shield).getPropertyValue('top'));
            if (shieldTop > gameArea.offsetHeight - 40) {
                shield.remove();
                clearInterval(shieldFall);
            } else {
                shield.style.top = `${shieldTop + fallingSpeed}px`;
            }
    
            if (checkTopCollision(player, shield)) {
                activateShieldPower();
                shield.remove();
                clearInterval(shieldFall);
            }
        }, 20);
    }

    function activateShieldPower() {
        const playerElement = document.getElementById('player');
        if (shieldStacks < 3) {
            shieldStacks++;
            updateShieldVisual();
        }
        shieldActive = true;
    }

    function updateShieldVisual() {
        const shieldOverlay = document.getElementById('shield-overlay');
        if (!shieldOverlay) {
            console.error('Shield overlay element not found!');
            return;
        }
        if (shieldStacks === 1) {
            shieldOverlay.src = './pictures/shield1.png';
            shieldOverlay.style.display = 'block';
        } else if (shieldStacks === 2) {
            shieldOverlay.src = './pictures/shield2.png';
            shieldOverlay.style.display = 'block';
        } else if (shieldStacks === 3) {
            shieldOverlay.src = './pictures/shield3.png';
            shieldOverlay.style.display = 'block';
        } else {
            shieldOverlay.style.display = 'none';
        }
    }
    // <---------------------------------MAGNET-------------------------------------------->

    const magnetRange = 400; // Adjust the range as needed

    function createFallingMagnet() {
        if (isPaused || timeRemaining <= 0) return;
    
        const magnet = document.createElement('div');
        magnet.classList.add('falling-magnet');
        magnet.innerHTML = '🧲';
        magnet.style.left = `${Math.random() * (gameArea.offsetWidth - 50)}px`;
        gameArea.appendChild(magnet);
    
        let magnetFall = setInterval(() => {
            if (isPaused) return;
    
            let magnetTop = parseInt(window.getComputedStyle(magnet).getPropertyValue('top'));
            if (magnetTop > gameArea.offsetHeight - 40) {
                magnet.remove();
                clearInterval(magnetFall);
            } else {
                magnet.style.top = `${magnetTop + fallingSpeed}px`;
            }
    
            if (checkTopCollision(player, magnet)) {
                activateMagnetEffect();
                magnet.remove();
                clearInterval(magnetFall);
            }
        }, 20);
    }

    function activateMagnetEffect() {
        if (magnetActive) {
            // If magnet is already active, add 6000 ms to the remaining time
            remainingMagnetDuration += 6000;
            magnetEndTime = Date.now() + remainingMagnetDuration;
            console.log(`Magnet effect extended. New time left: ${Math.ceil(remainingMagnetDuration / 1000)}s`);
            return;
        }
    
        console.log("Magnet effect activated!");
        magnetActive = true;
        remainingMagnetDuration = initialMagnetDuration;
        magnetEndTime = Date.now() + remainingMagnetDuration;
    
        // Log remaining time every second
        magnetInterval = setInterval(() => {
            if (isPaused) return;
    
            let now = Date.now();
            let remainingTime = magnetEndTime - now;
            remainingMagnetDuration = remainingTime;
    
            if (remainingTime <= 0) {
                clearInterval(magnetInterval);
                magnetActive = false;
                console.log("Magnet effect ended.");
            } else {
                console.log(`Magnet active, time left: ${Math.ceil(remainingTime / 1000)}s`);
            }
        }, 20);
    }

    function pauseMagnetEffect() {
        if (magnetActive) {
            magnetPaused = true;
            remainingMagnetDuration = magnetEndTime - Date.now();
            clearTimeout(magnetTimeout);
            clearInterval(magnetInterval);
            magnetActive = false;
            console.log("Magnet effect paused. Remaining duration: " + Math.ceil(remainingMagnetDuration / 1000) + "s");
        }    
    }
    
    function resumeMagnetEffect() {
        if (magnetPaused && remainingMagnetDuration > 0) {
            console.log("Resuming magnet effect. Remaining duration: " + Math.ceil(remainingMagnetDuration / 1000) + "s");
            magnetPaused = false;
            magnetActive = true;
            magnetEndTime = Date.now() + remainingMagnetDuration;
    
            magnetInterval = setInterval(() => {
                if (isPaused) return;
    
                let now = Date.now();
                let remainingTime = magnetEndTime - now;
                remainingMagnetDuration = remainingTime;
    
                if (remainingTime <= 0) {
                    clearInterval(magnetInterval);
                    magnetActive = false;
                    console.log("Magnet effect ended.");
                } else {
                    console.log(`Magnet active, time left: ${Math.ceil(remainingTime / 1000)}s`);
                }
            }, 20);
    
            magnetTimeout = setTimeout(() => {
                clearInterval(magnetInterval);
                magnetActive = false;
                console.log("Magnet effect ended.");
            }, remainingMagnetDuration);
        }
    }
    
});