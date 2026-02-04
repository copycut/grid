import { Board } from '@/lib/supabase/models'
import { Button, Form, Input, InputRef, Modal } from 'antd'
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
  onSubmit: (title: string) => void
}) {
  const [form] = Form.useForm()
  const [title, setTitle] = useState('')
  const titleInputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)

      if (board) {
        setTitle(board.title)
        form.setFieldsValue({ title: board.title })
      }
    } else {
      setTitle('')
      form.resetFields()
    }
  }, [isOpen, board, form])

  const handleSubmit = () => {
    form.validateFields().then(() => {
      if (title.trim()) {
        onSubmit(title)
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
      title="Edit Board Title"
      open={isOpen}
      onOk={handleSubmit}
      okText="Save"
      onCancel={onClose}
      forceRender
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          <ShortcutIndicator>⏎</ShortcutIndicator>
          <span>Save</span>
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
      </Form>
    </Modal>
  )
}
