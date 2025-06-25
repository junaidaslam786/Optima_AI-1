import { combineReducers } from "@reduxjs/toolkit";
import usersReducer from "@/redux/features/users/usersSlice";
import partnerProfilesReducer from "@/redux/features/partnerProfiles/partnerProfilesSlice";
import panelsReducer from "@/redux/features/panels/panelsSlice";
import uploadsReducer from "@/redux/features/uploads/uploadsSlice";
import productCategoriesReducer from "@/redux/features/productCategories/productCategoriesSlice";
import markersReducer from "@/redux/features/markers/markersSlice";
import patientMarkerValuesReducer from "@/redux/features/patientMarkerValues/patientMarkerValuesSlice";
import pdfReportsReducer from "@/redux/features/pdfReports/pdfReportsSlice";
import adminProductsReducer from "@/redux/features/adminProducts/adminProductsSlice";
import partnerProductsReducer from "@/redux/features/partnerProducts/partnerProductsSlice";
import ordersReducer from "@/redux/features/orders/ordersSlice";
import orderItemsReducer from "@/redux/features/orderItems/orderItemsSlice";

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

const rootReducer = combineReducers({
  [usersApi.reducerPath]: usersApi.reducer,
  [partnerProfilesApi.reducerPath]: partnerProfilesApi.reducer,
  [panelsApi.reducerPath]: panelsApi.reducer,
  [uploadsApi.reducerPath]: uploadsApi.reducer,
  [productCategoriesApi.reducerPath]: productCategoriesApi.reducer,
  [markersApi.reducerPath]: markersApi.reducer,
  [patientMarkerValuesApi.reducerPath]: patientMarkerValuesApi.reducer,
  [pdfReportsApi.reducerPath]: pdfReportsApi.reducer,
  [adminProductsApi.reducerPath]: adminProductsApi.reducer,
  [partnerProductsApi.reducerPath]: partnerProductsApi.reducer,
  [ordersApi.reducerPath]: ordersApi.reducer,
  [orderItemsApi.reducerPath]: orderItemsApi.reducer,
  users: usersReducer,
  partnerProfiles: partnerProfilesReducer,
  panels: panelsReducer,
  uploads: uploadsReducer,
  productCategories: productCategoriesReducer,
  markers: markersReducer,
  patientMarkerValues: patientMarkerValuesReducer,
  pdfReports: pdfReportsReducer,
  adminProducts: adminProductsReducer,
  partnerProducts: partnerProductsReducer,
  orders: ordersReducer,
  orderItems: orderItemsReducer,
});

export default rootReducer;
