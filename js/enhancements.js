// ══════════════════════════════════════════
// GLOBAL ENHANCEMENTS — 51Game WinGo
// ══════════════════════════════════════════

// ── 1. Ripple effect on all buttons ──────
export function initRipple() {
    document.addEventListener('pointerdown', e => {
        const btn = e.target.closest('button, .btn, .chip, .cta-primary, .cta-secondary, .nav-btn, .modal-tab, .submit-btn, [role="button"]');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top  - size / 2;
        const circle = document.createElement('span');
        circle.className = 'ripple-circle';
        circle.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
        btn.classList.add('ripple-btn');
        btn.appendChild(circle);
        circle.addEventListener('animationend', () => circle.remove());
    });
}

// ── 2. Scroll-reveal observer ─────────────
export function initReveal() {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// ── 3. Animated count-up ─────────────────
// decimals: -1 = auto (0 for whole numbers, 2 for floats), or pass explicit decimal places
export function countUp(el, target, duration = 1200, prefix = '', suffix = '', decimals = -1) {
    if (!el) return;
    const dp = decimals >= 0 ? decimals : (Number.isInteger(target) ? 0 : 2);
    const fmt = v => dp === 0
        ? Math.floor(v).toLocaleString('en-IN')
        : parseFloat(v.toFixed(dp)).toLocaleString('en-IN', { minimumFractionDigits: dp, maximumFractionDigits: dp });
    const start = performance.now();
    const startVal = parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0;
    const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const current = startVal + (target - startVal) * ease;
        el.textContent = prefix + fmt(p < 1 ? current : target) + suffix;
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// ── 4. Confetti burst ────────────────────
export function confetti(count = 60) {
    let container = document.getElementById('confetti-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'confetti-container';
        document.body.appendChild(container);
    }
    container.innerHTML = '';
    const colors = ['#f5a623','#2ed573','#ff4757','#a55eea','#fff','#74b9ff','#fd79a8','#00cec9'];
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.cssText = `
            left: ${Math.random() * 100}vw;
            top: -20px;
            background: ${colors[i % colors.length]};
            width: ${6 + Math.random() * 8}px;
            height: ${6 + Math.random() * 8}px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            animation-delay: ${Math.random() * 0.8}s;
            animation-duration: ${2 + Math.random() * 1.5}s;
        `;
        container.appendChild(el);
    }
    setTimeout(() => { container.innerHTML = ''; }, 4000);
}

// ── 5. Balance delta flash ────────────────
export function showBalanceDelta(amount, isWin) {
    let el = document.getElementById('balance-delta');
    if (!el) {
        el = document.createElement('div');
        el.id = 'balance-delta';
        document.body.appendChild(el);
    }
    el.className = isWin ? 'win-delta' : 'loss-delta';
    el.textContent = (isWin ? '+' : '-') + '₹' + Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    el.style.display = 'block';
    el.addEventListener('animationend', () => { el.style.display = 'none'; }, { once: true });
}

// ── 6. Dark mode toggle ───────────────────
export function initDarkMode() {
    const saved = localStorage.getItem('wingo_dark');
    const prefs = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'true' || (saved === null && prefs);
    if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
}

export function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('wingo_dark', (!isDark).toString());
    return !isDark;
}

// ── 7. VIP level calculator ───────────────
export function getVipLevel(totalWagered) {
    if (totalWagered >= 500000) return { level: 'Diamond', emoji: '💎', class: 'vip-diamond', next: null,      nextAt: null };
    if (totalWagered >= 100000) return { level: 'Gold',    emoji: '🥇', class: 'vip-gold',    next: 'Diamond', nextAt: 500000 };
    if (totalWagered >=  10000) return { level: 'Silver',  emoji: '🥈', class: 'vip-silver',  next: 'Gold',    nextAt: 100000 };
    return { level: 'Bronze', emoji: '🥉', class: 'vip-bronze', next: 'Silver', nextAt: 10000 };
}

// ── 8. Achievements calculator ────────────
export function getAchievements(txs, balance) {
    const wins      = txs.filter(t => t.type === 'win');
    const deposits  = txs.filter(t => t.type === 'deposit');
    const bets      = txs.filter(t => t.type === 'bet' || t.type === 'win');
    const totalWon  = wins.reduce((s, t) => s + t.amount, 0);

    return [
        { icon: '🎯', title: 'First Bet',       desc: 'Placed your first bet',           earned: bets.length >= 1 },
        { icon: '🏆', title: 'First Win',        desc: 'Won your first round',            earned: wins.length >= 1 },
        { icon: '💳', title: 'First Deposit',    desc: 'Made your first deposit',         earned: deposits.length >= 1 },
        { icon: '🔥', title: '10 Wins',          desc: 'Won 10 rounds',                  earned: wins.length >= 10 },
        { icon: '💰', title: 'Big Winner',       desc: 'Won ₹10,000 total',              earned: totalWon >= 10000 },
        { icon: '⚡', title: '50 Bets',          desc: 'Placed 50 bets',                 earned: bets.length >= 50 },
        { icon: '💎', title: 'High Roller',      desc: 'Balance over ₹50,000',           earned: balance >= 50000 },
        { icon: '🌙', title: 'Night Owl',        desc: 'Played after midnight',           earned: txs.some(t => new Date(t.date).getHours() >= 0 && new Date(t.date).getHours() < 5) },
    ];
}

// ── 9. Live activity feed generator ──────
const NAMES = ['Raj***','Priya***','Amit***','Pooja***','Suresh***','Neha***','Vikram***','Ananya***','Deepak***','Kavya***','Rohan***','Sneha***'];
const BET_TYPES = ['Red','Green','Violet','Big','Small','No. 7','No. 3','No. 9'];

export function generateFeedItem() {
    const won = Math.random() > 0.45;
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const bet  = BET_TYPES[Math.floor(Math.random() * BET_TYPES.length)];
    const amt  = [10,50,100,200,500,1000][Math.floor(Math.random() * 6)];
    const payout = won ? (amt * (bet === 'Violet' ? 4.5 : bet.startsWith('No.') ? 9 : 2)).toFixed(0) : 0;
    return { name, bet, amt, won, payout };
}

export function startLiveFeed(container) {
    if (!container) return;
    function addItem() {
        const f = generateFeedItem();
        const colors = ['#f5a623','#2ed573','#ff4757','#a55eea','#74b9ff'];
        const color  = colors[Math.floor(Math.random() * colors.length)];
        const initials = f.name.slice(0,2).toUpperCase();
        const div = document.createElement('div');
        div.className = 'feed-item anim-fade-up';
        div.innerHTML = `
            <div class="feed-avatar" style="background:${color}">${initials}</div>
            <div class="feed-text">${f.name} bet <b>${f.bet}</b></div>
            <div class="feed-amount ${f.won ? 'won' : 'lost'}">${f.won ? '+₹'+f.payout : '-₹'+f.amt}</div>`;
        container.prepend(div);
        if (container.children.length > 6) container.lastElementChild.remove();
    }
    addItem();
    return setInterval(addItem, 2800);
}

// ── 10. Streak tracker ────────────────────
export function getStreak(txs) {
    let streak = 0;
    let streakType = null;
    for (const tx of txs) {
        const thisType = tx.type === 'win' ? 'win' : tx.type === 'bet' ? 'loss' : null;
        if (!thisType) continue;
        if (streakType === null) { streakType = thisType; streak = 1; }
        else if (thisType === streakType) { streak++; }
        else break;
    }
    return { count: streak, type: streakType };
}

// ── 11. Hot numbers tracker ───────────────
export function getHotNumbers(txs) {
    const map = {};
    txs.slice(0, 20).forEach(tx => {
        if (tx.result !== undefined) {
            map[tx.result] = (map[tx.result] || 0) + 1;
        }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => parseInt(n));
}

// ── 12. Referral code generator ────────────
export function getReferralCode(uid) {
    return 'REF' + (uid || '').replace('UID','').slice(-6).toUpperCase();
}

// ── 13. Share referral ────────────────────
export function shareReferral(code) {
    const text = `Join 51Game WinGo and get ₹1,000 welcome bonus! Use my code: ${code}`;
    if (navigator.share) {
        navigator.share({ title: '51Game WinGo', text, url: window.location.origin + '/home.html?ref=' + code });
    } else {
        navigator.clipboard.writeText(text).then(() => alert('Referral link copied!'));
    }
}

// ── 14. Daily login streak ────────────────
export function getDailyStreak() {
    const key = 'wingo_login_streak';
    const data = JSON.parse(localStorage.getItem(key) || '{"count":0,"last":""}');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.last === today) return data.count;
    if (data.last === yesterday) { data.count++; }
    else { data.count = 1; }
    data.last = today;
    localStorage.setItem(key, JSON.stringify(data));
    return data.count;
}

// ── 15. Floating particles ────────────────
export function initParticles(container) {
    if (!container) return;
    const colors = ['rgba(245,166,35,0.6)','rgba(124,58,237,0.5)','rgba(46,213,115,0.4)','rgba(255,71,87,0.4)'];
    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        const size = 4 + Math.random() * 10;
        p.style.cssText = `
            position:absolute;
            width:${size}px; height:${size}px;
            border-radius:50%;
            background:${colors[i % colors.length]};
            left:${Math.random()*100}%;
            top:${Math.random()*100}%;
            animation: floatSlow ${4+Math.random()*4}s ease-in-out ${Math.random()*3}s infinite;
            pointer-events:none;
        `;
        container.appendChild(p);
    }
}

// ── 16. Copy to clipboard helper ──────────
export function copyText(text, successMsg = 'Copied!') {
    navigator.clipboard.writeText(text).then(() => {
        const t = document.getElementById('toast') || document.getElementById('app-toast');
        if (t) { t.textContent = successMsg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2000); }
    });
}

// ── Init all global enhancements ─────────
export function initAll() {
    initRipple();
    initReveal();
    initDarkMode();
    initScrollToTop();
    initTopBar();
}

// ── [19] Top progress bar ─────────────────
let _topBarTimer;
export function initTopBar() {
    let bar = document.getElementById('page-topbar');
    if (!bar) { bar = document.createElement('div'); bar.id = 'page-topbar'; document.body.prepend(bar); }
}
export function topBarStart() {
    const bar = document.getElementById('page-topbar');
    if (!bar) return;
    clearTimeout(_topBarTimer);
    bar.style.transition = 'none';
    bar.style.width = '0%';
    bar.classList.add('active');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = 'width 2s ease';
        bar.style.width = '75%';
    }));
}
export function topBarFinish() {
    const bar = document.getElementById('page-topbar');
    if (!bar) return;
    bar.style.transition = 'width 0.3s ease, opacity 0.5s ease 0.35s';
    bar.style.width = '100%';
    _topBarTimer = setTimeout(() => { bar.classList.remove('active'); bar.style.width = '0%'; }, 900);
}

// ── [20] Scroll-to-top FAB ───────────────
export function initScrollToTop() {
    if (document.getElementById('scroll-top-fab')) return;
    const fab = document.createElement('button');
    fab.id = 'scroll-top-fab';
    fab.title = 'Back to top';
    fab.innerHTML = '↑';
    document.body.appendChild(fab);
    fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const scroller = document.querySelector('.page-content') || window;
    const onScroll = () => fab.classList.toggle('visible', (scroller === window ? scroller.scrollY : scroller.scrollTop) > 300);
    (scroller === window ? window : scroller).addEventListener('scroll', onScroll, { passive: true });
}

// ── [21] Button loading state ─────────────
export function setButtonLoading(btn, on) {
    if (on) {
        btn._savedText = btn.innerHTML;
        btn.classList.add('btn-loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
        if (btn._savedText !== undefined) btn.innerHTML = btn._savedText;
    }
}

// ── [22] Haptic feedback ──────────────────
export function haptic(pattern = [10]) {
    if (navigator.vibrate) navigator.vibrate(pattern);
}

// ── [23] Swipe-to-close modal ─────────────
export function initSwipeClose(overlayEl) {
    if (!overlayEl) return;
    const sheet = overlayEl.querySelector('.modal-sheet, .edit-sheet, .logout-sheet');
    if (!sheet) return;
    let startY = 0, dragging = false;
    sheet.addEventListener('touchstart', e => { startY = e.touches[0].clientY; dragging = true; }, { passive: true });
    sheet.addEventListener('touchmove', e => {
        if (!dragging) return;
        const dy = Math.max(0, e.touches[0].clientY - startY);
        sheet.style.transform = `translateY(${dy}px)`;
        sheet.style.transition = 'none';
    }, { passive: true });
    sheet.addEventListener('touchend', e => {
        dragging = false;
        const dy = e.changedTouches[0].clientY - startY;
        sheet.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
        if (dy > 90) { overlayEl.classList.remove('open'); sheet.style.transform = ''; }
        else { sheet.style.transform = ''; }
    });
}

// ── [24] Password strength ────────────────
export function passwordStrength(pw) {
    let s = 0;
    if (pw.length >= 6)  s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (s <= 1) return 'weak';
    if (s <= 3) return 'medium';
    return 'strong';
}

// ── [25] Remember last field value ────────
export function rememberField(storageKey, inputEl) {
    if (!inputEl) return;
    const saved = localStorage.getItem('rf_' + storageKey);
    if (saved) inputEl.value = saved;
    inputEl.addEventListener('input', () => {
        if (inputEl.value) localStorage.setItem('rf_' + storageKey, inputEl.value);
        else localStorage.removeItem('rf_' + storageKey);
    });
}

// ── [26] Date label helper ────────────────
export function dateLabelGroup(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yest  = new Date(today - 86400000);
    const txDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (txDay >= today) return 'Today';
    if (txDay >= yest)  return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
