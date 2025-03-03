// Utility function to toggle element visibility
const toggleElement = (element, show = null) => {
    if (show === null) {
        element.classList.toggle('active');
    } else {
        element.classList.toggle('active', show);
    }
};

// Handle sidebar collapse
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
});

// Handle select dropdown
const selectDropdownToggle = document.getElementById('select-dropdown-toggle');
const selectDropdown = document.getElementById('select-dropdown');
const selectAllCheckbox = document.getElementById('select-all');
const emailCheckboxes = document.querySelectorAll('.email-checkbox');

selectDropdownToggle.addEventListener('click', () => {
    toggleElement(selectDropdown);
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.checkbox-container')) {
        toggleElement(selectDropdown, false);
    }
    if (!e.target.closest('.more-options') && !e.target.closest('.more-dropdown')) {
        toggleElement(document.getElementById('more-dropdown'), false);
    }
});

// Handle select all functionality
selectAllCheckbox.addEventListener('change', () => {
    emailCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        updateEmailItemSelection(checkbox);
    });
});

// Handle individual email selection
emailCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        updateEmailItemSelection(checkbox);
        updateSelectAllCheckbox();
    });
});

function updateEmailItemSelection(checkbox) {
    const emailItem = checkbox.closest('.email-item');
    emailItem.classList.toggle('selected', checkbox.checked);
}

function updateSelectAllCheckbox() {
    const allChecked = Array.from(emailCheckboxes).every(checkbox => checkbox.checked);
    const someChecked = Array.from(emailCheckboxes).some(checkbox => checkbox.checked);
    selectAllCheckbox.checked = allChecked;
    selectAllCheckbox.indeterminate = someChecked && !allChecked;
}

// Handle more options dropdown
const moreOptionsToggle = document.getElementById('more-options-toggle');
const moreDropdown = document.getElementById('more-dropdown');

moreOptionsToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleElement(moreDropdown);
});

// Handle search filter modal
const filterButton = document.getElementById('filterButton');
const searchFilterModal = document.getElementById('searchFilterModal');

filterButton.addEventListener('click', () => {
    toggleElement(searchFilterModal);
});

searchFilterModal.addEventListener('click', (e) => {
    if (e.target === searchFilterModal) {
        toggleElement(searchFilterModal, false);
    }
});

// Add this function to handle bulk delete
function deleteSelectedEmails() {
    const selectedEmails = document.querySelectorAll('.email-checkbox:checked');
    if (selectedEmails.length === 0) return;

    selectedEmails.forEach(checkbox => {
        const emailItem = checkbox.closest('.email-item');
        emailItem.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => emailItem.remove(), 300);
    });

    // Reset select all checkbox
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;

    // Update mail counts
    updateMailCounts();
    
    // Show notification
    showNotification(`${selectedEmails.length} conversation${selectedEmails.length > 1 ? 's' : ''} moved to Bin`);
}

// Add event listeners for toolbar delete button
document.querySelector('.toolbar-icons img[alt="Delete"]').addEventListener('click', deleteSelectedEmails);

// Update the existing email actions handler
document.querySelectorAll('.email-actions img').forEach(action => {
    action.addEventListener('click', (e) => {
        e.stopPropagation();
        const emailItem = action.closest('.email-item');
        const actionType = action.alt.toLowerCase();
        
        switch(actionType) {
            case 'archive':
                emailItem.style.animation = 'slideOut 0.3s forwards';
                setTimeout(() => emailItem.remove(), 300);
                break;
            case 'delete':
                const checkbox = emailItem.querySelector('.email-checkbox');
                checkbox.checked = true;
                updateEmailItemSelection(checkbox);
                deleteSelectedEmails();
                break;
            case 'mark as unread':
                emailItem.classList.toggle('unread');
                break;
            case 'snooze':
                // Implement snooze functionality
                break;
        }
    });
});

// Add these variables at the top of your script.js
const emailList = document.querySelector('.email-list');
const sidebarItems = document.querySelectorAll('.sidebar-item');
let currentFolder = 'inbox';

// Add function to update mail counts
function updateMailCounts() {
    // Count total emails
    const totalEmails = document.querySelectorAll('.email-item').length;
    
    // Count starred emails
    const starredEmails = document.querySelectorAll('.email-item[data-starred="true"]').length;
    
    // Update inbox count
    const inboxCount = document.querySelector('.sidebar-item[data-folder="inbox"] .sidebar-count');
    if (inboxCount) {
        inboxCount.textContent = totalEmails > 0 ? totalEmails : '';
    }
    
    // Update starred count
    const starredCount = document.querySelector('.sidebar-item[data-folder="starred"] .sidebar-count');
    if (starredCount) {
        starredCount.textContent = starredEmails > 0 ? starredEmails : '';
    }
}

// Update the handleStarClick function
function handleStarClick(starIcon, emailItem) {
    const isStarred = starIcon.src.includes('star_border');
    starIcon.src = isStarred 
        ? 'https://www.gstatic.com/images/icons/material/system/1x/star_black_20dp.png'
        : 'https://www.gstatic.com/images/icons/material/system/1x/star_border_black_20dp.png';
    emailItem.dataset.starred = isStarred ? 'true' : 'false';
    
    // Update star status in localStorage
    const emailId = emailItem.dataset.emailId;
    const starredEmails = JSON.parse(localStorage.getItem('starredEmails') || '{}');
    if (isStarred) {
        starredEmails[emailId] = true;
    } else {
        delete starredEmails[emailId];
    }
    localStorage.setItem('starredEmails', JSON.stringify(starredEmails));
    
    // Update counts immediately
    updateMailCounts();
    
    // Filter if in starred view
    if (currentFolder === 'starred') {
        filterEmails('starred');
    }
}

// Update the filterEmails function
function filterEmails(folder) {
    const emails = document.querySelectorAll('.email-item');
    emails.forEach(email => {
        switch(folder) {
            case 'starred':
                email.style.display = email.dataset.starred === 'true' ? '' : 'none';
                break;
            case 'inbox':
                email.style.display = ''; // Show all emails
                break;
            default:
                email.style.display = '';
        }
    });
}

// Update sidebar click handlers
sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        sidebarItems.forEach(i => i.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');
        
        // Update current folder and filter emails
        const folder = item.dataset.folder || 'inbox';
        currentFolder = folder;
        filterEmails(folder);
    });
});

// Initialize starred emails and counts
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded'); // Debug log 1
    
    const starredEmails = JSON.parse(localStorage.getItem('starredEmails') || '{}');
    
    // Initialize email items with data attributes and star icons
    document.querySelectorAll('.email-item').forEach((emailItem, index) => {
        const emailId = `email-${index}`;
        emailItem.dataset.emailId = emailId;
        
        const starIcon = emailItem.querySelector('.star-icon');
        if (starredEmails[emailId]) {
            starIcon.src = 'https://www.gstatic.com/images/icons/material/system/1x/star_black_20dp.png';
            emailItem.dataset.starred = 'true';
        } else {
            emailItem.dataset.starred = 'false';
        }
        
        // Add click handler for star icon
        starIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            handleStarClick(starIcon, emailItem);
        });
    });
    
    // Set Inbox as active by default
    const inboxItem = document.querySelector('.sidebar-item[data-folder="inbox"]');
    if (inboxItem) {
        inboxItem.classList.add('active');
        currentFolder = 'inbox';
        filterEmails('inbox');
    }
    
    // Initialize mail counts
    updateMailCounts();

    // More dropdown functionality
    const moreToggle = document.querySelector('.more-toggle');
    const moreDropdown = document.querySelector('.more-dropdown');
    
    console.log('moreToggle:', moreToggle); // Debug log 2
    console.log('moreDropdown:', moreDropdown); // Debug log 3

    if (moreToggle && moreDropdown) {
        console.log('Elements found'); // Debug log 4
        
        moreToggle.addEventListener('click', (e) => {
            console.log('More toggle clicked'); // Debug log 5
            e.preventDefault();
            e.stopPropagation();
            moreToggle.classList.toggle('active');
            moreDropdown.classList.toggle('show');
            console.log('Dropdown classes:', moreDropdown.classList); // Debug log 6
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.more-section')) {
                moreToggle.classList.remove('active');
                moreDropdown.classList.remove('show');
            }
        });

        // Prevent dropdown from closing when clicking inside it
        moreDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    } else {
        console.error('More toggle or dropdown elements not found');
    }

    const sideAppsPanel = document.querySelector('.side-apps-panel');
    const sidePanelToggle = document.querySelector('.side-panel-toggle');
    
    // Panel starts collapsed by default
    let isPanelCollapsed = true;
    
    sidePanelToggle.addEventListener('click', () => {
        isPanelCollapsed = !isPanelCollapsed;
        sideAppsPanel.classList.toggle('collapsed');
        sidePanelToggle.classList.toggle('collapsed');
    });

    // Initialize app icons click handlers
    document.querySelectorAll('.side-app-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            // Handle app icon clicks
            console.log('App icon clicked:', icon.querySelector('img').alt);
        });
    });

    initDragAndDrop();
    
    // Add hover preview functionality
    document.querySelectorAll('.email-item').forEach(email => {
        let previewTimeout;
        
        email.addEventListener('mouseenter', (e) => {
            previewTimeout = setTimeout(() => {
                const preview = document.createElement('div');
                preview.className = 'email-preview';
                preview.innerHTML = `
                    <div class="preview-header">
                        <div class="preview-subject">${email.querySelector('.email-subject').textContent}</div>
                        <div class="preview-sender">${email.querySelector('.email-sender').textContent}</div>
                        <div class="preview-time">${email.querySelector('.email-time').textContent}</div>
                    </div>
                    <div class="preview-body">${email.querySelector('.email-body').textContent}</div>
                `;
                
                const rect = email.getBoundingClientRect();
                preview.style.top = `${rect.top}px`;
                preview.style.left = `${rect.right + 10}px`;
                
                document.body.appendChild(preview);
            }, 500);
        });
        
        email.addEventListener('mouseleave', () => {
            clearTimeout(previewTimeout);
            const preview = document.querySelector('.email-preview');
            if (preview) preview.remove();
        });
    });
});

// Add event delegation for dynamically added emails
emailList.addEventListener('click', (e) => {
    if (e.target.classList.contains('star-icon')) {
        const emailItem = e.target.closest('.email-item');
        if (emailItem) {
            handleStarClick(e.target, emailItem);
        }
    }
});

// Handle Categories expansion
const categoriesItem = document.querySelector('[data-folder="categories"]');
if (categoriesItem) {
    categoriesItem.addEventListener('click', (e) => {
        e.stopPropagation();
        categoriesItem.classList.toggle('active');
        // Add your categories expansion logic here
    });
}

// Add drag and drop functionality for emails
function initDragAndDrop() {
    const emailItems = document.querySelectorAll('.email-item');
    
    emailItems.forEach(email => {
        email.setAttribute('draggable', true);
        
        email.addEventListener('dragstart', (e) => {
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', e.target.dataset.emailId);
        });
        
        email.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });
    });

    // Add drop zones in sidebar folders
    document.querySelectorAll('.sidebar-item').forEach(folder => {
        folder.addEventListener('dragover', (e) => {
            e.preventDefault();
            folder.classList.add('drag-over');
        });

        folder.addEventListener('dragleave', (e) => {
            folder.classList.remove('drag-over');
        });

        folder.addEventListener('drop', (e) => {
            e.preventDefault();
            folder.classList.remove('drag-over');
            const emailId = e.dataTransfer.getData('text/plain');
            const emailElement = document.querySelector(`[data-email-id="${emailId}"]`);
            
            if (emailElement) {
                const folderType = folder.dataset.folder;
                
                if (folderType === 'starred') {
                    // Update star status instead of removing the email
                    const starIcon = emailElement.querySelector('.star-icon');
                    emailElement.dataset.starred = 'true';
                    starIcon.src = 'https://www.gstatic.com/images/icons/material/system/1x/star_black_20dp.png';
                    
                    // Update localStorage
                    const starredEmails = JSON.parse(localStorage.getItem('starredEmails') || '{}');
                    starredEmails[emailId] = true;
                    localStorage.setItem('starredEmails', JSON.stringify(starredEmails));
                } else {
                    // Remove email for other folders
                    emailElement.style.animation = 'slideOut 0.3s forwards';
                    setTimeout(() => emailElement.remove(), 300);
                }
                
                // Update counts
                updateMailCounts();
                
                // Show notification
                showNotification(`Email ${folderType === 'starred' ? 'starred' : 'moved to ' + folder.querySelector('.sidebar-item-text').textContent}`);
            }
        });
    });
}

// Add notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <span>${message}</span>
        <button class="undo-btn">Undo</button>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add search functionality
const searchInput = document.querySelector('.search-bar input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const emails = document.querySelectorAll('.email-item');
    
    emails.forEach(email => {
        const subject = email.querySelector('.email-subject').textContent.toLowerCase();
        const sender = email.querySelector('.email-sender').textContent.toLowerCase();
        const body = email.querySelector('.email-body').textContent.toLowerCase();
        
        const matches = subject.includes(searchTerm) || 
                       sender.includes(searchTerm) || 
                       body.includes(searchTerm);
        
        email.style.display = matches ? '' : 'none';
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Only handle shortcuts when not in an input field
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key) {
        case 'c':
            // Compose new email
            console.log('Compose new email');
            break;
        case '#':
            if (e.shiftKey) {
                // Delete selected emails
                deleteSelectedEmails();
                updateMailCounts();
            }
            break;
        case 'a':
            if (e.shiftKey) {
                // Select all emails
                selectAllCheckbox.click();
            }
            break;
        case 'e':
            // Archive selected emails
            const selectedEmails = document.querySelectorAll('.email-checkbox:checked');
            selectedEmails.forEach(checkbox => {
                const emailItem = checkbox.closest('.email-item');
                emailItem.style.animation = 'slideOut 0.3s forwards';
                setTimeout(() => emailItem.remove(), 300);
            });
            updateMailCounts();
            showNotification('Conversation archived');
            break;
    }
}); 
