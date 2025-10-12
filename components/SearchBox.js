import { useState, forwardRef } from 'react';

const SearchBox = forwardRef(({ 
  placeholder = "Search", 
  value, 
  onChange, 
  className = "",
  style = {},
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          width="13" 
          height="13" 
          viewBox="0 0 13 13" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-black"
        >
          <path 
            d="M12.8175 11.9041L10.4074 9.51166C11.3429 8.34433 11.7959 6.86266 11.6734 5.37132C11.5508 3.87997 10.8619 2.49231 9.74838 1.49365C8.63484 0.494996 7.18129 -0.0387395 5.6866 0.00219149C4.19192 0.0431225 2.76971 0.655609 1.71241 1.71371C0.655111 2.77181 0.0430898 4.1951 0.00218982 5.69092C-0.0387101 7.18675 0.49462 8.6414 1.49252 9.75578C2.49041 10.8702 3.87703 11.5596 5.36724 11.6822C6.85745 11.8049 8.33799 11.3515 9.50444 10.4153L11.895 12.8077C11.9554 12.8686 12.0273 12.917 12.1064 12.95C12.1856 12.983 12.2705 13 12.3562 13C12.442 13 12.5269 12.983 12.6061 12.95C12.6852 12.917 12.7571 12.8686 12.8175 12.8077C12.9346 12.6865 13 12.5245 13 12.3559C13 12.1873 12.9346 12.0253 12.8175 11.9041ZM5.8601 10.4153C4.96073 10.4153 4.08156 10.1484 3.33376 9.64837C2.58596 9.14832 2.00312 8.43759 1.65895 7.60605C1.31477 6.77451 1.22472 5.85951 1.40018 4.97675C1.57564 4.09399 2.00873 3.28312 2.64468 2.64669C3.28063 2.01025 4.09088 1.57684 4.97297 1.40124C5.85506 1.22565 6.76937 1.31577 7.60028 1.66021C8.43119 2.00464 9.14138 2.58792 9.64104 3.33629C10.1407 4.08466 10.4074 4.9645 10.4074 5.86455C10.4074 7.07149 9.92831 8.22899 9.07553 9.08242C8.22274 9.93585 7.06612 10.4153 5.8601 10.4153Z" 
            fill="black"
          />
        </svg>
      </div>
      
      {/* Search Input */}
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full pl-10 pr-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:ring-0"
        style={{
          background: '#D9D9D9',
          width: '100%',
          maxWidth: '318px',
          height: '34px',
          borderRadius: '10px',
          border: 'none',
          opacity: 1,
          ...style
        }}
        {...props}
      />
    </div>
  );
});

SearchBox.displayName = 'SearchBox';

export default SearchBox;
