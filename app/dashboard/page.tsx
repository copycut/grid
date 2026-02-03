'use client'
import { useEffect, useState, startTransition } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useBoards } from '@/lib/hooks/useBoards'
import { useOptimisticBoards } from '@/lib/hooks/useOptimisticBoards'
import { useNotification } from '@/lib/utils/notifications'
import { Board } from '@/lib/supabase/models'
import NavBar from '@/app/components/NavBar'
import DashboardTopCards from '@/app/components/DashboardTopCards'
import DashboardFilters from '@/app/components/DashboardFilters'
import DashboardCreateBoard from '@/app/components/DashboardCreateBoard'
import DashboardGridItem from '@/app/components/DashboardGridItem'
import DashboardListItem from '@/app/components/DashboardListItem'
import BoardDeleteModal from '@/app/components/BoardDeleteModal'
import BoardEditionModal from '@/app/components/BoardEditionModal'

export default function DashboardPage() {
  const { user } = useUser()
  const { loadBoards, createBoard, boards, loading, deleteBoard, updateBoard } = useBoards()
  const { optimisticBoards, updateOptimisticBoards } = useOptimisticBoards(boards)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isBoardDeletion, setIsBoardDeletion] = useState(false)
  const [boardIdToDelete, setBoardIdToDelete] = useState<number | null>(null)
  const [isBoardEditing, setIsBoardEditing] = useState(false)
  const [boardToEdit, setBoardToEdit] = useState<Board | null>(null)
  const { notifySuccess, notifyError } = useNotification()

  useEffect(() => {
    loadBoards()
  }, [])

  const handleBoardToDeleteModal = (boardID: number) => {
    setBoardIdToDelete(boardID)
    setIsBoardDeletion(true)
  }

  const handleDeleteBoard = async (boardId: number) => {
    startTransition(() => {
      updateOptimisticBoards({ type: 'delete', boardId })
    })

    try {
      await deleteBoard(boardId)
      notifySuccess('Board deleted successfully')
    } catch (error) {
      notifyError('Failed to delete board', 'Please try again', error)
    } finally {
      setIsBoardDeletion(false)
      setBoardIdToDelete(null)
    }
  }

  const handleCreateBoard = async () => {
    const tempId = Date.now()
    const optimisticBoard = {
      id: tempId,
      title: 'New Board',
      user_id: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    startTransition(() => {
      updateOptimisticBoards({ type: 'create', board: optimisticBoard })
    })

    try {
      await createBoard({ title: 'New Board' })
      notifySuccess('Board created successfully')
    } catch (error) {
      notifyError('Failed to create board', 'Please try again', error)
    }
  }

  const handleEditBoardModal = (boardId: number) => {
    setBoardToEdit(boards.find((board) => board.id === boardId) || null)
    setIsBoardEditing(true)
  }

  const handleUpdateBoard = async (title: string) => {
    if (!boardToEdit || !title.trim()) return

    try {
      await updateBoard(boardToEdit.id, { title: title.trim() })
      notifySuccess('Board updated successfully')
    } catch (error) {
      notifyError('Failed to update board', 'Please try again', error)
    } finally {
      setIsBoardEditing(false)
      setBoardToEdit(null)
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="px-4 py-6 sm:py-8">
        <div className="pb-6 sm:pb-8">
          <h1
            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-300 pb-2 m-0"
            data-heading-tag="H1"
          >
            Welcome back, {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-500">Here what's happening in your Grid today</p>
        </div>

        <DashboardTopCards boards={optimisticBoards} />

        <div className="pb-6 sm:pb-8">
          <DashboardFilters
            viewMode={viewMode}
            setViewMode={setViewMode}
            handleCreateBoard={handleCreateBoard}
            loading={loading}
          />

          {optimisticBoards.length < 1 && <div className="text-center text-gray-500">No Boards Found</div>}

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {optimisticBoards.map((board) => (
                <DashboardGridItem
                  key={board.id}
                  board={board}
                  onEditBoard={() => handleEditBoardModal(board.id)}
                  onDeleteBoard={() => handleBoardToDeleteModal(board.id)}
                />
              ))}
              <DashboardCreateBoard isGrid={true} handleCreateBoard={handleCreateBoard} />
            </div>
          ) : (
            <div className="flex flex-col space-y-2 w-full">
              {optimisticBoards.map((board) => (
                <DashboardListItem key={board.id} board={board} />
              ))}
              <DashboardCreateBoard isGrid={false} handleCreateBoard={handleCreateBoard} />
            </div>
          )}
        </div>
      </main>

      <BoardEditionModal
        isOpen={isBoardEditing}
        board={boardToEdit}
        onClose={() => setIsBoardEditing(false)}
        onSubmit={(title: string) => handleUpdateBoard(title)}
      />

      <BoardDeleteModal
        isOpen={isBoardDeletion}
        boardId={boardIdToDelete}
        onClose={() => setIsBoardDeletion(false)}
        onSubmit={handleDeleteBoard}
      />
    </div>
  )
}
