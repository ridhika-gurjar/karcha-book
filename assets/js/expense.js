/**
 * Expense Tracker Application
 * by Pooja Gurjar
 * 
 * JavaScript file for the expense tracker page
 */

// DOM Elements
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
const expenseForm = document.getElementById('expense-form');
const amountInput = document.getElementById('expense-amount');
const descriptionInput = document.getElementById('expense-description');
const dateInput = document.getElementById('expense-date');
const categoryInput = document.getElementById('expense-category');
const expenseCardsContainer = document.getElementById('expense-cards-container');
const noExpensesMessage = document.getElementById('no-expenses-message');
const totalAmountElement = document.getElementById('total-amount');
const expenseCountElement = document.getElementById('expense-count');
const filterCategory = document.getElementById('filter-category');
const sortBy = document.getElementById('sort-by');
const saveExpenseBtn = document.getElementById('save-expense');
const updateExpenseBtn = document.getElementById('update-expense');
const cancelUpdateBtn = document.getElementById('cancel-update');
const resetExpensesBtn = document.getElementById('reset-expenses');
const confirmationModal = document.getElementById('confirmation-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalConfirmBtn = document.getElementById('modal-confirm');
const modalCancelBtn = document.getElementById('modal-cancel');
const closeModalBtn = document.querySelector('.close-modal');
const toast = document.getElementById('toast-notification');
const toastMessage = document.getElementById('toast-message');
const toastIcon = document.getElementById('toast-icon');

// Error message elements
const amountError = document.getElementById('amount-error');
const descriptionError = document.getElementById('description-error');
const dateError = document.getElementById('date-error');
const categoryError = document.getElementById('category-error');

// Global variables
let expenses = [];
let currentExpenseId = null;
let modalCallback = null;

// Initialize the application
function init() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Load expenses from localStorage
    loadExpenses();
    
    // Display expenses
    renderExpenses();
    
    // Add event listeners - using both click and touchend for better mobile support
    expenseForm.addEventListener('submit', handleFormSubmit);
    
    // Fix for mobile devices - ensure the form submit button works on touch
    saveExpenseBtn.addEventListener('click', function(e) {
        // Prevent default only if it's not already being handled by the form submit
        if (e.target === saveExpenseBtn) {
            e.preventDefault();
            handleFormSubmit(e);
        }
    });
    
    updateExpenseBtn.addEventListener('click', handleUpdateExpense);
    cancelUpdateBtn.addEventListener('click', cancelUpdate);
    filterCategory.addEventListener('change', renderExpenses);
    sortBy.addEventListener('change', renderExpenses);
    resetExpensesBtn.addEventListener('click', confirmResetExpenses);
    modalConfirmBtn.addEventListener('click', handleModalConfirm);
    modalCancelBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Mobile navigation
    burger.addEventListener('click', toggleNav);
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.burger')) {
            toggleNav();
        }
    });
    
    // Make navbar sticky on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.padding = '0.5rem 2rem';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.padding = '1rem 2rem';
            navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
    });
}

// Toggle mobile navigation
function toggleNav() {
    navLinks.classList.toggle('active');
    
    // Animate burger menu
    burger.classList.toggle('active');
    
    // If burger is active, transform to X
    if (burger.classList.contains('active')) {
        burger.querySelector('.line1').style.transform = 'rotate(-45deg) translate(-5px, 6px)';
        burger.querySelector('.line2').style.opacity = '0';
        burger.querySelector('.line3').style.transform = 'rotate(45deg) translate(-5px, -6px)';
    } else {
        burger.querySelector('.line1').style.transform = 'none';
        burger.querySelector('.line2').style.opacity = '1';
        burger.querySelector('.line3').style.transform = 'none';
    }
}

// Load expenses from localStorage
function loadExpenses() {
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
        expenses = JSON.parse(storedExpenses);
    }
}

// Save expenses to localStorage
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Validate form inputs
function validateForm() {
    let isValid = true;
    
    // Reset error messages
    amountError.textContent = '';
    descriptionError.textContent = '';
    dateError.textContent = '';
    categoryError.textContent = '';
    
    // Validate amount
    if (!amountInput.value || parseFloat(amountInput.value) <= 0) {
        amountError.textContent = 'Please enter a valid amount';
        isValid = false;
    }
    
    // Validate description
    if (!descriptionInput.value.trim()) {
        descriptionError.textContent = 'Please enter a description';
        isValid = false;
    } else if (descriptionInput.value.trim().length < 3) {
        descriptionError.textContent = 'Description must be at least 3 characters';
        isValid = false;
    }
    
    // Validate date
    if (!dateInput.value) {
        dateError.textContent = 'Please select a date';
        isValid = false;
    }
    
    // Validate category
    if (!categoryInput.value) {
        categoryError.textContent = 'Please select a category';
        isValid = false;
    }
    
    return isValid;
}

// Handle form submission
function handleFormSubmit(e) {
    // Always prevent default behavior
    if (e) {
        e.preventDefault();
    }
    
    if (!validateForm()) {
        return;
    }
    
    // Create new expense object
    const newExpense = {
        id: Date.now().toString(),
        amount: parseFloat(amountInput.value),
        description: descriptionInput.value.trim(),
        date: dateInput.value,
        category: categoryInput.value
    };
    
    // Add to expenses array
    expenses.push(newExpense);
    
    // Save to localStorage
    saveExpenses();
    
    // Reset form
    expenseForm.reset();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Display expenses
    renderExpenses();
    
    // Show success toast
    showToast('Expense added successfully!', 'success');
    
    // Return false to ensure the form doesn't submit traditionally
    return false;
}

// Handle expense update
function handleUpdateExpense() {
    if (!validateForm()) {
        return;
    }
    
    // Find expense by ID
    const expenseIndex = expenses.findIndex(expense => expense.id === currentExpenseId);
    
    if (expenseIndex !== -1) {
        // Update expense
        expenses[expenseIndex] = {
            ...expenses[expenseIndex],
            amount: parseFloat(amountInput.value),
            description: descriptionInput.value.trim(),
            date: dateInput.value,
            category: categoryInput.value
        };
        
        // Save to localStorage
        saveExpenses();
        
        // Reset form and UI
        cancelUpdate();
        
        // Display expenses
        renderExpenses();
        
        // Show success toast
        showToast('Expense updated successfully!', 'success');
    }
}

// Cancel update operation
function cancelUpdate() {
    // Reset form
    expenseForm.reset();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Reset current expense ID
    currentExpenseId = null;
    
    // Show save button, hide update and cancel buttons
    saveExpenseBtn.style.display = 'inline-block';
    updateExpenseBtn.style.display = 'none';
    cancelUpdateBtn.style.display = 'none';
}

// Edit expense
function editExpense(id) {
    // Find expense by ID
    const expense = expenses.find(expense => expense.id === id);
    
    if (expense) {
        // Fill form with expense data
        amountInput.value = expense.amount;
        descriptionInput.value = expense.description;
        dateInput.value = expense.date;
        categoryInput.value = expense.category;
        
        // Set current expense ID
        currentExpenseId = id;
        
        // Hide save button, show update and cancel buttons
        saveExpenseBtn.style.display = 'none';
        updateExpenseBtn.style.display = 'inline-block';
        cancelUpdateBtn.style.display = 'inline-block';
        
        // Scroll to form
        expenseForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete expense
function deleteExpense(id) {
    // Show confirmation modal
    showModal(
        'Confirm Delete',
        'Are you sure you want to delete this expense?',
        () => {
            // Filter out the expense with the given ID
            expenses = expenses.filter(expense => expense.id !== id);
            
            // Save to localStorage
            saveExpenses();
            
            // Display expenses
            renderExpenses();
            
            // Show success toast
            showToast('Expense deleted successfully!', 'success');
        }
    );
}

// Confirm reset all expenses
function confirmResetExpenses() {
    // Show confirmation modal
    showModal(
        'Reset All Data',
        'Are you sure you want to delete all expenses? This action cannot be undone.',
        () => {
            // Clear expenses array
            expenses = [];
            
            // Save to localStorage
            saveExpenses();
            
            // Display expenses
            renderExpenses();
            
            // Show success toast
            showToast('All expenses have been reset!', 'success');
        }
    );
}

// Show modal with confirmation
function showModal(title, message, callback) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalCallback = callback;
    confirmationModal.classList.add('show');
}

// Close modal
function closeModal() {
    confirmationModal.classList.remove('show');
}

// Handle modal confirm button click
function handleModalConfirm() {
    if (modalCallback) {
        modalCallback();
    }
    closeModal();
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    // Set icon based on type
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return '₹' + amount.toFixed(2);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Calculate total amount
function calculateTotal() {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
}

// Filter expenses by category
function filterExpenses() {
    const selectedCategory = filterCategory.value;
    
    if (selectedCategory === 'All') {
        return expenses;
    } else {
        return expenses.filter(expense => expense.category === selectedCategory);
    }
}

// Sort expenses
function sortExpenses(filteredExpenses) {
    const selectedSort = sortBy.value;
    
    switch (selectedSort) {
        case 'date-desc':
            return [...filteredExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'date-asc':
            return [...filteredExpenses].sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'amount-desc':
            return [...filteredExpenses].sort((a, b) => b.amount - a.amount);
        case 'amount-asc':
            return [...filteredExpenses].sort((a, b) => a.amount - b.amount);
        default:
            return filteredExpenses;
    }
}

// Render expenses to the DOM
function renderExpenses() {
    // Filter and sort expenses
    const filteredExpenses = filterExpenses();
    const sortedExpenses = sortExpenses(filteredExpenses);
    
    // Clear expense cards container
    expenseCardsContainer.innerHTML = '';
    
    // Check if there are any expenses
    if (sortedExpenses.length === 0) {
        noExpensesMessage.style.display = 'block';
        expenseCardsContainer.style.display = 'none';
    } else {
        noExpensesMessage.style.display = 'none';
        expenseCardsContainer.style.display = 'grid';
        
        // Render each expense as a card
        sortedExpenses.forEach(expense => {
            const card = document.createElement('div');
            card.className = `expense-card ${expense.category}`;
            
            card.innerHTML = `
                <div class="expense-card-header">
                    <span class="expense-card-date">${formatDate(expense.date)}</span>
                    <span class="expense-card-amount">${formatCurrency(expense.amount)}</span>
                </div>
                <div class="expense-card-description">${expense.description}</div>
                <span class="expense-card-category ${expense.category}">${expense.category}</span>
                <div class="expense-card-actions">
                    <button class="expense-card-btn edit" data-id="${expense.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="expense-card-btn delete" data-id="${expense.id}">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            `;
            
            expenseCardsContainer.appendChild(card);
            
            // Add event listeners after the card is added to the DOM
            const editBtn = card.querySelector('.expense-card-btn.edit');
            const deleteBtn = card.querySelector('.expense-card-btn.delete');
            
            // Add both click and touch events for better mobile support
            editBtn.addEventListener('click', function() {
                editExpense(expense.id);
            });
            
            deleteBtn.addEventListener('click', function() {
                deleteExpense(expense.id);
            });
        });
    }
    
    // Update summary
    totalAmountElement.textContent = formatCurrency(calculateTotal());
    expenseCountElement.textContent = expenses.length;
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Make functions available globally
window.editExpense = editExpense;
window.deleteExpense = deleteExpense; 