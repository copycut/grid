'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useBoards } from '@/lib/hooks/useBoards'
import NavBar from '@/app/components/NavBar'
import DashboardTopCards from '@/app/components/DashboardTopCards'
import DashboardFilters from '@/app/components/DashboardFilters'
import DashboardCreateBoard from '@/app/components/DashboardCreateBoard'
import DashboardGridItem from '@/app/components/DashboardGridItem'
import DashboardListItem from '@/app/components/DashboardListItem'
import BoardDeleteModal from '@/app/components/BoardDeleteModal'

export default function DashboardPage() {
  const { user } = useUser()
  const { loadBoards, createBoard, boards, loading, deleteBoard } = useBoards()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isBoardDeletion, setIsBoardDeletion] = useState(false)
  const [boardIdToDelete, setBoardIdToDelete] = useState<number | null>(null)

  useEffect(() => {
    loadBoards()
  }, [])

  const handleBoardToDelete = (boardID: number) => {
    setBoardIdToDelete(boardID)
    setIsBoardDeletion(true)
  }

  const handleDeleteBoard = async (boardId: number) => {
    await deleteBoard(boardId)
    setIsBoardDeletion(false)
    setBoardIdToDelete(null)
  }

  const handleCreateBoard = async () => {
    await createBoard({ title: 'New Board' })
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

        <DashboardTopCards boards={boards} />

        <div className="pb-6 sm:pb-8">
          <DashboardFilters
            viewMode={viewMode}
            setViewMode={setViewMode}
            handleCreateBoard={handleCreateBoard}
            loading={loading}
          />

          {boards.length < 1 && <div className="text-center text-gray-500">No Boards Found</div>}

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {boards.map((board) => (
                <DashboardGridItem key={board.id} board={board} onEditBoard={() => handleBoardToDelete(board.id)} />
              ))}
              <DashboardCreateBoard isGrid={true} handleCreateBoard={handleCreateBoard} />
            </div>
          ) : (
            <div className="flex flex-col space-y-2 w-full">
              {boards.map((board) => (
                <DashboardListItem key={board.id} board={board} />
              ))}
              <DashboardCreateBoard isGrid={false} handleCreateBoard={handleCreateBoard} />
            </div>
          )}
        </div>
      </main>

      <BoardDeleteModal
        isOpen={isBoardDeletion}
        boardId={boardIdToDelete}
        onClose={() => setIsBoardDeletion(false)}
        onSubmit={handleDeleteBoard}
      />
    </div>
  )
}
