import React from "react";
import { cn } from "../../lib/utils";

// Main container component with border glide effect
export const BorderGlide = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950",
      className
    )}
    {...props}
  >
    <div className="relative z-10">{children}</div>
  </div>
));
BorderGlide.displayName = "BorderGlide";

// Card wrapper component
export const BorderGlideCard = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-full w-full", className)}
    {...props}
  />
));
BorderGlideCard.displayName = "BorderGlideCard";

// Content container
export const BorderGlideContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6", className)}
    {...props}
  />
));
BorderGlideContent.displayName = "BorderGlideContent";

// Header section
export const BorderGlideHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-4 space-y-1", className)}
    {...props}
  />
));
BorderGlideHeader.displayName = "BorderGlideHeader";

// Title component
export const BorderGlideTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
BorderGlideTitle.displayName = "BorderGlideTitle";

// Description component
export const BorderGlideDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
));
BorderGlideDescription.displayName = "BorderGlideDescription";

// Footer section
export const BorderGlideFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-6 pt-4 border-t border-gray-200 dark:border-gray-800", className)}
    {...props}
  />
));
BorderGlideFooter.displayName = "BorderGlideFooter";