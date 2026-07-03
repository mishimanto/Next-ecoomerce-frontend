import React from "react";
import { FiSearch } from "react-icons/fi";

type SearchFormProps = {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
};

const SearchForm = ({ value = "", onChange, onSubmit }: SearchFormProps) => {
  return (
    <div className="shadow-1 bg-white rounded-xl">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">Search</h2>
      </div>

      <div className="p-4 sm:p-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit?.();
          }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search here..."
              value={value}
              onChange={(event) => onChange?.(event.target.value)}
              className="w-full rounded-md border border-gray-3 py-3 pl-5 pr-13 outline-none ease-out duration-200 placeholder:text-dark-5 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
            <button
              type="submit"
              aria-label="Search"
              className="text-dark-2 absolute right-0 top-0 px-4 py-3.5 ease-out duration-200 hover:text-blue"
            >
              <FiSearch size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchForm;
