'use client'

import { useEffect, useState } from 'react'
import { SpotifyData } from '@/lib/types'
import { useLanguage } from '@/components/layout/ThemeProvider'
import { SectionHeading } from '@/components/ui/SectionHeading'

export default function SpotifySection() {
    const { t } = useLanguage()
    const [data, setData] = useState<SpotifyData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

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

    if (loading && !data) {
        return (
            <section className="pt-8 space-y-4 border-t border-border/40 text-sm sm:text-[15px] text-secondary">
                <p className="animate-pulse">Loading music activity...</p>
            </section>
        )
    }

    const nowPlaying = data?.nowPlaying
    const topTracks = data?.topTracks || []

    return (
        <section className="pt-8 space-y-6 border-t border-border/40">
            {/* Currently Playing / Last Played */}
            <div className="space-y-1.5">
                <SectionHeading>
                    {t.music.title}
                </SectionHeading>

                <div className="text-sm sm:text-[15px] text-secondary leading-relaxed">
                    {nowPlaying ? (
                        <p className="m-0">
                            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                                {nowPlaying.isPlaying && (
                                    <span className="relative flex h-2 w-2 mr-0.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                    </span>
                                )}
                                {nowPlaying.isPlaying ? t.music.nowPlaying : t.music.lastPlayed}:
                            </span>{' '}
                            <a
                                href={nowPlaying.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline"
                            >
                                {nowPlaying.title}
                            </a>
                            <span className="text-secondary"> — {nowPlaying.artist}</span>
                        </p>
                    ) : (
                        <p className="m-0">{t.music.notPlaying}</p>
                    )}
                </div>
            </div>

            {/* Top Songs of the Month */}
            <div className="space-y-2.5">
                <SectionHeading>
                    {t.music.topMonthlyTitle}
                </SectionHeading>

                {topTracks.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-1.5 text-sm sm:text-[15px] text-secondary m-0 p-0">
                        {topTracks.map((track, idx) => (
                            <li key={`${track.title}-${track.artist}-${idx}`} className="leading-relaxed">
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
                                    <span className="text-xs text-secondary/80 ml-1.5">
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
        </section>
    )
}
