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
    const baseStyles = "relative flex items-center justify-center px-8 py-3 transition-all duration-300 disabled:opacity-50";

    const variants = {
        primary: "border border-ink bg-transparent text-ink hover:bg-ink hover:text-cream font-serif text-lg",
        secondary: "bg-primary text-cream hover:bg-red-800 font-serif font-bold uppercase tracking-tight",
        ghost: "text-ink opacity-60 hover:opacity-100 font-serif italic border border-ink bg-transparent",
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