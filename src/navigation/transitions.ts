// src/navigation/transitions.ts
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Easing } from "react-native";

// ---- Global Premium Spring Settings ----
const SPRING_CONFIG = {
  stiffness: 480,
  damping: 36,
  mass: 0.8,
};

// ---- Premium Slide From Right (default push) ----
export const PremiumSlideRight: NativeStackNavigationOptions = {
  animation: "slide_from_right",
  animationDuration: 380,
  gestureEnabled: true,
};

// ---- Premium Slide From Bottom (sheets) ----
export const PremiumSlideBottom: NativeStackNavigationOptions = {
  animation: "slide_from_bottom",
  animationDuration: 330,
  gestureEnabled: true,
};

// ---- Premium Fade ----
export const PremiumFade: NativeStackNavigationOptions = {
  animation: "fade",
  animationDuration: 260,
};

// ---- Fully Transparent Modal Sheet ----
export const PremiumModal: NativeStackNavigationOptions = {
  animation: "slide_from_bottom",
  presentation: "transparentModal",
  animationDuration: 290,
};

// ---- No Animation ----
export const NoAnimation: NativeStackNavigationOptions = {
  animation: "none",
};
