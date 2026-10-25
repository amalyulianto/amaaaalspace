import React from 'react'
import Image from 'next/image'

interface BadgeProps {
    children: React.ReactNode
    className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
    return (
        <span
            className={`px-2 py-0.5 bg-surface text-secondary border border-border text-xs font-medium rounded transition-colors ${className}`}
        >
            {children}
        </span>
    )
}

export function Bullet({ className = '' }: { className?: string }) {
    return (
        <span
            className={`w-3 h-3 rounded-[3px] bg-foreground/80 shrink-0 transition-transform group-hover:scale-110 ${className}`}
        />
    )
}

export function ProfileBadge() {
    return (
        <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full overflow-hidden relative shrink-0 bg-surface border border-border">
                <Image
                    src="/profile.png"
                    alt="Amal Yulianto"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground leading-tight">
                    Amal Yulianto
                </span>
                <span className="text-xs text-muted leading-tight mt-1">
                    Software Engineer/Product Designer
                </span>
            </div>
        </div>
    )
}
