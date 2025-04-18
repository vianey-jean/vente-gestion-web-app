
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  isValid?: boolean;
  showValidation?: boolean;
  onFocus?: () => void;
}

const PasswordInput = ({
  id,
  value,
  onChange,
  placeholder = "Mot de passe",
  className,
  required = false,
  isValid = true,
  showValidation = false,
  onFocus
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "pr-10",
          !isValid && showValidation ? "border-red-500 ring-red-500" : "",
          className
        )}
        required={required}
        onFocus={onFocus}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
        onClick={togglePasswordVisibility}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default PasswordInput;
