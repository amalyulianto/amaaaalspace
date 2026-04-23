import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { LinkItem } from '@/lib/types'
import {
    Link2, Mail, Globe, Book, Briefcase, FileText, Code,
    MessageSquare, Coffee, Video, Music, Monitor, Smartphone, Heart, Star, Cloud
} from 'lucide-react'

export const metadata: Metadata = {
    title: 'Links | Alapakadala',
    description: 'All my important links in one place.',
}

const getIcon = (name: string | null) => {
    if (!name) return Link2;
    const icons: Record<string, any> = {
        Mail, Globe, Book, Briefcase, FileText, Code,
        MessageSquare, Coffee, Video, Music, Monitor, Smartphone, Heart, Star, Cloud, Link2
    }
    return icons[name] || Link2;
}

export default async function LinksPage() {
    const supabase = createClient()

    const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .order('display_order', { ascending: true })

    const links: LinkItem[] = linksData || []

    return (
        <div className="max-w-xl mx-auto pt-8 pb-16 animate-in fade-in duration-500">
            <header className="text-center mb-12">
                <div className="w-20 h-20 bg-neutral-100 rounded-full mx-auto mb-6 flex items-center justify-center border border-neutral-200 shadow-sm overflow-hidden text-2xl font-bold text-neutral-400">
                    A
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Alapakadala</h1>
                <p className="text-neutral-500">Developer & Designer</p>
            </header>

            <div className="space-y-4">
                {links.map((link) => {
                    const Icon = getIcon(link.icon);
                    return (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-900 hover:shadow-sm transition-all duration-300 no-underline relative overflow-hidden"
                        >
                            {/* Hover background effect */}
                            <div className="absolute inset-0 bg-neutral-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />

                            <div className="relative z-10 flex items-center w-full">
                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-white group-hover:text-neutral-900 transition-colors border border-transparent group-hover:border-neutral-200 shrink-0">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-center font-medium text-neutral-900 truncate px-4">
                                    {link.title}
                                </div>
                                <div className="w-10 h-10 shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Globe className="w-4 h-4 text-neutral-400" />
                                </div>
                            </div>
                        </a>
                    )
                })}

                {links.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                        <p className="text-neutral-500">No links added exactly yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
