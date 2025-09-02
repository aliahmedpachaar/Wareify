// public/js/logout.js

function logoutUser() {
    // Clear the JWT token and user role from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    // Alert the user (optional)
    alert('You have been logged out successfully.');

    // Redirect to the index page or login page
    // Assuming index.html is your public landing page. If you want to go to login.html, change this.
    window.location.href = 'index.html';
}

// Attach to a global object or export if using modules (for simplicity, we'll keep it global)
// window.logoutUser = logoutUser; // Not strictly needed if linked directly in script tags