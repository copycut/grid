import { useEffect, useRef, useState } from 'react'
import { Column, ColumnWithCards } from '@/lib/supabase/models'
import { Button, Form, Input, Modal, Popconfirm } from 'antd'
import type { InputRef } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut'
import ShortcutIndicator from '@/app/components/ui/ShortcutIndicator'

export default function ColumnEditionModal({
  loading,
  isOpen,
  onClose,
  column,
  onSave,
  onEdit,
  onDeleteColumn
}: {
  loading: boolean
  isOpen: boolean
  onClose: () => void
  onSave: (title: string) => void
  onEdit: (column: ColumnWithCards) => void
  onDeleteColumn: (columnId: number) => void
  column: ColumnWithCards | Column | null
}) {
  const [columnForm] = Form.useForm()
  const [title, setTitle] = useState(column?.title || '')
  const titleInputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)

      if (column) {
        columnForm.setFieldsValue({ title: column.title })
      } else {
        columnForm.resetFields()
      }
    }
  }, [isOpen, column, columnForm])

  const handleSubmit = () => {
    columnForm.validateFields().then(() => {
      if (!title.trim()) return

      if (column) {
        onEdit({ ...column, title, cards: 'cards' in column ? column.cards : [] })
        return
      }

      onSave(title)
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
      title={column ? 'Edit Column' : 'New Column'}
      open={isOpen}
      onOk={handleSubmit}
      okText={column ? 'Save' : 'Add'}
      onCancel={onClose}
      forceRender
      centered
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          <ShortcutIndicator>⏎</ShortcutIndicator>
          <span>{column ? 'Save' : 'Add'}</span>
        </Button>
      ]}
    >
      <Form form={columnForm} onFinish={handleSubmit}>
        <Form.Item label="Column title" name="title" rules={[{ required: true, message: 'Please enter a title' }]}>
          <Input ref={titleInputRef} type="text" onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>
      </Form>

      {column && 'created_at' in column && (
        <p className="flex items-center justify-between space-x-2 text-sm text-gray-500 pb-2">
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
