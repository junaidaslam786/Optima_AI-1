import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UploadsState {
  selectedUploadId: string | null;
}

const initialState: UploadsState = {
  selectedUploadId: null,
};

const uploadsSlice = createSlice({
  name: "uploads",
  initialState,
  reducers: {
    setSelectedUploadId: (state, action: PayloadAction<string | null>) => {
      state.selectedUploadId = action.payload;
    },
  },
});

export const { setSelectedUploadId } = uploadsSlice.actions;
export default uploadsSlice.reducer;
