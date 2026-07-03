import React, { useState, useEffect, useRef } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
};

const CustomSelect = ({ options, value, onChange }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const selectRef = useRef<HTMLDivElement>(null);

  // Function to close the dropdown when a click occurs outside the component
  const handleClickOutside = (event: MouseEvent) => {
    if (
      selectRef.current &&
      !selectRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // Add a click event listener to the document
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const nextOption =
      options.find((option) => option.value === value) || options[0];
    setSelectedOption(nextOption);
  }, [options, value]);

  const handleOptionClick = (option: SelectOption) => {
    setSelectedOption(option);
    onChange?.(option.value);
    toggleDropdown();
  };

  return (
    <div
      className="custom-select custom-select-2 relative w-full flex-shrink-0 xl:w-auto"
      ref={selectRef}
    >
      <div
        className={`select-selected h-11 whitespace-nowrap rounded-md border border-blue/70 bg-white px-4 py-3 text-custom-sm shadow-sm xl:h-auto xl:border-0 xl:bg-transparent xl:px-0 xl:py-0 xl:shadow-none ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {selectedOption?.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.slice(1).map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`select-item ${
              selectedOption === option ? "same-as-selected" : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
