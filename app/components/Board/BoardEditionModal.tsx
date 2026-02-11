import { Board } from '@/lib/supabase/models'
import { Button, Checkbox, Form, Input, InputRef, Modal } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut'
import { useEscapeKey } from '@/lib/hooks/useEscapeKey'
import { useDeviceDetection } from '@/lib/hooks/useDeviceDetection'
import ShortcutIndicator from '@/app/components/ui/ShortcutIndicator'

export default function BoardEditionModal({
  loading,
  isOpen,
  onClose,
  board,
  onSubmit
}: {
  loading: boolean
  isOpen: boolean
  board: Board | null
  onClose: () => void
  onSubmit: (title: string, createDefaultColumns: boolean) => void
}) {
  const [form] = Form.useForm()
  const [title, setTitle] = useState(board?.title || '')
  const [createDefaultColumns, setCreateDefaultColumns] = useState(true)
  const titleInputRef = useRef<InputRef>(null)
  const isEditMode = !!board
  const { isMobile } = useDeviceDetection()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)

      if (board) {
        form.setFieldsValue({ title: board.title })
      } else {
        form.resetFields()
        form.setFieldsValue({ createDefaultColumns: true })
      }
    }
  }, [isOpen, board, form])

  const handleSubmit = () => {
    form.validateFields().then(() => {
      if (!title.trim()) return
      onSubmit(title, createDefaultColumns)
    })
  }

  useEscapeKey(onClose, isOpen)

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
      centered={isMobile}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
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
