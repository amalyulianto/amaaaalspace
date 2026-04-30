import Link from 'next/link'
import { PortfolioCategory } from '@/lib/types'

interface CategoryFilterProps {
    categories: PortfolioCategory[]
    activeSlug?: string
}

export default function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
    return (
        <nav className="flex flex-wrap gap-2">
            <Link
                href="/portfolio"
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors no-underline ${!activeSlug
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    }`}
            >
                Semua Karya
            </Link>
            {categories.map((category) => (
                <Link
                    key={category.id}
                    href={`/portfolio?category=${category.slug}`}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors no-underline ${activeSlug === category.slug
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                        }`}
                >
                    {category.name}
                </Link>
            ))}
        </nav>
    )
}
