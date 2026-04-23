'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import ResizeImage from 'tiptap-extension-resize-image'
import Placeholder from '@tiptap/extension-placeholder'
import { createBrowserClient } from '@supabase/ssr'
import { useRef } from 'react'

interface TiptapEditorProps {
    content: string
    onChange: (html: string) => void
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: false }),
            ResizeImage.configure({
                inline: false,
            }),
            Placeholder.configure({ placeholder: 'Start writing...' }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        immediatelyRender: false,
    })

    if (!editor) {
        return <div className="border border-[#E5E7EB] min-h-[400px] p-4 text-[#666666]">Loading editor...</div>
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('Enter URL:', previousUrl)
        if (url === null) return
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    const uploadEditorImage = async (file: File) => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const timestamp = new Date().getTime()
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
        const path = `posts/${timestamp}-${safeName}`

        const { data, error } = await supabase.storage.from('images').upload(path, file, { cacheControl: '3600', upsert: false })
        if (error) {
            console.error('Image upload failed', error)
            alert(`Upload failed: ${error.message}`)
            return null
        }
        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(path)
        return publicUrlData.publicUrl
    }

    const addImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = await uploadEditorImage(file)
        if (url) {
            editor.chain().focus().insertContent({
                type: 'imageResize',
                attrs: {
                    src: url,
                },
            }).run()
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const ToolbarButton = ({ onClick, isActive, children }: { onClick: () => void, isActive?: boolean, children: React.ReactNode }) => (
        <button
            type="button"
            onClick={onClick}
            className={`h-[28px] px-2 text-xs border rounded transition-colors ${isActive
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white text-[#111111] border-[#E5E7EB] hover:bg-gray-50'
                }`}
        >
            {children}
        </button>
    )

    return (
        <div className="border border-[#E5E7EB] rounded overflow-hidden bg-white">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>Bold</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>Italic</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}>Underline</ToolbarButton>
                <span className="w-px h-4 bg-gray-300 mx-1"></span>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}>H2</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}>H3</ToolbarButton>
                <span className="w-px h-4 bg-gray-300 mx-1"></span>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>Bullet List</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>Ordered List</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>Blockquote</ToolbarButton>
                <span className="w-px h-4 bg-gray-300 mx-1"></span>
                <ToolbarButton onClick={setLink} isActive={editor.isActive('link')}>Link</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()}>Remove Link</ToolbarButton>
                <span className="w-px h-4 bg-gray-300 mx-1"></span>
                <ToolbarButton onClick={() => fileInputRef.current?.click()}>Image</ToolbarButton>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={addImage} className="hidden" />
                <span className="w-px h-4 bg-gray-300 mx-1"></span>
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>Undo</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>Redo</ToolbarButton>
            </div>
            <div className="p-4 min-h-[400px] max-w-none">
                <EditorContent editor={editor} className="prose-content min-h-[400px] outline-none" />
            </div>
        </div>
    )
}
