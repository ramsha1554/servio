import React from 'react';
import { ClipLoader } from 'react-spinners';

const variants = {
    primary: "bg-primary hover:bg-primary-600 text-white shadow-lg hover:shadow-primary/30",
    secondary: "bg-white border-2 border-slate-200 text-slate-700 hover:border-primary hover:text-primary hover:bg-primary-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
};

const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    icon: Icon,
    disabled,
    ...props
}) => {
    return (
        <button
            className={`
        relative overflow-hidden font-bold rounded-xl transition-all duration-300
        transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <ClipLoader size={18} color={variant === 'primary' ? 'white' : '#ff4d2d'} />}
            {!isLoading && Icon && <Icon className="text-lg" />}
            {!isLoading && children}
        </button>
    );
};

export default Button;
