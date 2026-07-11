import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <div
      className={`inline-flex items-center justify-center bg-white rounded-xl shadow-sm border border-emerald-100/50 ${className}`}
      style={{ width: size, height: size }}
      id="app-logo-wrapper"
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        id="app-logo-svg"
      >
        <circle
          cx="50"
          cy="50"
          r="34"
          stroke="#10b981" // Beautiful soft emerald green
          strokeWidth="14"
          fill="none"
        />
      </svg>
    </div>
  );
}
