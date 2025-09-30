import { memo } from 'react';

const OtpInput = memo(({ value, onChange, onKeyDown, inputRef }) => {
  return (
    <input
      type="text"
      maxLength="1"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      ref={inputRef}
      className="w-12 h-12 text-center border rounded"
    />
  );
}, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value;
});

OtpInput.displayName = 'OtpInput';

export default OtpInput;