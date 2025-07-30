import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    forgotPasswordStatus: "idle" | "loading" | "succeeded" | "failed";
    forgotPasswordMessage: string | null;
    changePasswordStatus: "idle" | "loading" | "succeeded" | "failed";
    changePasswordMessage: string | null;
}

const initialState: AuthState = {
    forgotPasswordStatus: "idle",
    forgotPasswordMessage: null,
    changePasswordStatus: "idle",
    changePasswordMessage: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setForgotPasswordStatus: (
            state,
            action: PayloadAction<typeof initialState["forgotPasswordStatus"]>,
        ) => {
            state.forgotPasswordStatus = action.payload;
        },
        setForgotPasswordMessage: (
            state,
            action: PayloadAction<string | null>,
        ) => {
            state.forgotPasswordMessage = action.payload;
        },
        resetForgotPasswordState: (state) => {
            state.forgotPasswordStatus = "idle";
            state.forgotPasswordMessage = null;
        },
        setChangePasswordStatus: (
            state,
            action: PayloadAction<typeof initialState["changePasswordStatus"]>,
        ) => {
            state.changePasswordStatus = action.payload;
        },
        setChangePasswordMessage: (
            state,
            action: PayloadAction<string | null>,
        ) => {
            state.changePasswordMessage = action.payload;
        },
        resetChangePasswordState: (state) => {
            state.changePasswordStatus = "idle";
            state.changePasswordMessage = null;
        },
    },
});

export const {
    setForgotPasswordStatus,
    setForgotPasswordMessage,
    resetForgotPasswordState,
    setChangePasswordStatus,
    setChangePasswordMessage,
    resetChangePasswordState,
} = authSlice.actions;

export default authSlice.reducer;
