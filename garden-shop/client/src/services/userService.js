import api from './api';

export const fetchUser = () => api.get('/users/me');

export default { fetchUser };
