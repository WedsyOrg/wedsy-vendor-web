import { useState, useRef, useEffect } from 'react';

const AnimatedDropdown = ({ 
  label, 
  value, 
  onChange, 
  options = [],
  className = "",
  style = {},
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setHasValue(value && value.length > 0);
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
    setIsOpen(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay closing to allow option selection
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleOptionClick = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
    setIsFocused(true);
  };

  const isLabelFloating = isFocused || hasValue || isOpen;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Field */}
      <div
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={0}
        className={`w-full bg-transparent border-0 border-b border-gray-400 py-2 text-gray-700 focus:outline-none focus:border-[#2B3F6C] transition-colors duration-200 cursor-pointer flex items-center justify-between ${className}`}
        style={{ 
          outline: 'none', 
          boxShadow: 'none', 
          borderBottom: isFocused || isOpen ? '1px solid #2B3F6C !important' : '1px solid #9CA3AF !important',
          ...style 
        }}
        {...props}
      >
        <span className="text-gray-700">{value}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {/* Floating Label */}
      <label
        className={`absolute left-0 transition-all duration-300 ease-in-out pointer-events-none ${
          isLabelFloating
            ? 'text-xs text-black -top-2'
            : 'text-sm text-black top-2'
        }`}
        onClick={handleClick}
        style={{
          transform: isLabelFloating ? 'translateY(0)' : 'translateY(0)',
          fontSize: isLabelFloating ? '12px' : '14px',
          fontWeight: isLabelFloating ? '500' : '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {label}
      </label>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleOptionClick(option.value)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                value === option.value ? 'bg-blue-50 text-blue-800' : 'text-gray-700'
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimatedDropdown;
