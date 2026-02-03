import { Board } from '@/lib/supabase/models'
import { Form, Input, InputRef, Modal } from 'antd'
import { useEffect, useRef, useState } from 'react'

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

  return (
    <Modal title="Edit Board Title" open={isOpen} onOk={handleSubmit} okText="Save" onCancel={onClose} forceRender>
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
