/**
 * Expense Tracker Application
 * by Pooja Gurjar
 * 
 * JavaScript file for the analytics page
 */

// DOM Elements
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
const timePeriod = document.getElementById('time-period');
const analyticsTotal = document.getElementById('analytics-total');
const analyticsAverageDaily = document.getElementById('analytics-average-daily');
const analyticsHighestCategory = document.getElementById('analytics-highest-category');
const analyticsHighestExpense = document.getElementById('analytics-highest-expense');
const noDataMessage = document.getElementById('no-data-message');
const chartsContainer = document.querySelector('.charts-container');

// Chart instances
let categoryChart = null;
let monthlyChart = null;
let trendChart = null;
let dailyChart = null;

// Global variables
let expenses = [];
let filteredExpenses = [];

// Chart colors
const chartColors = [
    '#4a6fa5', // Primary color
    '#ff9800', // Accent color
    '#28a745', // Success color
    '#dc3545', // Danger color
    '#ffc107', // Warning color
    '#17a2b8', // Info color
    '#6c757d', // Secondary color
    '#6f42c1', // Purple
    '#fd7e14', // Orange
    '#20c997', // Teal
    '#e83e8c', // Pink
    '#6610f2'  // Indigo
];

// Initialize the application
function init() {
    // Load expenses from localStorage
    loadExpenses();
    
    // Check if there are any expenses
    if (expenses.length === 0) {
        showNoDataMessage();
    } else {
        hideNoDataMessage();
        
        // Filter expenses based on selected time period
        filterExpensesByTimePeriod();
        
        // Update analytics summary
        updateAnalyticsSummary();
        
        // Initialize charts
        initializeCharts();
    }
    
    // Add event listeners
    timePeriod.addEventListener('change', handleTimePeriodChange);
    
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

// Show no data message
function showNoDataMessage() {
    noDataMessage.style.display = 'block';
    chartsContainer.style.display = 'none';
}

// Hide no data message
function hideNoDataMessage() {
    noDataMessage.style.display = 'none';
    chartsContainer.style.display = 'grid';
}

// Handle time period change
function handleTimePeriodChange() {
    // Filter expenses based on selected time period
    filterExpensesByTimePeriod();
    
    // Update analytics summary
    updateAnalyticsSummary();
    
    // Update charts
    updateCharts();
}

// Filter expenses by time period
function filterExpensesByTimePeriod() {
    const selectedPeriod = timePeriod.value;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (selectedPeriod) {
        case 'month':
            // This month
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            filteredExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= startOfMonth && expenseDate <= now;
            });
            break;
        case 'quarter':
            // Last 3 months
            const threeMonthsAgo = new Date(now);
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            filteredExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= threeMonthsAgo && expenseDate <= now;
            });
            break;
        case 'year':
            // This year
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            filteredExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= startOfYear && expenseDate <= now;
            });
            break;
        default:
            // All time
            filteredExpenses = [...expenses];
    }
}

// Format currency
function formatCurrency(amount) {
    return '₹' + amount.toFixed(2);
}

// Calculate total amount
function calculateTotal(expenseArray) {
    return expenseArray.reduce((total, expense) => total + expense.amount, 0);
}

// Calculate average daily expense
function calculateAverageDaily(expenseArray) {
    if (expenseArray.length === 0) return 0;
    
    // Get unique dates
    const uniqueDates = new Set(expenseArray.map(expense => expense.date));
    
    // Calculate total
    const total = calculateTotal(expenseArray);
    
    // Return average per day
    return total / uniqueDates.size;
}

// Find highest category
function findHighestCategory(expenseArray) {
    if (expenseArray.length === 0) return 'N/A';
    
    // Group expenses by category
    const categoryTotals = {};
    
    expenseArray.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    // Find category with highest total
    let highestCategory = '';
    let highestAmount = 0;
    
    for (const category in categoryTotals) {
        if (categoryTotals[category] > highestAmount) {
            highestAmount = categoryTotals[category];
            highestCategory = category;
        }
    }
    
    return highestCategory;
}

// Find highest expense
function findHighestExpense(expenseArray) {
    if (expenseArray.length === 0) return 0;
    
    // Find expense with highest amount
    return Math.max(...expenseArray.map(expense => expense.amount));
}

// Update analytics summary
function updateAnalyticsSummary() {
    analyticsTotal.textContent = formatCurrency(calculateTotal(filteredExpenses));
    analyticsAverageDaily.textContent = formatCurrency(calculateAverageDaily(filteredExpenses));
    analyticsHighestCategory.textContent = findHighestCategory(filteredExpenses);
    analyticsHighestExpense.textContent = formatCurrency(findHighestExpense(filteredExpenses));
}

// Initialize charts
function initializeCharts() {
    initializeCategoryChart();
    initializeMonthlyChart();
    initializeTrendChart();
    initializeDailyChart();
}

// Update charts
function updateCharts() {
    updateCategoryChart();
    updateMonthlyChart();
    updateTrendChart();
    updateDailyChart();
}

// Initialize category chart
function initializeCategoryChart() {
    const ctx = document.getElementById('category-chart').getContext('2d');
    
    // Prepare data
    const categoryData = prepareCategoryData();
    
    // Create chart
    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categoryData.labels,
            datasets: [{
                data: categoryData.data,
                backgroundColor: chartColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Update category chart
function updateCategoryChart() {
    // Prepare data
    const categoryData = prepareCategoryData();
    
    // Update chart
    categoryChart.data.labels = categoryData.labels;
    categoryChart.data.datasets[0].data = categoryData.data;
    categoryChart.update();
}

// Prepare category data
function prepareCategoryData() {
    // Group expenses by category
    const categoryTotals = {};
    
    filteredExpenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    // Prepare data for chart
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    return { labels, data };
}

// Initialize monthly chart
function initializeMonthlyChart() {
    const ctx = document.getElementById('monthly-chart').getContext('2d');
    
    // Prepare data
    const monthlyData = prepareMonthlyData();
    
    // Create chart
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Monthly Expenses',
                data: monthlyData.data,
                backgroundColor: chartColors[0],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Total: ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

// Update monthly chart
function updateMonthlyChart() {
    // Prepare data
    const monthlyData = prepareMonthlyData();
    
    // Update chart
    monthlyChart.data.labels = monthlyData.labels;
    monthlyChart.data.datasets[0].data = monthlyData.data;
    monthlyChart.update();
}

// Prepare monthly data
function prepareMonthlyData() {
    // Group expenses by month
    const monthlyTotals = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    filteredExpenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        
        if (!monthlyTotals[monthYear]) {
            monthlyTotals[monthYear] = 0;
        }
        monthlyTotals[monthYear] += expense.amount;
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
        const aDate = new Date(a);
        const bDate = new Date(b);
        return aDate - bDate;
    });
    
    // Prepare data for chart
    const labels = sortedMonths;
    const data = sortedMonths.map(month => monthlyTotals[month]);
    
    return { labels, data };
}

// Initialize trend chart
function initializeTrendChart() {
    const ctx = document.getElementById('trend-chart').getContext('2d');
    
    // Prepare data
    const trendData = prepareTrendData();
    
    // Create chart
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: trendData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

// Update trend chart
function updateTrendChart() {
    // Prepare data
    const trendData = prepareTrendData();
    
    // Update chart
    trendChart.data.labels = trendData.labels;
    trendChart.data.datasets = trendData.datasets;
    trendChart.update();
}

// Prepare trend data
function prepareTrendData() {
    // Get top 5 categories
    const categoryTotals = {};
    
    filteredExpenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    const topCategories = Object.keys(categoryTotals)
        .sort((a, b) => categoryTotals[b] - categoryTotals[a])
        .slice(0, 5);
    
    // Group expenses by month and category
    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    filteredExpenses.forEach(expense => {
        if (!topCategories.includes(expense.category)) return;
        
        const date = new Date(expense.date);
        const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {};
            topCategories.forEach(category => {
                monthlyData[monthYear][category] = 0;
            });
        }
        
        monthlyData[monthYear][expense.category] += expense.amount;
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
        const aDate = new Date(a);
        const bDate = new Date(b);
        return aDate - bDate;
    });
    
    // Prepare datasets
    const datasets = topCategories.map((category, index) => {
        return {
            label: category,
            data: sortedMonths.map(month => monthlyData[month][category] || 0),
            borderColor: chartColors[index],
            backgroundColor: chartColors[index] + '33',
            fill: false,
            tension: 0.1
        };
    });
    
    return {
        labels: sortedMonths,
        datasets: datasets
    };
}

// Initialize daily chart
function initializeDailyChart() {
    const ctx = document.getElementById('daily-chart').getContext('2d');
    
    // Prepare data
    const dailyData = prepareDailyData();
    
    // Create chart
    dailyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dailyData.labels,
            datasets: [{
                label: 'Daily Expenses',
                data: dailyData.data,
                backgroundColor: chartColors[1],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Total: ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

// Update daily chart
function updateDailyChart() {
    // Prepare data
    const dailyData = prepareDailyData();
    
    // Update chart
    dailyChart.data.labels = dailyData.labels;
    dailyChart.data.datasets[0].data = dailyData.data;
    dailyChart.update();
}

// Prepare daily data
function prepareDailyData() {
    // Group expenses by day
    const dailyTotals = {};
    
    filteredExpenses.forEach(expense => {
        if (!dailyTotals[expense.date]) {
            dailyTotals[expense.date] = 0;
        }
        dailyTotals[expense.date] += expense.amount;
    });
    
    // Sort dates chronologically
    const sortedDates = Object.keys(dailyTotals).sort((a, b) => {
        return new Date(a) - new Date(b);
    });
    
    // Format dates for display
    const formattedDates = sortedDates.map(date => {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    });
    
    // Prepare data for chart
    const labels = formattedDates;
    const data = sortedDates.map(date => dailyTotals[date]);
    
    return { labels, data };
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 