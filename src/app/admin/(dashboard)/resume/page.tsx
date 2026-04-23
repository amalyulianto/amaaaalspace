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
            else setMessage('Saved!')
        } else {
            const { error: insertError } = await supabase
                .from('resume')
                .insert({ content: finalData })

            if (insertError) setError(insertError.message)
            else {
                setMessage('Saved!')
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

    if (fetching) return <div className="py-12 text-[#666666] animate-pulse">Loading resume...</div>

    return (
        <div>
            <div className="flex justify-between items-end mb-8 border-b border-[#E5E7EB] pb-4">
                <h1 className="text-xl font-bold text-[#111111]">Resume</h1>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-[#111111] text-white px-5 py-2 rounded text-[15px] font-medium hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Saving...' : 'Save Resume'}
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border border-red-200">{error}</div>}
            {message && <div className="bg-green-50 text-green-600 p-4 rounded mb-6 border border-green-200">{message}</div>}

            <div className="space-y-10">
                <div>
                    <h2 className="text-lg font-bold text-[#111111] mb-4">Summary</h2>
                    <textarea
                        value={data.summary}
                        onChange={(e) => setData({ ...data, summary: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] transition-colors"
                    />
                </div>

                <div className="pt-6 border-t border-[#E5E7EB]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-[#111111]">Experience</h2>
                        <button
                            onClick={addExperience}
                            className="text-[13px] font-medium border border-[#E5E7EB] px-3 py-1.5 rounded hover:bg-[#F3F4F6] text-[#111111] transition-colors"
                        >
                            + Add Experience
                        </button>
                    </div>
                    <div className="space-y-4">
                        {data.experience.map((exp, i) => (
                            <div key={i} className="p-5 border border-[#E5E7EB] rounded bg-[#F9FAFB] relative">
                                <button
                                    onClick={() => removeExperience(i)}
                                    className="absolute top-4 right-4 text-[#666666] text-[13px] hover:text-red-600 transition-colors"
                                >
                                    Remove
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-2">
                                    <div>
                                        <label className="block text-sm font-medium text-[#111111] mb-2">Company</label>
                                        <input
                                            type="text"
                                            value={exp.company}
                                            onChange={(e) => updateExperience(i, 'company', e.target.value)}
                                            className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] bg-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#111111] mb-2">Role</label>
                                        <input
                                            type="text"
                                            value={exp.role}
                                            onChange={(e) => updateExperience(i, 'role', e.target.value)}
                                            className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] bg-white transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-[#111111] mb-2">Period</label>
                                    <input
                                        type="text"
                                        value={exp.period}
                                        onChange={(e) => updateExperience(i, 'period', e.target.value)}
                                        className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#111111] mb-2">Description</label>
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(i, 'description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] bg-white transition-colors"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-[#E5E7EB]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-[#111111]">Education</h2>
                        <button
                            onClick={addEducation}
                            className="text-[13px] font-medium border border-[#E5E7EB] px-3 py-1.5 rounded hover:bg-[#F3F4F6] text-[#111111] transition-colors"
                        >
                            + Add Education
                        </button>
                    </div>
                    <div className="space-y-4">
                        {data.education.map((edu, i) => (
                            <div key={i} className="p-5 border border-[#E5E7EB] rounded bg-[#F9FAFB] relative">
                                <button
                                    onClick={() => removeEducation(i)}
                                    className="absolute top-4 right-4 text-[#666666] text-[13px] hover:text-red-600 transition-colors"
                                >
                                    Remove
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-2">
                                    <div>
                                        <label className="block text-sm font-medium text-[#111111] mb-2">Institution</label>
                                        <input
                                            type="text"
                                            value={edu.institution}
                                            onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                                            className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] bg-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#111111] mb-2">Degree</label>
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                                            className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] bg-white transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#111111] mb-2">Period</label>
                                    <input
                                        type="text"
                                        value={edu.period}
                                        onChange={(e) => updateEducation(i, 'period', e.target.value)}
                                        className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] bg-white transition-colors"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-[#E5E7EB]">
                    <h2 className="text-lg font-bold text-[#111111] mb-4">Skills</h2>
                    <input
                        type="text"
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        placeholder="React, Next.js, TypeScript"
                        className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] transition-colors"
                    />
                    <p className="text-[#666666] text-[13px] mt-2">Comma-separated values.</p>
                </div>
            </div>
        </div>
    )
}
