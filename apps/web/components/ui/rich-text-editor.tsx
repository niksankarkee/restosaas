'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
    immediatelyRender: false, // Fix SSR hydration issues
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('border rounded-md', className)}>
      {/* Toolbar */}
      <div className='border-b p-2 flex flex-wrap gap-1'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          Bold
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          Italic
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-gray-200' : ''}
        >
          Underline
        </Button>
        <div className='w-px h-8 bg-gray-300 mx-1' />
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
          }
        >
          H1
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
          }
        >
          H2
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
          }
        >
          H3
        </Button>
        <div className='w-px h-8 bg-gray-300 mx-1' />
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          Bullet List
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        >
          Numbered List
        </Button>
        <div className='w-px h-8 bg-gray-300 mx-1' />
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={
            editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''
          }
        >
          Left
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={
            editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''
          }
        >
          Center
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={
            editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''
          }
        >
          Right
        </Button>
        <div className='w-px h-8 bg-gray-300 mx-1' />
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={editor.isActive('link') ? 'bg-gray-200' : ''}
        >
          Link
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
        >
          Unlink
        </Button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className='min-h-[200px] p-4'
        placeholder={placeholder}
      />
    </div>
  );
}
