document.addEventListener('DOMContentLoaded', function() {
    // Initialize copy functionality for all spiel items
    initializeExcelCopy();
    
    // Initialize tab switching
    initializeExcelTabs();
    
    // Initialize favorites functionality
    initializeFavorites();
    
    // Load quick copy history
    loadQuickCopy();
    
    // Load favorites from localStorage
    loadFavorites();
});

// Initialize copy functionality
function initializeExcelCopy() {
    const spielItems = document.querySelectorAll('.excel-compact-item');
    
    spielItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons
            if (e.target.classList.contains('favorite-btn') || 
                e.target.closest('.favorite-btn') ||
                e.target.classList.contains('fa-star') ||
                e.target.classList.contains('fa-copy') ||
                e.target.closest('.copy-indicator')) {
                return;
            }
            
            copySpielToClipboard(this);
        });
        
        // Add hover effect for copy indicator
        item.addEventListener('mouseenter', function() {
            const copyIcon = this.querySelector('.copy-indicator i');
            if (copyIcon) {
                copyIcon.classList.remove('far');
                copyIcon.classList.add('fas');
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const copyIcon = this.querySelector('.copy-indicator i');
            if (copyIcon && !this.classList.contains('copied')) {
                copyIcon.classList.remove('fas');
                copyIcon.classList.add('far');
            }
        });
    });
}

// Copy spiel to clipboard
function copySpielToClipboard(spielItem) {
    const spielText = spielItem.dataset.spiel;
    const category = spielItem.dataset.category || 'general';
    
    // Use the Clipboard API
    navigator.clipboard.writeText(spielText)
        .then(() => {
            // Success - show visual feedback
            showCopySuccess(spielItem);
            
            // Add to quick copy history
            addToQuickCopy(spielText, category);
            
            // Show notification
            showCopyNotification('Copied to clipboard!', spielText);
        })
        .catch(err => {
            // Fallback for older browsers
            console.error('Clipboard API failed:', err);
            useFallbackCopy(spielItem, spielText, category);
        });
}

// Show copy success animation
function showCopySuccess(spielItem) {
    // Add copied class for visual feedback
    spielItem.classList.add('copied');
    
    // Update copy icon
    const copyIcon = spielItem.querySelector('.copy-indicator i');
    if (copyIcon) {
        copyIcon.classList.remove('far', 'fa-copy');
        copyIcon.classList.add('fas', 'fa-check');
    }
    
    // Remove copied class after 1.5 seconds
    setTimeout(() => {
        spielItem.classList.remove('copied');
        if (copyIcon) {
            copyIcon.classList.remove('fas', 'fa-check');
            copyIcon.classList.add('far', 'fa-copy');
        }
    }, 1500);
}

// Fallback copy method for older browsers
function useFallbackCopy(spielItem, spielText, category) {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = spielText;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        // Try to execute the copy command
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(spielItem);
            addToQuickCopy(spielText, category);
            showCopyNotification('Copied to clipboard!', spielText);
        } else {
            throw new Error('Copy command failed');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showCopyNotification('Failed to copy. Please select and copy manually.', spielText, 'error');
    } finally {
        // Clean up
        document.body.removeChild(textArea);
    }
}

// Add to quick copy history - MAX 5 ITEMS
function addToQuickCopy(spielText, category) {
    // Get existing quick copy items
    let quickCopy = JSON.parse(localStorage.getItem('excelQuickCopy') || '[]');
    
    // Remove if already exists (to avoid duplicates)
    quickCopy = quickCopy.filter(item => item.text !== spielText);
    
    // Add new item at beginning
    quickCopy.unshift({
        text: spielText,
        category: category,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 5 items (reduced from 10)
    if (quickCopy.length > 5) {
        quickCopy = quickCopy.slice(0, 5);
    }
    
    // Save to localStorage
    localStorage.setItem('excelQuickCopy', JSON.stringify(quickCopy));
    
    // Update display
    updateQuickCopyDisplay();
}

// Load quick copy history
function loadQuickCopy() {
    updateQuickCopyDisplay();
}

// Update quick copy display
function updateQuickCopyDisplay() {
    const quickCopyContainer = document.getElementById('quickCopyItems');
    if (!quickCopyContainer) return;
    
    const quickCopy = JSON.parse(localStorage.getItem('excelQuickCopy') || '[]');
    
    if (quickCopy.length === 0) {
        quickCopyContainer.innerHTML = `
            <div class="empty-quick-copy">
                <i class="far fa-clipboard"></i>
                <p>No recent copies. Click any spiel to start!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    quickCopy.forEach((item, index) => {
        // Truncate long text - shorter for compact view
        const displayText = item.text.length > 45 ? item.text.substring(0, 42) + '...' : item.text;
        
        html += `
            <div class="quick-copy-item" data-spiel="${item.text.replace(/"/g, '&quot;')}" title="${item.text}">
                <i class="fas fa-history"></i>
                <span>${displayText}</span>
            </div>
        `;
    });
    
    quickCopyContainer.innerHTML = html;
    
    // Add click events to quick copy items
    document.querySelectorAll('.quick-copy-item').forEach(item => {
        item.addEventListener('click', function() {
            const spielText = this.dataset.spiel;
            navigator.clipboard.writeText(spielText)
                .then(() => {
                    showCopyNotification('Copied from recent!', spielText);
                    // Visual feedback
                    this.style.backgroundColor = '#e6f7f0';
                    setTimeout(() => {
                        this.style.backgroundColor = '';
                    }, 800);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                });
        });
    });
}

// Clear quick copy history
function clearQuickCopy() {
    if (confirm('Clear all recent copies?')) {
        localStorage.removeItem('excelQuickCopy');
        updateQuickCopyDisplay();
        showCopyNotification('Recent copies cleared', '', 'info');
    }
}

// Initialize favorites functionality
function initializeFavorites() {
    // Add click events to all favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFavorite(this);
        });
    });
}

// Toggle favorite status
function toggleFavorite(favoriteBtn) {
    const spielItem = favoriteBtn.closest('.excel-compact-item');
    const spielText = spielItem.dataset.spiel;
    const category = spielItem.dataset.category || 'general';
    
    // Get current favorites
    let favorites = JSON.parse(localStorage.getItem('excelFavorites') || '[]');
    
    // Check if already favorited
    const existingIndex = favorites.findIndex(fav => fav.text === spielText);
    
    if (existingIndex > -1) {
        // Remove from favorites
        favorites.splice(existingIndex, 1);
        favoriteBtn.classList.remove('favorited');
        favoriteBtn.innerHTML = '<i class="far fa-star"></i>';
        favoriteBtn.title = 'Add to favorites';
        showCopyNotification('Removed from favorites', spielText.substring(0, 40) + '...', 'info');
    } else {
        // Add to favorites
        favorites.push({
            text: spielText,
            category: category,
            timestamp: new Date().toISOString()
        });
        favoriteBtn.classList.add('favorited');
        favoriteBtn.innerHTML = '<i class="fas fa-star"></i>';
        favoriteBtn.title = 'Remove from favorites';
        showCopyNotification('Added to favorites!', spielText.substring(0, 40) + '...');
    }
    
    // Save to localStorage
    localStorage.setItem('excelFavorites', JSON.stringify(favorites));
    
    // Update favorites display if on favorites tab
    if (document.querySelector('#favorites-content').classList.contains('active')) {
        loadFavorites();
    }
}

// Load favorites from localStorage
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('excelFavorites') || '[]');
    const favoritesContainer = document.getElementById('favoritesGrid');
    const emptyFavorites = document.getElementById('emptyFavorites');
    
    if (!favoritesContainer || !emptyFavorites) return;
    
    // Clear existing content except empty state
    const existingItems = favoritesContainer.querySelectorAll('.excel-compact-category');
    existingItems.forEach(item => {
        if (!item.contains(emptyFavorites)) {
            item.remove();
        }
    });
    
    if (favorites.length === 0) {
        emptyFavorites.style.display = 'flex';
        return;
    }
    
    emptyFavorites.style.display = 'none';
    
    // Group favorites by category
    const favoritesByCategory = {};
    favorites.forEach(fav => {
        if (!favoritesByCategory[fav.category]) {
            favoritesByCategory[fav.category] = [];
        }
        favoritesByCategory[fav.category].push(fav);
    });
    
    // Create category cards for favorites
    Object.keys(favoritesByCategory).forEach(category => {
        const categoryItems = favoritesByCategory[category];
        
        // Create category card
        const categoryCard = document.createElement('div');
        categoryCard.className = 'excel-compact-category';
        
        // Get category display name and icon
        const categoryInfo = getCategoryInfo(category);
        
        categoryCard.innerHTML = `
            <div class="excel-compact-header">
                <div>
                    <i class="${categoryInfo.icon}"></i> ${categoryInfo.name}
                    <span class="spiel-count">${categoryItems.length}</span>
                </div>
            </div>
            <div class="excel-compact-items">
        `;
        
        // Add each favorite spiel
        categoryItems.forEach((favItem, index) => {
            const itemsContainer = categoryCard.querySelector('.excel-compact-items');
            const itemDiv = document.createElement('div');
            itemDiv.className = 'excel-compact-item';
            itemDiv.dataset.spiel = favItem.text;
            itemDiv.dataset.category = favItem.category;
            
            itemDiv.innerHTML = `
                <div class="excel-compact-text">${favItem.text}</div>
                <div class="excel-compact-icons">
                    <div class="copy-indicator"><i class="far fa-copy"></i></div>
                    <button class="favorite-btn favorited" title="Remove from favorites"><i class="fas fa-star"></i></button>
                </div>
            `;
            
            itemsContainer.appendChild(itemDiv);
            
            // Add click event for copying
            itemDiv.addEventListener('click', function(e) {
                if (!e.target.classList.contains('favorite-btn') && 
                    !e.target.closest('.favorite-btn')) {
                    copySpielToClipboard(this);
                }
            });
            
            // Add favorite button event
            const favBtn = itemDiv.querySelector('.favorite-btn');
            favBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleFavorite(this);
            });
        });
        
        // Insert before empty state
        favoritesContainer.insertBefore(categoryCard, emptyFavorites);
    });
    
    // Update favorite buttons on main grid
    updateFavoriteButtons();
}

// Get category display info
function getCategoryInfo(category) {
    const categoryMap = {
        'inconvenience': { name: 'INCONVENIENCE', icon: 'fas fa-exclamation-circle' },
        'delay': { name: 'DELAY', icon: 'fas fa-clock' },
        'not-accommodate': { name: 'NOT ACCOMMODATE', icon: 'fas fa-user-times' },
        'confusion': { name: 'CONFUSION', icon: 'fas fa-question-circle' },
        'delay-inconvenience': { name: 'DELAY + INCONVENIENCE', icon: 'fas fa-clock' },
        'delay-not-accommodate': { name: 'DELAY + NOT ACCOMMODATE', icon: 'fas fa-clock' },
        'delay-incon-accomm': { name: 'DELAY + INCON + ACCOMM', icon: 'fas fa-clock' },
        'closing': { name: 'CLOSING', icon: 'fas fa-check-circle' }
    };
    
    return categoryMap[category] || { name: category.toUpperCase(), icon: 'fas fa-star' };
}

// Update favorite buttons on main grid
function updateFavoriteButtons() {
    const favorites = JSON.parse(localStorage.getItem('excelFavorites') || '[]');
    const favoriteTexts = favorites.map(fav => fav.text);
    
    document.querySelectorAll('.excel-compact-item').forEach(item => {
        const spielText = item.dataset.spiel;
        const favoriteBtn = item.querySelector('.favorite-btn');
        
        if (favoriteBtn) {
            if (favoriteTexts.includes(spielText)) {
                favoriteBtn.classList.add('favorited');
                favoriteBtn.innerHTML = '<i class="fas fa-star"></i>';
                favoriteBtn.title = 'Remove from favorites';
            } else {
                favoriteBtn.classList.remove('favorited');
                favoriteBtn.innerHTML = '<i class="far fa-star"></i>';
                favoriteBtn.title = 'Add to favorites';
            }
        }
    });
}

// Export favorites
function exportFavorites() {
    const favorites = JSON.parse(localStorage.getItem('excelFavorites') || '[]');
    
    if (favorites.length === 0) {
        showCopyNotification('No favorites to export', '', 'info');
        return;
    }
    
    let exportText = 'FAVORITE SPIELS\n';
    exportText += 'Exported on: ' + new Date().toLocaleString() + '\n\n';
    
    favorites.forEach((fav, index) => {
        exportText += `${index + 1}. ${fav.text}\n\n`;
    });
    
    // Create download
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favorite-spiels.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showCopyNotification(`Exported ${favorites.length} favorites`, '', 'success');
}

// Show copy notification
function showCopyNotification(message, spielText = '', type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `excel-notification notification-${type}`;
    
    let notificationHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            </div>
            <div class="notification-text">
                <p class="notification-message">${message}</p>
    `;
    
    // Add preview if spiel text is short enough
    if (spielText && spielText.length < 80) {
        notificationHTML += `<p class="notification-preview">"${spielText}"</p>`;
    }
    
    notificationHTML += `
            </div>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    notification.innerHTML = notificationHTML;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 15px;
        right: 15px;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#8a2be2'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 300px;
        animation: slideUp 0.3s ease;
        font-size: 0.8rem;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Auto-remove after 3.5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 3500);
}

// Initialize tab switching
function initializeExcelTabs() {
    const tabs = document.querySelectorAll('.excel-tab');
    const contents = document.querySelectorAll('.excel-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-content`) {
                    content.classList.add('active');
                    
                    // If favorites tab, load favorites
                    if (tabId === 'favorites') {
                        loadFavorites();
                    }
                }
            });
        });
    });
}