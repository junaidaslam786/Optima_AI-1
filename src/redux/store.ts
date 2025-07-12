import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import rootReducer from "./rootReducer";
import { adminProductsApi } from "./features/adminProducts/adminProductsApi";
import { categoriesApi } from "./features/categories/categoriesApi";
import { cartsApi } from "./features/carts/cartsApi";
import { cartItemsApi } from "./features/cartItems/cartItemsApi";
import { markersApi } from "./features/markers/markersApi";
import { orderItemsApi } from "./features/orderItems/orderItemsApi";
import { ordersApi } from "./features/orders/ordersApi";
import { panelsApi } from "./features/panels/panelsApi";
import { partnerProductsApi } from "./features/partnerProducts/partnerProductsApi";
import { partnerProfilesApi } from "./features/partnerProfiles/partnerProfilesApi";
import { patientMarkerValuesApi } from "./features/patientMarkerValues/patientMarkerValuesApi";
import { pdfReportsApi } from "./features/pdfReports/pdfReportsApi";
import { shippingDetailsApi } from "./features/shippingDetails/shippingDetailsApi";
import { stripeApi } from "./features/stripe/stripeApi";
import { transactionsApi } from "./features/transactions/transactionsApi";
import { uploadsApi } from "./features/uploads/uploadsApi";
import { usersApi } from "./features/users/usersApi";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      adminProductsApi.middleware,
      categoriesApi.middleware,
      cartsApi.middleware,
      cartItemsApi.middleware,
      markersApi.middleware,
      orderItemsApi.middleware,
      ordersApi.middleware,
      panelsApi.middleware,
      partnerProductsApi.middleware,
      partnerProfilesApi.middleware,
      patientMarkerValuesApi.middleware,
      pdfReportsApi.middleware,
      shippingDetailsApi.middleware,
      stripeApi.middleware,
      transactionsApi.middleware,
      uploadsApi.middleware,
      usersApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
