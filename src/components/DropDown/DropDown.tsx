import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import styles from './DropDown.module.css'
import { motion } from 'framer-motion'
import classNames from 'classnames'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  options: DropdownOption[]
  placeholder?: string
  onChange: (value: string) => void
  value?: string | null
  small?: boolean
}

const containerAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const optionsListAnimation = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
}

const DropdownOption = memo(
  ({ option, onSelect }: { option: DropdownOption; onSelect: (option: DropdownOption) => void }) => (
    <motion.div
      className={styles.option}
      onClick={() => onSelect(option)}
      whileHover={{ backgroundColor: '#f0f0f0' }}
      transition={{ duration: 0.1 }}
    >
      {option.label}
    </motion.div>
  ),
)

DropdownOption.displayName = 'DropdownOption'

const Dropdown: React.FC<DropdownProps> = ({
  options,
  placeholder = 'Select...',
  onChange,
  value = null,
  small = false,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredOptions = useMemo(
    () => options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase())),
    [inputValue, options],
  )

  useEffect(() => {
    if (value !== null && value !== undefined) {
      const selectedOption = options.find((option) => option.value === value)
      setInputValue(selectedOption?.label || '')
    }
  }, [value, options])

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setIsOpen(true)
  }, [])

  const handleOptionClick = useCallback(
    (option: DropdownOption) => {
      setInputValue(option.label)
      onChange(option.value)
      setIsOpen(false)
    },
    [onChange],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && filteredOptions.length > 0) {
        handleOptionClick(filteredOptions[0])
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    },
    [filteredOptions, handleOptionClick],
  )

  return (
    <motion.div {...containerAnimation} className={styles.container}>
      <div className={classNames(styles.dropdownContainer, { [styles.small]: small })} ref={dropdownRef}>
        <input
          type="text"
          className={classNames(styles.input, { [styles.smallInput]: small })}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
        />
        {isOpen && filteredOptions.length > 0 && (
          <motion.div {...optionsListAnimation} className={styles.optionsList}>
            {filteredOptions.map((option) => (
              <DropdownOption key={option.value} option={option} onSelect={handleOptionClick} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default memo(Dropdown)
