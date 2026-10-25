'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Resume, ResumeData } from '@/lib/types'

const initialResumeData: ResumeData = {
    summary: '',
    experience: [],
    education: [],
    skills: []
}

export default function AdminResumePage() {
    const [resumeId, setResumeId] = useState<string | null>(null)
    const [data, setData] = useState<ResumeData>(initialResumeData)
    const [skillsInput, setSkillsInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        fetchResume()
    }, [])

    const fetchResume = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: resumes } = await supabase.from('resume').select('*').limit(1)
        if (resumes && resumes.length > 0) {
            const resume = resumes[0] as Resume
            setResumeId(resume.id)
            setData(resume.content)
            setSkillsInput(resume.content.skills?.join(', ') || '')
        }
        setFetching(false)
    }

    const handleSave = async () => {
        setLoading(true)
        setError('')
        setMessage('')

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const finalData: ResumeData = {
            ...data,
            skills: skillsInput.split(',').map(s => s.trim()).filter(s => s !== '')
        }

        if (resumeId) {
            const { error: updateError } = await supabase
                .from('resume')
                .update({ content: finalData, updated_at: new Date().toISOString() })
                .eq('id', resumeId)

            if (updateError) setError(updateError.message)
            else setMessage('Resume saved successfully!')
        } else {
            const { error: insertError } = await supabase
                .from('resume')
                .insert({ content: finalData })

            if (insertError) setError(insertError.message)
            else {
                setMessage('Resume saved successfully!')
                fetchResume()
            }
        }

        setLoading(false)
        setTimeout(() => setMessage(''), 3000)
    }

    const updateExperience = (index: number, field: string, value: string) => {
        const newExp = [...data.experience]
        newExp[index] = { ...newExp[index], [field]: value }
        setData({ ...data, experience: newExp })
    }

    const addExperience = () => {
        setData({
            ...data,
            experience: [...data.experience, { company: '', role: '', period: '', description: '' }]
        })
    }

    const removeExperience = (index: number) => {
        const newExp = [...data.experience]
        newExp.splice(index, 1)
        setData({ ...data, experience: newExp })
    }

    const updateEducation = (index: number, field: string, value: string) => {
        const newEdu = [...data.education]
        newEdu[index] = { ...newEdu[index], [field]: value }
        setData({ ...data, education: newEdu })
    }

    const addEducation = () => {
        setData({
            ...data,
            education: [...data.education, { institution: '', degree: '', period: '' }]
        })
    }

    const removeEducation = (index: number) => {
        const newEdu = [...data.education]
        newEdu.splice(index, 1)
        setData({ ...data, education: newEdu })
    }

    if (fetching) {
        return (
            <div className="py-12 text-muted text-sm font-mono animate-pulse">
                Loading resume...
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-border pb-5">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Resume 📃
                    </h1>
                    <p className="text-xs sm:text-sm text-secondary">
                        Update your summary, experience, education, and skills.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-foreground text-background px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity self-start sm:self-auto"
                >
                    {loading ? 'Saving...' : 'Save Resume'}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-500/20 text-xs sm:text-sm">
                    {error}
                </div>
            )}
            {message && (
                <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 p-4 rounded-xl border border-emerald-500/20 text-xs sm:text-sm">
                    {message}
                </div>
            )}

            <div className="space-y-8">
                {/* Summary */}
                <section className="space-y-2">
                    <h2 className="text-sm font-bold text-foreground">Summary</h2>
                    <textarea
                        value={data.summary}
                        onChange={(e) => setData({ ...data, summary: e.target.value })}
                        rows={4}
                        placeholder="Write a brief professional summary..."
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors leading-relaxed"
                    />
                </section>

                {/* Experience */}
                <section className="pt-6 border-t border-border space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-bold text-foreground">Experience</h2>
                        <button
                            onClick={addExperience}
                            className="text-xs font-medium bg-surface border border-border px-3 py-1.5 rounded-lg hover:border-foreground/30 text-foreground transition-colors"
                        >
                            + Add Experience
                        </button>
                    </div>
                    <div className="space-y-4">
                        {data.experience.map((exp, i) => (
                            <div
                                key={i}
                                className="p-5 border border-border rounded-xl bg-surface/40 relative space-y-4"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-mono text-muted">
                                        #{i + 1}
                                    </span>
                                    <button
                                        onClick={() => removeExperience(i)}
                                        className="text-muted text-xs hover:text-red-500 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-medium text-secondary">
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            value={exp.company}
                                            onChange={(e) => updateExperience(i, 'company', e.target.value)}
                                            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-foreground bg-background focus:outline-none focus:border-foreground/50 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-medium text-secondary">
                                            Role
                                        </label>
                                        <input
                                            type="text"
                                            value={exp.role}
                                            onChange={(e) => updateExperience(i, 'role', e.target.value)}
                                            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-foreground bg-background focus:outline-none focus:border-foreground/50 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-secondary">
                                        Period
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.period}
                                        onChange={(e) => updateExperience(i, 'period', e.target.value)}
                                        placeholder="e.g. 2023 — Present"
                                        className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-foreground bg-background placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-secondary">
                                        Description
                                    </label>
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(i, 'description', e.target.value)}
                                        rows={3}
                                        className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-foreground bg-background focus:outline-none focus:border-foreground/50 transition-colors leading-relaxed"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Education */}
                <section className="pt-6 border-t border-border space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-bold text-foreground">Education</h2>
                        <button
                            onClick={addEducation}
                            className="text-xs font-medium bg-surface border border-border px-3 py-1.5 rounded-lg hover:border-foreground/30 text-foreground transition-colors"
                        >
                            + Add Education
                        </button>
                    </div>
                    <div className="space-y-4">
                        {data.education.map((edu, i) => (
                            <div
                                key={i}
                                className="p-5 border border-border rounded-xl bg-surface/40 relative space-y-4"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-mono text-muted">
                                        #{i + 1}
                                    </span>
                                    <button
                                        onClick={() => removeEducation(i)}
                                        className="text-muted text-xs hover:text-red-500 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-medium text-secondary">
                                            Institution
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.institution}
                                            onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                                            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-foreground bg-background focus:outline-none focus:border-foreground/50 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-medium text-secondary">
                                            Degree
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                                            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-foreground bg-background focus:outline-none focus:border-foreground/50 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-secondary">
                                        Period
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.period}
                                        onChange={(e) => updateEducation(i, 'period', e.target.value)}
                                        placeholder="e.g. 2018 — 2022"
                                        className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-foreground bg-background placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Skills */}
                <section className="pt-6 border-t border-border space-y-2">
                    <h2 className="text-sm font-bold text-foreground">Skills</h2>
                    <input
                        type="text"
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        placeholder="Flutter, Dart, React, Next.js, TypeScript"
                        className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-foreground bg-background placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                    />
                    <p className="text-muted text-xs">Comma-separated values.</p>
                </section>

                <div className="pt-6 border-t border-border">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-foreground text-background px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {loading ? 'Saving...' : 'Save Resume'}
                    </button>
                </div>
            </div>
        </div>
    )
}
