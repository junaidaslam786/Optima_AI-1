import { createSlice } from "@reduxjs/toolkit";

interface UserConsentsState {
    isCookieBannerVisible: boolean;
    hasInteractedWithCookieBanner: boolean;
}

const initialState: UserConsentsState = {
    isCookieBannerVisible: true,
    hasInteractedWithCookieBanner: false,
};

const userConsentsSlice = createSlice({
    name: "userConsents",
    initialState,
    reducers: {
        showCookieBanner: (state) => {
            state.isCookieBannerVisible = true;
        },
        hideCookieBanner: (state) => {
            state.isCookieBannerVisible = false;
            state.hasInteractedWithCookieBanner = true;
        },
    },
});

export const { showCookieBanner, hideCookieBanner } = userConsentsSlice.actions;

export default userConsentsSlice.reducer;
