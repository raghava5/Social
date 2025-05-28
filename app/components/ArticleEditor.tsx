'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Node, mergeAttributes } from '@tiptap/core'
import { useEffect } from 'react'
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  LinkIcon,
  PhotoIcon,
  ArrowsPointingOutIcon,
  ListBulletIcon,
  QueueListIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline'

// Custom Parallax Slider Node
const ParallaxSlider = Node.create({
  name: 'parallaxSlider',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      slides: {
        default: [],
        parseHTML: element => JSON.parse(element.getAttribute('data-slides') || '[]'),
        renderHTML: attributes => ({
          'data-slides': JSON.stringify(attributes.slides)
        })
      }
    }
  },
  
  parseHTML() {
    return [{ tag: 'div[data-type="parallax-slider"]' }]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-type': 'parallax-slider',
      class: 'parallax-slider-node bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300 text-center'
    }), ['p', {}, `📸 Parallax Slider (${HTMLAttributes['data-slides'] ? JSON.parse(HTMLAttributes['data-slides']).length : 0} slides)`]]
  },
  
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.className = 'parallax-slider-node bg-blue-50 p-4 rounded-lg border-2 border-blue-200 text-center cursor-pointer hover:bg-blue-100 transition-colors'
      dom.setAttribute('data-type', 'parallax-slider')
      dom.setAttribute('data-slides', JSON.stringify(node.attrs.slides))
      
      const slideCount = node.attrs.slides?.length || 0
      dom.innerHTML = `
        <div class="flex items-center justify-center space-x-2">
          <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span class="text-blue-800 font-medium">Parallax Slider (${slideCount} slides)</span>
        </div>
        <p class="text-sm text-blue-600 mt-1">Click to edit slider</p>
      `
      
      return { dom }
    }
  }
})

interface ArticleEditorProps {
  content: string
  onChange: (content: string) => void
  onEditorReady: (editor: Editor) => void
  onSliderRequest: () => void
}

export default function ArticleEditor({ content, onChange, onEditorReady, onSliderRequest }: ArticleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your article... Use the toolbar to add formatting, images, or a parallax slider.',
      }),
      ParallaxSlider,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return (
      <div className="min-h-[200px] flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    )
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const insertParallaxSlider = () => {
    onSliderRequest()
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex border-r border-gray-300 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            title="Bold"
          >
            <BoldIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            title="Italic"
          >
            <ItalicIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
            title="Code"
          >
            <CodeBracketIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex border-r border-gray-300 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 text-sm font-medium ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 text-sm font-medium ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 text-sm font-medium ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        {/* Lists */}
        <div className="flex border-r border-gray-300 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
            title="Bullet List"
          >
            <ListBulletIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
            title="Numbered List"
          >
            <QueueListIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Media & Special Elements */}
        <div className="flex">
          <button
            onClick={addImage}
            className="p-2 rounded hover:bg-gray-200"
            title="Add Image"
          >
            <PhotoIcon className="h-4 w-4" />
          </button>
          <button
            onClick={addLink}
            className="p-2 rounded hover:bg-gray-200"
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <button
            onClick={insertParallaxSlider}
            className="p-2 rounded hover:bg-gray-200 text-blue-600"
            title="Add Parallax Slider"
          >
            <ArrowsPointingOutIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="prose prose-sm max-w-none p-4 min-h-[300px] focus-within:outline-none">
        <EditorContent 
          editor={editor} 
          className="outline-none focus:outline-none"
        />
      </div>

      {/* Footer with character count */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex justify-between items-center text-sm text-gray-500">
        <span>{editor.storage.characterCount?.characters() || 0} characters</span>
        <span>{editor.storage.characterCount?.words() || 0} words</span>
      </div>
    </div>
  )
} 