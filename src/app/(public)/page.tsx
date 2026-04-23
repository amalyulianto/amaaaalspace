import Link from 'next/link'
import { ArrowRight, BookOpen, Briefcase, FileText, MessageSquare, Link2 } from 'lucide-react'

export default function HomePage() {

    const navItems = [
        { title: "Blog", path: "/blog", desc: "Writing about web development and design.", icon: BookOpen },
        { title: "Portfolio", path: "/portfolio", desc: "Selected projects and open-source.", icon: Briefcase },
        { title: "Resume", path: "/resume", desc: "Professional experience and skills.", icon: FileText },
        { title: "Guestbook", path: "/guestbook", desc: "Leave a trace, say hello.", icon: MessageSquare },
        { title: "Links", path: "/links", desc: "All my social icons and important links.", icon: Link2 },
    ];

    return (
        <div className="space-y-16 animate-in fade-in duration-500">
            {/* Hero Section */}
            <section className="space-y-6 pt-4 md:pt-10">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
                    Hi, I'm Alapakadala.
                </h1>
                <p className="text-xl sm:text-2xl text-neutral-600 leading-relaxed max-w-2xl font-light">
                    I'm a Flutter developer and designer who loves building clean, accessible, and performant web applications.
                </p>
            </section>

            {/* Navigation Grid */}
            <nav className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 pt-8">
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
