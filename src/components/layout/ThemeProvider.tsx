'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'
import { Language, TRANSLATIONS } from '@/lib/constants'
import { formatDate, formatDateShort } from '@/lib/utils'

interface LanguageContextType {
    lang: Language
    setLang: (lang: Language) => void
    t: (typeof TRANSLATIONS)[Language]
}

const LanguageContext = React.createContext<LanguageContextType>({
    lang: 'ID',
    setLang: () => {},
    t: TRANSLATIONS.ID,
})

export function useLanguage() {
    return React.useContext(LanguageContext)
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    const [lang, setLangState] = React.useState<Language>('ID')

    React.useEffect(() => {
        const saved = window.localStorage.getItem('amal_lang')
        if (saved === 'ID' || saved === 'EN') {
            setLangState(saved)
        }
    }, [])

    const setLang = React.useCallback((nextLang: Language) => {
        setLangState(nextLang)
        window.localStorage.setItem('amal_lang', nextLang)
    }, [])

    const value = React.useMemo(
        () => ({
            lang,
            setLang,
            t: TRANSLATIONS[lang],
        }),
        [lang, setLang]
    )

    return (
        <NextThemesProvider {...props}>
            <LanguageContext.Provider value={value}>
                {children}
            </LanguageContext.Provider>
        </NextThemesProvider>
    )
}

export function T<S extends keyof (typeof TRANSLATIONS)['ID']>({
    section,
    k,
}: {
    section: S
    k: keyof (typeof TRANSLATIONS)['ID'][S]
}) {
    const { t } = useLanguage()
    const sectionObj = t[section] as Record<string, string>
    return <>{sectionObj[k as string] ?? ''}</>
}

export function LocalizedDate({
    date,
    short = false,
}: {
    date: string | null | undefined
    short?: boolean
}) {
    const { lang } = useLanguage()
    return <>{short ? formatDateShort(date, lang) : formatDate(date, lang)}</>
}
