import { createSlice } from '@reduxjs/toolkit';

const orderSlice = createSlice({
  name: 'orders',
  initialState: { list: [] },
  reducers: {},
});

export default orderSlice.reducer;
