// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const feedbackMessage = document.getElementById('feedback-message');
    
    // Form validation configuration
    const validationRules = {
        'full-name': {
            minLength: 2,
            maxLength: 100,
            pattern: /^[a-zA-Z\s'-]+$/,
            errorMessage: 'Please enter a valid name (letters, spaces, hyphens, and apostrophes only)'
        },
        'email': {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            errorMessage: 'Please enter a valid email address'
        },
        'message': {
            minLength: 10,
            maxLength: 1000,
            errorMessage: 'Message must be between 10 and 1000 characters'
        }
    };

    // Create and append error message element
    function showError(input, message) {
        // Remove any existing error message
        removeError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
        input.classList.add('error');
    }

    // Remove error message and styling
    function removeError(input) {
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        input.classList.remove('error');
    }

    // Validate individual form field
    function validateField(input) {
        const rules = validationRules[input.id];
        if (!rules) return true;

        const value = input.value.trim();

        if (rules.minLength && value.length < rules.minLength) {
            showError(input, rules.errorMessage);
            return false;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            showError(input, rules.errorMessage);
            return false;
        }

        if (rules.pattern && !rules.pattern.test(value)) {
            showError(input, rules.errorMessage);
            return false;
        }

        removeError(input);
        return true;
    }

    // Real-time validation on input
    Object.keys(validationRules).forEach(fieldId => {
        const input = document.getElementById(fieldId);
        input.addEventListener('input', () => validateField(input));
        input.addEventListener('blur', () => validateField(input));
    });

    // Handle form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields before submission
        let isValid = true;
        Object.keys(validationRules).forEach(fieldId => {
            const input = document.getElementById(fieldId);
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            return;
        }

        // Disable submit button and show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            // Collect form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Send the form data to the server
            const response = await fetch('submit-form.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Show success message
            contactForm.reset();
            feedbackMessage.classList.remove('hidden');
            feedbackMessage.classList.add('success');

            // Hide success message after 5 seconds
            setTimeout(() => {
                feedbackMessage.classList.add('hidden');
            }, 5000);

        } catch (error) {
            // Handle errors
            console.error('Error:', error);
            feedbackMessage.textContent = 'Sorry, there was an error sending your message. Please try again later.';
            feedbackMessage.classList.remove('hidden');
            feedbackMessage.classList.add('error');
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });

    // Character counter for message textarea
    const messageTextarea = document.getElementById('message');
    const maxLength = validationRules.message.maxLength;
    
    // Create character counter element
    const charCounter = document.createElement('div');
    charCounter.className = 'char-counter';
    messageTextarea.parentNode.insertBefore(charCounter, messageTextarea.nextSibling);

    messageTextarea.addEventListener('input', () => {
        const remaining = maxLength - messageTextarea.value.length;
        charCounter.textContent = `${remaining} characters remaining`;
        
        if (remaining < 50) {
            charCounter.classList.add('warning');
        } else {
            charCounter.classList.remove('warning');
        }
    });
});