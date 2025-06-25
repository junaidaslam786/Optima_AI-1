import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PartnerProfilesState {
  // Example for UI state, e.g., for filtering or current partner selected
  filterStatus: "all" | "pending" | "approved" | "rejected";
}

const initialState: PartnerProfilesState = {
  filterStatus: "all",
};

const partnerProfilesSlice = createSlice({
  name: "partnerProfiles",
  initialState,
  reducers: {
    setFilterStatus: (
      state,
      action: PayloadAction<PartnerProfilesState["filterStatus"]>
    ) => {
      state.filterStatus = action.payload;
    },
  },
});

export const { setFilterStatus } = partnerProfilesSlice.actions;
export default partnerProfilesSlice.reducer;
