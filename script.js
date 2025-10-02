// إعداد المتغيرات الرئيسية
const PASSWORD = "وزني الفضائي"; // الحل الصحيح الجديد
const CLOSE_ANSWERS = [
    "وزني فضاء", "وزني في الفضاء", "الوزن في الفضاء", "وزني يختلف", "اختلاف الوزن", "تغير الوزن", "يختلف وزني هناك", "وزني الفضاي"
];
const MAX_ATTEMPTS = 4;

function getAttempts() {
    return +(localStorage.getItem('puzzle_attempts') || MAX_ATTEMPTS);
}
function setAttempts(val) {
    localStorage.setItem('puzzle_attempts', val);
}
function setFailed(val) {
    localStorage.setItem('puzzle_failed', val ? "1" : "");
}
function getFailed() {
    return localStorage.getItem('puzzle_failed') === "1";
}
function setWinner(val) {
    localStorage.setItem('puzzle_winner', val ? "1" : "");
}
function getWinner() {
    return localStorage.getItem('puzzle_winner') === "1";
}
function resetGame() {
    setAttempts(MAX_ATTEMPTS);
    setFailed(false);
    setWinner(false);
}
function updateAttemptsText() {
    const el = document.getElementById('attempts-count');
    if (el) el.textContent = getAttempts();
}
function handleResultMessage(msg, color) {
    const res = document.getElementById('result-message');
    res.textContent = msg;
    res.style.color = color;
    res.style.textShadow = `0 0 10px ${color}80`;
}

// منطق اللعبة
function setupGameLogic() {
    const form = document.getElementById('guess-form');
    if (!form) return;
    form.addEventListener('submit', function(e){
        e.preventDefault();
        const input = document.getElementById('guess-input');
        let guess = input.value.trim().replace(/\s+/g,' ');
        let att = getAttempts();

        if (guess === PASSWORD) {
            setWinner(true);
            setFailed(false);
            navigateTo('win-page');
            return;
        }
        // تحقق من الإجابات القريبة
        if (CLOSE_ANSWERS.some(ans => guess.includes(ans))) {
            handleResultMessage("إجابتك قريبة جداً! ركز على المكان والصفة المرتبطة بك هناك.", "#ffe573");
            input.value = "";
            // لا تخصم محاولة
            return;
        }

        att--;
        setAttempts(att);
        updateAttemptsText();
        if (att <= 0) {
            setFailed(true);
            setWinner(false);
            handleResultMessage("انتهت محاولاتك! الإجابة كانت: " + PASSWORD, "#ff5a5a");
            setTimeout(() => navigateTo('fail-page'), 1400);
        } else {
            handleResultMessage("إجابة غير صحيحة! حاول مرة أخرى.", "#ff5a5a");
        }
        input.value = "";
    });
    updateAttemptsText();
}

// التحكم بالتنقل والمنع بعد الخسارة أو الفوز
window.addEventListener('hashchange', function(){
    const hash = window.location.hash.replace(/^#/, '');
    if(getFailed()) {
        // فقط اسمح له بزيارة صفحة الخسارة أو من نحن
        if(hash === 'about-page' || hash === 'fail-page') {
            showPage(hash);
        } else {
            navigateTo('fail-page');
        }
    } else if(getWinner()) {
        // فقط اسمح بصفحة الفوز أو من نحن
        if(hash === 'about-page' || hash === 'win-page') {
            showPage(hash);
        } else {
            navigateTo('win-page');
        }
    } else {
        showPage(hash || 'home-page');
    }
    if(hash === 'puzzle-page') updateAttemptsText();
});
window.addEventListener('DOMContentLoaded', function(){
    setupStarsBG();
    setupParallax();
    document.getElementById('start-btn').onclick = () => navigateTo('puzzle-page');
    setupGameLogic();

    // تحقق عند التحميل من حالة الفوز أو الخسارة
    let hash = window.location.hash.replace(/^#/, '') || 'home-page';
    if(getFailed() && !(hash === 'about-page' || hash === 'fail-page')){
        hash = 'fail-page';
    } else if(getWinner() && !(hash === 'about-page' || hash === 'win-page')){
        hash = 'win-page';
    }
    showPage(hash);
    if(hash === 'puzzle-page') updateAttemptsText();
});

function showPage(pageId) {
    document.querySelectorAll('.page-container').forEach(sec => sec.style.display = "none");
    document.getElementById(pageId).style.display = "";
}

// تنقل آمن
function navigateTo(hash) {
    if (hash.startsWith('#')) hash = hash.slice(1);
    window.location.hash = '#' + hash;
}

// نجوم متحركة في الخلفية باستخدام كانفس
function setupStarsBG() {
    const canvas = document.getElementById('stars-bg');
    const ctx = canvas.getContext('2d');
    let w = window.innerWidth, h = window.innerHeight;
    let stars = [];
    function resize() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
        stars = [];
        for(let i = 0; i < Math.floor(w * h / 1500); i++){
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.2 + 0.2,
                s: Math.random() * 0.8 + 0.1,
                a: Math.random() * Math.PI * 2
            });
        }
    }
    resize();
    window.addEventListener('resize', resize);
    function draw(){
        ctx.clearRect(0,0,w,h);
        for(const star of stars){
            ctx.save();
            ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now()/1000 + star.a);
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.shadowColor = "#00AEEF";
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.restore();
            star.x += star.s * 0.1;
            if(star.x > w) star.x = 0;
        }
        requestAnimationFrame(draw);
    }
    draw();
}

function setupParallax() {
    const bg = document.getElementById('parallax-bg');
    document.addEventListener('mousemove', function(e){
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        bg.style.transform = `translate(${x}px, ${y}px)`;
    });
}