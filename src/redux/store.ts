import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import rootReducer from "./rootReducer";

// Import all API services
import { usersApi } from "@/redux/features/users/usersApi";
import { partnerProfilesApi } from "@/redux/features/partnerProfiles/partnerProfilesApi";
import { panelsApi } from "@/redux/features/panels/panelsApi";
import { uploadsApi } from "@/redux/features/uploads/uploadsApi";
import { productCategoriesApi } from "@/redux/features/productCategories/productCategoriesApi";
import { markersApi } from "@/redux/features/markers/markersApi";
import { patientMarkerValuesApi } from "@/redux/features/patientMarkerValues/patientMarkerValuesApi";
import { pdfReportsApi } from "@/redux/features/pdfReports/pdfReportsApi";
import { adminProductsApi } from "@/redux/features/adminProducts/adminProductsApi";
import { partnerProductsApi } from "@/redux/features/partnerProducts/partnerProductsApi";
import { ordersApi } from "@/redux/features/orders/ordersApi";
import { orderItemsApi } from "@/redux/features/orderItems/orderItemsApi";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      usersApi.middleware,
      partnerProfilesApi.middleware,
      panelsApi.middleware,
      uploadsApi.middleware,
      productCategoriesApi.middleware,
      markersApi.middleware,
      patientMarkerValuesApi.middleware,
      pdfReportsApi.middleware,
      adminProductsApi.middleware,
      partnerProductsApi.middleware,
      ordersApi.middleware,
      orderItemsApi.middleware
    ),
  devTools: process.env.NODE_ENV !== "production",
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
