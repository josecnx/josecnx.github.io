// Simple Navigation JavaScript for Logistics Portal

// Initialize navigation
document.addEventListener('DOMContentLoaded', function() {
    // Add click event listeners to all sidebar links
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // For mobile, close sidebar when a link is clicked
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
            
            // Highlight active link
            highlightCurrentPage();
        });
    });
    
    // Initialize mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // Highlight current page in sidebar
    highlightCurrentPage();
});

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
    
    // Create overlay for mobile
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', function() {
            closeSidebar();
        });
    }
    
    overlay.classList.toggle('active');
}

// Close sidebar on mobile
function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.remove('active');
    
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Highlight current page in sidebar
function highlightCurrentPage() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop();
    
    // Remove active class from all sidebar links
    const sidebarLinks = document.querySelectorAll('.sidebar-menu li');
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current page link
    const links = document.querySelectorAll('.sidebar-menu a');
    links.forEach(link => {
        const linkHref = link.getAttribute('href');
        const linkPage = linkHref.split('/').pop();
        
        // Check if this link points to the current page
        if (currentPage === linkPage || 
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === '' && linkPage === '../index.html')) {
            link.parentElement.classList.add('active');
        }
    });
}