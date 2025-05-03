document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const ball = document.getElementById('ball');
    const gameArea = document.getElementById('game-area');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const timeLeftDisplay = document.getElementById('time-left');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const difficultySelect = document.getElementById('difficulty-select');

    // Game State
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let timeLeft = 30;
    let gameInterval;
    let timerInterval;
    let isGameRunning = false;
    let ballSpeed = 1000;
    let ballVisibleTime = 1500;
    let speedDecrement;

    // Initialize high score display
    highScoreDisplay.textContent = highScore;

    // Game functions
    function startGame() {
        if (isGameRunning) return;
        // Clear any existing intervals
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        isGameRunning = true;
        score = 0;
        timeLeft = 30;
        scoreDisplay.textContent = score;
        timeLeftDisplay.textContent = timeLeft;

        // Reset visual states
        document.querySelectorAll('.stat-value').forEach(el => {
            el.style.color = '#2ecc71';
        });

        // Set initial difficulty
        setDifficulty();

        gameInterval = setInterval(moveBall, ballSpeed);

        timerInterval = setInterval(() => {
            timeLeft--;
            timeLeftDisplay.textContent = timeLeft;

            // Time warning effect
            if (timeLeft <= 10) {
                timeLeftDisplay.style.color = '#e74c3c';
            }

            if (timeLeft <= 0) endGame();
        }, 1000);
    }

    function moveBall() {
        if (!isGameRunning || ball.style.display === 'block') return;
        const gameAreaRect = gameArea.getBoundingClientRect();
        const ballSize = 30;
        if (gameAreaRect.width < 50 || gameAreaRect.height < 50) {
            console.error('Game area too small');
            return;
        }
        const maxX = gameAreaRect.width - ballSize - 30;
        const maxY = gameAreaRect.height - ballSize - 30;

        const randomX = Math.floor(Math.random() * maxX) + 15;
        const randomY = Math.floor(Math.random() * maxY) + 15;

        ball.style.left = `${randomX}px`;
        ball.style.top = `${randomY}px`;
        ball.style.display = 'block';

        // Add random disappearance time variation
        const visibleVariation = Math.random() * 0.2 * ballVisibleTime;
        const currentVisibleTime = ballVisibleTime - visibleVariation;
        
        
        const missTimeout = setTimeout(() => {
            if (ball.style.display === 'block') {
                ball.classList.add('miss-effect');
                setTimeout(() => {
                    ball.classList.remove('miss-effect');
                    ball.style.display = 'none';
                }, 500);
            }
        }, currentVisibleTime);
        
        ball.currentTimeout = missTimeout;

        // console.log(missTimeout);

        // console.log(
        //     `Ball state: speed=${ballSpeed}ms, visible=${ballVisibleTime}ms, ratio=${ballVisibleTime / ballSpeed}`
        // );
    }

    function endGame() {
        isGameRunning = false;
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        ball.style.display = 'none';

        // Visual feedback
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreDisplay.textContent = highScore;
            highScoreDisplay.classList.add('celebrate');
            setTimeout(() => highScoreDisplay.classList.remove('celebrate'), 1000);
        }

        // Reset time color
        timeLeftDisplay.style.color = '#2ecc71';
    }

    function resetGame() {
        endGame();
        score = 0;
        timeLeft = 30;
        scoreDisplay.textContent = score;
        timeLeftDisplay.textContent = timeLeft;
        highScoreDisplay.textContent = highScore;
        ball.style.display = 'none';
        document.querySelectorAll('.stat-value').forEach(el => {
            el.style.color = '#2ecc71';
        });
    }

    // A helper function for difficulty settings
    function setDifficulty() {
        const difficulties = {
            easy: {
                speed: 1500,  // Ball appears every 1.5 seconds
                visible: 2000, // Stays visible for 2 seconds
                decrement: 30  // Smaller difficulty increase
            },
            medium: {
                speed: 1200,
                visible: 1500,
                decrement: 50
            },
            hard: {
                speed: 900,
                visible: 1000,
                decrement: 70
            }
        };

        const selected = difficultySelect.value;

        if (!difficulties[selected]) {
            console.error('Invalid difficulty selected');
            return;
        }

        const { speed, visible, decrement } = difficulties[difficultySelect.value];
        ballSpeed = speed;
        ballVisibleTime = visible;
        speedDecrement = decrement;

        if (isGameRunning) {
            clearInterval(gameInterval);
            gameInterval = setInterval(moveBall, ballSpeed);
        }
    }

    // Event listeners
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', () => {
        localStorage.removeItem('highScore');
        highScore = 0;
        highScoreDisplay.textContent = '0';
        resetGame();
    });
    difficultySelect.addEventListener('change', setDifficulty);
    ball.addEventListener('click', () => {
        if (!isGameRunning) return;

        clearTimeout(ball.currentTimeout);
        ball.classList.add('click-effect');
        setTimeout(() => ball.classList.remove('click-effect'), 300);

        score++;
        scoreDisplay.textContent = score;
        ball.style.display = 'none';

        // Smoother difficulty progression
        if (score % 3 === 0) {
            ballSpeed = Math.max(600, ballSpeed - speedDecrement);
            ballVisibleTime = Math.max(800, ballVisibleTime - speedDecrement);
            // Enforce minimum visibility window
            const minVisibilityWindow = 300;
            if (ballVisibleTime < minVisibilityWindow) {
                ballSpeed += minVisibilityWindow;
                ballVisibleTime = minVisibilityWindow;
            }

            clearInterval(gameInterval);
            gameInterval = setInterval(moveBall, ballSpeed);

            // Ensure ballVisibleTime is always shorter than ballSpeed
            if (ballVisibleTime >= ballSpeed) {
                ballVisibleTime = ballSpeed - 200;
            }
        }
    });

});