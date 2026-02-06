import { Board } from '@/lib/supabase/models'
import { Button, Checkbox, Form, Input, InputRef, Modal } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut'
import ShortcutIndicator from '@/app/components/ui/ShortcutIndicator'

export default function BoardEditionModal({
  isOpen,
  onClose,
  board,
  onSubmit
}: {
  isOpen: boolean
  board: Board | null
  onClose: () => void
  onSubmit: (title: string, createDefaultColumns: boolean) => void
}) {
  const [form] = Form.useForm()
  const [title, setTitle] = useState('')
  const [createDefaultColumns, setCreateDefaultColumns] = useState(true)
  const titleInputRef = useRef<InputRef>(null)
  const isEditMode = !!board

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)

      if (board) {
        setTitle(board.title)
        form.setFieldsValue({ title: board.title })
      } else {
        setTitle('')
        setCreateDefaultColumns(true)
        form.resetFields()
        form.setFieldsValue({ createDefaultColumns: true })
      }
    } else {
      setTitle('')
      setCreateDefaultColumns(true)
      form.resetFields()
    }
  }, [isOpen, board, form])

  const handleSubmit = () => {
    form.validateFields().then(() => {
      if (title.trim()) {
        onSubmit(title, createDefaultColumns)
      }
    })
  }

  useKeyboardShortcut(handleSubmit, {
    key: 'Enter',
    modifiers: { cmdOrCtrl: true },
    enabled: isOpen,
    preventDefault: true
  })

  return (
    <Modal
      title={isEditMode ? 'Edit Board Title' : 'Create New Board'}
      open={isOpen}
      onOk={handleSubmit}
      okText={isEditMode ? 'Save' : 'Create'}
      onCancel={onClose}
      forceRender
      centered
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          <ShortcutIndicator>⏎</ShortcutIndicator>
          <span>{isEditMode ? 'Save' : 'Create'}</span>
        </Button>
      ]}
    >
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item
          hasFeedback
          label="Board title"
          name="title"
          validateFirst
          rules={[{ whitespace: true, required: true }]}
        >
          <Input ref={titleInputRef} type="text" onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>

        {!isEditMode && (
          <Form.Item name="createDefaultColumns" valuePropName="checked">
            <Checkbox checked={createDefaultColumns} onChange={(e) => setCreateDefaultColumns(e.target.checked)}>
              Create default columns (To-Do, In Progress, Review, Done)
            </Checkbox>
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}
