import { useState, useEffect } from "react";

interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

const breakpoints: BreakpointConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
};

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowSize.width < breakpoints.mobile;
  const isTablet = windowSize.width >= breakpoints.mobile && windowSize.width < breakpoints.tablet;
  const isDesktop = windowSize.width >= breakpoints.desktop;

  return {
    isMobile,
    isTablet,
    isDesktop,
    windowSize,
    breakpoints,
  };
};