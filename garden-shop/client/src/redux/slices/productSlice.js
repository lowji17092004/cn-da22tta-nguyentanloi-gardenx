import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: { list: [] },
  reducers: {},
});

export default productSlice.reducer;
