document.getElementById('searchInput').addEventListener('input', updateProducts);

//priceValue
async function updateProducts() {
  try {
    const name = document.getElementById('searchInput').value;

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (response.ok) {
      const products = await response.json();
      const container = document.getElementById('productsList');
      container.innerHTML = '';
      products.forEach(product => {
        const productElement = `
            <div>
              <p><strong>${product.name}</strong></p>
              <p>${product.description}</p>
              <p>$${product.price}</p>
              <p>${product.stock} available</p>
              <p><img src="/images/${product.image}" height="200" " width="300"></p>
              <form class="mt-3" action="/addToCart" method="POST">
                <label for="quantity-${product.name}">Quantity:</label>
                <input type="number" id="quantity-${product.name}" name="quantity" value="1" min="1" max="${product.stock}">
                <input type="hidden" name="productId" value="${product._id}">
                <button type="submit">Add to Cart</button>
              </form>

        `;
        container.innerHTML += productElement;
      });
    } else {
      console.error('Response not ok with status:', response.status);
    }
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

async function getCart() {

try{
  const response = await fetch('/api/cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
      
 if (response.ok) {
      const cart = await response.json();
      const link = document.getElementById('cart');
      link.innerHTML = 'Cart (' + cart.totalQuantity + '):';
     
 }
    
    
} catch (error) {
    console.error('Fetch error:', error.message);
  }
}


updateProducts();
getCart();
