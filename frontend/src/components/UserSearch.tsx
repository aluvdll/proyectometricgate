import React from "react";

interface UserSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 dark:text-gray-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <input
        type="text"
        placeholder="Buscar usuario"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 dark:text-gray-200 pr-3 py-1.5 border border-orange-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-900"
      />
    </div>
  );
};
