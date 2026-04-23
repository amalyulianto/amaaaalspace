export type Category = {
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
  github_url: string | null
  display_order: number
  created_at: string
}

export type LinkItem = {
  id: string
  title: string
  url: string
  icon: string | null
  display_order: number
  created_at: string
}

export type ResumeData = {
  summary: string
  experience: {
    company: string
    role: string
    period: string
    description: string
  }[]
  education: {
    institution: string
    degree: string
    period: string
  }[]
  skills: string[]
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
