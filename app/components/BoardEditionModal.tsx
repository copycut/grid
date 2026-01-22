import { Board } from '@/lib/supabase/models'
import { Form, Input, Modal } from 'antd'
import { useEffect, useState } from 'react'

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
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (board) {
      setTitle(board.title)
    }
  }, [board])

  return (
    <Modal title="Edit Board Title" open={isOpen} onOk={() => onSubmit(title)} okText="Save" onCancel={onClose}>
      <Form initialValues={{ boardTitle: title }}>
        <Form.Item
          hasFeedback
          label="Board title"
          name="boardTitle"
          validateFirst
          rules={[{ whitespace: true, required: true }]}
        >
          <Input type="text" onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
