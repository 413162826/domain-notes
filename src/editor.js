import { Editor, Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

const CustomShortcuts = Extension.create({
  name: 'customShortcuts',
  addKeyboardShortcuts() {
    return {
      'Mod-1': () => this.editor.chain().focus().toggleHeading({ level: 1 }).run(),
      'Mod-2': () => this.editor.chain().focus().toggleHeading({ level: 2 }).run(),
      'Mod-3': () => this.editor.chain().focus().toggleHeading({ level: 3 }).run(),
      'Mod-4': () => this.editor.chain().focus().toggleHeading({ level: 4 }).run(),
      'Mod-5': () => this.editor.chain().focus().toggleHeading({ level: 5 }).run(),
      'Mod-6': () => this.editor.chain().focus().toggleHeading({ level: 6 }).run(),
      'Mod-l': () => this.editor.chain().focus().toggleBulletList().run(),
      'Mod-Shift-l': () => this.editor.chain().focus().toggleOrderedList().run(),
      'Mod-Shift-t': () => this.editor.chain().focus().toggleTaskList().run(),
      'Mod-Shift-b': () => this.editor.chain().focus().toggleBlockquote().run(),
      'Mod-Shift-c': () => this.editor.chain().focus().toggleCodeBlock().run(),
      'Mod-k': () => {
        const previousUrl = this.editor.getAttributes('link').href || '';
        const url = window.prompt('链接 URL:', previousUrl);
        if (url === null) return true;
        if (url === '') {
          this.editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
          this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
        return true;
      },
      'Mod-Shift-h': () => this.editor.chain().focus().setHorizontalRule().run(),
    };
  },
});

function insertImageFromBlob(view, file, dropPos) {
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    const { state, dispatch } = view;
    const node = state.schema.nodes.image.create({ src: dataUrl });
    if (typeof dropPos === 'number') {
      dispatch(state.tr.insert(dropPos, node));
    } else {
      dispatch(state.tr.replaceSelectionWith(node));
    }
  };
  reader.readAsDataURL(file);
}

export function createEditor({ element, content, onUpdate, onImageClick, placeholder }) {
  const editor = new Editor({
    element,
    content: content || { type: 'doc', content: [{ type: 'paragraph' }] },
    autofocus: 'end',
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: 'note-image' },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: placeholder || '在此记笔记…' }),
      CustomShortcuts,
    ],
    editorProps: {
      handlePaste(view, event) {
        const items = event.clipboardData?.items || [];
        for (const item of items) {
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (!file) continue;
            event.preventDefault();
            insertImageFromBlob(view, file);
            return true;
          }
        }
        return false;
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files || [];
        for (const file of files) {
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
            insertImageFromBlob(view, file, coords?.pos);
            return true;
          }
        }
        return false;
      },
      handleClickOn(view, pos, node, nodePos, event) {
        // Image click → lightbox
        if (node.type.name === 'image' && event.target?.tagName === 'IMG') {
          onImageClick?.(node.attrs.src);
          return true;
        }
        // Link click → open in new tab
        if (event.target?.tagName === 'A' && (event.ctrlKey || event.metaKey)) {
          const href = event.target.getAttribute('href');
          if (href) window.open(href, '_blank');
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onUpdate?.(ed.getJSON());
    },
  });

  return editor;
}

export function countCharacters(doc) {
  let count = 0;
  const walk = (n) => {
    if (typeof n?.text === 'string') count += [...n.text].length;
    if (Array.isArray(n?.content)) n.content.forEach(walk);
  };
  walk(doc);
  return count;
}

// Insert the current page as a blockquote with title + link.
export function insertPageReference(editor, { title, url }) {
  if (!url) return;
  const display = title?.trim() || url;
  editor.chain().focus().insertContent([
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: display },
            { type: 'hardBreak' },
            {
              type: 'text',
              marks: [{ type: 'link', attrs: { href: url, target: '_blank' } }],
              text: url,
            },
          ],
        },
      ],
    },
    { type: 'paragraph' },
  ]).run();
}
