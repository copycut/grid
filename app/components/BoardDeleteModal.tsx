import { Board } from '@/lib/supabase/models'
import { Modal } from 'antd'

export default function BoardDeleteModal({
  isOpen,
  onClose,
  boardId,
  onSubmit
}: {
  isOpen: boolean
  boardId: number | null
  onClose: () => void
  onSubmit: (boardId: number) => void
}) {
  return (
    <Modal
      title="Delete Board"
      open={isOpen}
      onOk={() => boardId && onSubmit(boardId)}
      okText="Delete"
      onCancel={onClose}
      okType="danger"
    >
      <p>Are you sure you want to delete this board? This action is irreversible.</p>
    </Modal>
  )
}
