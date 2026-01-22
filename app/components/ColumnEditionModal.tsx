import { Column } from '@/lib/supabase/models'
import { Form, Input, Modal } from 'antd'
import { useEffect, useState } from 'react'

export default function ColumnEditionModal({
  isOpen,
  onClose,
  onSubmit,
  column
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (column: Column) => void
  column: Column | null
}) {
  const [columnForm] = Form.useForm()
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (isOpen && column) {
      setTitle(column.title)
      columnForm.setFieldsValue({ title: column.title })
    } else if (!isOpen) {
      columnForm.resetFields()
      setTitle('')
    }
  }, [isOpen, column, columnForm])

  return (
    <Modal
      title="Edit Column"
      open={isOpen}
      onOk={() => column && onSubmit({ ...column, title })}
      okText="Save"
      onCancel={onClose}
    >
      <Form form={columnForm}>
        <Form.Item label="Column title" name="title" rules={[{ required: true, message: 'Please enter a title' }]}>
          <Input type="text" onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
