// Game state variables
let gameRunning = false;
let score = 0;
let timeLeft = 30;
let dropInterval = null;
let obstacleInterval = null;
let gameTimer = null;

// Screen elements
const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const endScreen = document.getElementById('end-screen');

// Game elements
const gameContainer = document.getElementById('game-container');
const bucket = document.getElementById('bucket');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const endMessage = document.getElementById('end-message');
const finalScoreDisplay = document.getElementById('final-score-display');
const playAgainBtn = document.getElementById('play-again-btn');

// Bucket movement variables
let bucketPosition = 50; // Starting position (percentage)
const bucketSpeed = 2; // Speed as percentage
let keys = {};

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
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Mouse controls
    playScreen.addEventListener('mousemove', (e) => {
        if (!gameRunning) return;
        
        const rect = gameContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const containerWidth = rect.width;
        const bucketWidth = 80;
        
        // Convert to percentage
        bucketPosition = ((mouseX - bucketWidth/2) / (containerWidth - bucketWidth)) * 100;
        bucketPosition = Math.max(0, Math.min(100, bucketPosition));
        bucket.style.left = bucketPosition + '%';
    });
    
    // Start keyboard movement loop
    requestAnimationFrame(updateBucketPosition);
}

// Update bucket position based on keyboard input
function updateBucketPosition() {
    if (gameRunning) {
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            bucketPosition = Math.max(0, bucketPosition - bucketSpeed);
            bucket.style.left = bucketPosition + '%';
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            bucketPosition = Math.min(100, bucketPosition + bucketSpeed);
            bucket.style.left = bucketPosition + '%';
        }
    }
    requestAnimationFrame(updateBucketPosition);
}

// Start the game
function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    score = 0;
    timeLeft = 30;
    bucketPosition = 50; // Reset bucket to center
    
    // Show play screen
    showScreen(playScreen);
    
    // Update displays
    updateScore();
    updateTimer();
    
    // Reset bucket position
    bucket.style.left = bucketPosition + '%';
    
    // Start drop creation (clean drops and obstacles)
    dropInterval = setInterval(createDrop, 600); // Create drop every 600ms
    
    // Create obstacles less frequently
    obstacleInterval = setInterval(createObstacle, 2000); // Create obstacle every 2 seconds
    
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
    
    // Randomly determine if drop is clean or dirty (70% clean, 30% dirty)
    const isClean = Math.random() > 0.3;
    drop.classList.add(isClean ? 'clean' : 'dirty');
    drop.dataset.type = isClean ? 'clean' : 'dirty';
    
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
    
    // Check for collision during fall
    const collisionChecker = setInterval(() => {
        if (!gameRunning || !drop.parentNode) {
            clearInterval(collisionChecker);
            return;
        }
        
        if (checkCollision(drop, bucket)) {
            clearInterval(collisionChecker);
            catchDrop(drop);
        }
    }, 50);
    
    // Remove drop after animation ends
    drop.addEventListener('animationend', () => {
        clearInterval(collisionChecker);
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
    
    // Check for collision during fall
    const collisionChecker = setInterval(() => {
        if (!gameRunning || !obstacle.parentNode) {
            clearInterval(collisionChecker);
            return;
        }
        
        if (checkCollision(obstacle, bucket)) {
            clearInterval(collisionChecker);
            catchObstacle(obstacle);
        }
    }, 50);
    
    // Remove obstacle after animation ends
    obstacle.addEventListener('animationend', () => {
        clearInterval(collisionChecker);
        if (obstacle.parentNode) {
            obstacle.remove();
        }
    });
}

// Check collision between drop and bucket
function checkCollision(drop, bucket) {
    const dropRect = drop.getBoundingClientRect();
    const bucketRect = bucket.getBoundingClientRect();
    
    return dropRect.left < bucketRect.right &&
           dropRect.right > bucketRect.left &&
           dropRect.bottom > bucketRect.top &&
           dropRect.top < bucketRect.bottom;
}

// Handle drop catch
function catchDrop(drop) {
    const isClean = drop.dataset.type === 'clean';
    const points = isClean ? 1 : -1;
    
    score += points;
    updateScore();
    
    // Show floating score text
    showFloatingScore(points, drop.getBoundingClientRect());
    
    // Add visual feedback
    showClickEffect(drop.getBoundingClientRect());
    
    // Remove the drop
    drop.remove();
}

// Handle direct click on drop
function clickDrop(drop, event) {
    event.stopPropagation();
    const isClean = drop.dataset.type === 'clean';
    const points = isClean ? 2 : -1; // Bonus point for clicking directly!
    
    score += points;
    updateScore();
    
    // Show floating score text
    showFloatingScore(points, drop.getBoundingClientRect());
    
    // Add visual feedback
    showClickEffect(drop.getBoundingClientRect());
    
    // Remove the drop
    drop.remove();
}

// Handle obstacle catch
function catchObstacle(obstacle) {
    const points = -2; // Obstacles reduce score by 2
    
    score += points;
    updateScore();
    
    // Show floating score text
    showFloatingScore(points, obstacle.getBoundingClientRect());
    
    // Add visual feedback
    showClickEffect(obstacle.getBoundingClientRect());
    
    // Remove the obstacle
    obstacle.remove();
}

// Handle direct click on obstacle
function clickObstacle(obstacle, event) {
    event.stopPropagation();
    const points = -1; // Less penalty for clicking obstacle directly
    
    score += points;
    updateScore();
    
    // Show floating score text
    showFloatingScore(points, obstacle.getBoundingClientRect());
    
    // Add visual feedback
    showClickEffect(obstacle.getBoundingClientRect());
    
    // Remove the obstacle
    obstacle.remove();
}

// Show floating score animation
function showFloatingScore(points, dropRect) {
    const floatingText = document.createElement('div');
    floatingText.className = `floating-score ${points > 0 ? 'positive' : 'negative'}`;
    
    // Different text based on interaction type
    if (points === 2) {
        floatingText.textContent = `+${points} 💧 BONUS!`;
    } else if (points === 1) {
        floatingText.textContent = `+${points} 💧`;
    } else if (points === -2) {
        floatingText.textContent = `${points} ☁️`;
    } else {
        floatingText.textContent = `${points}`;
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
    drops.forEach(drop => drop.remove());
    obstacles.forEach(obstacle => obstacle.remove());
    
    // Show end screen
    showEndScreen();
}

// Show end screen with results
function showEndScreen() {
    const isWin = score > 10;
    
    if (isWin) {
        endMessage.textContent = "Great job! You caught lots of clean water! 💧";
        // Trigger confetti celebration for wins!
        createConfetti();
    } else {
        endMessage.textContent = "Oh no! Many people still need clean water. Try again!";
    }
    
    finalScoreDisplay.textContent = score;
    
    showScreen(endScreen);
}

// Reset game for replay
function resetGame() {
    // Reset game state
    score = 0;
    timeLeft = 30;
    gameRunning = false;
    bucketPosition = 50;
    
    // Reset displays
    updateScore();
    updateTimer();
    
    // Reset bucket position
    bucket.style.left = bucketPosition + '%';
    
    // Show start screen
    showScreen(startScreen);
    
    // Clear any remaining elements
    const drops = gameContainer.querySelectorAll('.water-drop');
    const obstacles = gameContainer.querySelectorAll('.obstacle');
    const floatingTexts = gameContainer.querySelectorAll('.floating-score');
    const clickEffects = gameContainer.querySelectorAll('.click-effect');
    drops.forEach(drop => drop.remove());
    obstacles.forEach(obstacle => obstacle.remove());
    floatingTexts.forEach(text => text.remove());
    clickEffects.forEach(effect => effect.remove());
}

// Update score display with visual feedback
function updateScore() {
    scoreDisplay.textContent = score;
    
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

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);
