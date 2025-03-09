/**
 * Expense Tracker Application
 * by Pooja Gurjar
 * 
 * Main JavaScript file for the home page
 */

// DOM Elements
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

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

// Event Listeners
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