import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { current: null },
  reducers: {},
});

export default userSlice.reducer;
