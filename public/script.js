// Dynamically link the CSS file
const linkElement = document.createElement('link');
linkElement.rel = 'stylesheet';
linkElement.href = 'styles.css';
document.head.appendChild(linkElement);

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
        
        let min = 0;
        let max = 0;
        
        
      products.forEach(product => {
        const productElement = `
          <div class="productContainer">
            <p><img class="productImage" src="/images/${product.image}" alt="${product.name}"></p>
            <a href="/info/${product._id}" class="productName">${product.name}</a>


            <p class="productDescription">${product.description}</p>
            <p class="productPrice">$${product.price}</p>
            <p class="productStock">${product.stock} available</p>

<div class="inner-container">
            <form class="quantity" action="/addToCart" method="POST">
              <label for="quantity-${product.name}">Quantity:</label>
              <input type="number" id="quantity-${product.name}" name="quantity" value="1" min="1" max="${product.stock}">
              <input type="hidden" name="productId" value="${product._id}">
              <button type="submit" class="addToCartButton">Add to Cart</button>
            </form>

</div>

          </div>
        `;
          
          
          
        container.innerHTML += productElement;
          
          if (min == 0 || product.price < min) {
  min = product.price;
}
          if (max == 0 || product.price > max) {
  max = product.price;
}
      });
        
        

        
        priceSlider.noUiSlider.updateOptions({
    range: {
        'min': min,
        'max': max
    }
});
        
        
    } else {
      console.error('Response not ok with status:', response.status);
    }
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

async function getCart() {
  try {
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

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.querySelector("button");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
function openModal() {
    modal.style.display = "block";
}

// Function to close modal
function closeModal() {
    modal.style.display = "none";
}


var priceSlider = document.getElementById('priceSlider');

noUiSlider.create(priceSlider, {
    start: [0, 1000], // Initial values
    connect: true,
    range: {
        'min': 0,
        'max': 1000
    }
});

// Display initial values
var minPriceDisplay = document.getElementById('minPriceDisplay');
var maxPriceDisplay = document.getElementById('maxPriceDisplay');

priceSlider.noUiSlider.on('update', function (values, handle) {
    if (handle == 0) {
        minPriceDisplay.innerHTML = "$" + values[0];
    }
    if (handle == 1) {
        maxPriceDisplay.innerHTML = "$" + values[1];
    }
});

// Function to filter products
function filterByPrice() {
    var range = priceSlider.noUiSlider.get();
    var minPrice = parseFloat(range[0]);
    var maxPrice = parseFloat(range[1]);

    // Logic to filter products based on price
    var products = document.getElementsByClassName("product");
    for (var i = 0; i < products.length; i++) {
        var productPrice = parseFloat(products[i].getAttribute("data-price"));
        if (productPrice >= minPrice && productPrice <= maxPrice) {
            products[i].style.display = "block";
        } else {
            products[i].style.display = "none";
        }
    }
}