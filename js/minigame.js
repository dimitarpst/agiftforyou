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
    let magnetCreationInterval;
    let magnetEffectInterval;
    let magnetTimeout;
    let magnetActive = false;
    let shieldActive = false;
    let shieldStacks = 0;
    let timeRemaining = 60;
    let timerInterval;
    let missedHearts = 0;



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
                } else if (magnetActive) {
                    return;
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

    function updateScore(newScore) {
        const heartEmoji = "❤️";
        scoreDisplay.textContent = `${heartEmoji} ${newScore}`;
    }
    
    function togglePause() {
        isPaused = !isPaused;
        if (isPaused) {
            clearInterval(timerInterval);
            clearInterval(magnetEffectInterval);
            clearTimeout(magnetTimeout);
            openPauseMenu();
        } else {
            timerInterval = setInterval(() => {
                timeRemaining--;
                updateTimer(timeRemaining);
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    showGameOverModal();
                }
            }, 1000);
            increaseFallingSpeed();
            if (magnetActive) {
                activateMagnetPower(magnetDuration);
            }
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
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimer(timeRemaining);
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                showGameOverModal();
            }
        }, 1000);
    }
    
    function showGameOverModal() {
        clearInterval(timerInterval);
        clearInterval(heartCreationInterval);
        clearInterval(clockCreationInterval);
        clearInterval(magnetCreationInterval);
        clearInterval(magnetEffectInterval);
        clearTimeout(magnetTimeout);
        cancelAnimationFrame(animationFrameId);
    
        const hearts = document.querySelectorAll('.falling-heart');
        const clocks = document.querySelectorAll('.falling-clock');
        const magnets = document.querySelectorAll('.falling-magnet');
        const shields = document.querySelectorAll('.falling-shield');
        
        hearts.forEach(heart => heart.remove());
        clocks.forEach(clock => clock.remove());
        magnets.forEach(magnet => magnet.remove());
        shields.forEach(shield => shield.remove())
    
        const magnetRangeElement = document.getElementById('magnet-range');
        magnetRangeElement.style.display = 'none';
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
        magnetCreationInterval = setInterval(() => createFallingMagnet(), Math.random() * 10000 + 15000);
        shieldCreationInterval = setInterval(() => createFallingShield(), Math.random() * 8000 + 13000);
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
                activateMagnetPower();
                magnet.remove();
                clearInterval(magnetFall);
            }
        }, 20);
    }

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

    function activateMagnetPower(remainingDuration = 5000) {
        const magnetRangeElement = document.getElementById('magnet-range');
        const magnetRange = 200;
        
            magnetActive = true;
            magnetRangeElement.style.display = 'block';
            magnetRangeElement.classList.add('fade-in');
            magnetRangeElement.style.width = `${magnetRange * 2}px`;
            magnetRangeElement.style.height = `${magnetRange * 2}px`;

            function updateMagnetRangePosition() {
                const playerRect = player.getBoundingClientRect();
                magnetRangeElement.style.left = `${playerRect.left + playerRect.width / 2 - magnetRange}px`;
                magnetRangeElement.style.top = `${playerRect.top + playerRect.height / 2 - magnetRange}px`;
            }

            document.querySelectorAll('.in-magnet-range').forEach(obj => {
                obj.classList.remove('in-magnet-range');
            });

            magnetEffectInterval = setInterval(() => {
                updateMagnetRangePosition();
                        const objects = [
            ...document.querySelectorAll('.falling-heart'),
            ...document.querySelectorAll('.falling-clock'),
            ...document.querySelectorAll('.falling-shield')
        ];
        objects.forEach(obj => {
            let objRect = obj.getBoundingClientRect();
            let playerRect = player.getBoundingClientRect();
    
            let distanceX = objRect.x - playerRect.x;
            let distanceY = objRect.y - playerRect.y;
            let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
            if (distance < magnetRange || obj.classList.contains('in-magnet-range')) {
                obj.classList.add('in-magnet-range');
                obj.style.left = `${objRect.left - distanceX * 0.1}px`;
                obj.style.top = `${objRect.top - distanceY * 0.1}px`;
            }
        });
    }, 20);
    
        magnetTimeout = setTimeout(() => {
            clearInterval(magnetEffectInterval);
            magnetRangeElement.classList.remove('fade-in');
            magnetRangeElement.classList.add('fade-out');
            setTimeout(() => {
                magnetRangeElement.classList.remove('fade-out');
                magnetRangeElement.style.display = 'none';
                magnetActive = false;
            }, 500);
        }, remainingDuration);
    
        displayMagnetTimer(remainingDuration / 1000);
    }
    
    
    function displayMagnetTimer(duration) {
        const magnetTimer = document.getElementById('magnet-timer');
        const magnetCountdown = document.getElementById('magnet-countdown');
        magnetTimer.style.display = 'block';

        let timeLeft = duration;
        magnetCountdown.textContent = timeLeft;
    
        let timerInterval = setInterval(() => {
            if (!isPaused) {
                timeLeft--;
                magnetCountdown.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    magnetTimer.style.display = 'none';
                }
            }
        }, 1000);
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
    
    
});