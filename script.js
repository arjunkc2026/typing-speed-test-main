const passages = {
    easy: [
        "The cat sat on the mat. The dog played in the yard. The sun was bright and warm. The birds sang in the trees. It was a beautiful day.",
        "She walked to the store. The store had many items. She bought some bread and milk. Then she walked back home. It was a short trip."
    ],
    medium: [
        "Technology has transformed the way we communicate. Social media platforms connect people across the globe instantly. However, this constant connectivity raises questions about privacy and mental health.",
        "Climate change poses significant challenges for future generations. Rising temperatures affect ecosystems worldwide. Scientists emphasize the importance of sustainable practices and renewable energy sources."
    ],
    hard: [
        "The archaeological expedition unearthed artifacts that complicated prevailing theories about Bronze Age trade networks. Obsidian from Anatolia, lapis lazuli from Afghanistan, and amber from the Baltic—all discovered in a single Mycenaean tomb—suggested commercial connections far more extensive than previously hypothesized. \"We've underestimated ancient peoples' navigational capabilities and their appetite for luxury goods,\" the lead researcher observed. \"Globalization isn't as modern as we assume.\"",
        "Quantum entanglement demonstrates the peculiar nature of subatomic particles. When two particles become entangled, measuring one instantaneously affects the other, regardless of the distance separating them. Einstein famously called this phenomenon \"spooky action at a distance,\" questioning whether quantum mechanics provided a complete description of physical reality. Despite his skepticism, subsequent experiments have consistently validated quantum theory's predictions."
    ]
};

let currentDifficulty = 'hard';
let currentMode = 'timed';
let currentText = '';
let currentCharIndex = 0;
let startTime = null;
let timerInterval = null;
let timeLeft = 60;
let isTestActive = false;
let correctChars = 0;
let incorrectChars = 0;
let personalBestWPM = 0;

// Load personal best from storage
const savedBest = localStorage.getItem('personalBest');
if (savedBest) {
    personalBestWPM = parseInt(savedBest);
    document.getElementById('personalBest').textContent = `${personalBestWPM} WPM`;
}

function getRandomPassage() {
    const passages_list = passages[currentDifficulty];
    return passages_list[Math.floor(Math.random() * passages_list.length)];
}

function initializeText() {
    currentText = getRandomPassage();
    const textContent = document.getElementById('textContent');
    textContent.innerHTML = '';
    
    currentText.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;
        span.dataset.index = index;
        textContent.appendChild(span);
    });

    currentCharIndex = 0;
    correctChars = 0;
    incorrectChars = 0;
    updateCurrentChar();
}

function updateCurrentChar() {
    document.querySelectorAll('.char').forEach((char, index) => {
        char.classList.remove('current');
        if (index === currentCharIndex) {
            char.classList.add('current');
        }
    });
}

function startTest() {
    isTestActive = true;
    startTime = Date.now();
    timeLeft = 60;
    document.getElementById('textDisplay').classList.remove('blurred');
    document.getElementById('startOverlay').classList.add('hidden');
    document.getElementById('restartTestBtn').classList.add('visible');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateStats();
        
        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

function endTest() {
    isTestActive = false;
    clearInterval(timerInterval);
    
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    
    showResults(wpm, accuracy);
}

function calculateWPM() {
    if (!startTime) return 0;
    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const wordsTyped = correctChars / 5;
    return Math.round(wordsTyped / timeElapsed);
}

function calculateAccuracy() {
    const total = correctChars + incorrectChars;
    if (total === 0) return 100;
    return Math.round((correctChars / total) * 100);
}

function updateStats() {
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    
    document.getElementById('wpm').textContent = wpm;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    document.getElementById('time').textContent = `0:${timeLeft.toString().padStart(2, '0')}`;
}

function showResults(wpm, accuracy) {
    const overlay = document.getElementById('resultsOverlay');
    const icon = document.getElementById('resultIcon');
    const title = document.getElementById('resultTitle');
    const subtitle = document.getElementById('resultSubtitle');
    
    document.getElementById('resultWpm').textContent = wpm;
    document.getElementById('resultAccuracy').textContent = `${accuracy}%`;
    document.getElementById('resultChars').textContent = `${correctChars}/${incorrectChars}`;
    
    // Determine if it's a new personal best
    const isFirstTest = personalBestWPM === 0;
    const isNewBest = wpm > personalBestWPM;
    
    if (isFirstTest) {
        icon.textContent = '✓';
        title.textContent = 'Baseline Established!';
        subtitle.textContent = "You've set the bar. Now the real challenge begins—time to beat it.";
        personalBestWPM = wpm;
    } else if (isNewBest) {
        icon.innerHTML = '<img src="assets/images/icon-new-pb.svg" alt="New Personal Best Icon">';
        title.textContent = 'High Score Smashed!';
        subtitle.textContent = "You're getting faster. That was incredible typing.";
        personalBestWPM = wpm;
        createConfetti();
    } else {
        icon.textContent = '✓';
        title.textContent = 'Test Complete!';
        subtitle.textContent = 'Solid run. Keep pushing to beat your high score.';
    }
    
    // Save personal best
    localStorage.setItem('personalBest', personalBestWPM.toString());
    document.getElementById('personalBest').textContent = `${personalBestWPM} WPM`;
    
    overlay.classList.remove('hidden');
}

function createConfetti() {
    const card = document.querySelector('.results-card');
    const colors = ['#fbbf24', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-20px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.3 + 's';
        confetti.style.animationDuration = (Math.random() * 1 + 2) + 's';
        card.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

function resetTest() {
    isTestActive = false;
    clearInterval(timerInterval);
    timeLeft = 60;
    currentCharIndex = 0;
    correctChars = 0;
    incorrectChars = 0;
    startTime = null;
    
    document.getElementById('wpm').textContent = '0';
    document.getElementById('accuracy').textContent = '100%';
    document.getElementById('time').textContent = '0:60';
    document.getElementById('textDisplay').classList.add('blurred');
    document.getElementById('startOverlay').classList.remove('hidden');
    document.getElementById('resultsOverlay').classList.add('hidden');
    document.getElementById('restartTestBtn').classList.remove('visible');
    
    initializeText();
}

// Event Listeners
document.getElementById('startBtn').addEventListener('click', startTest);

document.getElementById('textDisplay').addEventListener('click', (e) => {
    if (!isTestActive && !e.target.closest('.start-overlay')) {
        startTest();
    }
});

document.getElementById('restartBtn').addEventListener('click', resetTest);
document.getElementById('restartTestBtn').addEventListener('click', resetTest);

document.querySelectorAll('[data-difficulty]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentDifficulty = e.target.dataset.difficulty;
        resetTest();
    });
});

document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentMode = e.target.dataset.mode;
        resetTest();
    });
});

// Handle typing
document.addEventListener('keydown', (e) => {
    if (!isTestActive) return;
    
    // Ignore special keys except backspace
    if (e.key.length > 1 && e.key !== 'Backspace') {
        return;
    }
    
    // Handle backspace
    if (e.key === 'Backspace' && currentCharIndex > 0) {
        e.preventDefault();
        currentCharIndex--;
        const char = document.querySelector(`[data-index="${currentCharIndex}"]`);
        
        if (char.classList.contains('incorrect')) {
            incorrectChars--;
        } else if (char.classList.contains('correct')) {
            correctChars--;
        }
        
        char.classList.remove('correct', 'incorrect');
        updateCurrentChar();
        updateStats();
        return;
    }
    
    // Handle regular typing
    if (e.key.length === 1 && currentCharIndex < currentText.length) {
        const typedChar = e.key;
        const expectedChar = currentText[currentCharIndex];
        
        if (typedChar === expectedChar) {
            document.querySelector(`[data-index="${currentCharIndex}"]`).classList.add('correct');
            correctChars++;
        } else {
            document.querySelector(`[data-index="${currentCharIndex}"]`).classList.add('incorrect');
            incorrectChars++;
        }
        
        currentCharIndex++;
        updateCurrentChar();
        updateStats();
        
        // Check if passage is complete
        if (currentCharIndex >= currentText.length) {
            endTest();
        }
    }
});

// Initialize
initializeText();