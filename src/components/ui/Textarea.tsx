// components/ui/Textarea.tsx
import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  rows?: number;
  error?: string;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  id,
  rows = 4,
  error,
  className = "",
  ...props
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-primary mb-1">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        className={
          `w-full text-primary px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none ` +
          (error ? "border-red-500 " : "") +
          className
        }
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
