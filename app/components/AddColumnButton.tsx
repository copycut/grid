import { PlusOutlined } from '@ant-design/icons'

export default function AddColumnButton({ onAddColumn }: { onAddColumn: () => void }) {
  return (
    <div className="grid grid-cols-1 w-full lg:shrink-0 lg:w-80 pt-1">
      <button
        className="h-33 w-full cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center text-gray-600 hover:text-primary-500 hover:border-primary-500 transition-colors"
        onClick={onAddColumn}
      >
        <PlusOutlined className="text-xl mr-2" />
        Add Column
      </button>
    </div>
  )
}
