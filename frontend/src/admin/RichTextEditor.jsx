import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eye,
  EyeOff,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Redo2,
  RemoveFormatting,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { RichContent } from '../components/RichContent';
import {
  htmlToList,
  listToHtml,
  normalizeRichHtml,
  sanitizeHtml,
} from '../lib/richText';

function ToolButton({ active = false, disabled = false, title, onClick, children }) {
  return (
    <button
      type="button"
      className={`rt-tool${active ? ' active' : ''}`}
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function RichTextField({ field, value, onChange }) {
  const id = useId();
  const isList = field.mode === 'list';
  const [showPreview, setShowPreview] = useState(false);

  const normalized = useMemo(
    () => (isList ? listToHtml(value) : normalizeRichHtml(value)),
    [isList, value]
  );

  const serialize = useCallback(
    (html) => (isList ? htmlToList(html) : sanitizeHtml(html)),
    [isList]
  );

  const onChangeRef = useRef(onChange);
  const serializeRef = useRef(serialize);
  // Tracks the last value this editor emitted so an echo of our own change is
  // never mistaken for an external reset (Cancel / Reset / record switch).
  const lastEmittedRef = useRef(normalized);
  useEffect(() => {
    onChangeRef.current = onChange;
    serializeRef.current = serialize;
  }, [onChange, serialize]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
          blockquote: false,
          code: false,
          codeBlock: false,
          horizontalRule: false,
          strike: false,
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          HTMLAttributes: {
            rel: 'noopener noreferrer nofollow',
            target: '_blank',
          },
        }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({
          placeholder:
            field.placeholder ||
            (isList
              ? 'Click the bullet button, then type one item per line…'
              : 'Start writing… use the toolbar to format your content.'),
        }),
      ],
      content: normalized || (isList ? '<ul><li><p></p></li></ul>' : ''),
      editorProps: {
        attributes: {
          id,
          class: 'rt-editor-content',
          'aria-label': field.label,
        },
      },
      onUpdate: ({ editor: instance }) => {
        const serialized = serializeRef.current(instance.getHTML());
        lastEmittedRef.current = isList ? listToHtml(serialized) : serialized;
        onChangeRef.current(serialized);
      },
    },
    [id, isList]
  );

  // Replace content only when the parent value differs from what this editor
  // last emitted. This handles Cancel / Reset / duplicate / draft restore,
  // including programmatic actions that leave the editor focused.
  useEffect(() => {
    if (!editor || normalized === lastEmittedRef.current) return;
    lastEmittedRef.current = normalized;
    editor.commands.setContent(
      normalized || (isList ? '<ul><li><p></p></li></ul>' : ''),
      false
    );
  }, [editor, isList, normalized]);

  // TipTap's list extension supports sink/lift via the standard keyboard API;
  // wire Tab and Shift+Tab so nested bullets feel like a document editor.
  useEffect(() => {
    if (!editor) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      if (!editor.isActive('bulletList') && !editor.isActive('orderedList')) return;
      event.preventDefault();
      if (event.shiftKey) editor.chain().focus().liftListItem('listItem').run();
      else editor.chain().focus().sinkListItem('listItem').run();
    };
    const dom = editor.view.dom;
    dom.addEventListener('keydown', onKeyDown, true);
    return () => dom.removeEventListener('keydown', onKeyDown, true);
  }, [editor]);

  const run = (command) => () => command(editor);
  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href || '';
    const answer = window.prompt('Link URL (https://example.com)', previous);
    if (answer === null) return;
    const trimmed = answer.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const href = /^(https?:\/\/|mailto:|\/)/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  return (
    <div className="af-field af-field-rich">
      <label className="af-label" htmlFor={id}>
        {field.label}
        {field.required && <span className="af-required" aria-label="required">*</span>}
        {field.hint && <span className="af-hint">{field.hint}</span>}
      </label>

      <div className="rt-editor-shell">
        <div className="rt-toolbar" role="toolbar" aria-label={`${field.label} formatting`}>
          <ToolButton title="Heading 1" active={editor?.isActive('heading', { level: 1 })} onClick={run((e) => e.chain().focus().toggleHeading({ level: 1 }).run())}>
            <Heading1 size={16} />
          </ToolButton>
          <ToolButton title="Heading 2" active={editor?.isActive('heading', { level: 2 })} onClick={run((e) => e.chain().focus().toggleHeading({ level: 2 }).run())}>
            <Heading2 size={16} />
          </ToolButton>
          <ToolButton title="Heading 3" active={editor?.isActive('heading', { level: 3 })} onClick={run((e) => e.chain().focus().toggleHeading({ level: 3 }).run())}>
            <Heading3 size={16} />
          </ToolButton>
          <ToolButton title="Paragraph" active={editor?.isActive('paragraph')} onClick={run((e) => e.chain().focus().setParagraph().run())}>
            <Pilcrow size={16} />
          </ToolButton>

          <span className="rt-divider" />

          <ToolButton title="Bold (Ctrl+B)" active={editor?.isActive('bold')} onClick={run((e) => e.chain().focus().toggleBold().run())}>
            <Bold size={16} />
          </ToolButton>
          <ToolButton title="Italic (Ctrl+I)" active={editor?.isActive('italic')} onClick={run((e) => e.chain().focus().toggleItalic().run())}>
            <Italic size={16} />
          </ToolButton>
          <ToolButton title="Underline (Ctrl+U)" active={editor?.isActive('underline')} onClick={run((e) => e.chain().focus().toggleUnderline().run())}>
            <UnderlineIcon size={16} />
          </ToolButton>

          <span className="rt-divider" />

          <ToolButton title="Bullet list" active={editor?.isActive('bulletList')} onClick={run((e) => e.chain().focus().toggleBulletList().run())}>
            <List size={16} />
          </ToolButton>
          <ToolButton title="Numbered list" active={editor?.isActive('orderedList')} onClick={run((e) => e.chain().focus().toggleOrderedList().run())}>
            <ListOrdered size={16} />
          </ToolButton>

          <span className="rt-divider" />

          <ToolButton title="Align left" active={editor?.isActive({ textAlign: 'left' })} onClick={run((e) => e.chain().focus().setTextAlign('left').run())}>
            <AlignLeft size={16} />
          </ToolButton>
          <ToolButton title="Align center" active={editor?.isActive({ textAlign: 'center' })} onClick={run((e) => e.chain().focus().setTextAlign('center').run())}>
            <AlignCenter size={16} />
          </ToolButton>
          <ToolButton title="Align right" active={editor?.isActive({ textAlign: 'right' })} onClick={run((e) => e.chain().focus().setTextAlign('right').run())}>
            <AlignRight size={16} />
          </ToolButton>

          <span className="rt-divider" />

          <ToolButton title="Add / edit link" active={editor?.isActive('link')} onClick={setLink}>
            <Link2 size={16} />
          </ToolButton>
          <ToolButton title="Undo (Ctrl+Z)" disabled={!editor?.can().chain().focus().undo().run()} onClick={run((e) => e.chain().focus().undo().run())}>
            <Undo2 size={16} />
          </ToolButton>
          <ToolButton title="Redo (Ctrl+Shift+Z)" disabled={!editor?.can().chain().focus().redo().run()} onClick={run((e) => e.chain().focus().redo().run())}>
            <Redo2 size={16} />
          </ToolButton>
          <ToolButton title="Clear formatting" onClick={run((e) => e.chain().focus().unsetAllMarks().clearNodes().run())}>
            <RemoveFormatting size={16} />
          </ToolButton>

          <span className="rt-divider" />

          <ToolButton
            title={showPreview ? 'Back to editing' : 'Live preview'}
            active={showPreview}
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
          </ToolButton>
        </div>

        {showPreview ? (
          <div className="rt-preview rich-content">
            {isList ? (
              <ul className="rt-preview-list">
                {htmlToList(normalized).map((item, index) => (
                  <li key={index}>
                    <RichContent html={item} inline />
                  </li>
                ))}
              </ul>
            ) : (
              <RichContent html={normalized} />
            )}
          </div>
        ) : (
          <EditorContent editor={editor} className="rt-editor" />
        )}
      </div>
    </div>
  );
}
