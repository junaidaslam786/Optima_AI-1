// components/ui/Input.tsx
import React from "react";

type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "date"
  | "tel"
  | "url";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  type?: InputType;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  type = "text",
  error,
  className,
  ...props
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-primary mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        className={`w-full text-primary px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none
          ${error ? "border-red-500" : ""} ${className || ""}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
