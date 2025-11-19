import api from './api';

export const fetchProducts = () => api.get('/products');

export default { fetchProducts };
