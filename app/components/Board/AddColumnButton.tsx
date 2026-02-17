import { PlusOutlined } from '@ant-design/icons'

export default function AddColumnButton({ onAddColumn }: { onAddColumn: () => void }) {
  return (
    <div className="grid grid-cols-1 w-full lg:shrink-0 lg:w-80 pt-1">
      <button
        className="h-33 w-full cursor-pointer bg-white/50 dark:bg-black/50 border-2 border-dashed dark:border-white/50 border-black/50 rounded-2xl flex items-center justify-center text-black dark:text-white hover:text-primary-500 hover:border-primary-500 hover:bg-white/70 hover:dark:bg-black/70 transition-all"
        onClick={onAddColumn}
      >
        <PlusOutlined className="text-xl mr-2" />
        Add Column
      </button>
    </div>
  )
}
