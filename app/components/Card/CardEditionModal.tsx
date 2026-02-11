import { Button, Form, Input, InputRef, Modal, Popconfirm, Select } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import { NewCard } from '@/types/types'
import { Card as CardType, Column as ColumnType } from '@/lib/supabase/models'
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut'
import { useEscapeKey } from '@/lib/hooks/useEscapeKey'
import ShortcutIndicator from '@/app/components/ui/ShortcutIndicator'
import MarkdownEditor from '@/app/components/ui/MarkdownEditor'

export default function CardEditionModal({
  loading,
  isOpen,
  columnTargetId,
  columns,
  card,
  filterOptions,
  onClose,
  onEdit,
  onSave,
  onDelete
}: {
  loading: boolean
  isOpen: boolean
  columnTargetId: number | null | undefined
  columns: ColumnType[]
  card: NewCard | CardType | null
  filterOptions: { priority: { value: string; label: string }[] }
  onClose: () => void
  onEdit: (editedCard: CardType, columnId: number) => void
  onSave: (editedCard: NewCard, columnId: number) => void
  onDelete: (cardId: number) => void
}) {
  const [createCardForm] = Form.useForm()
  const titleInputRef = useRef<InputRef>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const cardData = {
    ...card,
    title: card?.title || '',
    description: card?.description || '',
    priority: card?.priority || 'default',
    column_id: columnTargetId || columns[0]?.id || 0
  }

  const [isEditingDescription, setIsEditingDescription] = useState(false)

  useEffect(() => {
    if (isOpen) {
      createCardForm.setFieldsValue({
        column_id: cardData.column_id,
        title: cardData.title,
        description: cardData.description,
        priority: cardData.priority
      })
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    } else {
      createCardForm.resetFields()
    }
  }, [isOpen, cardData.column_id, cardData.title, cardData.description, cardData.priority, createCardForm])

  const handleSave = () => {
    createCardForm.validateFields().then((values) => {
      const cardToSave = {
        ...card,
        ...values
      }

      if (!values.title.trim()) return

      const action = card ? onEdit : onSave
      action(cardToSave as CardType, values.column_id)
      setIsEditingDescription(false)
    })
  }

  const handleClose = () => {
    setIsEditingDescription(false)
    onClose()
  }

  useEscapeKey(handleClose, isOpen, !isDropdownOpen)

  useKeyboardShortcut(handleSave, {
    key: 'Enter',
    modifiers: { cmdOrCtrl: true },
    enabled: isOpen,
    preventDefault: true
  })

  return (
    <Modal
      title={card ? 'Edit Card' : 'New Card'}
      open={isOpen}
      forceRender
      centered
      okText={card ? 'Save' : 'Add'}
      onOk={handleSave}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSave}>
          <ShortcutIndicator>⏎</ShortcutIndicator>
          <span>{card ? 'Save' : 'Add'}</span>
        </Button>
      ]}
      styles={{
        body: {
          maxHeight: 'calc(100vh - 150px)',
          overflowY: 'auto'
        }
      }}
    >
      <Form form={createCardForm} layout="vertical">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Column" name="column_id" rules={[{ required: true, message: 'Please select a column' }]}>
            <Select
              options={columns.map((column) => ({ value: column.id, label: column.title }))}
              onOpenChange={(open) => setIsDropdownOpen(open)}
            />
          </Form.Item>
          <Form.Item label="Priority" name="priority">
            <Select options={filterOptions.priority} onOpenChange={(open) => setIsDropdownOpen(open)} />
          </Form.Item>
        </div>

        <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter a title' }]}>
          <Input ref={titleInputRef} type="text" placeholder="Enter card title" />
        </Form.Item>

        <Form.Item
          label={
            <div className="flex items-center justify-between w-200 max-w-full -mr-20">
              <span>Description</span>
              {cardData.description && (
                <Button
                  type="text"
                  size="small"
                  icon={isEditingDescription ? <EyeOutlined /> : <EditOutlined />}
                  onClick={() => setIsEditingDescription(!isEditingDescription)}
                >
                  {isEditingDescription ? 'Preview' : 'Edit'}
                </Button>
              )}
            </div>
          }
          name="description"
        >
          <MarkdownEditor
            placeholder="Enter card description"
            maxLength={255}
            value={cardData.description}
            isEditing={isEditingDescription}
            setIsEditing={setIsEditingDescription}
            onChange={(value) => createCardForm.setFieldsValue({ description: value })}
          />
        </Form.Item>
      </Form>

      <div className="flex items-center justify-between space-x-2 text-gray-500 pb-2">
        {card && 'created_at' in card && 'updated_at' in card && (
          <p className="flex items-center justify-between space-x-2">
            <span>
              <span className="font-semibold">Created at </span>
              {new Date(card.created_at).toLocaleDateString()}
            </span>
            <span>
              <span className="font-semibold">Updated at </span>
              {new Date(card.updated_at).toLocaleDateString()}
            </span>
          </p>
        )}
        {card && 'id' in card && (
          <p className="flex items-center justify-between">
            <Popconfirm
              title="Delete the card"
              description="Are you sure to delete this card? This action is irreversible."
              onConfirm={() => onDelete(card.id)}
              okText="Yes"
              cancelText="No"
              icon={<DeleteOutlined />}
            >
              <Button type="text" danger>
                <DeleteOutlined />
                Delete Card
              </Button>
            </Popconfirm>
          </p>
        )}
      </div>
    </Modal>
  )
}
