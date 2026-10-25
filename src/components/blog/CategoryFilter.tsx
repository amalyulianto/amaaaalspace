'use client'

import Link from 'next/link'
import { Category } from '@/lib/types'
import { useLanguage } from '@/components/layout/ThemeProvider'

interface CategoryFilterProps {
    categories: Category[]
    activeSlug?: string
}

export default function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
    const { t } = useLanguage()

    return (
        <nav className="flex flex-wrap items-center gap-6">
            <Link
                href="/blog"
                className={`text-sm sm:text-[15px] transition-colors ${
                    !activeSlug
                        ? 'font-medium text-foreground underline underline-offset-4'
                        : 'font-normal text-muted hover:text-foreground no-underline'
                }`}
            >
                {t.blog.allFilter}
            </Link>
            {categories.map((category) => (
                <Link
                    key={category.id}
                    href={`/blog/category/${category.slug}`}
                    className={`text-sm sm:text-[15px] capitalize transition-colors ${
                        activeSlug === category.slug
                            ? 'font-medium text-foreground underline underline-offset-4'
                            : 'font-normal text-muted hover:text-foreground no-underline'
                    }`}
                >
                    {category.name}
                </Link>
            ))}
        </nav>
    )
}
