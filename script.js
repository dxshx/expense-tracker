const API_URL = 'http://localhost:3000';
let token = localStorage.getItem('token');
let currentUser = localStorage.getItem('currentUser');

// DOM Elements
const authSection = document.getElementById('auth-section');
const expenseSection = document.getElementById('expense-section');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');
const signinBtn = document.getElementById('signin-btn');
const signoutBtn = document.getElementById('signout-btn');
const dateInput = document.getElementById('date');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const addExpenseBtn = document.getElementById('add-expense-btn');
const expenseList = document.getElementById('expense-list');
const userNameSpan = document.getElementById('user-name');
const needsTotalElement = document.getElementById('needs-total');
const wantsTotalElement = document.getElementById('wants-total');

// Modal Elements
const modal = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close');

// Event Listeners
signupBtn.addEventListener('click', signup);
signinBtn.addEventListener('click', signin);
signoutBtn.addEventListener('click', signout);
addExpenseBtn.addEventListener('click', addExpense);
modalCloseBtn.addEventListener('click', closeModal);

// Check if user is already authenticated
if (token && currentUser) {
    showExpenseSection();
    fetchExpenses();
}

function showModal(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

async function signup() {
    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: usernameInput.value, password: passwordInput.value })
        });
        const data = await response.json();
        showModal('Sign Up', data.message);
    } catch (error) {
        console.log('Signup error:', error);
        showModal('Error', 'An error occurred during signup. Please try again.');
    }
}

async function signin() {
    try {
        const response = await fetch(`${API_URL}/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: usernameInput.value, password: passwordInput.value })
        });
        const data = await response.json();
        if (data.token) {
            token = data.token;
            currentUser = usernameInput.value;
            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', currentUser);
            showExpenseSection();
            fetchExpenses();
        } else {
            showModal('Sign In Failed', data.message || 'Please check your credentials.');
        }
    } catch (error) {
        console.log('Signin error:', error);
        showModal('Error', 'An error occurred during sign in. Please try again.');
    }
}

function signout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    authSection.style.display = 'block';
    expenseSection.style.display = 'none';
    usernameInput.value = '';
    passwordInput.value = '';
}

async function addExpense() {
    if (!token) {
        showModal('Error', 'You must be signed in to add an expense.');
        return;
    }
    try {
        const response = await fetch(`${API_URL}/add-expenses`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                date: dateInput.value,
                description: descriptionInput.value,
                amount: amountInput.value,
                category: categorySelect.value
            })
        });
        const data = await response.json();
        showModal('Add Expense', data.message);
        if (data.message === "Expense Added Successfully!") {
            fetchExpenses();
            // Clear input fields
            dateInput.value = '';
            descriptionInput.value = '';
            amountInput.value = '';
            categorySelect.value = 'Needs';
        }
    } catch (error) {
        console.error('Add expense error:', error);
        showModal('Error', 'An error occurred while adding the expense. Please try again.');
    }
}

async function fetchExpenses() {
    if (!token) {
        showModal('Error', 'You must be signed in to view expenses.');
        return;
    }
    try {
        const response = await fetch(`${API_URL}/all-expenses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.allExpenses) {
            displayExpenses(data.allExpenses);
            calculateAndDisplayTotals(data.allExpenses);
        } else {
            showModal('Error', data.message || 'Failed to fetch expenses.');
        }
    } catch (error) {
        console.error('Fetch expenses error:', error);
        showModal('Error', 'An error occurred while fetching expenses. Please try again.');
    }
}

function displayExpenses(expenses) {
    expenseList.innerHTML = '';
    expenses.forEach(expense => {
        const li = document.createElement('li');
        li.className = 'bg-white p-4 rounded-lg shadow transition-all duration-300 hover:shadow-md';
        li.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-800">${expense.description}</span>
                <span class="text-indigo-600 font-bold">₹${expense.amount}</span>
            </div>
            <div class="text-sm text-gray-500 mt-1">
                ${new Date(expense.date).toLocaleDateString()} - ${expense.category}
            </div>
        `;
        expenseList.appendChild(li);
    });
}

function calculateAndDisplayTotals(expenses) {
    let needsTotal = 0;
    let wantsTotal = 0;

    expenses.forEach(expense => {
        if (expense.category === 'Needs') {
            needsTotal += parseFloat(expense.amount);
        } else if (expense.category === 'Wants') {
            wantsTotal += parseFloat(expense.amount);
        }
    });

    needsTotalElement.textContent = `₹${needsTotal.toFixed(2)}`;
    wantsTotalElement.textContent = `₹${wantsTotal.toFixed(2)}`;
}

function showExpenseSection() {
    authSection.style.display = 'none';
    expenseSection.style.display = 'block';
    userNameSpan.textContent = currentUser;
}

// Initialize date input with current date
dateInput.valueAsDate = new Date();

// Add event listener for mobile devices
if ('ontouchstart' in window) {
    document.body.addEventListener('touchstart', function(e) {
        if (e.target.id !== 'custom-modal' && !custom-modal.contains(e.target) && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// Prevent form submission on enter key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});

// Add accessibility features
modal.setAttribute('aria-hidden', 'true');
modalCloseBtn.setAttribute('aria-label', 'Close modal');

signupBtn.setAttribute('aria-label', 'Sign up');
signinBtn.setAttribute('aria-label', 'Sign in');
signoutBtn.setAttribute('aria-label', 'Sign out');
addExpenseBtn.setAttribute('aria-label', 'Add expense');

// Improve error handling
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showModal('Error', 'An unexpected error occurred. Please try again later.');
});

// Implement auto-logout after inactivity
let inactivityTimer;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(signout, INACTIVITY_TIMEOUT);
}

document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);

// Initialize the application
resetInactivityTimer();
if (token && currentUser) {
    showExpenseSection();
    fetchExpenses();
} else {
    authSection.style.display = 'block';
    expenseSection.style.display = 'none';
}

