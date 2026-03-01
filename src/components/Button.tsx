import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    isLoading?: boolean;
}

export const Button = ({
                           children,
                           variant = "primary",
                           isLoading,
                           className = "",
                           ...props
                       }: ButtonProps) => {
    const baseStyles = "relative flex items-center justify-center px-6 py-3 rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-cream hover:bg-primary/90 font-sans text-base shadow-sm",
        secondary: "bg-secondary text-white hover:bg-secondary/90 font-sans font-medium text-sm shadow-sm",
        ghost: "bg-transparent text-ink hover:text-primary font-sans text-sm",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className} cursor-pointer`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="animate-pulse font-mono text-xs">processing_vector...</span>
            ) : (
                children
            )}
        </button>
    );
};
