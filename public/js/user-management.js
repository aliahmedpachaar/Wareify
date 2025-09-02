document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Redirect if not logged in or not an admin
    if (!token || role !== 'admin') {
        alert("Access denied. You must be an admin to manage users.");
        window.location.href = 'login.html';
        return;
    }

    // Setup theme toggle (re-used from dashboard)
    function setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const body = document.body;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.textContent = '🌙';
        } else {
            themeToggle.textContent = '☀️';
        }
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.textContent = '🌙';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.textContent = '☀️';
            }
        });
    }
    setupThemeToggle();

    // Logout button event listener (assuming logoutUser is in js/logout.js)
    document.getElementById('logoutButton').addEventListener('click', (event) => {
        event.preventDefault();
        if (typeof logoutUser === 'function') {
            logoutUser();
        } else {
            console.error("logoutUser function not found. Please check js/logout.js");
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = 'login.html';
        }
    });

    const messageBox = document.getElementById('messageBox');
    const userTableBody = document.querySelector('#userTable tbody');
    const noUsersMessage = document.getElementById('noUsersMessage');
    const addUserButton = document.getElementById('addUserButton');

    const userModal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const userForm = document.getElementById('userForm');
    const userIdInput = document.getElementById('userId');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const closeModalButtons = userModal.querySelectorAll('.close-button, .cancel-button');

    function showMessage(message, isError = false) {
        messageBox.textContent = message;
        messageBox.className = isError ? 'message-box error' : 'message-box success';
        messageBox.style.display = 'block';
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }

    async function fetchUsers() {
        try {
            const response = await fetch('http://localhost:3000/admin/users', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch users.');
            }
            const users = await response.json();
            renderUserTable(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            showMessage(`Error loading users: ${error.message}`, true);
        }
    }

    function renderUserTable(users) {
        userTableBody.innerHTML = ''; // Clear existing rows
        if (users.length === 0) {
            noUsersMessage.style.display = 'block';
            document.getElementById('userTable').style.display = 'none';
            return;
        } else {
            noUsersMessage.style.display = 'none';
            document.getElementById('userTable').style.display = 'table';
        }

        users.forEach(user => {
            const row = userTableBody.insertRow();
            row.insertCell().textContent = user.email;
            row.insertCell().textContent = user.role;

            const actionsCell = row.insertCell();
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('action-button', 'edit-button');
            editButton.onclick = () => openUserModal('edit', user);
            actionsCell.appendChild(editButton);

            // Prevent admin from deleting their own account
            if (user._id !== localStorage.getItem('userId')) { // Assuming userId is stored in localStorage
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('action-button', 'delete-button');
                deleteButton.onclick = () => deleteUser(user._id);
                actionsCell.appendChild(deleteButton);
            }
        });
    }

    function openUserModal(mode, user = {}) {
        userForm.reset(); // Clear previous form data
        userIdInput.value = user._id || '';
        modalTitle.textContent = mode === 'add' ? 'Add New User' : 'Edit User';
        passwordInput.placeholder = mode === 'add' ? 'Enter password' : 'Leave blank to keep current password';
        passwordInput.required = mode === 'add'; // Password is required for new users

        if (mode === 'edit') {
            emailInput.value = user.email;
            roleSelect.value = user.role;
        }

        userModal.style.display = 'block';
    }

    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            userModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target == userModal) {
            userModal.style.display = 'none';
        }
    });

    addUserButton.addEventListener('click', () => openUserModal('add'));

    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = userIdInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const role = roleSelect.value;

        const userData = { email, role };
        if (password) { // Only include password if it's provided (for add or reset)
            userData.password = password;
        }

        try {
            let response;
            if (id) { // Edit existing user
                response = await fetch(`http://localhost:3000/admin/users/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(userData)
                });
            } else { // Add new user
                response = await fetch('http://localhost:3000/admin/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(userData)
                });
            }

            const result = await response.json();
            if (response.ok) {
                showMessage(result.message, false);
                userModal.style.display = 'none';
                fetchUsers(); // Refresh user list
            } else {
                showMessage(`Error: ${result.message}`, true);
            }
        } catch (error) {
            console.error('User form submission error:', error);
            showMessage('An error occurred while saving the user.', true);
        }
    });

    async function deleteUser(id) {
        // Get the currently logged-in user's ID from localStorage
        const loggedInUserId = localStorage.getItem('userId'); 

        if (id === loggedInUserId) {
            showMessage('You cannot delete your own admin account!', true);
            return;
        }

        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });

            const result = await response.json();
            if (response.ok) {
                showMessage(result.message, false);
                fetchUsers(); // Refresh user list
            } else {
                showMessage(`Error: ${result.message}`, true);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showMessage('An error occurred while deleting the user.', true);
        }
    }

    // Initial fetch of users when the page loads
    fetchUsers();
});
