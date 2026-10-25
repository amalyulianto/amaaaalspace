import { createPublicClient } from '@/lib/supabase/server'
import { Resume, ResumeData } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
    title: 'Resume',
    description: 'Work experience, education, and technical skills.',
}

export default async function ResumePage() {
    const supabase = createPublicClient()

    const { data: resumeRecord } = await supabase
        .from('resume')
        .select('*')
        .limit(1)
        .single()

    const resume = resumeRecord as Resume | null
    const content: ResumeData = resume?.content || {
        summary: '',
        experience: [],
        education: [],
        skills: []
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <header className="space-y-3 border-b border-border pb-6">
                <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-foreground leading-tight m-0">
                    Resume 📃
                </h1>
                {content.summary && (
                    <p className="text-base sm:text-[17px] text-secondary leading-relaxed m-0 pt-1">
                        {content.summary}
                    </p>
                )}
            </header>

            {/* Experience */}
            {content.experience?.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xs font-mono uppercase tracking-wider text-muted m-0">
                        Work Experience
                    </h2>

                    <div className="space-y-3">
                        {content.experience.map((exp, index) => (
                            <Card key={index} className="space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                    <h3 className="text-base sm:text-[17px] font-medium text-foreground m-0">
                                        {exp.role}{' '}
                                        <span className="text-secondary font-normal">at {exp.company}</span>
                                    </h3>
                                    {exp.period && (
                                        <span className="text-xs font-mono text-muted tabular-nums shrink-0">
                                            {exp.period}
                                        </span>
                                    )}
                                </div>
                                {exp.description && (
                                    <p className="text-sm sm:text-[15px] text-secondary leading-relaxed m-0">
                                        {exp.description}
                                    </p>
                                )}
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {content.education?.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xs font-mono uppercase tracking-wider text-muted m-0">
                        Education
                    </h2>

                    <div className="space-y-3">
                        {content.education.map((edu, index) => (
                            <Card key={index} className="space-y-1.5">
                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                    <h3 className="text-base sm:text-[17px] font-medium text-foreground m-0">
                                        {edu.degree}{' '}
                                        <span className="text-secondary font-normal">at {edu.institution}</span>
                                    </h3>
                                    {edu.period && (
                                        <span className="text-xs font-mono text-muted tabular-nums shrink-0">
                                            {edu.period}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {content.skills?.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-xs font-mono uppercase tracking-wider text-muted m-0">
                        Skills
                    </h2>

                    <div className="flex flex-wrap gap-2">
                        {content.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 rounded-lg text-xs sm:text-sm font-medium bg-surface text-secondary border border-border"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
