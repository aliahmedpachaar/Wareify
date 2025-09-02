<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Wareify | Product Details</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        /* --- CSS Variables for Consistency --- */
        :root {
            --primary-blue: #007bff;
            --dark-blue-bg: #1e3c72;
            --light-blue-bg: #2a5298;
            --text-color-dark: #333;
            --text-color-light: #f8f9fc;
            --card-bg: #ffffff;
            --border-color: #e0e0e0;
            --shadow-light: rgba(0, 0, 0, 0.08);
            --shadow-medium: rgba(0, 0, 0, 0.15);
            --error-red: #dc3545;
        }

        /* --- Base Body Styles --- */
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(to bottom right, var(--dark-blue-bg), var(--light-blue-bg));
            color: var(--text-color-light);
            padding: 20px;
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center; /* Center content vertically */
            box-sizing: border-box; /* Include padding in element's total width and height */
        }

        /* --- Header --- */
        h1 {
            font-family: 'Outfit', sans-serif;
            text-align: center;
            color: var(--text-color-light);
            margin-bottom: 40px;
            font-size: 3em;
            letter-spacing: -1px;
            text-shadow: 0 4px 10px rgba(0,0,0,0.4);
        }

        /* --- Product Details Container --- */
        .product-details-container {
            background-color: var(--card-bg);
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 10px 25px var(--shadow-medium);
            width: 100%;
            max-width: 700px;
            color: var(--text-color-dark);
            margin-bottom: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .product-details-container h2 {
            font-family: 'Outfit', sans-serif;
            color: var(--primary-blue);
            font-size: 2.5em;
            margin-bottom: 20px;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 15px;
            width: 100%;
        }

        .product-image {
            width: 100%;
            max-width: 300px; /* Limit image size */
            height: auto;
            border-radius: 12px;
            margin-bottom: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            object-fit: cover; /* Ensure image covers the area */
        }

        .detail-item {
            display: flex;
            justify-content: space-between;
            width: 100%;
            padding: 10px 0;
            border-bottom: 1px dashed #eee;
        }

        .detail-item:last-child {
            border-bottom: none;
        }

        .detail-item strong {
            color: #555;
            font-weight: 600;
            flex-basis: 40%; /* Adjust label width */
            text-align: left;
        }

        .detail-item span {
            flex-basis: 60%; /* Adjust value width */
            text-align: right;
            color: var(--text-color-dark);
        }

        .detail-item.description {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
        }

        .detail-item.description span {
            margin-top: 10px;
            width: 100%;
            text-align: left;
        }

        #loadingMessage, #errorMessage {
            color: var(--text-color-light);
            font-size: 1.2em;
            margin-top: 50px;
            text-align: center;
        }

        #errorMessage {
            color: var(--error-red);
        }

        /* --- Responsive Adjustments --- */
        @media (max-width: 768px) {
            h1 {
                font-size: 2.5em;
                margin-bottom: 30px;
            }
            .product-details-container {
                padding: 25px;
                border-radius: 14px;
                max-width: 90%;
            }
            .product-details-container h2 {
                font-size: 2em;
            }
            .detail-item {
                flex-direction: column;
                align-items: flex-start;
                padding: 8px 0;
            }
            .detail-item strong, .detail-item span {
                flex-basis: 100%;
                text-align: left;
            }
            .detail-item strong {
                margin-bottom: 5px;
            }
        }

        @media (max-width: 480px) {
            body {
                padding: 15px;
            }
            h1 {
                font-size: 2em;
                margin-bottom: 25px;
            }
            .product-details-container {
                padding: 20px;
                border-radius: 12px;
            }
            .product-details-container h2 {
                font-size: 1.8em;
            }
        }
    </style>
</head>
<body>

    <h1>🔍 Product Details (From Blockchain)</h1>

    <div id="loadingMessage">Loading product details from blockchain...</div>
    <div id="errorMessage" style="display: none;"></div>

    <div id="productDetails" class="product-details-container" style="display: none;">
        <img id="productImage" class="product-image" alt="Product Image" style="display: none;">
        <h2 id="productName"></h2>
        <div class="detail-item">
            <strong>Category:</strong> <span id="productCategory"></span>
        </div>
        <div class="detail-item">
            <strong>Price:</strong> RM<span id="productPrice"></span>
        </div>
        <div class="detail-item">
            <strong>Stock:</strong> <span id="productStock"></span>
        </div>
        <div class="detail-item description">
            <strong>Description:</strong> <span id="productDescription"></span>
        </div>
        <div class="detail-item">
            <strong>Manufacturer:</strong> <span id="productManufacturer"></span>
        </div>
        <div class="detail-item">
            <strong>Manufactured At:</strong> <span id="productManufacturedAt"></span>
        </div>
        <div class="detail-item">
            <strong>Selling Location:</strong> <span id="productSellingLocation"></span>
        </div>
        <div class="detail-item">
            <strong>Batch Number:</strong> <span id="productBatchNo"></span>
        </div>
        <div class="detail-item">
            <strong>Added On (Blockchain):</strong> <span id="productTimestamp"></span>
        </div>
        <div class="detail-item">
            <strong>Product ID (Blockchain):</strong> <span id="productDbId"></span>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');

            const loadingMessage = document.getElementById('loadingMessage');
            const errorMessage = document.getElementById('errorMessage');
            const productDetailsContainer = document.getElementById('productDetails');
            const productImage = document.getElementById('productImage');

            if (!productId) {
                loadingMessage.style.display = 'none';
                errorMessage.textContent = 'Product ID not found in URL.';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                // MODIFIED: Fetch product details from the local backend endpoint
                const response = await fetch(`http://localhost:3000/blockchain/product/${productId}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch product details from blockchain.');
                }

                const product = await response.json(); // This 'product' object is now from the blockchain

                loadingMessage.style.display = 'none'; // Hide loading message

                // Populate the HTML elements with product data from the blockchain
                // Note: Use 'imageUrl' from blockchain data, 'savedAt' for timestamp
                document.getElementById('productName').textContent = product.name || 'N/A';
                document.getElementById('productCategory').textContent = product.category || 'N/A';
                document.getElementById('productPrice').textContent = product.price ? product.price.toFixed(2) : '0.00';
                document.getElementById('productStock').textContent = product.stock || 'N/A';
                document.getElementById('productDescription').textContent = product.description || 'N/A';
                document.getElementById('productManufacturer').textContent = product.manufacturer || 'N/A';
                document.getElementById('productManufacturedAt').textContent = product.manufacturedAt ? new Date(product.manufacturedAt).toLocaleDateString() : 'N/A';
                document.getElementById('productSellingLocation').textContent = product.sellingLocation || 'N/A';
                document.getElementById('productBatchNo').textContent = product.batchNo || 'N/A';
                document.getElementById('productTimestamp').textContent = product.savedAt ? new Date(product.savedAt).toLocaleString() : 'N/A'; // Use savedAt
                document.getElementById('productDbId').textContent = product.productId || 'N/A'; // Use productId from blockchain

                if (product.imageUrl) { // Use imageUrl from blockchain data
                    // MODIFIED: Use localhost URL for image source
                    productImage.src = `http://localhost:3000${product.imageUrl}`;
                    productImage.style.display = 'block';
                    productImage.onerror = () => {
                        console.error('Failed to load product image from blockchain data:', productImage.src);
                        productImage.style.display = 'none'; // Hide if image fails to load
                    };
                } else {
                    productImage.style.display = 'none';
                }

                productDetailsContainer.style.display = 'flex'; // Show details container

            } catch (error) {
                console.error('Error fetching product details:', error);
                loadingMessage.style.display = 'none';
                errorMessage.textContent = `An error occurred: ${error.message}. Could not load product details from blockchain.`;
                errorMessage.style.display = 'block';
            }
        });
    </script>
</body>
</html>
