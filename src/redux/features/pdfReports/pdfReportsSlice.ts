import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PdfReportsState {
  selectedPdfReportId: string | null;
}

const initialState: PdfReportsState = {
  selectedPdfReportId: null,
};

const pdfReportsSlice = createSlice({
  name: "pdfReports",
  initialState,
  reducers: {
    setSelectedPdfReportId: (state, action: PayloadAction<string | null>) => {
      state.selectedPdfReportId = action.payload;
    },
  },
});

export const { setSelectedPdfReportId } = pdfReportsSlice.actions;
export default pdfReportsSlice.reducer;
