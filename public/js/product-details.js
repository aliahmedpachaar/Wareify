// public/js/product-details.js

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const productDetailsContainer = document.getElementById('productDetails');

    if (!productId) {
        loadingMessage.style.display = 'none';
        errorMessage.textContent = 'Product ID not found in URL.';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/blockchain/product/${productId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch details from blockchain.');
        }
        const product = await response.json();
        
        loadingMessage.style.display = 'none';

        // Populate the HTML elements
        document.getElementById('productName').textContent = product.name || 'N/A';
        document.getElementById('productCategory').textContent = product.category || 'N/A';
        document.getElementById('productPrice').textContent = product.price ? Number(product.price).toFixed(2) : '0.00';
        document.getElementById('productStock').textContent = product.stock || 'N/A';
        document.getElementById('productDescription').textContent = product.description || 'N/A';
        document.getElementById('productManufacturer').textContent = product.manufacturer || 'N/A';
        document.getElementById('productManufacturedAt').textContent = product.manufacturedAt ? new Date(product.manufacturedAt).toLocaleDateString() : 'N/A';
        document.getElementById('productSellingLocation').textContent = product.sellingLocation || 'N/A';
        document.getElementById('productBatchNo').textContent = product.batchNo || 'N/A';
        document.getElementById('productTimestamp').textContent = product.savedAt ? new Date(product.savedAt).toLocaleString() : 'N/A';
        document.getElementById('productDbId').textContent = product.productId || 'N/A';

        const productImage = document.getElementById('productImage');
        if (product.imageUrl) {
            productImage.src = `http://localhost:3000${product.imageUrl}`;
            productImage.style.display = 'block';
        } else {
            productImage.style.display = 'none';
        }

        productDetailsContainer.style.display = 'flex';

    } catch (error) {
        console.error('Error fetching product details:', error);
        loadingMessage.style.display = 'none';
        errorMessage.textContent = `Error: ${error.message}`;
        errorMessage.style.display = 'block';
    }
});