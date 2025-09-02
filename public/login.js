document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const messageBox = document.getElementById('messageBox');
    const loadingElement = document.getElementById('loading');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');

    // ✅ ADDED: Logic to auto-fill email on page load
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }

    function showMessage(message, isError = true) {
        messageBox.textContent = message;
        messageBox.className = ''; // Reset class
        messageBox.classList.add(isError ? 'error' : 'success');
        messageBox.style.display = 'block';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageBox.style.display = 'none';
        if (loadingElement) loadingElement.style.display = 'block';

        const email = emailInput.value;
        const password = document.getElementById('password').value;
        
        // ✅ ADDED: Logic to save/remove email based on checkbox
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('userEmail', email);
        } else {
            localStorage.removeItem('userEmail');
        }

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();
            if (loadingElement) loadingElement.style.display = 'none';

            if (response.ok) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('role', result.role);
                localStorage.setItem('userId', result.userId);
                
                showMessage('Login successful! Redirecting...', false);
                
                if (result.role === 'staff') {
                    window.location.href = 'staff-dashboard.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                showMessage(result.message || 'Login failed.');
            }
        } catch (error) {
            if (loadingElement) loadingElement.style.display = 'none';
            console.error('Login error:', error);
            showMessage(`Network error: ${error.message}.`);
        }
    });

    forgotPasswordLink.addEventListener('click', async (event) => {
        event.preventDefault();
        const email = prompt("Please enter your email to request a password reset:");
        if (email) {
            try {
                const response = await fetch('http://localhost:3000/forgot-password-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const result = await response.json();
                showMessage(result.message, !response.ok);
            } catch (error) {
                console.error('Forgot password error:', error);
                showMessage('An error occurred. Please try again later.');
            }
        } else if (email === '') {
            showMessage('Email cannot be empty.');
        }
    });
});