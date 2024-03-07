import express from 'express';
import * as ctrl from '../controllers/mainController.js';
import * as auth from '../controllers/authController.js';

const router = express.Router();

// Define routes
router.get('/login', auth.login);
router.post('/login', auth.verifyLogin);
router.get('/register', auth.register);
router.post('/register', auth.verifyRegister);
router.get('/logout', auth.logout);

router.get('/', auth.isAuthenticated, ctrl.home);
router.post('/api/products', auth.isAuthenticated, ctrl.getProducts);
router.post('/addToCart', auth.isAuthenticated, ctrl.addToCart);
router.post('/updateCart', auth.isAuthenticated, ctrl.updateCart);
router.get('/cart', auth.isAuthenticated, ctrl.viewCart);
router.get('/api/cart', auth.isAuthenticated, ctrl.getCart);


router.get('/clearCart', auth.isAuthenticated, ctrl.clearCart);
router.post('/purchase', auth.isAuthenticated, ctrl.purchase);
router.get('/customer', auth.isAuthenticated, ctrl.customer);
router.get('/info/:id', auth.isAuthenticated, ctrl.info);

export default router;