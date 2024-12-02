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

// Event Listeners
signupBtn.addEventListener('click', signup);
signinBtn.addEventListener('click', signin);
signoutBtn.addEventListener('click', signout);
addExpenseBtn.addEventListener('click', addExpense);

// Check if user is already authenticated
if (token && currentUser) {
    showExpenseSection();
    fetchExpenses();
}

async function signup() {
    const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: usernameInput.value, password: passwordInput.value })
    });
    const data = await response.json();
    alert(data.message);
}

async function signin() {
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
        alert(data.message);
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
        alert('You must be signed in to add an expense.');
        return;
    }
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
    alert(data.message);
    if (data.message === "Expense Added Successfully!") {
        fetchExpenses();
        // Clear input fields
        dateInput.value = '';
        descriptionInput.value = '';
        amountInput.value = '';
        categorySelect.value = 'Needs';
    }
}

async function fetchExpenses() {
    if (!token) {
        alert('You must be signed in to view expenses.');
        return;
    }
    const response = await fetch(`${API_URL}/all-expenses`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.allExpenses) {
        displayExpenses(data.allExpenses);
        calculateAndDisplayTotals(data.allExpenses);
    } else {
        alert(data.message);
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

