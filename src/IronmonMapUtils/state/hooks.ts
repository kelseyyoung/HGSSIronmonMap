import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { IronmonMapDispatch, IronmonMapState } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => IronmonMapDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<IronmonMapState> =
  useSelector;
