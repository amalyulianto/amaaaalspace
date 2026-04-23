import Link from 'next/link'
import { Category } from '@/lib/types'

interface CategoryFilterProps {
    categories: Category[]
    activeSlug?: string
}

export default function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-8">
            <Link
                href="/blog"
                className={`text-[0.9rem] no-underline hover:underline ${!activeSlug ? 'font-bold text-[#111111]' : 'text-blue-600'}`}
            >
                All
            </Link>
            {categories.map((category) => (
                <Link
                    key={category.id}
                    href={`/blog/category/${category.slug}`}
                    className={`text-[0.9rem] no-underline hover:underline ${activeSlug === category.slug ? 'font-bold text-[#111111]' : 'text-blue-600'}`}
                >
                    {category.name}
                </Link>
            ))}
        </div>
    )
}
