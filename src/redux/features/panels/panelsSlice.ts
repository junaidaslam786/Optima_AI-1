import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PanelsState {
  selectedPanelId: string | null;
}

const initialState: PanelsState = {
  selectedPanelId: null,
};

const panelsSlice = createSlice({
  name: "panels",
  initialState,
  reducers: {
    // Add reducers for specific UI state related to panels, e.g.:
    setSelectedPanelId: (state, action: PayloadAction<string | null>) => {
      state.selectedPanelId = action.payload;
    },
  },
});

export const { setSelectedPanelId } = panelsSlice.actions;
export default panelsSlice.reducer;
