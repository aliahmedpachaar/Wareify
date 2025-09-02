// Function to handle theme toggle (copied from dashboard.html for consistency)
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

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
        console.warn("Access denied. You must be an admin to add products.");
        window.location.href = "login.html";
        return;
    }

    setupThemeToggle();

    // Event listener for logout button
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

    const addProductForm = document.getElementById('addProductForm');
    const messageBox = document.getElementById('messageBox');
    const qrCodeDisplay = document.getElementById('qrCodeDisplay');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const downloadQrButton = document.getElementById('downloadQrButton');
    const addAnotherProductButton = document.getElementById('addAnotherProductButton');

    // Function to display messages
    function showMessage(message, isError = false) {
        messageBox.textContent = message;
        messageBox.className = isError ? 'message-box error' : 'message-box success';
        messageBox.style.display = 'block';
    }

    function hideMessage() {
        messageBox.style.display = 'none';
    }

    // ✅ AI Autofill: when image is uploaded
   // add-item.js (Corrected code)
const imageInput = document.getElementById("productImage");
imageInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("http://localhost:3000/api/analyze-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("AI Response:", data);

    if (data.caption && data.productName) {
      // ✅ FIX: Use the data directly from the backend
      document.getElementById("description").value = data.caption;
      document.getElementById("name").value = data.productName;

      // --- Your category and other logic can remain the same ---
      const lc = data.caption.toLowerCase(); // Use full caption for category context
      if (lc.includes("bottle") || lc.includes("drink")) {
        document.getElementById("category").value = "Beverage";
      } else if (lc.includes("box")) {
        document.getElementById("category").value = "Packaged Goods";
      } else if (
        lc.includes("shirt") || lc.includes("t-shirt") || lc.includes("dress") || lc.includes("pants")
      ) {
        document.getElementById("category").value = "Clothing";
      } else if (lc.includes("glasses") || lc.includes("spectacles")) {
        document.getElementById("category").value = "Optics";
      } else {
        document.getElementById("category").value = "General";
      }

      // --- Manufacturer guess ---
      if (lc.includes("coca cola")) {
        document.getElementById("manufacturer").value = "Coca Cola";
      } else if (lc.includes("pepsi")) {
        document.getElementById("manufacturer").value = "PepsiCo";
      }

      // --- Default manufactured date = today ---
      document.getElementById("manufacturedAt").value = new Date().toISOString().split("T")[0];
    }
  } catch (err) {
    console.error("Error analyzing image:", err);
  }
});

    // ✅ Form submit logic (same as before)
    addProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        hideMessage();
        qrCodeDisplay.style.display = 'none';

        const formData = new FormData(addProductForm);

        try {
            const res = await fetch('http://localhost:3000/products', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                body: formData
            });

            const result = await res.json();
            console.log('Backend response:', result);

            if (res.ok) {
                showMessage('Product added successfully!', false);

                const localItems = JSON.parse(localStorage.getItem("items")) || [];
                localItems.push({
                    id: result.product._id,
                    name: result.product.name,
                    category: result.product.category
                });
                localStorage.setItem("items", JSON.stringify(localItems));
                addProductForm.reset();

                if (result.product && result.product._id) {
                    const productId = result.product._id;
                    const publicProductDetailsUrl = `http://localhost:3000/product-details.html?id=${productId}`;

                    qrCodeContainer.innerHTML = '';

                    if (typeof QRCode !== 'undefined') {
                        new QRCode(qrCodeContainer, {
                            text: publicProductDetailsUrl,
                            width: 200,
                            height: 200,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                    } else {
                        console.error('QRCode library is not defined.');
                        showMessage('Product added, but QR code library issue.', true);
                    }

                    qrCodeDisplay.style.display = 'flex';

                    downloadQrButton.onclick = () => {
                        const qrCodeCanvas = qrCodeContainer.querySelector('canvas');
                        if (qrCodeCanvas) {
                            const dataURL = qrCodeCanvas.toDataURL("image/png");
                            const link = document.createElement('a');
                            link.href = dataURL;
                            link.download = `wareify_product_${productId}_qr.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        } else {
                            showMessage('QR Code not generated, cannot download.', true);
                        }
                    };

                    addAnotherProductButton.onclick = () => {
                        addProductForm.reset();
                        hideMessage();
                        qrCodeDisplay.style.display = 'none';
                        qrCodeContainer.innerHTML = '';
                    };
                } else {
                    showMessage('Product added, but QR code could not be generated.', true);
                    console.error('Backend response missing product._id:', result);
                }
            } else {
                showMessage(`Error: ${result.message || 'Failed to add product.'}`, true);
                console.error('Backend returned an error:', result);
            }
        } catch (error) {
            console.error('Frontend caught an error:', error);
            showMessage(`An error occurred: ${error.message}`, true);
        }
    });
});
