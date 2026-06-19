// Premium Hover sound effects event delegation
document.addEventListener("mouseenter", (e) => {
    if (e.target && e.target.matches && e.target.matches("button, .diff-btn, .answer-btn, a, .modal-box button")) {
        if (typeof playHoverSound === "function") playHoverSound();
    }
}, true);

// Tactical terminal log system
function logTactical(message, type = "info") {
    const terminal = document.getElementById("tacticalTerminal");
    if (!terminal) return;
    
    if (terminal.style.display === "none") {
        terminal.style.display = "block";
    }
    
    const line = document.createElement("div");
    line.className = `term-line ${type}`;
    
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    line.textContent = `[${timestamp}] ${message}`;
    
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
    
    while (terminal.childNodes.length > 20) {
        terminal.removeChild(terminal.firstChild);
    }
}

const questionElement = document.getElementById("question");
const answerButtons = document.querySelectorAll(".answer-btn");
const scoreElement = document.getElementById("score");
const healthElement = document.getElementById("health");
const alienShip = { style: { transform: "" } };

function loadQuestion() {
    const current = window.questions[currentQuestion];
    questionElement.textContent = current.question;
    const qNum = document.getElementById("questionNum");
    if (qNum) qNum.textContent = `${String(currentQuestion+1).padStart(2,'0')} / ${String(window.questions.length).padStart(2,'0')}`;
    answerButtons.forEach((button, index) => {
        button.textContent = current.answers[index];
        button.onclick = (e) => {
            if (typeof playSound === "function") playSound("click");
            checkAnswer(index, e);
        };
        button.style.display = "";
    });

    // Premium tactical log
    logTactical(`DECRYPTING ALIEN TRANSMISSION: QUESTION ${currentQuestion+1}...`, "sys");
}

let prevHealth = 100;
let prevScore = 0;
function updateHUD() {
    scoreElement.textContent = score;
    if (score > prevScore) {
        const scoreBox = scoreElement.parentElement;
        if (scoreBox) {
            scoreBox.classList.remove("pulse");
            void scoreBox.offsetWidth;
            scoreBox.classList.add("pulse");
        }
    }
    prevScore = score;

    if (typeof updatePilotStatus === "function") {
        updatePilotStatus();
    }

    healthElement.textContent = `${health}%`;
    const bar = document.getElementById("healthBar");
    if (bar) {
        bar.style.width = health + "%";
        bar.style.background = health > 60 ? "#00cc50" : health > 30 ? "#ffaa00" : "#ff3333";
    }
    if (health <= 40) healthElement.style.color = "#ff4466";
    else if (health <= 60) healthElement.style.color = "#ffaa00";
    else healthElement.style.color = "white";

    if (health < prevHealth) {
        const dmg = prevHealth - health;
        if (health <= 0) {
            logTactical("CRITICAL HULL DESTRUCTION! SYSTEM OFFLINE...", "crit");
        } else if (health <= 40) {
            logTactical(`WARNING! CRITICAL IMPACT - DETECTED -${dmg}% HULL DAMAGE. INTEGRITY AT ${health}%!`, "crit");
        } else {
            logTactical(`SHIELD ENGAGED: DECREASED BY -${dmg}%. SHIELD LEVEL: ${health}%`, "warn");
        }
    }
    prevHealth = health;
}

function showAuthModal(mode = "login") {
    const existing = document.getElementById("authModal");
    if (existing) existing.remove();
    const modal = document.createElement("div");
    modal.id = "authModal";
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-box">
                <h2>${mode === "login" ? "🚀 Login" : "🛸 Register"}</h2>
                <input id="authUsername" type="text" placeholder="Username" />
                <input id="authPassword" type="password" placeholder="Password" />
                <div class="modal-error" id="authError"></div>
                <button id="authSubmit">${mode === "login" ? "Login" : "Register"}</button>
                <div class="auth-divider"><span>or</span></div>
                <div id="googleSignInContainer" class="google-signin-container"></div>
                <p class="modal-switch">${mode === "login" ? 'No account? <a href="#" id="switchMode">Register</a>' : 'Already have an account? <a href="#" id="switchMode">Login</a>'}</p>
                <button id="authSkip">Play as guest</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    document.getElementById("authSubmit").onclick = () => handleAuth(mode);
    document.getElementById("authSkip").onclick = () => { modal.remove(); };
    document.getElementById("switchMode").onclick = (e) => { e.preventDefault(); showAuthModal(mode === "login" ? "register" : "login"); };
    document.getElementById("authPassword").addEventListener("keydown", (e) => { if (e.key === "Enter") handleAuth(mode); });

    // Initialize Google Sign-In button
    initGoogleSignIn();
}

async function initGoogleSignIn() {
    try {
        const res = await fetch("/api/config");
        const config = await res.json();
        if (!config.googleClientId) return;

        // Wait for the GSI library to load
        const waitForGoogle = () => {
            return new Promise((resolve) => {
                if (window.google && window.google.accounts) {
                    resolve();
                } else {
                    const interval = setInterval(() => {
                        if (window.google && window.google.accounts) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 100);
                    // Timeout after 5 seconds
                    setTimeout(() => { clearInterval(interval); resolve(); }, 5000);
                }
            });
        };

        await waitForGoogle();
        if (!window.google || !window.google.accounts) return;

        google.accounts.id.initialize({
            client_id: config.googleClientId,
            callback: handleGoogleCredential,
        });

        const container = document.getElementById("googleSignInContainer");
        if (container) {
            google.accounts.id.renderButton(container, {
                theme: "filled_black",
                size: "large",
                width: "296",
                shape: "pill",
                text: "signin_with",
            });
        }
    } catch (err) {
        console.warn("Could not initialize Google Sign-In:", err);
    }
}

async function handleGoogleCredential(response) {
    const errorEl = document.getElementById("authError");
    try {
        const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential }),
        });
        const data = await res.json();
        if (!res.ok) {
            if (errorEl) errorEl.textContent = data.message || "Google sign-in failed.";
            return;
        }
        localStorage.setItem("mc_token", data.token);
        localStorage.setItem("mc_username", data.username);

        logTactical(`GOOGLE LINK ESTABLISHED. PILOT ID: ${data.username.toUpperCase()}`, "info");

        const modal = document.getElementById("authModal");
        if (modal) modal.remove();
    } catch (err) {
        if (errorEl) errorEl.textContent = "Could not connect to server.";
    }
}

async function handleAuth(mode) {
    const username = document.getElementById("authUsername").value.trim();
    const password = document.getElementById("authPassword").value;
    const errorEl = document.getElementById("authError");
    if (!username || !password) { errorEl.textContent = "Please fill in all fields."; return; }
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    try {
        const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
        const data = await res.json();
        if (!res.ok) { errorEl.textContent = data.message || "Something went wrong."; return; }
        localStorage.setItem("mc_token", data.token);
        localStorage.setItem("mc_username", data.username);
        
        logTactical(`LINK ESTABLISHED. PILOT ID: ${username.toUpperCase()}`, "info");
        
        document.getElementById("authModal").remove();
    } catch (err) { errorEl.textContent = "Could not connect to server."; }
}

async function saveScore(finalScore) {
    const token = localStorage.getItem("mc_token");
    if (!token) return;
    try {
        await fetch("/api/scores", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": token }, body: JSON.stringify({ score: finalScore }) });
    } catch (err) { console.log("Could not save score:", err); }
}

async function showLeaderboard() {
    try {
        const res = await fetch("/api/scores");
        const scores = await res.json();
        const existing = document.getElementById("leaderboardModal");
        if (existing) existing.remove();
        const currentUser = localStorage.getItem("mc_username");
        const rows = scores.length === 0
            ? "<tr><td colspan='4'>No scores yet!</td></tr>"
            : scores.map((s, i) => {
                const isMe = s.username === currentUser;
                const date = new Date(s.created_at).toLocaleDateString();
                return `<tr style="${isMe ? 'background:rgba(0,255,204,0.15);color:#00ffcc;font-weight:bold;' : ''}">
                    <td>${i+1}</td>
                    <td>${s.username}${isMe ? ' ⭐' : ''}</td>
                    <td>${s.score}</td>
                    <td>${date}</td>
                </tr>`;
            }).join("");
        const modal = document.createElement("div");
        modal.id = "leaderboardModal";
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-box">
                    <h2>🏆 Leaderboard</h2>
                    <table class="leaderboard-table">
                        <thead><tr><th>#</th><th>Player</th><th>Score</th><th>Date</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <button id="closeLeaderboard">Close</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        document.getElementById("closeLeaderboard").onclick = () => modal.remove();
    } catch (err) { console.log("Could not load leaderboard:", err); }
}
