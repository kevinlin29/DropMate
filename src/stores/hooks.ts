import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Selectors for common state
export const selectAuth = (state: RootState) => state.auth;
export const selectDriver = (state: RootState) => state.driver;
export const selectUI = (state: RootState) => state.ui;