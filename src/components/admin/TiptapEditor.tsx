'use client'

import {
    useEditor,
    EditorContent,
    NodeViewWrapper,
    NodeViewProps,
    ReactNodeViewRenderer,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { createBrowserClient } from '@supabase/ssr'
import { useRef, useState } from 'react'
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    ArrowUp,
    ArrowDown,
    Trash2,
} from 'lucide-react'
import {
    generateSafeStorageFilename,
    sanitizeUrl,
    validateImageFile,
} from '@/lib/security'

type ImageLayout =
    | 'img-block-left'
    | 'img-block-center'
    | 'img-block-right'
    | 'float-left-img'
    | 'float-right-img'

const CONTAINER_MAX_WIDTH = 632

function parseExistingLayout(
    element: HTMLElement,
    fallbackImg?: HTMLImageElement | null
): ImageLayout {
    const cls = `${element.getAttribute('class') || ''} ${fallbackImg?.getAttribute('class') || ''}`
    if (cls.includes('float-left-img')) return 'float-left-img'
    if (cls.includes('float-right-img')) return 'float-right-img'
    if (cls.includes('img-block-left')) return 'img-block-left'
    if (cls.includes('img-block-right')) return 'img-block-right'
    if (cls.includes('img-block-center')) return 'img-block-center'

    const style = (
        element.getAttribute('style') ||
        element.getAttribute('containerstyle') ||
        fallbackImg?.getAttribute('style') ||
        fallbackImg?.getAttribute('containerstyle') ||
        ''
    ).toLowerCase()

    if (style.includes('float: left') || style.includes('float:left')) {
        return 'float-left-img'
    }
    if (style.includes('float: right') || style.includes('float:right')) {
        return 'float-right-img'
    }
    if (style.includes('margin: 0px 0px 0px auto') || style.includes('margin: 0 0 0 auto')) {
        return 'img-block-right'
    }
    if (style.includes('margin: 0px auto 0px 0px') || style.includes('margin: 0 auto 0 0')) {
        return 'img-block-left'
    }

    return 'img-block-center'
}

function parseExistingWidth(element: HTMLElement): number | null {
    const attrWidth = element.getAttribute('data-width') || element.getAttribute('width')
    if (attrWidth) {
        const parsed = parseInt(attrWidth.replace(/[^0-9]/g, ''), 10)
        if (!Number.isNaN(parsed) && parsed > 0) return parsed
    }

    const style =
        element.getAttribute('style') ||
        element.getAttribute('containerstyle') ||
        ''
    const match = style.match(/width:\s*([0-9.]+)px/i)
    if (match && match[1]) {
        const parsed = Math.round(parseFloat(match[1]))
        if (!Number.isNaN(parsed) && parsed > 0) return parsed
    }

    return null
}

function ResizableImageNodeView({
    node,
    selected,
    updateAttributes,
    deleteNode,
    editor,
    getPos,
}: NodeViewProps) {
    const imgRef = useRef<HTMLImageElement>(null)
    const captionInputRef = useRef<HTMLInputElement>(null)
    const [resizingWidth, setResizingWidth] = useState<number | null>(null)

    const layout: ImageLayout = (node.attrs.class as ImageLayout) || 'img-block-center'
    const currentWidth: number | null = resizingWidth ?? node.attrs.width ?? null
    const captionText: string = node.attrs.caption || ''

    const setLayout = (newLayout: ImageLayout) => {
        const isWrap = newLayout === 'float-left-img' || newLayout === 'float-right-img'
        // If user switches to "Beside Text" and the image is currently full width,
        // automatically size it to ~45% (280px) so paragraph text immediately flows beside it
        if (isWrap && (!node.attrs.width || node.attrs.width > 460)) {
            updateAttributes({ class: newLayout, width: 280 })
        } else {
            updateAttributes({ class: newLayout })
        }
    }

    const setPresetPercent = (percent: number) => {
        if (percent === 100) {
            updateAttributes({ width: null })
        } else {
            const targetPx = Math.round((CONTAINER_MAX_WIDTH * percent) / 100)
            updateAttributes({ width: targetPx })
        }
    }

    const moveBlock = (direction: 'up' | 'down') => {
        if (typeof getPos !== 'function') return
        const pos = getPos()
        if (typeof pos !== 'number') return

        const { state, view } = editor
        const $pos = state.doc.resolve(pos)
        const index = $pos.index(0)

        if (direction === 'up' && index > 0) {
            const prevNode = state.doc.child(index - 1)
            const targetPos = pos - prevNode.nodeSize
            const tr = state.tr.delete(pos, pos + node.nodeSize).insert(targetPos, node)
            view.dispatch(tr.scrollIntoView())
        } else if (direction === 'down' && index < state.doc.childCount - 1) {
            const nextNode = state.doc.child(index + 1)
            const tr = state.tr
                .delete(pos, pos + node.nodeSize)
                .insert(pos + nextNode.nodeSize, node)
            view.dispatch(tr.scrollIntoView())
        }
    }

    const startResize = (e: React.MouseEvent, corner: 'nw' | 'ne' | 'sw' | 'se') => {
        e.preventDefault()
        e.stopPropagation()

        const startX = e.clientX
        const startWidth =
            imgRef.current?.getBoundingClientRect().width ||
            node.attrs.width ||
            CONTAINER_MAX_WIDTH

        const isLeftCorner = corner === 'nw' || corner === 'sw'

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = isLeftCorner
                ? startX - moveEvent.clientX
                : moveEvent.clientX - startX
            const nextWidth = Math.max(
                80,
                Math.min(CONTAINER_MAX_WIDTH, Math.round(startWidth + deltaX))
            )
            setResizingWidth(nextWidth)
        }

        const onMouseUp = (upEvent: MouseEvent) => {
            const deltaX = isLeftCorner
                ? startX - upEvent.clientX
                : upEvent.clientX - startX
            const finalWidth = Math.max(
                80,
                Math.min(CONTAINER_MAX_WIDTH, Math.round(startWidth + deltaX))
            )
            setResizingWidth(null)
            updateAttributes({ width: finalWidth })
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    const popoverAlignmentClass =
        layout === 'float-right-img' || layout === 'img-block-right'
            ? 'right-0'
            : layout === 'img-block-center'
              ? 'left-1/2 -translate-x-1/2'
              : 'left-0'

    return (
        <NodeViewWrapper
            data-layout={layout}
            className="relative inline-block max-w-full group select-none"
            style={{
                width: currentWidth ? `${currentWidth}px` : '100%',
            }}
        >
            {/* Floating Popover Inspector when image is selected (zero layout shift!) */}
            {selected && (
                <div
                    contentEditable={false}
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute -top-11 ${popoverAlignmentClass} w-max max-w-[92vw] px-2.5 py-1.5 rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-lg flex items-center gap-1.5 text-[11px] z-30`}
                >
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted px-0.5">
                        Line:
                    </span>
                    <button
                        type="button"
                        onClick={() => setLayout('img-block-left')}
                        title="Separate line, aligned left"
                        className={`px-2 py-0.5 rounded-md font-medium border transition-colors ${
                            layout === 'img-block-left'
                                ? 'bg-foreground text-background border-foreground'
                                : 'bg-surface/60 text-secondary border-border hover:text-foreground'
                        }`}
                    >
                        Left
                    </button>
                    <button
                        type="button"
                        onClick={() => setLayout('img-block-center')}
                        title="Separate line, centered"
                        className={`px-2 py-0.5 rounded-md font-medium border transition-colors ${
                            layout === 'img-block-center'
                                ? 'bg-foreground text-background border-foreground'
                                : 'bg-surface/60 text-secondary border-border hover:text-foreground'
                        }`}
                    >
                        Center
                    </button>
                    <button
                        type="button"
                        onClick={() => setLayout('img-block-right')}
                        title="Separate line, aligned right"
                        className={`px-2 py-0.5 rounded-md font-medium border transition-colors ${
                            layout === 'img-block-right'
                                ? 'bg-foreground text-background border-foreground'
                                : 'bg-surface/60 text-secondary border-border hover:text-foreground'
                        }`}
                    >
                        Right
                    </button>

                    <span className="w-px h-3.5 bg-border mx-0.5" />

                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted px-0.5">
                        Beside Text:
                    </span>
                    <button
                        type="button"
                        onClick={() => setLayout('float-left-img')}
                        title="Float left beside paragraph"
                        className={`px-2 py-0.5 rounded-md font-medium border transition-colors ${
                            layout === 'float-left-img'
                                ? 'bg-foreground text-background border-foreground'
                                : 'bg-surface/60 text-secondary border-border hover:text-foreground'
                        }`}
                    >
                        ◧ Left
                    </button>
                    <button
                        type="button"
                        onClick={() => setLayout('float-right-img')}
                        title="Float right beside paragraph"
                        className={`px-2 py-0.5 rounded-md font-medium border transition-colors ${
                            layout === 'float-right-img'
                                ? 'bg-foreground text-background border-foreground'
                                : 'bg-surface/60 text-secondary border-border hover:text-foreground'
                        }`}
                    >
                        ◨ Right
                    </button>

                    <span className="w-px h-3.5 bg-border mx-0.5" />

                    {[25, 50, 75, 100].map((pct) => (
                        <button
                            key={pct}
                            type="button"
                            onClick={() => setPresetPercent(pct)}
                            title={`Resize to ${pct}% width`}
                            className="px-1.5 py-0.5 rounded-md font-mono text-[10px] bg-surface/60 text-secondary border border-border hover:text-foreground transition-colors"
                        >
                            {pct}%
                        </button>
                    ))}

                    <span className="w-px h-3.5 bg-border mx-0.5" />

                    <button
                        type="button"
                        onClick={() => captionInputRef.current?.focus()}
                        title="Add or edit caption below image"
                        className="px-2 py-0.5 rounded-md font-medium bg-surface/60 text-secondary border border-border hover:text-foreground transition-colors"
                    >
                        Caption
                    </button>

                    <button
                        type="button"
                        onClick={() => moveBlock('up')}
                        title="Move image above previous paragraph"
                        className="p-1 rounded-md bg-surface/60 text-secondary border border-border hover:text-foreground transition-colors"
                    >
                        <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => moveBlock('down')}
                        title="Move image below next paragraph"
                        className="p-1 rounded-md bg-surface/60 text-secondary border border-border hover:text-foreground transition-colors"
                    >
                        <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={deleteNode}
                        title="Remove image"
                        className="p-1 rounded-md bg-surface/60 text-muted border border-border hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            )}

            {/* Image Container with 1:1 visitor styling */}
            <div className="relative w-full">
                {/* data-drag-handle enables ProseMirror NodeSelection move on drag instead of duplicating */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    ref={imgRef}
                    data-drag-handle
                    draggable={true}
                    src={node.attrs.src}
                    alt={node.attrs.alt || ''}
                    className={`block w-full h-auto rounded-xl border bg-surface transition-shadow cursor-grab active:cursor-grabbing ${
                        selected
                            ? 'border-foreground ring-2 ring-foreground/20'
                            : 'border-border hover:border-foreground/40'
                    }`}
                />

                {/* Live width pill while resizing */}
                {resizingWidth !== null && (
                    <div className="absolute bottom-2 right-2 bg-foreground text-background font-mono text-[10px] px-2 py-0.5 rounded-md shadow">
                        {resizingWidth}px
                    </div>
                )}

                {/* 4 Corner Resize Handles when selected */}
                {selected && (
                    <>
                        <div
                            onMouseDown={(e) => startResize(e, 'nw')}
                            className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-foreground border-2 border-background cursor-nwse-resize z-20 shadow"
                        />
                        <div
                            onMouseDown={(e) => startResize(e, 'ne')}
                            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-foreground border-2 border-background cursor-nesw-resize z-20 shadow"
                        />
                        <div
                            onMouseDown={(e) => startResize(e, 'sw')}
                            className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-foreground border-2 border-background cursor-nesw-resize z-20 shadow"
                        />
                        <div
                            onMouseDown={(e) => startResize(e, 'se')}
                            className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-foreground border-2 border-background cursor-nwse-resize z-20 shadow"
                        />
                    </>
                )}
            </div>

            {/* 1:1 Attached Caption below the image */}
            {(selected || captionText.trim().length > 0) && (
                <div
                    contentEditable={false}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="mt-2 w-full"
                >
                    <input
                        ref={captionInputRef}
                        type="text"
                        value={captionText}
                        onChange={(e) => updateAttributes({ caption: e.target.value })}
                        onKeyDown={(e) => {
                            e.stopPropagation()
                            if (e.key === 'Enter' || e.key === 'Escape') {
                                e.currentTarget.blur()
                            }
                        }}
                        placeholder={selected ? 'Add a caption below image...' : ''}
                        className="w-full text-center text-xs text-muted italic leading-relaxed bg-transparent border border-transparent focus:border-border focus:bg-surface/50 focus:text-foreground focus:not-italic rounded-md px-2 py-1 focus:outline-none transition-colors"
                    />
                </div>
            )}
        </NodeViewWrapper>
    )
}

const CustomResizableImage = Image.extend({
    name: 'imageResize',
    inline: false,
    group: 'block',
    draggable: true,

    parseHTML() {
        return [
            {
                tag: 'figure',
                getAttrs: (node) => {
                    if (!(node instanceof HTMLElement)) return false
                    return node.querySelector('img') ? {} : false
                },
            },
            {
                tag: 'img[src]:not(figure img)',
            },
        ]
    },

    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: (element) => {
                    const img =
                        element.tagName === 'FIGURE' ? element.querySelector('img') : element
                    return img?.getAttribute('src') || null
                },
            },
            alt: {
                default: null,
                parseHTML: (element) => {
                    const img =
                        element.tagName === 'FIGURE' ? element.querySelector('img') : element
                    return img?.getAttribute('alt') || null
                },
            },
            title: {
                default: null,
                parseHTML: (element) => {
                    const img =
                        element.tagName === 'FIGURE' ? element.querySelector('img') : element
                    return img?.getAttribute('title') || null
                },
            },
            width: {
                default: null,
                parseHTML: (element) => {
                    const direct = parseExistingWidth(element)
                    if (direct) return direct
                    if (element.tagName === 'FIGURE') {
                        const img = element.querySelector('img')
                        if (img) return parseExistingWidth(img)
                    }
                    return null
                },
            },
            class: {
                default: 'img-block-center',
                parseHTML: (element) => {
                    if (element.tagName === 'FIGURE') {
                        const img = element.querySelector('img')
                        return parseExistingLayout(element, img)
                    }
                    return parseExistingLayout(element)
                },
            },
            caption: {
                default: '',
                parseHTML: (element) => {
                    if (element.tagName === 'FIGURE') {
                        return element.querySelector('figcaption')?.textContent || ''
                    }
                    return element.getAttribute('data-caption') || ''
                },
            },
        }
    },

    renderHTML({ HTMLAttributes }) {
        const layoutClass = HTMLAttributes.class || 'img-block-center'
        const widthVal = HTMLAttributes.width
        const captionText =
            typeof HTMLAttributes.caption === 'string' ? HTMLAttributes.caption.trim() : ''

        if (captionText) {
            const figureAttrs: Record<string, string> = {
                class: layoutClass,
            }
            if (widthVal) {
                figureAttrs.style = `width: ${widthVal}px;`
            }

            const imgAttrs: Record<string, string> = {
                src: HTMLAttributes.src,
            }
            if (HTMLAttributes.alt) {
                imgAttrs.alt = HTMLAttributes.alt
            }
            if (widthVal) {
                imgAttrs.width = String(widthVal)
            }

            return [
                'figure',
                figureAttrs,
                ['img', imgAttrs],
                ['figcaption', { class: 'img-caption' }, captionText],
            ]
        }

        const attrs: Record<string, string> = {
            src: HTMLAttributes.src,
            class: layoutClass,
        }

        if (HTMLAttributes.alt) {
            attrs.alt = HTMLAttributes.alt
        }
        if (widthVal) {
            attrs.width = String(widthVal)
            attrs.style = `width: ${widthVal}px;`
        }

        return ['img', attrs]
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageNodeView, {
            attrs: ({ node }) => ({
                'data-layout': node.attrs.class || 'img-block-center',
            }),
        })
    },
})

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
            CustomResizableImage,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
                defaultAlignment: 'left',
            }),
            Placeholder.configure({ placeholder: 'Start writing your story...' }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        immediatelyRender: false,
    })

    if (!editor) {
        return (
            <div className="border border-border rounded-xl bg-background min-h-[420px] p-4 text-muted text-sm font-mono">
                Loading editor...
            </div>
        )
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('Enter URL:', previousUrl)
        if (url === null) return
        if (url.trim() === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        const safeUrl = sanitizeUrl(url, true)
        if (!safeUrl) {
            alert('Invalid URL. Please enter a valid http://, https://, or mailto: URL.')
            return
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: safeUrl }).run()
    }

    const uploadEditorImage = async (file: File) => {
        const validation = validateImageFile(file)
        if (!validation.valid) {
            alert(validation.error)
            return null
        }

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const path = `posts/${generateSafeStorageFilename(file.name)}`

        const { error } = await supabase.storage
            .from('images')
            .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })

        if (error) {
            console.error('Image upload failed', error)
            alert('Image upload failed.')
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
            editor
                .chain()
                .focus()
                .insertContent({
                    type: 'imageResize',
                    attrs: {
                        src: url,
                        class: 'img-block-center',
                        caption: '',
                    },
                })
                .run()
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const editSelectedImageCaption = () => {
        if (!editor.isActive('imageResize')) {
            alert('Click on an image first to add or edit its caption.')
            return
        }
        const currentAttrs = editor.getAttributes('imageResize')
        const nextCaption = window.prompt(
            'Enter caption for selected image (leave blank to remove):',
            currentAttrs.caption || ''
        )
        if (nextCaption === null) return
        editor
            .chain()
            .focus()
            .updateAttributes('imageResize', { caption: nextCaption.trim() })
            .run()
    }

    const setImageLayoutFromToolbar = (newLayout: ImageLayout) => {
        const currentAttrs = editor.getAttributes('imageResize')
        const isWrap = newLayout === 'float-left-img' || newLayout === 'float-right-img'
        if (isWrap && (!currentAttrs.width || currentAttrs.width > 460)) {
            editor
                .chain()
                .focus()
                .updateAttributes('imageResize', { class: newLayout, width: 280 })
                .run()
        } else {
            editor
                .chain()
                .focus()
                .updateAttributes('imageResize', { class: newLayout })
                .run()
        }
    }

    const ToolbarButton = ({
        onClick,
        isActive,
        children,
        title,
    }: {
        onClick: () => void
        isActive?: boolean
        children: React.ReactNode
        title?: string
    }) => (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`h-[28px] px-2.5 text-xs border rounded-md font-medium transition-colors flex items-center justify-center ${
                isActive
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-secondary border-border hover:bg-surface hover:text-foreground'
            }`}
        >
            {children}
        </button>
    )

    const isImageSelected = editor.isActive('imageResize')

    return (
        <div className="border border-border rounded-xl bg-background">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 border-b border-border bg-surface/60 rounded-t-xl sticky top-0 z-20">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>Bold</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>Italic</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}>Underline</ToolbarButton>
                <span className="w-px h-4 bg-border mx-1"></span>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}>H2</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}>H3</ToolbarButton>
                <span className="w-px h-4 bg-border mx-1"></span>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>Bullet List</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>Ordered List</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>Blockquote</ToolbarButton>
                <span className="w-px h-4 bg-border mx-1"></span>
                <ToolbarButton onClick={setLink} isActive={editor.isActive('link')}>Link</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</ToolbarButton>
                <span className="w-px h-4 bg-border mx-1"></span>
                <ToolbarButton onClick={() => fileInputRef.current?.click()}>+ Image</ToolbarButton>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    ref={fileInputRef}
                    onChange={addImage}
                    className="hidden"
                />
                <ToolbarButton
                    onClick={editSelectedImageCaption}
                    isActive={isImageSelected && Boolean(editor.getAttributes('imageResize').caption)}
                    title="Add or edit caption on the selected image"
                >
                    Caption
                </ToolbarButton>

                {isImageSelected && (
                    <>
                        <span className="w-px h-4 bg-border mx-1"></span>
                        <ToolbarButton
                            onClick={() => setImageLayoutFromToolbar('img-block-left')}
                            isActive={editor.isActive('imageResize', { class: 'img-block-left' })}
                            title="Put image on its own line (aligned left)"
                        >
                            Line: Left
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => setImageLayoutFromToolbar('img-block-center')}
                            isActive={editor.isActive('imageResize', { class: 'img-block-center' })}
                            title="Put image on its own line (centered)"
                        >
                            Line: Center
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => setImageLayoutFromToolbar('img-block-right')}
                            isActive={editor.isActive('imageResize', { class: 'img-block-right' })}
                            title="Put image on its own line (aligned right)"
                        >
                            Line: Right
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => setImageLayoutFromToolbar('float-left-img')}
                            isActive={editor.isActive('imageResize', { class: 'float-left-img' })}
                            title="Place image on the left side of the paragraph (text wraps on right)"
                        >
                            Beside Text: Left
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => setImageLayoutFromToolbar('float-right-img')}
                            isActive={editor.isActive('imageResize', { class: 'float-right-img' })}
                            title="Place image on the right side of the paragraph (text wraps on left)"
                        >
                            Beside Text: Right
                        </ToolbarButton>
                    </>
                )}

                <span className="w-px h-4 bg-border mx-1"></span>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}><AlignLeft className="w-3.5 h-3.5" /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}><AlignCenter className="w-3.5 h-3.5" /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })}><AlignRight className="w-3.5 h-3.5" /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })}><AlignJustify className="w-3.5 h-3.5" /></ToolbarButton>
                <span className="w-px h-4 bg-border mx-1"></span>
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>Undo</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>Redo</ToolbarButton>
            </div>

            {/* True 1:1 Canvas: exact 632px width (matching 680px Container minus 48px padding) */}
            <div
                className="py-12 px-4 sm:px-6 min-h-[460px] cursor-text bg-background rounded-b-xl"
                onClick={() => editor.chain().focus().run()}
            >
                <div className="w-full max-w-[632px] mx-auto">
                    <EditorContent
                        editor={editor}
                        className="w-full min-h-[420px] [&_.ProseMirror]:min-h-[420px] [&_.ProseMirror]:outline-none"
                    />
                </div>
            </div>
        </div>
    )
}
