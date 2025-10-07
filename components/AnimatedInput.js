import { useState, useRef, useEffect } from 'react';

const AnimatedInput = ({ 
  label, 
  value, 
  onChange, 
  type = "text",
  className = "",
  style = {},
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setHasValue(value && value.length > 0);
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const isLabelFloating = isFocused || hasValue;

  return (
    <div className="relative">
      {/* Input Field */}
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`w-full bg-transparent border-0 border-b border-gray-400 py-2 text-gray-700 focus:outline-none focus:border-[#840032] transition-colors duration-200 ${className}`}
        style={{ 
          outline: 'none', 
          boxShadow: 'none', 
          borderBottom: isFocused ? '1px solid #840032 !important' : '1px solid #9CA3AF !important',
          ...style 
        }}
        {...props}
      />
      
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
    </div>
  );
};

export default AnimatedInput;
