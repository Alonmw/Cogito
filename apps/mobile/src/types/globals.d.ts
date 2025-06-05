// Global type declarations for React Native
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

// Override conflicting global types
declare global {
  interface FormData {}
}

export {}; 