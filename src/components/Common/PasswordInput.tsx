"use client";

import React, { useState } from "react";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: React.ReactNode;
  inputClassName?: string;
  labelClassName?: string;
  wrapperClassName?: string;
};

const PasswordInput = ({
  label,
  inputClassName = "rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 pl-5 pr-20 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20",
  labelClassName = "block mb-2.5",
  wrapperClassName = "mb-5",
  id,
  name,
  ...props
}: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const inputId = id || name;

  return (
    <div className={wrapperClassName}>
      <label htmlFor={inputId} className={labelClassName}>
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={inputId}
          name={name}
          type={isVisible ? "text" : "password"}
          className={inputClassName}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-dark-4 transition hover:bg-gray-2 hover:text-blue"
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" y1="2" x2="22" y2="22" />
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
