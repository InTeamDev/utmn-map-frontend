import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import styles from './DropDown.module.css'
import { motion } from 'framer-motion'
import classNames from 'classnames'
import { api } from '../../services/public.api'
import { SearchResult, ObjectType, getObjectTypeById } from '../../services/interfaces/object'

// Иконки для объектов
import WardrobeIcon from '../../assets/wardrobe.svg'
import KitchenIcon from '../../assets/kitchen.svg'
import CafeteriaIcon from '../../assets/canteen.svg'
import GymIcon from '../../assets/gym.svg'
import ManToiletIcon from '../../assets/man-toilet.svg'
import WomanToiletIcon from '../../assets/women-toilet.svg'
import StairIcon from '../../assets/stair.svg'
import DepartmentIcon from '../../assets/department.svg'
import ChillZoneIcon from '../../assets/chill-zone.svg'
import CabinetIcon from '../../assets/Point Icon.svg'
import CafeIcon from '../../assets/cafe.svg'


interface DropdownOption {
  value: string
  label: string
  object_type_id?: number
}

interface DropdownProps {
  options?: DropdownOption[]
  placeholder?: string
  onChange: (value: string) => void
  value?: string | null
  small?: boolean
  buildingId?: string
  searchable?: boolean
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
  ({ option, onSelect }: { option: DropdownOption; onSelect: (option: DropdownOption) => void }) => {
    const getIcon = (typeId?: number) => {
      if (!typeId) return null
      const type = getObjectTypeById(typeId)
      switch (type) {
        case 'wardrobe':
          return WardrobeIcon
        case 'cafe':
          return CafeIcon
        case 'canteen':
          return CafeteriaIcon
        case 'gym':
          return GymIcon
        case 'man-toilet':
          return ManToiletIcon
        case 'woman-toilet':
          return WomanToiletIcon
        case 'stair':
          return StairIcon
        case 'cabinet':
          return CabinetIcon
        case 'department':
          return DepartmentIcon
        case 'chill-zone':
          return ChillZoneIcon
        default:
          return null
      }
    }

    const icon = getIcon(option.object_type_id)

    return (
      <motion.div
        className={styles.option}
        onClick={() => onSelect(option)}
        whileHover={{ backgroundColor: '#f0f0f0' }}
        transition={{ duration: 0.1 }}
      >
        {icon && <img src={icon} alt="" className={styles.optionIcon} />}
        <span>{option.label}</span>
      </motion.div>
    )
  },
)

DropdownOption.displayName = 'DropdownOption'

const Dropdown: React.FC<DropdownProps> = ({
  options = [],
  placeholder = 'Select...',
  onChange,
  value = null,
  small = false,
  buildingId,
  searchable = false,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<DropdownOption[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isFirstOpen, setIsFirstOpen] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeout = useRef<NodeJS.Timeout>()

  const filteredOptions = useMemo(
    () => searchable ? searchResults : options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase())),
    [inputValue, options, searchable, searchResults],
  )

  useEffect(() => {
    if (value !== null && value !== undefined) {
      const selectedOption = options.find((option) => option.value === value)
      setInputValue(selectedOption?.label || '')
    } else {
      setInputValue('')
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

  const loadAllObjects = useCallback(async () => {
    if (!buildingId) return
    setIsSearching(true)
    try {
      const response = await api.search(buildingId)
      const mappedResults = response.results
        .filter((result: SearchResult) => !result.preview.includes('IDK'))
        .map((result: SearchResult) => ({
          value: result.object_id,
          label: result.preview,
          object_type_id: result.object_type_id,
        }))
      setSearchResults(mappedResults)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [buildingId])

  const handleInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setIsOpen(true)

    if (searchable && buildingId) {
      setIsSearching(true)
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }

      searchTimeout.current = setTimeout(async () => {
        try {
          const response = await api.search(buildingId, newValue)
          const mappedResults = response.results
            .filter((result: SearchResult) => !result.preview.includes('IDK'))
            .map((result: SearchResult) => ({
              value: result.object_id,
              label: result.preview,
              object_type_id: result.object_type_id,
            }))
          setSearchResults(mappedResults)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    }
  }, [searchable, buildingId])

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

  const handleFocus = useCallback(() => {
    setIsOpen(true)
    if (isFirstOpen && searchable && buildingId) {
      loadAllObjects()
      setIsFirstOpen(false)
    }
  }, [isFirstOpen, searchable, buildingId, loadAllObjects])

  return (
    <motion.div {...containerAnimation} className={styles.container}>
      <div className={classNames(styles.dropdownContainer, { [styles.small]: small })} ref={dropdownRef}>
        <div className={styles.innerBox}>
          <span className={styles.iconLeft}>
            <img src={CabinetIcon} alt="" width={28} height={28} />
          </span>
          <input
            type="text"
            className={classNames(styles.input, { [styles.smallInput]: small })}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            onFocus={handleFocus}
            autoComplete="off"
          />
          <span className={styles.iconRight} onClick={() => setIsOpen((prev) => !prev)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
        </div>
        {isOpen && (
          <motion.div {...optionsListAnimation} className={styles.optionsList}>
            {isSearching ? (
              <div className={styles.loading}>Поиск...</div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <DropdownOption key={option.value} option={option} onSelect={handleOptionClick} />
              ))
            ) : (
              <div className={styles.noResults}>Ничего не найдено</div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default memo(Dropdown)
