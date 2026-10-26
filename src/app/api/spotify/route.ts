import { NextResponse } from 'next/server'
import { NowPlayingTrack, TopTrack, SpotifyData } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const apiKey = process.env.LASTFM_API_KEY
  const username = process.env.LASTFM_USERNAME

  if (!apiKey || !username) {
    return NextResponse.json(
      { error: 'Last.fm credentials are not configured' },
      { status: 500 }
    )
  }

  try {
    // 1. Fetch recent / currently playing track
    const recentRes = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(
        username
      )}&api_key=${apiKey}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'AlapakadalaSite/1.0',
        },
        cache: 'no-store',
      }
    )

    let nowPlaying: NowPlayingTrack | null = null

    if (recentRes.ok) {
      const recentData = await recentRes.json()
      const rawTracks = recentData?.recenttracks?.track
      const tracks = Array.isArray(rawTracks)
        ? rawTracks
        : rawTracks
        ? [rawTracks]
        : []

      if (tracks.length > 0) {
        const first = tracks[0]
        const isPlaying = first['@attr']?.nowplaying === 'true'
        const artist =
          typeof first.artist === 'object'
            ? first.artist['#text'] || first.artist.name || ''
            : first.artist || ''

        nowPlaying = {
          title: first.name || '',
          artist,
          album:
            typeof first.album === 'object'
              ? first.album['#text'] || ''
              : first.album || '',
          url: first.url || '',
          isPlaying,
        }
      }
    }

    // 2. Fetch top tracks of the month (period=1month)
    const topRes = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${encodeURIComponent(
        username
      )}&api_key=${apiKey}&period=1month&limit=5&format=json`,
      {
        headers: {
          'User-Agent': 'AlapakadalaSite/1.0',
        },
        next: { revalidate: 3600 },
      }
    )

    let topTracks: TopTrack[] = []

    if (topRes.ok) {
      const topData = await topRes.json()
      const rawTop = topData?.toptracks?.track
      const list = Array.isArray(rawTop)
        ? rawTop
        : rawTop
        ? [rawTop]
        : []

      topTracks = list.map((t: any) => ({
        title: t.name || '',
        artist:
          typeof t.artist === 'object'
            ? t.artist.name || t.artist['#text'] || ''
            : t.artist || '',
        url: t.url || '',
        playcount: parseInt(t.playcount, 10) || 0,
      }))
    }

    const responseData: SpotifyData = {
      nowPlaying,
      topTracks,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching Last.fm music data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch music data' },
      { status: 500 }
    )
  }
}
