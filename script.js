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
const recipientInput = document.getElementById('recipient-username');
const transferAmountInput = document.getElementById('transfer-amount');
const transferDescriptionInput = document.getElementById('transfer-description');
const transferBtn = document.getElementById('transfer-btn');


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
transferBtn.addEventListener('click', transferMoney);

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
    const categoryColors = {
        'Food': 'bg-orange-100 text-orange-800',
        'Transportation': 'bg-blue-100 text-blue-800',
        'Housing': 'bg-purple-100 text-purple-800',
        'Utilities': 'bg-green-100 text-green-800',
        'Entertainment': 'bg-pink-100 text-pink-800',
        'Shopping': 'bg-yellow-100 text-yellow-800',
        'Healthcare': 'bg-red-100 text-red-800',
        'Education': 'bg-indigo-100 text-indigo-800',
        'Other': 'bg-gray-100 text-gray-800',
        'Transfer': 'bg-red-100 text-red-800',
        'Received': 'bg-green-100 text-green-800'
    };

    expenses.forEach(expense => {
        const li = document.createElement('li');
        li.className = 'bg-white p-4 rounded-lg shadow transition-all duration-300 hover:shadow-md';
        
        // Format the description to include transfer details
        let displayDescription = expense.description;
        if (expense.transferParty) {
            if (expense.category === 'Transfer') {
                displayDescription = `Transfer to ${expense.transferParty}: ${expense.description}`;
            } else if (expense.category === 'Received') {
                displayDescription = `Received from ${expense.transferParty}: ${expense.description}`;
            }
        }

        // Format amount with proper sign
        const amountDisplay = expense.category === 'Received' 
            ? `+₹${Math.abs(expense.amount)}`
            : `₹${expense.amount}`;
        
        const amountClass = expense.category === 'Received' 
            ? 'text-green-600'
            : expense.category === 'Transfer' 
                ? 'text-red-600' 
                : 'text-indigo-600';

        li.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-800">${displayDescription}</span>
                <span class="font-bold ${amountClass}">${amountDisplay}</span>
            </div>
            <div class="flex justify-between items-center text-sm mt-1">
                <span class="text-gray-500">${new Date(expense.date).toLocaleDateString()}</span>
                <span class="px-2 py-1 rounded-full ${categoryColors[expense.category]}">${expense.category}</span>
            </div>
        `;
        expenseList.appendChild(li);
    });
}

function calculateAndDisplayTotals(expenses) {
    const categoryTotals = {};
    const categoryColors = {
        'Food': 'text-orange-600',
        'Transportation': 'text-blue-600',
        'Housing': 'text-purple-600',
        'Utilities': 'text-green-600',
        'Entertainment': 'text-pink-600',
        'Shopping': 'text-yellow-600',
        'Healthcare': 'text-red-600',
        'Education': 'text-indigo-600',
        'Other': 'text-gray-600',
        'Transfer': 'text-red-600',
        'Received': 'text-green-600'
    };

    // Initialize all categories with 0
    Object.keys(categoryColors).forEach(category => {
        categoryTotals[category] = 0;
    });

    // Calculate totals for each category
    expenses.forEach(expense => {
        categoryTotals[expense.category] += parseFloat(expense.amount);
    });

    // Display the totals
    const categoryTotalsDiv = document.getElementById('category-totals');
    categoryTotalsDiv.innerHTML = '';

    // Calculate net transfer amount
    const netTransfer = categoryTotals['Received'] + categoryTotals['Transfer'];

    Object.entries(categoryTotals).forEach(([category, total]) => {
        // Skip Transfer and Received categories as we'll show net transfer
        if (category === 'Transfer' || category === 'Received') {
            return;
        }

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'mb-2';
        categoryDiv.innerHTML = `
            <p class="text-sm text-gray-600">${category}:</p>
            <p class="text-lg font-bold ${categoryColors[category]}">₹${Math.abs(total).toFixed(2)}</p>
        `;
        categoryTotalsDiv.appendChild(categoryDiv);
    });

    // Add net transfer amount if there are any transfers
    if (categoryTotals['Transfer'] !== 0 || categoryTotals['Received'] !== 0) {
        const netTransferDiv = document.createElement('div');
        netTransferDiv.className = 'mb-2';
        const netTransferColor = netTransfer >= 0 ? 'text-green-600' : 'text-red-600';
        netTransferDiv.innerHTML = `
            <p class="text-sm text-gray-600">Net Transfers:</p>
            <p class="text-lg font-bold ${netTransferColor}">₹${netTransfer.toFixed(2)}</p>
        `;
        categoryTotalsDiv.appendChild(netTransferDiv);
    }
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
transferBtn.setAttribute('aria-label', 'Transfer money');

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

async function transferMoney() {
    if (!token) {
        showModal('Error', 'You must be signed in to transfer money.');
        return;
    }

    const recipient = recipientInput.value.trim();
    const amount = parseFloat(transferAmountInput.value);
    const description = transferDescriptionInput.value.trim();

    if (!recipient || !amount || amount <= 0) {
        showModal('Error', 'Please enter a valid recipient and amount.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                recipientUsername: recipient,
                amount: amount,
                description: description
            })
        });

        const data = await response.json();
        showModal('Transfer', data.message);
        
        if (response.ok) {
            // Clear inputs and refresh expenses
            recipientInput.value = '';
            transferAmountInput.value = '';
            transferDescriptionInput.value = '';
            fetchExpenses();
        }
    } catch (error) {
        console.error('Transfer error:', error);
        showModal('Error', 'An error occurred during transfer. Please try again.');
    }
}

