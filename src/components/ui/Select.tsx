// components/ui/Select.tsx
import React, { useState, useRef, useEffect } from "react";

export interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  searchable?: boolean;
  placeholder?: string;
  error?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  searchable = false,
  placeholder = "Select…",
  error,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // find currently selected option
  const selected = options.find((o) => o.value === value);

  // filter options by the typed query
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // close dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <label htmlFor={id} className="block text-primary mb-1">
        {label}
      </label>

      {/* faux “select box” */}
      <div
        id={id}
        className={
          `w-full px-4 py-2 border rounded-lg cursor-pointer flex items-center justify-between ` +
          (error ? "border-red-500 " : "border-primary ") +
          className
        }
        onClick={() => {
          setOpen((o) => !o);
          setQuery("");
        }}
      >
        <span className={selected ? "" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className="w-4 h-4 text-current" viewBox="0 0 20 20" fill="none">
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-primary rounded-lg shadow-lg max-h-60 overflow-auto">
          {searchable && (
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2 border-b border-primary focus:outline-none"
              placeholder="Search…"
            />
          )}
          <ul>
            {filtered.map((opt) => (
              <li
                key={opt.value}
                className="px-4 py-2 hover:bg-primary hover:text-white cursor-pointer"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-2 text-gray-500">No options found</li>
            )}
          </ul>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
