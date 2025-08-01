// components/ui/Button.tsx
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className,
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";

  const variantClasses = {
    primary:
      "py-3 bg-primary hover:bg-secondary text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-primary transition disabled:opacity-50",
    secondary:
      "bg-secondary hover:bg-tertiary text-white font-medium py-2 px-6 rounded-full transition",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost:
      "bg-transparent text-primary hover:bg-gray-100 focus:ring-primary border border-transparent",
  };

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${
        sizeClasses[size]
      } ${className || ""} ${
        disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <LoadingSpinner /> : children}
    </button>
  );
};

export default Button;
