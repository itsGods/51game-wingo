import { money, winBonus } from "./elements.js";
import { isBetted, totalBetAmount } from "./events.js";
import {
    evaluateBet, calculatePayout,
    getCurrentBet, getLastResult, clearBet, fmt
} from "./gameEngine.js";

// Persist balance to user.js if available (graceful fallback)
async function persistBalance(bal) {
    try {
        const { setBalance, addTransaction } = await import('./user.js');
        setBalance(bal);
        return { setBalance, addTransaction };
    } catch { return null; }
}

export async function handleMoneys() {
    if (!isBetted) return;

    const bet       = getCurrentBet();
    const resultNum = getLastResult();
    const betAmount = totalBetAmount;

    const evaluation = evaluateBet(bet, resultNum);

    // Current balance already has the bet deducted (done at bet-confirm time)
    let currentBalance = parseFloat(
        (money.textContent || '0').replace(/[₹,]/g, '')
    );

    if (evaluation.won) {
        const payout    = calculatePayout(betAmount, evaluation.multiplier);
        currentBalance += payout;

        winBonus.textContent = fmt(payout);
        winBonus.style.color = '#2ed573';

        money.textContent = fmt(currentBalance);

        // Persist to wallet
        const u = await persistBalance(currentBalance);
        u?.addTransaction('win', payout, `Won — ${evaluation.label}`);
    } else {
        // No payout — balance stays as-is (bet already deducted)
        winBonus.textContent = 'You Lost';
        winBonus.style.color = '#ff4757';
        money.textContent    = fmt(currentBalance);

        const u = await persistBalance(currentBalance);
        u?.addTransaction('bet', betAmount, `Lost — ${evaluation.label}`);
    }

    clearBet();
}
