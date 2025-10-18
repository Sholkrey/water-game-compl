// Game state variables
let gameRunning = false;
let score = 0;
let timeLeft = 30;
let dropInterval = null;
let obstacleInterval = null;
let gameTimer = null;
let currentDifficulty = 'normal';

// Milestone tracking
let achievedMilestones = new Set();

// Milestone messages
const milestoneMessages = {
    5: [
        "Great start! Keep it up! 💧",
        "You're getting the hang of it! 🌊",
        "Nice catches! 5 points already! ⭐"
    ],
    10: [
        "Halfway there! 🎯",
        "You're on fire! 10 points! 🔥",
        "Excellent progress! 💪"
    ],
    15: [
        "Almost there! Keep going! 🚀",
        "15 points! You're amazing! ⚡",
        "So close to victory! 🏆"
    ],
    20: [
        "20 points! Incredible! 🌟",
        "You're crushing it! 💯",
        "Outstanding performance! 🎉"
    ],
    25: [
        "25 points! Phenomenal! ✨",
        "You're a water-catching master! 👑",
        "Absolutely brilliant! 🏅"
    ],
    30: [
        "30 points! Legendary! 🦄",
        "Unbelievable skills! 🎪",
        "You're unstoppable! 💫"
    ],
    35: [
        "35 points! Beyond amazing! 🌈",
        "Superhuman performance! 🦸‍♀️",
        "You've transcended greatness! 🌠"
    ]
};

// Difficulty settings
const difficultySettings = {
    easy: {
        timeLimit: 60,
        winScore: 15,
        dropInterval: 800,
        obstacleInterval: 3000,
        scoreMultiplier: 1
    },
    normal: {
        timeLimit: 45,
        winScore: 25,
        dropInterval: 600,
        obstacleInterval: 2000,
        scoreMultiplier: 1
    },
    hard: {
        timeLimit: 30,
        winScore: 35,
        dropInterval: 400,
        obstacleInterval: 1500,
        scoreMultiplier: 1.5
    }
};

// Screen elements
const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const endScreen = document.getElementById('end-screen');

// Game elements
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const endMessage = document.getElementById('end-message');
const finalScoreDisplay = document.getElementById('final-score-display');
const playAgainBtn = document.getElementById('play-again-btn');

// Screen management
function showScreen(screenToShow) {
    [startScreen, playScreen, endScreen].forEach(screen => {
        screen.classList.add('hidden');
    });
    screenToShow.classList.remove('hidden');
}

// Initialize game
function initGame() {
    // Show start screen
    showScreen(startScreen);
    
    // Add event listeners
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);
    
    // Footer close functionality
    const footerCloseBtn = document.querySelector('.footer-close-btn');
    const charityFooter = document.getElementById('charity-footer');
    
    if (footerCloseBtn && charityFooter) {
        footerCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            charityFooter.classList.add('hidden');
        });
        
        // Optional: Add keyboard support
        footerCloseBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                charityFooter.classList.add('hidden');
            }
        });
    }
    
    // Difficulty selection
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        // Add keyboard accessibility
        btn.setAttribute('tabindex', '0');
        btn.setAttribute('role', 'button');
        
        btn.addEventListener('click', () => {
            selectDifficulty(btn);
        });
        
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectDifficulty(btn);
            }
        });
    });
    
    function selectDifficulty(selectedBtn) {
        // Remove selected class from all buttons
        difficultyBtns.forEach(b => {
            b.classList.remove('selected');
            b.setAttribute('aria-selected', 'false');
        });
        // Add selected class to clicked button
        selectedBtn.classList.add('selected');
        selectedBtn.setAttribute('aria-selected', 'true');
        // Set current difficulty
        currentDifficulty = selectedBtn.dataset.difficulty;
    }
}



// Start the game
function startGame() {
    if (gameRunning) return;
    
    const settings = difficultySettings[currentDifficulty];
    
    gameRunning = true;
    score = 0;
    timeLeft = settings.timeLimit;
    
    // Show play screen
    showScreen(playScreen);
    
    // Update displays
    updateScore();
    updateTimer();
    
    // Start drop creation with difficulty-based intervals
    dropInterval = setInterval(createDrop, settings.dropInterval);
    
    // Create obstacles less frequently
    obstacleInterval = setInterval(createObstacle, settings.obstacleInterval);
    
    // Start countdown timer
    gameTimer = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Create a new water drop
function createDrop() {
    const drop = document.createElement('div');
    drop.className = 'water-drop';
    
    // Randomly determine drop type (55% clean, 20% premium, 25% dirty)
    const rand = Math.random();
    let dropType;
    if (rand < 0.55) {
        dropType = 'clean';
    } else if (rand < 0.75) {
        dropType = 'premium';
    } else {
        dropType = 'dirty';
    }
    
    drop.classList.add(dropType);
    drop.dataset.type = dropType;
    
    // Random position across game width
    const gameWidth = gameContainer.offsetWidth;
    const xPosition = Math.random() * (gameWidth - 50);
    drop.style.left = xPosition + 'px';
    drop.style.top = '-50px';
    
    // Random fall speed (3-5 seconds)
    const fallDuration = 3 + Math.random() * 2;
    drop.style.animationDuration = fallDuration + 's';
    
    // Add click handler for direct interaction
    drop.addEventListener('click', (e) => {
        e.preventDefault();
        if (gameRunning) {
            clickDrop(drop, e);
        }
    });
    
    gameContainer.appendChild(drop);
    
    // Remove drop after animation ends (missed drops don't give points)
    drop.addEventListener('animationend', () => {
        if (drop.parentNode) {
            drop.remove();
        }
    });
}

// Create obstacle (pollution cloud)
function createObstacle() {
    if (!gameRunning) return;
    
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    obstacle.dataset.type = 'obstacle';
    
    // Random position across game width
    const gameWidth = gameContainer.offsetWidth;
    const xPosition = Math.random() * (gameWidth - 60);
    obstacle.style.left = xPosition + 'px';
    obstacle.style.top = '-60px';
    
    // Random fall speed (4-6 seconds)
    const fallDuration = 4 + Math.random() * 2;
    obstacle.style.animationDuration = fallDuration + 's';
    
    // Add click handler for obstacle
    obstacle.addEventListener('click', (e) => {
        e.preventDefault();
        if (gameRunning) {
            clickObstacle(obstacle, e);
        }
    });
    
    gameContainer.appendChild(obstacle);
    
    // Remove obstacle after animation ends
    obstacle.addEventListener('animationend', () => {
        if (obstacle.parentNode) {
            obstacle.remove();
        }
    });
}

// Handle direct click/tap on drop
function clickDrop(drop, event) {
    event.stopPropagation();
    const dropType = drop.dataset.type;
    const settings = difficultySettings[currentDifficulty];
    
    let basePoints;
    let isPositive;
    
    switch (dropType) {
        case 'clean':
            basePoints = 1;
            isPositive = true;
            break;
        case 'premium':
            basePoints = 2;
            isPositive = true;
            break;
        case 'dirty':
            basePoints = -1;
            isPositive = false;
            break;
        default:
            basePoints = 0;
            isPositive = false;
    }
    
    const points = Math.round(basePoints * settings.scoreMultiplier);
    
    score += points;
    updateScore();
    
    // Show floating score text
    showFloatingScore(points, drop.getBoundingClientRect());
    
    // Add visual feedback
    showClickEffect(drop.getBoundingClientRect());
    
    // Add particle effect for better visual feedback
    createParticleEffect(drop.getBoundingClientRect(), isPositive);
    
    // Remove the drop
    drop.remove();
}

// Handle direct click on obstacle
function clickObstacle(obstacle, event) {
    event.stopPropagation();
    const settings = difficultySettings[currentDifficulty];
    const points = Math.round(-2 * settings.scoreMultiplier); // Penalty for clicking obstacles
    
    score += points;
    updateScore();
    
    // Show floating score text
    showFloatingScore(points, obstacle.getBoundingClientRect());
    
    // Add visual feedback
    showClickEffect(obstacle.getBoundingClientRect());
    
    // Add particle effect
    createParticleEffect(obstacle.getBoundingClientRect(), false);
    
    // Remove the obstacle
    obstacle.remove();
}

// Show floating score animation
function showFloatingScore(points, dropRect) {
    const floatingText = document.createElement('div');
    floatingText.className = `floating-score ${points > 0 ? 'positive' : 'negative'}`;
    
    // Different text based on interaction type and points
    if (points >= 3) {
        floatingText.textContent = `+${points} � PREMIUM!`;
    } else if (points === 2) {
        floatingText.textContent = `+${points} 💙`;
    } else if (points === 1) {
        floatingText.textContent = `+${points} 💧`;
    } else if (points <= -2) {
        floatingText.textContent = `${points} ☁️`;
    } else if (points < 0) {
        floatingText.textContent = `${points}`;
    } else {
        floatingText.textContent = `+${points}`;
    }
    
    // Position at drop location
    const gameRect = gameContainer.getBoundingClientRect();
    floatingText.style.left = (dropRect.left - gameRect.left) + 'px';
    floatingText.style.top = (dropRect.top - gameRect.top) + 'px';
    
    gameContainer.appendChild(floatingText);
    
    // Remove after animation
    setTimeout(() => {
        if (floatingText.parentNode) {
            floatingText.remove();
        }
    }, 1000);
}

// Show click effect animation
function showClickEffect(elementRect) {
    const clickEffect = document.createElement('div');
    clickEffect.className = 'click-effect';
    
    // Position at clicked element location
    const gameRect = gameContainer.getBoundingClientRect();
    clickEffect.style.left = (elementRect.left - gameRect.left - 50) + 'px';
    clickEffect.style.top = (elementRect.top - gameRect.top - 50) + 'px';
    
    gameContainer.appendChild(clickEffect);
    
    // Remove after animation
    setTimeout(() => {
        if (clickEffect.parentNode) {
            clickEffect.remove();
        }
    }, 600);
}

// Create confetti effect
function createConfetti() {
    const colors = ['#FFC907', '#4FCB53', '#2E9DF7', '#FF902A', '#F5402C'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            
            document.body.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.remove();
                }
            }, 4000);
        }, i * 20);
    }
}

// End the game
function endGame() {
    gameRunning = false;
    
    // Clear intervals
    clearInterval(dropInterval);
    clearInterval(obstacleInterval);
    clearInterval(gameTimer);
    
    // Remove all remaining elements
    const drops = gameContainer.querySelectorAll('.water-drop');
    const obstacles = gameContainer.querySelectorAll('.obstacle');
    const milestones = gameContainer.querySelectorAll('.milestone-notification');
    const flashes = document.querySelectorAll('.milestone-flash');
    drops.forEach(drop => drop.remove());
    obstacles.forEach(obstacle => obstacle.remove());
    milestones.forEach(milestone => milestone.remove());
    flashes.forEach(flash => flash.remove());
    
    // Show end screen
    showEndScreen();
}

// Show end screen with results
function showEndScreen() {
    const settings = difficultySettings[currentDifficulty];
    const isWin = score >= settings.winScore;
    
    if (isWin) {
        endMessage.textContent = "Amazing! You've helped bring clean water to those in need! 💧";
        // Trigger confetti celebration for wins!
        createConfetti();
    } else {
        endMessage.textContent = `You need ${settings.winScore} points to win. Keep trying to help more people get clean water!`;
    }
    
    finalScoreDisplay.textContent = score;
    
    showScreen(endScreen);
}

// Reset game for replay
function resetGame() {
    const settings = difficultySettings[currentDifficulty];
    
    // Reset game state
    score = 0;
    timeLeft = settings.timeLimit;
    gameRunning = false;
    achievedMilestones.clear(); // Reset milestones
    
    // Reset displays
    updateScore();
    updateTimer();
    
    // Show start screen
    showScreen(startScreen);
    
    // Clear any remaining elements
    const drops = gameContainer.querySelectorAll('.water-drop');
    const obstacles = gameContainer.querySelectorAll('.obstacle');
    const floatingTexts = gameContainer.querySelectorAll('.floating-score');
    const clickEffects = gameContainer.querySelectorAll('.click-effect');
    const particles = gameContainer.querySelectorAll('.particle');
    const milestones = gameContainer.querySelectorAll('.milestone-notification');
    const flashes = document.querySelectorAll('.milestone-flash');
    drops.forEach(drop => drop.remove());
    obstacles.forEach(obstacle => obstacle.remove());
    floatingTexts.forEach(text => text.remove());
    clickEffects.forEach(effect => effect.remove());
    particles.forEach(particle => particle.remove());
    milestones.forEach(milestone => milestone.remove());
    flashes.forEach(flash => flash.remove());
}

// Update score display with visual feedback
function updateScore() {
    const oldScore = parseInt(scoreDisplay.textContent) || 0;
    scoreDisplay.textContent = score;
    
    // Check for milestones only when score increases
    if (score > oldScore) {
        checkMilestones(score);
    }
    
    // Add pulse effect to score
    scoreDisplay.classList.remove('score-pulse');
    void scoreDisplay.offsetWidth; // Trigger reflow
    scoreDisplay.classList.add('score-pulse');
    
    // Remove pulse class after animation
    setTimeout(() => {
        scoreDisplay.classList.remove('score-pulse');
    }, 300);
}

// Update timer display
function updateTimer() {
    timeDisplay.textContent = timeLeft;
}

// Check and display milestones
function checkMilestones(newScore) {
    // Check each milestone
    for (const milestone of Object.keys(milestoneMessages)) {
        const milestoneScore = parseInt(milestone);
        
        // If we've reached this milestone and haven't shown it yet
        if (newScore >= milestoneScore && !achievedMilestones.has(milestoneScore)) {
            achievedMilestones.add(milestoneScore);
            
            // Get a random message for this milestone
            const messages = milestoneMessages[milestoneScore];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            
            // Display the milestone
            showMilestone(randomMessage, milestoneScore);
            
            // Only show one milestone at a time
            break;
        }
    }
}

// Display milestone achievement
function showMilestone(message, milestoneScore) {
    const milestone = document.createElement('div');
    milestone.className = 'milestone-notification';
    milestone.innerHTML = `
        <div class="milestone-header">Milestone Reached!</div>
        <div class="milestone-score">${milestoneScore} Points</div>
        <div class="milestone-message">${message}</div>
    `;
    
    // Position in center of game container
    gameContainer.appendChild(milestone);
    
    // Add screen flash effect for celebration
    createMilestoneFlash();
    
    // Add animation class after a brief delay for CSS transition
    setTimeout(() => {
        milestone.classList.add('show');
    }, 50);
    
    // Remove after 3 seconds
    setTimeout(() => {
        milestone.classList.add('hide');
        setTimeout(() => {
            if (milestone.parentNode) {
                milestone.remove();
            }
        }, 500);
    }, 3000);
}

// Create a brief screen flash for milestone celebration
function createMilestoneFlash() {
    const flash = document.createElement('div');
    flash.className = 'milestone-flash';
    document.body.appendChild(flash);
    
    // Remove after animation
    setTimeout(() => {
        if (flash.parentNode) {
            flash.remove();
        }
    }, 300);
}

// Create particle effect for better visual feedback
function createParticleEffect(elementRect, isPositive) {
    const colors = isPositive ? ['#4FCB53', '#2E9DF7', '#FFC907'] : ['#F5402C', '#666', '#333'];
    const particleCount = isPositive ? 8 : 6;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random color from the appropriate palette
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Position at element location
        const gameRect = gameContainer.getBoundingClientRect();
        const centerX = (elementRect.left - gameRect.left) + (elementRect.width / 2);
        const centerY = (elementRect.top - gameRect.top) + (elementRect.height / 2);
        
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        
        // Random direction and speed
        const angle = (i / particleCount) * Math.PI * 2;
        const speed = 20 + Math.random() * 30;
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;
        
        particle.style.setProperty('--dx', dx + 'px');
        particle.style.setProperty('--dy', dy + 'px');
        
        gameContainer.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 800);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);
