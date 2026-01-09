import React from 'react';

const Card = ({
    children,
    className = '',
    hoverEffect = false,
    ...props
}) => {
    return (
        <div
            className={`
        bg-white rounded-2xl border border-gray-100 p-6
        shadow-[0_8px_30px_rgb(0,0,0,0.04)]
        ${hoverEffect ? 'transition-all duration-300 hover:shadow-[0_20px_40px_rgba(255,77,45,0.1)] hover:-translate-y-1' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
