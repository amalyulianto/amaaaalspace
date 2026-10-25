import slugify from 'slugify'
import { Language } from './constants'

export function generateSlug(text: string): string {
    return slugify(text, { lower: true, strict: true, trim: true })
}

export function formatDate(dateString: string | null | undefined, lang: Language = 'ID'): string {
    if (!dateString) return ''
    const locale = lang === 'EN' ? 'en-US' : 'id-ID'
    return new Date(dateString).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

export function formatDateShort(dateString: string | null | undefined, lang: Language = 'ID'): string {
    if (!dateString) return ''
    const locale = lang === 'EN' ? 'en-US' : 'id-ID'
    return new Date(dateString).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trimEnd() + '...'
}
