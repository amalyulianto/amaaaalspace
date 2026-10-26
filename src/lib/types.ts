export type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
  description_en?: string | null
  created_at: string
}

export type PortfolioCategory = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  category_id: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
  category?: Category
}

export type PortfolioItem = {
  id: string
  title: string
  slug: string
  description: string | null
  content: string | null
  tech_stack: string[]
  cover_image_url: string | null
  project_url: string | null
  play_store_url: string | null
  app_store_url: string | null
  github_url: string | null
  display_order: number
  is_selected: boolean
  created_at: string
  portfolio_categories?: PortfolioCategory[]
}

export type LinkItem = {
  id: string
  title: string
  url: string
  icon: string | null
  display_order: number
  created_at: string
}

export type ResumeSectionKey =
  | 'experience'
  | 'education'
  | 'organisational'
  | 'projects'
  | 'achievements'
  | 'skills'
  | 'languages'

export type ResumeOrganisation = {
  organization: string
  role: string
  period: string
  description: string
}

export type ResumeProject = {
  title: string
  role?: string
  period: string
  description: string
  url?: string
}

export type ResumeAchievement = {
  title: string
  issuer: string
  period: string
  description?: string
}

export type ResumeExperience = {
  company: string
  role: string
  period: string
  description: string
}

export type ResumeEducation = {
  institution: string
  degree: string
  period: string
}

export type ResumeLanguage = {
  language: string
  fluency?: string
}

export type ResumeData = {
  summary: string
  experience: ResumeExperience[]
  education: ResumeEducation[]
  organisational?: ResumeOrganisation[]
  projects?: ResumeProject[]
  achievements?: ResumeAchievement[]
  skills: string[]
  languages?: ResumeLanguage[]
  section_order?: ResumeSectionKey[]
}

export type Resume = {
  id: string
  content: ResumeData
  updated_at: string
}

export type Comment = {
  id: string
  post_id: string
  author_name: string
  content: string
  approved: boolean
  created_at: string
}

export type GuestbookEntry = {
  id: string
  author_name: string
  message: string
  approved: boolean
  created_at: string
}

export type ShortLink = {
  id: string
  slug: string
  destination_url: string
  clicks: number
  created_at: string
  updated_at: string
}

export type NowPlayingTrack = {
  title: string
  artist: string
  album?: string
  url: string
  isPlaying: boolean
}

export type TopTrack = {
  title: string
  artist: string
  url: string
  playcount: number
}

export type SpotifyData = {
  nowPlaying: NowPlayingTrack | null
  topTracks: TopTrack[]
}
