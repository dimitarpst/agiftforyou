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
    const finalScore = document.getElementById('final-score');
    const pauseScore = document.getElementById('pause-score');
    const volumeControl = document.getElementById('volume-control');
    const restartGameBtn = document.getElementById('restart-game-btn');
    const magnetRangeElement = document.getElementById('magnet-range');
    const mysteryBox = document.getElementById('mystery-box');
    const tapText = document.getElementById('tap-text');
    const heartEmoji = "❤️";
    const outfits = [
        { id: 'basket', label: 'Default', image: 'pictures/basket.svg', unlockScore: 0, rarity: 'default' },
        { id: 'badbadtzmaru', label: 'Special', image: 'pictures/badbadtzmaru.png', unlockScore: 100, rarity: 'special' },
        { id: 'cinnamoroll', label: 'Epic', image: 'pictures/cinnamoroll.png', unlockScore: 200, rarity: 'epic' },
        { id: 'pompompurin', label: 'Mythic', image: 'pictures/pompompurin.png', unlockScore: 300, rarity: 'mythic' },
        { id: 'avocado', label: 'Avocado', image: 'pictures/avocado.png', unlockScore: 400, rarity: 'avocado' },
        { id: 'secret', label: '???', image: 'pictures/secret.png', unlockScore: 500, rarity: 'secret' }
    ];
    const savedOutfitId = localStorage.getItem('selectedOutfit') || 'basket';

    // Apply the saved outfit to the player
    const savedOutfits = JSON.parse(localStorage.getItem('outfits')) || outfits;
    const savedOutfit = savedOutfits.find(o => o.id === savedOutfitId);

    if (savedOutfit) {
        player.style.backgroundImage = `url(${savedOutfit.image})`;
        player.style.bottom = (savedOutfitId === 'pompompurin' || savedOutfitId === 'badbadtzmaru' || savedOutfitId === 'avocado' || savedOutfitId === 'cory') ? '-5px' : '';
    }
    let coryModalShown = JSON.parse(localStorage.getItem('coryModalShown')) || false;


    //LET variables
    let starCount = 0;
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
    let timeRemaining = 60;
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
    let powerUpUsedDuringPause = false; 
    let starPowerUpPending = false;
    let snowflakeCreationInterval, candyCaneCreationInterval, ornamentCreationInterval;
    let christmasItemsCollected = 0;

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

    // <---------------------------------MISC-------------------------------------------->
    document.getElementById('copyEmailBtn').addEventListener('click', () => {
        const email = 'dimmitar.petkovv@gmail.com';
        navigator.clipboard.writeText(email)
            .then(() => {
                const copyButton = document.getElementById('copyEmailBtn');
                copyButton.textContent = 'Copied!';
                copyButton.classList.add('btn-success');
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                    copyButton.classList.remove('btn-success');
                }, 2000);
            })
            .catch(() => {
                alert('Failed to copy email');
            });
    });
    

    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event;

        const installAppBtn = document.getElementById('install-app-btn');
        installAppBtn.style.display = 'block';

        installAppBtn.addEventListener('click', () => {
            installAppBtn.style.display = 'none';
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                deferredPrompt = null;
            });
        });
    });

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

    const audioElements = [
        document.getElementById('clockCollect'),
        document.getElementById('clockCollectMagnet'),
        document.getElementById('heartCollect'),
        document.getElementById('heartCollectMagnet'),
        document.getElementById('heartMiss'),
        document.getElementById('magnetCollect'),
        document.getElementById('shieldBreak'),
        document.getElementById('shieldUpgrade'),
        document.getElementById('swordAttack'),
        document.getElementById('avocadoCollect'),
        document.getElementById('avocadoCollectMagnet'),
        document.getElementById('starCollect'),
        document.getElementById('starCollectMagnet')
    ];

    function playSoundEffect(soundId) {
        const originalAudio = document.getElementById(soundId);
        if (originalAudio) {
            const soundClone = originalAudio.cloneNode(); // Clone the audio element
            soundClone.volume = originalAudio.volume; // Set volume to match the original
            soundClone.play(); // Play the cloned sound
        }
    }


    volumeControl.addEventListener('input', (e) => {
        volume = e.target.value;
        audioElements.forEach(audio => {
            audio.volume = volume;
        });
        coryVoices.forEach(voice => {
            voice.volume = volume;
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

    function showMessageModal(message) {
        const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
        document.getElementById('messageModalBody').textContent = message;
        messageModal.show();
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
        event.preventDefault(); 
        Array.from(event.touches).forEach((touch) => {
            const playerRect = player.getBoundingClientRect();
            const pauseButtonRect = pauseBtn.getBoundingClientRect();
            const inventoryButtonRect = inventoryBtn.getBoundingClientRect();
    
            if (
                touch.clientX >= playerRect.left &&
                touch.clientX <= playerRect.right &&
                touch.clientY >= playerRect.top &&
                touch.clientY <= playerRect.bottom
            ) {
                activeTouches[touch.identifier] = 'move';
                touchOffsetX = touch.clientX - playerRect.left;
            } else if (
                touch.clientX >= pauseButtonRect.left &&
                touch.clientX <= pauseButtonRect.right &&
                touch.clientY >= pauseButtonRect.top &&
                touch.clientY <= pauseButtonRect.bottom
            ) {
                activeTouches[touch.identifier] = 'pause';
                togglePause(); 
            } else if (
                touch.clientX >= inventoryButtonRect.left &&
                touch.clientX <= inventoryButtonRect.right &&
                touch.clientY >= inventoryButtonRect.top &&
                touch.clientY <= inventoryButtonRect.bottom
            ) {
                activeTouches[touch.identifier] = 'inventory';
                inventoryModal.show(); 
                togglePause('inventory');
            }
        });
    });
    
    gameArea.addEventListener('touchmove', (event) => {
        event.preventDefault();
        Array.from(event.touches).forEach((touch) => {
            if (activeTouches[touch.identifier] === 'move' && !isPaused) {
                let newPlayerLeft = touch.clientX - touchOffsetX;
                newPlayerLeft = Math.max(0, Math.min(newPlayerLeft, gameArea.offsetWidth - player.offsetWidth));
                player.style.left = `${newPlayerLeft}px`;
            }
        });
    });
    
    gameArea.addEventListener('touchend', (event) => {
        event.preventDefault();
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

        powerUpUsedDuringPause = false;
        if (powerUpPending && !avocadoRainInterval) {
            startAvocadoPowerUpEffect();
            powerUpPending = false; 
        }
        if (starPowerUpPending) {
            showTaurusStartPoint(); 
            startTaurusAnimation();
            starPowerUpPending = false; 
        }

        
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
        document.querySelectorAll('.falling-heart, .falling-clock, .falling-shield, .falling-magnet, .falling-spikes, .falling-star').forEach(item => item.remove());
    
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
        document.querySelectorAll('.falling-star').forEach(star => star.remove());
        document.querySelectorAll('.falling-avocado').forEach(avocado => avocado.remove());
        document.querySelectorAll('.falling-snowflake').forEach(snowflake => snowflake.remove());
        document.querySelectorAll('.falling-candycane').forEach(candycane => candycane.remove());
        document.querySelectorAll('.falling-ornament').forEach(ornament => ornament.remove());

        score = 0;
        updateScore(score);
        timeRemaining = 60;
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
        starCount = 0;
        document.getElementById('star-count').textContent = starCount;
        fallingSpeed = 2;

        document.getElementById('hearts-count').textContent = '0';
        document.getElementById('timer-count').textContent = '0';
        document.getElementById('avocado-count').textContent = '0';
        document.getElementById('starconst-count').textContent = '0';

        if (doubleHeartBoostActive) deactivateDoubleHeartBoost();
        if (tripleHeartBoostActive) deactivateTripleHeartBoost();

        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        pauseBtn.textContent = 'Pause';
    
        startGame();
    }  

    function startGame() {
        score = 0;
        timeRemaining = 60;
        updateScore(0);
        updateTimer(timeRemaining);
        isPaused = false;
        fallingSpeed = 2;
        clearInterval(snowflakeCreationInterval);
        clearInterval(candyCaneCreationInterval);
        clearInterval(ornamentCreationInterval);
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
        starCreationInterval = setInterval(createFallingStar, 20000);
        snowflakeCreationInterval = setInterval(createFallingSnowflake, Math.random() * 3000 + 5000);
        candyCaneCreationInterval = setInterval(createFallingCandyCane, Math.random() * 4000 + 7000);
        ornamentCreationInterval = setInterval(createFallingOrnament, Math.random() * 5000 + 8000);

        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimer(timeRemaining);
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                showGameOverModal();
            }
        }, 1000);
        requestAnimationFrame(updatePlayerPosition);
        updateTotalScore();

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
                playSoundEffect(collectSound);
    
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
                onItemCollected();

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
                onItemCollected();
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
                onItemCollected(); 
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
                onItemCollected(); 
            }
        }, 20);
    }

    function activateMagnetEffect() {
        if (magnetActive) {
            showFloatingText('+8s 🧲', player.offsetLeft, player.offsetTop, 'white');
            remainingMagnetDuration += 8000;
            magnetEndTime = Date.now() + remainingMagnetDuration;
            return;
        }
        showFloatingText('+8s 🧲', player.offsetLeft, player.offsetTop, 'white');
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
                ...document.querySelectorAll(".falling-avocado"),
                ...document.querySelectorAll(".falling-candycane"),
                ...document.querySelectorAll(".falling-snowflake"),
                ...document.querySelectorAll(".falling-ornament"),

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
                        onItemCollected(); 
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

    // <---------------------------------Avocados-------------------------------------------->
    let powerUpPending = false;
    let avocadoRainInterval;
    let avocadoRainTimeLeft = 4000;

    function activateAvocadoPowerUp() {
        const player = document.getElementById('player');
        player.classList.add('avocado-mode');

        let startTime = performance.now();
        let lastAvocadoTime = 0;

        function avocadoRainLoop() {
            if (isPaused) {
                startTime = performance.now(); 
                requestAnimationFrame(avocadoRainLoop);
                return;
            }

            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;

            
            if (elapsedTime >= 4000) {
                player.classList.remove('avocado-mode');
                avocadoRainTimeLeft = 4000;
                return;
            }

            if (currentTime - lastAvocadoTime >= 500) {
                createFallingAvocado();
                lastAvocadoTime = currentTime; 
            }

            requestAnimationFrame(avocadoRainLoop);
        }

        avocadoRainLoop();
    }

    function createFallingAvocado() {
        const avocado = document.createElement('div');
        avocado.classList.add('falling-avocado');
        avocado.style.backgroundImage = "url('pictures/avocado.png')";
        avocado.style.backgroundSize = "contain";
        avocado.style.backgroundRepeat = "no-repeat";
        avocado.style.width = "50px";
        avocado.style.height = "50px";
        avocado.style.left = `${Math.random() * (gameArea.offsetWidth - 50)}px`;
        gameArea.appendChild(avocado);

        let avocadoFall = setInterval(() => {
            if (isPaused) return;

            let avocadoTop = parseInt(window.getComputedStyle(avocado).getPropertyValue('top'));

            if (avocadoTop > gameArea.offsetHeight - 40) {
                avocado.remove();
                clearInterval(avocadoFall);
            } else {
                avocado.style.top = `${avocadoTop + fallingSpeed}px`;
            }

            if (checkTopCollision(player, avocado)) {
                const collectSound = magnetActive ? 'avocadoCollectMagnet' : 'avocadoCollect';
                playSoundEffect(collectSound);
                showFloatingText('+2 🥑', player.offsetLeft, player.offsetTop, 'green');
                score += 2;
                updateScore(score);
                avocado.remove();
                clearInterval(avocadoFall);
                onItemCollected(); 
            }

        }, 20);
    }
    // <---------------------------------Constellation-------------------------------------------->

    const shimmeringSound = new Audio('audio/shimmering.mp3');
    shimmeringSound.loop = true; 
    
    function showTaurusStartPoint() {
        const star = document.createElement('div');
        star.classList.add('constellation-star');
        star.style.left = '410px'; 
        star.style.top = '240px';
        star.style.width = '35px';
        star.style.height = '35px';
        star.style.zIndex = '2';
        star.style.filter = `
            drop-shadow(0 0 5px #00e6e6)
            drop-shadow(0 0 10px #00b8b8)
            drop-shadow(0 0 15px #008c8c)
        `;
    
        gameArea.appendChild(star);
    }

    function startTaurusAnimation() {
        shimmeringSound.play();
        const taurusCoordinates = [
            { x: 230, y: 90 },    // 1  [0]
            { x: 200, y: 210 },   // 6  [1]
            { x: 360, y: 140 },   // 2  [2]
            { x: 420, y: 245 },   // 7  [3]
            { x: 445, y: 200 },   // 3  [4]
            { x: 450, y: 260 },   // 8  [5]
            { x: 475, y: 220 },   // 4  [6]
            { x: 495, y: 255 },   // 5  [7]
            { x: 580, y: 285 },   // 9  [8]
            { x: 525, y: 360 },   // 10 [9]
            { x: 585, y: 390 },   // 11 [10]
            { x: 720, y: 260 },   // 12 [11]
            { x: 745, y: 310 },   // 13 [12]
            { x: 760, y: 325 }    // 14 [13]
        ];
    
        taurusCoordinates.forEach((coord, index) => {
            setTimeout(() => {
                const star = document.createElement('div');
                star.classList.add('taurus-star');
                star.style.position = 'absolute';
                star.style.left = `${coord.x}px`;
                star.style.top = `${coord.y}px`;
                star.style.backgroundImage = "url('pictures/star.png')";
                star.style.width = '20px';
                star.style.height = '20px';
                star.style.backgroundSize = 'cover';
                star.style.backgroundPosition = 'center';
                star.style.zIndex = '1';
                gameArea.appendChild(star);
            }, index * 500); 
        });
    
        const connections = [
            [0, 2], [2, 6], [4, 6], [6, 7], [1, 3], 
            [3, 5], [5, 7], [7, 8], [8, 9], [9, 10], 
            [8, 11], [11, 12], [12, 13]
        ];
    
        connections.forEach(([start, end], index) => {
            setTimeout(() => {
                drawLineBetweenStars(taurusCoordinates[start], taurusCoordinates[end]);
            }, index * 400 + 200);
        });
    
        setTimeout(suckInStars, (taurusCoordinates.length + connections.length) * 300); 
        
    }
    
    function drawLineBetweenStars(start, end) {
        const line = document.createElement('div');
        line.classList.add('constellation-line');
        line.style.position = 'absolute';
    
        const startX = start.x + 10; 
        const startY = start.y + 10;
        const endX = end.x + 10;
        const endY = end.y + 10;
    
        line.style.width = `${Math.hypot(endX - startX, endY - startY)}px`;
        line.style.height = '2px';
        line.style.backgroundColor = 'transparent';
        line.style.left = `${startX}px`;
        line.style.top = `${startY}px`;
        line.style.transformOrigin = '0 0';
        line.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX)}rad)`;
    
        line.style.filter = `
            drop-shadow(0 0 5px #00e6e6)
            drop-shadow(0 0 10px #00b8b8)
            drop-shadow(0 0 15px #008c8c)
        `;
    
        line.style.overflow = 'hidden';
        const animatedLine = document.createElement('div');
        animatedLine.style.width = '100%';
        animatedLine.style.height = '100%';
        animatedLine.style.backgroundColor = '#00e6e6';
        animatedLine.style.animation = 'drawLine 0.5s linear forwards';
    
        line.appendChild(animatedLine); 
        gameArea.appendChild(line);
    }

    function suckInStars() {
        shimmeringSound.pause();
        shimmeringSound.currentTime = 0;
        const player = document.getElementById('player');
    
        document.querySelectorAll('.constellation-line').forEach((line) => {
            line.style.transition = 'opacity 1s ease';
            line.style.opacity = '0';
            setTimeout(() => line.remove(), 500);
        });
    
        const constellationStar = document.querySelector('.constellation-star');
        if (constellationStar) {
            constellationStar.style.transition = 'opacity 1s ease';
            constellationStar.style.opacity = '0';
            setTimeout(() => constellationStar.remove(), 500);
        }
    
        document.querySelectorAll('.taurus-star').forEach((star, index) => {
            setTimeout(() => {
                star.style.transition = 'all 0.5s ease-in-out';
    
                function updateStarPosition() {
                    const playerPosition = {
                        x: player.offsetLeft + player.offsetWidth / 2,
                        y: player.offsetTop + player.offsetHeight / 2,
                    };
    
                    star.style.left = `${playerPosition.x}px`;
                    star.style.top = `${playerPosition.y}px`;
    
                    if (document.body.contains(star)) {
                        requestAnimationFrame(updateStarPosition);
                    }
                }
    
                updateStarPosition();
    
                star.addEventListener('transitionend', () => {
                    score += 1;
                    showFloatingText('+1 ⭐', player.offsetLeft, player.offsetTop, 'blue');
                    updateScore(score);
                    star.remove();
                });
            }, index * 100);
        });
    }

    function activateStarPowerUp() {
        starPowerUpPending = true; 
        timeRemaining += 15;
        updateTimer(timeRemaining);
        showFloatingText("+15s 🕒", player.offsetLeft, player.offsetTop, "yellow");
        if (!isPaused) { 
            showTaurusStartPoint(); 
            startTaurusAnimation();
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
    const magicBoxOpenSound = new Audio('audio/magicBoxOpen.wav');

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
                const collectSound = magnetActive ? 'starCollectMagnet' : 'starCollect';
                playSoundEffect(collectSound);
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
            showMessageModal("You don't have enough stars to wish!");
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
        
        magicBoxOpenSound.play(); 

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
    const itemRevealSound = new Audio('audio/itemReveal.wav');


    function revealItem() {
        const items = [
            { id: 'hearts', name: 'Triple Heart Boost', image: 'pictures/heartWish.png' },
            { id: 'timer', name: 'Clock Boost', image: 'pictures/clockWish.png' },
            { id: 'avocado', name: 'Avocado Boost', image: 'pictures/avocadoWish.png' },
            { id: 'starconst', name: 'Star Boost', image: 'pictures/starconstWish.png' }
        ];
    
        const selectedItem = items[Math.floor(Math.random() * items.length)];
    
        const itemCountElement = document.getElementById(`${selectedItem.id}-count`);
        itemCountElement.textContent = parseInt(itemCountElement.textContent) + 1;
        itemRevealSound.play();  // Play item reveal sound

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
    const veilSound = new Audio('audio/veil.wav');

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
        veilSound.play();  // Play veil sound on modal open

        let startY;
        const veilContent = veilModal.querySelector('.veil-content');
        const glow = veilModal.querySelector('.glow');
    
        veilModal.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            veilContent.style.height = '0%';
        });
    
        veilModal.addEventListener('touchmove', (e) => handleSwipeUp(e, startY, veilContent, glow));
    
        veilModal.addEventListener('touchend', () => finalizeReveal(veilModal));
    }

    function handleSwipeUp(e, startY, veilContent, glow) {
        const currentY = e.touches[0].clientY;
        const swipeDistance = startY - currentY;
        const maxRevealHeight = 100; 
    
        let revealPercentage = (swipeDistance / window.innerHeight) * 100;
        if (revealPercentage > maxRevealHeight) revealPercentage = maxRevealHeight;
        if (revealPercentage < 0) revealPercentage = 0;
    
        veilContent.style.height = `${revealPercentage}%`;
        glow.style.bottom = `${revealPercentage - 10}%`; 
        glow.style.opacity = revealPercentage > 0 ? 1 : 0;
    }   
    
    function finalizeReveal(veilModal) {
        if (parseFloat(veilModal.querySelector('.veil-content').style.height) >= 50) {
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

    const powerUpSound = new Audio('audio/powerUp.mp3');
    powerUpSound.volume = 0.7;
    document.querySelectorAll('.inventory-item').forEach(item => {
        item.addEventListener('click', () => {
            const itemId = item.id.split('-')[0];
            const itemCountElement = document.getElementById(`${itemId}-count`);
            let itemCount = parseInt(itemCountElement.textContent);
    
            if (itemCount > 0) {
                if (itemId === 'hearts' && tripleHeartBoostActive) {
                    showMessageModal("Hearts Power-Up is already active and cannot be used again.");
                    return;
                }
    
                if (itemId === 'starconst' && starPowerUpPending) {
                    showMessageModal("Constellation Power-Up can only be used once.");
                    return;
                }
    
                itemCount--;
                itemCountElement.textContent = itemCount;
    
                activatePowerUp(itemId);
                showMessageModal(`${itemId.replace(/^./, itemId[0].toUpperCase())} Power-Up Activated!`);
            } else {
                showMessageModal("You don't have any of this item to use!");
            }
        });
    });
    
    function activatePowerUp(itemId) {
        if (currentPowerUp) {
            deactivatePowerUp();
        }
        switch (itemId) {
            case 'hearts':
                if (!tripleHeartBoostActive) {
                    activateTripleHeartBoost();
                }
                break;
            case 'timer':
                activateClockBoost();
                break;
            case 'avocado':
                avocadoRainTimeLeft += 4000;
                if (!avocadoRainInterval) {
                    activateAvocadoPowerUp();
                }
                break;
            case 'starconst':
                if (!starPowerUpPending) {
                    activateStarPowerUp();

                }
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
            .filter(entry => entry.score > 0) 
            .sort((a, b) => b.score - a.score); 
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
        updateTotalScore();
    }

    // <---------------------------------OUTFITS-------------------------------------------->
    function updateTotalScore() {
        const scores = loadScores();
        const totalScore = scores.reduce((sum, entry) => sum + entry.score, 0);
        localStorage.setItem('totalScore', totalScore);
        checkOutfitUnlock(totalScore);
    }
    

    
    function checkOutfitUnlock(totalScore) {
        outfits.forEach(outfit => {
            if (!outfit.unlocked && totalScore >= outfit.unlockScore) {
                outfit.unlocked = true;
                if (outfit.id === 'secret') {
                    outfit.id = 'cory';
                    outfit.label = 'CoryxKenshin';
                    outfit.image = 'pictures/cory.png';
                    outfit.rarity = 'cory';
                }
            }
        });
        localStorage.setItem('outfits', JSON.stringify(outfits));
    }
    
    let selectedOutfitId = localStorage.getItem('selectedOutfit') || 'basket';
    
    function showOutfitsModal() {
        const outfitsContainer = document.querySelector('.outfits-container');
        outfitsContainer.innerHTML = ''; 
    
        const savedOutfits = JSON.parse(localStorage.getItem('outfits')) || outfits;
        const totalScore = parseInt(localStorage.getItem('totalScore')) || 0;
    
        savedOutfits.forEach(outfit => {
            const progress = outfit.unlockScore ? Math.min((totalScore / outfit.unlockScore) * 100, 100) : 100;
    
            const card = document.createElement('div');
            card.classList.add('col-md-4', 'outfit-card');
    
            const progressContent = outfit.id !== 'basket'
                ? `
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progress}%;"></div>
                    </div>
                    <div class="score-text">${Math.min(totalScore, outfit.unlockScore)}/${outfit.unlockScore}</div>
                  `
                : `<div class="placeholder-container"><div class="placeholder" style="height: 30px;"></div></div>`;
    
            card.innerHTML = `
                <div class="outfit-title ${outfit.rarity}">${outfit.label}</div>
                <img src="${outfit.image}" alt="${outfit.label}" class="outfit-image img-fluid ${outfit.unlocked ? 'unlocked' : 'locked'}">
                ${progressContent}
                <button class="select-button ${selectedOutfitId === outfit.id ? 'selected' : ''}" 
                        ${outfit.unlocked || outfit.id === 'basket' ? '' : 'disabled'}>
                    ${selectedOutfitId === outfit.id ? 'Selected' : 'Select'}
                </button>
            `;
    
            outfitsContainer.appendChild(card);
    
            const button = card.querySelector('.select-button');
            button.addEventListener('click', () => selectOutfit(outfit.id, button));
        });
    
        new bootstrap.Modal(document.getElementById('outfitsModal')).show();
    }
    
    
    document.getElementById('outfits-btn').addEventListener('click', showOutfitsModal);
    document.getElementById('pause-outfits-btn').addEventListener('click', showOutfitsModal);
    
    function selectOutfit(outfitId, button) {
        const savedOutfits = JSON.parse(localStorage.getItem('outfits')) || outfits;
        const outfit = savedOutfits.find(o => o.id === outfitId);
    
        if (outfitId !== 'basket' && !outfit.unlocked) {
            showMessageModal("You don't have enough points to select this outfit");
            return;
        }
    
        if (selectedOutfitId === outfitId) {
            return;
        }
    
        selectedOutfitId = outfitId;
        localStorage.setItem('selectedOutfit', selectedOutfitId);
    
        document.querySelectorAll('.select-button').forEach(btn => {
            btn.classList.remove('selected');
            btn.textContent = 'Select';
        });
    
        button.classList.add('selected');
        button.textContent = 'Selected';
    
        const playerElement = document.getElementById('player');
        if (outfit) {
            playerElement.style.backgroundImage = `url(${outfit.image})`;
            playerElement.style.bottom = (outfitId === 'pompompurin' || outfitId === 'badbadtzmaru' || outfitId === 'avocado' || outfitId === 'cory') ? '-5px' : '';
        }
    }
    

    const coryVoices = [
        new Audio('audio/coryVoice1.mp3'),
        new Audio('audio/coryVoice2.mp3'),
        new Audio('audio/coryVoice3.mp3'),
        new Audio('audio/coryVoice4.mp3'),
        new Audio('audio/coryVoice5.mp3'),
        new Audio('audio/coryVoice6.mp3'),
        new Audio('audio/coryVoice7.mp3'),
        new Audio('audio/coryVoice8.mp3'),
        new Audio('audio/coryVoice9.mp3'),
        new Audio('audio/coryVoice10.mp3'),
        new Audio('audio/coryVoice11.mp3'),
        new Audio('audio/coryVoice12.mp3'),
        new Audio('audio/coryVoice13.mp3'),
        new Audio('audio/coryVoice14.mp3'),
        new Audio('audio/coryVoice15.mp3')
    ];
    coryVoices.forEach(voice => {
        voice.volume = 0.7;
    });
    let itemCollectionCount = 0;
    const coryChristmasSong = new Audio('audio/coryChristmasSong.mp3');
    coryChristmasSong.volume = 0.7;
    let allVoicesPlayed = false; // Flag to track if all voices have been played
    let itemsAfterVoicesCollected = 0; // Counter for items collected after voicelines
        
    function triggerCoryModal() {
        togglePause(); // Pause the game
        const coryModal = new bootstrap.Modal(document.getElementById('coryModal'));
        coryModal.show();
    
        // Save the state in local storage
        coryModalShown = true;
        localStorage.setItem('coryModalShown', JSON.stringify(coryModalShown));
    
        // Reset for replay if needed
        playedCoryVoices.clear();
        allVoicesPlayed = false; // Reset the flag
        itemsAfterVoicesCollected = 0; // Reset counter
    }
    
    
    let playedCoryVoices = new Set(); // Track played voices
    function playCoryVoice() {
        if (selectedOutfitId === 'cory') {
            let availableVoices = coryVoices.filter((voice, index) => !playedCoryVoices.has(index));
            
            if (availableVoices.length > 0) {
                let randomIndex = Math.floor(Math.random() * availableVoices.length);
                let voiceIndex = coryVoices.indexOf(availableVoices[randomIndex]);
                
                playedCoryVoices.add(voiceIndex);
                coryVoices[voiceIndex].play();
            }
    
            // Check if all voices have been played
            if (playedCoryVoices.size === coryVoices.length) {
                allVoicesPlayed = true; // Mark that all voices have been played
            }
        }
    }


    function onItemCollected() {
        itemCollectionCount++;
    
        if (coryModalShown) {
            if (itemCollectionCount % 5 === 0) {
                playCoryVoice();
            }
        } else {
            if (allVoicesPlayed) {
                itemsAfterVoicesCollected++;
                if (itemsAfterVoicesCollected === 5) {
                    coryChristmasSong.play();
                    triggerCoryModal();
                }
            } else if (itemCollectionCount % 5 === 0) {
                playCoryVoice();
            }
        }
    }
    


function createFallingSnowflake() {
    createFallingChristmasObject('falling-snowflake', '+1 ❄️', 1);
}

function createFallingCandyCane() {
    createFallingChristmasObject('falling-candycane', '+1 🍬', 1);
}

function createFallingOrnament() {
    createFallingChristmasObject('falling-ornament', '+1 🎄', 1);
}

function createFallingChristmasObject(className, floatingText, points) {
    if (isPaused || score < 0) return;

    const obj = document.createElement('div');
    obj.classList.add(className);
    obj.style.left = `${Math.random() * (gameArea.offsetWidth - 50)}px`;
    gameArea.appendChild(obj);

    let objFall = setInterval(() => {
        if (isPaused) return;

        let objTop = parseInt(window.getComputedStyle(obj).getPropertyValue('top'));
        if (objTop > gameArea.offsetHeight - 40) {
            obj.remove();
            clearInterval(objFall);
        } else {
            obj.style.top = `${objTop + fallingSpeed}px`;
        }

        if (checkTopCollision(player, obj)) {
            playSoundEffect('heartCollect'); // Reuse heart collection sound
            showFloatingText(floatingText, player.offsetLeft, player.offsetTop, 'green');
            score += points;
            updateScore(score);
            obj.remove();
            clearInterval(objFall);

            // Increment Christmas items counter
            christmasItemsCollected++;
            if (christmasItemsCollected % 20 === 0) {
                triggerSnowflakeShower();
            }
        }
    }, 20);
}

function triggerSnowflakeShower() {
    let snowflakesCreated = 0;
    const totalSnowflakes = 25;
    const pointsPerSnowflake = 1; 
    let accumulatedPoints = 0;

    const snowflakeInterval = setInterval(() => {
        if (snowflakesCreated >= totalSnowflakes) {
            clearInterval(snowflakeInterval);

            score += accumulatedPoints;
            updateScore(score);
            return;
        }

        const snowflake = document.createElement('div');
        snowflake.classList.add('shower-snowflake');
        snowflake.style.left = `${Math.random() * (gameArea.offsetWidth - 20)}px`;
        snowflake.style.top = `0px`;
        gameArea.appendChild(snowflake);

        let snowflakeFall = setInterval(() => {
            if (isPaused) return;

            let snowflakeTop = parseInt(window.getComputedStyle(snowflake).getPropertyValue('top'));
            if (snowflakeTop > gameArea.offsetHeight - 20) {
                snowflake.remove();
                clearInterval(snowflakeFall);
                return;
            }

            snowflake.style.top = `${snowflakeTop + fallingSpeed}px`;

        }, 20);

        accumulatedPoints += pointsPerSnowflake;

        showFloatingText('+1 ❄️', Math.random() * gameArea.offsetWidth, Math.random() * gameArea.offsetHeight / 2, 'blue');

        snowflakesCreated++;
    }, 100); 
}


    

});
