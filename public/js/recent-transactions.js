document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
        console.error("Unauthorized access.");
        window.location.href = "login.html";
        return;
    }

    setupThemeToggle();
    setupSearchFunctionality();
    loadRecentTransactions();
});

let allShipments = []; // This will hold the live data from the server

// --- CHANGED: Now fetches from the correct /shipments endpoint with authentication ---
async function loadRecentTransactions() {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch("http://localhost:3000/shipments", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transaction data. Please log in again.');
        }

        const data = await response.json();
        allShipments = data; // Store the live data
        renderTransactions(); // Initial render

    } catch (err) {
        console.error("Error fetching recent transactions:", err);
        const tbody = document.getElementById("transactionsTableBody");
        tbody.innerHTML = `<tr><td colspan="6" class="error-message">${err.message}</td></tr>`;
    }
}

// --- CHANGED: Renders transactions using the correct _id ---
function renderTransactions(searchTerm = "") {
    const tbody = document.getElementById("transactionsTableBody");
    tbody.innerHTML = "";

    let filteredShipments = allShipments;

    if (searchTerm) {
        const query = searchTerm.toLowerCase();
        filteredShipments = allShipments.filter(shipment =>
            (shipment._id && shipment._id.toLowerCase().includes(query)) ||
            (shipment.itemName && shipment.itemName.toLowerCase().includes(query)) ||
            (shipment.recipient && shipment.recipient.toLowerCase().includes(query)) ||
            (shipment.status && shipment.status.toLowerCase().includes(query))
        );
    }

    if (filteredShipments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="modal-message">No transactions found.</td></tr>`;
        return;
    }

    filteredShipments.forEach(shipment => {
        const row = document.createElement("tr");
        const statusClass = `status-${shipment.status.toLowerCase().replace(' ', '-')}`;
        
        // --- Using shipment._id from MongoDB ---
        row.innerHTML = `
            <td>#${shipment._id.slice(-6)}</td>
            <td>${shipment.itemName || "-"}</td>
            <td>${shipment.recipient || "-"}</td>
            <td>${shipment.address || "-"}</td>
            <td><span class="status-badge ${statusClass}">${shipment.status || "-"}</span></td>
            <td>
                <button class="action-btn delete" data-id="${shipment._id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Attach delete event listeners after rendering
    document.querySelectorAll(".delete").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            if (confirm(`Are you sure you want to delete transaction #${id.slice(-6)}?`)) {
                deleteTransaction(id);
            }
        });
    });
}

// --- CHANGED: Deletes a shipment from the server ---
async function deleteTransaction(id) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`http://localhost:3000/shipments/${id}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Failed to delete from server.");
        }

        // On successful deletion, remove it from our local copy and re-render
        allShipments = allShipments.filter(s => s._id !== id);
        renderTransactions(document.getElementById("transactionSearchInput").value.trim());
        alert(result.message);

    } catch (err) {
        console.error("Delete error:", err);
        alert(`Error: ${err.message}`);
    }
}

// --- Theme toggle (unchanged) ---
function setupThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        body.classList.add("dark-mode");
        themeToggle.textContent = "🌙";
    } else {
        themeToggle.textContent = "☀️";
    }
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        const newTheme = body.classList.contains("dark-mode") ? "dark" : "light";
        localStorage.setItem("theme", newTheme);
        themeToggle.textContent = newTheme === "dark" ? "🌙" : "☀️";
    });
}

// --- Search functionality (unchanged) ---
function setupSearchFunctionality() {
    const searchInput = document.getElementById("transactionSearchInput");
    const searchButton = document.getElementById("searchButton");
    const clearSearchButton = document.getElementById("clearSearchButton");

    searchButton.addEventListener("click", () => {
        const searchTerm = searchInput.value.trim();
        renderTransactions(searchTerm);
        clearSearchButton.style.display = searchTerm ? "inline-block" : "none";
    });

    clearSearchButton.addEventListener("click", () => {
        searchInput.value = "";
        renderTransactions("");
        clearSearchButton.style.display = "none";
    });

    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            searchButton.click();
        }
    });
}