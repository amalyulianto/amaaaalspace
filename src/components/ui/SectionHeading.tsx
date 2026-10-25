import React from 'react'

interface SectionHeadingProps {
    children: React.ReactNode
    className?: string
}

export function SectionHeading({ children, className = '' }: SectionHeadingProps) {
    return (
        <h2 className={`text-sm sm:text-[15px] font-bold text-foreground tracking-tight m-0 ${className}`}>
            {children}
        </h2>
    )
}
