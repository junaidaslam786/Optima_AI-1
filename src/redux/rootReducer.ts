import { combineReducers } from "@reduxjs/toolkit";
import adminProductsReducer from "./features/adminProducts/adminProductsSlice";
import { adminProductsApi } from "./features/adminProducts/adminProductsApi";
import categoriesReducer from "./features/categories/categoriesSlice";
import { categoriesApi } from "./features/categories/categoriesApi";
import cartsReducer from "./features/carts/cartsSlice";
import { cartsApi } from "./features/carts/cartsApi";
import cartItemsReducer from "./features/cartItems/cartItemsSlice";
import { cartItemsApi } from "./features/cartItems/cartItemsApi";
import markersReducer from "./features/markers/markersSlice";
import { markersApi } from "./features/markers/markersApi";
import orderItemsReducer from "./features/orderItems/orderItemsSlice";
import { orderItemsApi } from "./features/orderItems/orderItemsApi";
import ordersReducer from "./features/orders/ordersSlice";
import { ordersApi } from "./features/orders/ordersApi";
import panelsReducer from "./features/panels/panelsSlice";
import { panelsApi } from "./features/panels/panelsApi";
import partnerProductsReducer from "./features/partnerProducts/partnerProductsSlice";
import { partnerProductsApi } from "./features/partnerProducts/partnerProductsApi";
import partnerProfilesReducer from "./features/partnerProfiles/partnerProfilesSlice";
import { partnerProfilesApi } from "./features/partnerProfiles/partnerProfilesApi";
import patientMarkerValuesReducer from "./features/patientMarkerValues/patientMarkerValuesSlice";
import { patientMarkerValuesApi } from "./features/patientMarkerValues/patientMarkerValuesApi";
import pdfReportsReducer from "./features/pdfReports/pdfReportsSlice";
import { pdfReportsApi } from "./features/pdfReports/pdfReportsApi";
import shippingDetailsReducer from "./features/shippingDetails/shippingDetailsSlice";
import { shippingDetailsApi } from "./features/shippingDetails/shippingDetailsApi";
import { stripeApi } from "./features/stripe/stripeApi";
import transactionsReducer from "./features/transactions/transactionsSlice";
import { transactionsApi } from "./features/transactions/transactionsApi";
import uploadsReducer from "./features/uploads/uploadsSlice";
import { uploadsApi } from "./features/uploads/uploadsApi";
import usersReducer from "./features/users/usersSlice";
import { usersApi } from "./features/users/usersApi";

const rootReducer = combineReducers({
  [adminProductsApi.reducerPath]: adminProductsApi.reducer,
  [categoriesApi.reducerPath]: categoriesApi.reducer,
  [cartsApi.reducerPath]: cartsApi.reducer,
  [cartItemsApi.reducerPath]: cartItemsApi.reducer,
  [markersApi.reducerPath]: markersApi.reducer,
  [orderItemsApi.reducerPath]: orderItemsApi.reducer,
  [ordersApi.reducerPath]: ordersApi.reducer,
  [panelsApi.reducerPath]: panelsApi.reducer,
  [partnerProductsApi.reducerPath]: partnerProductsApi.reducer,
  [partnerProfilesApi.reducerPath]: partnerProfilesApi.reducer,
  [patientMarkerValuesApi.reducerPath]: patientMarkerValuesApi.reducer,
  [pdfReportsApi.reducerPath]: pdfReportsApi.reducer,
  [shippingDetailsApi.reducerPath]: shippingDetailsApi.reducer,
  [stripeApi.reducerPath]: stripeApi.reducer,
  [transactionsApi.reducerPath]: transactionsApi.reducer,
  [uploadsApi.reducerPath]: uploadsApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,

  adminProducts: adminProductsReducer,
  categories: categoriesReducer,
  carts: cartsReducer,
  cartItems: cartItemsReducer,
  markers: markersReducer,
  orderItems: orderItemsReducer,
  orders: ordersReducer,
  panels: panelsReducer,
  partnerProducts: partnerProductsReducer,
  partnerProfiles: partnerProfilesReducer,
  patientMarkerValues: patientMarkerValuesReducer,
  pdfReports: pdfReportsReducer,
  shippingDetails: shippingDetailsReducer,
  transactions: transactionsReducer,
  uploads: uploadsReducer,
  users: usersReducer,
});

export default rootReducer;
