import slugify from 'slugify'
import { format } from 'date-fns'

export function generateSlug(text: string): string {
    return slugify(text, { lower: true, strict: true, trim: true })
}

export function formatDate(dateString: string): string {
    return format(new Date(dateString), 'MMMM d, yyyy')
}

export function formatDateShort(dateString: string): string {
    return format(new Date(dateString), 'MMM d, yyyy')
}

export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trimEnd() + '...'
}
