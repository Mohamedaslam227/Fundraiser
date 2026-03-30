/**
 * script.js — Build a Block, Build a Future  (v3 — Image Blend Engine)
 * ============================================================
 * GAME:  Enter a donation amount → the "BEFORE" image (broken restroom)
 *        gradually reveals the "AFTER" image (new building) from bottom
 *        to top, like watching construction happen in real time.
 *
 * Images used:
 *   7.jpeg = BEFORE (damaged current structure) — always visible as base
 *   8.jpeg = AFTER  (new restroom block)        — reveals as % grows
 *
 * GAME RULES (reference only):
 * Total Goal: ₹1,25,000
 * ============================================================
 */

'use strict';

/* ── 1. Constants ───────────────────────────────────────────── */

const TOTAL_GOAL = 125000;   // ₹1,25,000

const MILESTONES = [
    {
        pct: 25,  id: 'ms25',
        msg: '🏗️ 25% funded! The foundation is being laid — the new building is beginning to take shape!'
    },
    {
        pct: 50,  id: 'ms50',
        msg: '🧱 Halfway there! The image is transforming — 40 girls are one step closer to dignity.'
    },
    {
        pct: 75,  id: 'ms75',
        msg: '🏠 75% funded! The roof is going on — the transformation is nearly complete!'
    },
    {
        pct: 100, id: 'ms100',
        msg: '🎉 Complete! The building is fully funded. 40 girls will never have to worry again!'
    },
];

const state = {
    simulatedTotal: 0,
    unlockedMs:     new Set(),
};

/* ── 2. Simulation Entry Point ───────────────────────────────── */

function simulateDonation() {
    const input = document.getElementById('donationInput');
    const raw   = parseFloat(input.value);

    if (!input.value.trim() || isNaN(raw) || raw <= 0) {
        setFeedback('⚠️ Please enter a valid amount greater than ₹0.', 'warn');
        input.focus();
        return;
    }
    if (raw > TOTAL_GOAL) {
        setFeedback('⚠️ This exceeds the total goal of ₹1,25,000. Try a smaller amount.', 'warn');
        input.focus();
        return;
    }
    if (state.simulatedTotal >= TOTAL_GOAL) {
        setFeedback('🎉 The building is already complete! Press Reset to start over.', 'warn');
        return;
    }

    const prevTotal = state.simulatedTotal;
    const newTotal  = Math.min(prevTotal + raw, TOTAL_GOAL);
    const added     = newTotal - prevTotal;

    state.simulatedTotal = newTotal;

    const pct = Math.min((newTotal / TOTAL_GOAL) * 100, 100);

    setFeedback(
        `✅ ₹${fmt(added)} added — the building is now ${Math.round(pct)}% transformed!`,
        'ok'
    );

    input.value = '';
    clearActiveQuick();

    updateProgressUI(pct, newTotal);
    checkMilestones(pct);

    if (pct >= 100 && !state.unlockedMs.has('celebrated')) {
        state.unlockedMs.add('celebrated');
        setTimeout(showCelebration, 800);
    }
}

/* ── 3. Progress UI Update ───────────────────────────────────── */

function updateProgressUI(pct, totalRaised) {
    const fill  = document.getElementById('progressFill');
    const track = fill?.parentElement;
    if (fill)  fill.style.width = pct + '%';
    if (track) track.setAttribute('aria-valuenow', Math.round(pct));

    animateNumber('progressPercent', Math.round(pct), '%');
    animateAmount('amountRaised', totalRaised);

    updateBuildingImage(pct);
}

/* ── 4. Image Blend Reveal ───────────────────────────────────── */
/**
 * clip-path: inset(top% 0 0 0)
 *   top% starts at 100% (fully hidden) → decreases to 0% (fully visible)
 *   This reveals the AFTER image from bottom to top — like watching
 *   the new building rise from the ground as donations come in.
 */
function updateBuildingImage(pct) {
    const afterImg = document.getElementById('buildingAfterImg');
    const divider  = document.getElementById('biDivider');
    const divPct   = document.getElementById('biDivPct');
    const afterLbl = document.getElementById('biAfterLbl');

    const clipTop = Math.max(0, 100 - pct);
    if (afterImg) afterImg.style.clipPath = `inset(${clipTop}% 0 0 0)`;

    if (divider) {
        divider.classList.toggle('active', pct > 0 && pct < 100);
        divider.style.bottom = Math.min(pct, 96) + '%';
    }

    if (divPct)   divPct.textContent = Math.round(pct) + '% complete';
    if (afterLbl) afterLbl.classList.toggle('show', pct >= 5);
}

/* ── 5. Milestones ───────────────────────────────────────────── */

function checkMilestones(pct) {
    MILESTONES.forEach(ms => {
        const badge = document.getElementById(ms.id);
        if (pct >= ms.pct) {
            if (badge) badge.classList.add('unlocked');
            if (!state.unlockedMs.has(ms.id)) {
                state.unlockedMs.add(ms.id);
                setTimeout(() => setFeedback(ms.msg, 'ok'), 400);
            }
        }
    });
}

/* ── 6. Feedback ─────────────────────────────────────────────── */

function setFeedback(text, type = '') {
    const box  = document.getElementById('feedbackBox');
    const span = document.getElementById('feedbackText');
    if (!box || !span) return;
    box.className = 'feedback';
    if (type === 'ok')   box.classList.add('ok');
    if (type === 'warn') box.classList.add('warn');
    span.textContent = text;
}

/* ── 7. Confetti & Celebration ───────────────────────────────── */

const CONFETTI_COLORS = [
    '#B85C38', '#E8845A', '#F5C099',
    '#16A085', '#6BC4A0',
    '#2563EB', '#93C5FD',
    '#F59E0B', '#EC4899', '#A78BFA'
];

function showCelebration() {
    const overlay = document.getElementById('celebrationOverlay');
    if (!overlay) return;
    overlay.removeAttribute('hidden');
    overlay.style.display = 'flex';
    spawnConfetti();
}

function spawnConfetti() {
    const wrap = document.getElementById('confettiContainer');
    if (!wrap) return;
    wrap.innerHTML = '';
    for (let i = 0; i < 90; i++) {
        const el       = document.createElement('div');
        el.className   = 'confetti-p';
        const color    = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        const left     = Math.random() * 100;
        const delay    = Math.random() * 1.8;
        const duration = 2.6 + Math.random() * 2.2;
        const size     = 7 + Math.random() * 9;
        const isRound  = Math.random() > .45;
        el.style.cssText = `left:${left}%;background:${color};width:${size}px;height:${size*.65}px;border-radius:${isRound?'50%':'2px'};animation-delay:${delay}s;animation-duration:${duration}s;`;
        wrap.appendChild(el);
    }
}

function closeCelebration() {
    const overlay = document.getElementById('celebrationOverlay');
    if (overlay) { overlay.setAttribute('hidden', ''); overlay.style.display = 'none'; }
    const wrap = document.getElementById('confettiContainer');
    if (wrap) wrap.innerHTML = '';
}

/* ── 8. Reset ────────────────────────────────────────────────── */

function resetBuilding() {
    state.simulatedTotal = 0;
    state.unlockedMs.clear();

    // Reset image blend
    const afterImg = document.getElementById('buildingAfterImg');
    const divider  = document.getElementById('biDivider');
    const afterLbl = document.getElementById('biAfterLbl');
    const divPct   = document.getElementById('biDivPct');
    if (afterImg) afterImg.style.clipPath = 'inset(100% 0 0 0)';
    if (divider)  { divider.classList.remove('active'); divider.style.bottom = '0%'; }
    if (afterLbl) afterLbl.classList.remove('show');
    if (divPct)   divPct.textContent = '0% complete';

    // Reset progress bar
    const fill  = document.getElementById('progressFill');
    const track = fill?.parentElement;
    if (fill)  fill.style.width = '0%';
    if (track) track.setAttribute('aria-valuenow', 0);

    // Reset counters
    const pctEl = document.getElementById('progressPercent');
    const amtEl = document.getElementById('amountRaised');
    if (pctEl) pctEl.textContent = '0%';
    if (amtEl) amtEl.textContent = '₹0 raised';

    // Reset milestones
    MILESTONES.forEach(ms => { document.getElementById(ms.id)?.classList.remove('unlocked'); });

    setFeedback('Enter an amount above to watch the real transformation begin.');
    clearActiveQuick();
    const input = document.getElementById('donationInput');
    if (input) { input.value = ''; input.focus(); }

    closeCelebration();
}

/* ── 9. Quick-Amount Buttons ─────────────────────────────────── */

function initQuickButtons() {
    document.querySelectorAll('.qbtn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseFloat(btn.dataset.amount);
            const input  = document.getElementById('donationInput');
            if (isNaN(amount) || !input) return;
            input.value = amount;
            clearActiveQuick();
            btn.classList.add('active');
            const pct = Math.round((amount / TOTAL_GOAL) * 100);
            setFeedback(`₹${fmt(amount)} selected — that's ${pct}% of the goal. Click Simulate!`);
        });
    });
}

function clearActiveQuick() {
    document.querySelectorAll('.qbtn.active').forEach(b => b.classList.remove('active'));
}

/* ── 10. Navbar ──────────────────────────────────────────────── */

function initNavbar() {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
    if (!navbar) return;

    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 64);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            hamburger.classList.toggle('open', open);
            hamburger.setAttribute('aria-expanded', String(open));
        });
        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                navLinks.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
        document.addEventListener('click', e => {
            if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

/* ── 11. Scroll-in Animations ────────────────────────────────── */

function initScrollAnimations() {
    const targets = document.querySelectorAll(
        '.impact-card, .sol-card, .pm-cell, .ba-card, ' +
        '.sim-card, .rd-card, .transparency-card, ' +
        '.budget-table-wrap, .cost-chart, .ms, .outcome-card'
    );
    targets.forEach(el => el.classList.add('appear'));

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    targets.forEach(el => io.observe(el));
}

/* ── 12. Dropout Funnel Bars ─────────────────────────────────── */

function initDropoutFunnel() {
    const bars = document.querySelectorAll('.df-bar[data-w]');
    if (!bars.length) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar   = entry.target;
                const delay = parseInt(bar.closest('.df-step')?.dataset?.delay || '0', 10);
                setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, delay);
                io.unobserve(bar);
            }
        });
    }, { threshold: 0.4 });

    bars.forEach((bar, i) => {
        const step = bar.closest('.df-step');
        if (step) step.dataset.delay = String(i * 350);
        io.observe(bar);
    });
}

/* ── 13. Cost Bar Animations ─────────────────────────────────── */

function initCostBars() {
    const bars = document.querySelectorAll('.cc-bar[data-w]');
    if (!bars.length) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el    = entry.target;
                const delay = parseInt(el.closest('.cc-row')?.dataset.d || '0', 10);
                setTimeout(() => { el.style.width = el.dataset.w + '%'; }, delay);
                io.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    bars.forEach((bar, i) => {
        const row = bar.closest('.cc-row');
        if (row) row.dataset.d = String(i * 260);
        io.observe(bar);
    });
}

/* ── 13. Utilities ───────────────────────────────────────────── */

function fmt(n) { return Math.round(n).toLocaleString('en-IN'); }

function animateNumber(id, target, suffix = '') {
    const el = document.getElementById(id);
    if (!el) return;
    const start = parseInt(el.textContent, 10) || 0;
    if (start === target) return;
    const steps = 22, ms = 520 / steps;
    let i = 0;
    const t = setInterval(() => {
        i++;
        el.textContent = Math.round(start + (target - start) * (i / steps)) + suffix;
        if (i >= steps) { clearInterval(t); el.textContent = target + suffix; }
    }, ms);
}

function animateAmount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const current = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10) || 0;
    if (current === target) return;
    const steps = 24, ms = 600 / steps;
    let i = 0;
    const t = setInterval(() => {
        i++;
        const v = Math.round(current + (target - current) * easeOut(i / steps));
        el.textContent = '₹' + fmt(v) + ' raised';
        if (i >= steps) { clearInterval(t); el.textContent = '₹' + fmt(target) + ' raised'; }
    }, ms);
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

/* ── 14. Init ────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initQuickButtons();
    initScrollAnimations();
    initDropoutFunnel();
    initCostBars();

    document.getElementById('closeCelebBtn')
        ?.addEventListener('click', closeCelebration);
    document.getElementById('celebrationOverlay')
        ?.addEventListener('click', e => { if (e.target.id === 'celebrationOverlay') closeCelebration(); });

    document.getElementById('simulateBtn')?.addEventListener('click', simulateDonation);
    document.getElementById('resetBtn')?.addEventListener('click', resetBuilding);
    document.getElementById('donationInput')
        ?.addEventListener('keydown', e => { if (e.key === 'Enter') simulateDonation(); });

    updateProgressUI(0, 0);
});

/*
 * ════════════════════════════════════════════════════════
 * IMAGE FILES (place in same folder as index.html):
 *   1.jpeg  — Hero section
 *   2.jpeg  — Photo mosaic: feature (large)
 *   3.jpeg  — Photo mosaic: top-right
 *   5.jpeg  — Photo mosaic: bottom-left
 *   9.jpeg  — Photo mosaic: bottom-center
 *   7.jpeg  — BEFORE  (current broken restroom) used in game + BA section
 *   8.jpeg  — AFTER   (new restroom block)      used in game + BA section
 *
 * PAYMENT LINK: find the 3× href="#" tags in index.html
 *               marked "PAYMENT LINK" and replace with Razorpay/UPI link.
 * ════════════════════════════════════════════════════════
 */
