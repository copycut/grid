import { Button, Form, Input, InputRef, Modal, Popconfirm, Select } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import { NewCard } from '@/types/types'
import { Card as CardType, Column as ColumnType } from '@/lib/supabase/models'
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut'
import ShortcutIndicator from '@/app/components/ui/ShortcutIndicator'

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
  const { TextArea } = Input
  const [editedCard, setNewCard] = useState<NewCard | CardType>({
    ...card,
    title: card?.title || '',
    description: card?.description || '',
    priority: card?.priority || 'default',
    column_id: columnTargetId || columns[0]?.id || 0
  })
  const titleInputRef = useRef<InputRef>(null)
  // Antd Select captures the Escape keydown event and doesn't trigger the onClose function
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const cardData = {
        ...card,
        title: card?.title || '',
        description: card?.description || '',
        priority: card?.priority || 'default',
        column_id: columnTargetId || columns[0]?.id
      }
      createCardForm.setFieldsValue({
        column_id: cardData.column_id,
        title: cardData.title,
        description: cardData.description,
        priority: cardData.priority
      })
      // Use setTimeout to ensure the modal is fully rendered before focusing
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    } else {
      createCardForm.resetFields()
    }
  }, [isOpen, card, columnTargetId, columns, createCardForm])

  const handleSave = () => {
    createCardForm.validateFields().then(() => {
      if (!editedCard.title.trim()) return

      const action = card ? onEdit : onSave
      action(editedCard as CardType, editedCard.column_id!)
    })
  }

  // Close the modal when pressing Escape and no dropdown is open
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDropdownOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, isDropdownOpen, onClose])

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
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
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
              value={editedCard.column_id}
              onChange={(value) => setNewCard({ ...editedCard, column_id: value })}
              onOpenChange={(open) => setIsDropdownOpen(open)}
            />
          </Form.Item>
          <Form.Item label="Priority" name="priority">
            <Select
              options={filterOptions.priority}
              value={editedCard.priority}
              onChange={(value) => setNewCard({ ...editedCard, priority: value })}
              onOpenChange={(open) => setIsDropdownOpen(open)}
            />
          </Form.Item>
        </div>

        <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter a title' }]}>
          <Input
            ref={titleInputRef}
            type="text"
            placeholder="Enter card title"
            value={editedCard?.title}
            onChange={(e) => setNewCard({ ...editedCard, title: e.target.value })}
          />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea
            rows={6}
            placeholder="Enter card description"
            value={editedCard?.description}
            onChange={(e) => setNewCard({ ...editedCard, description: e.target.value })}
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
