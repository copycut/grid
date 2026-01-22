import { useEffect, useRef, useState } from 'react'
import { Column, ColumnWithCards } from '@/lib/supabase/models'
import { Button, Form, Input, Modal, Popconfirm } from 'antd'
import type { InputRef } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

export default function ColumnEditionModal({
  isOpen,
  onClose,
  column,
  onSave,
  onEdit,
  onDeleteColumn
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string) => void
  onEdit: (column: ColumnWithCards) => void
  onDeleteColumn: (columnId: number) => void
  column: ColumnWithCards | Column | null
}) {
  const [columnForm] = Form.useForm()
  const [title, setTitle] = useState('')
  const titleInputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (isOpen) {
      // Use setTimeout to ensure the modal is fully rendered before focusing
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    }

    if (isOpen && column) {
      setTitle(column.title)
      columnForm.setFieldsValue({ title: column.title })
    } else if (!isOpen) {
      setTitle('')
      columnForm.resetFields()
    }
  }, [isOpen, column, columnForm])

  return (
    <Modal
      title={column ? 'Edit Column' : 'New Column'}
      open={isOpen}
      onOk={() =>
        column ? onEdit({ ...column, title, cards: 'cards' in column ? column.cards : [] }) : onSave(title.trim())
      }
      okText={column ? 'Save' : 'Add'}
      onCancel={onClose}
      forceRender
    >
      <Form form={columnForm}>
        <Form.Item label="Column title" name="title" rules={[{ required: true, message: 'Please enter a title' }]}>
          <Input ref={titleInputRef} type="text" onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>
      </Form>

      {column && 'created_at' in column && (
        <p className="flex items-center justify-between space-x-2text-sm text-gray-500 pb-2">
          <span>Created at {new Date(column.created_at).toLocaleDateString()}</span>

          <Popconfirm
            title="Delete the column"
            description={
              <div className="max-w-60">
                Are you sure to delete this column? All cards inside the column will be deleted. This action is
                irreversible.
              </div>
            }
            onConfirm={() => onDeleteColumn(column.id)}
            okText="Yes"
            cancelText="No"
            icon={<DeleteOutlined />}
          >
            <Button type="text" danger>
              <DeleteOutlined />
              Delete Column
            </Button>
          </Popconfirm>
        </p>
      )}
    </Modal>
  )
}
