// ============================================
// CẤU HÌNH HIỆU NĂNG
// ============================================
const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
if (IS_MOBILE) document.documentElement.classList.add('mobile');

const PERF = IS_MOBILE ? {
    fireworkInterval: 2200, maxPetals: 8, petalInterval: 2500,
    maxCursorTrail: 6, maxLanterns: 3, lanternInterval: 10000,
    particleTextCount: 600, starCount: 50, maxBgParticles: 5,
    bgParticleInterval: 6000
} : {
    fireworkInterval: 1200, maxPetals: 20, petalInterval: 1200,
    maxCursorTrail: 15, maxLanterns: 6, lanternInterval: 6000,
    particleTextCount: 2000, starCount: 120, maxBgParticles: 12,
    bgParticleInterval: 3000
};

// ---- CẤU HÌNH NỘI DUNG ----
const NEW_YEAR_DATE = new Date('2026-02-17T00:00:00+07:00');
const LOVER_NAME = 'Hoàng Thị Anh Thơ';
const MESSAGE_TEXT = 'Chúc mừng năm mới, Cô Gái nhỏ của anh..!\n\nChúc cho chúng ta năm mới luôn ngập tràn yêu thương, bình yên và những kỉ niệm đẹp mãi không quên.\n\nChúng ta có được nhau là duyên trời, hãy trân trọng tình yêu này mãi Em nhé!\n\nChúc mừng năm mới, bảo bối của đời Anh.\n\nChúc Em mạnh khỏe bình an và luôn nở nụ cười trong những năm mới nữa Em yêu nhé..!\n\n"我爱你，不是因为你是一个怎样的人，\n而是因为我喜欢与你在一起时的感觉" 💕\n\n\"Mãi Yêu Em\" 💕';
const BIRTHDAY_PASSCODE = '13/05/2006';

// ---- GLOBAL STATE ----
let canvas, ctx;
let musicPlaying = false;
let audioElement = null;
let currentPage = 0;
const totalPages = 4;
let pageNavLocked = true; // Khoá chuyển trang cho đến khi countdown về 0
let audioCtx = null;

// ============================================
// SFX - ÂM THANH TƯƠNG TÁC (Web Audio API)
// ============================================
function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

// Tiếng "Ting!" trong trẻo khi nhập đúng pass
function playSfxTing() {
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
        // Thêm harmonic
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1800, ctx.currentTime + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(3600, ctx.currentTime + 0.15);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc2.start(ctx.currentTime + 0.05);
        osc2.stop(ctx.currentTime + 0.5);
    } catch (e) { }
}

// Tiếng xé giấy / mở phong bì
function playSfxEnvelope() {
    try {
        const ctx = getAudioCtx();
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(6000, ctx.currentTime + 0.2);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start(ctx.currentTime);
    } catch (e) { }
}

// Tiếng pop nhỏ khi pháo hoa nổ
function playSfxPop() {
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        const baseFreq = 200 + Math.random() * 300;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    } catch (e) { }
}

// ============================================
// 1. MẬT MÃ SINH NHẬT
// ============================================
function initPasscode() {
    const input = document.getElementById('passcode-input');
    if (!input) return;

    // Auto format DD/MM/YYYY khi gõ
    input.addEventListener('input', function (e) {
        let val = this.value.replace(/\D/g, '');
        if (val.length > 8) val = val.slice(0, 8);
        if (val.length >= 5) {
            val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4);
        } else if (val.length >= 3) {
            val = val.slice(0, 2) + '/' + val.slice(2);
        }
        this.value = val;
    });

    // Enter để submit
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') checkPasscode();
    });

    // Tạo hearts nền
    const container = document.querySelector('.passcode-hearts');
    if (container) {
        const hearts = ['💕', '💖', '💗', '✨', '🌸'];
        for (let i = 0; i < 12; i++) {
            const h = document.createElement('span');
            h.className = 'welcome-heart';
            h.textContent = hearts[i % hearts.length];
            h.style.cssText = `left:${Math.random() * 90}%;top:${Math.random() * 90}%;font-size:${20 + Math.random() * 30}px;animation-delay:${Math.random() * 3}s`;
            container.appendChild(h);
        }
    }
}

function checkPasscode() {
    const input = document.getElementById('passcode-input');
    const error = document.getElementById('passcode-error');
    if (!input) return;

    if (input.value.trim() === BIRTHDAY_PASSCODE) {
        // SFX: Ting!
        playSfxTing();

        // Heart transition: trái tim phóng to lấp đầy màn hình
        const heartOverlay = document.getElementById('heart-transition');
        if (heartOverlay) heartOverlay.classList.add('active');

        // Sau 0.8s: ẩn passcode, hiện welcome
        setTimeout(() => {
            const screen = document.getElementById('passcode-screen');
            if (screen) screen.classList.add('hidden');

            const welcome = document.getElementById('welcome');
            if (welcome) welcome.classList.remove('hidden');
        }, 800);

        // Sau 1.8s: ẩn heart overlay
        setTimeout(() => {
            if (heartOverlay) heartOverlay.classList.remove('active');
        }, 1800);

        // Particle text
        setTimeout(startParticleText, 1000);
    } else {
        // Sai
        input.classList.add('shake');
        if (error) error.classList.add('show');
        setTimeout(() => {
            input.classList.remove('shake');
        }, 500);
        setTimeout(() => {
            if (error) error.classList.remove('show');
        }, 2500);
    }
}

// ============================================
// 2. WELCOME & MỞ THƯ
// ============================================
function initWelcome() {
    const container = document.querySelector('.welcome-hearts');
    if (!container) return;
    const hearts = ['💕', '💖', '💗', '✨', '🌸', '💝'];
    for (let i = 0; i < 15; i++) {
        const h = document.createElement('span');
        h.className = 'welcome-heart';
        h.textContent = hearts[i % hearts.length];
        h.style.cssText = `left:${Math.random() * 90}%;top:${Math.random() * 90}%;font-size:${20 + Math.random() * 30}px;animation-delay:${Math.random() * 4}s`;
        container.appendChild(h);
    }
}

let envelopeOpened = false;

function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;

    // SFX: Xé giấy / mở phong bì
    playSfxEnvelope();

    // Mở nắp phong bì + rút thư lên
    const envelope = document.getElementById('envelope-3d');
    if (envelope) {
        envelope.classList.add('opened');
        // Dừng animation float
        envelope.style.animation = 'none';
    }

    // Sau khi animation phong bì xong → chuyển cảnh
    setTimeout(() => {
        openLetter();
    }, 2000);
}

function openLetter() {
    const welcome = document.getElementById('welcome');
    if (welcome) welcome.classList.add('hidden');

    const main = document.getElementById('main-content');
    if (main) main.classList.add('visible');

    setTimeout(() => {
        initFireworks();
        startFireworks();
        startPetals();
        startCountdown();
        if (!IS_MOBILE) startCursorTrail();
        startLanterns();
        startBackgroundParticles();
        tryPlayMusic();
        initPageNav();
    }, 300);
}

// ============================================
// 3. COUNTDOWN
// ============================================
let countdownDone = false;

function startCountdown() {
    function update() {
        const now = new Date().getTime();
        const diff = NEW_YEAR_DATE.getTime() - now;

        if (diff <= 0) {
            if (!countdownDone) {
                countdownDone = true;
                document.querySelector('.countdown-timer').style.display = 'none';
                document.querySelector('.countdown-complete').classList.add('show');
                for (let i = 0; i < 8; i++) setTimeout(launchFirework, i * 300);
                spawnConfetti(IS_MOBILE ? 20 : 50);
                showVideo();
                // Mở khoá chuyển trang sau khi các event giao thừa chạy xong
                scheduleUnlockPageNav();
            }
            return;
        }

        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        const de = document.getElementById('days');
        const he = document.getElementById('hours');
        const me = document.getElementById('minutes');
        const se = document.getElementById('seconds');
        if (de) de.textContent = String(d).padStart(2, '0');
        if (he) he.textContent = String(h).padStart(2, '0');
        if (me) me.textContent = String(m).padStart(2, '0');
        if (se) se.textContent = String(s).padStart(2, '0');
    }
    update();
    setInterval(update, 1000);
}

// ============================================
// 4. PHÁO HOA (CLICK ĐỂ BẮN)
// ============================================
let rockets = [];
let explosionParticles = [];
let fireworksRunning = false;

function initFireworks() {
    canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
        if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    });

    // Click / Touch Để Bắn Pháo Hoa Tại Vị Trí Chạm
    canvas.style.pointerEvents = 'none'; // Canvas không bắt event
    document.addEventListener('click', handleFireworkClick);
    document.addEventListener('touchstart', handleFireworkTouch, { passive: true });
}

function handleFireworkClick(e) {
    // Kiểm tra không bắn khi đang ở overlay/lightbox/passcode
    if (isOverlayActive()) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    explodeAt(x * (canvas.width / rect.width), y * (canvas.height / rect.height));
}

function handleFireworkTouch(e) {
    if (isOverlayActive()) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = canvas.getBoundingClientRect();
    explodeAt(touch.clientX * (canvas.width / rect.width), touch.clientY * (canvas.height / rect.height));
}

function isOverlayActive() {
    const lightbox = document.getElementById('lightbox');
    const passcode = document.getElementById('passcode-screen');
    const welcome = document.getElementById('welcome');
    if (lightbox && lightbox.classList.contains('active')) return true;
    if (passcode && !passcode.classList.contains('hidden')) return true;
    if (welcome && !welcome.classList.contains('hidden')) return true;
    return false;
}

function explodeAt(x, y) {
    if (!ctx) return;
    playSfxPop(); // SFX: pop lách tách
    const type = Math.random();
    const count = IS_MOBILE ? 30 + Math.floor(Math.random() * 20) : 60 + Math.floor(Math.random() * 40);
    const palette = [
        () => `hsl(${350 + Math.random() * 20}, 100%, ${60 + Math.random() * 25}%)`,
        () => `hsl(${40 + Math.random() * 20}, 100%, ${55 + Math.random() * 25}%)`,
        () => `hsl(${280 + Math.random() * 40}, 80%, ${60 + Math.random() * 25}%)`,
        () => `hsl(${180 + Math.random() * 40}, 80%, ${55 + Math.random() * 30}%)`,
    ];
    const color = palette[Math.floor(Math.random() * palette.length)];

    if (type < 0.3) {
        // Ring
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 3 + Math.random() * 0.5;
            explosionParticles.push(new Particle(x, y, color(), Math.cos(angle) * speed, Math.sin(angle) * speed, 1.8 + Math.random(), 60 + Math.random() * 30));
        }
    } else if (type < 0.6) {
        // Blossom
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.2 + Math.random() * 2.5;
            explosionParticles.push(new Particle(x, y, color(), Math.cos(angle) * speed, Math.sin(angle) * speed, 1 + Math.random(), 90 + Math.random() * 50));
        }
    } else {
        // Standard
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 2 + Math.random() * 3.5;
            explosionParticles.push(new Particle(x, y, color(), Math.cos(angle) * speed, Math.sin(angle) * speed, 1.3 + Math.random() * 1.5, 55 + Math.random() * 40));
        }
    }
}

class Particle {
    constructor(x, y, color, vx, vy, size, life) {
        this.x = x; this.y = y; this.color = color;
        this.vx = vx; this.vy = vy;
        this.size = size; this.life = life; this.maxLife = life;
        this.gravity = 0.025;
        this.friction = 0.985;
    }
    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }
    draw() {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        if (alpha > 0.4) {
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * alpha * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    isDead() { return this.life <= 0; }
}

class Rocket {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.tx = canvas.width * 0.15 + Math.random() * canvas.width * 0.7;
        this.ty = canvas.height * 0.1 + Math.random() * canvas.height * 0.3;
        this.speed = 4 + Math.random() * 2;
        this.exploded = false;
        const dx = this.tx - this.x, dy = this.ty - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
        this.trail = [];
    }
    update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 8) this.trail.shift();
        this.trail.forEach(t => t.alpha -= 0.12);
        this.x += this.vx;
        this.y += this.vy;
        if (Math.abs(this.x - this.tx) < 15 && Math.abs(this.y - this.ty) < 15) {
            this.exploded = true;
            explodeAt(this.x, this.y);
        }
    }
    draw() {
        for (const t of this.trail) {
            if (t.alpha <= 0) continue;
            ctx.globalAlpha = t.alpha * 0.6;
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function launchFirework() {
    if (!canvas) return;
    rockets.push(new Rocket());
}

function animateFireworks() {
    if (!fireworksRunning || !ctx) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    for (const r of rockets) { r.update(); r.draw(); }
    rockets = rockets.filter(r => !r.exploded);

    for (const p of explosionParticles) { p.update(); p.draw(); }
    explosionParticles = explosionParticles.filter(p => !p.isDead());

    ctx.globalAlpha = 1;
    requestAnimationFrame(animateFireworks);
}

function startFireworks() {
    fireworksRunning = true;
    animateFireworks();
    setInterval(() => {
        launchFirework();
        if (!IS_MOBILE && Math.random() > 0.6) setTimeout(launchFirework, 150);
    }, PERF.fireworkInterval);
    for (let i = 0; i < (IS_MOBILE ? 2 : 5); i++) setTimeout(launchFirework, i * 300);
}

// ============================================
// 5. HOA ĐÀO RƠI
// ============================================
let petalCount = 0;
const petalSymbols = ['🌸', '🏵️', '💮'];

function createPetal() {
    if (petalCount >= PERF.maxPetals) return;
    petalCount++;
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = petalSymbols[Math.floor(Math.random() * petalSymbols.length)];
    const duration = 8 + Math.random() * 6;
    petal.style.cssText = `left:${Math.random() * 100}%;font-size:${14 + Math.random() * 12}px;animation-duration:${duration}s`;
    document.body.appendChild(petal);
    setTimeout(() => { petal.remove(); petalCount--; }, duration * 1000);
}

function startPetals() {
    for (let i = 0; i < (IS_MOBILE ? 2 : 5); i++) setTimeout(createPetal, i * 500);
    setInterval(createPetal, PERF.petalInterval);
}

// ============================================
// 6. TYPING EFFECT
// ============================================
let typingStarted = false;
let typingDone = false;

function startTyping() {
    if (typingStarted) return;
    typingStarted = true;

    const textEl = document.querySelector('.message-text');
    const sigEl = document.querySelector('.message-signature');
    if (!textEl) return;

    const chars = MESSAGE_TEXT.split('');
    let idx = 0;
    let html = '';

    textEl.innerHTML = '<span class="cursor"></span>';

    function typeNext() {
        if (idx >= chars.length) {
            textEl.innerHTML = html.replace(/\n/g, '<br>');
            if (sigEl) sigEl.classList.add('show');
            typingDone = true;
            return;
        }
        const ch = chars[idx];
        html += ch;
        textEl.innerHTML = html.replace(/\n/g, '<br>') + '<span class="cursor"></span>';
        idx++;
        const delay = ch === '.' ? 100 : ch === ',' ? 70 : ch === '!' ? 80 : ch === '\n' ? 200 : 25 + Math.random() * 25;
        setTimeout(typeNext, delay);
    }
    setTimeout(typeNext, 800);
}

// ============================================
// 7. CONFETTI
// ============================================
function spawnConfetti(count) {
    const colors = ['#ff6b9d', '#ffd700', '#ff4466', '#c084fc', '#ff9ec5', '#7dd3fc'];
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        const size = 6 + Math.random() * 8;
        const x = Math.random() * window.innerWidth;
        const dur = 2 + Math.random() * 2;
        el.style.cssText = `left:${x}px;top:-10px;width:${size}px;height:${size * 0.6}px;background:${colors[Math.floor(Math.random() * colors.length)]};animation-duration:${dur}s;animation-delay:${Math.random() * 0.5}s;border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), (dur + 0.5) * 1000);
    }
}

// ============================================
// 8. GIFT BOX
// ============================================
let giftOpened = false;

function openGift() {
    if (giftOpened) return;
    giftOpened = true;
    const box = document.querySelector('.gift-box');
    const msg = document.querySelector('.gift-message');
    if (box) box.classList.add('opened');
    setTimeout(() => {
        if (msg) msg.classList.add('show');
        spawnConfetti(IS_MOBILE ? 10 : 30);
    }, 800);
}

// ============================================
// 9. MUSIC CONTROL
// ============================================
function tryPlayMusic() {
    audioElement = document.getElementById('bg-music');
    if (audioElement) {
        audioElement.volume = 0.5;
        const playPromise = audioElement.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                musicPlaying = true;
                updateMusicBtn(true);
            }).catch(error => {
                console.log("Autoplay prevented. Waiting for interaction.");
                document.addEventListener('click', playMusicOnInteraction, { once: true });
                document.addEventListener('touchstart', playMusicOnInteraction, { once: true });
            });
        }
    }
}

function playMusicOnInteraction() {
    if (audioElement && audioElement.paused) {
        audioElement.play().then(() => {
            musicPlaying = true;
            updateMusicBtn(true);
        }).catch(e => console.error("Audio play failed:", e));
    }
}

function toggleMusic() {
    if (musicPlaying) {
        musicPlaying = false;
        updateMusicBtn(false);
        if (audioElement && !audioElement.paused) audioElement.pause();
    } else {
        musicPlaying = true;
        updateMusicBtn(true);
        if (audioElement) {
            audioElement.play().catch(e => console.error("Audio play failed:", e));
        }
    }
}

function updateMusicBtn(playing) {
    const btn = document.querySelector('.music-btn');
    if (!btn) return;
    btn.textContent = playing ? '🎵' : '🔇';
    btn.classList.toggle('playing', playing);
}

// ============================================
// 10. VIDEO OVERLAY
// ============================================
function checkVideo() {
    const now = new Date();
    const diff = NEW_YEAR_DATE.getTime() - now.getTime();
    if (diff <= 0 && diff > -3600000) {
        showVideo();
    }
}

function showVideo() {
    const overlay = document.getElementById('video-overlay');
    const video = document.getElementById('celebration-video');
    if (!overlay || !video) return;
    overlay.classList.add('active');
    video.play().catch(() => { });
    video.addEventListener('ended', () => {
        overlay.classList.remove('active');
    });
}

// ============================================
// 11. CURSOR TRAIL
// ============================================
let trailCount = 0;

function startCursorTrail() {
    const hearts = ['💕', '💖', '💗', '✨', '💝'];
    let lastTime = 0;

    function createTrailHeart(x, y) {
        if (trailCount >= PERF.maxCursorTrail) return;
        const now = Date.now();
        if (now - lastTime < 50) return;
        lastTime = now;
        trailCount++;

        const el = document.createElement('span');
        el.className = 'cursor-heart';
        el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        el.style.cssText = `left:${x}px;top:${y}px;font-size:${10 + Math.random() * 12}px`;
        document.body.appendChild(el);
        setTimeout(() => { el.remove(); trailCount--; }, 1000);
    }

    document.addEventListener('mousemove', e => createTrailHeart(e.clientX, e.clientY), { passive: true });
    document.addEventListener('touchmove', e => {
        const touch = e.touches[0];
        if (touch) createTrailHeart(touch.clientX, touch.clientY);
    }, { passive: true });
}

// ============================================
// 12. ĐÈN LỒNG BAY LÊN TRỜI
// ============================================
let lanternCount = 0;

function createLantern() {
    if (lanternCount >= PERF.maxLanterns) return;
    lanternCount++;

    const el = document.createElement('div');
    el.className = 'lantern';
    el.innerHTML = '<div class="lantern-body"><div class="lantern-glow"></div></div>';
    const duration = 12 + Math.random() * 8;
    const startX = 5 + Math.random() * 90;
    el.style.cssText = `left:${startX}%;animation-duration:${duration}s`;
    document.body.appendChild(el);
    setTimeout(() => { el.remove(); lanternCount--; }, duration * 1000);
}

function startLanterns() {
    createLantern();
    setTimeout(createLantern, 2000);
    setInterval(createLantern, PERF.lanternInterval);
}

// ============================================
// 13. PARTICLE TEXT
// ============================================
let ptCanvas, ptCtx, ptParticles = [], ptRunning = false;

function startParticleText() {
    ptCanvas = document.getElementById('particle-text-canvas');
    if (!ptCanvas) return;
    ptCtx = ptCanvas.getContext('2d');
    ptCanvas.width = window.innerWidth;
    ptCanvas.height = window.innerHeight;

    const overlay = document.getElementById('particle-text-overlay');
    if (overlay) overlay.classList.add('active');

    const temp = document.createElement('canvas');
    const tCtx = temp.getContext('2d');
    temp.width = ptCanvas.width;
    temp.height = ptCanvas.height;

    // Dùng Great Vibes cho đẹp, nhưng xử lý kỹ sai số đo
    let fs = Math.min(ptCanvas.width / 6, 100);
    tCtx.font = `bold ${fs}px 'Great Vibes', 'Quicksand', sans-serif`;

    // Giảm font cho đến khi vừa 70% chiều rộng để chừa chỗ cho nét uốn lượn
    while (tCtx.measureText(LOVER_NAME).width > ptCanvas.width * 0.7) {
        fs -= 2;
        tCtx.font = `bold ${fs}px 'Great Vibes', 'Quicksand', sans-serif`;
        if (fs < 20) break;
    }

    tCtx.fillStyle = '#fff';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';

    // Vẽ chữ thấp xuống một chút (offset y + 15) để tránh mất dấu mũ/nét trên
    tCtx.fillText(LOVER_NAME, temp.width / 2, temp.height / 2 + 15);

    const imageData = tCtx.getImageData(0, 0, temp.width, temp.height);
    const positions = [];
    const gap = IS_MOBILE ? 4 : 3;

    for (let y = 0; y < temp.height; y += gap) {
        for (let x = 0; x < temp.width; x += gap) {
            if (imageData.data[(y * temp.width + x) * 4 + 3] > 128) {
                positions.push({ x, y });
            }
        }
    }

    const selected = [];
    const maxParticles = IS_MOBILE ? 800 : 2500;
    const max = Math.min(positions.length, maxParticles);
    const step = Math.max(1, Math.floor(positions.length / max));

    for (let i = 0; i < positions.length && selected.length < max; i += step) {
        selected.push(positions[i]);
    }

    const colors = ['#ffd700', '#ff6b9d', '#ff9ec5', '#ffe44d', '#ffffff', '#ff4466'];
    ptParticles = selected.map(pos => ({
        x: Math.random() * ptCanvas.width,
        y: Math.random() * ptCanvas.height,
        tx: pos.x, ty: pos.y,
        size: IS_MOBILE ? (2.5 + Math.random() * 1.5) : (2 + Math.random() * 1.5),
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.05 + Math.random() * 0.05,
    }));

    ptRunning = true;
    let startTime = Date.now();

    function animate() {
        if (!ptRunning) return;
        ptCtx.clearRect(0, 0, ptCanvas.width, ptCanvas.height);
        const elapsed = Date.now() - startTime;

        for (const p of ptParticles) {
            if (elapsed < 2000) {
                p.x += (p.tx - p.x) * 0.08;
                p.y += (p.ty - p.y) * 0.08;
            } else if (elapsed < 5000) {
                const flutterX = Math.sin(elapsed * 0.005 + p.y * 0.01) * 0.5;
                const flutterY = Math.cos(elapsed * 0.005 + p.x * 0.01) * 0.5;
                p.x = p.tx + flutterX;
                p.y = p.ty + flutterY;
            } else {
                p.x += (Math.cos(elapsed * 0.002 + p.y) * 5);
                p.y -= Math.random() * 3;
                p.size *= 0.95;
            }

            let alpha = 1;
            if (elapsed < 500) alpha = elapsed / 500;
            else if (elapsed > 4500) alpha = Math.max(0, 1 - (elapsed - 4500) / 1000);

            ptCtx.globalAlpha = alpha;
            ptCtx.fillStyle = p.color;
            ptCtx.beginPath();
            ptCtx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
            ptCtx.fill();
        }

        if (elapsed < 6000) {
            requestAnimationFrame(animate);
        } else {
            ptRunning = false;
            ptCtx.clearRect(0, 0, ptCanvas.width, ptCanvas.height);
            if (overlay) overlay.classList.remove('active');
        }
    }
    animate();
}

// ============================================
// 14. PARALLAX (DISABLED - PAGE MODE)
// ============================================

// ============================================
// 15. SHAKE DETECTION
// ============================================
function initShakeDetection() {
    if (!IS_MOBILE) return;
    let lastShake = 0;

    function handleShake(e) {
        const acc = e.accelerationIncludingGravity;
        if (!acc) return;
        const force = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
        if (force > 35 && Date.now() - lastShake > 1500) {
            lastShake = Date.now();
            for (let i = 0; i < 4; i++) setTimeout(launchFirework, i * 200);
            spawnConfetti(IS_MOBILE ? 15 : 30);
        }
    }

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        document.addEventListener('click', function iosPermission() {
            DeviceMotionEvent.requestPermission().then(p => {
                if (p === 'granted') window.addEventListener('devicemotion', handleShake, { passive: true });
            }).catch(() => { });
            document.removeEventListener('click', iosPermission);
        }, { once: true });
    } else {
        window.addEventListener('devicemotion', handleShake, { passive: true });
    }
}

// ============================================
// 16. PAGE NAVIGATION (Thay thế scroll)
// ============================================
function initPageNav() {
    // Tạo dots
    const dotsContainer = document.getElementById('page-dots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('div');
        dot.className = 'page-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goToPage(i);
        dotsContainer.appendChild(dot);
    }

    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (isOverlayActive()) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') changePage(1);
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') changePage(-1);
    });

    // Swipe trên mobile
    let touchStartX = 0, touchStartY = 0;
    const main = document.getElementById('main-content');
    if (!main) return;

    main.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    main.addEventListener('touchend', e => {
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;
        // Chỉ khi swipe ngang rõ ràng hơn dọc
        if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
            changePage(diffX > 0 ? -1 : 1);
        }
    }, { passive: true });
}

// Lên lịch mở khoá chuyển trang sau event giao thừa
function scheduleUnlockPageNav() {
    const video = document.getElementById('celebration-video');

    if (video && video.duration) {
        // Đợi video kết thúc + 1s buffer
        video.addEventListener('ended', () => {
            setTimeout(unlockPageNav, 1000);
        });
        // Fallback: nếu video lỗi hoặc quá dài, mở sau 15s
        setTimeout(unlockPageNav, 15000);
    } else {
        // Không có video → mở sau 5s (chờ pháo hoa + confetti)
        setTimeout(unlockPageNav, 5000);
    }
}

function unlockPageNav() {
    if (!pageNavLocked) return; // Đã mở rồi
    pageNavLocked = false;

    // Hiện page navigation
    const nav = document.getElementById('page-nav');
    if (nav) {
        nav.style.opacity = '1';
        nav.style.pointerEvents = 'auto';
    }

    // Hiện page-hint "Vuốt hoặc nhấn → để sang trang"
    const hint = document.querySelector('.page-hint');
    if (hint) hint.style.opacity = '1';

    // Bắt đầu auto-play chuyển trang
    setTimeout(startAutoPlay, 2000);
}

function changePage(direction) {
    if (pageNavLocked) return; // Khoá khi chưa đến giao thừa
    const newPage = currentPage + direction;
    if (newPage < 0 || newPage >= totalPages) return;
    goToPage(newPage);
}

function goToPage(pageIndex) {
    if (pageNavLocked) return; // Khoá khi chưa đến giao thừa
    if (pageIndex === currentPage || pageIndex < 0 || pageIndex >= totalPages) return;

    const goingForward = pageIndex > currentPage;
    const allPages = document.querySelectorAll('.page');

    // Dọn sạch class cũ cho TẤT CẢ pages
    allPages.forEach(p => {
        p.classList.remove('active', 'slide-out-left', 'slide-out-right', 'enter-from-left', 'enter-from-right');
    });

    const oldPageEl = document.getElementById('page-' + currentPage);
    const newPageEl = document.getElementById('page-' + pageIndex);

    // Trang cũ trượt ra
    if (oldPageEl) {
        oldPageEl.classList.add(goingForward ? 'slide-out-left' : 'slide-out-right');
    }

    // Trang mới: đặt vị trí bắt đầu (không transition), rồi animate vào
    if (newPageEl) {
        // Bước 1: đặt vô vị trí bên phải (đi tới) hoặc bên trái (đi lùi)
        newPageEl.classList.add(goingForward ? 'enter-from-right' : 'enter-from-left');
        newPageEl.offsetHeight; // Force reflow

        // Bước 2: thêm active → transition sẽ animate từ vị trí enter → translateX(0)
        newPageEl.classList.remove('enter-from-right', 'enter-from-left');
        newPageEl.classList.add('active');
    }

    currentPage = pageIndex;
    updateDots();

    // Trigger typing khi sang trang lời chúc
    if (pageIndex === 1) setTimeout(startTyping, 500);

    // Cleanup: dọn class slide-out sau khi animation xong
    setTimeout(() => {
        if (oldPageEl) {
            oldPageEl.classList.remove('slide-out-left', 'slide-out-right');
        }
    }, 800);
}

function updateDots() {
    const dots = document.querySelectorAll('.page-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === currentPage));
}

// ============================================
// 17. AUTO-PLAY (chuyển trang tự động)
// ============================================
function startAutoPlay() {
    // Sau 8s ở countdown → sang lời chúc
    setTimeout(() => {
        goToPage(1);
        waitForTypingThenNext();
    }, 8000);
}

function waitForTypingThenNext() {
    const check = setInterval(() => {
        if (typingDone) {
            clearInterval(check);
            // Sau typing 3s → sang gallery
            setTimeout(() => {
                goToPage(2);
                // 6s xem ảnh → sang gift
                setTimeout(() => {
                    goToPage(3);
                    setTimeout(openGift, 2000);
                }, 6000);
            }, 3000);
        }
    }, 500);
}

// ============================================
// 18. STARFIELD
// ============================================
function initStarfield() {
    const container = document.getElementById('starfield');
    if (!container) return;
    for (let i = 0; i < PERF.starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = 1 + Math.random() * 2;
        star.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-duration:${2 + Math.random() * 4}s;animation-delay:${Math.random() * 4}s`;
        if (Math.random() > 0.7) star.style.background = '#ffd700';
        container.appendChild(star);
    }
}

// ============================================
// 19. BACKGROUND PARTICLES
// ============================================
let bgPCount = 0;

function createBackgroundParticle() {
    if (bgPCount >= PERF.maxBgParticles) return;
    bgPCount++;
    const el = document.createElement('span');
    el.className = 'bg-particle';
    const symbols = ['💕', '✨', '⭐', '💖'];
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const duration = 15 + Math.random() * 15;
    el.style.cssText = `left:${Math.random() * 100}%;font-size:${10 + Math.random() * 10}px;animation-duration:${duration}s;animation-delay:${Math.random() * 3}s`;
    document.body.appendChild(el);
    setTimeout(() => { el.remove(); bgPCount--; }, (duration + 3) * 1000);
}

function startBackgroundParticles() {
    for (let i = 0; i < (IS_MOBILE ? 2 : 5); i++) setTimeout(createBackgroundParticle, i * 1000);
    setInterval(createBackgroundParticle, PERF.bgParticleInterval);
}

// ============================================
// 20. LIGHTBOX GALLERY
// ============================================
const galleryImages = [
    'anh/z7538148079369_3b58fabb2458d542f45aefeebda582c7.jpg',
    'anh/z7538148093159_dacd11dcaad58e8e406992b324ca4f2f.jpg',
    'anh/z7538148094666_23071c33da61f65b1d9e2db02f653a92.jpg',
    'anh/z7538148096271_3e4d0bae9afa7e4f63c6d4238af9b7f6.jpg',
    'anh/z7538148098402_2769a9f1161dc0a42d9e278b22d51cbc.jpg',
    'anh/z7538148099395_4ae7117b33d731b95866a1bf7b777b2c.jpg',
    'anh/z7538148099754_e8a7d114bfc8bbdf388bf294299ca603.jpg',
    'anh/z7538148103158_ba5320d36f22d72e295cfb8bd9cab7b6.jpg',
    'anh/z7538148108267_0cf240873128321c89c46a28f268666e.jpg',
    'anh/z7538148110785_51ea48c139aa8111b43dcb59c1f08972.jpg',
    'anh/z7538148121807_f9aaa722193a0105f902a313114fc49a.jpg',
    'anh/z7538148123540_7080aabd5aede31a0b3faf656633d788.jpg',
    'anh/z7538148126717_a306674fd19fe2921ae5ab4fe4e695c3.jpg',
];
let currentLightboxIndex = 0;

function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    if (!lightbox || !img) return;

    img.src = galleryImages[index];
    counter.textContent = `${index + 1} / ${galleryImages.length}`;
    lightbox.classList.add('active');
}

function closeLightbox(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('lightbox-close')) return;
    const lightbox = document.getElementById('lightbox');
    if (lightbox) lightbox.classList.remove('active');
}

function changeLightboxImage(direction, event) {
    if (event) event.stopPropagation();
    currentLightboxIndex += direction;
    if (currentLightboxIndex < 0) currentLightboxIndex = galleryImages.length - 1;
    if (currentLightboxIndex >= galleryImages.length) currentLightboxIndex = 0;

    const img = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    if (img) img.src = galleryImages[currentLightboxIndex];
    if (counter) counter.textContent = `${currentLightboxIndex + 1} / ${galleryImages.length}`;
}

// Phím tắt lightbox
document.addEventListener('keydown', e => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') changeLightboxImage(-1);
    if (e.key === 'ArrowRight') changeLightboxImage(1);
});

// Swipe lightbox (mobile)
(function initLightboxSwipe() {
    let touchStartX = 0;
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(diff) > 50) changeLightboxImage(diff > 0 ? -1 : 1);
    }, { passive: true });
})();

// ============================================
// 21. 3D TILT CHO POLAROID
// ============================================
function initPolaroidTilt() {
    if (IS_MOBILE) return; // Chỉ trên PC
    const gallery = document.getElementById('polaroid-gallery');
    if (!gallery) return;

    gallery.addEventListener('mousemove', (e) => {
        const cards = gallery.querySelectorAll('.polaroid');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;
            const dist = Math.sqrt(mouseX * mouseX + mouseY * mouseY);

            // Chỉ tilt nếu chuột gần card (< 250px)
            if (dist < 250) {
                const rotateY = (mouseX / rect.width) * 15; // max 15 degree
                const rotateX = -(mouseY / rect.height) * 15;
                const intensity = 1 - Math.min(dist / 250, 1);
                card.style.transform = `perspective(600px) rotateX(${rotateX * intensity}deg) rotateY(${rotateY * intensity}deg) scale(${1 + intensity * 0.05})`;
                card.style.boxShadow = `${-rotateY * 0.5}px ${rotateX * 0.5}px 30px rgba(255, 107, 157, ${0.15 + intensity * 0.2}), 0 5px 15px rgba(0,0,0,0.3)`;
            } else {
                card.style.transform = `rotate(${getComputedStyle(card).getPropertyValue('--rotate') || '0deg'})`;
                card.style.boxShadow = '';
            }
        });
    });

    gallery.addEventListener('mouseleave', () => {
        gallery.querySelectorAll('.polaroid').forEach(card => {
            card.style.transform = `rotate(${getComputedStyle(card).getPropertyValue('--rotate') || '0deg'})`;
            card.style.boxShadow = '';
        });
    });
}

// ============================================
// KHỞI TẠO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initPasscode();
    initWelcome();
    initStarfield();
    checkVideo();
    initShakeDetection();
    initPolaroidTilt();
});
