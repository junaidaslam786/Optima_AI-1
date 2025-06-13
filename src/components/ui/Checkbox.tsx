// components/ui/Checkbox.tsx
"use client";

import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  id,
  error,
  className = "",
  ...props
}) => {
  return (
    <div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={id}
          className={`
            h-4 w-4
            text-primary
            border-primary
            rounded
            accent-primary
            ${className}
          `}
          {...props}
        />
        <label htmlFor={id} className="ml-2 text-primary">
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
