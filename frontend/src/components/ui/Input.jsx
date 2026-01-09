import React from 'react';

const Input = ({
    label,
    error,
    icon: Icon,
    className = '',
    containerClassName = '',
    ...props
}) => {
    return (
        <div className={`mb-4 ${containerClassName}`}>
            {label && (
                <label className="block text-slate-700 font-semibold mb-2 text-sm ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={`
            w-full border-2 rounded-xl px-4 py-3 bg-gray-50 
            transition-all duration-300
            placeholder-gray-400 text-slate-800 font-medium
            focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
            disabled:bg-gray-100 disabled:text-gray-500
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-100 hover:border-gray-300'}
            ${Icon ? 'pl-11' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 ml-1 text-xs text-red-500 font-medium animate-pulse">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
