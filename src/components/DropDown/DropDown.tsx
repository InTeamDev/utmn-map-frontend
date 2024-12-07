import React from 'react';
import styles from './DropDown.module.css';

interface DropdownProps {
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, placeholder, onChange }) => {
  return (
    <select className={styles.dropdown} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled selected>
        {placeholder}
      </option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;
