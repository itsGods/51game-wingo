// offlineTimer.js — Period data generator for all WinGo game types

const INTERVALS = {
    "Win Go 30s":  30_000,
    "Win Go 1Min": 60_000,
    "Win Go 3Min": 180_000,
    "Win Go 5Min": 300_000,
};

// Per-game issue-number sequence bases (mimics real WinGo format)
const ISSUE_CONFIG = {
    "Win Go 30s":  { base: 50001, pad: 5, mid: "100" },
    "Win Go 1Min": { base: 10001, pad: 5, mid: "100" },
    "Win Go 3Min": { base: 1001,  pad: 4, mid: "100" },
    "Win Go 5Min": { base: 501,   pad: 4, mid: "100" },
};

export function getGameInterval(gameType) {
    return INTERVALS[gameType] ?? 30_000;
}

/**
 * Returns the ms-since-epoch of the next interval boundary after `nowMs`.
 */
export function getAlignedEndTime(gameType, nowMs = Date.now()) {
    const iv = getGameInterval(gameType);
    return nowMs + iv - (nowMs % iv);
}

/**
 * Formats a WinGo-style issue number, e.g. "2025061510001052449"
 *   YYYYMMDD + mid + zero-padded sequence number
 */
export function formatIssueNumber(gameType, nowMs = Date.now()) {
    const d = new Date(nowMs);
    const year  = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day   = String(d.getUTCDate()).padStart(2, '0');

    const startOfDayMs = Date.UTC(year, d.getUTCMonth(), d.getUTCDate());
    const iv = getGameInterval(gameType);
    const periodsSinceMidnight = Math.floor((nowMs - startOfDayMs) / iv);

    const { base, pad, mid } = ISSUE_CONFIG[gameType] ?? ISSUE_CONFIG["Win Go 30s"];
    const seq = String(base + periodsSinceMidnight).padStart(pad, '0');

    return `${year}${month}${day}${mid}${seq}`;
}

/**
 * Main export: generate a full period data object for the given game type.
 */
export function generateOfflinePeriodData(gameType) {
    const nowMs  = Date.now();
    const endMs  = getAlignedEndTime(gameType, nowMs);
    const secsLeft = Math.max(1, Math.ceil((endMs - nowMs) / 1000));

    return {
        endTime:          new Date(endMs).toISOString(),
        endTimeMs:        endMs,
        issueNumber:      formatIssueNumber(gameType, nowMs),
        remainingSeconds: secsLeft,
        offline:          true,
    };
}
