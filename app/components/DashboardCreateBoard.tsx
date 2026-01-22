import { PlusOutlined } from '@ant-design/icons'

export default function DashboardCreateBoard({
  isGrid,
  handleCreateBoard
}: {
  isGrid: boolean
  handleCreateBoard: () => void
}) {
  return (
    <button
      className={`flex flex-col items-center justify-center text-center border-2 rounded-2xl border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 group cursor-pointer transition-colors space-x-2 p-6 ${isGrid ? 'flex-col' : 'flex-row'}`}
      onClick={handleCreateBoard}
    >
      <PlusOutlined className="text-2xl text-gray-500! group-hover:text-primary-500!" />
      <p className="text-gray-600 group-hover:text-primary-500">Create Board</p>
    </button>
  )
}
