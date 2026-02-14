// ============================================
// TRANG WEB CHÚC MỪNG NĂM MỚI - CHO ANH THƠ
// ============================================

// ---- Cấu hình ----
const NEW_YEAR_DATE = new Date('2026-02-18T00:00:00+07:00');
const LOVER_NAME = 'Hoàng Thị Anh Thơ';
const MESSAGE_TEXT = 'Chúc mừng năm mới, Cô Gái nhỏ của anh..!\n\nChúc cho chúng ta năm mới luôn ngập tràn yêu thương, bình yên và những kỉ niệm đẹp mãi không quên.\n\nChúng ta có được nhau là duyên trời, hãy trân trọng tình yêu này mãi Em nhé!\n\nChúc mừng năm mới, tình yêu của đời Anh.\n\nChúc Em mạnh khỏe bình an và luôn nở nụ cười như những năm mới nữa Em yêu nhé..!\n\n"Mãi Yêu Em" 💕';

// ============================================
// 1. WELCOME SCREEN
// ============================================
function initWelcome() {
    const heartsContainer = document.querySelector('.welcome-hearts');
    const heartSymbols = ['💕', '💖', '💗', '✨', '🌸', '💝'];

    for (let i = 0; i < 25; i++) {
        const heart = document.createElement('span');
        heart.className = 'welcome-heart';
        heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 6 + 's';
        heart.style.animationDuration = (4 + Math.random() * 4) + 's';
        heart.style.fontSize = (16 + Math.random() * 20) + 'px';
        heartsContainer.appendChild(heart);
    }
}

function openLetter() {
    const welcome = document.querySelector('.welcome-screen');
    const main = document.querySelector('.main-content');

    welcome.classList.add('hidden');
    main.classList.add('visible');

    setTimeout(() => {
        startCountdown();
        startPetals();
        startFireworks();
        startBackgroundParticles();
        initTypingOnScroll();
    }, 500);
}

// ============================================
// 2. COUNTDOWN - ĐẾM NGƯỢC ĐẾN GIAO THỪA
// ============================================
let countdownInterval;

function startCountdown() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    const diff = NEW_YEAR_DATE - now;

    if (diff <= 0) {
        // Đã đến giao thừa!
        clearInterval(countdownInterval);
        document.querySelector('.countdown-timer').style.display = 'none';
        document.querySelector('.countdown-year').style.display = 'none';
        const complete = document.querySelector('.countdown-complete');
        complete.classList.add('show');
        triggerCelebration();
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

function triggerCelebration() {
    // Bắn pháo hoa liên tục khi giao thừa
    for (let i = 0; i < 10; i++) {
        setTimeout(() => launchFirework(), i * 300);
    }
    spawnConfetti(80);
}

// ============================================
// 3. PHÁO HOA NÂNG CAO - ADVANCED FIREWORKS
// ============================================
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
let rockets = [];
let explosionParticles = [];
let fireworksRunning = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Màu sắc đa dạng
const FIREWORK_PALETTES = [
    ['#ff6b9d', '#ff9ec5', '#ffb6d3'],  // Hồng
    ['#ffd700', '#ffe44d', '#fff176'],  // Vàng
    ['#c084fc', '#d8b4fe', '#e9d5ff'],  // Tím
    ['#fb923c', '#fdba74', '#fed7aa'],  // Cam
    ['#f472b6', '#f9a8d4', '#fbcfe8'],  // Hồng nhạt
    ['#34d399', '#6ee7b7', '#a7f3d0'],  // Xanh mint
    ['#ff4466', '#ff6b81', '#ff8fa3'],  // Đỏ
    ['#60a5fa', '#93c5fd', '#bfdbfe'],  // Xanh dương
    ['#fbbf24', '#fcd34d', '#fde68a'],  // Vàng ấm
];

// --- ROCKET (Tên lửa bay lên) ---
class Rocket {
    constructor() {
        this.x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        this.y = canvas.height + 10;
        this.targetY = Math.random() * canvas.height * 0.35 + canvas.height * 0.08;
        this.speed = 4 + Math.random() * 3;
        this.trail = [];
        this.palette = FIREWORK_PALETTES[Math.floor(Math.random() * FIREWORK_PALETTES.length)];
        this.color = this.palette[0];
        this.exploded = false;
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
    }

    update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 12) this.trail.shift();
        this.trail.forEach(t => t.alpha -= 0.08);

        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.02; // Nhẹ gravity

        if (this.y <= this.targetY) {
            this.exploded = true;
            createExplosion(this.x, this.y, this.palette);
        }
    }

    draw() {
        // Vệt trail
        this.trail.forEach(t => {
            if (t.alpha <= 0) return;
            ctx.save();
            ctx.globalAlpha = t.alpha * 0.6;
            ctx.beginPath();
            ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.restore();
        });

        // Đầu rocket
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

// --- PARTICLE NỔ ---
class ExplosionParticle {
    constructor(x, y, color, vx, vy, size, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.life = life;
        this.maxLife = life;
        this.gravity = 0.03;
        this.friction = 0.975;
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y, alpha: this.life / this.maxLife });
        if (this.trail.length > 5) this.trail.shift();
        this.trail.forEach(t => t.alpha -= 0.15);

        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw() {
        const alpha = this.life / this.maxLife;

        // Vệt trail
        this.trail.forEach(t => {
            if (t.alpha <= 0) return;
            ctx.save();
            ctx.globalAlpha = t.alpha * 0.3;
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        });

        // Hạt chính
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * (0.3 + alpha * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// --- CÁC KIỂU NỔ ---
function createExplosion(x, y, palette) {
    const types = ['circle', 'circle', 'heart', 'ring', 'star', 'double', 'willow'];
    const type = types[Math.floor(Math.random() * types.length)];

    switch (type) {
        case 'circle': explodeCircle(x, y, palette); break;
        case 'heart': explodeHeart(x, y, palette); break;
        case 'ring': explodeRing(x, y, palette); break;
        case 'star': explodeStar(x, y, palette); break;
        case 'double': explodeDouble(x, y, palette); break;
        case 'willow': explodeWillow(x, y, palette); break;
    }
}

function explodeCircle(x, y, palette) {
    const count = 80 + Math.random() * 50;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const speed = 2 + Math.random() * 4;
        const color = palette[Math.floor(Math.random() * palette.length)];
        explosionParticles.push(new ExplosionParticle(
            x, y, color,
            Math.cos(angle) * speed, Math.sin(angle) * speed,
            1.5 + Math.random() * 2, 60 + Math.random() * 50
        ));
    }
}

function explodeHeart(x, y, palette) {
    const count = 100;
    for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const speed = 0.22 + Math.random() * 0.08;
        const color = palette[0];
        explosionParticles.push(new ExplosionParticle(
            x, y, color,
            hx * speed, hy * speed,
            1.8 + Math.random() * 1.2, 70 + Math.random() * 40
        ));
    }
}

function explodeRing(x, y, palette) {
    // Vòng ngoài
    const count = 60;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const speed = 4 + Math.random() * 1;
        explosionParticles.push(new ExplosionParticle(
            x, y, palette[0],
            Math.cos(angle) * speed, Math.sin(angle) * speed,
            2, 55 + Math.random() * 20
        ));
    }
    // Vòng trong
    for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 / 30) * i;
        const speed = 2;
        explosionParticles.push(new ExplosionParticle(
            x, y, palette[2] || palette[1],
            Math.cos(angle) * speed, Math.sin(angle) * speed,
            1.5, 65 + Math.random() * 20
        ));
    }
}

function explodeStar(x, y, palette) {
    const points = 5;
    const count = 80;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const starFactor = (i % (count / points) < (count / points / 2)) ? 1 : 0.5;
        const speed = (3 + Math.random() * 2) * starFactor;
        const color = palette[Math.floor(Math.random() * palette.length)];
        explosionParticles.push(new ExplosionParticle(
            x, y, color,
            Math.cos(angle) * speed, Math.sin(angle) * speed,
            1.8 + Math.random() * 1.2, 60 + Math.random() * 40
        ));
    }
}

function explodeDouble(x, y, palette) {
    explodeCircle(x, y, [palette[0]]);
    setTimeout(() => {
        const count = 40;
        const color = palette[2] || palette[1];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 1.5 + Math.random() * 1;
            explosionParticles.push(new ExplosionParticle(
                x, y, color,
                Math.cos(angle) * speed, Math.sin(angle) * speed,
                2.5, 80 + Math.random() * 30
            ));
        }
    }, 200);
}

function explodeWillow(x, y, palette) {
    const count = 100;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.2;
        const speed = 1.5 + Math.random() * 3;
        const color = palette[Math.floor(Math.random() * palette.length)];
        explosionParticles.push(new ExplosionParticle(
            x, y, color,
            Math.cos(angle) * speed, Math.sin(angle) * speed,
            1.2 + Math.random() * 1, 100 + Math.random() * 60
        ));
    }
}

// --- LAUNCH & ANIMATE ---
function launchFirework() {
    rockets.push(new Rocket());
}

function animateFireworks() {
    if (!fireworksRunning) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    // Rockets
    rockets.forEach(r => { r.update(); r.draw(); });
    rockets = rockets.filter(r => !r.exploded);

    // Explosion particles
    explosionParticles.forEach(p => { p.update(); p.draw(); });
    explosionParticles = explosionParticles.filter(p => !p.isDead());

    requestAnimationFrame(animateFireworks);
}

function startFireworks() {
    fireworksRunning = true;
    animateFireworks();

    // Bắn liên tục, tần suất cao
    setInterval(() => {
        launchFirework();
        // 30% cơ hội bắn thêm 1 quả nữa cùng lúc
        if (Math.random() > 0.7) {
            setTimeout(() => launchFirework(), 150);
        }
    }, 700);

    // Bắn ngay lập tức khi mở - salvo đầu tiên
    for (let i = 0; i < 5; i++) {
        setTimeout(() => launchFirework(), i * 300);
    }
}

// ============================================
// 4. HOA ĐÀO RƠI - FALLING PETALS
// ============================================
const petalSymbols = ['🌸', '🏵️', '💮', '✿', '❀'];

function createPetal() {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = petalSymbols[Math.floor(Math.random() * petalSymbols.length)];
    petal.style.left = Math.random() * 100 + '%';
    petal.style.fontSize = (14 + Math.random() * 16) + 'px';
    const duration = 8 + Math.random() * 8;
    petal.style.animationDuration = duration + 's';
    petal.style.animationDelay = Math.random() * 2 + 's';
    document.body.appendChild(petal);

    setTimeout(() => petal.remove(), (duration + 2) * 1000);
}

function startPetals() {
    // Tạo hoa đào ban đầu
    for (let i = 0; i < 8; i++) {
        setTimeout(() => createPetal(), i * 400);
    }
    // Rơi liên tục
    setInterval(createPetal, 1200);
}

// ============================================
// 5. TYPING EFFECT - GÕ CHỮ LỜI CHÚC
// ============================================
let typingStarted = false;

function initTypingOnScroll() {
    const messageSection = document.querySelector('.message-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !typingStarted) {
                typingStarted = true;
                startTyping();
            }
        });
    }, { threshold: 0.3 });

    observer.observe(messageSection);
}

function startTyping() {
    const textElement = document.querySelector('.message-text');
    const signatureElement = document.querySelector('.message-signature');
    const lines = MESSAGE_TEXT.split('\n');
    let currentLine = 0;
    let currentChar = 0;
    let html = '';

    textElement.innerHTML = '<span class="cursor"></span>';

    function typeChar() {
        if (currentLine >= lines.length) {
            // Xong rồi, hiện chữ ký
            textElement.innerHTML = html;
            signatureElement.classList.add('show');
            return;
        }

        const line = lines[currentLine];
        if (currentChar < line.length) {
            html += line[currentChar];
            textElement.innerHTML = html.replace(/\n/g, '<br>') + '<span class="cursor"></span>';
            currentChar++;
            const delay = line[currentChar - 1] === '.' ? 120 :
                line[currentChar - 1] === ',' ? 80 :
                    line[currentChar - 1] === '!' ? 100 :
                        30 + Math.random() * 30;
            setTimeout(typeChar, delay);
        } else {
            html += '\n';
            currentLine++;
            currentChar = 0;
            setTimeout(typeChar, currentLine > 0 && lines[currentLine - 1] === '' ? 100 : 300);
        }
    }

    setTimeout(typeChar, 800);
}

// ============================================
// 6. HỘP QUÀ - GIFT BOX
// ============================================
let giftOpened = false;

function openGift() {
    if (giftOpened) return;
    giftOpened = true;

    const box = document.querySelector('.gift-box');
    const message = document.querySelector('.gift-message');

    box.classList.add('opened');

    setTimeout(() => {
        message.classList.add('show');
        spawnConfetti(60);
        // Bắn pháo hoa mừng
        for (let i = 0; i < 5; i++) {
            setTimeout(() => launchFirework(), i * 400);
        }
    }, 600);
}

// ============================================
// 7. CONFETTI
// ============================================
function spawnConfetti(count) {
    const colors = ['#ff6b9d', '#ffd700', '#ff4466', '#ff9ec5', '#c084fc', '#fb923c', '#34d399'];
    const shapes = ['❤️', '✨', '🌟', '⭐', '💫', '🎊', '🎉'];

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const piece = document.createElement('span');
            piece.className = 'confetti-piece';
            piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
            piece.style.left = Math.random() * 100 + '%';
            piece.style.top = '-5%';
            piece.style.fontSize = (12 + Math.random() * 18) + 'px';
            const duration = 2 + Math.random() * 3;
            piece.style.animationDuration = duration + 's';
            document.body.appendChild(piece);

            setTimeout(() => piece.remove(), duration * 1000);
        }, i * 50);
    }
}

// ============================================
// 8. NHẠC NỀN - WEB AUDIO API
// ============================================
let audioCtx = null;
let musicPlaying = false;
let musicTimers = [];

function createMelody() {
    if (audioCtx) {
        audioCtx.close();
    }

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Nốt nhạc "Xuân" pentatonic scale - melody nhẹ nhàng lãng mạn
    const notes = [
        // Phrase 1
        { freq: 523.25, start: 0, dur: 0.5 },    // C5
        { freq: 587.33, start: 0.5, dur: 0.5 },   // D5
        { freq: 659.25, start: 1.0, dur: 0.8 },   // E5
        { freq: 523.25, start: 1.8, dur: 0.4 },   // C5
        { freq: 659.25, start: 2.2, dur: 0.6 },   // E5
        { freq: 783.99, start: 2.8, dur: 1.0 },   // G5

        // Phrase 2
        { freq: 783.99, start: 4.0, dur: 0.5 },   // G5
        { freq: 698.46, start: 4.5, dur: 0.5 },   // F5
        { freq: 659.25, start: 5.0, dur: 0.5 },   // E5
        { freq: 587.33, start: 5.5, dur: 0.8 },   // D5
        { freq: 523.25, start: 6.3, dur: 0.5 },   // C5
        { freq: 587.33, start: 6.8, dur: 1.0 },   // D5

        // Phrase 3
        { freq: 392.00, start: 8.0, dur: 0.6 },   // G4
        { freq: 440.00, start: 8.6, dur: 0.4 },   // A4
        { freq: 523.25, start: 9.0, dur: 0.8 },   // C5
        { freq: 587.33, start: 9.8, dur: 0.4 },   // D5
        { freq: 523.25, start: 10.2, dur: 0.6 },  // C5
        { freq: 440.00, start: 10.8, dur: 0.4 },  // A4
        { freq: 392.00, start: 11.2, dur: 1.2 },  // G4

        // Phrase 4 - lặp lại nhẹ nhàng
        { freq: 523.25, start: 12.5, dur: 0.5 },  // C5
        { freq: 659.25, start: 13.0, dur: 0.5 },  // E5
        { freq: 783.99, start: 13.5, dur: 0.8 },  // G5
        { freq: 880.00, start: 14.3, dur: 0.6 },  // A5
        { freq: 783.99, start: 14.9, dur: 0.5 },  // G5
        { freq: 659.25, start: 15.4, dur: 0.8 },  // E5
        { freq: 523.25, start: 16.2, dur: 1.5 },  // C5
    ];

    const totalDuration = 18;

    function playOnce(offset) {
        notes.forEach(note => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.value = note.freq;

            filter.type = 'lowpass';
            filter.frequency.value = 2000;

            // Envelope: mềm mại
            const t = audioCtx.currentTime + offset + note.start;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + note.dur);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(t);
            osc.stop(t + note.dur + 0.1);
        });
    }

    // Phát lặp lại
    function scheduleLoop() {
        if (!musicPlaying) return;
        playOnce(0);
        const timer = setTimeout(scheduleLoop, totalDuration * 1000);
        musicTimers.push(timer);
    }

    scheduleLoop();
}

function toggleMusic() {
    const btn = document.querySelector('.music-btn');

    if (musicPlaying) {
        musicPlaying = false;
        btn.classList.remove('playing');
        btn.textContent = '🔇';
        musicTimers.forEach(t => clearTimeout(t));
        musicTimers = [];
        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
        }
    } else {
        musicPlaying = true;
        btn.classList.add('playing');
        btn.textContent = '🎵';
        createMelody();
    }
}

// ============================================
// 9. PARTICLE BACKGROUND - NỀN TRÁI TIM BAY
// ============================================
function createBackgroundParticle() {
    const particle = document.createElement('span');
    particle.className = 'bg-particle';
    const symbols = ['💕', '✨', '⭐', '💖', '🌟'];
    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    particle.style.left = Math.random() * 100 + '%';
    particle.style.fontSize = (10 + Math.random() * 14) + 'px';
    const duration = 15 + Math.random() * 20;
    particle.style.animationDuration = duration + 's';
    particle.style.animationDelay = Math.random() * 5 + 's';
    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), (duration + 5) * 1000);
}

function startBackgroundParticles() {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => createBackgroundParticle(), i * 800);
    }
    setInterval(createBackgroundParticle, 3000);
}

// ============================================
// 10. STARFIELD - NỀN SAO LẤP LÁNH
// ============================================
function initStarfield() {
    const container = document.getElementById('starfield');
    if (!container) return;
    for (let i = 0; i < 60; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = (1 + Math.random() * 2.5) + 'px';
        star.style.height = star.style.width;
        star.style.animationDuration = (2 + Math.random() * 4) + 's';
        star.style.animationDelay = Math.random() * 4 + 's';
        if (Math.random() > 0.7) {
            star.style.background = '#ffd700';
        }
        container.appendChild(star);
    }
}

// ============================================
// KHỞI TẠO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initWelcome();
    initStarfield();
});
