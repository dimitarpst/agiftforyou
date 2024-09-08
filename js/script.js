document.addEventListener("DOMContentLoaded", function () {
    const flowerContainer = document.getElementById("flower-container");
    const starContainer = document.getElementById("star-container");
    const enterButton = document.getElementById('enter-btn');
    let starsGenerated = false;
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
        const duration = Math.random() * 15 + 5;
        star.style.animationDuration = `3s, ${duration}s`;
        star.style.animationDelay = `${Math.random() * 5}s, 0s`;
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
    let starsGenerated = false;
    const heartParticles = document.getElementById('heart-particles');
    let particlesInitialized = false;
    
    function initializeHeartParticles() {
        if (!particlesInitialized) {
            particlesJS("heart-particles", {
                "particles": {
                    "number": {
                        "value": 50,
                        "density": {
                            "enable": true,
                            "value_area": 800
                        }
                    },
                    "shape": {
                        "type": "image",
                        "image": {
                            "src": "pictures/heart.png",
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
                            "mode": "repulse"
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

  
    function handleScroll() {
        const reasonsSection = document.getElementById('reasons');
        const rect = reasonsSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight && rect.bottom > 0) {

            heartParticles.classList.add('active');
            initializeHeartParticles();
        } else {
        
            heartParticles.classList.remove('active');
        }
    }

    document.addEventListener('scroll', handleScroll);
    function createStar() {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        const duration = Math.random() * 15 + 5;
        star.style.animationDuration = `3s, ${duration}s`;
        star.style.animationDelay = `${Math.random() * 5}s, 0s`;
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

    enterButton.addEventListener('click', function() {
        document.getElementById('scroll-love-story').scrollIntoView({ behavior: 'smooth' });
        generateStars();
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

function initializeAvocadoParticles() {
    particlesJS("avocado-particles", {
        "particles": {
            "number": {
                "value": 40,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "shape": {
                "type": "image",
                "image": {
                    "src": "pictures/avocado.png",
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
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                }
            },
            "modes": {
                "repulse": {
                    "distance": 100,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                }
            }
        },
        "retina_detect": true
    });
}

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
            createFlyingHearts(this);
        });
    });

    function createFlyingHearts(note) {
        const heartContainer = document.getElementById('heart-container');
        const colors = ['pink', 'red', 'purple', 'blue', 'yellow'];
        for (let i = 0; i < 50; i++) {
            const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            heart.classList.add('heart', colors[Math.floor(Math.random() * colors.length)]); 
            heart.innerHTML = `<path d="M24 4c-4.4 0-8 3.6-8 8 0 1.6 0.5 3.1 1.3 4.3L24 28l6.7-11.7c0.8-1.2 1.3-2.7 1.3-4.3 0-4.4-3.6-8-8-8z"></path>`;
            heart.setAttribute('viewBox', '0 0 48 48');
            heart.setAttribute('width', '50');
            heart.setAttribute('height', '50');
            const x = Math.random() * note.offsetWidth;
            const y = Math.random() * note.offsetHeight;
            heart.style.left = `${note.offsetLeft + x}px`;
            heart.style.top = `${note.offsetTop + y}px`;
            heartContainer.appendChild(heart);
            setTimeout(() => {
                heart.remove();
            }, 2000);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    function updateTimeTogether() {
        const startDate = new Date('September 8, 2022 01:23:00');
        const now = new Date();
        let diff = now - startDate;
        let years = now.getFullYear() - startDate.getFullYear();
        let months = now.getMonth() - startDate.getMonth();
        let days = now.getDate() - startDate.getDate();
        let hours = now.getHours() - startDate.getHours();
        let minutes = now.getMinutes() - startDate.getMinutes();
        let seconds = now.getSeconds() - startDate.getSeconds();

        if (seconds < 0) {
            seconds += 60;
            minutes--;
        }
        if (minutes < 0) {
            minutes += 60;
            hours--;
        }
        if (hours < 0) {
            hours += 24;
            days--;
        }
        if (days < 0) {
            const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            days += previousMonth;
            months--;
        }
        if (months < 0) {
            months += 12;
            years--;
        }

        document.getElementById('time-counter').textContent = `${years} years ${months} months ${days} days ${hours} hours ${minutes} minutes ${seconds} seconds.`;
    }

    setInterval(updateTimeTogether, 1000);
    updateTimeTogether();
});


