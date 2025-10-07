import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: ReactNode;
}

export const Button = ({ variant = 'primary', children, className = '', ...props }: ButtonProps) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-smooth focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'gradient-primary text-primary-foreground hover:opacity-90 shadow-sm hover:shadow-md',
    secondary: 'bg-secondary text-secondary-foreground hover:opacity-90 shadow-sm hover:shadow-md',
    danger: 'bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-foreground hover:bg-muted',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
