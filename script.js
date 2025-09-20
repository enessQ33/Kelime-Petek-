const backgrounds = [
    'https://images.unsplash.com/photo-1510414842594-ce88e7d4838f?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534484084224-345096131499?q=80&w=1932&auto=format&fit=crop',
];

let gameData = [];
let currentLevelIndex = 0;
let score = 0;
let foundWords = [];
let hintCount = 3;
let isGameActive = false;

// DOM Elementleri
const body = document.body;
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const settingsScreen = document.getElementById('settings-screen');
const pauseMenu = document.getElementById('pause-menu');
const aboutScreen = document.getElementById('about-screen');

const levelText = document.getElementById('level-text');
const scoreText = document.getElementById('score-text');
const wordGrid = document.getElementById('word-grid');
const currentWordDisplay = document.getElementById('current-word-display');
const letterGrid = document.getElementById('letter-grid');
const submitBtn = document.getElementById('submit-btn');
const clearBtn = document.getElementById('clear-btn');
const hintBtn = document.getElementById('hint-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const hintCountDisplay = document.querySelector('#hint-btn .helper-count');
const pauseBtn = document.getElementById('pause-btn');

// Menü Butonları
const startGameBtn = document.getElementById('start-game-btn');
const settingsBtn = document.getElementById('settings-btn');
const aboutBtn = document.getElementById('about-btn');
const backToMainFromAboutBtn = document.getElementById('back-to-main-from-about-btn');
const backToMainBtn = document.getElementById('back-to-main-btn');
const resumeBtn = document.getElementById('resume-btn');
const returnToMainBtn = document.getElementById('return-to-main-btn');

// Ayar Kontrolleri
const musicVolumeSlider = document.getElementById('music-volume');
const sfxVolumeSlider = document.getElementById('sfx-volume');
const colorHueSlider = document.getElementById('color-hue');
const brightnessSlider = document.getElementById('brightness');

// Ses Elementleri
const bgMusic = document.getElementById('background-music');
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const clickSound = document.getElementById('click-sound');

function playSound(soundElement) {
    if (soundElement) {
        soundElement.currentTime = 0;
        soundElement.play();
    }
}

// Ekranları yönetme
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Renk ayarlarını güncelleme
function updateColors(hue, brightness) {
    document.documentElement.style.setProperty('--primary-color', `hsl(${hue}, 100%, ${60 * brightness}%)`);
    document.documentElement.style.setProperty('--secondary-color', `hsl(${hue + 60}, 100%, ${60 * brightness}%)`);
    document.documentElement.style.setProperty('--correct-color', `hsl(120, 100%, ${40 * brightness}%)`);
    document.documentElement.style.setProperty('--wrong-color', `hsl(0, 100%, ${60 * brightness}%)`);
    document.documentElement.style.setProperty('--text-light', `hsl(0, 0%, ${95 * brightness}%)`);
}

// Oyun mantığı
async function startGame() {
    showScreen('game-screen');
    isGameActive = true;
    bgMusic.play().catch(e => console.log('Müzik otomatik başlatılamadı.'));
    
    if (gameData.length === 0) {
        try {
            const response = await fetch('words.json');
            gameData = await response.json();
            loadLevel(currentLevelIndex);
        } catch (error) {
            console.error("Kelime verileri yüklenirken bir hata oluştu:", error);
            alert("Oyun verileri yüklenemedi. Lütfen words.json dosyasını kontrol edin.");
            showScreen('main-menu');
        }
    } else {
        loadLevel(currentLevelIndex);
    }
}

function loadLevel(levelIndex) {
    if (levelIndex >= gameData.length) {
        alert('Tebrikler! Oyunu bitirdiniz!');
        return;
    }

    body.style.backgroundImage = `url('${backgrounds[levelIndex % backgrounds.length]}')`;
    
    foundWords = [];
    currentWordDisplay.textContent = '';
    wordGrid.innerHTML = '';
    letterGrid.innerHTML = '';

    const level = gameData[levelIndex];
    levelText.textContent = `Seviye ${levelIndex + 1}`;
    hintCountDisplay.textContent = hintCount;
    updateHelperButtonStates();

    const allWords = level.words.concat(level.bonusWord).filter((word, index, self) => self.indexOf(word) === index);
    const uniqueWordLengths = [...new Set(allWords.map(w => w.length))].sort((a, b) => a - b);
    
    uniqueWordLengths.forEach(length => {
        const wordsOfLength = allWords.filter(w => w.length === length);
        const row = document.createElement('div');
        row.className = 'word-row';
        wordGrid.appendChild(row);
        
        wordsOfLength.forEach(word => {
            const wordContainer = document.createElement('div');
            wordContainer.style.display = 'flex';
            wordContainer.style.gap = '8px';
            wordContainer.style.margin = '0 5px';
            
            for (let i = 0; i < word.length; i++) {
                const box = document.createElement('div');
                box.className = 'letter-box';
                box.dataset.word = word;
                box.dataset.index = i;
                wordContainer.appendChild(box);
            }
            row.appendChild(wordContainer);
        });
    });
    positionLettersOnGrid(level.letters);
}

function positionLettersOnGrid(letters) {
    letterGrid.innerHTML = '';
    letters.forEach((letter) => {
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.textContent = letter;
        
        btn.onclick = () => {
            currentWordDisplay.textContent += letter;
            playSound(clickSound);
        };
        letterGrid.appendChild(btn);
    });
}

function checkWord() {
    const submittedWord = currentWordDisplay.textContent.toUpperCase();
    const level = gameData[currentLevelIndex];
    const allWords = level.words.concat(level.bonusWord).filter((word, index, self) => self.indexOf(word) === index);
    if (allWords.includes(submittedWord) && !foundWords.includes(submittedWord)) {
        foundWords.push(submittedWord);
        score += submittedWord.length * 10;
        scoreText.textContent = `Puan: ${score}`;
        fillWordBoxes(submittedWord);
        currentWordDisplay.textContent = '';
        playSound(correctSound);
        if (foundWords.length === allWords.length) {
            setTimeout(() => {
                alert('Seviye tamamlandı!');
                currentLevelIndex++;
                loadLevel(currentLevelIndex);
            }, 1000);
        }
    } else {
        currentWordDisplay.textContent = '';
        currentWordDisplay.classList.add('shake');
        playSound(wrongSound);
        setTimeout(() => {
            currentWordDisplay.classList.remove('shake');
        }, 500);
    }
}

function fillWordBoxes(word) {
    const allBoxes = document.querySelectorAll('.letter-box');
    allBoxes.forEach(box => {
        if (box.dataset.word === word) {
            box.textContent = word[box.dataset.index];
            box.classList.add('filled-box');
        }
    });
}

function shuffleLetters() {
    const level = gameData[currentLevelIndex];
    level.letters.sort(() => Math.random() - 0.5);
    positionLettersOnGrid(level.letters);
    playSound(clickSound);
}

function updateHelperButtonStates() {
    if (hintCount <= 0) {
        hintBtn.classList.add('disabled-helper');
        hintBtn.style.pointerEvents = 'none';
    } else {
        hintBtn.classList.remove('disabled-helper');
        hintBtn.style.pointerEvents = 'auto';
    }
    hintCountDisplay.textContent = hintCount;
}

function useHint() {
    if (hintCount > 0) {
        hintCount--;
        updateHelperButtonStates();
        const level = gameData[currentLevelIndex];
        const allWordsInLevel = level.words.concat(level.bonusWord).filter((word, index, self) => self.indexOf(word) === index);
        const remainingWords = allWordsInLevel.filter(w => !foundWords.includes(w));
        if (remainingWords.length > 0) {
            let revealed = false;
            for (let i = 0; i < remainingWords.length; i++) {
                const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
                const emptyBoxesForWord = Array.from(document.querySelectorAll(`.letter-box[data-word="${randomWord}"]`)).filter(box => box.textContent === '');
                if (emptyBoxesForWord.length > 0) {
                    const randomBox = emptyBoxesForWord[Math.floor(Math.random() * emptyBoxesForWord.length)];
                    randomBox.textContent = randomWord[randomBox.dataset.index];
                    randomBox.classList.add('filled-box');
                    randomBox.style.animation = 'bounce 0.5s ease-in-out';
                    setTimeout(() => { randomBox.style.animation = ''; }, 500);
                    revealed = true;
                    playSound(correctSound);
                    break;
                }
            }
            if (!revealed) {
                alert("Tüm harfler zaten açık!");
                hintCount++;
                updateHelperButtonStates();
            }
        } else {
            alert("Bu seviyede gösterilecek başka kelime yok!");
            hintCount++;
            updateHelperButtonStates();
            playSound(wrongSound);
        }
    } else {
        alert("Üzgünüm, ipucu hakkınız kalmadı!");
        playSound(wrongSound);
    }
}

// Menü ve Ayar Olayları
startGameBtn.onclick = () => {
    playSound(clickSound);
    startGame();
};
settingsBtn.onclick = () => {
    playSound(clickSound);
    showScreen('settings-screen');
};
aboutBtn.onclick = () => {
    playSound(clickSound);
    showScreen('about-screen');
};
backToMainBtn.onclick = () => {
    playSound(clickSound);
    showScreen('main-menu');
};
backToMainFromAboutBtn.onclick = () => {
    playSound(clickSound);
    showScreen('main-menu');
};
pauseBtn.onclick = () => {
    playSound(clickSound);
    showScreen('pause-menu');
    isGameActive = false;
};
resumeBtn.onclick = () => {
    playSound(clickSound);
    showScreen('game-screen');
    isGameActive = true;
};
returnToMainBtn.onclick = () => {
    playSound(clickSound);
    currentLevelIndex = 0;
    score = 0;
    scoreText.textContent = "Puan: 0";
    showScreen('main-menu');
    isGameActive = false;
};
musicVolumeSlider.oninput = (e) => {
    bgMusic.volume = e.target.value;
};
sfxVolumeSlider.oninput = (e) => {
    correctSound.volume = e.target.value;
    wrongSound.volume = e.target.value;
    clickSound.volume = e.target.value;
};

// Renk ayarlarını bağla
colorHueSlider.oninput = (e) => {
    const hue = e.target.value;
    const brightness = brightnessSlider.value;
    updateColors(hue, brightness);
};

brightnessSlider.oninput = (e) => {
    const hue = colorHueSlider.value;
    const brightness = e.target.value;
    updateColors(hue, brightness);
};

// Oyun Kontrol Olayları
submitBtn.onclick = checkWord;
clearBtn.onclick = () => {
    currentWordDisplay.textContent = '';
    playSound(clickSound);
};
shuffleBtn.onclick = shuffleLetters;
hintBtn.onclick = useHint;

// İlk Ekranı Göster
showScreen('main-menu');
updateColors(colorHueSlider.value, brightnessSlider.value);
