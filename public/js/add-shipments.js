// add-shipments.js (REVISED)

document.addEventListener("DOMContentLoaded", async function() {
    const itemSelect = document.getElementById("itemSelect");
    const shipmentForm = document.getElementById("shipmentForm");
    const submitButton = shipmentForm.querySelector("button[type='submit']");
    const token = localStorage.getItem("token");

    // --- CHANGED: This function now fetches live data from your database ---
    async function loadProductsForDropdown() {
        if (!token) {
            alert("Authentication error. Please log in again.");
            window.location.href = "login.html";
            return;
        }

        try {
            // Fetch the product list from your server's API
            const response = await fetch("http://localhost:3000/products", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch products from the server.");
            }

            const products = await response.json();
            itemSelect.innerHTML = ''; // Clear any old options

            if (products.length === 0) {
                const option = document.createElement("option");
                option.textContent = "No products available in the database to ship.";
                option.disabled = true;
                option.selected = true;
                itemSelect.appendChild(option);
                submitButton.disabled = true;
            } else {
                products.forEach(product => {
                    const option = document.createElement("option");
                    // Use the unique _id from MongoDB as the value
                    option.value = product._id;
                    option.textContent = `${product.name} (In Stock: ${product.stock})`;
                    itemSelect.appendChild(option);
                });
                submitButton.disabled = false;
            }

        } catch (error) {
            console.error("Error loading products:", error);
            alert("Could not load the product list. Please ensure the server is running.");
            submitButton.disabled = true;
        }
    }

    // Load the fresh product list as soon as the page is ready
    await loadProductsForDropdown();

    // --- CHANGED: This now sends the new shipment to your server/database ---
    shipmentForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const shipmentData = {
            itemId: itemSelect.value,
            quantity: document.getElementById("quantity").value,
            recipient: document.getElementById("recipient").value,
            address: document.getElementById("address").value
        };

        // Check if a valid item is selected
        if (!shipmentData.itemId) {
            alert("Please select a valid item from the list.");
            return;
        }

        try {
            // Send the new shipment data to your server's API
            const response = await fetch("http://localhost:3000/shipments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(shipmentData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Shipment created successfully and saved to the database!");
                shipmentForm.reset();
            } else {
                throw new Error(result.message || "Failed to create shipment.");
            }

        } catch (error) {
            console.error("Error creating shipment:", error);
            alert(`Error: ${error.message}`);
        }
    });
});