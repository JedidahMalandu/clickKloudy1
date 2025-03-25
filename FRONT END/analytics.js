// Constants for API endpoints and configuration
const API_ENDPOINTS = {
    analytics: '/api/analytics',
    posts: '/api/posts',
    insights: '/api/insights'
};

// State management
const state = {
    dateRange: '7days',
    platform: 'all',
    contentType: 'all',
    sortBy: 'likes',
    data: {
        engagementData: null,
        platformData: null,
        topPosts: null,
        accountInsights: null
    }
};

// Utility functions
const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { 
        notation: num > 9999 ? "compact" : "standard",
        compactDisplay: "short" 
    }).format(num);
};

const calculateGrowth = (current, previous) => {
    return previous ? ((current - previous) / previous * 100).toFixed(1) : 0;
};

// Data fetching functions
async function fetchAnalyticsData(params) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_ENDPOINTS.analytics}?${queryString}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        throw error;
    }
}

// Chart initialization functions
function initializeEngagementChart(data) {
    const ctx = document.getElementById('engagement-trend').getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Engagement Rate',
                data: data.values,
                borderColor: '#4CAF50',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `${value}%`
                    }
                }
            }
        }
    });
}

function initializePlatformChart(data) {
    const ctx = document.getElementById('platform-comparison').getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.platforms,
            datasets: [{
                label: 'Engagement by Platform',
                data: data.engagement,
                backgroundColor: [
                    '#4267B2', // Facebook
                    '#E1306C', // Instagram
                    '#1DA1F2', // Twitter
                    '#0077B5', // LinkedIn
                    '#000000'  // TikTok
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Event listeners
function initializeEventListeners() {
    // Date range filter
    document.getElementById('date-range').addEventListener('change', async (e) => {
        state.dateRange = e.target.value;
        await updateDashboard();
    });

    // Platform filter
    document.getElementById('platform-filter').addEventListener('change', async (e) => {
        state.platform = e.target.value;
        await updateDashboard();
    });

    // Content type filter
    document.getElementById('content-type-filter').addEventListener('change', async (e) => {
        state.contentType = e.target.value;
        await updateDashboard();
    });

    // Sort by
    document.getElementById('sort-by').addEventListener('change', async (e) => {
        state.sortBy = e.target.value;
        await updateTopPosts();
    });
}

// UI update functions
function updateTopPosts(posts) {
    const gallery = document.querySelector('.post-gallery');
    gallery.innerHTML = ''; // Clear existing posts

    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.innerHTML = `
            <img src="${post.thumbnail}" alt="Post Thumbnail" class="post-thumbnail">
            <div class="post-details">
                <p class="post-caption">${post.caption}</p>
                <ul class="post-metrics">
                    <li>Likes: <span>${formatNumber(post.likes)}</span></li>
                    <li>Shares: <span>${formatNumber(post.shares)}</span></li>
                    <li>Comments: <span>${formatNumber(post.comments)}</span></li>
                    <li>Impressions: <span>${formatNumber(post.impressions)}</span></li>
                    <li>Click-through Rate: <span>${post.ctr}%</span></li>
                </ul>
            </div>
        `;
        gallery.appendChild(postCard);
    });
}

function updateAccountInsights(insights) {
    const statsList = document.querySelector('.stats-list');
    statsList.innerHTML = Object.entries(insights.overview).map(([key, value]) => `
        <li>
            <strong>${key}:</strong> ${formatNumber(value.current)}
            <span class="growth ${value.growth >= 0 ? 'positive' : 'negative'}">
                ${value.growth >= 0 ? '+' : ''}${value.growth}%
            </span>
        </li>
    `).join('');
}

// Main dashboard update function
async function updateDashboard() {
    try {
        const params = {
            dateRange: state.dateRange,
            platform: state.platform,
            contentType: state.contentType
        };

        const data = await fetchAnalyticsData(params);
        state.data = data;

        // Update charts
        if (window.engagementChart) {
            window.engagementChart.destroy();
        }
        if (window.platformChart) {
            window.platformChart.destroy();
        }

        window.engagementChart = initializeEngagementChart(data.engagementData);
        window.platformChart = initializePlatformChart(data.platformData);

        // Update other sections
        updateTopPosts(data.topPosts);
        updateAccountInsights(data.accountInsights);

    } catch (error) {
        console.error('Error updating dashboard:', error);
        // Show error message to user
        alert('There was an error updating the dashboard. Please try again later.');
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    initializeEventListeners();
    await updateDashboard();

    // Add error boundary
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        // Implement error logging service here
    });
});

// Add loading state handlers
function showLoading() {
    // Add loading spinner implementation
    document.body.classList.add('loading');
}

function hideLoading() {
    document.body.classList.remove('loading');
}
