import React, { useState, useRef, useEffect } from "react";

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  id: string;
  label: string;
  options: Option[];
  values: string[]; // Changed to an array of values
  onChange: (values: string[]) => void; // Changed to return array of values
  searchable?: boolean;
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  id,
  label,
  options,
  values,
  onChange,
  searchable = true,
  placeholder = "Select…",
  error,
  className = "",
  disabled = false,
  required = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Filter options by the typed query
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

  // Handle selection/deselection of an option
  const handleOptionClick = (optionValue: string) => {
    let newValues;
    if (values.includes(optionValue)) {
      // Deselect
      newValues = values.filter((v) => v !== optionValue);
    } else {
      // Select
      newValues = [...values, optionValue];
    }
    onChange(newValues);
    // Keep dropdown open for multi-select, unless it's not searchable
    if (!searchable) {
      setOpen(false);
    }
    setQuery(""); // Clear query after selection
  };

  // Display selected labels
  const selectedLabels = options
    .filter((o) => values.includes(o.value))
    .map((o) => o.label);

  return (
    <div className="relative" ref={ref}>
      {/* Hidden inputs for each selected value to enforce required in native form validation */}
      {required && values.length === 0 && (
        <input type="hidden" name={id} value="" required />
      )}
      {values.map((val) => (
        <input key={val} type="hidden" name={`${id}[]`} value={val} />
      ))}

      <label htmlFor={id} className="block text-primary mb-1">
        {label}
      </label>

      {/* faux “select box” */}
      <div
        id={id}
        role="button"
        aria-disabled={disabled}
        aria-expanded={open}
        className={
          `w-full px-4 py-2 border rounded-lg flex flex-wrap items-center justify-between gap-2 ` +
          (error ? "border-red-500 " : "border-primary ") +
          (disabled ? "opacity-50 cursor-not-allowed " : "cursor-pointer ") +
          className
        }
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
          setQuery("");
        }}
      >
        {selectedLabels.length > 0 ? (
          selectedLabels.map((labelTxt) => (
            <span
              key={labelTxt}
              className="inline-flex items-center px-2 py-1 rounded-full bg-primary text-white text-sm"
            >
              {labelTxt}
              <button
                type="button"
                className="ml-1 -mr-0.5 h-4 w-4 flex items-center justify-center rounded-full hover:bg-white hover:text-primary transition"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening/closing the dropdown
                  handleOptionClick(
                    options.find((o) => o.label === labelTxt)?.value || ""
                  );
                }}
              >
                &times;
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <svg
          className="w-4 h-4 text-current ml-auto"
          viewBox="0 0 20 20"
          fill="none"
        >
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
                className={`px-4 py-2 cursor-pointer ${
                  values.includes(opt.value)
                    ? "bg-primary text-white"
                    : "hover:bg-primary hover:text-white"
                }`}
                onClick={() => handleOptionClick(opt.value)}
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

export default MultiSelect;
