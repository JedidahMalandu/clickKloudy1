document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Handler - Matches your specific header structure
  const menuToggle = document.getElementById('menu-toggle');
  const navBar = document.querySelector('.nav-bar');
  
  menuToggle?.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navBar.classList.toggle('active');
  });

  // 2. Hero Section Animation
  const heroContent = document.querySelector('.hero-content');
  const heroVisual = document.querySelector('.hero-visual');
  
  if (heroContent && heroVisual) {
      heroContent.classList.add('animate-fade-in');
      heroVisual.classList.add('animate-slide-in');
  }

  // 3. Features Section Animation - Matches your three feature items
  const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('animate');
              observer.unobserve(entry.target);
          }
      });
  }, observerOptions);

  // Observe your specific features
  document.querySelectorAll('.feature-item').forEach((feature, index) => {
      feature.style.transitionDelay = `${index * 0.2}s`;
      observer.observe(feature);
  });

  // 4. How It Works Section - Matches your three steps
  const steps = document.querySelectorAll('.step');
  steps.forEach((step, index) => {
      step.style.transitionDelay = `${index * 0.3}s`;
      observer.observe(step);
  });

  // 5. Testimonials Carousel - Matches your three testimonial cards
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  let currentTestimonial = 0;
  
  function showTestimonial(index) {
      testimonialCards.forEach((card, i) => {
          if (i === index) {
              card.classList.add('active');
          } else {
              card.classList.remove('active');
          }
      });
  }

  // Auto rotate testimonials every 5 seconds
  if (testimonialCards.length > 0) {
      setInterval(() => {
          currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
          showTestimonial(currentTestimonial);
      }, 5000);
  }

  // 6. Smooth Scroll for Navigation - Matches your specific nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href');
          if (targetId === '#') return;
          
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
              targetElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
              });
              // Close mobile menu if open
              menuToggle?.classList.remove('active');
              navBar?.classList.remove('active');
          }
      });
  });

  // 7. Header Scroll Behavior
  const header = document.querySelector('header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      // Add/remove shadow and background on scroll
      if (currentScroll > 50) {
          header?.classList.add('scrolled');
      } else {
          header?.classList.remove('scrolled');
      }

      // Hide/show header based on scroll direction
      if (currentScroll > lastScroll && currentScroll > 100) {
          header?.classList.add('header-hidden');
      } else {
          header?.classList.remove('header-hidden');
      }

      lastScroll = currentScroll;
  });

  // 8. Social Media Links Hover Effect
  const socialLinks = document.querySelectorAll('.social-media-links a');
  socialLinks.forEach(link => {
      link.addEventListener('mouseenter', function() {
          this.querySelector('img').style.transform = 'scale(1.2)';
      });
      
      link.addEventListener('mouseleave', function() {
          this.querySelector('img').style.transform = 'scale(1)';
      });
  });

  // 9. CTA Button Animation
  const ctaButton = document.querySelector('.cta-button');
  if (ctaButton) {
      ctaButton.addEventListener('mouseenter', function() {
          this.classList.add('pulse');
      });
      
      ctaButton.addEventListener('mouseleave', function() {
          this.classList.remove('pulse');
      });
  }

  // 10. Image Loading Optimization
  const images = document.querySelectorAll('img[src*="images/"]');
  images.forEach(img => {
      img.addEventListener('load', () => {
          img.classList.add('loaded');
      });
  });
});