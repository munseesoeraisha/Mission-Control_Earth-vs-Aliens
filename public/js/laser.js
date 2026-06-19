// =====================
// WEAPON SYSTEM - Always missile on wrong answer
// =====================

function fireAlienMissile(onImpact) {
    const battleScene = document.getElementById("battleScene");
    const alienWrapper = document.getElementById("alienShipWrapper");
    const earthWrapper = document.getElementById("earthWrapper");

    if (!battleScene || !alienWrapper || !earthWrapper) {
        if (onImpact) onImpact();
        return;
    }

    const alienRect = alienWrapper.getBoundingClientRect();
    const earthRect = earthWrapper.getBoundingClientRect();
    const sceneRect = battleScene.getBoundingClientRect();

    const startX = alienRect.right - sceneRect.left - 10;
    const startY = alienRect.top + alienRect.height / 2 - sceneRect.top;
    const endX = earthRect.left - sceneRect.left + 30;
    const endY = earthRect.top + earthRect.height / 2 - sceneRect.top;

    // Missile body
    const missile = document.createElement("div");
    missile.style.cssText = `
        position:absolute;
        width:28px; height:10px;
        background:linear-gradient(to right, #ff4400, #ffaa00, #ffffff);
        border-radius:5px 2px 2px 5px;
        left:${startX}px;
        top:${startY - 5}px;
        box-shadow: 0 0 14px #ff6600, 0 0 6px #fff;
        z-index:20;
        pointer-events:none;
    `;

    // Flame trail
    const trail = document.createElement("div");
    trail.style.cssText = `
        position:absolute;
        width:50px; height:4px;
        background:linear-gradient(to left, transparent, rgba(255,80,0,0.8), rgba(255,200,0,0.4));
        border-radius:2px;
        left:${startX - 50}px;
        top:${startY - 2}px;
        z-index:19;
        pointer-events:none;
    `;

    // Smoke particles
    const smoke = document.createElement("div");
    smoke.style.cssText = `
        position:absolute;
        width:8px; height:8px;
        background:rgba(200,200,200,0.4);
        border-radius:50%;
        left:${startX - 10}px;
        top:${startY - 4}px;
        z-index:18;
        pointer-events:none;
    `;

    battleScene.appendChild(missile);
    battleScene.appendChild(trail);
    battleScene.appendChild(smoke);

    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    missile.style.transform = `rotate(${angle}deg)`;

    let progress = 0;
    const steps = 45;
    const missileAnim = setInterval(() => {
        progress++;
        const t = progress / steps;
        const arcY = -Math.sin(t * Math.PI) * 25;
        const curX = startX + dx * t;
        const curY = startY + dy * t + arcY;

        missile.style.left = curX + "px";
        missile.style.top = (curY - 5) + "px";
        trail.style.left = (curX - 50) + "px";
        trail.style.top = (curY - 2) + "px";
        smoke.style.left = (curX - 15) + "px";
        smoke.style.top = (curY - 4 + Math.random() * 4 - 2) + "px";
        smoke.style.opacity = 0.3 + Math.random() * 0.3;

        // Rotate missile to follow arc
        const currentAngle = Math.atan2(dy + arcY * Math.cos(t * Math.PI) * Math.PI, dx) * (180 / Math.PI);
        missile.style.transform = `rotate(${currentAngle}deg)`;

        if (progress >= steps) {
            clearInterval(missileAnim);
            missile.remove(); trail.remove(); smoke.remove();

            // Big explosion at earth
            const exp = document.createElement("div");
            exp.style.cssText = `
                position:absolute;
                left:${endX - 40}px; top:${endY - 40}px;
                width:80px; height:80px;
                border-radius:50%;
                background:radial-gradient(circle, #ffffff 0%, #ffdd00 25%, #ff6600 55%, #ff2200 75%, transparent 100%);
                z-index:25; pointer-events:none;
                animation: missileExplode 0.6s ease-out forwards;
            `;

            // Shockwave ring
            const shockwave = document.createElement("div");
            shockwave.style.cssText = `
                position:absolute;
                left:${endX - 10}px; top:${endY - 10}px;
                width:20px; height:20px;
                border: 3px solid rgba(255,150,0,0.9);
                border-radius:50%;
                z-index:24; pointer-events:none;
                animation: shockwaveExpand 0.5s ease-out forwards;
            `;

            battleScene.appendChild(exp);
            battleScene.appendChild(shockwave);

            if (!document.getElementById("missileStyle")) {
                const style = document.createElement("style");
                style.id = "missileStyle";
                style.textContent = `
                    @keyframes missileExplode{0%{transform:scale(0);opacity:1}60%{transform:scale(2.2);opacity:0.8}100%{transform:scale(3);opacity:0}}
                    @keyframes shockwaveExpand{0%{transform:scale(1);opacity:1}100%{transform:scale(8);opacity:0}}
                `;
                document.head.appendChild(style);
            }

            setTimeout(() => { exp.remove(); shockwave.remove(); if (onImpact) onImpact(); }, 600);
        }
    }, 16);
}

// Always fire missile
function fireWeapon(onImpact) {
    fireAlienMissile(onImpact);
}

// Fire laser from Earth (defense) on correct answer
function fireEarthLaser(onImpact) {
    const battleScene = document.getElementById("battleScene");
    const alienWrapper = document.getElementById("alienShipWrapper");
    const earthWrapper = document.getElementById("earthWrapper");

    if (!battleScene || !alienWrapper || !earthWrapper) {
        if (onImpact) onImpact();
        return;
    }

    const alienRect = alienWrapper.getBoundingClientRect();
    const earthRect = earthWrapper.getBoundingClientRect();
    const sceneRect = battleScene.getBoundingClientRect();

    // Start at Earth center and end at Alien ship center
    const startX = earthRect.left - sceneRect.left + 50;
    const startY = earthRect.top + earthRect.height / 2 - sceneRect.top;
    const endX = alienRect.left - sceneRect.left + alienRect.width / 2;
    const endY = alienRect.top + alienRect.height / 2 - sceneRect.top;

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Create laser line
    const laser = document.createElement("div");
    laser.style.cssText = `
        position: absolute;
        height: 6px;
        background: linear-gradient(90deg, rgba(0, 255, 255, 1) 0%, rgba(0, 150, 255, 0.85) 70%, transparent 100%);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.9), 0 0 6px #fff;
        left: ${startX}px;
        top: ${startY - 3}px;
        width: 0px;
        transform-origin: left center;
        transform: rotate(${angle}deg);
        z-index: 21;
        pointer-events: none;
        transition: width 0.25s cubic-bezier(0.1, 0.8, 0.3, 1);
    `;
    battleScene.appendChild(laser);

    // Grow laser
    requestAnimationFrame(() => {
        laser.style.width = distance + "px";
    });

    // Handle impact
    setTimeout(() => {
        const impact = document.createElement("div");
        impact.style.cssText = `
            position: absolute;
            left: ${endX - 20}px;
            top: ${endY - 20}px;
            width: 40px; height: 40px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,255,255,0.7) 40%, transparent 100%);
            box-shadow: 0 0 25px rgba(0, 255, 255, 0.9);
            z-index: 25;
            pointer-events: none;
            animation: laserSplash 0.35s ease-out forwards;
        `;
        battleScene.appendChild(impact);

        if (!document.getElementById("laserStyle")) {
            const style = document.createElement("style");
            style.id = "laserStyle";
            style.textContent = `
                @keyframes laserSplash {
                    0% { transform: scale(0.2); opacity: 1; }
                    100% { transform: scale(2.0); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // Alien ship recoils slightly
        if (window.moveAlienShip) {
            window.moveAlienShip(-0.8);
        }

        setTimeout(() => {
            laser.style.opacity = '0';
            setTimeout(() => {
                laser.remove();
                impact.remove();
                if (onImpact) onImpact();
            }, 100);
        }, 200);

    }, 250);
}
