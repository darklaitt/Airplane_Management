import { createSlice } from '@reduxjs/toolkit';

const planeSlice = createSlice({
  name: 'planes',
  initialState: {
    planes: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

export default planeSlice.reducer;