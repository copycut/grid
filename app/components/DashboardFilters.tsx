import { BorderHorizontalOutlined, BorderVerticleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'
import { Board } from '@/lib/supabase/models'

export default function DashboardFilters({
  viewMode,
  setViewMode,
  handleCreateBoard,
  loading
}: {
  viewMode: 'grid' | 'list'
  setViewMode: (viewMode: 'grid' | 'list') => void
  handleCreateBoard: () => void
  loading: boolean
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col space-y-2 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-300 m-0" data-heading-tag="H2">
          Your Boards
        </h2>
        <p className="text-gray-600 dark:text-gray-500">Manage your projects and tasks with ease</p>
      </div>

      <div className="flex items-center space-x-2 pb-4">
        <div>
          <Input
            name="search"
            className="flex"
            prefix={<SearchOutlined className="text-neutral-400! dark:text-neutral-600!" />}
            placeholder="Search boards..."
          />
        </div>

        <div className="hidden sm:flex items-center p-1 rounded-xl border border-gray-300 dark:border-gray-700">
          <Button
            variant={viewMode === 'grid' ? 'solid' : 'filled'}
            color="primary"
            size="small"
            onClick={() => setViewMode('grid')}
          >
            <BorderHorizontalOutlined />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'solid' : 'filled'}
            color="primary"
            size="small"
            onClick={() => setViewMode('list')}
          >
            <BorderVerticleOutlined />
          </Button>
        </div>
        <Button loading={loading} type="primary" onClick={handleCreateBoard}>
          <PlusOutlined />
          Create Board
        </Button>
      </div>
    </div>
  )
}
