const USER_KEY = 'wingo_user';
const BALANCE_KEY = 'wingo_balance';
const TRANSACTIONS_KEY = 'wingo_transactions';
const SESSION_KEY = 'wingo_session';

export function isLoggedIn() {
    return !!sessionStorage.getItem(SESSION_KEY) && !!localStorage.getItem(USER_KEY);
}

export function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function getBalance() {
    const b = localStorage.getItem(BALANCE_KEY);
    return b !== null ? parseFloat(b) : 25000;
}

export function setBalance(amount) {
    localStorage.setItem(BALANCE_KEY, parseFloat(amount).toFixed(2));
}

export function getTransactions() {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
}

export function addTransaction(type, amount, note = '') {
    const txs = getTransactions();
    txs.unshift({
        id: Date.now(),
        type,
        amount,
        note,
        date: new Date().toISOString(),
        balance: getBalance()
    });
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs.slice(0, 100)));
}

export function login(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    sessionStorage.setItem(SESSION_KEY, '1');
}

export function logout() {
    sessionStorage.removeItem(SESSION_KEY);
}

export function register(userData) {
    const user = {
        username: userData.username,
        phone: userData.phone || '',
        email: userData.email || '',
        avatar: userData.avatar || '',
        uid: 'UID' + Math.floor(10000000 + Math.random() * 90000000),
        createdAt: new Date().toISOString()
    };
    if (!localStorage.getItem(BALANCE_KEY)) {
        localStorage.setItem(BALANCE_KEY, '1000.00');
        addTransaction('bonus', 1000, 'Welcome bonus');
    }
    login(user);
    return user;
}

export function requireAuth(redirectTo = 'home.html') {
    if (!isLoggedIn()) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

export function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
