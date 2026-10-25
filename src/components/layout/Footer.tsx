import Container from './Container'

export default function Footer() {
    return (
        <footer className="pt-24 pb-16 text-xs text-muted">
            <Container className="flex flex-row justify-between items-center gap-4">
                <p className="m-0">{new Date().getFullYear()} Amal Yulianto. All rights reserved.</p>
                <div className="flex items-center gap-1.5">
                    <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-3.5 h-3.5 text-foreground/80 shrink-0"
                        aria-hidden="true"
                    >
                        <path d="M19 6.5c-.6 0-1.1.3-1.4.8L16.8 6l-.3 2.5c-.9-.3-1.9-.5-3-.5-2.6 0-4.9 1.1-6.2 2.8-.6-.9-1-2-1-3.3 0-1.5.6-2.9 1.7-3.9.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0C5.1 3.6 4.3 5.5 4.3 7.5c0 2 .8 3.9 2.1 5.2-.3.7-.4 1.5-.4 2.3v5c0 .6.4 1 1 1s1-.4 1-1v-3h2v3c0 .6.4 1 1 1s1-.4 1-1v-3c1.1 0 2.1-.2 3-.5v3.5c0 .6.4 1 1 1s1-.4 1-1v-4.3c.6.2 1.3.3 2 .3 1.7 0 3-1.3 3-3V9.5c0-1.7-1.3-3-3-3z" />
                    </svg>
                    <span>Based in Gorontalo, Indonesia</span>
                </div>
            </Container>
        </footer>
    )
}
