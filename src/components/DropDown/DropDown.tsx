import React, { useState, useEffect, useRef } from 'react'
import styles from './DropDown.module.css'
import { motion } from 'framer-motion'

export interface DropdownOption {
  value: string
  label: string
}

export interface DropdownProps {
  options: DropdownOption[]
  placeholder?: string
  onChange: (value: string | null) => void
  value?: string | null
  small?: boolean
}

const Dropdown: React.FC<DropdownProps> = ({ options, placeholder, onChange, value = null, small = false }) => {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState(options)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Синхронизация с внешним value
  useEffect(() => {
    if (value !== null && value !== undefined) {
      const selectedOption = options.find((option) => option.value === value)
      setInputValue(selectedOption?.label || '')
    }
  }, [value, options])

  useEffect(() => {
    setFilteredOptions(options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase())))
  }, [inputValue, options])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setIsOpen(true)
  }

  const handleOptionClick = (option: DropdownOption) => {
    setInputValue(option.label)
    onChange(option.value)
    setIsOpen(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.container}
    >
      <div className={`${styles.dropdownContainer} ${small ? styles.small : ''}`} ref={dropdownRef}>
        <input
          type="text"
          className={`${styles.input} ${small ? styles.smallInput : ''}`}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
        />
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
            transition={{ duration: 0.2 }}
            className={styles.optionsList}
          >
            {filteredOptions.map((option) => (
              <motion.div
                key={option.value}
                className={styles.option}
                onClick={() => handleOptionClick(option)}
                whileHover={{ backgroundColor: '#f0f0f0' }}
                transition={{ duration: 0.1 }}
              >
                {option.label}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Dropdown
