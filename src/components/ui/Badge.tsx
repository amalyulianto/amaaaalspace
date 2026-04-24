import React from 'react'

interface BadgeProps {
    children: React.ReactNode
    className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
    return (
        <span
            className={`px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium rounded-md transition-colors ${className}`}
        >
            {children}
        </span>
    )
}
