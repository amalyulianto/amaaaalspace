import { createPublicClient } from '@/lib/supabase/server'
import { Resume, ResumeData, ResumeSectionKey } from '@/lib/types'
import { ProfileBadge } from '@/components/ui/Badge'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { T } from '@/components/layout/ThemeProvider'
import { ArrowUpRight } from 'lucide-react'
import { sanitizeUrl } from '@/lib/security'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
    title: 'Resume',
    description: 'Resume of Alapakadala, Flutter developer.',
}

const DEFAULT_SECTIONS: ResumeSectionKey[] = [
    'experience',
    'education',
    'organisational',
    'projects',
    'achievements',
    'skills',
]

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
                        <T section="resume" k="title" />
                    </h1>

                    <ProfileBadge />

                    <p className="text-sm sm:text-[15px] text-secondary leading-relaxed m-0">
                        <T section="resume" k="unavailable" />
                    </p>
                </header>
            </div>
        )
    }

    const sectionOrder: ResumeSectionKey[] =
        Array.isArray(content.section_order) && content.section_order.length > 0
            ? content.section_order
            : DEFAULT_SECTIONS

    const renderSection = (key: ResumeSectionKey) => {
        switch (key) {
            case 'experience':
                if (!content.experience || content.experience.length === 0) return null
                return (
                    <section key={key} className="space-y-4 pt-1">
                        <SectionHeading>
                            <T section="resume" k="experienceTitle" />
                        </SectionHeading>
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
                )

            case 'education':
                if (!content.education || content.education.length === 0) return null
                return (
                    <section key={key} className="space-y-4 pt-1">
                        <SectionHeading>
                            <T section="resume" k="educationTitle" />
                        </SectionHeading>
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
                )

            case 'organisational':
                if (!content.organisational || content.organisational.length === 0) return null
                return (
                    <section key={key} className="space-y-4 pt-1">
                        <SectionHeading>
                            <T section="resume" k="organisationalTitle" />
                        </SectionHeading>
                        <div className="space-y-6">
                            {content.organisational.map((org, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                        <h3 className="text-base sm:text-[17px] font-medium text-foreground leading-snug m-0">
                                            {org.role}{' '}
                                            <span className="text-muted font-normal">
                                                · {org.organization}
                                            </span>
                                        </h3>
                                        <span className="text-xs text-muted shrink-0 tabular-nums">
                                            {org.period}
                                        </span>
                                    </div>
                                    {org.description && (
                                        <p className="text-base sm:text-[16px] text-secondary leading-relaxed whitespace-pre-wrap m-0">
                                            {org.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )

            case 'projects':
                if (!content.projects || content.projects.length === 0) return null
                return (
                    <section key={key} className="space-y-4 pt-1">
                        <SectionHeading>
                            <T section="resume" k="projectsTitle" />
                        </SectionHeading>
                        <div className="space-y-6">
                            {content.projects.map((prj, i) => {
                                const safeUrl = sanitizeUrl(prj.url)
                                return (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                            <h3 className="text-base sm:text-[17px] font-medium text-foreground leading-snug m-0 flex items-center gap-1.5">
                                                {safeUrl ? (
                                                    <a
                                                        href={safeUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 hover:underline underline-offset-4 text-foreground no-underline"
                                                    >
                                                        <span>{prj.title}</span>
                                                        <ArrowUpRight className="w-3.5 h-3.5 text-muted hover:text-foreground shrink-0" />
                                                    </a>
                                                ) : (
                                                    <span>{prj.title}</span>
                                                )}
                                                {prj.role && (
                                                    <span className="text-muted font-normal">
                                                        · {prj.role}
                                                    </span>
                                                )}
                                            </h3>
                                            <span className="text-xs text-muted shrink-0 tabular-nums">
                                                {prj.period}
                                            </span>
                                        </div>
                                        {prj.description && (
                                            <p className="text-base sm:text-[16px] text-secondary leading-relaxed whitespace-pre-wrap m-0">
                                                {prj.description}
                                            </p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )

            case 'achievements':
                if (!content.achievements || content.achievements.length === 0) return null
                return (
                    <section key={key} className="space-y-4 pt-1">
                        <SectionHeading>
                            <T section="resume" k="achievementsTitle" />
                        </SectionHeading>
                        <div className="space-y-6">
                            {content.achievements.map((ach, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                        <h3 className="text-base sm:text-[17px] font-medium text-foreground leading-snug m-0">
                                            {ach.title}{' '}
                                            <span className="text-muted font-normal">
                                                · {ach.issuer}
                                            </span>
                                        </h3>
                                        <span className="text-xs text-muted shrink-0 tabular-nums">
                                            {ach.period}
                                        </span>
                                    </div>
                                    {ach.description && (
                                        <p className="text-base sm:text-[16px] text-secondary leading-relaxed whitespace-pre-wrap m-0">
                                            {ach.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )

            case 'skills':
                if (!content.skills || content.skills.length === 0) return null
                return (
                    <section key={key} className="space-y-4 pt-1">
                        <SectionHeading>
                            <T section="resume" k="skillsTitle" />
                        </SectionHeading>
                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-6 m-0 p-0 list-none">
                            {content.skills.map((skill, i) => (
                                <li key={i} className="text-base sm:text-[16px] text-secondary">
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </section>
                )

            default:
                return null
        }
    }

    return (
        <article className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-5">
                <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-foreground leading-tight m-0">
                    <T section="resume" k="title" />
                </h1>

                <ProfileBadge />

                {content.summary && (
                    <p className="text-base sm:text-[17px] text-secondary leading-relaxed whitespace-pre-wrap m-0">
                        {content.summary}
                    </p>
                )}
            </header>

            <div className="space-y-8">
                {sectionOrder.map((sectionKey) => renderSection(sectionKey))}
            </div>
        </article>
    )
}
