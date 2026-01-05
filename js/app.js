// Enhanced App JavaScript for Logistics Portal with Rich Text Notepad

// DOM Elements
const notepadEditors = [];
const saveNoteBtn = document.getElementById('saveNote');
const clearNoteBtn = document.getElementById('clearNote');
const newPageBtn = document.getElementById('newPage');
const pageTabs = document.getElementById('pageTabs');
const pageCount = document.getElementById('pageCount');
const charCount = document.getElementById('charCount');
const saveStatus = document.getElementById('saveStatus');
const currentDate = document.getElementById('currentDate');
const currentTime = document.getElementById('currentTime');
const currentYear = document.getElementById('currentYear');
const menuToggle = document.getElementById('menuToggle');
const fontSizeSelect = document.getElementById('fontSize');
const textColor = document.getElementById('textColor');
const highlightColor = document.getElementById('highlightColor');

// Time offset: Philippines to US (EST) is -12 hours
const TIME_OFFSET_HOURS = -12;

// Notepad state
let notepadState = {
    currentPage: 1,
    pages: {},
    totalPages: 1,
    autoSave: true
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set current date and time
    updateDateTime();
    
    // Update time every second
    setInterval(updateDateTime, 1000);
    
    // Set current year in footer
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
    
    // Initialize enhanced notepad
    initializeEnhancedNotepad();
    
    // Load saved notes from localStorage
    loadSavedNotes();
    
    // Add event listeners
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', saveAllNotes);
    }
    
    if (clearNoteBtn) {
        clearNoteBtn.addEventListener('click', clearCurrentPage);
    }
    
    if (newPageBtn) {
        newPageBtn.addEventListener('click', createNewPage);
    }
    
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', changeFontSize);
    }
    
    if (textColor) {
        textColor.addEventListener('change', changeTextColor);
    }
    
    if (highlightColor) {
        highlightColor.addEventListener('change', changeHighlightColor);
    }
    
    // Initialize toolbar buttons
    initializeToolbar();
    
    // Auto-save note every 30 seconds
    setInterval(autoSaveNotes, 30000);
    
    // Initialize stats animation
    initializeStats();
    
    // Add click handlers to stat cards
    setupStatCardClicks();
    
    // Initialize page renaming
    initializePageRenaming();
});

function initializeEnhancedNotepad() {
    // Store reference to first editor
    const firstEditor = document.getElementById('notepadEditor1');
    if (firstEditor) {
        notepadEditors[1] = firstEditor;
        
        // Add input event listener
        firstEditor.addEventListener('input', function() {
            updateCharCount();
            if (notepadState.autoSave) {
                autoSaveNotes();
            }
        });
        
        // Store initial content
        notepadState.pages[1] = {
            id: 1,
            name: 'Page 1',
            content: firstEditor.innerHTML
        };
    }
    
    // Add click event for the default page 1 tab
    const page1Tab = document.querySelector('.page-tab[data-page="1"]');
    if (page1Tab) {
        page1Tab.addEventListener('click', function(e) {
            if (!e.target.classList.contains('delete-page') && 
                !e.target.classList.contains('edit-page') &&
                !e.target.classList.contains('tab-name')) {
                switchToPage(1);
            }
        });
        
        // Add click event for tab name too
        const tabName = page1Tab.querySelector('.tab-name');
        tabName.addEventListener('click', function(e) {
            e.stopPropagation();
            switchToPage(1);
        });
        
        // Add edit button to the first tab
        addEditButtonToTab(page1Tab);
    }
    
    // Update page count display
    updatePageCount();
}

// Create new page
// Create new page
function createNewPage() {
    notepadState.totalPages++;
    const newPageId = notepadState.totalPages;
    
    // Create page tab
    const pageTab = document.createElement('div');
    pageTab.className = 'page-tab';
    pageTab.dataset.page = newPageId;
    pageTab.innerHTML = `
        <span class="tab-name">Page ${newPageId}</span>
        <button class="delete-page" data-page="${newPageId}" title="Delete Page">×</button>
    `;
    
    // Add click event for switching pages
    pageTab.addEventListener('click', function(e) {
        if (!e.target.classList.contains('delete-page') && 
            !e.target.classList.contains('edit-page') &&
            !e.target.classList.contains('tab-name')) {
            switchToPage(newPageId);
        }
    });
    
    // Add click event for tab name too (in case click is on the text)
    const tabName = pageTab.querySelector('.tab-name');
    tabName.addEventListener('click', function(e) {
        e.stopPropagation();
        switchToPage(newPageId);
    });
    
    // Add edit button
    addEditButtonToTab(pageTab);
    
    // Add delete button event
    const deleteBtn = pageTab.querySelector('.delete-page');
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        deletePage(newPageId);
    });
    
    pageTabs.appendChild(pageTab);
    
    // Create page content
    const notepadContent = document.querySelector('.notepad-content');
    const newPage = document.createElement('div');
    newPage.className = 'notepad-page';
    newPage.id = `page${newPageId}`;
    
    const newEditor = document.createElement('div');
    newEditor.className = 'notepad-editor';
    newEditor.id = `notepadEditor${newPageId}`;
    newEditor.contentEditable = true;
    newEditor.innerHTML = '<p>New page content. Start typing here...</p>';
    
    // Make it scrollable
    newEditor.style.maxHeight = '400px';
    newEditor.style.overflowY = 'auto';
    
    newPage.appendChild(newEditor);
    notepadContent.appendChild(newPage);
    
    // Store reference
    notepadEditors[newPageId] = newEditor;
    
    // Add event listener
    newEditor.addEventListener('input', function() {
        updateCharCount();
        if (notepadState.autoSave) {
            autoSaveNotes();
        }
    });
    
    // Store in state
    notepadState.pages[newPageId] = {
        id: newPageId,
        name: `Page ${newPageId}`,
        content: newEditor.innerHTML
    };
    
    // Switch to new page
    switchToPage(newPageId);
    
    // Update page count
    updatePageCount();
    
    // Show notification
    showNotification(`Page ${newPageId} created`, 'success');
}

// Switch to page
function switchToPage(pageId) {
    // Update active tab
    document.querySelectorAll('.page-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`.page-tab[data-page="${pageId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Update active page
    document.querySelectorAll('.notepad-page').forEach(page => {
        page.classList.remove('active');
    });
    
    const activePage = document.getElementById(`page${pageId}`);
    if (activePage) {
        activePage.classList.add('active');
    }
    
    // Update current page in state
    notepadState.currentPage = pageId;
    
    // Update character count
    updateCharCount();
}

// Delete page
function deletePage(pageId) {
    if (notepadState.totalPages <= 1) {
        showNotification('Cannot delete the last page', 'error');
        return;
    }
    
    if (confirm(`Delete Page ${pageId}? This action cannot be undone.`)) {
        // Remove from DOM
        const pageTab = document.querySelector(`.page-tab[data-page="${pageId}"]`);
        const pageElement = document.getElementById(`page${pageId}`);
        
        if (pageTab) pageTab.remove();
        if (pageElement) pageElement.remove();
        
        // Remove from state
        delete notepadState.pages[pageId];
        delete notepadEditors[pageId];
        
        // Update total pages
        notepadState.totalPages--;
        
        // Switch to first available page
        const firstPageId = Object.keys(notepadState.pages)[0];
        if (firstPageId) {
            switchToPage(parseInt(firstPageId));
        }
        
        // Update page count
        updatePageCount();
        
        // Save changes
        saveAllNotes();
        
        showNotification(`Page ${pageId} deleted`, 'info');
    }
}

// Update page count display
function updatePageCount() {
    if (pageCount) {
        pageCount.textContent = notepadState.totalPages;
    }
}

// Update character count
function updateCharCount() {
    if (charCount) {
        let totalChars = 0;
        
        // Count characters from all pages
        Object.values(notepadEditors).forEach(editor => {
            if (editor) {
                // Remove HTML tags and count characters
                const text = editor.innerText || editor.textContent;
                totalChars += text.length;
            }
        });
        
        charCount.textContent = totalChars;
    }
}

// Initialize toolbar buttons
function initializeToolbar() {
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');
    
    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const command = this.dataset.command;
            execFormatCommand(command);
            
            // Toggle active state for formatting buttons
            if (['bold', 'italic', 'underline'].includes(command)) {
                this.classList.toggle('active');
            }
        });
    });
}

// Execute formatting command
function execFormatCommand(command) {
    document.execCommand(command, false, null);
    
    // Focus back to editor
    const currentEditor = notepadEditors[notepadState.currentPage];
    if (currentEditor) {
        currentEditor.focus();
    }
}

// Change font size
function changeFontSize() {
    const size = this.value;
    document.execCommand('fontSize', false, size);
    
    // Focus back to editor
    const currentEditor = notepadEditors[notepadState.currentPage];
    if (currentEditor) {
        currentEditor.focus();
    }
}

// Change text color
function changeTextColor() {
    const color = this.value;
    document.execCommand('foreColor', false, color);
    
    // Focus back to editor
    const currentEditor = notepadEditors[notepadState.currentPage];
    if (currentEditor) {
        currentEditor.focus();
    }
}

// Change highlight color
function changeHighlightColor() {
    const color = this.value;
    document.execCommand('hiliteColor', false, color);
    
    // Focus back to editor
    const currentEditor = notepadEditors[notepadState.currentPage];
    if (currentEditor) {
        currentEditor.focus();
    }
}

// Save all notes
function saveAllNotes() {
    // Update content in state
    Object.keys(notepadEditors).forEach(pageId => {
        const editor = notepadEditors[pageId];
        if (editor && notepadState.pages[pageId]) {
            notepadState.pages[pageId].content = editor.innerHTML;
        }
    });
    
    // Save to localStorage
    localStorage.setItem('logisticsNotepadEnhanced', JSON.stringify({
        pages: notepadState.pages,
        totalPages: notepadState.totalPages,
        currentPage: notepadState.currentPage
    }));
    
    // Update timestamp
    localStorage.setItem('logisticsNotepadTimestamp', new Date().toISOString());
    
    // Update save status
    if (saveStatus) {
        saveStatus.textContent = 'Last saved: ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
}

// Auto-save notes
function autoSaveNotes() {
    if (notepadState.autoSave) {
        saveAllNotes();
    }
}

// Load saved notes
function loadSavedNotes() {
    const savedData = localStorage.getItem('logisticsNotepadEnhanced');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            // Clear existing pages except first one
            const existingTabs = document.querySelectorAll('.page-tab:not(:first-child)');
            existingTabs.forEach(tab => tab.remove());
            
            const existingPages = document.querySelectorAll('.notepad-page:not(:first-child)');
            existingPages.forEach(page => page.remove());
            
            // Reset state
            notepadState.pages = {};
            notepadState.totalPages = 0;
            
            // Load pages from saved data
            Object.values(data.pages).forEach(pageData => {
                if (pageData.id === 1) {
                    // Update first page
                    const firstEditor = document.getElementById('notepadEditor1');
                    if (firstEditor && pageData.content) {
                        firstEditor.innerHTML = pageData.content;
                        notepadState.pages[1] = pageData;
                        notepadEditors[1] = firstEditor;
                    }
                } else {
                    // Create page for saved data
                    notepadState.totalPages = Math.max(notepadState.totalPages, pageData.id);
                    
                    // Create page tab
                    const pageTab = document.createElement('div');
                    pageTab.className = 'page-tab';
                    pageTab.dataset.page = pageData.id;
                    pageTab.innerHTML = `
                        <span class="tab-name">${pageData.name || `Page ${pageData.id}`}</span>
                        <button class="delete-page" data-page="${pageData.id}" title="Delete Page">×</button>
                    `;
                    
                    pageTab.addEventListener('click', function(e) {
                        if (!e.target.classList.contains('delete-page') && 
                            !e.target.classList.contains('edit-page')) {
                            switchToPage(pageData.id);
                        }
                    });
                    
                    // Add edit button
                    addEditButtonToTab(pageTab);
                    
                    const deleteBtn = pageTab.querySelector('.delete-page');
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        deletePage(pageData.id);
                    });
                    
                    pageTabs.appendChild(pageTab);
                    
                    // Create page content
                    const notepadContent = document.querySelector('.notepad-content');
                    const newPage = document.createElement('div');
                    newPage.className = 'notepad-page';
                    newPage.id = `page${pageData.id}`;
                    
                    const newEditor = document.createElement('div');
                    newEditor.className = 'notepad-editor';
                    newEditor.id = `notepadEditor${pageData.id}`;
                    newEditor.contentEditable = true;
                    newEditor.innerHTML = pageData.content || '<p>Page content</p>';
                    
                    // Make scrollable
                    newEditor.style.maxHeight = '400px';
                    newEditor.style.overflowY = 'auto';
                    
                    newPage.appendChild(newEditor);
                    notepadContent.appendChild(newPage);
                    
                    // Store reference
                    notepadEditors[pageData.id] = newEditor;
                    
                    // Add event listener
                    newEditor.addEventListener('input', function() {
                        updateCharCount();
                        if (notepadState.autoSave) {
                            autoSaveNotes();
                        }
                    });
                    
                    // Store in state
                    notepadState.pages[pageData.id] = pageData;
                }
            });
            
            // Update total pages
            notepadState.totalPages = data.totalPages || Object.keys(notepadState.pages).length;
            
            // Switch to saved current page
            if (data.currentPage && notepadState.pages[data.currentPage]) {
                switchToPage(data.currentPage);
            } else {
                // Switch to first page
                const firstPageId = Object.keys(notepadState.pages)[0];
                if (firstPageId) {
                    switchToPage(parseInt(firstPageId));
                }
            }
            
            // Update displays
            updatePageCount();
            updateCharCount();
            
            // Initialize renaming for all loaded tabs
            initializePageRenaming();
            
            // Show notification
            const timestamp = localStorage.getItem('logisticsNotepadTimestamp');
            if (timestamp) {
                const savedTime = new Date(timestamp).toLocaleTimeString();
                console.log(`Notes loaded from ${savedTime}`);
            }
            
        } catch (error) {
            console.error('Error loading saved notes:', error);
        }
    }
}

// Clear current page
function clearCurrentPage() {
    const currentEditor = notepadEditors[notepadState.currentPage];
    if (currentEditor && confirm('Clear current page? This action cannot be undone.')) {
        currentEditor.innerHTML = '<p></p>';
        updateCharCount();
        showNotification('Page cleared', 'info');
        autoSaveNotes();
    }
}

// Initialize page renaming
function initializePageRenaming() {
    // Add edit buttons to all existing page tabs
    document.querySelectorAll('.page-tab').forEach(tab => {
        addEditButtonToTab(tab);
    });
}

// Add edit button to a page tab
function addEditButtonToTab(tab) {
    const pageId = tab.dataset.page;
    
    // Create edit button if it doesn't exist
    if (!tab.querySelector('.edit-page')) {
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-page';
        editBtn.innerHTML = '✎';
        editBtn.title = 'Rename Page';
        editBtn.dataset.page = pageId;
        
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            renamePage(pageId);
        });
        
        // Insert edit button before delete button
        const deleteBtn = tab.querySelector('.delete-page');
        if (deleteBtn) {
            tab.insertBefore(editBtn, deleteBtn);
        } else {
            tab.appendChild(editBtn);
        }
    }
}

// Rename a page
function renamePage(pageId) {
    const pageTab = document.querySelector(`.page-tab[data-page="${pageId}"]`);
    if (!pageTab) return;
    
    const currentName = notepadState.pages[pageId]?.name || `Page ${pageId}`;
    
    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.maxLength = 20;
    
    // Add editing class to tab
    pageTab.classList.add('editing');
    
    // Replace tab content with input
    const tabName = pageTab.querySelector('.tab-name');
    if (tabName) {
        tabName.style.display = 'none';
    }
    
    pageTab.appendChild(input);
    input.focus();
    input.select();
    
    // Handle input completion
    const handleRename = () => {
        const newName = input.value.trim() || `Page ${pageId}`;
        
        // Update tab display
        if (tabName) {
            tabName.textContent = newName;
            tabName.style.display = 'block';
        }
        
        // Remove input
        input.remove();
        pageTab.classList.remove('editing');
        
        // Update state
        if (notepadState.pages[pageId]) {
            notepadState.pages[pageId].name = newName;
            saveAllNotes();
        }
        
        showNotification(`Page renamed to "${newName}"`, 'success');
    };
    
    // Handle Enter key
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleRename();
        }
    });
    
    // Handle blur (click outside)
    input.addEventListener('blur', handleRename);
    
    // Stop propagation to prevent page switching
    input.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// Update US time (12 hours behind Philippines)
function updateDateTime() {
    const now = new Date();
    
    // Calculate US time: 12 hours behind Philippines
    const usTime = new Date(now.getTime() + (TIME_OFFSET_HOURS * 60 * 60 * 1000));
    // Build date and time strings including seconds: "Tue Jan 6 • 09:23:45 AM EST"
    const weekday = usTime.toLocaleString('en-US', { weekday: 'short' });
    const month = usTime.toLocaleString('en-US', { month: 'short' });
    const day = usTime.getDate();
    const timeStringWithSeconds = usTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    // Merge into a compact single-line string and display in the `currentDate` element
    const combined = `${weekday} ${month} ${day} • ${timeStringWithSeconds} EST`;

    if (currentDate) {
        currentDate.textContent = combined;
    }

    // If a separate `currentTime` element exists (kept for backward compatibility), keep it empty
    if (currentTime) {
        currentTime.textContent = '';
    }
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        
        // Create overlay for mobile
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', function() {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
        
        overlay.classList.toggle('active');
    }
}

// Setup click handlers for stat cards
function setupStatCardClicks() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add a visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
}

function setupPageTabClick(tab, pageId) {
    // Add click event for switching pages
    tab.addEventListener('click', function(e) {
        if (!e.target.classList.contains('delete-page') && 
            !e.target.classList.contains('edit-page') &&
            !e.target.classList.contains('tab-name')) {
            switchToPage(pageId);
        }
    });
    
    // Add click event for tab name too (in case click is on the text)
    const tabName = tab.querySelector('.tab-name');
    if (tabName) {
        tabName.addEventListener('click', function(e) {
            e.stopPropagation();
            switchToPage(pageId);
        });
    }
}

// Show notification message
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <p>${message}</p>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#8a2be2'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add close button styles
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: 15px;
    `;
    
    // Add close functionality
    closeBtn.addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Initialize stats animation
function initializeStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const finalValue = parseInt(stat.textContent);
        const duration = 1000;
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            stat.textContent = Math.floor(progress * finalValue);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    });
    
    // Update stats periodically to simulate live data
    setInterval(updateStats, 60000);
}

// Update stats with random values
function updateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const currentValue = parseInt(stat.textContent);
        const randomChange = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const newValue = Math.max(0, currentValue + randomChange);
        
        // Animate the number change
        animateValue(stat, currentValue, newValue, 1000);
    });
}

// Animate number change
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Export functionality (optional)
function exportAsText() {
    let textContent = '';
    
    Object.keys(notepadEditors).forEach(pageId => {
        const editor = notepadEditors[pageId];
        if (editor) {
            const pageName = notepadState.pages[pageId]?.name || `Page ${pageId}`;
            textContent += `=== ${pageName} ===\n`;
            textContent += editor.innerText + '\n\n';
        }
    });
    
    downloadFile(textContent, 'notepad-export.txt', 'text/plain');
}

function exportAsHTML() {
    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Notepad Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .page { margin-bottom: 40px; border-bottom: 2px solid #8a2be2; padding-bottom: 20px; }
        .page-header { color: #8a2be2; font-weight: bold; margin-bottom: 10px; }
        .page-content { line-height: 1.6; }
    </style>
</head>
<body>
    <h1>Notepad Export</h1>
    <p>Exported on: ${new Date().toLocaleString()}</p>
`;
    
    Object.keys(notepadEditors).forEach(pageId => {
        const editor = notepadEditors[pageId];
        if (editor) {
            const pageName = notepadState.pages[pageId]?.name || `Page ${pageId}`;
            htmlContent += `
    <div class="page">
        <div class="page-header">${pageName}</div>
        <div class="page-content">${editor.innerHTML}</div>
    </div>
`;
        }
    });
    
    htmlContent += '</body></html>';
    
    downloadFile(htmlContent, 'notepad-export.html', 'text/html');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`Exported as ${filename}`, 'success');
}