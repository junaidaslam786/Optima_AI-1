import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MarkersState {
  selectedMarkerId: string | null;
}

const initialState: MarkersState = {
  selectedMarkerId: null
};

const markersSlice = createSlice({
  name: 'markers',
  initialState,
  reducers: {
   setSelectedMarkerId: (state, action: PayloadAction<string | null>) => {
      state.selectedMarkerId = action.payload;
    },
  },
});

export const { setSelectedMarkerId } = markersSlice.actions;
export default markersSlice.reducer;