// Get form elements - fixed selectors to match HTML IDs
const loginForm = document.querySelector(".login-form");
const signupForm = document.querySelector(".signup-form");
const loginEmail = document.getElementById("email");
const signupEmail = document.getElementById("signup-email");
const loginPassword = document.getElementById("login-password");
const signupPassword = document.getElementById("signup-password");
const confirmPasswordInput = document.getElementById("confirm-password");
const nameInput = document.getElementById("name");

// Email validation
[loginEmail, signupEmail].forEach(email => {
    if (email) {
        email.addEventListener("input", () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value)) {
                email.setCustomValidity("Please enter a valid email address.");
            } else {
                email.setCustomValidity("");
            }
        });
    }
});

// Password validation
if (signupPassword) {
    signupPassword.addEventListener("input", () => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/; // Changed to 12 characters
        if (!passwordRegex.test(signupPassword.value)) {
            signupPassword.setCustomValidity(
                "Password must be at least 12 characters long, include a number, and a special character."
            );
        } else {
            signupPassword.setCustomValidity("");
        }
    });
}

// Confirm password validation
if (confirmPasswordInput && signupPassword) {
    confirmPasswordInput.addEventListener("input", () => {
        if (confirmPasswordInput.value !== signupPassword.value) {
            confirmPasswordInput.setCustomValidity("Passwords do not match.");
        } else {
            confirmPasswordInput.setCustomValidity("");
        }
    });
}

// Name validation
if (nameInput) {
    nameInput.addEventListener("input", () => {
        if (nameInput.value.trim() === "") {
            nameInput.setCustomValidity("Name cannot be empty.");
        } else {
            nameInput.setCustomValidity("");
        }
    });
}

// Toggle password visibility function
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = passwordInput.parentElement.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.textContent = '👁️‍🗨️';
    } else {
        passwordInput.type = 'password';
        toggleButton.textContent = '👁️';
    }
}

// Login form submission
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // Simulating successful login
        const isSuccess = true; // Replace with actual validation logic
        if (isSuccess) {
            window.location.href = "/dashboard";
        } else {
            const errorElement = document.getElementById("login-error");
            if (errorElement) {
                errorElement.textContent = "Invalid credentials. Please try again.";
            }
        }
    });
}

// Signup form submission
if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // Simulating successful sign-up
        const isSuccess = true; // Replace with actual validation logic
        if (isSuccess) {
            window.location.href = "/onboarding";
        } else {
            const errorElement = document.getElementById("signup-error");
            if (errorElement) {
                errorElement.textContent = "Email already in use.";
            }
        }
    });
}