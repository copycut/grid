import { Form, Input, InputRef, Modal, Select } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { NewCard } from '@/types/types'
import { Card as CardType, Column as ColumnType } from '@/lib/supabase/models'

export default function CardEditionModal({
  isOpen,
  columnTargetId,
  columns,
  card,
  filterOptions,
  onClose,
  onEdit,
  onSave
}: {
  isOpen: boolean
  columnTargetId: number | null | undefined
  columns: ColumnType[]
  card: NewCard | CardType | null
  filterOptions: { priority: { value: string; label: string }[] }
  onClose: () => void
  onEdit: (editedCard: CardType, columnId: number) => void
  onSave: (editedCard: NewCard, columnId: number) => void
}) {
  const [createCardForm] = Form.useForm()
  const { TextArea } = Input
  const [editedCard, setNewCard] = useState<NewCard | CardType>({
    title: '',
    description: '',
    priority: 'default',
    column_id: 0
  })
  const titleInputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (isOpen) {
      const cardData = {
        ...card,
        title: card?.title || '',
        description: card?.description || '',
        priority: card?.priority || 'default',
        column_id: columnTargetId || columns[0]?.id
      }
      setNewCard(cardData)
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

  return (
    <Modal
      title={card ? 'Edit Card' : 'New Card'}
      open={isOpen}
      forceRender
      onOk={() =>
        card
          ? onEdit(editedCard as CardType, editedCard.column_id!)
          : onSave(editedCard as NewCard, editedCard.column_id!)
      }
      okText={card ? 'Save' : 'Add'}
      onCancel={onClose}
    >
      <Form form={createCardForm} layout="vertical">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Column" name="column_id" rules={[{ required: true, message: 'Please select a column' }]}>
            <Select
              options={columns.map((column) => ({ value: column.id, label: column.title }))}
              value={editedCard.column_id}
              onChange={(value) => setNewCard({ ...editedCard, column_id: value })}
            />
          </Form.Item>
          <Form.Item label="Priority" name="priority">
            <Select
              options={filterOptions.priority}
              value={editedCard.priority}
              onChange={(value) => setNewCard({ ...editedCard, priority: value })}
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

      {card && 'created_at' in card && 'updated_at' in card && (
        <p className="flex items-center justify-between space-x-2text-sm text-gray-500 pb-2">
          <span>Created at {new Date(card.created_at).toLocaleDateString()}</span>
          <span>Updated at {new Date(card.updated_at).toLocaleDateString()}</span>
        </p>
      )}
    </Modal>
  )
}
