import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-surface/50 border border-border rounded-xl p-4 transition-colors ${className}`}>
            {children}
        </div>
    )
}
