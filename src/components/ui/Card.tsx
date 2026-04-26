import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-none transition-all duration-300 ease-in-out ${className}`}>
            {children}
        </div>
    )
}
