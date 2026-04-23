import { createPublicClient } from '@/lib/supabase/server'
import { Resume, ResumeData } from '@/lib/types'
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
            <div className="space-y-16 animate-in fade-in duration-500 pt-4 md:pt-10">
                <header className="space-y-4 border-b border-neutral-100 pb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
                    <p className="text-lg text-neutral-600 leading-relaxed">
                        Currently unavailable.
                    </p>
                </header>
            </div>
        )
    }

    return (
        <article className="animate-in fade-in duration-500">
            <header className="space-y-4 border-b border-neutral-100 pb-8">
                <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
                {content.summary && (
                    <p className="text-lg text-neutral-600 leading-relaxed whitespace-pre-wrap">
                        {content.summary}
                    </p>
                )}
            </header>

            {/* Experience */}
            {content.experience && content.experience.length > 0 && (
                <section className="space-y-8 mt-12">
                    <h2 className="text-2xl font-bold tracking-tight">Experience</h2>
                    <div className="space-y-12 border-l-2 border-neutral-100 pl-6 ml-2 relative">
                        {content.experience.map((exp, i) => (
                            <div key={i} className="relative">
                                <span className="absolute w-3 h-3 rounded-full bg-neutral-900 border-2 border-white -left-[31px] top-1.5" />
                                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2 gap-1">
                                    <h3 className="text-xl font-bold text-neutral-900">{exp.role}</h3>
                                    <span className="text-sm font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                        {exp.period}
                                    </span>
                                </div>
                                <h4 className="text-lg font-medium text-blue-600 mb-4">{exp.company}</h4>
                                <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                                    {exp.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {content.education && content.education.length > 0 && (
                <section className="space-y-8 mt-16">
                    <h2 className="text-2xl font-bold tracking-tight">Education</h2>
                    <div className="space-y-8">
                        {content.education.map((edu, i) => (
                            <div key={i} className="flex flex-col md:flex-row justify-between md:items-baseline gap-1 bg-neutral-50 p-6 rounded-xl border border-neutral-100">
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900">{edu.degree}</h3>
                                    <h4 className="text-md font-medium text-neutral-600">{edu.institution}</h4>
                                </div>
                                <span className="text-sm font-medium text-neutral-500">{edu.period}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {content.skills && content.skills.length > 0 && (
                <section className="space-y-8 mt-16">
                    <h2 className="text-2xl font-bold tracking-tight">Skills</h2>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                        {content.skills.map((skill, i) => (
                            <li key={i} className="flex items-center gap-2 text-neutral-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                <span className="text-sm font-medium">{skill}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </article>
    )
}
