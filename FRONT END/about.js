// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize intersection observer for animations
    const animateOnScroll = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    // Only animate once
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });

        // Observe all main sections
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.classList.add('hidden');
            observer.observe(section);
        });
    };

    // Smooth scroll implementation
    const implementSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                document.querySelector(targetId)?.scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    };

    // Social media link handling
    const handleSocialLinks = () => {
        const socialLinks = document.querySelectorAll('.social-links a');
        
        socialLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Track social media clicks for analytics
                trackSocialClick(this.href);
                
                // Ensure links open in new tab
                if (!this.target || this.target !== '_blank') {
                    this.target = '_blank';
                }
            });
        });
    };

    // Analytics tracking function
    const trackSocialClick = (url) => {
        // Implementation would depend on your analytics provider
        // Example with Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'social_click', {
                'event_category': 'Social Media',
                'event_label': url
            });
        }
    };

    // Feature list interaction
    const enhanceFeatureList = () => {
        const featureItems = document.querySelectorAll('.feature-item');
        
        featureItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.classList.add('feature-hover');
            });

            item.addEventListener('mouseleave', function() {
                this.classList.remove('feature-hover');
            });

            // Add click handling for mobile devices
            item.addEventListener('click', function() {
                // Remove active class from all other items
                featureItems.forEach(otherItem => {
                    if (otherItem !== this) {
                        otherItem.classList.remove('feature-active');
                    }
                });
                this.classList.toggle('feature-active');
            });
        });
    };

    // Footer newsletter form handling (if added later)
    const setupNewsletterForm = () => {
        const form = document.querySelector('.newsletter-form');
        if (!form) return;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]')?.value;
            if (!email) return;

            try {
                const response = await subscribeToNewsletter(email);
                showNotification('Thanks for subscribing!', 'success');
            } catch (error) {
                showNotification('Subscription failed. Please try again.', 'error');
            }
        });
    };

    // Utility function to show notifications
    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    };

    // Mobile menu handling (if added later)
    const setupMobileMenu = () => {
        const menuButton = document.querySelector('.mobile-menu-button');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (!menuButton || !mobileMenu) return;

        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            menuButton.setAttribute('aria-expanded', 
                menuButton.getAttribute('aria-expanded') === 'false' ? 'true' : 'false'
            );
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
                mobileMenu.classList.remove('active');
                menuButton.setAttribute('aria-expanded', 'false');
            }
        });
    };

    // Performance monitoring
    const monitorPerformance = () => {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const timing = performance.getEntriesByType('navigation')[0];
                console.log(`Page Load Time: ${timing.loadEventEnd - timing.navigationStart}ms`);
            });
        }
    };

    // Initialize all functionality
    const init = () => {
        animateOnScroll();
        implementSmoothScroll();
        handleSocialLinks();
        enhanceFeatureList();
        setupNewsletterForm();
        setupMobileMenu();
        monitorPerformance();
    };

    init();
});