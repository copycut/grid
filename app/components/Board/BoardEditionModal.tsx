import { Board } from '@/lib/supabase/models'
import { useLayoutEffect, useRef, useState } from 'react'
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut'
import { useEscapeKey } from '@/lib/hooks/useEscapeKey'
import { useDeviceDetection } from '@/lib/hooks/useDeviceDetection'
import { Button, Checkbox, Form, Input, InputRef, Modal } from 'antd'
import ShortcutIndicator from '@/app/components/ui/ShortcutIndicator'
import BoardColorList from '@/app/components/Board/BoardColorList'

export default function BoardEditionModal({
  isOpen,
  onClose,
  board,
  onSubmit
}: {
  isOpen: boolean
  board: Board | null
  onClose: () => void
  onSubmit: (title: string, background_color: string, createDefaultColumns: boolean) => void
}) {
  const [form] = Form.useForm()
  const [backgroundColor, setBackgroundColor] = useState(board?.background_color || 'bg-indigo-500')
  const [createDefaultColumns, setCreateDefaultColumns] = useState(true)
  const titleInputRef = useRef<InputRef>(null)
  const isEditMode = !!board
  const { isMobile } = useDeviceDetection()

  useLayoutEffect(() => {
    if (isOpen) {
      setTimeout(() => titleInputRef.current?.focus(), 0)

      if (board) {
        form.setFieldsValue({ title: board.title, background_color: board.background_color })
      } else {
        form.resetFields()
        form.setFieldsValue({ createDefaultColumns: true })
      }
    }
  }, [isOpen, board, form])

  const handleSubmit = () => {
    form.validateFields().then(() => {
      const title = form.getFieldValue('title')
      const backgroundColor = form.getFieldValue('background_color')
      const createDefaultColumns = form.getFieldValue('createDefaultColumns')
      onSubmit(title, backgroundColor, createDefaultColumns)
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
        <Button key="submit" type="primary" onClick={handleSubmit}>
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
          <Input ref={titleInputRef} type="text" />
        </Form.Item>

        <Form.Item label="Board color" name="background_color">
          <BoardColorList value={backgroundColor} onChange={(color) => setBackgroundColor(color)} />
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
