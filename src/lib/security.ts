const ALLOWED_IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
])

const ALLOWED_IMAGE_EXTENSIONS = new Set([
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
])

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

const ALLOWED_TAGS = new Set([
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'strike',
    'del',
    'code',
    'pre',
    'blockquote',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'hr',
    'a',
    'img',
    'span',
    'figure',
    'figcaption',
])

const VOID_TAGS = new Set(['br', 'hr', 'img'])

const ALLOWED_STYLE_PROPERTIES = new Set([
    'text-align',
    'width',
    'height',
    'max-width',
    'margin',
    'margin-left',
    'margin-right',
    'margin-top',
    'margin-bottom',
    'display',
    'float',
])

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type RateLimitEntry = {
    timestamps: number[]
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function isValidUuid(value: string): boolean {
    return UUID_REGEX.test(value.trim())
}

export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

export function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

export function sanitizeUrl(url: string | null | undefined, allowMailto = false): string | null {
    if (!url || typeof url !== 'string') return null
    const trimmed = url.trim()
    if (!trimmed) return null

    try {
        const parsed = new URL(trimmed)
        const protocol = parsed.protocol.toLowerCase()

        if (protocol === 'https:' || protocol === 'http:') {
            return parsed.toString()
        }
        if (allowMailto && protocol === 'mailto:') {
            return parsed.toString()
        }
        return null
    } catch {
        return null
    }
}

function sanitizeStyleAttribute(styleValue: string): string {
    const declarations = styleValue.split(';')
    const safeDeclarations: string[] = []

    for (const decl of declarations) {
        const colonIndex = decl.indexOf(':')
        if (colonIndex === -1) continue

        const prop = decl.slice(0, colonIndex).trim().toLowerCase()
        const val = decl.slice(colonIndex + 1).trim()

        if (!ALLOWED_STYLE_PROPERTIES.has(prop)) continue

        const lowerVal = val.toLowerCase()
        if (
            lowerVal.includes('url(') ||
            lowerVal.includes('expression(') ||
            lowerVal.includes('javascript:') ||
            lowerVal.includes('vbscript:') ||
            lowerVal.includes('data:') ||
            lowerVal.includes('-moz-binding') ||
            lowerVal.includes('@import') ||
            /[<>\\"']/.test(val)
        ) {
            continue
        }

        if (/^[a-zA-Z0-9\s.%#\-Peak,]+$/.test(val)) {
            safeDeclarations.push(`${prop}: ${val}`)
        }
    }

    return safeDeclarations.join('; ')
}

function sanitizeTagAttributes(tagName: string, rawAttrs: string): string {
    const attrRegex = /([a-zA-Z0-9\-_]+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
    const safeAttrs: string[] = []
    let hasTargetBlank = false

    let match: RegExpExecArray | null
    while ((match = attrRegex.exec(rawAttrs)) !== null) {
        const attrName = match[1].toLowerCase()
        const attrValue = match[2] ?? match[3] ?? match[4] ?? ''

        // Block all inline event handlers (onclick, onerror, onload, etc.)
        if (attrName.startsWith('on')) continue

        if (attrName === 'class') {
            const safeClass = attrValue.replace(/[^a-zA-Z0-9\-_\s:/[\]#.%]/g, '').trim()
            if (safeClass) {
                safeAttrs.push(`class="${escapeHtml(safeClass)}"`)
            }
            continue
        }

        if (attrName === 'style') {
            const safeStyle = sanitizeStyleAttribute(attrValue)
            if (safeStyle) {
                safeAttrs.push(`style="${escapeHtml(safeStyle)}"`)
            }
            continue
        }

        if (tagName === 'a') {
            if (attrName === 'href') {
                const safeHref = sanitizeUrl(attrValue, true)
                if (safeHref) {
                    safeAttrs.push(`href="${escapeHtml(safeHref)}"`)
                }
            } else if (attrName === 'target' && attrValue === '_blank') {
                hasTargetBlank = true
                safeAttrs.push('target="_blank"')
            }
            continue
        }

        if (tagName === 'img') {
            if (attrName === 'src') {
                const safeSrc = sanitizeUrl(attrValue, false)
                if (safeSrc) {
                    safeAttrs.push(`src="${escapeHtml(safeSrc)}"`)
                }
            } else if (attrName === 'alt' || attrName === 'title') {
                safeAttrs.push(`${attrName}="${escapeHtml(attrValue)}"`)
            } else if (attrName === 'width' || attrName === 'height') {
                const safeDim = attrValue.replace(/[^0-9.%px]/g, '')
                if (safeDim) {
                    safeAttrs.push(`${attrName}="${escapeHtml(safeDim)}"`)
                }
            }
        }
    }

    if (tagName === 'a') {
        if (hasTargetBlank) {
            safeAttrs.push('rel="noopener noreferrer"')
        } else {
            safeAttrs.push('rel="noopener noreferrer"')
        }
    }

    return safeAttrs.length > 0 ? ' ' + safeAttrs.join(' ') : ''
}

export function sanitizeHtml(html: string | null | undefined): string {
    if (!html || typeof html !== 'string') return ''

    let cleaned = html
        // Remove HTML comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove dangerous container elements and their entire contents
        .replace(/<(script|style|iframe|object|embed|svg|math|form|input|button|textarea|select|meta|link|base|applet|template)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
        // Remove self-closing or unclosed dangerous tags
        .replace(/<\/?(script|style|iframe|object|embed|svg|math|form|input|button|textarea|select|meta|link|base|applet|template)\b[^>]*\/?>/gi, '')

    // Process remaining HTML tags against strict allowlist
    cleaned = cleaned.replace(/<\/?([a-zA-Z0-9]+)\b([^>]*)>/g, (fullMatch, rawTag: string, rawAttrs: string) => {
        const tagName = rawTag.toLowerCase()
        if (!ALLOWED_TAGS.has(tagName)) {
            return ''
        }

        const isClosing = fullMatch.startsWith('</')
        if (isClosing) {
            return VOID_TAGS.has(tagName) ? '' : `</${tagName}>`
        }

        const sanitizedAttrs = sanitizeTagAttributes(tagName, rawAttrs)
        if (tagName === 'img' && !sanitizedAttrs.includes('src="')) {
            return ''
        }

        return `<${tagName}${sanitizedAttrs}>`
    })

    return cleaned
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
        return { valid: false, error: 'No file selected.' }
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return { valid: false, error: 'Image must be 5 MB or smaller.' }
    }

    const mimeType = file.type.toLowerCase()
    if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
        return {
            valid: false,
            error: 'Only JPG, PNG, WEBP, and GIF images are allowed (SVG is not permitted).',
        }
    }

    const parts = file.name.toLowerCase().split('.')
    const ext = parts.length > 1 ? parts[parts.length - 1] : ''
    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
        return {
            valid: false,
            error: 'Invalid file extension. Allowed: .jpg, .jpeg, .png, .webp, .gif',
        }
    }

    return { valid: true }
}

export function generateSafeStorageFilename(originalName: string): string {
    const parts = originalName.toLowerCase().split('.')
    const ext = parts.length > 1 ? parts[parts.length - 1].replace(/[^a-z0-9]/g, '') : 'jpg'
    const safeExt = ALLOWED_IMAGE_EXTENSIONS.has(ext) ? ext : 'jpg'

    const randomBytes = new Uint8Array(8)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(randomBytes)
    } else {
        for (let i = 0; i < randomBytes.length; i++) {
            randomBytes[i] = Math.floor(Math.random() * 256)
        }
    }
    const hex = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

    return `${Date.now()}-${hex}.${safeExt}`
}

export function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }
    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
        return realIp.trim()
    }
    return 'unknown'
}

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const cutoff = now - windowMs

    // Periodic cleanup to avoid unbounded memory growth
    if (rateLimitStore.size > 2000) {
        rateLimitStore.forEach((entry, k) => {
            const active = entry.timestamps.filter((t) => t > cutoff)
            if (active.length === 0) {
                rateLimitStore.delete(k)
            } else {
                entry.timestamps = active
            }
        })
    }

    const existing = rateLimitStore.get(key)
    const validTimestamps = existing ? existing.timestamps.filter((t) => t > cutoff) : []

    if (validTimestamps.length >= maxRequests) {
        rateLimitStore.set(key, { timestamps: validTimestamps })
        return false
    }

    validTimestamps.push(now)
    rateLimitStore.set(key, { timestamps: validTimestamps })
    return true
}

export function verifySameOrigin(request: Request): boolean {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    if (!origin) {
        // Require Origin header on browser POST requests
        return false
    }

    try {
        const originUrl = new URL(origin)
        if (host && originUrl.host === host) {
            return true
        }

        const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
        if (configuredSiteUrl) {
            const siteUrl = new URL(configuredSiteUrl)
            if (originUrl.host === siteUrl.host) {
                return true
            }
        }

        return false
    } catch {
        return false
    }
}
