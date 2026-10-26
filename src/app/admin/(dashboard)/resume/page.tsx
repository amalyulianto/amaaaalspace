'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
    Resume,
    ResumeData,
    ResumeSectionKey,
    ResumeExperience,
    ResumeEducation,
    ResumeOrganisation,
    ResumeProject,
    ResumeAchievement,
    ResumeLanguage,
} from '@/lib/types'
import { ArrowUp, ArrowDown, Plus, Trash2 } from 'lucide-react'

const DEFAULT_SECTIONS: ResumeSectionKey[] = [
    'experience',
    'education',
    'organisational',
    'projects',
    'achievements',
    'skills',
    'languages',
]

const SECTION_LABELS: Record<ResumeSectionKey, { title: string; subtitle: string }> = {
    experience: { title: 'Experience 💼', subtitle: 'Work history and employment roles' },
    education: { title: 'Education 🎓', subtitle: 'Degrees, schools, and academic history' },
    organisational: { title: 'Organisational Activities 🏛️', subtitle: 'Leadership, committees, and volunteer positions' },
    projects: { title: 'Featured Projects 🚀', subtitle: 'Key software, web, and design projects' },
    achievements: { title: 'Achievements & Awards 🏆', subtitle: 'Honors, competitions, certifications, and awards' },
    skills: { title: 'Skills 🛠️', subtitle: 'Core technologies and competencies' },
    languages: { title: 'Languages 🌐', subtitle: 'Languages spoken and fluency levels' },
}

const initialResumeData: ResumeData = {
    summary: '',
    experience: [],
    education: [],
    organisational: [],
    projects: [],
    achievements: [],
    skills: [],
    languages: [],
    section_order: DEFAULT_SECTIONS,
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
            const content = resume.content || {}

            const rawOrder = Array.isArray(content.section_order) && content.section_order.length > 0
                ? content.section_order
                : DEFAULT_SECTIONS

            const mergedOrder: ResumeSectionKey[] = [...rawOrder]
            DEFAULT_SECTIONS.forEach((key) => {
                if (!mergedOrder.includes(key)) {
                    mergedOrder.push(key)
                }
            })

            // Normalize languages: support both { language, fluency } and legacy string format
            const normalizedLanguages: ResumeLanguage[] = Array.isArray(content.languages)
                ? content.languages.map((item: any) =>
                      typeof item === 'string' ? { language: item, fluency: '' } : item
                  )
                : []

            setResumeId(resume.id)
            setData({
                summary: content.summary || '',
                experience: Array.isArray(content.experience) ? content.experience : [],
                education: Array.isArray(content.education) ? content.education : [],
                organisational: Array.isArray(content.organisational) ? content.organisational : [],
                projects: Array.isArray(content.projects) ? content.projects : [],
                achievements: Array.isArray(content.achievements) ? content.achievements : [],
                skills: Array.isArray(content.skills) ? content.skills : [],
                languages: normalizedLanguages,
                section_order: mergedOrder,
            })
            setSkillsInput(content.skills?.join(', ') || '')
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
            skills: skillsInput
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s !== ''),
            languages: (data.languages || []).filter((l) => l.language.trim() !== ''),
            section_order: data.section_order || DEFAULT_SECTIONS,
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

    // --- Section Reordering ---
    const moveSection = (index: number, direction: 'up' | 'down') => {
        const order = [...(data.section_order || DEFAULT_SECTIONS)]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= order.length) return
        const temp = order[index]
        order[index] = order[targetIndex]
        order[targetIndex] = temp
        setData({ ...data, section_order: order })
    }

    // --- Generic Item Mover ---
    const moveItem = <T,>(list: T[], index: number, direction: 'up' | 'down'): T[] => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= list.length) return list
        const next = [...list]
        const temp = next[index]
        next[index] = next[targetIndex]
        next[targetIndex] = temp
        return next
    }

    // --- Experience Handlers ---
    const updateExperience = (index: number, field: keyof ResumeExperience, value: string) => {
        const list = [...data.experience]
        list[index] = { ...list[index], [field]: value }
        setData({ ...data, experience: list })
    }
    const addExperience = () => {
        setData({
            ...data,
            experience: [...data.experience, { company: '', role: '', period: '', description: '' }],
        })
    }
    const removeExperience = (index: number) => {
        const list = [...data.experience]
        list.splice(index, 1)
        setData({ ...data, experience: list })
    }
    const moveExperienceItem = (index: number, direction: 'up' | 'down') => {
        setData({ ...data, experience: moveItem(data.experience, index, direction) })
    }

    // --- Education Handlers ---
    const updateEducation = (index: number, field: keyof ResumeEducation, value: string) => {
        const list = [...data.education]
        list[index] = { ...list[index], [field]: value }
        setData({ ...data, education: list })
    }
    const addEducation = () => {
        setData({
            ...data,
            education: [...data.education, { institution: '', degree: '', period: '' }],
        })
    }
    const removeEducation = (index: number) => {
        const list = [...data.education]
        list.splice(index, 1)
        setData({ ...data, education: list })
    }
    const moveEducationItem = (index: number, direction: 'up' | 'down') => {
        setData({ ...data, education: moveItem(data.education, index, direction) })
    }

    // --- Organisational Activities Handlers ---
    const updateOrganisational = (index: number, field: keyof ResumeOrganisation, value: string) => {
        const list = [...(data.organisational || [])]
        list[index] = { ...list[index], [field]: value }
        setData({ ...data, organisational: list })
    }
    const addOrganisational = () => {
        setData({
            ...data,
            organisational: [
                ...(data.organisational || []),
                { organization: '', role: '', period: '', description: '' },
            ],
        })
    }
    const removeOrganisational = (index: number) => {
        const list = [...(data.organisational || [])]
        list.splice(index, 1)
        setData({ ...data, organisational: list })
    }
    const moveOrganisationalItem = (index: number, direction: 'up' | 'down') => {
        setData({
            ...data,
            organisational: moveItem(data.organisational || [], index, direction),
        })
    }

    // --- Projects Handlers ---
    const updateProject = (index: number, field: keyof ResumeProject, value: string) => {
        const list = [...(data.projects || [])]
        list[index] = { ...list[index], [field]: value }
        setData({ ...data, projects: list })
    }
    const addProject = () => {
        setData({
            ...data,
            projects: [
                ...(data.projects || []),
                { title: '', role: '', period: '', description: '', url: '' },
            ],
        })
    }
    const removeProject = (index: number) => {
        const list = [...(data.projects || [])]
        list.splice(index, 1)
        setData({ ...data, projects: list })
    }
    const moveProjectItem = (index: number, direction: 'up' | 'down') => {
        setData({
            ...data,
            projects: moveItem(data.projects || [], index, direction),
        })
    }

    // --- Achievements Handlers ---
    const updateAchievement = (index: number, field: keyof ResumeAchievement, value: string) => {
        const list = [...(data.achievements || [])]
        list[index] = { ...list[index], [field]: value }
        setData({ ...data, achievements: list })
    }
    const addAchievement = () => {
        setData({
            ...data,
            achievements: [
                ...(data.achievements || []),
                { title: '', issuer: '', period: '', description: '' },
            ],
        })
    }
    const removeAchievement = (index: number) => {
        const list = [...(data.achievements || [])]
        list.splice(index, 1)
        setData({ ...data, achievements: list })
    }
    const moveAchievementItem = (index: number, direction: 'up' | 'down') => {
        setData({
            ...data,
            achievements: moveItem(data.achievements || [], index, direction),
        })
    }

    // --- Languages Handlers ---
    const updateLanguage = (index: number, field: keyof ResumeLanguage, value: string) => {
        const list = [...(data.languages || [])]
        list[index] = { ...list[index], [field]: value }
        setData({ ...data, languages: list })
    }
    const addLanguage = () => {
        setData({
            ...data,
            languages: [
                ...(data.languages || []),
                { language: '', fluency: '' },
            ],
        })
    }
    const removeLanguage = (index: number) => {
        const list = [...(data.languages || [])]
        list.splice(index, 1)
        setData({ ...data, languages: list })
    }
    const moveLanguageItem = (index: number, direction: 'up' | 'down') => {
        setData({
            ...data,
            languages: moveItem(data.languages || [], index, direction),
        })
    }

    if (fetching) {
        return (
            <div className="py-12 text-muted text-sm font-mono animate-pulse">
                Loading resume...
            </div>
        )
    }

    const currentSectionOrder = data.section_order || DEFAULT_SECTIONS

    // Section Header with Up/Down reordering buttons
    const renderSectionHeader = (
        sectionKey: ResumeSectionKey,
        sectionIndex: number,
        onAdd?: () => void,
        addLabel?: string
    ) => {
        const info = SECTION_LABELS[sectionKey]
        const isFirst = sectionIndex === 0
        const isLast = sectionIndex === currentSectionOrder.length - 1

        return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted bg-surface px-1.5 py-0.5 rounded border border-border">
                            #{sectionIndex + 1}
                        </span>
                        <h2 className="text-sm sm:text-base font-bold text-foreground m-0">
                            {info.title}
                        </h2>
                    </div>
                    <p className="text-xs text-muted m-0">
                        {info.subtitle}
                    </p>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    {/* Section Order Buttons */}
                    <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5">
                        <button
                            type="button"
                            onClick={() => moveSection(sectionIndex, 'up')}
                            disabled={isFirst}
                            title="Move section up"
                            className="p-1 rounded text-secondary hover:text-foreground hover:bg-surface disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                            <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => moveSection(sectionIndex, 'down')}
                            disabled={isLast}
                            title="Move section down"
                            className="p-1 rounded text-secondary hover:text-foreground hover:bg-surface disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                            <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {onAdd && addLabel && (
                        <button
                            type="button"
                            onClick={onAdd}
                            className="inline-flex items-center gap-1 text-xs font-medium bg-foreground text-background px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <Plus className="w-3.5 h-3.5" /> {addLabel}
                        </button>
                    )}
                </div>
            </div>
        )
    }

    // Item Header with Up/Down/Remove
    const renderItemControls = (
        index: number,
        total: number,
        onMove: (index: number, dir: 'up' | 'down') => void,
        onRemove: () => void
    ) => (
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <span className="text-xs font-mono text-muted">Item #{index + 1}</span>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onMove(index, 'up')}
                    disabled={index === 0}
                    title="Move up"
                    className="p-1 rounded hover:bg-surface text-secondary hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                    <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onClick={() => onMove(index, 'down')}
                    disabled={index === total - 1}
                    title="Move down"
                    className="p-1 rounded hover:bg-surface text-secondary hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                    <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <span className="w-px h-3.5 bg-border mx-1" />
                <button
                    type="button"
                    onClick={onRemove}
                    title="Remove item"
                    className="inline-flex items-center gap-1 text-xs text-muted hover:text-red-500 transition-colors px-1.5 py-0.5 rounded hover:bg-red-500/10"
                >
                    <Trash2 className="w-3 h-3" /> Remove
                </button>
            </div>
        </div>
    )

    // Render individual section content based on section key
    const renderSection = (key: ResumeSectionKey, sectionIndex: number) => {
        switch (key) {
            case 'experience':
                return (
                    <section key={key} className="p-5 border border-border rounded-xl bg-surface/30 space-y-4">
                        {renderSectionHeader(key, sectionIndex, addExperience, 'Add Experience')}
                        <div className="space-y-4">
                            {data.experience.map((exp, i) => (
                                <div key={i} className="p-4 border border-border rounded-xl bg-background space-y-3">
                                    {renderItemControls(i, data.experience.length, moveExperienceItem, () => removeExperience(i))}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Company</label>
                                            <input
                                                type="text"
                                                value={exp.company}
                                                onChange={(e) => updateExperience(i, 'company', e.target.value)}
                                                placeholder="e.g. Google, Remote, Freelance"
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Role</label>
                                            <input
                                                type="text"
                                                value={exp.role}
                                                onChange={(e) => updateExperience(i, 'role', e.target.value)}
                                                placeholder="e.g. Senior Flutter Developer"
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-secondary">Period</label>
                                        <input
                                            type="text"
                                            value={exp.period}
                                            onChange={(e) => updateExperience(i, 'period', e.target.value)}
                                            placeholder="e.g. 2023 — Present"
                                            className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-secondary">Description</label>
                                        <textarea
                                            value={exp.description}
                                            onChange={(e) => updateExperience(i, 'description', e.target.value)}
                                            rows={3}
                                            placeholder="Key responsibilities and achievements..."
                                            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors leading-relaxed"
                                        />
                                    </div>
                                </div>
                            ))}
                            {data.experience.length === 0 && (
                                <p className="text-xs text-muted py-2 italic text-center">No experience entries yet. Click &apos;Add Experience&apos; above.</p>
                            )}
                        </div>
                    </section>
                )

            case 'education':
                return (
                    <section key={key} className="p-5 border border-border rounded-xl bg-surface/30 space-y-4">
                        {renderSectionHeader(key, sectionIndex, addEducation, 'Add Education')}
                        <div className="space-y-4">
                            {data.education.map((edu, i) => (
                                <div key={i} className="p-4 border border-border rounded-xl bg-background space-y-3">
                                    {renderItemControls(i, data.education.length, moveEducationItem, () => removeEducation(i))}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Institution</label>
                                            <input
                                                type="text"
                                                value={edu.institution}
                                                onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                                                placeholder="e.g. Universitas Negeri Gorontalo"
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Degree / Major</label>
                                            <input
                                                type="text"
                                                value={edu.degree}
                                                onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                                                placeholder="e.g. S.Kom in Computer Science"
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-secondary">Period</label>
                                        <input
                                            type="text"
                                            value={edu.period}
                                            onChange={(e) => updateEducation(i, 'period', e.target.value)}
                                            placeholder="e.g. 2018 — 2022"
                                            className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                                        />
                                    </div>
                                </div>
                            ))}
                            {data.education.length === 0 && (
                                <p className="text-xs text-muted py-2 italic text-center">No education entries yet. Click &apos;Add Education&apos; above.</p>
                            )}
                        </div>
                    </section>
                )

            case 'organisational':
                const orgList = data.organisational || []
                return (
                    <section key={key} className="p-5 border border-border rounded-xl bg-surface/30 space-y-4">
                        {renderSectionHeader(key, sectionIndex, addOrganisational, 'Add Activity')}
                        <div className="space-y-4">
                            {orgList.map((org, i) => (
                                <div key={i} className="p-4 border border-border rounded-xl bg-background space-y-3">
                                    {renderItemControls(i, orgList.length, moveOrganisationalItem, () => removeOrganisational(i))}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Organization / Committee</label>
                                            <input
                                                type="text"
                                                value={org.organization}
                                                onChange={(e) => updateOrganisational(i, 'organization', e.target.value)}
                                                placeholder="e.g. Google Developer Student Clubs"
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Role / Position</label>
                                            <input
                                                type="text"
                                                value={org.role}
                                                onChange={(e) => updateOrganisational(i, 'role', e.target.value)}
                                                placeholder="e.g. Lead Organizer / Core Team"
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-secondary">Period</label>
                                        <input
                                            type="text"
                                            value={org.period}
                                            onChange={(e) => updateOrganisational(i, 'period', e.target.value)}
                                            placeholder="e.g. 2021 — 2022"
                                            className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-secondary">Description</label>
                                        <textarea
                                            value={org.description}
                                            onChange={(e) => updateOrganisational(i, 'description', e.target.value)}
                                            rows={2}
                                            placeholder="Summary of responsibilities or impact..."
                                            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors leading-relaxed"
                                        />
                                    </div>
                                </div>
                            ))}
                            {orgList.length === 0 && (
                                <p className="text-xs text-muted py-2 italic text-center">No organisational activities yet. Click &apos;Add Activity&apos; above.</p>
                            )}
                        </div>
                    </section>
                )

            case 'projects':
                const projectList = data.projects || []
                return (
                    <section key={key} className="p-5 border border-border rounded-xl bg-surface/30 space-y-4">
                        {renderSectionHeader(key, sectionIndex, addProject, 'Add Project')}
                        <div className="space-y-4">
                            {projectList.map((prj, i) => (
                                <div key={i} className="p-4 border border-border rounded-xl bg-background space-y-3">
                                    {renderItemControls(i, projectList.length, moveProjectItem, () => removeProject(i))}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Project Name</label>
                                            <input
                                                type="text"
                                                value={prj.title}
                                                onChange={(e) => updateProject(i, 'title', e.target.value)}
                                                placeholder="e.g. Mobile E-Commerce App"
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Role / Tech (Optional)</label>
                                            <input
                                                type="text"
                                                value={prj.role || ''}
                                                onChange={(e) => updateProject(i, 'role', e.target.value)}
                                                placeholder="e.g. Lead Mobile Developer · Flutter"
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Period</label>
                                            <input
                                                type="text"
                                                value={prj.period}
                                                onChange={(e) => updateProject(i, 'period', e.target.value)}
                                                placeholder="e.g. 2023"
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Project / Live URL (Optional)</label>
                                            <input
                                                type="text"
                                                value={prj.url || ''}
                                                onChange={(e) => updateProject(i, 'url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-secondary">Description</label>
                                        <textarea
                                            value={prj.description}
                                            onChange={(e) => updateProject(i, 'description', e.target.value)}
                                            rows={2}
                                            placeholder="What the project does, key features, architecture..."
                                            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors leading-relaxed"
                                        />
                                    </div>
                                </div>
                            ))}
                            {projectList.length === 0 && (
                                <p className="text-xs text-muted py-2 italic text-center">No projects added yet. Click &apos;Add Project&apos; above.</p>
                            )}
                        </div>
                    </section>
                )

            case 'achievements':
                const achList = data.achievements || []
                return (
                    <section key={key} className="p-5 border border-border rounded-xl bg-surface/30 space-y-4">
                        {renderSectionHeader(key, sectionIndex, addAchievement, 'Add Achievement')}
                        <div className="space-y-4">
                            {achList.map((ach, i) => (
                                <div key={i} className="p-4 border border-border rounded-xl bg-background space-y-3">
                                    {renderItemControls(i, achList.length, moveAchievementItem, () => removeAchievement(i))}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Achievement / Award Title</label>
                                            <input
                                                type="text"
                                                value={ach.title}
                                                onChange={(e) => updateAchievement(i, 'title', e.target.value)}
                                                placeholder="e.g. 1st Winner Mobile App Hackathon"
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Issuer / Organization</label>
                                            <input
                                                type="text"
                                                value={ach.issuer}
                                                onChange={(e) => updateAchievement(i, 'issuer', e.target.value)}
                                                placeholder="e.g. Ministry of ICT / Tech Fest"
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-secondary">Period / Year</label>
                                        <input
                                            type="text"
                                            value={ach.period}
                                            onChange={(e) => updateAchievement(i, 'period', e.target.value)}
                                            placeholder="e.g. 2022"
                                            className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-secondary">Description (Optional)</label>
                                        <textarea
                                            value={ach.description || ''}
                                            onChange={(e) => updateAchievement(i, 'description', e.target.value)}
                                            rows={2}
                                            placeholder="Brief note about the competition or achievement..."
                                            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors leading-relaxed"
                                        />
                                    </div>
                                </div>
                            ))}
                            {achList.length === 0 && (
                                <p className="text-xs text-muted py-2 italic text-center">No achievements added yet. Click &apos;Add Achievement&apos; above.</p>
                            )}
                        </div>
                    </section>
                )

            case 'skills':
                return (
                    <section key={key} className="p-5 border border-border rounded-xl bg-surface/30 space-y-4">
                        {renderSectionHeader(key, sectionIndex)}
                        <div className="p-4 border border-border rounded-xl bg-background space-y-2">
                            <label className="block text-xs font-medium text-secondary">Skills List</label>
                            <input
                                type="text"
                                value={skillsInput}
                                onChange={(e) => setSkillsInput(e.target.value)}
                                placeholder="Flutter, Dart, React, Next.js, TypeScript, UI/UX"
                                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-foreground bg-surface/50 placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                            <p className="text-muted text-xs m-0">Enter values separated by commas.</p>
                        </div>
                    </section>
                )

            case 'languages':
                const langList = data.languages || []
                return (
                    <section key={key} className="p-5 border border-border rounded-xl bg-surface/30 space-y-4">
                        {renderSectionHeader(key, sectionIndex, addLanguage, 'Add Language')}
                        <div className="space-y-4">
                            {langList.map((lang, i) => (
                                <div key={i} className="p-4 border border-border rounded-xl bg-background space-y-3">
                                    {renderItemControls(i, langList.length, moveLanguageItem, () => removeLanguage(i))}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Language</label>
                                            <input
                                                type="text"
                                                value={lang.language}
                                                onChange={(e) => updateLanguage(i, 'language', e.target.value)}
                                                placeholder="e.g. English, Indonesian, Japanese"
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-secondary">Fluency Level</label>
                                            <input
                                                type="text"
                                                value={lang.fluency || ''}
                                                onChange={(e) => updateLanguage(i, 'fluency', e.target.value)}
                                                placeholder="e.g. Native / Bilingual, Professional, Conversational"
                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm text-foreground bg-surface/50 focus:outline-none focus:border-foreground/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {langList.length === 0 && (
                                <p className="text-xs text-muted py-2 italic text-center">No languages added yet. Click &apos;Add Language&apos; above.</p>
                            )}
                        </div>
                    </section>
                )

            default:
                return null
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-border pb-5">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground m-0">
                        Resume 📃
                    </h1>
                    <p className="text-xs sm:text-sm text-secondary m-0">
                        Manage resume summary, sections, languages, and rearrange ordering.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-foreground text-background px-5 py-2 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity self-start sm:self-auto shrink-0 shadow-sm"
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

            <div className="space-y-6">
                {/* Summary Section */}
                <section className="p-5 border border-border rounded-xl bg-surface/30 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                        <div className="space-y-0.5">
                            <h2 className="text-sm sm:text-base font-bold text-foreground m-0">
                                Professional Summary 📝
                            </h2>
                            <p className="text-xs text-muted m-0">
                                Displayed right below your name at the top of the resume.
                            </p>
                        </div>
                    </div>
                    <textarea
                        value={data.summary}
                        onChange={(e) => setData({ ...data, summary: e.target.value })}
                        rows={4}
                        placeholder="Write a brief professional summary..."
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors leading-relaxed"
                    />
                </section>

                {/* Dynamic Ordered Sections */}
                <div className="space-y-6">
                    {currentSectionOrder.map((sectionKey, index) => renderSection(sectionKey, index))}
                </div>

                <div className="pt-6 border-t border-border flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-foreground text-background px-6 py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
                    >
                        {loading ? 'Saving...' : 'Save Resume'}
                    </button>
                </div>
            </div>
        </div>
    )
}
