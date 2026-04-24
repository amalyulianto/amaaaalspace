import React from 'react'

interface SectionHeadingProps {
    children: React.ReactNode
    className?: string
}

export function SectionHeading({ children, className = '' }: SectionHeadingProps) {
    return (
        <h2 className={`text-xl font-bold mb-4 text-neutral-900 dark:text-neutral-100 uppercase tracking-tight ${className}`}>
            {children}
        </h2>
    )
}
