import Link from 'next/link'
import { Category } from '@/lib/types'

interface CategoryFilterProps {
    categories: Category[]
    activeSlug?: string
}

export default function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
    return (
        <nav className="flex flex-wrap gap-2">
            <Link
                href="/blog"
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors no-underline ${!activeSlug
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    }`}
            >
                Semua Tulisan
            </Link>
            {categories.map((category) => (
                <Link
                    key={category.id}
                    href={`/blog/category/${category.slug}`}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors no-underline capitalize ${activeSlug === category.slug
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
