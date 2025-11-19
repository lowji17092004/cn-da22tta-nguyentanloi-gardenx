import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';

export default configureStore({
  reducer: {
    products: productReducer,
    user: userReducer,
    cart: cartReducer,
    orders: orderReducer,
  },
});
