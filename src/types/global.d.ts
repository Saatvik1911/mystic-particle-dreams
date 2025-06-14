
export {};

declare global {
  interface Window {
    heroSectionRef?: {
      current: {
        targetCameraY: number;
        isTransitioning: boolean;
      };
    };
  }
}
