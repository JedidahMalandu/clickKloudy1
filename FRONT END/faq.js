// DOM Elements - specific to the ClickKloudy FAQ structure
const searchInput = document.getElementById('faq-search');
const searchButton = document.getElementById('search-btn');
const faqDetails = document.querySelectorAll('details');
const allFaqCategories = document.querySelectorAll('.faq-category');
const helpfulResources = document.getElementById('helpful-resources');
const contactSupport = document.getElementById('contact-support');

// Initialize FAQ functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeSearchHandling();
    initializeAccordionBehavior();
    initializeResourceLinks();
    trackPageView();
});

// Search functionality
function initializeSearchHandling() {
    let searchDebounceTimer;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase().trim();
            handleSearch(searchTerm);
        }, 300);
    });

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        handleSearch(searchTerm);
    });
}

// Search implementation specific to ClickKloudy's FAQ structure
function handleSearch(searchTerm) {
    if (!searchTerm) {
        resetSearch();
        return;
    }

    let matchFound = false;

    // Search through each FAQ category
    allFaqCategories.forEach(category => {
        const categoryTitle = category.querySelector('h2').textContent.toLowerCase();
        const details = category.querySelectorAll('details');
        let categoryHasMatch = false;

        details.forEach(detail => {
            const summary = detail.querySelector('summary').textContent.toLowerCase();
            const content = detail.querySelector('p').textContent.toLowerCase();
            
            if (summary.includes(searchTerm) || content.includes(searchTerm) || categoryTitle.includes(searchTerm)) {
                detail.style.display = 'block';
                detail.classList.add('search-highlight');
                categoryHasMatch = true;
                matchFound = true;
            } else {
                detail.style.display = 'none';
                detail.classList.remove('search-highlight');
            }
        });

        category.style.display = categoryHasMatch ? 'block' : 'none';
    });

    // Toggle visibility of additional sections based on search
    helpfulResources.style.display = matchFound ? 'block' : 'none';
    
    handleNoResults(matchFound);
}

// Reset search results
function resetSearch() {
    allFaqCategories.forEach(category => {
        category.style.display = 'block';
        const details = category.querySelectorAll('details');
        details.forEach(detail => {
            detail.style.display = 'block';
            detail.classList.remove('search-highlight');
        });
    });
    helpfulResources.style.display = 'block';
    removeNoResultsMessage();
}

// Handle no results found
function handleNoResults(matchFound) {
    removeNoResultsMessage();
    if (!matchFound) {
        const noResults = document.createElement('div');
        noResults.id = 'no-results-message';
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <p>No matching questions found. Please try different keywords or contact our support team.</p>
            <button onclick="resetSearch(); searchInput.value = '';">Clear Search</button>
            <button onclick="window.location.href='https://example.com/contact-support'">Contact Support</button>
        `;
        document.querySelector('main').appendChild(noResults);
    }
}

function removeNoResultsMessage() {
    const existingMessage = document.getElementById('no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

// Accordion behavior for ClickKloudy's FAQ structure
function initializeAccordionBehavior() {
    faqDetails.forEach(detail => {
        detail.addEventListener('toggle', () => {
            if (detail.open) {
                // Track which category the question is from
                const category = detail.closest('.faq-category').querySelector('h2').textContent;
                const question = detail.querySelector('summary').textContent;
                trackQuestionView(category, question);
                closeOtherDetails(detail);
            }
        });

        // Keyboard accessibility
        detail.querySelector('summary').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                detail.open = !detail.open;
            }
        });
    });
}

// Initialize resource links tracking
function initializeResourceLinks() {
    const resourceLinks = helpfulResources.querySelectorAll('a');
    resourceLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            trackResourceClick(link.textContent, link.href);
        });
    });
}

// Close other open details when one is opened
function closeOtherDetails(currentDetail) {
    const categoryDetails = currentDetail.closest('.faq-category').querySelectorAll('details');
    categoryDetails.forEach(detail => {
        if (detail !== currentDetail && detail.open) {
            detail.open = false;
        }
    });
}

// Analytics tracking functions
function trackPageView() {
    sendAnalytics({
        event: 'page_view',
        page: 'faq',
        timestamp: new Date().toISOString()
    });
}

function trackQuestionView(category, question) {
    sendAnalytics({
        event: 'question_view',
        category: category,
        question: question,
        timestamp: new Date().toISOString()
    });
}

function trackResourceClick(resourceName, resourceUrl) {
    sendAnalytics({
        event: 'resource_click',
        resource: resourceName,
        url: resourceUrl,
        timestamp: new Date().toISOString()
    });
}

// Analytics helper function
function sendAnalytics(data) {
    // Replace with your actual analytics endpoint
    const ANALYTICS_ENDPOINT = 'https://analytics.clickkloudy.com/track';
    
    fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).catch(error => {
        console.error('Analytics error:', error);
    });
}

// Error handling
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
    sendAnalytics({
        event: 'error',
        error: event.error.message,
        location: event.filename,
        timestamp: new Date().toISOString()
    });
});