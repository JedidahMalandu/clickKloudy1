// DOM Elements
const mediaUpload = document.getElementById('media-upload');
const dragDropArea = document.querySelector('.drag-drop-area');
const captionInput = document.getElementById('caption');
const charCount = document.getElementById('char-count');
const accountsSelect = document.getElementById('accounts');
const postNowBtn = document.getElementById('post-now');
const scheduleTime = document.getElementById('schedule-time');
const filterDate = document.getElementById('filter-date');
const filterPlatform = document.getElementById('filter-platform');
const filterAccount = document.getElementById('filter-account');
const addAccountBtn = document.querySelector('.add-account-btn');

// Global variables to store uploaded files and selected accounts
let uploadedFiles = [];
let selectedAccounts = [];

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
});

// Initialize dashboard data
async function initializeDashboard() {
    try {
        // Fetch user's linked accounts
        const accounts = await fetchLinkedAccounts();
        updateAccountsList(accounts);

        // Fetch scheduled posts
        const scheduledPosts = await fetchScheduledPosts();
        updateScheduledPosts(scheduledPosts);

        // Fetch activity feed
        const activities = await fetchActivityFeed();
        updateActivityFeed(activities);

        // Set minimum date for schedule input to current date/time
        const now = new Date();
        scheduleTime.min = now.toISOString().slice(0, 16);
    } catch (error) {
        showNotification('Error initializing dashboard', 'error');
    }
}

// Media Upload Handling
dragDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropArea.classList.add('drag-over');
});

dragDropArea.addEventListener('dragleave', () => {
    dragDropArea.classList.remove('drag-over');
});

dragDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropArea.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
});

mediaUpload.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
});

async function handleFileUpload(files) {
    const validFiles = files.filter(file => 
        file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length === 0) {
        showNotification('Please upload valid image or video files', 'error');
        return;
    }

    uploadedFiles = validFiles;
    updateMediaPreview(validFiles);
}

// Caption Character Counter
captionInput.addEventListener('input', () => {
    const length = captionInput.value.length;
    charCount.textContent = `${length}/500`;
    
    if (length > 450) {
        charCount.classList.add('warning');
    } else {
        charCount.classList.remove('warning');
    }
});

// Post Creation and Scheduling
postNowBtn.addEventListener('click', async () => {
    try {
        if (!validatePost()) return;

        const postData = await preparePostData();
        showNotification('Creating post...', 'info');
        
        const response = await createPost(postData);
        
        if (response.success) {
            showNotification('Post created successfully!', 'success');
            resetPostForm();
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        showNotification(`Error creating post: ${error.message}`, 'error');
    }
});

// Filter Handling
filterDate.addEventListener('change', updateFilteredPosts);
filterPlatform.addEventListener('change', updateFilteredPosts);
filterAccount.addEventListener('change', updateFilteredPosts);

async function updateFilteredPosts() {
    const filters = {
        date: filterDate.value,
        platform: filterPlatform.value,
        account: filterAccount.value
    };

    try {
        const filteredPosts = await fetchFilteredPosts(filters);
        updateScheduledPosts(filteredPosts);
    } catch (error) {
        showNotification('Error filtering posts', 'error');
    }
}

// Add New Account
addAccountBtn.addEventListener('click', () => {
    showAccountConnectModal();
});

// Utility Functions
function validatePost() {
    if (uploadedFiles.length === 0) {
        showNotification('Please upload at least one media file', 'error');
        return false;
    }

    if (!captionInput.value.trim()) {
        showNotification('Please enter a caption', 'error');
        return false;
    }

    const selectedPlatforms = Array.from(accountsSelect.selectedOptions);
    if (selectedPlatforms.length === 0) {
        showNotification('Please select at least one platform', 'error');
        return false;
    }

    return true;
}

async function preparePostData() {
    const formData = new FormData();
    uploadedFiles.forEach(file => formData.append('media[]', file));
    formData.append('caption', captionInput.value);
    formData.append('platforms', JSON.stringify(Array.from(accountsSelect.selectedOptions).map(opt => opt.value)));
    
    if (scheduleTime.value) {
        formData.append('scheduledTime', scheduleTime.value);
    }

    return formData;
}

function showNotification(message, type) {
    // Implement your notification system here
    console.log(`${type}: ${message}`);
}

// API Calls (to be implemented based on your backend)
async function fetchLinkedAccounts() {
    // Implement API call to fetch linked accounts
    try {
        const response = await fetch('/api/accounts/linked');
        if (!response.ok) throw new Error('Failed to fetch accounts');
        return await response.json();
    } catch (error) {
        throw new Error('Error fetching linked accounts');
    }
}

async function fetchScheduledPosts() {
    // Implement API call to fetch scheduled posts
    try {
        const response = await fetch('/api/posts/scheduled');
        if (!response.ok) throw new Error('Failed to fetch posts');
        return await response.json();
    } catch (error) {
        throw new Error('Error fetching scheduled posts');
    }
}

async function createPost(postData) {
    // Implement API call to create/schedule post
    try {
        const response = await fetch('/api/posts/create', {
            method: 'POST',
            body: postData
        });
        return await response.json();
    } catch (error) {
        throw new Error('Error creating post');
    }
}

// Initialize logout functionality
document.querySelector('a[href="/logout"]').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        showNotification('Error logging out', 'error');
    }
});

// Add real-time updates if needed
function setupWebSocket() {
    const ws = new WebSocket('wss://your-websocket-server');
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'post_status':
                updatePostStatus(data);
                break;
            case 'new_activity':
                updateActivityFeed([data.activity, ...currentActivities]);
                break;
            // Add more cases as needed
        }
    };
}