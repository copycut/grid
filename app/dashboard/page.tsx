'use client'
import { useEffect, useState, startTransition } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useBoards } from '@/lib/hooks/useBoards'
import { useOptimisticBoards } from '@/lib/hooks/useOptimisticBoards'
import { useNotification } from '@/lib/utils/notifications'
import { Board } from '@/lib/supabase/models'
import NavBar from '@/app/components/NavBar'
import DashboardTopCards from '@/app/components/Dashboard/DashboardTopCards'
import DashboardFilters from '@/app/components/Dashboard/DashboardFilters'
import DashboardCreateBoard from '@/app/components/Dashboard/DashboardCreateBoard'
import DashboardGridItem from '@/app/components/Dashboard/DashboardGridItem'
import DashboardListItem from '@/app/components/Dashboard/DashboardListItem'
import BoardDeleteModal from '@/app/components/Board/BoardDeleteModal'
import BoardEditionModal from '@/app/components/Board/BoardEditionModal'
import LoaderPlaceHolder from '@/app/components/ui/LoaderPlaceHolder'

export default function DashboardPage() {
  const { user } = useUser()
  const { loadBoards, createBoard, boards, loading, deleteBoard, updateBoard } = useBoards()
  const { optimisticBoards, updateOptimisticBoards } = useOptimisticBoards(boards)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isBoardDeletion, setIsBoardDeletion] = useState(false)
  const [boardIdToDelete, setBoardIdToDelete] = useState<number | null>(null)
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false)
  const [boardToEdit, setBoardToEdit] = useState<Board | null>(null)
  const { notifySuccess, notifyError } = useNotification()

  const filteredBoards = optimisticBoards
    .filter((board) => board.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // Sort by favorite first (true before false), then by creation date (newest first)
      if (a.is_favorite === b.is_favorite) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return a.is_favorite ? -1 : 1
    })

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

  const handleCreateBoard = () => {
    // Open modal for creating a new board
    setBoardToEdit(null)
    setIsBoardModalOpen(true)
  }

  const handleEditBoardModal = (boardId: number) => {
    setBoardToEdit(boards.find((board) => board.id === boardId) || null)
    setIsBoardModalOpen(true)
  }

  const handleBoardSubmit = async (title: string, createDefaultColumns: boolean) => {
    if (!title.trim()) return

    if (boardToEdit) {
      // Update existing board

      if (boardToEdit.title === title.trim()) {
        setIsBoardModalOpen(false)
        setBoardToEdit(null)
        return
      }

      try {
        await updateBoard(boardToEdit.id, { title: title.trim() })
        notifySuccess('Board updated successfully')
      } catch (error) {
        notifyError('Failed to update board', 'Please try again', error)
      } finally {
        setIsBoardModalOpen(false)
        setBoardToEdit(null)
      }
    } else {
      // Create new board
      const tempId = Date.now()
      const optimisticBoard = {
        id: tempId,
        title: title.trim(),
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_favorite: false
      }

      startTransition(() => {
        updateOptimisticBoards({ type: 'create', board: optimisticBoard })
      })

      try {
        await createBoard({ title: title.trim(), createDefaultColumns })
        notifySuccess('Board created successfully')
      } catch (error) {
        notifyError('Failed to create board', 'Please try again', error)
      } finally {
        setIsBoardModalOpen(false)
      }
    }
  }

  const handleToggleFavorite = async (boardId: number) => {
    try {
      const board = boards.find((board) => board.id === boardId)
      if (!board) return
      await updateBoard(boardId, { is_favorite: !board.is_favorite })
    } catch (error) {
      notifyError('Failed to toggle favorite', 'Please try again', error)
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="px-4 py-6 sm:py-8">
        <div className="pb-6 sm:pb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-300 pb-2 m-0">
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
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
          />

          {filteredBoards.length < 1 && (
            <div className="text-center text-gray-500">
              {searchQuery ? 'No boards match your search' : 'No Boards Found'}
            </div>
          )}

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
              {loading && <LoaderPlaceHolder height={150} />}

              {filteredBoards.map((board) => (
                <DashboardGridItem
                  key={board.id}
                  board={board}
                  onToggleFavorite={handleToggleFavorite}
                  onEditBoard={handleEditBoardModal}
                  onDeleteBoard={handleBoardToDeleteModal}
                />
              ))}
              <DashboardCreateBoard isGrid={true} handleCreateBoard={handleCreateBoard} />
            </div>
          ) : (
            <div className="flex flex-col space-y-2 w-full">
              {loading && <LoaderPlaceHolder height={70} />}

              {filteredBoards.map((board) => (
                <DashboardListItem key={board.id} board={board} onToggleFavorite={handleToggleFavorite} />
              ))}
              <DashboardCreateBoard isGrid={false} handleCreateBoard={handleCreateBoard} />
            </div>
          )}
        </div>
      </main>

      <BoardEditionModal
        isOpen={isBoardModalOpen}
        board={boardToEdit}
        onClose={() => {
          setIsBoardModalOpen(false)
          setBoardToEdit(null)
        }}
        onSubmit={handleBoardSubmit}
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
