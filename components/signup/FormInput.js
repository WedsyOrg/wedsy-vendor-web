import { memo } from 'react';
import { TextInput } from 'flowbite-react';

const FormInput = memo(({ 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  validation = null,
  color = 'gray',
  helperText = ''
}) => {
  return (
    <TextInput
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      color={color}
      helperText={helperText}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if value or validation state changes
  return prevProps.value === nextProps.value && 
         prevProps.color === nextProps.color &&
         prevProps.helperText === nextProps.helperText;
});

FormInput.displayName = 'FormInput';

export default FormInput;