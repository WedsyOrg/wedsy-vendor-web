import { memo } from 'react';
import { Select } from 'flowbite-react';

const FormSelect = memo(({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  color = 'gray',
  helperText = '',
  disabled = false
}) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      color={color}
      helperText={helperText}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}, (prevProps, nextProps) => {
  // Only re-render if value, options, or validation state changes
  return prevProps.value === nextProps.value && 
         JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options) &&
         prevProps.disabled === nextProps.disabled &&
         prevProps.color === nextProps.color &&
         prevProps.helperText === nextProps.helperText;
});

FormSelect.displayName = 'FormSelect';
export default FormSelect;