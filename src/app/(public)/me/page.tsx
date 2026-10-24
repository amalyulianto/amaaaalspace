import Link from 'next/link'

export default function PersonalHomePage() {
    const navItems = [
        { title: 'Tulisan', path: '/blog', category: 'Blog' },
        { title: 'Karya', path: '/portfolio', category: 'Portfolio' },
        { title: 'Resume', path: '/resume', category: 'CV' },
        { title: 'Buku Tamu', path: '/guestbook', category: 'Guestbook' },
        { title: 'Links', path: '/links', category: 'Tautan' },
    ]

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pt-4">
            {/* Hero Section */}
            <section className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Halo, ini Amal.
                </h1>
                <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl font-normal">
                    Saya orang. Suka menulis. Menulis kode, menulis blog, menulis cerita pendek, menulis apa saja kalau lagi pengen. Suka main catur juga walaupun yang ini agak sedikit bodoh dan tidak mahir, add amalyulianto di chess.com. Akhir-akhir ini juga lagi hobi Stand Up Comedy.
                </p>
            </section>

            {/* Minimalist List Navigation */}
            <section className="pt-2 max-w-md">
                {/* Header matching reference */}
                <div className="mb-6 space-y-0.5">
                    <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Direktori
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-normal">
                        5 halaman
                    </p>
                </div>

                {/* List items */}
                <ul className="space-y-3.5">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                href={item.path}
                                className="group flex items-baseline justify-between py-1 text-neutral-900 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                <span className="font-semibold text-base tracking-tight group-hover:underline">
                                    {item.title}
                                </span>
                                <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">
                                    {item.category}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Bottom subtle prompt */}
                <div className="pt-6">
                    <span className="text-sm text-neutral-400 dark:text-neutral-500 font-normal select-none">
                        Mampir dan baca-baca...
                    </span>
                </div>
            </section>
        </div>
    )
}
