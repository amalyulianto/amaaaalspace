import { GitBranch, Camera, Briefcase, Mail, PenTool, Castle } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="py-8 px-4 md:px-8 mt-auto text-center text-sm text-neutral-500 dark:text-neutral-400">
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <p>© {new Date().getFullYear()} Amal Yulianto. All rights reserved.</p>
                <div className="flex gap-4">
                    {/* Note: I'm leaving standard href placeholders for now. Feel free to update them! */}
                    <a href="https://github.com/amalyulianto" target="_blank" rel="noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors text-neutral-500 dark:text-neutral-400 no-underline" aria-label="GitHub">
                        <GitBranch className="w-5 h-5" />
                        <span className="sr-only">GitHub</span>
                    </a>
                    <a href="https://instagram.com/amalyulianto" target="_blank" rel="noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors text-neutral-500 dark:text-neutral-400 no-underline" aria-label="Instagram">
                        <Camera className="w-5 h-5" />
                        <span className="sr-only">Instagram</span>
                    </a>
                    <a href="https://linkedin.com/in/amalyulianto" target="_blank" rel="noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors text-neutral-500 dark:text-neutral-400 no-underline" aria-label="LinkedIn">
                        <Briefcase className="w-5 h-5" />
                        <span className="sr-only">LinkedIn</span>
                    </a>
                    <a href="mailto:amal.yulianto@gmail.com" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors text-neutral-500 dark:text-neutral-400 no-underline" aria-label="Email">
                        <Mail className="w-5 h-5" />
                        <span className="sr-only">Email</span>
                    </a>
                    <a href="https://medium.com/@amalyulianto" target="_blank" rel="noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors text-neutral-500 dark:text-neutral-400 no-underline" aria-label="Medium">
                        <PenTool className="w-5 h-5" />
                        <span className="sr-only">Medium</span>
                    </a>
                    <a href="https://www.chess.com/member/amalyulianto" target="_blank" rel="noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors text-neutral-500 dark:text-neutral-400 no-underline" aria-label="Chess.com">
                        <Castle className="w-5 h-5" />
                        <span className="sr-only">Chess.com</span>
                    </a>
                </div>
            </div>
        </footer>
    )
}
