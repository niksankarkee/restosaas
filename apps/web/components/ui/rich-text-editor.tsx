'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link,
  Unlink,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter your content here...',
  className = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'k':
          e.preventDefault();
          const url = prompt('Enter URL:');
          if (url) execCommand('createLink', url);
          break;
      }
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const removeLink = () => {
    execCommand('unlink');
  };

  const insertList = () => {
    execCommand('insertUnorderedList');
  };

  const insertOrderedList = () => {
    execCommand('insertOrderedList');
  };

  const insertQuote = () => {
    execCommand('formatBlock', 'blockquote');
  };

  const insertHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };

  const alignText = (alignment: string) => {
    execCommand('justify' + alignment);
  };

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className='border-b border-gray-200 p-2 flex flex-wrap gap-1'>
        {/* Text formatting */}
        <div className='flex gap-1 border-r border-gray-200 pr-2 mr-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => execCommand('bold')}
            className='h-8 w-8 p-0'
            title='Bold (Ctrl+B)'
          >
            <Bold className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => execCommand('italic')}
            className='h-8 w-8 p-0'
            title='Italic (Ctrl+I)'
          >
            <Italic className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => execCommand('underline')}
            className='h-8 w-8 p-0'
            title='Underline (Ctrl+U)'
          >
            <Underline className='h-4 w-4' />
          </Button>
        </div>

        {/* Headings */}
        <div className='flex gap-1 border-r border-gray-200 pr-2 mr-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => insertHeading(1)}
            className='h-8 px-2 text-xs font-bold'
            title='Heading 1'
          >
            H1
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => insertHeading(2)}
            className='h-8 px-2 text-xs font-bold'
            title='Heading 2'
          >
            H2
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => insertHeading(3)}
            className='h-8 px-2 text-xs font-bold'
            title='Heading 3'
          >
            H3
          </Button>
        </div>

        {/* Lists */}
        <div className='flex gap-1 border-r border-gray-200 pr-2 mr-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={insertList}
            className='h-8 w-8 p-0'
            title='Bullet List'
          >
            <List className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={insertOrderedList}
            className='h-8 w-8 p-0'
            title='Numbered List'
          >
            <ListOrdered className='h-4 w-4' />
          </Button>
        </div>

        {/* Alignment */}
        <div className='flex gap-1 border-r border-gray-200 pr-2 mr-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => alignText('Left')}
            className='h-8 w-8 p-0'
            title='Align Left'
          >
            <AlignLeft className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => alignText('Center')}
            className='h-8 w-8 p-0'
            title='Align Center'
          >
            <AlignCenter className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => alignText('Right')}
            className='h-8 w-8 p-0'
            title='Align Right'
          >
            <AlignRight className='h-4 w-4' />
          </Button>
        </div>

        {/* Links */}
        <div className='flex gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={insertLink}
            className='h-8 w-8 p-0'
            title='Insert Link (Ctrl+K)'
          >
            <Link className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={removeLink}
            className='h-8 w-8 p-0'
            title='Remove Link'
          >
            <Unlink className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => execCommand('formatBlock', 'blockquote')}
            className='h-8 w-8 p-0'
            title='Quote'
          >
            <Quote className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`min-h-[200px] p-4 focus:outline-none ${
          isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        }`}
        style={{ minHeight: '200px' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
