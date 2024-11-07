document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('player');
    const gameArea = document.getElementById('game-area');
    const bottomLine = document.createElement('div');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const gameOverModal = new bootstrap.Modal(document.getElementById('gameOverModal'), {
        backdrop: 'static',
        keyboard: false
    });
    const inventoryBtn = document.getElementById('inventory-btn');
    const inventoryModal = new bootstrap.Modal(document.getElementById('inventoryModal'));
    const pauseMenuModal = new bootstrap.Modal(document.getElementById('pauseMenuModal'));
    const playAgainBtn = document.getElementById('play-again-btn');
    const goBackBtn = document.getElementById('go-back-btn');
    const finalScore = document.getElementById('final-score');
    const pauseScore = document.getElementById('pause-score');
    const volumeControl = document.getElementById('volume-control');
    const restartGameBtn = document.getElementById('restart-game-btn');
    const exitGameBtn = document.getElementById('exit-game-btn');
    const magnetRangeElement = document.getElementById('magnet-range');
    const mysteryBox = document.getElementById('mystery-box');
    const tapText = document.getElementById('tap-text');

    //LET variables
    let starCount = 10;
    let score = 0;
    let isPaused = false;
    let playerSpeed = 7;
    let fallingSpeed = 2;
    let keys = {};
    let volume = 1;
    let animationFrameId;
    let pointsPerHeart = 1;
    let heartsCollected = 0;
    let shieldActive = false;
    let shieldStacks = 0;
    let timeRemaining = 20;
    let timerInterval;
    let missedHearts = 0;
    let initialMagnetDuration = 8000;
    let remainingMagnetDuration = 0;
    let magnetActive = false;
    let magnetPaused = false;
    let magnetTimeout;
    let magnetInterval;
    let magnetEndTime = 0;
    let spikePaused = false;
    let spikeStartTime;
    let spikeRemainingTime = 3000;
    let cloudTimeout;
    let cloudRemainingTime = 0;
    let cloudStartTime;
    let cloudPaused = false;
    let spikeFall;
    let currentPowerUp = null;
    let shieldCreationInterval, 
    magnetCreationInterval, 
    heartCreationInterval, 
    clockCreationInterval, 
    spikeCreationInterval, 
    starCreationInterval;
    let nextDoublePointsThreshold = 10;
    let doubleHeartBoostQueued = false; 
    let tripleHeartBoostQueued = false; 
    let doubleHeartBoostActive = false;
    let tripleHeartBoostActive = false;
    let doubleHeartBoostRemaining = 0;
    let tripleHeartBoostRemaining = 0;


    // <---------------------------------Orientation check-------------------------------------------->

    function checkOrientation() {
        if (window.matchMedia("(orientation: portrait)").matches) {
            document.getElementById('rotate-overlay').style.display = 'flex';
        } else {
            document.getElementById('rotate-overlay').style.display = 'none';
        }
    }
    checkOrientation();

    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation); 

    // <---------------------------------PAUSE MENU AND BUTTONS-------------------------------------------->

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
    function openPauseMenu() {
        pauseScore.textContent = score;
        volumeControl.value = volume;
        pauseMenuModal.show();
    }
    const gameOverlay = document.getElementById('game-overlay');
    const playGameBtn = document.getElementById('play-game-btn');
    playGameBtn.addEventListener('click', () => {
        gameOverlay.style.display = 'none';
        
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
        }
    
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
    pauseBtn.addEventListener('click', () => togglePause('pause'));
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

    const audioElements = [
        document.getElementById('clockCollect'),
        document.getElementById('clockCollectMagnet'),
        document.getElementById('heartCollect'),
        document.getElementById('heartCollectMagnet'),
        document.getElementById('heartMiss'),
        document.getElementById('magnetCollect'),
        document.getElementById('shieldBreak'),
        document.getElementById('shieldUpgrade'),
        document.getElementById('swordAttack')
    ];

    volumeControl.addEventListener('input', (e) => {
        volume = e.target.value;
        audioElements.forEach(audio => {
            audio.volume = volume;
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            togglePause();
            if (isPaused) {
                openPauseMenu();
            }
        }
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
            if (fallingObject.classList.contains('falling-spikes')) {
                return true;
            }
            return true;
        }
        return false;
    }

    function increaseFallingSpeed() {
        const baseSpeed = 2;
        const maxSpeed = 10;
        const accelerationFactor = 0.020;
    
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

    let activeTouches = {}; 
    let touchOffsetX = 0;

    gameArea.addEventListener('touchstart', (event) => {
        Array.from(event.touches).forEach((touch) => {
            const playerRect = player.getBoundingClientRect();
            if (
                touch.clientX >= playerRect.left &&
                touch.clientX <= playerRect.right &&
                touch.clientY >= playerRect.top &&
                touch.clientY <= playerRect.bottom
            ) {
                activeTouches[touch.identifier] = 'move';
                touchOffsetX = touch.clientX - playerRect.left;
            }
            const pauseButtonRect = pauseBtn.getBoundingClientRect();
            if (
                touch.clientX >= pauseButtonRect.left &&
                touch.clientX <= pauseButtonRect.right &&
                touch.clientY >= pauseButtonRect.top &&
                touch.clientY <= pauseButtonRect.bottom
            ) {
                activeTouches[touch.identifier] = 'pause';
                togglePause(); 
                activeTouches = Object.fromEntries(
                    Object.entries(activeTouches).filter(([id, type]) => type !== 'move')
                );
            }
        });
    });
    
    gameArea.addEventListener('touchmove', (event) => {
        Array.from(event.touches).forEach((touch) => {
            if (activeTouches[touch.identifier] === 'move' && !isPaused) {
                let newPlayerLeft = touch.clientX - touchOffsetX;
    
                newPlayerLeft = Math.max(0, Math.min(newPlayerLeft, gameArea.offsetWidth - player.offsetWidth));
                player.style.left = `${newPlayerLeft}px`;
            }
        });
    });

    gameArea.addEventListener('touchend', (event) => {
        Array.from(event.changedTouches).forEach((touch) => {
            delete activeTouches[touch.identifier];
        });
    });
    

    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // <---------------------------------GAME START/STOP STUFF-------------------------------------------->

    function startCountdownAndResume() {
        const countdownOverlay = document.getElementById('countdown-overlay');
        const countdownNumber = document.getElementById('countdown-number');
        let countdown = 3;
    
        countdownOverlay.style.display = 'flex';
        countdownNumber.textContent = countdown;
    
        const countdownInterval = setInterval(() => {
            countdown -= 1;
    
            if (countdown > 0) {
                countdownNumber.textContent = countdown;
            } else {
                clearInterval(countdownInterval);
                countdownOverlay.style.display = 'none';
                setTimeout(() => {
                    resumeGame();  
                }, 200);  
            }
        }, 1000); 
    }

    function updateScore(newScore) {
        const heartEmoji = "❤️";
        scoreDisplay.textContent = `${heartEmoji} ${newScore}`;
    }

    function togglePause(source = 'pause') { 
        isPaused = !isPaused;
    
        if (isPaused) {
            clearInterval(timerInterval);
            pauseMagnetEffect();
            pauseCloudOverlay();
    
            if (source === 'pause') {
                openPauseMenu();  
            }
        }
    }

    function resumeGame() {
        isPaused = false;

        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimer(timeRemaining);
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                showGameOverModal();
            }
        }, 1000);
        resumeMagnetEffect();
        resumeCloudOverlay();
    }

    document.getElementById('pauseMenuModal').addEventListener('hidden.bs.modal', () => {
        if (isPaused) {
            startCountdownAndResume(); 
        }
    });

    document.getElementById('view-all-scores-btn').addEventListener('click', () => {
        displayBestScores();
        const allScoresModal = new bootstrap.Modal(document.getElementById('allScoresModal'));
        allScoresModal.show();
    });

    document.getElementById('view-all-scores-btn-pause').addEventListener('click', () => {
        displayBestScores();
        const allScoresModal = new bootstrap.Modal(document.getElementById('allScoresModal'));
        allScoresModal.show();
    });

    function showGameOverModal() {
        clearTimeout(cloudTimeout);
        clearInterval(timerInterval);
        clearInterval(heartCreationInterval);
        clearInterval(clockCreationInterval);
        clearInterval(shieldCreationInterval);
        clearInterval(magnetCreationInterval);
        clearInterval(spikeCreationInterval);
        clearInterval(starCreationInterval);
        if (spikeFall) clearInterval(spikeFall); 
        cancelAnimationFrame(animationFrameId);
        endGame();
        document.querySelectorAll('.falling-heart, .falling-clock, .falling-shield, .falling-magnet, .falling-spikes').forEach(item => item.remove());
    
        finalScore.textContent = score;
        gameOverModal.show();
    }

    function resetGame() {
        clearInterval(timerInterval);
        clearInterval(heartCreationInterval);
        clearInterval(clockCreationInterval);
        clearInterval(shieldCreationInterval);
        clearInterval(magnetCreationInterval);
        clearInterval(spikeCreationInterval);
        clearInterval(starCreationInterval);
        if (spikeFall) clearInterval(spikeFall);
    
        document.querySelectorAll('.falling-heart').forEach(heart => heart.remove());
        document.querySelectorAll('.falling-clock').forEach(clock => clock.remove());
        document.querySelectorAll('.falling-shield').forEach(shield => shield.remove());
        document.querySelectorAll('.falling-magnet').forEach(magnet => magnet.remove());
        document.querySelectorAll('.falling-spikes').forEach(spike => spike.remove());
        document.querySelectorAll('.pulsating-arrow').forEach(arrow => arrow.remove());
        document.querySelectorAll('.falling-star').forEach(arrow => arrow.remove());
    
        score = 0;
        updateScore(score);
        timeRemaining = 20;
        updateTimer(timeRemaining);
        heartsCollected = 0;
        doublePointsActive = false;
        doublePointsRemaining = 0;
        shieldStacks = 0;
        shieldActive = false;
        updateShieldVisual();
        
        magnetActive = false;
        magnetPaused = false;
        remainingMagnetDuration = 0;
        document.getElementById('magnet-timer').style.display = 'none';
        magnetRangeElement.style.display = 'none';
    
        spikePaused = false;
        spikeRemainingTime = 3000;
    
        fallingSpeed = 2;
    
        if (doubleHeartBoostActive) deactivateDoubleHeartBoost();
        if (tripleHeartBoostActive) deactivateTripleHeartBoost();

        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        pauseBtn.textContent = 'Pause';
    
        startGame();
    }  

    function startGame() {
        score = 0;
        timeRemaining = 10;
        updateScore(0);
        updateTimer(timeRemaining);
        isPaused = false;
        fallingSpeed = 2;
        if (heartCreationInterval) clearInterval(heartCreationInterval);
        if (clockCreationInterval) clearInterval(clockCreationInterval);
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        inventoryBtn.style.display = 'inline-block';
        scoreDisplay.style.display = 'inline-block';
        timerDisplay.style.display = 'inline-block';
        heartCreationInterval = setInterval(createFallingHeart, 2000);
        clockCreationInterval = setInterval(() => createFallingClock(), Math.random() * 4000 + 7456);
        shieldCreationInterval = setInterval(() => createFallingShield(), Math.random() * 8000 + 13000);
        magnetCreationInterval = setInterval(createFallingMagnet, Math.random() * 1000 + 15000);
        spikeCreationInterval = setInterval(() => createFallingSpikes(), Math.random() * 20000 + 23000);
        starCreationInterval = setInterval(createFallingStar, 6000);

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
        timerDisplay.textContent = `🕒 ${time}s`;
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
                document.getElementById('heartMiss').play();
                heart.remove();
                clearInterval(heartFall);
                missedHearts++;
                if (doubleHeartBoostActive) deactivateDoubleHeartBoost();
                if (tripleHeartBoostActive) deactivateTripleHeartBoost();
                if (!shieldActive || shieldStacks === 0) {
                    showFloatingText('-3 ❤️', player.offsetLeft, player.offsetTop, 'red');
                    score -= 3;
                } else if (shieldStacks > 0) {
                    document.getElementById('shieldBreak').play();
                    showFloatingText('-1 🛡️', player.offsetLeft, player.offsetTop, 'red');
                    shieldStacks--;
                    updateShieldVisual();
                }
                updateScore(score);
                if (score < 0) showGameOverModal();
            } else {
                heart.style.top = `${heartTop + fallingSpeed}px`;
            }
    
            if (checkTopCollision(player, heart)) {
                const collectSound = magnetActive ? 'heartCollectMagnet' : 'heartCollect';
                document.getElementById(collectSound).play();
    
                let pointsToAdd = pointsPerHeart;
    
                if (tripleHeartBoostActive) {
                    showFloatingText('+3 ❤️', player.offsetLeft, player.offsetTop, 'green');
                    pointsToAdd = 3;
                    tripleHeartBoostRemaining--;
                    if (tripleHeartBoostRemaining <= 0) deactivateTripleHeartBoost();
                } else if (doubleHeartBoostActive) {
                    showFloatingText('+2 ❤️', player.offsetLeft, player.offsetTop, 'green');
                    pointsToAdd = 2;
                    doubleHeartBoostRemaining--;
                    if (doubleHeartBoostRemaining <= 0) deactivateDoubleHeartBoost();
                } else {
                    showFloatingText('+1 ❤️', player.offsetLeft, player.offsetTop, 'green');
                }
    
                score += pointsToAdd;
                heartsCollected++;
                updateScore(score);
    
                if (!doubleHeartBoostActive && !tripleHeartBoostActive && heartsCollected >= nextDoublePointsThreshold) {
                    activateDoubleHeartBoost();
                    nextDoublePointsThreshold += Math.min(15 + Math.floor(score / 100), 25);
                }
    
                heart.remove();
                clearInterval(heartFall);
                increaseFallingSpeed(); 
            }
        }, 20);
    }

    function activateDoubleHeartBoost() {
        if (tripleHeartBoostActive) return;
        doubleHeartBoostActive = true;
        doubleHeartBoostRemaining = 5;
        document.getElementById('score').classList.add('fire-burn');
        showFloatingText("2X ❤️", player.offsetLeft, player.offsetTop, 'yellow');
    }
    
    function deactivateDoubleHeartBoost() {
        doubleHeartBoostActive = false;
        document.getElementById('score').classList.remove('fire-burn');
        if (tripleHeartBoostQueued) {
            activateTripleHeartBoost();
            tripleHeartBoostQueued = false;
        }
    }
    
    function activateTripleHeartBoost() {
        if (doubleHeartBoostActive) {
            tripleHeartBoostQueued = true;
            return;
        }
        tripleHeartBoostActive = true;
        tripleHeartBoostRemaining = 5;
        pointsPerHeart = 3;
        document.getElementById('fire-gif').style.display = 'block';
        showFloatingText("3X ❤️", player.offsetLeft, player.offsetTop, 'yellow');
    }
    
    function deactivateTripleHeartBoost() {
        tripleHeartBoostActive = false;
        pointsPerHeart = 1;
        document.getElementById('fire-gif').style.display = 'none';
        if (doubleHeartBoostQueued) {
            activateDoubleHeartBoost();
            doubleHeartBoostQueued = false;
        }
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
                if (magnetActive) {
                    document.getElementById('clockCollectMagnet').play();
                } else {
                    document.getElementById('clockCollect').play();
                }
                showFloatingText('+6s 🕒', player.offsetLeft, player.offsetTop, 'white');
                timeRemaining += 6;
                clock.remove();
                clearInterval(clockFall);
            }
        }, 20);
    }
    function activateClockBoost() {
        timeRemaining += 20;
        showFloatingText('+20s 🕒', player.offsetLeft, player.offsetTop, 'yellow');
        document.getElementById('timer').textContent = `🕒 ${timeRemaining}s`;
    }
    
    
    // <---------------------------------SHIELD-------------------------------------------->

    function createFallingShield() {
        if (isPaused || timeRemaining <= 0 || shieldStacks >= 3) return;
        
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
                document.getElementById('swordAttack').play();
                activateShieldPower();
                shield.remove();
                clearInterval(shieldFall);
            }
        }, 20);
    }
    function activateShieldPower() {
        const playerElement = document.getElementById('player');
        if (shieldStacks < 3) {
            document.getElementById('shieldUpgrade').play();
            showFloatingText('+1 🛡️', player.offsetLeft, player.offsetTop, 'white');
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
        if (doubleHeartBoostActive) deactivateDoubleHeartBoost();
        if (tripleHeartBoostActive) deactivateTripleHeartBoost();
    }
    
    // <---------------------------------MAGNET-------------------------------------------->

    let magnetRangeRadius = 250;

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
                document.getElementById('magnetCollect').play();
                activateMagnetEffect();
                magnet.remove();
                clearInterval(magnetFall);
            }
        }, 20);
    }

    function activateMagnetEffect() {
        if (magnetActive) {
            showFloatingText('+8s 🧲', player.offsetLeft, player.offsetTop, 'white');
            remainingMagnetDuration += 6000;
            magnetEndTime = Date.now() + remainingMagnetDuration;
            // console.log(`Magnet effect extended. New time left: ${Math.ceil(remainingMagnetDuration / 1000)}s`);
            return;
        }
        showFloatingText('+8s 🧲', player.offsetLeft, player.offsetTop, 'white');
        // console.log("Magnet effect activated!");
        magnetActive = true;
        remainingMagnetDuration = initialMagnetDuration;
        magnetEndTime = Date.now() + remainingMagnetDuration;
    
        magnetRangeElement.style.display = 'block';
        magnetRangeElement.classList.add('fade-in');
        magnetRangeElement.classList.remove('fade-out');

    
        startMagnetInterval()
    }

    function updateMagnetRangePosition() {
        const playerRect = player.getBoundingClientRect();
        magnetRangeElement.style.width = `${magnetRangeRadius * 2}px`;
        magnetRangeElement.style.height = `${magnetRangeRadius * 2}px`;
        magnetRangeElement.style.left = `${playerRect.left + playerRect.width / 2 - magnetRangeRadius}px`;
        magnetRangeElement.style.top = `${playerRect.top + playerRect.height / 2 - magnetRangeRadius}px`;
    }

    function pauseMagnetEffect() {
        if (magnetActive) {
            magnetPaused = true;
            remainingMagnetDuration = magnetEndTime - Date.now();
            clearTimeout(magnetTimeout);
            clearInterval(magnetInterval);
            magnetActive = false;
            // console.log("Magnet effect paused. Remaining duration: " + Math.ceil(remainingMagnetDuration / 1000) + "s");
            magnetRangeElement.classList.add('fade-out');
            setTimeout(() => {
                magnetRangeElement.style.display = 'none';
            }, 500);

        }    
    }

    function startMagnetInterval(){
        magnetInterval = setInterval(() => {
            if (isPaused) return;

            updateMagnetRangePosition();
            const objects = [
                ...document.querySelectorAll(".falling-heart"),
                ...document.querySelectorAll(".falling-magnet"),
                ...document.querySelectorAll(".falling-clock"),
                ...document.querySelectorAll(".falling-shield"),
                ...document.querySelectorAll(".falling-star"),
            ];
            objects.forEach((obj) => {
                const objRect = obj.getBoundingClientRect();
                const playerRect = player.getBoundingClientRect();
              
                const distX = objRect.left - playerRect.left;
                const distY = objRect.top - playerRect.top;
                const distance = Math.sqrt(distX * distX + distY * distY);
              
                if (distance < magnetRangeRadius) {
                    const pullStrength = 0.1;
                    obj.style.left = `${obj.offsetLeft - distX * pullStrength}px`;
                    obj.style.top = `${obj.offsetTop - distY * pullStrength}px`;
                }
            });
            let now = Date.now();
            let remainingTime = magnetEndTime - now;
            remainingMagnetDuration = remainingTime;

            if (remainingTime <= 0) {
                clearInterval(magnetInterval);
                magnetActive = false;
                // console.log("Magnet effect ended.");
                document.getElementById('magnet-timer').style.display = 'none';
                document.getElementById('magnet-timer').textContent = '';
                magnetRangeElement.classList.add('fade-out');
                setTimeout(() => {
                    magnetRangeElement.style.display = 'none';
                }, 500);
            } else {
                document.getElementById('magnet-timer').style.display = 'block';
                document.getElementById('magnet-timer').textContent = `🧲 ${Math.ceil(remainingTime / 1000)}s`;
            }
        }, 10);
    }
    
    function resumeMagnetEffect() {
        if (magnetPaused && remainingMagnetDuration > 0) {
            // console.log("Resuming magnet effect. Remaining duration: " + Math.ceil(remainingMagnetDuration / 1000) + "s");
            magnetPaused = false;
            magnetActive = true;
            magnetEndTime = Date.now() + remainingMagnetDuration;
            magnetRangeElement.style.display = 'block';
            magnetRangeElement.classList.add('fade-in');
            magnetRangeElement.classList.remove('fade-out');
            startMagnetInterval()

        }
    }
    // <---------------------------------SPIKES-------------------------------------------->

    function createFallingSpikes() {
        if (isPaused || timeRemaining <= 0) return;
    
        const spike = document.createElement('div');
        spike.classList.add('falling-spikes');
        spike.innerHTML = '🗡️';
    
        const arrow = document.createElement('div');
        arrow.classList.add('pulsating-arrow');
        arrow.innerHTML = '🔺';
    
        gameArea.appendChild(spike);
        gameArea.appendChild(arrow);
    
        spike.style.left = `${player.offsetLeft}px`;
        spike.style.top = `-120px`;
        arrow.style.left = `${player.offsetLeft}px`;
        arrow.style.top = `0px`;
    
        let followPlayerInterval = setInterval(() => {
            if (isPaused) return;
            spike.style.left = `${player.offsetLeft}px`;
            arrow.style.left = `${player.offsetLeft}px`;
        }, 20);
    
        function startSpikeTimer() {
            spikeStartTime = Date.now();
            spikeTimeout = setTimeout(() => {
                clearInterval(followPlayerInterval);
                arrow.remove();
        
                spikeFall = setInterval(() => {
                    if (isPaused) return;
        
                    let spikeTop = parseInt(window.getComputedStyle(spike).getPropertyValue('top'));
                    if (spikeTop > gameArea.offsetHeight - 40) {
                        spike.remove();
                        clearInterval(spikeFall);
                    } else {
                        spike.style.top = `${spikeTop + fallingSpeed * 1.6}px`;
                    }
        
                    if (checkTopCollision(player, spike)) {
                        let damage = 5;
                    
                        if (shieldActive && shieldStacks > 0) {
                            if (shieldStacks >= damage) {
                                document.getElementById('swordAttack').play();
                                document.getElementById('shieldBreak').play();
                                showFloatingText(`-${damage} 🛡️`, player.offsetLeft, player.offsetTop, 'blue');
                                shieldStacks -= damage;
                                damage = 0;
                            } else {
                                document.getElementById('swordAttack').play();
                                document.getElementById('shieldBreak').play();
                                showFloatingText(`-${shieldStacks} 🛡️`, player.offsetLeft, player.offsetTop, 'blue');
                                damage -= shieldStacks;
                                shieldStacks = 0;
                            }
                            updateShieldVisual();
                        }
                    
                        if (damage > 0) {
                            document.getElementById('swordAttack').play();
                            showFloatingText(`-${damage} 🗡️`, player.offsetLeft, player.offsetTop, 'red');
                            score -= damage;
                            updateScore(score);

                            showCloudOverlay(5000);
                    
                            if (score < 0) {
                                clearInterval(spikeFall);
                                showGameOverModal();
                            }
                        }
                    
                        spike.remove();
                        clearInterval(spikeFall);
                    }
                    
                }, 20);
            }, spikeRemainingTime);
        }
        
    
        startSpikeTimer();
    
        function pauseSpikeTimer() {
            clearTimeout(spikeTimeout);
            spikePaused = true;
            spikeRemainingTime -= Date.now() - spikeStartTime;
            arrow.classList.add('paused');
        }
        
        function resumeSpikeTimer() {
            if (spikePaused) {
                spikePaused = false;
                arrow.classList.remove('paused');
                startSpikeTimer();
            }
        }
        
    
        document.addEventListener('pauseGame', pauseSpikeTimer);
        document.addEventListener('resumeGame', resumeSpikeTimer);
    }

    // <---------------------------------Clouds-------------------------------------------->
    
    function showCloudOverlay(duration = 3000) {
        const cloudOverlay = document.getElementById('cloud-overlay');
        cloudOverlay.style.display = 'block';
    
        cloudStartTime = Date.now();
        cloudRemainingTime = duration;
    
        cloudTimeout = setTimeout(() => {
            cloudOverlay.style.display = 'none';
        }, cloudRemainingTime);
    }
    
    function pauseCloudOverlay() {
        if (cloudTimeout) {
            clearTimeout(cloudTimeout);
            cloudPaused = true;
            cloudRemainingTime -= Date.now() - cloudStartTime;
        }
    }
    
    function resumeCloudOverlay() {
        if (cloudPaused) {
            cloudPaused = false;
            cloudStartTime = Date.now();
            cloudTimeout = setTimeout(() => {
                const cloudOverlay = document.getElementById('cloud-overlay');
                cloudOverlay.style.display = 'none';
            }, cloudRemainingTime);
        }
    }

    // <---------------------------------PARTICLES-------------------------------------------->

    function showFloatingText(text, x, y, color = 'white') {
        const indicator = document.createElement('div');
        indicator.textContent = text;
        indicator.classList.add('floating-text');
        indicator.style.color = color;
    
        const playerRect = player.getBoundingClientRect();
        const gameAreaWidth = gameArea.offsetWidth;
        const textWidth = 100;
    
        let randomXOffset = playerRect.left + (Math.random() * 50) - 25;
        let randomYOffset = playerRect.top + (Math.random() * 50) - 25;
    
        randomXOffset = Math.max(0, Math.min(randomXOffset, gameAreaWidth - textWidth));
    
        indicator.style.left = `${randomXOffset}px`;
        indicator.style.top = `${randomYOffset}px`;
    
        document.getElementById('floating-indicators').appendChild(indicator);
    
        setTimeout(() => {
            indicator.remove();
        }, 2000);
    }

    // <---------------------------------INVENTORY-------------------------------------------->

    inventoryBtn.addEventListener('click', () => {
        togglePause('inventory');
        inventoryModal.show();
    });

    document.getElementById('inventoryModal').addEventListener('hidden.bs.modal', () => {
        if (isPaused) {
            startCountdownAndResume();
        }
    }); 

    // <---------------------------------Wishing-------------------------------------------->
    let swipeCompleted = false; // Flag to lock swipe after the first wish


    function createFallingStar() {
        if (isPaused || timeRemaining <= 0) return;

        const star = document.createElement('div');
        star.classList.add('falling-star');
        star.innerHTML = '🌟';
        star.style.left = `${Math.random() * (gameArea.offsetWidth - 50)}px`;
        gameArea.appendChild(star);

        let starFall = setInterval(() => {
            if (isPaused) return;

            let starTop = parseInt(window.getComputedStyle(star).getPropertyValue('top'));
            if (starTop > gameArea.offsetHeight - 40) {
                star.remove();
                clearInterval(starFall);
            } else {
                star.style.top = `${starTop + fallingSpeed}px`;
            }

            if (checkTopCollision(player, star)) {
                showFloatingText('+1 🌟', player.offsetLeft, player.offsetTop, 'yellow');
                incrementStarCount();
                star.remove();
                clearInterval(starFall);
            }
        }, 20);
    }

    function incrementStarCount() {
        starCount++;
        document.getElementById('star-count').textContent = starCount;
    }

    mysteryBox.addEventListener('click', () => {
        if (starCount <= 0) {
            alert("You don't have enough stars to wish!");
            return;
        }
    
        starCount--;
        document.getElementById('star-count').textContent = starCount;
    
        mysteryBox.classList.remove('shake');
        tapText.style.display = 'none';
    
        openBox();
    });

    function openBox() {
        const boxLid = document.querySelector('.box-lid');
        
        boxLid.style.transition = 'transform 1.5s ease-out';
        boxLid.style.transform = 'rotate(-45deg)';
    
        startSparkles();
    
        setTimeout(openVeil, 1500);
    }

    function startSparkles() {
        const sparkleContainer = document.createElement('div');
        sparkleContainer.classList.add('sparkle-container');
        document.getElementById('animation-section').appendChild(sparkleContainer);
    
        for (let i = 0; i < 30; i++) { 
            const sparkle = document.createElement('div');
            sparkle.classList.add('sparkle');
            sparkleContainer.appendChild(sparkle);
            
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.animationDuration = `${0.5 + Math.random()}s`;
            sparkle.style.backgroundColor = ['#ff69b4', '#ffd700', '#ff1493'][Math.floor(Math.random() * 3)]; 
        }
    
        setTimeout(() => {
            sparkleContainer.remove();
        }, 1500);
    }


    function revealItem() {
        const items = [
            { id: 'hearts', name: 'Triple Heart Boost', image: 'pictures/heartWish.png' },
            { id: 'timer', name: 'Clock Boost', image: 'pictures/clockWish.png' }
        ];
    
        const selectedItem = items[Math.floor(Math.random() * items.length)];
    
        const itemCountElement = document.getElementById(`${selectedItem.id}-count`);
        itemCountElement.textContent = parseInt(itemCountElement.textContent) + 1;
    
        const itemModal = document.createElement('div');
        itemModal.classList.add('item-modal');
        itemModal.innerHTML = `
            <div class="item-content">
                <img src="${selectedItem.image}" alt="${selectedItem.name}" class="item-image">
                <p class="item-text">You received a ${selectedItem.name}!</p>
            </div>
        `;
        document.body.appendChild(itemModal);
    
        itemModal.addEventListener('click', () => {
            itemModal.remove();
            resetBox(); 
            swipeCompleted = false;
        });

        
    }

    function openVeil() {
        const veilModal = document.createElement('div');
        veilModal.classList.add('veil-modal');
        veilModal.innerHTML = `
            <div class="veil-content">
                <div class="glow"></div>
                <p class="swipe-text">Swipe Up to Reveal</p>
            </div>
        `;
        document.body.appendChild(veilModal);
    
        let startY;
        const veilContent = veilModal.querySelector('.veil-content');
        const glow = veilModal.querySelector('.glow');
    
        // Start tracking the swipe
        veilModal.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            veilContent.style.height = '0%'; // Reset veil height
        });
    
        // Update veil reveal as user swipes
        veilModal.addEventListener('touchmove', (e) => handleSwipeUp(e, startY, veilContent, glow));
    
        // Complete the swipe on release
        veilModal.addEventListener('touchend', () => finalizeReveal(veilModal));
    }
    function handleSwipeUp(e, startY, veilContent, glow) {
        const currentY = e.touches[0].clientY;
        const swipeDistance = startY - currentY;
        const maxRevealHeight = 100; // Maximum height percentage
    
        // Calculate reveal progress without delay
        let revealPercentage = (swipeDistance / window.innerHeight) * 100;
        if (revealPercentage > maxRevealHeight) revealPercentage = maxRevealHeight;
        if (revealPercentage < 0) revealPercentage = 0;
    
        // Update veil height and glow position instantly
        veilContent.style.height = `${revealPercentage}%`;
        glow.style.bottom = `${revealPercentage - 10}%`; // Move glow with swipe progress
        glow.style.opacity = revealPercentage > 0 ? 1 : 0;
    }
    
    
    function finalizeReveal(veilModal) {
        if (parseFloat(veilModal.querySelector('.veil-content').style.height) >= 100) {
            veilModal.classList.add('fade-out');
            veilModal.addEventListener('animationend', () => {
                veilModal.remove();
                revealItem(); 
            });
        } else {
            veilModal.querySelector('.veil-content').style.height = '0%';
        }
    }
    function resetBox() {
        const boxLid = document.querySelector('.box-lid');
        boxLid.style.transform = 'rotate(0)';
        boxLid.style.transition = 'transform 0.8s ease-in-out';
    
        mysteryBox.classList.add('shake');
        mysteryBox.classList.remove('flash-glow');
        tapText.style.display = 'block';
    }
    

    // <---------------------------------PowerUps-------------------------------------------->

    document.querySelectorAll('.inventory-item').forEach(item => {
        item.addEventListener('click', () => {
            const itemId = item.id.split('-')[0];
            const itemCountElement = document.getElementById(`${itemId}-count`);
            let itemCount = parseInt(itemCountElement.textContent);
    
            if (itemCount > 0) {
                itemCount--;
                itemCountElement.textContent = itemCount;
    
                activatePowerUp(itemId);
                alert(`${itemId.replace(/^./, itemId[0].toUpperCase())} Power-Up Activated!`);
            } else {
                alert("You don't have any of this item to use!");
            }
        });
    });

    function activatePowerUp(itemId) {
        if (currentPowerUp) {
            deactivatePowerUp();
        }
    
        currentPowerUp = itemId;
    
        switch (itemId) {
            case 'hearts':
                activateTripleHeartBoost();
                break;
            case 'timer':
                activateClockBoost();
                break;
            case '???':
                // ???;
                break;
            case '???':
                // ???;
                break;
        }
    }
    
    function deactivatePowerUp() {
        if (!currentPowerUp) return;
    
        switch (currentPowerUp) {
            case 'hearts':
                deactivateTripleHeartBoost();
                break;
        }
        currentPowerUp = null;
    }


    // <---------------------------------HIGH SCORES-------------------------------------------->

    function saveScore(score) {
        let scores = JSON.parse(localStorage.getItem('scores')) || [];
        const scoreEntry = {
            score: score,
            date: new Date().toLocaleString() 
        };
        scores.push(scoreEntry);
        localStorage.setItem('scores', JSON.stringify(scores));
    }
    
    function loadScores() {
        let scores = JSON.parse(localStorage.getItem('scores')) || [];
        return scores
            .filter(entry => entry.score > 0) // Only keep scores greater than 0
            .sort((a, b) => b.score - a.score); // Sort by score in descending order
    }
    
    
    function displayBestScores() {
        const scores = loadScores();
        const bestScoresElement = document.getElementById('all-scores');
        bestScoresElement.innerHTML = scores
            .map((entry, index) => `
                <div class="score-entry">
                    <span class="score-rank">#${index + 1}</span>
                    <span class="score-value">${entry.score}</span>
                    <span class="score-date">${entry.date}</span>
                </div>
            `)
            .join('');
    }
    

    function endGame() {
        saveScore(score);
        displayBestScores();
    }

});
