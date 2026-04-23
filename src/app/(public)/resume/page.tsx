import { createClient } from '@/lib/supabase/server'
import Container from '@/components/layout/Container'
import { Resume, ResumeData } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Resume',
    description: 'Resume of Alapakadala, Flutter developer.',
}

export default async function ResumePage() {
    const supabase = createClient()

    const { data } = await supabase
        .from('resume')
        .select('*')
        .limit(1)
        .single()

    const resume: Resume | null = data ?? null
    const content: ResumeData | null = resume?.content ?? null

    if (!content) {
        return (
            <Container>
                <h1 className="text-[1.8rem] font-bold mb-8">Resume</h1>
                <p className="text-[#666666]">Resume coming soon.</p>
            </Container>
        )
    }

    return (
        <Container>
            <h1 className="text-[1.8rem] font-bold mb-8">Resume</h1>

            {/* Summary */}
            {content.summary && (
                <section className="mb-10">
                    <h2 className="text-[1.1rem] font-semibold mb-3">Summary</h2>
                    <p className="text-[#666666] leading-relaxed">{content.summary}</p>
                </section>
            )}

            {/* Experience */}
            {content.experience && content.experience.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-[1.1rem] font-semibold mb-4">Experience</h2>
                    <div className="space-y-6">
                        {content.experience.map((exp, i) => (
                            <div key={i}>
                                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                                    <span className="font-semibold">{exp.role}</span>
                                    <span className="text-[0.85rem] text-[#666666]">{exp.period}</span>
                                </div>
                                <p className="text-[0.9rem] text-[#666666] mb-1">{exp.company}</p>
                                <p className="text-[0.95rem] text-[#111111] leading-relaxed">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {content.education && content.education.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-[1.1rem] font-semibold mb-4">Education</h2>
                    <div className="space-y-4">
                        {content.education.map((edu, i) => (
                            <div key={i}>
                                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                                    <span className="font-semibold">{edu.degree}</span>
                                    <span className="text-[0.85rem] text-[#666666]">{edu.period}</span>
                                </div>
                                <p className="text-[0.9rem] text-[#666666]">{edu.institution}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {content.skills && content.skills.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-[1.1rem] font-semibold mb-3">Skills</h2>
                    <p className="text-[#666666]">{content.skills.join(', ')}</p>
                </section>
            )}
        </Container>
    )
}
