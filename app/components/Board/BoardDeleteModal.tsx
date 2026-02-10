import { Button, Modal } from 'antd'
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut'
import { useEscapeKey } from '@/lib/hooks/useEscapeKey'
import ShortcutIndicator from '@/app/components/ui/ShortcutIndicator'

export default function BoardDeleteModal({
  loading,
  isOpen,
  onClose,
  boardId,
  onSubmit
}: {
  loading: boolean
  isOpen: boolean
  boardId: number | null
  onClose: () => void
  onSubmit: (boardId: number) => void
}) {
  useEscapeKey(onClose, isOpen)

  useKeyboardShortcut(() => boardId && onSubmit(boardId), {
    key: 'Enter',
    modifiers: { cmdOrCtrl: true },
    enabled: isOpen,
    preventDefault: true
  })

  return (
    <Modal
      title="Delete Board"
      open={isOpen}
      onOk={() => boardId && onSubmit(boardId)}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" danger loading={loading} onClick={() => boardId && onSubmit(boardId)}>
          <ShortcutIndicator color="red">⏎</ShortcutIndicator>
          Delete
        </Button>
      ]}
    >
      <p>Are you sure you want to delete this board? This action is irreversible.</p>
    </Modal>
  )
}
