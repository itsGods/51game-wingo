// ============================================================
// WINGO GAME ENGINE
// ============================================================
// Color assignment per drawn number:
//   0 → Red + Violet
//   1, 3, 7, 9 → Green
//   2, 4, 6, 8 → Red
//   5 → Green + Violet

const NUMBER_COLORS = {
    0: ['red', 'violet'],
    1: ['green'],
    2: ['red'],
    3: ['green'],
    4: ['red'],
    5: ['green', 'violet'],
    6: ['red'],
    7: ['green'],
    8: ['red'],
    9: ['green'],
};

// ── Random result generation ──────────────────────────────
export function generateResult() {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % 10;
}

// ── Result data object ────────────────────────────────────
export function buildResultData(num) {
    const colors = NUMBER_COLORS[num];
    return {
        randomNumber: num,
        isBig: num >= 5,
        colors,
        showRed:     colors.includes('red'),
        showGreen:   colors.includes('green'),
        showViolet:  colors.includes('violet'),
        mixedColor0: num === 0,   // red + violet
        mixedColor5: num === 5,   // green + violet
    };
}

// ── Last round result (shared across modules) ─────────────
let _lastResult = null;

export function setLastResult(num) { _lastResult = num; }
export function getLastResult()    { return _lastResult; }

// ── Active bet tracking ───────────────────────────────────
// type: 'green' | 'red' | 'violet' | 'number' | 'big' | 'small'
// number: 0-9 (only used when type === 'number')
let _currentBet = null;

export function setBet(type, number = null) {
    _currentBet = { type, number };
}

export function getCurrentBet() { return _currentBet; }
export function clearBet()      { _currentBet = null; }

// ── Win evaluation ────────────────────────────────────────
// Returns { won, multiplier, label }
export function evaluateBet(bet, resultNum) {
    if (!bet || bet.type === null) return { won: false, multiplier: 0, label: 'No bet' };

    const colors = NUMBER_COLORS[resultNum];
    const big    = resultNum >= 5;

    switch (bet.type) {
        case 'green':
            if (resultNum === 5)              return { won: true,  multiplier: 1.5, label: 'Green ×1.5' };
            if (colors.includes('green'))     return { won: true,  multiplier: 2,   label: 'Green ×2' };
            return { won: false, multiplier: 0, label: 'Green' };

        case 'red':
            if (resultNum === 0)              return { won: true,  multiplier: 1.5, label: 'Red ×1.5' };
            if (colors.includes('red'))       return { won: true,  multiplier: 2,   label: 'Red ×2' };
            return { won: false, multiplier: 0, label: 'Red' };

        case 'violet':
            if (resultNum === 0 || resultNum === 5) return { won: true, multiplier: 4.5, label: 'Violet ×4.5' };
            return { won: false, multiplier: 0, label: 'Violet' };

        case 'number':
            if (bet.number === resultNum)     return { won: true,  multiplier: 9,   label: `No. ${resultNum} ×9` };
            return { won: false, multiplier: 0, label: `No. ${bet.number}` };

        case 'big':
            if (big)                          return { won: true,  multiplier: 2,   label: 'Big ×2' };
            return { won: false, multiplier: 0, label: 'Big' };

        case 'small':
            if (!big)                         return { won: true,  multiplier: 2,   label: 'Small ×2' };
            return { won: false, multiplier: 0, label: 'Small' };

        default:
            return { won: false, multiplier: 0, label: '—' };
    }
}

// ── Payout calculation (2 % service fee deducted first) ───
export function calculatePayout(betAmount, multiplier) {
    const afterFee = betAmount * 0.98;
    return afterFee * multiplier;
}

// ── CSS color type class ──────────────────────────────────
export function getColorType(resultData) {
    if (resultData.mixedColor0) return 'type0';   // 0 → red+violet
    if (resultData.showRed)     return 'type4';   // pure red
    if (resultData.mixedColor5) return 'type5';   // 5 → green+violet
    if (resultData.showGreen)   return 'type3';   // pure green
    return 'type4';
}

// ── Human-readable color label ────────────────────────────
export function getColorLabel(resultData) {
    if (resultData.mixedColor0) return 'Red Violet';
    if (resultData.mixedColor5) return 'Green Violet';
    if (resultData.showRed)     return 'Red';
    if (resultData.showGreen)   return 'Green';
    return 'Violet';
}

// ── Popup class suffix → bet type mapping ─────────────────
export function parseBetFromPopupSuffix(suffix) {
    const n = parseInt(suffix, 10);
    if (n === 10) return { type: 'red',    number: null };
    if (n === 11) return { type: 'green',  number: null };
    if (n === 12) return { type: 'violet', number: null };
    if (n === 13) return { type: 'big',    number: null };
    if (n === 14) return { type: 'small',  number: null };
    if (n >= 0 && n <= 9) return { type: 'number', number: n };
    return null;
}

// ── Format currency helper ────────────────────────────────
export function fmt(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
    });
}
