// js/track-shipments.js (REVISED)

document.addEventListener('DOMContentLoaded', () => {
    // Check for token and role immediately
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to view this page.");
        window.location.href = 'login.html';
        return;
    }

    // Event listeners
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = 'login.html';
        });
    }

    const searchButton = document.getElementById("searchButton");
    const searchInput = document.getElementById("searchInput");
    if (searchButton && searchInput) {
        searchButton.addEventListener("click", searchShipments);
        searchInput.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                searchShipments();
            }
        });
    }

    // Initial load of all shipments from the database
    renderAllShipments();
});

// --- CHANGED: Fetches all shipments from the server API ---
async function renderAllShipments() {
    const shipmentsTableBody = document.getElementById("shipmentsTableBody");
    const noShipmentsMessage = document.getElementById("noShipmentsMessage");
    const shipmentsTable = document.getElementById("shipmentsTable");
    const token = localStorage.getItem("token");

    shipmentsTableBody.innerHTML = '<tr><td colspan="7">Loading shipments...</td></tr>';

    try {
        const response = await fetch('http://localhost:3000/shipments', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch shipments. Please log in again.');
        }

        const shipments = await response.json();
        shipmentsTableBody.innerHTML = '';

        if (shipments.length === 0) {
            noShipmentsMessage.style.display = "block";
            shipmentsTable.style.display = "none";
        } else {
            noShipmentsMessage.style.display = "none";
            shipmentsTable.style.display = "table";

            shipments.forEach((shipment) => {
                const row = document.createElement("tr");
                const statusClass = `status-${shipment.status.toLowerCase().replace(' ', '-')}`;
                
                // --- Using shipment._id from MongoDB ---
                row.innerHTML = `
                    <td>#${shipment._id.slice(-6)}</td>
                    <td>${shipment.itemName}</td>
                    <td>${shipment.quantity}</td>
                    <td>${shipment.recipient}</td>
                    <td>${shipment.rfidTag ? shipment.rfidTag : '<em>Not Assigned</em>'}</td>
                    <td><span class="status-badge ${statusClass}">${shipment.status}</span></td>
                    <td>
                        <button class="action-btn view">View</button>
                        <button class="action-btn delete">Delete</button>
                    </td>
                `;

                // Add event listeners directly to avoid inline JS
                row.querySelector('.view').addEventListener('click', () => viewDetails(shipment));
                row.querySelector('.delete').addEventListener('click', () => deleteShipment(shipment._id));

                shipmentsTableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Error rendering shipments:", error);
        shipmentsTableBody.innerHTML = `<tr><td colspan="7" class="error-message">${error.message}</td></tr>`;
    }
}

function searchShipments() {
    // This function can remain as is, it filters the currently visible rows
    const query = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#shipmentsTableBody tr");
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
    });
}

// --- CHANGED: Sends a DELETE request to the server API ---
async function deleteShipment(shipmentId) {
    if (!confirm(`Are you sure you want to delete shipment #${shipmentId.slice(-6)}?`)) {
        return;
    }

    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`http://localhost:3000/shipments/${shipmentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message);
        }

        alert(result.message);
        renderAllShipments(); // Refresh the table from the server
    } catch (error) {
        console.error("Error deleting shipment:", error);
        alert(`Deletion failed: ${error.message}`);
    }
}

// --- CHANGED: Now receives the full shipment object ---
function viewDetails(shipment) {
    if (!shipment) return;

    document.getElementById('modalShipmentId').textContent = `Shipment #${shipment._id.slice(-6)}`;
    document.getElementById('modalItemName').textContent = shipment.itemName;
    document.getElementById('modalRecipient').textContent = shipment.recipient;

    const timeline = document.getElementById('modalTimeline');
    timeline.innerHTML = '';
    if (Array.isArray(shipment.history)) {
        shipment.history.forEach(event => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${event.status}</strong><br><small>${new Date(event.timestamp).toLocaleString()}</small>`;
            timeline.appendChild(li);
        });
    }

    const modalActions = document.getElementById('modalActions');
    modalActions.innerHTML = '';

    // Add action buttons based on current status
    if (shipment.status === 'Approved') {
        const btn = document.createElement('button');
        btn.textContent = 'Start Processing & Assign RFID';
        btn.onclick = () => assignRfid(shipment._id);
        modalActions.appendChild(btn);
    } else if (shipment.status === 'Processing') {
        const btn = document.createElement('button');
        btn.textContent = 'Mark as In Transit';
        btn.onclick = () => updateShipmentStatus(shipment._id, 'In Transit');
        modalActions.appendChild(btn);
    } else if (shipment.status === 'In Transit') {
        const btn = document.createElement('button');
        btn.textContent = 'Mark as Delivered';
        btn.onclick = () => updateShipmentStatus(shipment._id, 'Delivered');
        modalActions.appendChild(btn);
    }

    document.getElementById('detailsModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

// --- CHANGED: Now sends RFID and status update to the server API ---
async function assignRfid(shipmentId) {
    showRfidModal("Waiting for RFID Card...", "Please scan your RFID tag on the reader.");
    const token = localStorage.getItem("token");
    try {
        // Step 1: Ask the hardware to scan an RFID tag
        const rfidResponse = await fetch("http://localhost:3000/api/rfid/assign", { method: "POST" });
        const rfidData = await rfidResponse.json();

        if (!rfidData.success) {
            throw new Error(rfidData.message || "Failed to get RFID from scanner.");
        }
        
        showRfidModal("Assigning Tag...", `Assigning RFID tag ${rfidData.rfid} to shipment...`);

        // Step 2: Send the scanned RFID to update the shipment in the database
        const updateResponse = await fetch(`http://localhost:3000/shipments/${shipmentId}/rfid`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rfidTag: rfidData.rfid })
        });
        
        const updateResult = await updateResponse.json();
        hideRfidModal();

        if (!updateResponse.ok) {
            throw new Error(updateResult.message);
        }

        alert(updateResult.message);
        renderAllShipments();
        closeModal();

    } catch (err) {
        hideRfidModal();
        alert("Error: " + err.message);
    }
}

// --- CHANGED: Sends status update to the server API ---
async function updateShipmentStatus(shipmentId, newStatus) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`http://localhost:3000/shipments/${shipmentId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message);
        }
        
        alert(`Shipment status updated to ${newStatus}.`);
        closeModal();
        renderAllShipments();

    } catch (error) {
        console.error("Error updating status:", error);
        alert(`Failed to update status: ${error.message}`);
    }
}

// --- Utility functions for RFID modal ---
function showRfidModal(title, message) {
    let modal = document.getElementById("rfidModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "rfidModal";
        modal.className = "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50";
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 text-center shadow-lg">
            <h2 class="text-lg font-semibold mb-2">${title}</h2>
            <p class="text-gray-600">${message}</p>
        </div>
    `;
}

function hideRfidModal() {
    const modal = document.getElementById("rfidModal");
    if (modal) modal.remove();
}