'use client'

import { useState, startTransition } from 'react'
import dynamic from 'next/dynamic'
import { useUser } from '@clerk/clerk-react'
import { useOptimisticBoards } from '@/lib/hooks/useOptimisticBoards'
import { useNotification } from '@/lib/utils/notifications'
import { Board, OptimisticBoard } from '@/lib/supabase/models'
import {
  createBoard as createBoardAction,
  updateBoard as updateBoardAction,
  deleteBoard as deleteBoardAction,
  archiveBoard as archiveBoardAction,
  unarchiveBoard as unarchiveBoardAction
} from '@/lib/actions/board.actions'
import NavBar from '@/app/components/NavBar'
import DashboardTopCards from '@/app/components/Dashboard/DashboardTopCards'
import DashboardFilters from '@/app/components/Dashboard/DashboardFilters'
import DashboardCreateBoard from '@/app/components/Dashboard/DashboardCreateBoard'
import DashboardGridItem from '@/app/components/Dashboard/DashboardGridItem'
import { Button } from 'antd'

const BoardDeleteModal = dynamic(() => import('@/app/components/Board/BoardDeleteModal'), { ssr: false })
const BoardEditionModal = dynamic(() => import('@/app/components/Board/BoardEditionModal'), { ssr: false })

export default function DashboardClient({ initialBoards }: { initialBoards: Board[] }) {
  const { user } = useUser()
  const [boards, setBoards] = useState(initialBoards)
  const { optimisticBoards, updateOptimisticBoards } = useOptimisticBoards(boards)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchivedBoards, setShowArchivedBoards] = useState(false)
  const [isBoardDeletion, setIsBoardDeletion] = useState(false)
  const [boardIdToDelete, setBoardIdToDelete] = useState<number | null>(null)
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false)
  const [boardToEdit, setBoardToEdit] = useState<Board | null>(null)
  const { notifySuccess, notifyError } = useNotification()

  const activeBoards = optimisticBoards.filter((board) => !board.is_archived)
  const archivedBoards = optimisticBoards.filter((board) => board.is_archived)

  const filteredBoards = activeBoards
    .filter((board) => board.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // Sort by favorite first (true before false), then by creation date (newest first)
      if (a.is_favorite === b.is_favorite) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return a.is_favorite ? -1 : 1
    })

  const sortedArchivedBoards = archivedBoards.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )

  const handleBoardToDeleteModal = (boardID: number) => {
    setBoardIdToDelete(boardID)
    setIsBoardDeletion(true)
  }

  const handleDeleteBoard = async (boardId: number) => {
    startTransition(() => {
      updateOptimisticBoards({ type: 'delete', boardId })
    })

    try {
      setIsBoardDeletion(false)
      await deleteBoardAction(boardId)
      setBoards((prev) => prev.filter((board) => board.id !== boardId))
      notifySuccess('Board deleted successfully')
    } catch (error) {
      notifyError('Failed to delete board', 'Please try again', error)
    } finally {
      setBoardIdToDelete(null)
    }
  }

  const handleCreateBoard = () => {
    setBoardToEdit(null)
    setIsBoardModalOpen(true)
  }

  const handleEditBoardModal = (boardId: number) => {
    setBoardToEdit(boards.find((board) => board.id === boardId) || null)
    setIsBoardModalOpen(true)
  }

  const handleBoardSubmit = async (title: string, backgroundColor: string, createDefaultColumns: boolean) => {
    if (!title.trim()) return

    if (boardToEdit) {
      // Update existing board

      if (boardToEdit.title === title.trim() && boardToEdit.background_color === backgroundColor) {
        setIsBoardModalOpen(false)
        setBoardToEdit(null)
        return
      }

      try {
        setIsBoardModalOpen(false)
        await updateBoardAction(boardToEdit.id, { title: title.trim(), background_color: backgroundColor })
        setBoards((prev) =>
          prev.map((board) => {
            if (board.id === boardToEdit.id) {
              return { ...board, title: title.trim(), background_color: backgroundColor }
            }
            return board
          })
        )
        notifySuccess('Board updated successfully')
      } catch (error) {
        notifyError('Failed to update board', 'Please try again', error)
      } finally {
        setBoardToEdit(null)
      }
    } else {
      // Create new board
      const tempId = -Date.now()
      const optimisticBoard: OptimisticBoard = {
        id: tempId,
        title: title.trim(),
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_favorite: false,
        background_color: backgroundColor,
        isOptimistic: true
      }

      startTransition(() => {
        updateOptimisticBoards({ type: 'create', board: optimisticBoard })
      })

      try {
        setIsBoardModalOpen(false)
        const createdBoard = await createBoardAction(title.trim(), backgroundColor, createDefaultColumns)
        setBoards((prev) => [...prev, createdBoard])
        notifySuccess('Board created successfully')
      } catch (error) {
        notifyError('Failed to create board', 'Please try again', error)
      }
    }
  }

  const handleArchiveBoard = async (boardId: number) => {
    const board = boards.find((board) => board.id === boardId)
    if (!board) return

    startTransition(() => {
      updateOptimisticBoards({
        type: 'update',
        boardId,
        updates: { is_archived: true }
      })
    })

    try {
      await archiveBoardAction(boardId)
      setBoards((prev) =>
        prev.map((b) => {
          if (b.id === boardId) {
            return { ...b, is_archived: true }
          }
          return b
        })
      )
      notifySuccess('Board archived successfully')
    } catch (error) {
      notifyError('Failed to archive board', 'Please try again', error)
    }
  }

  const handleUnarchiveBoard = async (boardId: number) => {
    const board = boards.find((board) => board.id === boardId)
    if (!board) return

    startTransition(() => {
      updateOptimisticBoards({
        type: 'update',
        boardId,
        updates: { is_archived: false }
      })
    })

    try {
      await unarchiveBoardAction(boardId)
      setBoards((prev) =>
        prev.map((prevBoard) => {
          if (prevBoard.id === boardId) {
            return { ...prevBoard, is_archived: false }
          }
          return prevBoard
        })
      )
      notifySuccess('Board is unarchive successfully')
    } catch (error) {
      notifyError('Failed to unarchive board', 'Please try again', error)
    }
  }

  const handleToggleFavorite = async (boardId: number) => {
    const board = boards.find((board) => board.id === boardId)
    if (!board) return

    startTransition(() => {
      updateOptimisticBoards({
        type: 'update',
        boardId,
        updates: { is_favorite: !board.is_favorite }
      })
    })

    try {
      await updateBoardAction(boardId, { is_favorite: !board.is_favorite })
      setBoards((prev) =>
        prev.map((board) => {
          if (board.id === boardId) {
            return { ...board, is_favorite: !board.is_favorite }
          }
          return board
        })
      )
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
          <p className="text-gray-600 dark:text-gray-400">Here what&rsquo;s happening in your Grid today</p>
        </div>

        <DashboardTopCards boards={optimisticBoards} />

        <div className="pb-6 sm:pb-8">
          <DashboardFilters handleCreateBoard={handleCreateBoard} searchQuery={searchQuery} onSearch={setSearchQuery} />

          {filteredBoards.length < 1 && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No boards match your search' : 'No Boards Found'}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {filteredBoards.map((board) => (
              <DashboardGridItem
                key={board.id}
                board={board}
                onToggleFavorite={handleToggleFavorite}
                onEditBoard={handleEditBoardModal}
                onArchiveBoard={handleArchiveBoard}
                onDeleteBoard={handleBoardToDeleteModal}
              />
            ))}
            <DashboardCreateBoard isGrid={true} handleCreateBoard={handleCreateBoard} />
          </div>

          {sortedArchivedBoards.length > 0 && (
            <>
              <div className="py-6 sm:py-8 flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-300 m-0">
                  Archived Boards ({sortedArchivedBoards.length})
                </h2>

                <Button type="text" onClick={() => setShowArchivedBoards(!showArchivedBoards)}>
                  {showArchivedBoards ? 'Hide' : 'Show'} Archived Boards
                </Button>
              </div>

              {showArchivedBoards && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                  {sortedArchivedBoards.map((board) => (
                    <DashboardGridItem
                      key={board.id}
                      board={board}
                      onToggleFavorite={handleToggleFavorite}
                      onEditBoard={handleEditBoardModal}
                      onArchiveBoard={handleUnarchiveBoard}
                      onDeleteBoard={handleBoardToDeleteModal}
                    />
                  ))}
                </div>
              )}
            </>
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
