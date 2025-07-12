import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TransactionsState {
    selectedTransactionId: string | null;
}

const initialState: TransactionsState = {
    selectedTransactionId: null,
};

const transactionsSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {
        setSelectedTransactionId: (
            state,
            action: PayloadAction<string | null>,
        ) => {
            state.selectedTransactionId = action.payload;
        },
    },
});

export const { setSelectedTransactionId } = transactionsSlice.actions;
export default transactionsSlice.reducer;
