import React from "react";

/**
 * Signature CareerBridge Lotus Brand Mark
 * Modeled directly after the iconic 3-petal lotus/leaf motif from the CareerBridge reference mockup.
 */
export function CareerBridgeLogo({
  className = "h-8 w-8 text-[#caaa98]",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CareerBridge Logo"
    >
      {/* Central upright lotus bud / flame */}
      <path
        d="M24 7C24 7 28.5 16 28.5 24C28.5 27.5 26.5 31 24 31C21.5 31 19.5 27.5 19.5 24C19.5 16 24 7 24 7Z"
        fill="currentColor"
      />
      {/* Left arched leaf petal */}
      <path
        d="M17 14.5C17 14.5 10.5 22 12.5 29.5C13.8 33.8 18 35.5 20.5 33.5C19.5 30.5 18.5 26 18.5 22C18.5 18 17 14.5 17 14.5Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      {/* Right arched leaf petal */}
      <path
        d="M31 14.5C31 14.5 37.5 22 35.5 29.5C34.2 33.8 30 35.5 27.5 33.5C28.5 30.5 29.5 26 29.5 22C29.5 18 31 14.5 31 14.5Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      {/* Base curved anchor cradle */}
      <path
        d="M16 34.5C20.5 39 27.5 39 32 34.5C30 37 26.5 39 24 39C21.5 39 18 37 16 34.5Z"
        fill="currentColor"
        fillOpacity="0.65"
      />
    </svg>
  );
}

/**
 * Calligraphic Script Watermark: "Building Better Futures"
 * Includes the cursive script with subtle warm almond brush stroke underline.
 */
export function CareerBridgeScriptWatermark({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-xl sm:text-2xl",
    md: "text-2xl sm:text-3xl",
    lg: "text-3xl sm:text-4xl",
  }[size];

  return (
    <div className={`flex flex-col items-end select-none ${className}`}>
      <span
        className={`font-script ${sizeClasses} text-[#fbf9f6] tracking-wide drop-shadow-md transform -rotate-2`}
      >
        Building Better Futures
      </span>
      <div className="w-24 sm:w-28 h-0.5 bg-gradient-to-r from-transparent via-[#caaa98] to-transparent rounded-full mt-0.5" />
    </div>
  );
}

/**
 * Signature CareerBridge Horizon Footer Strip
 * "More Opportunities | Better Matches | Brighter Futures"
 */
export function CareerBridgeHorizonStrip({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative z-10 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/80 ${className}`}
    >
      <div className="flex items-center gap-2 font-medium tracking-wide">
        <span className="text-white">More Opportunities</span>
        <span className="text-[#caaa98]">|</span>
        <span className="text-[#caaa98] font-bold">Better Matches</span>
        <span className="text-[#caaa98]">|</span>
        <span className="text-white">Brighter Futures</span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-white/70 font-mono">
        <span>Karachi</span>
        <span>·</span>
        <span>Lahore</span>
        <span>·</span>
        <span>Islamabad</span>
        <span>·</span>
        <span>Peshawar</span>
        <span>·</span>
        <span>Remote</span>
      </div>
    </div>
  );
}
