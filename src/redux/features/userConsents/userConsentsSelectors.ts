import { RootState } from "@/redux/store";

export const selectIsCookieBannerVisible = (state: RootState) =>
  state.userConsentsUI.isCookieBannerVisible;

export const selectHasInteractedWithCookieBanner = (state: RootState) =>
  state.userConsentsUI.hasInteractedWithCookieBanner;