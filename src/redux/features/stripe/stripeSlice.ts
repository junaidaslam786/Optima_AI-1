import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StripeState {
    currentClientSecret: string | null;
    currentPaymentStatus: string | null;
    paymentError: string | null;
}

const initialState: StripeState = {
    currentClientSecret: null,
    currentPaymentStatus: null,
    paymentError: null,
};

const stripeSlice = createSlice({
    name: "stripe",
    initialState,
    reducers: {
        setPaymentIntentDetails: (
            state,
            action: PayloadAction<{
                clientSecret: string | null;
                paymentStatus: string;
                error?: string | null;
            }>,
        ) => {
            state.currentClientSecret = action.payload.clientSecret;
            state.currentPaymentStatus = action.payload.paymentStatus;
            state.paymentError = action.payload.error || null;
        },
        clearPaymentIntentDetails: (state) => {
            state.currentClientSecret = null;
            state.currentPaymentStatus = null;
            state.paymentError = null;
        },
    },
});

export const { setPaymentIntentDetails, clearPaymentIntentDetails } =
    stripeSlice.actions;
export default stripeSlice.reducer;
