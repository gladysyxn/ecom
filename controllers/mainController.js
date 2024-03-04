import Customer from '../models/Customer.js';
import Product from '../models/Product.js';

export const home = async (req, res) => {
  res.render('index');
};

export const getProducts = async (req, res) => {
  const { name } = req.body;
  let query = {};

  if (name) {
    query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
  }

  try {
    const products = await Product.find(query).sort({price: -1});
    res.json(products); // Send back JSON response
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
    res.render('cart', {user: populatedCustomer});
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
    
    
    