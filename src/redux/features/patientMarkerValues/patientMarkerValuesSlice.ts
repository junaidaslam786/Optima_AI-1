import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PatientMarkerValuesState {
  selectedPatientMarkerValueId: string | null;
}

const initialState: PatientMarkerValuesState = {
  selectedPatientMarkerValueId: null,
};

const patientMarkerValuesSlice = createSlice({
  name: "patientMarkerValues",
  initialState,
  reducers: {
    setSelectedPatientMarkerValueId: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.selectedPatientMarkerValueId = action.payload;
    },
  },
});

export const { setSelectedPatientMarkerValueId } =
  patientMarkerValuesSlice.actions;
export default patientMarkerValuesSlice.reducer;
