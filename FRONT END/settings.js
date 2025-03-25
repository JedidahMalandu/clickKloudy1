document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Password strength checker
    const newPasswordInput = document.getElementById('new-password');
    const passwordStrength = document.getElementById('passwordStrength');

    newPasswordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        
        // Check length
        if (password.length >= 8) strength += 1;
        
        // Check for numbers
        if (/\d/.test(password)) strength += 1;
        
        // Check for uppercase
        if (/[A-Z]/.test(password)) strength += 1;
        
        // Check for special characters
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

        // Update strength indicator
        switch(strength) {
            case 0:
                passwordStrength.textContent = 'Password Strength: Weak';
                passwordStrength.style.color = '#ff4444';
                break;
            case 1:
                passwordStrength.textContent = 'Password Strength: Fair';
                passwordStrength.style.color = '#ffa700';
                break;
            case 2:
                passwordStrength.textContent = 'Password Strength: Good';
                passwordStrength.style.color = '#70c1ff';
                break;
            case 3:
            case 4:
                passwordStrength.textContent = 'Password Strength: Strong';
                passwordStrength.style.color = '#00c851';
                break;
        }
    });

    // Form submission handler
    const settingsForm = document.getElementById('settingsForm');
    settingsForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match!');
            return;
        }

        // Simulate API call
        try {
            const formData = new FormData(this);
            const response = await simulateApiCall(formData);
            
            if (response.success) {
                alert('Settings updated successfully!');
                // Reset form or redirect as needed
            } else {
                alert('Error updating settings: ' + response.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving settings');
        }
    });

    // Profile picture handling
    const profilePicInput = document.getElementById('profile-picture');
    const removeButton = document.getElementById('removePicture');

    profilePicInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                this.value = '';
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size should not exceed 5MB');
                this.value = '';
                return;
            }
        }
    });

    removeButton.addEventListener('click', function() {
        profilePicInput.value = '';
        // Additional logic to remove existing profile picture
    });

    // Email validation
    const emailInput = document.getElementById('email');
    const emailMessage = document.getElementById('emailMessage');

    emailInput.addEventListener('input', function() {
        const email = this.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            emailMessage.textContent = 'Please enter a valid email address';
            emailMessage.style.color = '#ff4444';
        } else {
            emailMessage.textContent = 'Valid email address';
            emailMessage.style.color = '#00c851';
        }
    });

    // Simulate API call function
    async function simulateApiCall(formData) {
        // In a real application, this would be an actual API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Settings updated successfully'
                });
            }, 1000);
        });
    }
});