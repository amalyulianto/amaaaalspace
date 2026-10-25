import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-surface/40 hover:bg-surface/80 border border-border hover:border-foreground/20 rounded-xl p-4 transition-all duration-200 ${className}`}>
            {children}
        </div>
    )
}
