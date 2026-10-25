import React from 'react'

export default function PublicTemplate({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="animate-in duration-300">
            {children}
        </div>
    )
}
