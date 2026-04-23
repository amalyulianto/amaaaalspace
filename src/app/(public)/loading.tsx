export default function Loading() {
    return (
        <div className="w-full h-full min-h-[50vh] flex flex-col pt-4">
            {/* Top Loading Bar simulation (CSS only) */}
            <div className="fixed top-0 left-0 w-full h-1 bg-neutral-100 z-50 overflow-hidden">
                <div className="h-full bg-neutral-900 animate-[loading-bar_1.5s_ease-in-out_infinite]" style={{
                    transformOrigin: 'left',
                    animation: 'loading-bar 1.5s ease-in-out infinite'
                }}></div>
            </div>

            {/* Skeleton Content */}
            <div className="space-y-12 animate-pulse mt-4">
                <div className="space-y-4 border-b border-neutral-100 pb-8">
                    <div className="h-10 bg-neutral-100 rounded-lg w-1/3"></div>
                    <div className="h-6 bg-neutral-50 rounded-lg w-2/3"></div>
                </div>

                <div className="space-y-8">
                    <div className="h-32 bg-neutral-50 rounded-2xl w-full"></div>
                    <div className="h-32 bg-neutral-50 rounded-2xl w-full"></div>
                    <div className="h-32 bg-neutral-50 rounded-2xl w-full"></div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes loading-bar {
                    0% { transform: translateX(-100%) scaleX(0.2); }
                    50% { transform: translateX(0) scaleX(0.5); }
                    100% { transform: translateX(100%) scaleX(0.2); }
                }
            `}} />
        </div>
    )
}
