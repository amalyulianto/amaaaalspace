import { Code, MessageCircle, Briefcase, Mail } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="py-8 px-4 md:px-8 mt-auto text-center text-sm text-neutral-500">
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <p>© {new Date().getFullYear()} Alapakadala. All rights reserved.</p>
                <div className="flex gap-4">
                    {/* Note: I'm leaving standard href placeholders for now. Feel free to update them! */}
                    <a href="https://github.com/alapakadala" target="_blank" rel="noreferrer" className="hover:text-neutral-900 transition-colors text-neutral-500 no-underline">
                        <Code className="w-5 h-5" />
                        <span className="sr-only">GitHub</span>
                    </a>
                    <a href="https://twitter.com/alapakadala" target="_blank" rel="noreferrer" className="hover:text-neutral-900 transition-colors text-neutral-500 no-underline">
                        <MessageCircle className="w-5 h-5" />
                        <span className="sr-only">Twitter</span>
                    </a>
                    <a href="https://linkedin.com/in/alapakadala" target="_blank" rel="noreferrer" className="hover:text-neutral-900 transition-colors text-neutral-500 no-underline">
                        <Briefcase className="w-5 h-5" />
                        <span className="sr-only">LinkedIn</span>
                    </a>
                    <a href="mailto:hello@alapakadala.com" className="hover:text-neutral-900 transition-colors text-neutral-500 no-underline">
                        <Mail className="w-5 h-5" />
                        <span className="sr-only">Email</span>
                    </a>
                </div>
            </div>
        </footer>
    )
}
