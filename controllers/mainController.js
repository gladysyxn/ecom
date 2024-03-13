import Customer from '../models/Customer.js';
import Product from '../models/Product.js';

export const home = async (req, res) => {
  res.render('index');
};

export const getProducts = async (req, res) => {
  const { name, minPrice, maxPrice, category } = req.body;
  let query = {};

  if (name) {
    query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
  }
   if (minPrice && maxPrice) 
query.price = { $gte: minPrice, $lte: maxPrice } ;
  console.log(query);
    if (category){
        query.category = { $regex: category, $options: 'i' };
    }
    
    try {
    const products = await Product.find(query).sort({price: -1});
    console.log(products);
    const categories = await Product.distinct('category').sort();   
    res.json({products, categories});
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send(error);
  }
};

export const addToCart = async (req, res) => {
  try {
    let { productId, quantity } = req.body;
    quantity = parseInt(quantity);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    const price = product.price;
  
    const userId = req.user._id;
    let customer = await Customer.findOne({ _id: userId });
    console.log(customer);
    if (!customer.cart) {
      customer.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
    } else {
      const itemIndex = customer.cart.items.findIndex(item => item.productId.toString() === productId);
        
        
      if (itemIndex > -1) {
    console.log(customer.cart.items[itemIndex].productId)  ; 
    if(customer.cart.items[itemIndex].quantity + quantity >   product.stock) {
        //TO DO: flash message
      console.log("beyond maximum quantity.");  
    }
      else{
        customer.cart.items[itemIndex].quantity += quantity;
        customer.cart.items[itemIndex].price = price; 
          }
      } else {
        customer.cart.items.push({ productId, quantity, price });
      }
      customer.cart.totalQuantity += quantity;
      customer.cart.totalPrice += price * quantity;
    }

    await customer.save();
    const populatedCustomer = await Customer.findOne({ _id: userId })
                                            .populate('cart.items.productId');
    res.render('index', {user: populatedCustomer});
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};

export const updateCart = async (req, res) =>{
    let { productId, quantity } = req.body;
    quantity = parseInt(quantity);
    const userId = req.user._id;
    try{
    
    
    let customer = await Customer.findOne({ _id: userId });
    console.log(customer);
    if (!customer.cart) {
      // TO DO: add back flash message 
        //customer.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
    } else {
      const itemIndex = customer.cart.items.findIndex(item => item.productId.toString() === productId);
        
    let oldQuantity = 0;
    let price = 0;
      if (itemIndex > -1) {
        oldQuantity = customer.cart.items[itemIndex].quantity;
        price = customer.cart.items[itemIndex].price;
        customer.cart.items[itemIndex].quantity = quantity;
      } else {
      }
      customer.cart.totalQuantity += quantity - oldQuantity;
      customer.cart.totalPrice += price * quantity - price * oldQuantity;
    }
        
 await customer.save();
    const populatedCustomer = await Customer.findOne({ _id: userId })
                                            .populate('cart.items.productId');
    res.render('cart', {user: populatedCustomer});
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};
    


export const viewCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let customer = await Customer.findOne({ _id: userId });
    console.log(customer);
    if (!customer.cart) {
      customer.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
    }  
    const populatedCustomer = await Customer.findOne({ _id: userId })
                                            .populate('cart.items.productId');
    res.render('cart', {user: populatedCustomer});
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};




export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let customer = await Customer.findOne({ _id: userId });
    console.log(customer);
    if (!customer.cart) {
      customer.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
    }  
    const populatedCustomer = await Customer.findOne({ _id: userId })
                                            .populate('cart.items.productId');  
    res.json(populatedCustomer.cart); // Send back JSON response
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send(error);
  }
};

export const clearCart = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.user });
    customer.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
    customer.save();
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
}

export const purchase = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.user }).populate('cart.items.productId');

    const cartItems = customer.cart.items;

    let quantities = {};
      
      
      
      
      
    cartItems.forEach(cartItem => {
      const { productId, quantity, price } = cartItem; 
      
      const itemIndex = customer.purchases.items.findIndex(purchaseItem =>  purchaseItem.productId._id.toString() === productId._id.toString());
      
      if (itemIndex > -1) {
        customer.purchases.items[itemIndex].quantity += quantity;
        customer.purchases.items[itemIndex].price = price;
      } else {
        customer.purchases.items.push({ productId: productId, quantity: quantity, price: price });
      }
      quantities[productId._id] = quantity;
      customer.purchases.totalQuantity += quantity;
      customer.purchases.totalPrice += price * quantity;
    });

    await customer.save();

      for (const productId of Object.keys(quantities)) {
      const product = await Product.findById(productId); 
                    
      product.stock -= quantities[productId];
      product.save();

    }
      
    req.flash('info', "Your order has been placed." );
      
    res.redirect('/clearCart'); 
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};3


export const customer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.user }).populate('purchases.items.productId');

    res.render('customer', {user: customer}); 
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
}
    

export const info = async (req, res) => {
  try {
    const productId = req.params.id;
      
      
      console.log(productId);
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).send('Product not found');
    }

    console.log(product);
    
    const recom = await Product.find({
      $and: [
        { category: product.category },
        { _id: { $ne: product._id } }
      ]
    }).sort({price: -1});
    // You can retrieve any other product-related details here
    
    res.render('info', { product, recom});
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};
