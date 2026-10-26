'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Music2 } from 'lucide-react'
import { SpotifyData } from '@/lib/types'
import { useLanguage } from '@/components/layout/ThemeProvider'
import { SectionHeading } from '@/components/ui/SectionHeading'

export default function SpotifySection() {
    const { t } = useLanguage()
    const [data, setData] = useState<SpotifyData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [isExpanded, setIsExpanded] = useState<boolean>(true)

    const fetchMusic = async () => {
        try {
            const res = await fetch('/api/spotify')
            if (res.ok) {
                const json: SpotifyData = await res.json()
                setData(json)
            }
        } catch (error) {
            console.error('Failed to load music activity:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMusic()
        const interval = setInterval(fetchMusic, 30000)
        return () => clearInterval(interval)
    }, [])

    const nowPlaying = data?.nowPlaying
    const topTracks = data?.topTracks || []

    return (
        <section className="rounded-xl border border-border bg-surface/30 overflow-hidden transition-all">
            {/* Header / Collapse Toggle */}
            <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-surface/50 transition-colors focus-visible:outline-none"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <Music2 className="w-4 h-4 text-secondary shrink-0" />
                    <SectionHeading className="truncate">
                        {t.music.title}
                    </SectionHeading>

                    {nowPlaying?.isPlaying && (
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                    )}

                    {!isExpanded && nowPlaying && (
                        <span className="text-xs sm:text-sm text-secondary truncate">
                            — {nowPlaying.title}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0 text-secondary">
                    <span className="text-xs hidden sm:inline">
                        {isExpanded ? 'Collapse' : 'Expand'}
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                        }`}
                    />
                </div>
            </button>

            {/* Expandable Content Body */}
            {isExpanded && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 space-y-4 border-t border-border/50 animate-in fade-in-50 duration-200">
                    {loading && !data ? (
                        <p className="text-sm text-secondary animate-pulse pt-3 m-0">
                            Loading music activity...
                        </p>
                    ) : (
                        <>
                            {/* Now Playing / Last Played */}
                            <div className="pt-3.5 space-y-1">
                                <div className="text-xs font-medium uppercase tracking-wider text-muted">
                                    {nowPlaying?.isPlaying ? t.music.nowPlaying : t.music.lastPlayed}
                                </div>

                                {nowPlaying ? (
                                    <p className="text-sm sm:text-[15px] text-foreground m-0 leading-relaxed">
                                        <a
                                            href={nowPlaying.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-accent hover:underline font-medium"
                                        >
                                            {nowPlaying.title}
                                        </a>
                                        <span className="text-secondary"> — {nowPlaying.artist}</span>
                                    </p>
                                ) : (
                                    <p className="text-sm sm:text-[15px] text-secondary m-0">
                                        {t.music.notPlaying}
                                    </p>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-border/40" />

                            {/* Top Songs of the Month */}
                            <div className="space-y-2">
                                <div className="text-xs font-medium uppercase tracking-wider text-muted">
                                    {t.music.topMonthlyTitle}
                                </div>

                                {topTracks.length > 0 ? (
                                    <ol className="list-decimal list-inside space-y-1.5 text-sm sm:text-[15px] text-secondary m-0 p-0">
                                        {topTracks.map((track, idx) => (
                                            <li
                                                key={`${track.title}-${track.artist}-${idx}`}
                                                className="leading-relaxed"
                                            >
                                                <a
                                                    href={track.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-accent hover:underline"
                                                >
                                                    {track.title}
                                                </a>
                                                <span className="text-secondary"> — {track.artist}</span>
                                                {track.playcount > 0 && (
                                                    <span className="text-xs text-muted ml-1.5 tabular-nums">
                                                        ({track.playcount} {t.music.plays})
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <p className="text-sm sm:text-[15px] text-secondary m-0">
                                        {t.music.emptyTopTracks}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </section>
    )
}
