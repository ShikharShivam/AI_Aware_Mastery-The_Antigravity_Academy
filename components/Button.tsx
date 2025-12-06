import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative px-8 py-3 font-orbitron font-bold tracking-wider uppercase transition-all duration-300 clip-path-slant group overflow-hidden";
  
  const variants = {
    primary: "bg-transparent border-2 border-neonGold text-neonGold hover:bg-neonGold hover:text-darkBg shadow-[0_0_15px_rgba(197,179,88,0.3)] hover:shadow-[0_0_25px_rgba(197,179,88,0.6)]",
    secondary: "bg-transparent border-2 border-neonGreen text-neonGreen hover:bg-neonGreen hover:text-darkBg shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(57,255,20,0.6)]",
    danger: "bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : children}
      </span>
    </button>
  );
};
