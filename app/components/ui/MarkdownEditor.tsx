'use client'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import './markdown-preview.css'

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  maxLength,
  isEditing,
  setIsEditing
}: {
  value: string
  onChange: (value?: string) => void
  placeholder: string
  maxLength: number
  isEditing: boolean
  setIsEditing: (value: boolean) => void
}) {
  if (!isEditing && value) {
    return (
      <div
        className="rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3"
        onClick={() => setIsEditing(true)}
      >
        <div className="markdown-preview-isolated">
          <MDEditor.Markdown source={value} rehypePlugins={[rehypeSanitize]} style={{ background: 'transparent' }} />
        </div>
      </div>
    )
  }

  return (
    <MDEditor
      className="border border-neutral-300 dark:border-neutral-700 rounded-xl"
      value={value}
      onChange={onChange}
      textareaProps={{
        placeholder,
        maxLength,
        style: {
          fontFamily: 'var(--font-geist-sans)'
        }
      }}
      preview="edit"
      previewOptions={{
        rehypePlugins: [rehypeSanitize]
      }}
      commandsFilter={(cmd) => (cmd && /(image|live|edit|preview)/.test(cmd.name!) ? false : cmd)}
    />
  )
}
