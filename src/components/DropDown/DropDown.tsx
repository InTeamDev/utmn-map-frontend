import React, { useState, useEffect, useRef } from 'react';
import styles from './DropDown.module.css';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  placeholder: string;
  onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, placeholder, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilteredOptions(
      options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    );
  }, [inputValue, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (option: DropdownOption) => {
    setInputValue(option.label);
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <input
        type="text"
        className={styles.input}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className={styles.optionsList}>
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className={styles.option}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
