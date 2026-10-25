import { createPublicClient } from '@/lib/supabase/server'
import { Resume, ResumeData } from '@/lib/types'
import { ProfileBadge } from '@/components/ui/Badge'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
    title: 'Resume',
    description: 'Resume of Alapakadala, Flutter developer.',
}

export default async function ResumePage() {
    const supabase = createPublicClient()

    const { data } = await supabase
        .from('resume')
        .select('*')
        .limit(1)
        .single()

    const resume: Resume | null = data ?? null
    const content: ResumeData | null = resume?.content ?? null

    if (!content) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <header className="space-y-5">
                    <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-foreground leading-tight m-0">
                        Resume 📃
                    </h1>

                    <ProfileBadge />

                    <p className="text-sm sm:text-[15px] text-secondary leading-relaxed m-0">
                        Currently unavailable.
                    </p>
                </header>
            </div>
        )
    }

    return (
        <article className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-5">
                <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-foreground leading-tight m-0">
                    Resume 📃
                </h1>

                <ProfileBadge />

                {content.summary && (
                    <p className="text-base sm:text-[17px] text-secondary leading-relaxed whitespace-pre-wrap m-0">
                        {content.summary}
                    </p>
                )}
            </header>

            {/* Experience */}
            {content.experience && content.experience.length > 0 && (
                <section className="space-y-4 pt-1">
                    <SectionHeading>Experience 💼</SectionHeading>
                    <div className="space-y-6">
                        {content.experience.map((exp, i) => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                    <h3 className="text-base sm:text-[17px] font-medium text-foreground leading-snug m-0">
                                        {exp.role}{' '}
                                        <span className="text-muted font-normal">
                                            · {exp.company}
                                        </span>
                                    </h3>
                                    <span className="text-xs text-muted shrink-0 tabular-nums">
                                        {exp.period}
                                    </span>
                                </div>
                                {exp.description && (
                                    <p className="text-base sm:text-[16px] text-secondary leading-relaxed whitespace-pre-wrap m-0">
                                        {exp.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {content.education && content.education.length > 0 && (
                <section className="space-y-4 pt-1">
                    <SectionHeading>Education 🎓</SectionHeading>
                    <div className="space-y-4">
                        {content.education.map((edu, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                <div>
                                    <h3 className="text-base sm:text-[17px] font-medium text-foreground leading-snug m-0">
                                        {edu.degree}
                                    </h3>
                                    <p className="text-sm text-muted mt-0.5 m-0">
                                        {edu.institution}
                                    </p>
                                </div>
                                <span className="text-xs text-muted shrink-0 tabular-nums">
                                    {edu.period}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {content.skills && content.skills.length > 0 && (
                <section className="space-y-4 pt-1">
                    <SectionHeading>Skills 🛠️</SectionHeading>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-6">
                        {content.skills.map((skill, i) => (
                            <li key={i} className="text-base sm:text-[16px] text-secondary">
                                {skill}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </article>
    )
}
