let currentQuestion = 0;
let score = 0;
let health = 100;
let alienLeft = 8;
let timerInterval = null;
let timeLeft = 15;
let currentDifficulty = "easy";
let gameOver = false;

// New gameplay & power-up states
let answerStreak = 0;
let correctAnswersCount = 0;
let totalQuestionsCount = 0;
let powerUps = { shieldRestore: 0, freezeTime: 0 };
let isTimeFrozen = false;

// Audio states
let globalVolume = 0.6;
let isMuted = false;

function startGame(difficulty) {
    initAudio();
    currentDifficulty = difficulty;
    const qs = initQuestions(difficulty);
    window.questions = qs;

    if (typeof logTactical === "function") {
        logTactical("TACTICAL SYSTEMS ONLINE. DEFENDING EARTH...", "sys");
        logTactical(`COMBAT MODE ACTIVATED: ${difficulty.toUpperCase()}`, "info");
    }

    document.getElementById("difficultyScreen").style.display = "none";
    document.getElementById("topBar").style.display = "flex";
    document.getElementById("battleScene").style.display = "block";
    document.getElementById("questionArea").style.display = "flex";

    const username = localStorage.getItem("mc_username");
    const welcomeEl = document.getElementById("welcomeUser");
    if (username) welcomeEl.textContent = "👋 " + username;
    else welcomeEl.textContent = "Playing as Guest";

    if (difficulty === "easy") timeLeft = 20;
    else if (difficulty === "medium") timeLeft = 15;
    else timeLeft = 10;
    window._baseTime = timeLeft;

    // Reset powerups and streak
    answerStreak = 0;
    correctAnswersCount = 0;
    totalQuestionsCount = window.questions.length;
    powerUps = { shieldRestore: 0, freezeTime: 0 };
    isTimeFrozen = false;
    updatePowerUpUI();
    document.getElementById("powerupsContainer").style.display = "flex";

    // Init shield
    initShield();

    loadQuestion();
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    isTimeFrozen = false;
    const timerBar = document.getElementById("timerBar");
    if (timerBar) {
        timerBar.classList.remove("frozen");
    }
    timeLeft = window._baseTime;
    updateTimerUI();
    updatePowerUpUI();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        if (timeLeft <= 0) { clearInterval(timerInterval); timeUp(); }
    }, 1000);
}

function updateTimerUI() {
    const timerText = document.getElementById("timerText");
    const timerBar = document.getElementById("timerBar");
    if (timerText) timerText.textContent = timeLeft;
    if (timerBar) {
        const pct = (timeLeft / window._baseTime) * 100;
        timerBar.style.width = pct + "%";
        timerBar.style.background = pct > 50 ? "#00ffcc" : pct > 25 ? "#ffaa00" : "#ff3333";
    }
}

function triggerDamageFlash() {
    let overlay = document.getElementById("damageFlashOverlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "damageFlashOverlay";
        overlay.className = "damage-flash-overlay";
        document.body.appendChild(overlay);
    }
    overlay.classList.remove("flash");
    void overlay.offsetWidth; // trigger reflow
    overlay.classList.add("flash");
    setTimeout(() => {
        overlay.classList.remove("flash");
    }, 400);
}

function takeDamage() {
    health = Math.max(0, health - 20);
    hitShield(20);
    triggerDamageFlash();
    updateHUD();
    if (health <= 0) {
        clearInterval(timerInterval);
        answerButtons.forEach(b => b.disabled = true);
        triggerEarthDestroyed();
        return true;
    }
    return false;
}

function timeUp() {
    if (gameOver) return;
    const correctAnswer = window.questions[currentQuestion].correct;
    answerButtons.forEach(b => b.disabled = true);
    answerButtons[correctAnswer].classList.add("correct");

    // Reset streak on timeout
    answerStreak = 0;

    if (typeof logTactical === "function") {
        logTactical("DECRYPTION TIMEOUT! INCOMING ORBITAL MISSILE...", "crit");
    }

    // Spawn floating feedback at screen center
    if (typeof window.spawnFloatingFeedback === "function") {
        window.spawnFloatingFeedback("Timeout! Shield Damaged! -20%", "wrong", window.innerWidth / 2, window.innerHeight / 2 - 100);
    }

    alienLeft = Math.min(68, alienLeft + 10);
    document.getElementById("alienShipWrapper").style.left = alienLeft + "%";

    // Fire weapon then damage
    fireWeapon(() => {
        animateShieldImpact();
        const isOver = takeDamage();
        if (!isOver) {
            setTimeout(() => {
                answerButtons.forEach(b => { b.disabled = false; b.classList.remove("correct", "wrong"); });
                currentQuestion++;
                if (currentQuestion < window.questions.length) { loadQuestion(); startTimer(); }
                else { endGame(); }
            }, 800);
        }
    });
}

function checkAnswer(selectedIndex, e) {
    if (gameOver) return;
    clearInterval(timerInterval);
    const correctAnswer = window.questions[currentQuestion].correct;
    answerButtons.forEach(b => { b.disabled = true; });

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2 - 100;
    if (e && e.clientX && e.clientY) {
        x = e.clientX;
        y = e.clientY;
    }

    if (selectedIndex === correctAnswer) {
        correctAnswersCount++;
        answerStreak++;
        
        // Award powerups on streak
        let awardMessage = "";
        if (answerStreak === 3) {
            powerUps.shieldRestore++;
            awardMessage = " STREAK REWARD: +1 SHIELD BOOST!";
        } else if (answerStreak === 5) {
            powerUps.freezeTime++;
            awardMessage = " STREAK REWARD: +1 TIME FREEZE!";
        }
        
        // Score calculation with streak multiplier
        const baseScore = 100 + (timeLeft * 5);
        let multiplier = 1.0;
        if (answerStreak >= 5) multiplier = 2.0;
        else if (answerStreak >= 3) multiplier = 1.5;
        
        const addedScore = Math.round(baseScore * multiplier);
        score += addedScore;

        // Spawn floating feedback
        if (typeof window.spawnFloatingFeedback === "function") {
            window.spawnFloatingFeedback(`Correct! +${addedScore}`, "correct", x, y);
        }
        
        alienLeft = Math.max(5, alienLeft - 12);
        answerButtons[selectedIndex].classList.add("correct");
        playSound("correct");
        
        const multText = multiplier > 1 ? ` (x${multiplier} Streak!)` : "";
        logTactical(`DECRYPTION KEY ACCEPTED! +${addedScore} PTS${multText}.${awardMessage}`, "info");
        
        // Trigger warp speed rotation boost in Three.js background
        if (typeof window.triggerWarpSpeed === "function") {
            window.triggerWarpSpeed();
        }
        
        document.getElementById("earthCanvas").style.filter = "drop-shadow(0 0 30px #00ffcc) drop-shadow(0 0 60px #00ffcc)";
        setTimeout(() => { document.getElementById("earthCanvas").style.filter = "drop-shadow(0 0 25px rgba(30,144,255,0.7))"; }, 700);
        
        if (typeof fireEarthLaser === 'function') {
            fireEarthLaser(() => {
                document.getElementById("alienShipWrapper").style.left = alienLeft + "%";
            });
        } else {
            document.getElementById("alienShipWrapper").style.left = alienLeft + "%";
        }
        updateHUD();

        setTimeout(() => {
            answerButtons.forEach(b => { b.disabled = false; b.classList.remove("correct", "wrong"); });
            currentQuestion++;
            if (currentQuestion < window.questions.length) { loadQuestion(); startTimer(); }
            else { endGame(); }
        }, 1800);
    } else {
        // Reset streak
        answerStreak = 0;

        // Spawn floating feedback
        if (typeof window.spawnFloatingFeedback === "function") {
            window.spawnFloatingFeedback("Shield Damaged! -20%", "wrong", x, y);
        }

        alienLeft = Math.min(68, alienLeft + 10);
        document.getElementById("alienShipWrapper").style.left = alienLeft + "%";
        answerButtons[selectedIndex].classList.add("wrong");
        answerButtons[correctAnswer].classList.add("correct");
        playSound("wrong");

        if (typeof logTactical === "function") {
            logTactical("DECRYPTION ERROR! INCOMING DE-ORBITAL MISSILE...", "crit");
        }

        // Fire weapon at earth
        fireWeapon(() => {
            animateShieldImpact();
            const isOver = takeDamage();
            if (!isOver) {
                setTimeout(() => {
                    answerButtons.forEach(b => { b.disabled = false; b.classList.remove("correct", "wrong"); });
                    currentQuestion++;
                    if (currentQuestion < window.questions.length) { loadQuestion(); startTimer(); }
                    else { endGame(); }
                }, 800);
            }
        });
    }
}

function triggerEarthDestroyed() {
    gameOver = true;
    playSound("explosion");

    // First collapse the shield spectacularly
    collapseShield(() => {
        // Then explode the earth
        const ring = document.getElementById("explosionRing");
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                ring.classList.remove("explode");
                void ring.offsetWidth;
                ring.classList.add("explode");
                playSound("explosion");
                document.getElementById("earthCanvas").style.filter = `drop-shadow(0 0 ${40+i*20}px #ff2200) brightness(${1.5+i*0.3})`;
            }, i * 350);
        }

        // Red invasion flash
        setTimeout(() => {
            const overlay = document.createElement("div");
            overlay.id = "invasionOverlay";
            overlay.style.cssText = `position:fixed;inset:0;background:rgba(255,30,0,0.2);z-index:50;pointer-events:none;animation:invasionFlash 0.4s ease-in-out 4;`;
            document.body.appendChild(overlay);
            const style = document.createElement("style");
            style.textContent = `@keyframes invasionFlash{0%,100%{opacity:0}50%{opacity:1}}`;
            document.head.appendChild(style);
            setTimeout(() => { overlay.remove(); }, 1800);
        }, 300);

        document.getElementById("alienShipWrapper").style.left = "68%";
        setTimeout(() => { endGame(); }, 2800);
    });
}

let audioCtx = null;
let bgHumOsc = null;
let bgHumGain = null;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Start ambient spacecraft hum
    try {
        bgHumOsc = audioCtx.createOscillator();
        bgHumGain = audioCtx.createGain();
        const lowpass = audioCtx.createBiquadFilter();
        
        lowpass.type = "lowpass";
        lowpass.frequency.value = 80; // deep bass hum
        
        bgHumOsc.type = "sawtooth";
        bgHumOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // Low A note
        
        // pulsating LFO pitch modulation
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = 0.5;
        lfoGain.gain.value = 1.5;
        lfo.connect(lfoGain);
        lfoGain.connect(bgHumOsc.frequency);
        lfo.start();
        
        bgHumOsc.connect(lowpass);
        lowpass.connect(bgHumGain);
        bgHumGain.connect(audioCtx.destination);
        
        bgHumGain.gain.setValueAtTime(isMuted ? 0 : 0.06 * globalVolume, audioCtx.currentTime);
        bgHumOsc.start();
    } catch(e) {
        console.warn("Could not start background hum", e);
    }
}

function playHoverSound() {
    if (isMuted) return;
    try {
        if (!audioCtx) initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);
        gain.gain.setValueAtTime(0.02 * globalVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
    } catch(e) {}
}

function playSound(type) {
    if (isMuted) return;
    try {
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;

        if (type === "correct") {
            // Uplifting synthesizer sweep
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(440, now);
            osc1.frequency.exponentialRampToValueAtTime(880, now + 0.35);
            
            osc2.type = "triangle";
            osc2.frequency.setValueAtTime(554.37, now);
            osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.35);
            
            gain.gain.setValueAtTime(0.18 * globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.5);
            osc2.stop(now + 0.5);
        } else if (type === "wrong") {
            // Dissonant descending warning chord
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.exponentialRampToValueAtTime(100, now + 0.6);
            
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(90, now + 0.6);
            
            gain.gain.setValueAtTime(0.22 * globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now);
            osc.stop(now + 0.6);
        } else if (type === "explosion") {
            // Deep white noise rumble explosion
            const bufferSize = audioCtx.sampleRate * 0.8;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            
            const noise = audioCtx.createBufferSource();
            noise.buffer = noise.buffer || buffer;
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(350, now);
            filter.frequency.exponentialRampToValueAtTime(15, now + 0.8);
            filter.Q.value = 6;
            
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.4 * globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            noise.start(now);
            noise.stop(now + 0.8);
        } else if (type === "victory") {
            // Retro synth-wave success arpeggio
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, i) => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.type = "triangle";
                o.frequency.value = freq;
                g.gain.setValueAtTime(0.0, now + i * 0.08);
                g.gain.linearRampToValueAtTime(0.12 * globalVolume, now + i * 0.08 + 0.02);
                g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.45);
                o.connect(g);
                g.connect(audioCtx.destination);
                o.start(now + i * 0.08);
                o.stop(now + i * 0.08 + 0.5);
            });
        } else if (type === "click") {
            // Synthesized tactile mechanical button click sound
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
            gain.gain.setValueAtTime(0.05 * globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        }
    } catch(e) {}
}

function launchConfetti() {
    const container = document.getElementById("victoryParticles");
    const colors = ["#00ffcc","#ff00ff","#ffff00","#00aaff","#ff6600","#ffffff"];
    for (let i = 0; i < 80; i++) {
        const p = document.createElement("div");
        p.style.cssText = `position:fixed;left:${Math.random()*100}%;top:-10px;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?'50%':'2px'};animation:confettiFall ${2+Math.random()*3}s linear ${Math.random()*2}s forwards;z-index:999;pointer-events:none;`;
        container.appendChild(p);
    }
    if (!document.getElementById("confettiStyle")) {
        const style = document.createElement("style");
        style.id = "confettiStyle";
        style.textContent = `@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}`;
        document.head.appendChild(style);
    }
    setTimeout(() => { container.innerHTML = ""; }, 6000);
}

async function endGame() {
    clearInterval(timerInterval);
    if (typeof window.stopSiren === "function") window.stopSiren();
    
    // Hide question area
    document.getElementById("questionArea").style.display = "none";
    
    if (health <= 0) {
        if (typeof logTactical === "function") {
            logTactical("TACTICAL ENVELOPE COLLAPSED. SHIELDS DESTROYED. EARTH DESTROYED.", "crit");
        }
    } else {
        playSound("victory");
        launchConfetti();
        if (typeof logTactical === "function") {
            logTactical("TACTICAL VICTORY! ALIEN ATTACK REPULSED. PLANET EARTH SECURED.", "info");
        }
    }
    
    await saveScore(score);
    
    // Calculate stats
    const accuracy = Math.round((correctAnswersCount / totalQuestionsCount) * 100) || 0;
    let rank = "Space Cadet 🧑‍🚀";
    if (score >= 1200) rank = "Grand Admiral 🌟";
    else if (score >= 800) rank = "Fleet Commander 🛸";
    else if (score >= 400) rank = "Defense Captain 🚀";
    
    const existing = document.getElementById("endGameModal");
    if (existing) existing.remove();
    
    const modal = document.createElement("div");
    modal.id = "endGameModal";
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-box endgame-box">
                <h2>${health <= 0 ? "💀 Earth Destroyed" : "🏆 Earth Saved!"}</h2>
                <div class="endgame-stats">
                    <div class="stat-row"><span>Final Score:</span><span class="highlight">${score}</span></div>
                    <div class="stat-row"><span>Shield Integrity:</span><span class="highlight">${health}%</span></div>
                    <div class="stat-row"><span>Accuracy:</span><span class="highlight">${accuracy}%</span></div>
                    <div class="stat-row"><span>Rank Achieved:</span><span class="highlight-rank">${rank}</span></div>
                </div>
                <div class="endgame-actions">
                    <button id="egLeaderboard">🏆 Leaderboard</button>
                    <button id="egPlayAgain">🔄 Play Again</button>
                </div>
                ${localStorage.getItem("mc_token") ? '<button id="egLogout" style="border-color:#ff4466;color:#ff4466;">🚪 Logout</button>' : ''}
            </div>
        </div>`;
    document.body.appendChild(modal);
    
    document.getElementById("egLeaderboard").onclick = showLeaderboard;
    document.getElementById("egPlayAgain").onclick = () => location.reload();
    const logoutBtn = document.getElementById("egLogout");
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem("mc_token");
            localStorage.removeItem("mc_username");
            location.reload();
        };
    }
}

// Global functions for sound and power-ups control
window.toggleMute = function() {
    isMuted = !isMuted;
    const btn = document.getElementById("muteBtn");
    if (btn) btn.textContent = isMuted ? "🔇" : "🔊";
    if (bgHumGain && audioCtx) {
        bgHumGain.gain.setValueAtTime(isMuted ? 0 : 0.06 * globalVolume, audioCtx.currentTime);
    }
};

window.changeVolume = function(val) {
    globalVolume = val / 100;
    if (bgHumGain && audioCtx && !isMuted) {
        bgHumGain.gain.setValueAtTime(0.06 * globalVolume, audioCtx.currentTime);
    }
};

function updatePowerUpUI() {
    const btnShield = document.getElementById("btnShieldRestore");
    const btnFreeze = document.getElementById("btnFreezeTime");
    if (btnShield) {
        btnShield.textContent = `🛡️ Shield Boost (${powerUps.shieldRestore})`;
        btnShield.disabled = powerUps.shieldRestore <= 0 || health >= 100 || isTimeFrozen;
    }
    if (btnFreeze) {
        btnFreeze.textContent = `⏳ Freeze Time (${powerUps.freezeTime})`;
        btnFreeze.disabled = powerUps.freezeTime <= 0 || isTimeFrozen;
    }
}

window.usePowerUp = function(type) {
    if (gameOver) return;
    if (type === 'shieldRestore' && powerUps.shieldRestore > 0 && health < 100) {
        powerUps.shieldRestore--;
        health = Math.min(100, health + 20);
        if (typeof shieldHealth !== 'undefined') {
            shieldHealth = health;
        }
        if (typeof drawShield === 'function') drawShield();
        updateHUD();
        updatePowerUpUI();
        playSound("victory");
        logTactical("SHIELD BOOST DEPLOYED. HULL INTEGRITY RESTORED BY +20%.", "info");
    } else if (type === 'freezeTime' && powerUps.freezeTime > 0 && !isTimeFrozen) {
        powerUps.freezeTime--;
        isTimeFrozen = true;
        clearInterval(timerInterval);
        const timerBar = document.getElementById("timerBar");
        if (timerBar) {
            timerBar.classList.add("frozen");
        }
        updatePowerUpUI();
        playSound("victory");
        logTactical("TIME MATRIX FROZEN. TIMER SUSPENDED FOR THIS QUESTION.", "sys");
    }
};

// Pilot Status / Rank system in HUD
window.updatePilotStatus = function() {
    const username = localStorage.getItem("mc_username") || "Guest Pilot";
    const welcomeEl = document.getElementById("welcomeUser");
    if (!welcomeEl) return;
    
    let rank = "Recruit";
    let emoji = "👨‍🚀";
    if (score >= 1200) { rank = "Grand Admiral"; emoji = "⭐"; }
    else if (score >= 800) { rank = "Fleet Commander"; emoji = "🛸"; }
    else if (score >= 400) { rank = "Defense Captain"; emoji = "🚀"; }
    else if (score >= 100) { rank = "Cadet Pilot"; emoji = "👨‍✈️"; }
    
    welcomeEl.innerHTML = `${emoji} <span class="rank-badge">${rank}</span> | ${username}`;
};

// Spawn Floating Text Feedback on Answers
window.spawnFloatingFeedback = function(text, type, x, y) {
    const el = document.createElement("div");
    el.className = `floating-feedback ${type}`;
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => {
        el.remove();
    }, 1200);
};

// Alert Siren Synthesizer
let sirenOsc = null;
let sirenGain = null;
let sirenActive = false;

window.startSiren = function() {
    if (isMuted || sirenActive || !audioCtx) return;
    sirenActive = true;
    try {
        sirenOsc = audioCtx.createOscillator();
        sirenGain = audioCtx.createGain();
        sirenOsc.type = "sine";
        sirenOsc.frequency.setValueAtTime(400, audioCtx.currentTime);
        
        const modulator = audioCtx.createOscillator();
        const modGain = audioCtx.createGain();
        modulator.frequency.value = 1.5; // oscillate at 1.5 Hz
        modGain.gain.value = 150; // shift frequency by 150 Hz
        modulator.connect(modGain);
        modGain.connect(sirenOsc.frequency);
        
        sirenOsc.connect(sirenGain);
        sirenGain.connect(audioCtx.destination);
        
        sirenGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
        sirenGain.gain.linearRampToValueAtTime(0.12 * globalVolume, audioCtx.currentTime + 0.5);
        
        modulator.start();
        sirenOsc.start();
    } catch(e) {
        console.warn("Could not start siren sound:", e);
    }
};

window.stopSiren = function() {
    if (!sirenActive) return;
    sirenActive = false;
    try {
        if (sirenGain && audioCtx) {
            sirenGain.gain.setValueAtTime(sirenGain.gain.value, audioCtx.currentTime);
            sirenGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        }
        setTimeout(() => {
            if (sirenOsc) {
                try { sirenOsc.stop(); } catch(e) {}
                sirenOsc = null;
            }
            sirenGain = null;
        }, 350);
    } catch(e) {}
};
