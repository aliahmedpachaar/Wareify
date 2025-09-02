// js/pending-shipments.js (REVISED)

document.addEventListener('DOMContentLoaded', () => {
    // --- CHANGED: Now fetches data from the server on page load ---
    renderPendingShipments();
});

async function renderPendingShipments() {
    const pendingBody = document.getElementById("pendingBody");
    const noPending = document.getElementById("noPending");
    const pendingTable = document.getElementById("pendingTable");
    const token = localStorage.getItem("token");

    pendingBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>'; // Show loading state

    if (!token) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = 'login.html';
        return;
    }

    try {
        // --- NEW: Fetch all shipments from the database ---
        const response = await fetch('http://localhost:3000/shipments', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // This is where your original error came from!
            throw new Error('Failed to fetch shipments. Are you logged in as admin?');
        }

        const shipments = await response.json();
        
        // Filter for only "Pending" shipments
        const pendingShipments = shipments.filter(s => s.status === "Pending");
        
        pendingBody.innerHTML = ''; // Clear table for new data

        if (pendingShipments.length === 0) {
            noPending.style.display = "block";
            pendingTable.style.display = "none";
            return;
        }

        noPending.style.display = "none";
        pendingTable.style.display = "table";

        pendingShipments.forEach(shipment => {
            const row = document.createElement("tr");

            // --- CHANGED: Using shipment._id from MongoDB ---
            row.innerHTML = `
                <td>${shipment.itemName}</td>
                <td>${shipment.recipient}</td>
                <td>${shipment.address}</td>
                <td><span class="status-badge status-pending">${shipment.status}</span></td>
                <td></td>
            `;

            const approveBtn = document.createElement("button");
            approveBtn.className = "action-btn approve-btn";
            approveBtn.textContent = "Approve";
            approveBtn.addEventListener("click", () => {
                updateShipmentStatus(shipment._id, "Approved");
            });

            const cancelBtn = document.createElement("button");
            cancelBtn.className = "action-btn cancel-btn";
            cancelBtn.textContent = "Cancel";
            cancelBtn.addEventListener("click", () => {
                updateShipmentStatus(shipment._id, "Cancelled");
            });

            const actionCell = row.querySelector("td:last-child");
            actionCell.appendChild(approveBtn);
            actionCell.appendChild(cancelBtn);

            pendingBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error rendering pending shipments:", error);
        pendingBody.innerHTML = `<tr><td colspan="5" style="color: red;">Error: ${error.message}</td></tr>`;
        noPending.style.display = "none";
        pendingTable.style.display = "table";
    }
}

// --- CHANGED: This function now sends updates to the server ---
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
            throw new Error(result.message || 'Failed to update status.');
        }

        alert(`Shipment has been ${newStatus.toLowerCase()}.`);
        
        // Re-render the table to show the change
        renderPendingShipments();

    } catch (error) {
        console.error('Error updating shipment status:', error);
        alert(`Error: ${error.message}`);
    }
}