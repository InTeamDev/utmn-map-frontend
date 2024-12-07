import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  text: string;
  onClick: () => void;
	isActive?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, onClick, isActive }) => {
  return (
    <button className={`${styles.button} ${isActive ? styles.active : ''}`} onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;
