import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color' | 'size'> {
  variant?: 'primary' | 'secondary' | 'text';
  color?: 'primary' | 'secondary' | 'error';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>> = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    color = 'primary', 
    size = 'medium', 
    loading = false, 
    startIcon, 
    endIcon, 
    fullWidth = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const muiVariant = variant === 'primary' ? 'contained' : variant === 'secondary' ? 'outlined' : 'text';
    
    return (
      <MuiButton
        ref={ref}
        variant={muiVariant}
        color={color}
        size={size}
        disabled={disabled || loading}
        startIcon={loading ? <CircularProgress size={16} data-testid="loading-spinner" /> : startIcon}
        endIcon={endIcon}
        fullWidth={fullWidth}
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;

