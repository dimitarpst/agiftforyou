document.addEventListener("DOMContentLoaded", function () {
    const flowerContainer = document.getElementById("flower-container");
    const starContainer = document.getElementById("star-container");
    const enterButton = document.getElementById('enter-btn');
    let starsGenerated = false; // To track if the stars have already been created

    function createFlower() {
        const flower = document.createElement('div');
        flower.classList.add('flower');
        flower.style.left = `${Math.random() * 100}vw`;
        flower.style.animationDuration = `${Math.random() * 3 + 3}s`;
        flowerContainer.appendChild(flower);
        setTimeout(() => {
            flower.remove();
        }, 6000);
    }
    setInterval(createFlower, 500);
    function createStar() {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        const duration = Math.random() * 15 + 5; // Between 5s and 20s
        star.style.animationDuration = `3s, ${duration}s`;  // Twinkle + moveStar duration
        star.style.animationDelay = `${Math.random() * 5}s, 0s`;  // Random start delay for twinkle
        starContainer.appendChild(star);
        setTimeout(() => {
            star.remove();
        }, duration * 1000);
    }

    function generateStars() {
        if (!starsGenerated) {
            for (let i = 0; i < 100; i++) {
                createStar();
            }
            setInterval(createStar, 2000);
            starsGenerated = true;
        }
    }

    const quizAnswers = document.querySelectorAll('.quiz-answer');
    const quizFeedback = document.getElementById('quiz-feedback');

    quizAnswers.forEach(answer => {
        answer.addEventListener('click', function() {
            const isCorrect = this.getAttribute('data-answer') === 'correct';
            if (isCorrect) {
                quizFeedback.textContent = "Correct! You know me well, baby!";
            } else {
                quizFeedback.textContent = "Oops, not quite! Try again, princess!";
            }
        });
    });

    document.addEventListener('scroll', function () {
        const fadeElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-top');
        fadeElements.forEach(function (el) {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top < windowHeight && rect.bottom > 0) {
                el.classList.add('in-view');
            } else {
                el.classList.remove('in-view');
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const flowerContainer = document.getElementById("flower-container");
    const starContainer = document.getElementById("star-container");
    const enterButton = document.getElementById('enter-btn');
    let starsGenerated = false; // To track if the stars have already been created
    const heartParticles = document.getElementById('heart-particles');
    let particlesInitialized = false; // Ensure particles are only initialized once
    
    // Initialize particles.js only when scrolling into #reasons
    function initializeHeartParticles() {
        if (!particlesInitialized) {
            particlesJS("heart-particles", {
                "particles": {
                    "number": {
                        "value": 50, // Adjust the number of particles
                        "density": {
                            "enable": true,
                            "value_area": 800
                        }
                    },
                    "shape": {
                        "type": "image",
                        "image": {
                            "src": "pictures/heart.png", // Replace with your heart image path
                            "width": 100,
                            "height": 100
                        }
                    },
                    "opacity": {
                        "value": 0.7,
                        "random": true
                    },
                    "size": {
                        "value": 10,
                        "random": true
                    },
                    "move": {
                        "speed": 2,
                        "direction": "none",
                        "out_mode": "out"
                    }
                },
                "interactivity": {
                    "events": {
                        "onhover": {
                            "enable": true,
                            "mode": "repulse" // Add hover repulse effect here
                        }
                    },
                    "modes": {
                        "repulse": {
                            "distance": 100,
                            "duration": 0.4
                        }
                    }
                },
                "retina_detect": true
            });
            particlesInitialized = true;
        }
    }

    // Function to handle scrolling into and out of #reasons section
    function handleScroll() {
        const reasonsSection = document.getElementById('reasons');
        const rect = reasonsSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight && rect.bottom > 0) {
            // The #reasons section is in view, show heart particles
            heartParticles.classList.add('active'); // Fade in
            initializeHeartParticles();
        } else {
            // The #reasons section is out of view, fade out heart particles
            heartParticles.classList.remove('active'); // Fade out
        }
    }

    // Listen to scroll events to trigger fade-in/out for heart particles
    document.addEventListener('scroll', handleScroll);

    // Existing star generation logic
    function createStar() {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        const duration = Math.random() * 15 + 5; // Between 5s and 20s
        star.style.animationDuration = `3s, ${duration}s`;  // Twinkle + moveStar duration
        star.style.animationDelay = `${Math.random() * 5}s, 0s`;  // Random start delay for twinkle
        starContainer.appendChild(star);
        setTimeout(() => {
            star.remove();
        }, duration * 1000);
    }

    function generateStars() {
        if (!starsGenerated) {
            for (let i = 0; i < 100; i++) {
                createStar();
            }
            setInterval(createStar, 2000);
            starsGenerated = true; // Prevent generating stars again
        }
    }

    enterButton.addEventListener('click', function() {
        document.getElementById('scroll-love-story').scrollIntoView({ behavior: 'smooth' });
        generateStars(); // Trigger star animation when button is pressed
    });

    const quizAnswers = document.querySelectorAll('.quiz-answer');
    const quizFeedback = document.getElementById('quiz-feedback');

    quizAnswers.forEach(answer => {
        answer.addEventListener('click', function() {
            const isCorrect = this.getAttribute('data-answer') === 'correct';
            if (isCorrect) {
                quizFeedback.textContent = "Correct! You know me well, baby!";
            } else {
                quizFeedback.textContent = "Oops, not quite! Try again, princess!";
            }
        });
    });

    document.addEventListener('scroll', function () {
        const fadeElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-top');
        fadeElements.forEach(function (el) {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top < windowHeight && rect.bottom > 0) {
                el.classList.add('in-view');
            } else {
                el.classList.remove('in-view');
            }
        });
    });
});

// Initialize Particles.js for the #love-story avocado particles
function initializeAvocadoParticles() {
    particlesJS("avocado-particles", {
        "particles": {
            "number": {
                "value": 40, // Adjust the number of particles (avocados)
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "shape": {
                "type": "image",
                "image": {
                    "src": "pictures/avocado.png", // Path to avocado image
                    "width": 100,
                    "height": 100
                }
            },
            "opacity": {
                "value": 0.8,
                "random": true
            },
            "size": {
                "value": 20,
                "random": true
            },
            "move": {
                "speed": 3,
                "direction": "none",
                "out_mode": "out"
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse" // Interaction when hovering over particles
                },
                "onclick": {
                    "enable": true,
                    "mode": "push" // Add more particles when clicking
                }
            },
            "modes": {
                "repulse": {
                    "distance": 100,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4 // Number of particles added on click
                }
            }
        },
        "retina_detect": true
    });
}

// Call the avocado particle system when the page loads
document.addEventListener("DOMContentLoaded", function () {
    initializeAvocadoParticles();
});

document.addEventListener('DOMContentLoaded', function () {
    const stickyNotes = document.querySelectorAll('.sticky-note');
    
    stickyNotes.forEach(note => {
        note.addEventListener('click', function () {
            this.classList.toggle('flipped');
            const back = this.querySelector('.note-back');
            if (!back.innerHTML.trim()) {
                const message = this.getAttribute('data-message');
                back.innerHTML = `<p>${message}</p>`;
            }
            // Trigger hearts flying animation
            createFlyingHearts(this);
        });
    });

    // Function to create flying hearts
    function createFlyingHearts(note) {
        const heartContainer = document.getElementById('heart-container');
        const colors = ['pink', 'red', 'purple', 'blue', 'yellow']; // Random heart colors
        for (let i = 0; i < 50; i++) {
            const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            heart.classList.add('heart', colors[Math.floor(Math.random() * colors.length)]); // Assign random color class

            // SVG heart shape
            heart.innerHTML = `<path d="M24 4c-4.4 0-8 3.6-8 8 0 1.6 0.5 3.1 1.3 4.3L24 28l6.7-11.7c0.8-1.2 1.3-2.7 1.3-4.3 0-4.4-3.6-8-8-8z"></path>`;
            heart.setAttribute('viewBox', '0 0 48 48');
            heart.setAttribute('width', '50');
            heart.setAttribute('height', '50');

            // Randomize heart position near the note
            const x = Math.random() * note.offsetWidth;
            const y = Math.random() * note.offsetHeight;
            heart.style.left = `${note.offsetLeft + x}px`;
            heart.style.top = `${note.offsetTop + y}px`;

            heartContainer.appendChild(heart);

            // Remove the heart after the animation ends
            setTimeout(() => {
                heart.remove();
            }, 2000);
        }
    }
});

