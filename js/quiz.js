document.addEventListener('DOMContentLoaded', function () {
    const startGameBtn = document.getElementById('start-game-btn');
    const quizModal = new bootstrap.Modal(document.getElementById('quizModal'), { backdrop: 'static' });
    const correctModal = new bootstrap.Modal(document.getElementById('correctModal'), { backdrop: 'static' });
    const wrongModal = new bootstrap.Modal(document.getElementById('wrongModal'), { backdrop: 'static' });
    const quizContainer = document.getElementById('quiz-container');
    const nextBtn = document.getElementById('next-btn');
    const closeCorrectBtn = document.getElementById('close-correct-btn');
    const closeWrongBtn = document.getElementById('close-wrong-btn');
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');

    let currentQuestionIndex = 0;
    let selectedAnswer = null;

    const quizQuestions = [
        {
            question: "Where did you meet Mitko?",
            options: ["At the park", "In Genshin Impact", "In Fortnite", "In Roblox"],
            correctAnswer: "In Genshin Impact"
        },
        {
            question: "How old was Mitko when you met him?",
            options: ["14", "15", "13", "32"],
            correctAnswer: "13"
        },
        {
            question: "What is Mitko's favorite food?",
            options: ["Pancakes", "Pizza", "Sandwiches", "Oats"],
            correctAnswer: "Sandwiches"
        },
        {
            question: "What is Mitko's favorite color?",
            options: ["Red", "Blue", "Green", "Black"],
            correctAnswer: "Red"
        },
        {
            question: "How many kilograms does Mitko weigh?",
            options: ["75", "72", "78", "76"],
            correctAnswer: "76"
        },
        {
            question: "What's Mitko's favourite movie?",
            options: ["Interstellar", "Spiderman: No Way Home", "Godzilla", "Deadpool"],
            correctAnswer: "Interstellar"
        },
        {
            question: "How much does Mitko love you?",
            options: ["a lot", "a ton", "so much", "a very much humungous lot of tons"],
            correctAnswer: "a very much humungous lot of tons"
        },        
        {
            question: "How big is mitko's pp?",
            options: ["13cm", "15cm", "15.5cm", "16cm"],
            correctAnswer: "15.5cm"
        },
        {
            question: "What is Mitko’s favorite nickname for you?",
            options: ["Baby", "Princess", "Mommy", "Cutie"],
            correctAnswer: "Baby"
        },
        {
            question: "What's Mitko's favourite think of you?",
            options: ["Everything.", "Also everything", "Everything as well", "Definitely everything"],
            correctAnswer: "Everything."
        },    
        
    ];
    nextBtn.addEventListener('click', function () {
        const currentQuestion = quizQuestions[currentQuestionIndex];
    
        if (selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer) {
            // Show the correct answer modal, play confetti, and correct sound
            correctModal.show();
            playConfetti();
            correctSound.play();  // Play the correct answer sound
        } else {
            // Show the wrong answer modal, play emoji rain, and wrong sound
            wrongModal.show();
            playSadEmojiRain();
            wrongSound.play();  // Play the wrong answer sound
        }
    });
    

    function loadQuestion() {
        const currentQuestion = quizQuestions[currentQuestionIndex];
        quizContainer.innerHTML = `
            <p style="font-family: 'Caveat', cursive; font-size: 30px;">${currentQuestion.question}</p>
            <div id="options-container" class="text-center">
                ${currentQuestion.options.map(option => `<button class="btn btn-outline-primary quiz-option" data-answer="${option}" style="margin: 10px; font-family: 'Nerko One', cursive; background-color: #ff9aa2; border: none;">${option}</button>`).join('')}
            </div>
        `;

        selectedAnswer = null;
        nextBtn.disabled = true;

        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', function () {
                selectedAnswer = this.getAttribute('data-answer');
                nextBtn.disabled = false; // Enable next button after selection
            });
        });
    }

    startGameBtn.addEventListener('click', function () {
        currentQuestionIndex = 0;
        quizModal.show();
        loadQuestion();
    });

    nextBtn.addEventListener('click', function () {
        if (selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer) {
            // Show the correct answer modal and play confetti
            correctModal.show();
            playConfetti();
        } else {
            // Show the wrong answer modal and play emoji rain
            wrongModal.show();
            playSadEmojiRain();
        }
    });
    

closeCorrectBtn.addEventListener('click', function () {
    correctModal.hide(); // Close the correct answer modal
    score++; // Increment the score for correct answers
    document.getElementById('score').textContent = score; // Update the score on the UI
    updateProgressBar(); // Update the progress bar
    
    currentQuestionIndex++; // Move to the next question
    if (currentQuestionIndex < quizQuestions.length) {
        loadQuestion(); // Load the next question
    } else {
        // End of the game
        quizContainer.innerHTML = `<p style="font-family: 'Nerko One', cursive; font-size: 30px; color: #ff6f91; text-align: center;">GOOD JOB BABYYYY YOU DID IT!!!! 🎉</p>`;
        nextBtn.disabled = true;

        // Trigger the massive confetti explosion
        playEndConfetti();
    }
});
    

    function updateProgressBar() {
        const progressBar = document.getElementById('progress-bar');
        const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100; // Calculate progress percentage
        progressBar.style.width = `${progress}%`; // Update the width of the progress bar
    }
    
    
    
    closeWrongBtn.addEventListener('click', function () {
        wrongModal.hide(); // Close the wrong answer modal
        loadQuestion(); // Reload the same question for retry
    });
    
    

    function playConfetti() {
        var confettiCanvas = document.createElement('canvas'); // Create a new canvas
        confettiCanvas.style.position = 'fixed'; // Make sure it's fixed and covers the entire screen
        confettiCanvas.style.top = '0';
        confettiCanvas.style.left = '0';
        confettiCanvas.style.width = '100%';
        confettiCanvas.style.height = '100%';
        confettiCanvas.style.pointerEvents = 'none'; // Prevent interaction with the canvas
        confettiCanvas.style.zIndex = '9999'; // Set a very high z-index so it appears above everything
    
        document.body.appendChild(confettiCanvas);
    
        var myConfetti = confetti.create(confettiCanvas, {
            resize: true // Make sure confetti resizes with the window
        });
    
        // Fire the confetti
        myConfetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    
        // Remove the canvas after the confetti is done
        setTimeout(() => {
            confettiCanvas.remove();
        }, 3000); // Adjust the timing as needed
    }

    // Function to create the emoji rain effect
function playSadEmojiRain() {
    const body = document.body;

    // Create multiple emoji elements and animate them
    for (let i = 0; i < 50; i++) {
        const emoji = document.createElement('div');
        emoji.classList.add('sad-emoji');
        emoji.textContent = '😔';

        // Randomize the starting position of each emoji
        emoji.style.position = 'fixed';
        emoji.style.top = `${Math.random() * -20}vh`; // Start slightly off-screen
        emoji.style.left = `${Math.random() * 100}vw`; // Randomize horizontal position
        emoji.style.fontSize = `${Math.random() * 20 + 30}px`; // Vary sizes for more fun
        emoji.style.opacity = Math.random() * 0.8 + 0.2; // Vary opacity for realism
        emoji.style.zIndex = '9999'; // Ensure it appears above other content
        emoji.style.pointerEvents = 'none';

        body.appendChild(emoji);

        // Animate the emoji falling
        emoji.animate([
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(100vh)', opacity: 0 }
        ], {
            duration: Math.random() * 2000 + 3000, // Randomize duration between 3s and 5s
            easing: 'ease-in',
            iterations: 1
        });

        // Remove the emoji after animation ends
        setTimeout(() => {
            emoji.remove();
        }, 5000); // Adjust to match the animation duration
    }
}


    // Function to trigger massive confetti at the end of the game
function playEndConfetti() {

    var duration = 15 * 1000;
    var end = Date.now() + duration;

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.style.display = 'none'; // Hide the button
    }

    // Colors for school pride confetti
    var colors = ['#bb0000', '#ffffff'];

    // Fireworks confetti defaults
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    // Function for random range
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // "School Pride" confetti
    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
            zIndex: 9999
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());

    // "Fireworks" confetti
    var interval = setInterval(function () {
        var timeLeft = end - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);
        // Randomly position the confetti bursts
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}

let score = 0;
const totalQuestions = quizQuestions.length;

startGameBtn.addEventListener('click', function () {
    currentQuestionIndex = 0;
    score = 0; // Reset the score when the game starts
    document.getElementById('score').textContent = score;
    document.getElementById('total-questions').textContent = totalQuestions;
    document.getElementById('scoreboard').style.display = 'block'; // Show the scoreboard
    updateProgressBar(); // Initialize the progress bar
    quizModal.show();
    loadQuestion();
});


    
    
});


