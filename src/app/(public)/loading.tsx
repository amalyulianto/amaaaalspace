export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="space-y-5">
                <div className="h-9 bg-surface rounded w-1/3" />
                <div className="h-4 bg-surface/80 rounded w-3/4" />
                <div className="h-4 bg-surface/80 rounded w-1/2" />
            </div>

            <div className="space-y-4 pt-1">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="space-y-1.5">
                        <div className="h-4 bg-surface rounded w-2/5" />
                        <div className="h-3 bg-surface/70 rounded w-1/4" />
                    </div>
                ))}
            </div>
        </div>
    )
}
