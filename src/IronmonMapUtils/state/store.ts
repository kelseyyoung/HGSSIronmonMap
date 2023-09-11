import { configureStore } from "@reduxjs/toolkit";
import { mapSettingsSlice } from "./storeSlices";

export const store = configureStore({
  reducer: {
    settings: mapSettingsSlice.reducer,
  },
});

export type IronmonMapState = ReturnType<typeof store.getState>;
export type IronmonMapDispatch = typeof store.dispatch;
