import React from "react";

const Logo = ({ variant = "light", className = "h-10" }) => {
  const wordColor = variant === "light" ? "#1F3864" : "#FFFFFF";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 64 64"
        className="h-full w-auto shrink-0"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="30" fill="#1F3864" />

        <path d="M32 14 L54 22 L32 30 L10 22 Z" fill="#E15B3F" />

        <path
          d="M18 25 V36 C18 40 24 43 32 43 C40 43 46 40 46 36 V25"
          stroke="#FFFFFF"
          strokeWidth="2"
          fill="none"
        />

        <line
          x1="54"
          y1="22"
          x2="54"
          y2="34"
          stroke="#E15B3F"
          strokeWidth="2"
        />
      </svg>

      <span className="font-heading text-xl font-bold leading-none whitespace-nowrap">
        <span style={{ color: "#E15B3F" }}>Medico</span>{" "}
        <span style={{ color: wordColor }}>Overseas</span>
      </span>
    </div>
  );
};

export default Logo;
