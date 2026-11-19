"use client";

import { useId } from "react";

export default function Logo({
  className = "h-7 w-auto",
}: {
  className?: string;
}) {
  const clipId = useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 432 276"
      className={className}
      aria-label="MedTour Logo"
      role="img"
    >
      <defs>
        <clipPath id={clipId}>
          <path
            d="
              M18 0
              H104
              Q110 0 115 4
              L216 82
              L317 4
              Q322 0 328 0
              H414
              Q432 0 432 18
              V258
              Q432 276 414 276
              H324
              V128
              L216 210
              L107 128
              V276
              H18
              Q0 276 0 258
              V18
              Q0 0 18 0
              Z"
          />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* Base */}
        <rect width="432" height="276" fill="#0CA99D" />

        {/* Upper-left face */}
        <path d="M0 0 H104 L216 82 L107 128 H0 Z" fill="#00636B" />

        {/* Lower-left face */}
        <path d="M0 128 H107 V276 H0 Z" fill="#55C4BE" />

        {/* Upper-right face */}
        <path
          d="M216 82 L317 4 Q322 0 328 0 H432 V128 H325 L216 210 Z"
          fill="#17B4A5"
        />

        {/* Lower-right face */}
        <path d="M325 128 H432 V276 H324 V128 Z" fill="#079789" />

        {/* Central geometric shadow */}
        <path d="M107 128 L216 82 V210 Z" fill="#087C7C" />
      </g>
    </svg>
  );
}
