import Link from 'next/link'
import { ArrowRight, BookOpen, Briefcase, FileText, MessageSquare, Link2 } from 'lucide-react'

export default function HomePage() {

    const navItems = [
        { title: "Tulisan", path: "/blog", desc: "Blog pribadi karena suka nulis. Tulisan tentang apa saja.", icon: BookOpen },
        { title: "Karya", path: "/portfolio", desc: "Karya-karya yang pernah dibuat yang berani dipublikasikan. Tidak semua bagus, tapi ada yang bagus, kok...", icon: Briefcase },
        { title: "Resume", path: "/resume", desc: "Lihat pengalaman dan rekam jejak saya.", icon: FileText },
        { title: "Buku Tamu", path: "/guestbook", desc: "Tinggalkan jejak, kayak di Kaskus.", icon: MessageSquare },
        { title: "Links", path: "/links", desc: "Semua link penting tentang achu.", icon: Link2 },
    ];

    return (
        <div className="space-y-16 animate-in fade-in duration-500">
            {/* Hero Section */}
            <section className="space-y-6 pt-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
                    Halo, ini Amal.
                </h1>
                <p className="text-xl sm:text-2xl text-neutral-600 leading-relaxed max-w-2xl font-light">
                    Saya orang. Suka menulis. Menulis kode, menulis blog, menulis cerita pendek, menulis apa saja kalau lagi pengen. Suka main catur juga walaupun yang ini agak sedikit bodoh dan tidak mahir, add amalyulianto di chess.com. Akhir-akhir ini juga lagi hobi Stand Up Comedy.
                </p>
            </section>

            {/* Navigation Grid */}
            <nav className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 pt-2">
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className="group p-6 border border-neutral-200 rounded-2xl hover:border-neutral-900 hover:shadow-sm bg-white transition-all duration-300 relative overflow-hidden flex flex-col h-full"
                    >
                        {/* Subtle background highlight on hover */}
                        <div className="absolute inset-0 bg-neutral-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-white transition-colors duration-300 border border-transparent group-hover:border-neutral-200">
                                    <item.icon className="w-5 h-5 text-neutral-700 group-hover:text-neutral-900" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-900 group-hover:-rotate-45 transition-all duration-300" />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900 mb-2">{item.title}</h2>
                            <p className="text-neutral-500 text-sm leading-relaxed flex-grow">{item.desc}</p>
                        </div>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
