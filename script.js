// ============================================
// TRANG WEB CHÚC MỪNG NĂM MỚI - V2 NÂNG CẤP
// Tối ưu hiệu năng + Tính năng mới
// ============================================

// ---- PHÁT HIỆN THIẾT BỊ ----
const IS_MOBILE = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth <= 768;

// ---- CẤU HÌNH HIỆU NĂNG ----
const PERF = {
    fireworkInterval: IS_MOBILE ? 2000 : 700,
    fireworkParticles: IS_MOBILE ? 30 : 80,
    petalInterval: IS_MOBILE ? 4000 : 1200,
    maxPetals: IS_MOBILE ? 4 : 15,
    maxBgParticles: IS_MOBILE ? 3 : 10,
    bgParticleInterval: IS_MOBILE ? 8000 : 3000,
    maxCursorTrail: IS_MOBILE ? 8 : 20,
    lanternInterval: IS_MOBILE ? 10000 : 5000,
    maxLanterns: IS_MOBILE ? 2 : 5,
    starCount: IS_MOBILE ? 20 : 60,
    particleTextCount: IS_MOBILE ? 200 : 600,
};

// ---- CẤU HÌNH NỘI DUNG ----
const NEW_YEAR_DATE = new Date('2026-02-18T00:00:00+07:00');
const LOVER_NAME = 'Hoàng Thị Anh Thơ';
const MESSAGE_TEXT = 'Chúc mừng năm mới, Cô Gái nhỏ của anh..!\n\nChúc cho chúng ta năm mới luôn ngập tràn yêu thương, bình yên và những kỉ niệm đẹp mãi không quên.\n\nChúng ta có được nhau là duyên trời, hãy trân trọng tình yêu này mãi Em nhé!\n\nChúc mừng năm mới, tình yêu của đời Anh.\n\nChúc Em mạnh khỏe bình an và luôn nở nụ cười như những năm mới nữa Em yêu nhé..!\n\n"Mãi Yêu Em" 💕';

// Thêm class cho body nếu mobile
if (IS_MOBILE) document.documentElement.classList.add('mobile');

// ============================================
// 1. WELCOME SCREEN
// ============================================
function initWelcome() {
    const heartsContainer = document.querySelector('.welcome-hearts');
    if (!heartsContainer) return;
    const symbols = ['💕', '💖', '💗', '✨', '🌸', '💝'];
    const count = IS_MOBILE ? 12 : 25;

    for (let i = 0; i < count; i++) {
        const heart = document.createElement('span');
        heart.className = 'welcome-heart';
        heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        heart.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${Math.random() * 6}s;animation-duration:${4 + Math.random() * 4}s;font-size:${16 + Math.random() * 20}px`;
        heartsContainer.appendChild(heart);
    }
}

function openLetter() {
    const welcome = document.querySelector('.welcome-screen');
    const main = document.querySelector('.main-content');
    const ptOverlay = document.getElementById('particle-text-overlay');

    welcome.classList.add('hidden');

    // Hiện particle text trước
    if (ptOverlay) {
        ptOverlay.classList.add('active');
        startParticleText();
        setTimeout(() => {
            ptOverlay.classList.remove('active');
            main.classList.add('visible');
            startEverything();
        }, 5500);
    } else {
        main.classList.add('visible');
        startEverything();
    }
}

function startEverything() {
    startCountdown();
    startPetals();
    startFireworks();
    startBackgroundParticles();
    startLanterns();
    startCursorTrail();
    initParallax();
    initShakeDetection();
    startAutoPlay();
    tryPlayMusic();
}

// ============================================
// 2. COUNTDOWN
// ============================================
let countdownInterval;
let isNewYear = false;

function startCountdown() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    const diff = NEW_YEAR_DATE - now;

    if (diff <= 0 && !isNewYear) {
        isNewYear = true;
        clearInterval(countdownInterval);
        const timer = document.querySelector('.countdown-timer');
        const year = document.querySelector('.countdown-year');
        const complete = document.querySelector('.countdown-complete');
        if (timer) timer.style.display = 'none';
        if (year) year.style.display = 'none';
        if (complete) complete.classList.add('show');
        triggerGiaoThua();
        return;
    }
    if (diff <= 0) return;

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    setText('days', String(d).padStart(2, '0'));
    setText('hours', String(h).padStart(2, '0'));
    setText('minutes', String(m).padStart(2, '0'));
    setText('seconds', String(s).padStart(2, '0'));
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el && el.textContent !== text) el.textContent = text;
}

// ============================================
// 3. GIAO THỪA - VIDEO + CELEBRATION
// ============================================
let hasVideo = false;

function checkVideo() {
    const video = document.getElementById('celebration-video');
    if (!video) return;
    const source = video.querySelector('source') || video;
    if (source.src || source.getAttribute('src')) {
        video.addEventListener('canplay', () => { hasVideo = true; }, { once: true });
        video.addEventListener('error', () => { hasVideo = false; });
        video.load();
    }
}

function triggerGiaoThua() {
    // Bắn pháo hoa dữ dội
    for (let i = 0; i < 8; i++) {
        setTimeout(() => launchFirework(), i * 250);
    }
    spawnConfetti(50);

    if (hasVideo) {
        playVideo();
    }
}

function playVideo() {
    const overlay = document.getElementById('video-overlay');
    const video = document.getElementById('celebration-video');
    if (!overlay || !video) return;

    overlay.classList.add('active');
    video.play().catch(() => {
        overlay.classList.remove('active');
    });

    video.addEventListener('ended', () => {
        overlay.classList.remove('active');
    }, { once: true });
}

// ============================================
// 4. PHÁO HOA NÂNG CAO (Canvas 2D)
// ============================================
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let rockets = [];
let explosionParticles = [];
let fireworksRunning = false;

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas, { passive: true });
resizeCanvas();

const PALETTES = [
    ['#ff6b9d', '#ff9ec5', '#ffb6d3'],
    ['#ffd700', '#ffe44d', '#fff176'],
    ['#c084fc', '#d8b4fe', '#e9d5ff'],
    ['#fb923c', '#fdba74', '#fed7aa'],
    ['#f472b6', '#f9a8d4', '#fbcfe8'],
    ['#ff4466', '#ff6b81', '#ff8fa3'],
    ['#60a5fa', '#93c5fd', '#bfdbfe'],
    ['#34d399', '#6ee7b7', '#a7f3d0'],
];

class Rocket {
    constructor() {
        this.x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        this.y = canvas.height + 5;
        this.targetY = Math.random() * canvas.height * 0.35 + canvas.height * 0.08;
        this.speed = 4 + Math.random() * 3;
        this.palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        this.color = this.palette[0];
        this.exploded = false;
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.trail = [];
    }
    update() {
        this.trail.push({ x: this.x, y: this.y, a: 1 });
        if (this.trail.length > 8) this.trail.shift();
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.02;
        if (this.y <= this.targetY) {
            this.exploded = true;
            createExplosion(this.x, this.y, this.palette);
        }
    }
    draw() {
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const a = (i / this.trail.length) * 0.5;
            ctx.globalAlpha = a;
            ctx.fillStyle = this.color;
            ctx.fillRect(t.x - 1, t.y - 1, 2, 2);
        }
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color, vx, vy, size, life) {
        this.x = x; this.y = y; this.color = color;
        this.vx = vx; this.vy = vy;
        this.size = size; this.life = life; this.maxLife = life;
    }
    update() {
        this.vx *= 0.975;
        this.vy *= 0.975;
        this.vy += 0.03;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }
    draw() {
        const a = this.life / this.maxLife;
        ctx.globalAlpha = a;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size * a, this.y - this.size * a, this.size * 2 * a, this.size * 2 * a);
    }
    isDead() { return this.life <= 0; }
}

function createExplosion(x, y, palette) {
    const types = ['circle', 'circle', 'heart', 'ring', 'star', 'willow'];
    const type = types[Math.floor(Math.random() * types.length)];
    const count = PERF.fireworkParticles;
    const color = () => palette[Math.floor(Math.random() * palette.length)];

    if (type === 'heart') {
        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 2;
            const hx = 16 * Math.pow(Math.sin(t), 3);
            const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            const sp = 0.2 + Math.random() * 0.08;
            explosionParticles.push(new Particle(x, y, palette[0], hx * sp, hy * sp, 1.5 + Math.random(), 65 + Math.random() * 35));
        }
    } else if (type === 'ring') {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 3.5 + Math.random() * 0.5;
            explosionParticles.push(new Particle(x, y, color(), Math.cos(angle) * speed, Math.sin(angle) * speed, 1.8, 50 + Math.random() * 20));
        }
        for (let i = 0; i < count / 2; i++) {
            const angle = (Math.PI * 2 / (count / 2)) * i;
            explosionParticles.push(new Particle(x, y, palette[2] || palette[1], Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 1.3, 60 + Math.random() * 20));
        }
    } else if (type === 'star') {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const starF = (i % (count / 5) < (count / 10)) ? 1 : 0.4;
            const speed = (3 + Math.random() * 2) * starF;
            explosionParticles.push(new Particle(x, y, color(), Math.cos(angle) * speed, Math.sin(angle) * speed, 1.5 + Math.random(), 55 + Math.random() * 35));
        }
    } else if (type === 'willow') {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.2;
            const speed = 1.2 + Math.random() * 2.5;
            explosionParticles.push(new Particle(x, y, color(), Math.cos(angle) * speed, Math.sin(angle) * speed, 1 + Math.random(), 90 + Math.random() * 50));
        }
    } else {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 2 + Math.random() * 3.5;
            explosionParticles.push(new Particle(x, y, color(), Math.cos(angle) * speed, Math.sin(angle) * speed, 1.3 + Math.random() * 1.5, 55 + Math.random() * 40));
        }
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
    setTimeout(typeNext, 500);
}

// ============================================
// 7. HỘP QUÀ
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
        spawnConfetti(IS_MOBILE ? 25 : 50);
        for (let i = 0; i < 4; i++) setTimeout(launchFirework, i * 400);
    }, 600);
}

// ============================================
// 8. CONFETTI
// ============================================
function spawnConfetti(count) {
    const shapes = ['❤️', '✨', '🌟', '⭐', '🎊', '🎉'];
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const el = document.createElement('span');
            el.className = 'confetti-piece';
            el.textContent = shapes[Math.floor(Math.random() * shapes.length)];
            const dur = 2 + Math.random() * 3;
            el.style.cssText = `left:${Math.random() * 100}%;top:-5%;font-size:${12 + Math.random() * 14}px;animation-duration:${dur}s`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), dur * 1000);
        }, i * 60);
    }
}

// ============================================
// 9. NHẠC NỀN (MP3)
// ============================================
let musicPlaying = false;
let audioElement = null;

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
// 10. CURSOR TRAIL TRÁI TIM
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
// 11. ĐÈN LỒNG BAY LÊN TRỜI
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
// 12. PARTICLE TEXT (Tên từ hạt sáng)
// ============================================
let ptCanvas, ptCtx, ptParticles = [], ptRunning = false;

function startParticleText() {
    ptCanvas = document.getElementById('particle-text-canvas');
    if (!ptCanvas) return;
    ptCtx = ptCanvas.getContext('2d');
    ptCanvas.width = window.innerWidth;
    ptCanvas.height = window.innerHeight;

    // Vẽ text trên canvas ẩn để lấy tọa độ pixel
    const temp = document.createElement('canvas');
    const tCtx = temp.getContext('2d');
    temp.width = ptCanvas.width;
    temp.height = ptCanvas.height;

    // LOGIC TỰ ĐỘNG KHỚP FONT SIZE
    let fs = Math.min(ptCanvas.width / 6, 150); // Bắt đầu với font to
    tCtx.font = `bold ${fs}px 'Great Vibes', 'Quicksand', sans-serif`; // Dùng font calligraphy để đẹp

    // Giảm font size cho đến khi vừa chiều rộng canvas (với padding 5%)
    while (tCtx.measureText(LOVER_NAME).width > ptCanvas.width * 0.9) {
        fs -= 2;
        tCtx.font = `bold ${fs}px 'Great Vibes', 'Quicksand', sans-serif`;
        if (fs < 20) break; // An toàn
    }

    tCtx.fillStyle = '#fff';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';

    // Vẽ chữ ở chính giữa màn hình
    tCtx.fillText(LOVER_NAME, temp.width / 2, temp.height / 2);

    // Lấy pixel positions
    const imageData = tCtx.getImageData(0, 0, temp.width, temp.height);
    const positions = [];

    // Điều chỉnh độ dày đặc của hạt dựa trên thiết bị
    // Mobile cần ít hạt hơn để đỡ lag, nhưng size hạt to hơn để rõ
    const gap = IS_MOBILE ? 4 : 3;

    for (let y = 0; y < temp.height; y += gap) {
        for (let x = 0; x < temp.width; x += gap) {
            // Lấy alpha channel > 128 (pixel có màu)
            if (imageData.data[(y * temp.width + x) * 4 + 3] > 128) {
                positions.push({ x, y });
            }
        }
    }

    // Chọn ngẫu nhiên subset nếu quá nhiều điểm (tối ưu hiệu năng)
    const selected = [];
    // Mobile cho phép ít hạt hơn PC
    const maxParticles = IS_MOBILE ? 800 : 2500;
    const max = Math.min(positions.length, maxParticles);
    const step = Math.max(1, Math.floor(positions.length / max));

    for (let i = 0; i < positions.length && selected.length < max; i += step) {
        selected.push(positions[i]);
    }

    // Tạo particles
    const colors = ['#ffd700', '#ff6b9d', '#ff9ec5', '#ffe44d', '#ffffff', '#ff4466'];
    ptParticles = selected.map(pos => ({
        x: Math.random() * ptCanvas.width,
        y: Math.random() * ptCanvas.height,
        tx: pos.x, ty: pos.y,
        // Hạt to hơn để chữ rõ hơn: Mobile 2.5-4px, PC 2-3.5px
        size: IS_MOBILE ? (2.5 + Math.random() * 1.5) : (2 + Math.random() * 1.5),
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.05 + Math.random() * 0.05, // Tốc độ bay về nhanh hơn chút
        phase: 'converge',
    }));

    ptRunning = true;
    let startTime = Date.now();

    function animate() {
        if (!ptRunning) return;
        ptCtx.clearRect(0, 0, ptCanvas.width, ptCanvas.height);
        const elapsed = Date.now() - startTime;

        for (const p of ptParticles) {
            if (elapsed < 2000) {
                // Converge (bay về vị trí) nhanh hơn (2s)
                // Easing function: easeOutCubic
                p.x += (p.tx - p.x) * 0.08;
                p.y += (p.ty - p.y) * 0.08;
            } else if (elapsed < 5000) {
                // Hold & Shimmer - chữ rung rinh tỏa sáng
                // Rung nhẹ
                const flutterX = Math.sin(elapsed * 0.005 + p.y * 0.01) * 0.5;
                const flutterY = Math.cos(elapsed * 0.005 + p.x * 0.01) * 0.5;
                p.x = p.tx + flutterX;
                p.y = p.ty + flutterY;
            } else {
                // Scatter - tan biến
                p.x += (Math.cos(elapsed * 0.002 + p.y) * 5);
                p.y -= Math.random() * 3; // Bay lên trời
                p.size *= 0.95; // Teo nhỏ dần
            }

            // Opacity logic
            let alpha = 1;
            if (elapsed < 500) alpha = elapsed / 500; // Fade in
            else if (elapsed > 4500) alpha = Math.max(0, 1 - (elapsed - 4500) / 1000); // Fade out

            ptCtx.globalAlpha = alpha;
            ptCtx.fillStyle = p.color;

            // Vẽ hạt tròn thay vì vuông cho đẹp
            ptCtx.beginPath();
            ptCtx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
            ptCtx.fill();
        }

        if (elapsed < 6000) {
            requestAnimationFrame(animate);
        } else {
            ptRunning = false;
            ptCtx.clearRect(0, 0, ptCanvas.width, ptCanvas.height);
        }
    }
    animate();
}

// ============================================
// 13. PARALLAX SCROLLING
// ============================================
function initParallax() {
    if (IS_MOBILE) return; // Tắt parallax trên mobile để tối ưu

    const starfield = document.getElementById('starfield');
    const canvas = document.getElementById('fireworks-canvas');

    window.addEventListener('scroll', () => {
        const s = window.pageYOffset;
        if (starfield) starfield.style.transform = `translate3d(0, ${s * 0.3}px, 0)`;
        if (canvas) canvas.style.transform = `translate3d(0, ${s * 0.15}px, 0)`;
    }, { passive: true });
}

// ============================================
// 14. SHAKE DETECTION (Mobile)
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
        // iOS 13+
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
// 15. AUTO-SCROLL (Tự chạy mọi thứ)
// ============================================
function startAutoPlay() {
    const sections = document.querySelectorAll('.section');
    if (sections.length < 2) return;

    // Sau 8s ở countdown → scroll đến lời chúc
    setTimeout(() => {
        sections[1].scrollIntoView({ behavior: 'smooth' });
        // Bắt đầu typing khi scroll đến
        setTimeout(() => {
            startTyping();
            waitForTypingThenGift(sections);
        }, 1000);
    }, 8000);
}

function waitForTypingThenGift(sections) {
    const check = setInterval(() => {
        if (typingDone) {
            clearInterval(check);
            // Chờ 3s sau typing xong → scroll đến Gallery ảnh
            setTimeout(() => {
                if (sections[2]) {
                    sections[2].scrollIntoView({ behavior: 'smooth' });
                    // Chờ 6s xem ảnh → scroll đến Gift
                    setTimeout(() => {
                        if (sections[3]) {
                            sections[3].scrollIntoView({ behavior: 'smooth' });
                            // Tự mở gift sau 2s
                            setTimeout(openGift, 2000);
                        }
                    }, 6000);
                }
            }, 3000);
        }
    }, 500);
}

// ============================================
// 16. STARFIELD
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
// 17. BACKGROUND PARTICLES
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
// 18. LIGHTBOX GALLERY
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
    document.body.style.overflow = 'hidden'; // Ngăn scroll khi lightbox mở
}

function closeLightbox(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('lightbox-close')) return;
    const lightbox = document.getElementById('lightbox');
    if (lightbox) lightbox.classList.remove('active');
    document.body.style.overflow = '';
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

// Phím tắt: ESC đóng, ← → chuyển ảnh
document.addEventListener('keydown', e => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') changeLightboxImage(-1);
    if (e.key === 'ArrowRight') changeLightboxImage(1);
});

// Swipe trên mobile
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
// KHỞI TẠO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initWelcome();
    initStarfield();
    checkVideo();
});
